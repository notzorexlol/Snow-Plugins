import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import Renderer from 'react-test-renderer';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { packs, normalizePath, colorValue, imageUrl, validateDimensions, originalSource, createEngine } from './src/core.js';
import factory from './src/plugin.js';
import { createRuntime } from '../src/runtime.js';
const asset = { name: 'SettingsIcon', type: 'png', httpServerLocation: '/assets/design/components/Icon/native/redesign/generated/images', width: 24, height: 24 };

function harness() {
    const store = structuredClone(factory.defaults), sheets = new Map(), hooks = new Map(), toasts = [];
    const Image = React.memo(React.forwardRef((props, ref) => React.createElement('NativeImage', { ...props, ref })));
    Image.getSize = (_uri, yes) => yes(96,96);
    const RN = { Image, View: 'View', Text: 'Text', ScrollView: 'ScrollView', TextInput: 'Input', Pressable: 'Button', Switch: 'Switch', Linking: { openURL() {} } };
    const B = {
        React, ReactNative: RN, assets: { findAsset: id => id === 1 ? asset : undefined },
        metro: { common: { components: { AlertModal: props => React.createElement('Alert', null, props.actions), AlertActions: 'Actions', AlertActionButton: 'AlertButton' } } },
        plugin: { createStorage: () => store, useProxy: value => { assert.equal(value, store); return value; }, flushStorage: async () => {} },
        ui: { showToast: message => toasts.push(message), openAlert: (key, element) => sheets.set(key, element), dismissAlert: key => sheets.delete(key) },
        api: { react: { jsx: { onJsxCreate: (name, fn) => { assert(!hooks.has(name)); hooks.set(name, fn); }, deleteJsxCreate: (name, fn) => { assert.equal(hooks.get(name), fn); hooks.delete(name); } } } },
    };
    const r = createRuntime(B, { id: 'mime.iconthemer', name: 'icon themer' }, factory.defaults);
    const plugin = factory(r);
    function SettingsIcon(props) { return React.createElement('VectorIcon', props); }
    const icon = props => { const element = React.createElement(SettingsIcon, props); return hooks.get('SettingsIcon')?.(SettingsIcon, element) ?? element; };
    return { r, B, RN, store, sheets, plugin, hooks, icon, toasts };
}

test('catalog has five merged families, unique canonical asset paths and pinned URLs', () => {
    assert.equal(packs.length, 5);
    assert.equal(new Set(packs.map(p => p.id)).size, 5);
    for (const pack of packs) {
        const paths = pack.groups.flatMap(group => { assert.match(group.base, /^https:\/\/raw\.githubusercontent\.com\/[^/]+\/discord-iconpacks\/[a-f0-9]{40}\//); return group.files.map(normalizePath); });
        assert.equal(paths.length, new Set(paths).size);
        assert.equal(paths.length, pack.count);
    }
});
test('validates colors, direct links, sizes and cyclic theme references', () => {
    for (const color of ['', '#abc', '#aabbcc', '#abcd', '#001122ff']) assert.equal(colorValue(color), color);
    for (const color of ['red', '#12', 'url(x)']) assert.throws(() => colorValue(color));
    assert.equal(imageUrl('https://example.com/a.png'), 'https://example.com/a.png');
    for (const url of ['http://example.com/a.png', 'https://u:p@example.com/a.png', 'https://github.com/a/b/blob/main/a.png', 'https://example.com/a.svg', 'javascript:alert(1)']) assert.throws(() => imageUrl(url));
    validateDimensions(96, 96);
    for (const dims of [[0,32], [4096,4096], [100,16]]) assert.throws(() => validateDimensions(...dims));
    const cycle = {}; cycle.original = cycle; assert.equal(originalSource(cycle), cycle);
    assert.equal(originalSource({ original: { original: 1 } }), 1);
});
test('custom, pack and per-icon color priorities; failed downloads fall back; remote photos untouched', () => {
    const store = { pack: 'solar', colors: { SettingsIcon: '#ff0000' }, defaultColor: '#00ff00', customEnabled: false, customIcons: { SettingsIcon: 'https://example.com/a.png' } };
    const engine = createEngine(store, () => asset);
    const first = engine.resolve({ uri: 'https://theme.example/icon.png', original: 1 });
    assert.match(first.uri, /mudrhiod/); assert.equal(first.color, '#ff0000');
    store.customEnabled = true; assert.equal(engine.resolve(1).uri, 'https://example.com/a.png');
    engine.failed.add('https://example.com/a.png'); assert.equal(engine.resolve(1).uri, undefined);
    engine.retry(); assert.equal(engine.resolve(1).uri, 'https://example.com/a.png');
    assert.equal(engine.resolve({ uri: 'https://cdn.discordapp.com/avatars/person.png' }), null);
    store.pack = ''; store.customEnabled = false; store.defaultColor = ''; store.colors = {};
    assert.equal(engine.resolve(1), null);
});
test('documented JSX hooks handle memo/forwardRef native images without patching them', async () => {
    const { RN, plugin, r, store, icon, hooks } = harness();
    const originalType = RN.Image.type, originalRender = originalType.render;
    const originalCreateElement = React.createElement;
    store.pack = 'solar'; store.colors.SettingsIcon = '#123456'; plugin.start();
    const namedIcons = JSON.parse(readFileSync(new URL('./src/sdk-icons.json', import.meta.url)));
    assert.deepEqual(new Set(hooks.keys()), new Set(namedIcons));
    assert.equal(React.createElement, originalCreateElement);
    let renderer;
    Renderer.act(() => { renderer = Renderer.create(icon({ color: '#ff0000', size: 32, style: { opacity: 0.6 }, accessibilityLabel: 'Settings' })); });
    let native = renderer.root.findByType('NativeImage');
    assert.match(native.props.source.uri,/raw.github/);
    assert.equal(native.props.style.at(-1).tintColor,'#123456');
    assert.equal(native.props.style[0].width,32);
    assert.equal(native.props.accessibilityLabel,'Settings');
    assert.equal(RN.Image.type,originalType); assert.equal(originalType.render,originalRender);
    Renderer.act(() => r.set('colors',{ SettingsIcon: '#abcdef' }));
    assert.equal(renderer.root.findByType('NativeImage').props.style.at(-1).tintColor,'#abcdef');
    Renderer.act(() => plugin.stop());
    assert.equal(renderer.root.findByType('VectorIcon').props.color,'#ff0000');
    Renderer.act(() => renderer.unmount()); await r.dispose(); assert.equal(hooks.size,0);
});

test('scoped destructive confirmation gates custom controls; cancel does not enable', async () => {
    const { plugin, sheets, store, r } = harness(); plugin.start();
    let renderer; Renderer.act(() => { renderer = Renderer.create(React.createElement(plugin.Settings)); });
    const labels = () => renderer.root.findAllByType('Button').map(x => x.props.accessibilityLabel);
    assert(!labels().includes('Validate and save icon'));
    Renderer.act(() => renderer.root.findByType('Switch').props.onValueChange(true));
    assert.equal(store.customEnabled,false);
    let warning; Renderer.act(() => { warning = Renderer.create([...sheets.values()][0]); });
    Renderer.act(() => warning.root.findAllByType('AlertButton').find(x => x.props.text === 'Cancel').props.onPress());
    assert.equal(sheets.size,0); assert.equal(store.customEnabled,false);
    Renderer.act(() => renderer.root.findByType('Switch').props.onValueChange(true));
    Renderer.act(() => warning.update([...sheets.values()][0]));
    const confirm = warning.root.findAllByType('AlertButton').find(x => x.props.text === "i know what i'm doing");
    assert.equal(confirm.props.variant,'destructive');
    await Renderer.act(async () => { await confirm.props.onPress(); });
    assert.equal(store.customEnabled,true); assert(labels().includes('Validate and save icon'));
    store.customIcons.SettingsIcon='https://example.com/a.png';
    Renderer.act(() => renderer.root.findByType('Switch').props.onValueChange(false));
    assert.equal(store.customIcons.SettingsIcon,'https://example.com/a.png');
    assert(!labels().includes('Validate and save icon'));
    Renderer.act(() => { renderer.unmount(); warning.unmount(); plugin.stop(); }); await r.dispose();
});
test('bundle matches Snow spec 3 and author metadata', () => {
    const manifest = JSON.parse(readFileSync(new URL('./manifest.json', import.meta.url)));
    assert.deepEqual(manifest.display.authors, JSON.parse(readFileSync(new URL('../TokenUtils/manifest.json', import.meta.url))).display.authors);
    assert.equal(manifest.spec, 3); assert.equal(manifest.display.name, 'icon themer');
    let definition;
    const source = readFileSync(new URL('./index.js', import.meta.url), 'utf8');
    assert(Buffer.byteLength(source) < 1048576);
    vm.runInNewContext(source, { bunny: {}, definePlugin: def => { definition = def; return def; }, console, URL, AbortController, setTimeout, clearTimeout });
    for (const name of ['start','stop','SettingsComponent']) assert.equal(typeof definition[name], 'function');
});
test('a failed native image falls back immediately and can be retried', async () => {
    const { plugin, icon, store, r } = harness(); store.pack = 'solar'; plugin.start();
    let renderer; Renderer.act(() => { renderer = Renderer.create(icon({})); });
    Renderer.act(() => renderer.root.findByType('NativeImage').props.onError({}));
    assert(renderer.root.findByType('VectorIcon'));
    assert.equal(plugin.engine.failed.size, 1);
    Renderer.act(() => { plugin.engine.retry(); r.changed(); });
    assert.match(renderer.root.findByType('NativeImage').props.source.uri, /raw.github/);
    Renderer.act(() => renderer.unmount()); plugin.stop(); await r.dispose();
});
test('custom save validates dimensions and cannot save after the custom toggle is disabled', async () => {
    const { plugin, RN, store, r } = harness(); store.customEnabled = true; plugin.start();
    let complete;
    RN.Image.getSize = (_url, yes) => { complete = yes; };
    let renderer; Renderer.act(() => { renderer = Renderer.create(React.createElement(plugin.Settings)); });
    const input = label => renderer.root.findAllByType('Input').find(x => x.props.accessibilityLabel === label);
    Renderer.act(() => { input('Custom icon asset name').props.onChangeText('SettingsIcon'); input('Custom icon direct image URL').props.onChangeText('https://example.com/a.png'); });
    let saving;
    Renderer.act(() => { saving = renderer.root.findAllByType('Button').find(x => x.props.accessibilityLabel === 'Validate and save icon').props.onPress(); });
    Renderer.act(() => renderer.root.findByType('Switch').props.onValueChange(false));
    await Renderer.act(async () => { complete(96,96); await saving; });
    assert.deepEqual(store.customIcons, {});
    Renderer.act(() => renderer.unmount()); plugin.stop(); await r.dispose();
});
test('default color excludes unrelated numeric assets', () => {
    const engine = createEngine({ defaultColor: '#fff' }, () => ({ ...asset, name: 'UnrelatedPhotoIllustration' }));
    assert.equal(engine.resolve(1), null);
});
test('failed storage flush is surfaced without a successful-save toast', async () => {
    const { plugin, B, r, toasts } = harness(); plugin.start();
    let renderer; Renderer.act(() => { renderer = Renderer.create(React.createElement(plugin.Settings)); });
    B.plugin.flushStorage = async () => { throw new Error('Storage unavailable'); };
    const save = renderer.root.findAllByType('Button').find(x => x.props.accessibilityLabel === 'Save color');
    await Renderer.act(async () => { await save.props.onPress(); });
    assert(!toasts.includes('Icon color saved'));
    assert(renderer.root.findAllByType('Text').some(x => x.props.children === 'Storage unavailable'));
    B.plugin.flushStorage = async () => {};
    Renderer.act(() => renderer.unmount()); plugin.stop(); await r.dispose();
});
test('stopping cancels pending custom validation before any saved mutation', async () => {
    const { plugin, RN, store, r } = harness(); store.customEnabled = true; plugin.start();
    RN.Image.getSize = () => {};
    let renderer; Renderer.act(() => { renderer = Renderer.create(React.createElement(plugin.Settings)); });
    const input = label => renderer.root.findAllByType('Input').find(x => x.props.accessibilityLabel === label);
    Renderer.act(() => { input('Custom icon asset name').props.onChangeText('SettingsIcon'); input('Custom icon direct image URL').props.onChangeText('https://example.com/a.png'); });
    let saving;
    Renderer.act(() => { saving = renderer.root.findAllByType('Button').find(x => x.props.accessibilityLabel === 'Validate and save icon').props.onPress(); });
    await Renderer.act(async () => { plugin.stop(); await saving; });
    assert.deepEqual(store.customIcons, {});
    Renderer.act(() => renderer.unmount()); await r.dispose();
});
