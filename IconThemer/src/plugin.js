import sdkIcons from './sdk-icons.json' with { type: 'json' };
import { packs, iconNames, createEngine, colorValue, imageUrl, validateDimensions, previewUrl } from './core.js';

export default function factory(r) {
    const { React, RN, h, store } = r;
    const B = r.B, D = B.metro.common.components;
    const pending = new Set();
    function useSettings() { r.useRefresh(); }
    async function saveSetting(key, value) { store[key] = value; r.changed(); await B.plugin.flushStorage(); }
    let enabled = true;
    const engine = createEngine(store, id => B.assets.findAsset(id));
    let rendererCount = 0;
    const styles = {
        card: { padding: 14, gap: 10, borderRadius: 14, backgroundColor: '#20232e', marginBottom: 10 },
        text: { color: '#f4f4fa', fontSize: 15 },
        muted: { color: '#b5b8ca', fontSize: 13 },
        input: { color: '#f4f4fa', backgroundColor: '#12151e', padding: 12, borderRadius: 10, minHeight: 44 },
        button: { padding: 12, minHeight: 44, borderRadius: 10, backgroundColor: '#514bd1', alignItems: 'center' },
    };
    const Text = ({ children, muted, ...props }) => h(RN.Text, { style: muted ? styles.muted : styles.text, ...props }, children);
    const Button = ({ text, onPress, red, disabled }) => h(RN.Pressable, { accessibilityRole: 'button', accessibilityLabel: text, accessibilityState: { disabled: !!disabled }, disabled, onPress, style: [styles.button, red && { backgroundColor: '#b42335' }, disabled && { opacity: 0.5 }] }, h(Text, null, text));
    const Input = ({ value, onChange, placeholder, label }) => h(RN.TextInput, { value, onChangeText: onChange, placeholder, accessibilityLabel: label || placeholder, placeholderTextColor: '#858ba2', autoCapitalize: 'none', autoCorrect: false, style: styles.input });

    let hits = 0, applied = 0;
    const matched = new Map(), overridden = new Map();
    function IconReplacement({ element, name }) {
        useSettings();
        if (!enabled || !r.active) return element;
        matched.set(name, (matched.get(name) || 0) + 1);
        const resolved = resolveName(name);
        if (resolved?.uri) { applied++; overridden.set(name, (overridden.get(name) || 0) + 1); }
        if (!resolved) return element;
        const props = element.props || {};
        if (!resolved.uri) return React.cloneElement(element, { color: resolved.color, style: [props.style, { tintColor: resolved.color }] });
        // The original native style remains intact, including explicit width/height.
        // Numeric layout dimensions are preserved. Named size tokens are not image dimensions.
        const size = typeof props.size === 'number' ? props.size : 24;
        return h(RN.Image, {
            source: { uri: resolved.uri },
            style: [{ width: size, height: size }, props.style, { tintColor: resolved.color }],
            resizeMode: props.resizeMode || 'contain',
            accessible: props.accessible,
            accessibilityLabel: props.accessibilityLabel,
            testID: props.testID,
            onLayout: props.onLayout,
            onError: event => {
                if (!enabled || !r.active) return;
                engine.failed.add(resolved.uri); r.changed();
                props.onError?.(event);
            },
        });
    }
    const resolutions = new Map();
    function resolveName(name) {
        if (resolutions.size < 10 && !resolutions.has(name)) {
            const r = engine.resolveName(name);
            resolutions.set(name, r ? (r.uri ? r.uri.split('/').slice(-2).join('/') : 'color-only') : 'null');
        }
        return engine.resolveName(name);
    }
    function showWarning() {
        const key = 'custom-icons-warning';
        B.ui.openAlert(key, h(D.AlertModal, {
            title: 'Custom icon setup',
            content: 'Use direct public HTTPS PNG, WebP or JPEG links (GitHub Raw, not file pages). Match the original proportions; 72–96 pixels is a useful starting size for a 24–32 point icon. Images must be 16–1024 pixels per side. SVG links are unsupported. The image host receives image requests. Custom images override presets; disabling this toggle keeps your saved links.',
            actions: h(D.AlertActions, null,
                h(D.AlertActionButton, { text: "i know what i'm doing", variant: 'destructive', onPress: async () => {
                    if (!enabled || !r.active) return;
                    try { await saveSetting('customEnabled', true); if (enabled && r.active) B.ui.dismissAlert(key); }
                    catch (e) { r.error('Save custom icon setting', e); }
                } }),
                h(D.AlertActionButton, { text: 'Cancel', variant: 'secondary', onPress: () => B.ui.dismissAlert(key) })),
        }));
    }
    function ColorEditor({ name }) {
        const [draft, setDraft] = React.useState(store.colors?.[name] || '');
        const [error, setError] = React.useState('');
        const uri = (store.customEnabled && store.customIcons?.[name]) || previewUrl(store.pack, name);
        let previewColor = store.colors?.[name] || store.defaultColor || null;
        try { previewColor = colorValue(draft) || previewColor; } catch {}
        return h(RN.View, { style: styles.card },
            h(Text, { accessibilityRole: 'header' }, name),
            uri ? h(RN.Image, { source: { uri }, accessibilityLabel: `${name} preview`, resizeMode: 'contain', style: { width: 32, height: 32, tintColor: previewColor } }) : null,
            h(Input, { value: draft, onChange: setDraft, placeholder: '#RRGGBB or blank for default', label: `Color for ${name}` }),
            error ? h(Text, null, error) : null,
            h(Button, { text: 'Save color', onPress: async () => { try { const value = colorValue(draft); const next = { ...store.colors }; if (value) next[name] = value; else delete next[name]; await saveSetting('colors', next); setError(''); if (enabled && r.active) r.toast('Icon color saved'); } catch (e) { setError(e.message); } } }),
            h(Button, { text: 'Reset this color', onPress: () => { const next = { ...store.colors }; delete next[name]; r.set('colors', next); setDraft(''); setError(''); } }));
    }
    function CustomEditor() {
        const [name, setName] = React.useState(''), [url, setUrl] = React.useState('');
        const [busy, setBusy] = React.useState(false), [error, setError] = React.useState('');
        const mounted = React.useRef(true);
        const validation = React.useRef(null);
        React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; validation.current?.(); }; }, []);
        const [page, setPage] = React.useState(0);
        const entries = Object.entries(store.customIcons || {}).sort(([a], [b]) => a.localeCompare(b));
        const maxPage = Math.max(0, Math.ceil(entries.length / 10) - 1), currentPage = Math.min(page, maxPage);
        async function save() {
            if (busy) return;
            setError(''); setBusy(true);
            try {
                const icon = name.trim();
                if (!/^[\w.-]{1,160}$/.test(icon) || ['__proto__', 'constructor', 'prototype'].includes(icon)) throw new Error('Enter the exact Discord asset name, such as SettingsIcon.');
                if (!sdkIcons.includes(icon)) throw new Error('Choose a documented Snow icon name, such as SettingsIcon. Older saved mappings are preserved.');
                const uri = imageUrl(url);
                await new Promise((resolve, reject) => {
                    let settled = false;
                    const finish = error => {
                        if (settled) return;
                        settled = true; clearTimeout(timer); pending.delete(cancel); validation.current = null;
                        if (error) reject(error); else resolve();
                    };
                    const cancel = () => finish(new Error('Image validation cancelled.'));
                    const timer = setTimeout(() => finish(new Error('Image validation timed out. Check the public direct link.')), 12000);
                    pending.add(cancel); validation.current = cancel;
                    if (typeof RN.Image?.getSize !== 'function') { finish(new Error('Image validation unavailable.')); return; }
                    try { RN.Image.getSize(uri, (width, height) => { try { validateDimensions(width, height); finish(); } catch (e) { finish(e); } }, () => finish(new Error('Could not load the direct image link.'))); }
                    catch (e) { finish(e); }
                });
                if (!mounted.current || !enabled || !r.active || !store.customEnabled) return;
                engine.retry(); await saveSetting('customIcons', { ...store.customIcons, [icon]: uri });
                if (!mounted.current || !enabled || !r.active) return;
                setName(''); setUrl(''); r.toast('Custom icon saved');
            } catch (e) { if (mounted.current && enabled && r.active) setError(e.message); }
            finally { if (mounted.current) setBusy(false); }
        }
        return h(RN.View, { style: styles.card },
            h(Text, { accessibilityRole: 'header' }, 'Custom icons'),
            h(Text, { muted: true }, 'Use a documented icon name from the browser below. Older saved asset mappings are retained; this SDK version hooks named vector icons only.'),
            h(Input, { value: name, onChange: setName, placeholder: 'SettingsIcon', label: 'Custom icon asset name' }),
            h(Input, { value: url, onChange: setUrl, placeholder: 'https://…/icon.png', label: 'Custom icon direct image URL' }),
            error ? h(Text, null, error) : null,
            h(Button, { text: busy ? 'Checking image…' : 'Validate and save icon', disabled: busy, onPress: save }),
            ...entries.slice(currentPage * 10, currentPage * 10 + 10).map(([key, uri]) => h(RN.View, { key, style: { gap: 8 } },
                h(Text, null, key), h(Text, { muted: true, numberOfLines: 2 }, uri),
                h(Button, { text: `Edit ${key}`, onPress: () => { setName(key); setUrl(uri); } }),
                h(Button, { text: `Remove ${key}`, onPress: () => { const next = { ...store.customIcons }; delete next[key]; r.set('customIcons', next); } }))),
            entries.length > 10 ? h(RN.View, null,
                h(Button, { text: 'Previous custom icons', disabled: currentPage === 0, onPress: () => setPage(currentPage - 1) }),
                h(Text, null, `${currentPage + 1} / ${maxPage + 1}`),
                h(Button, { text: 'Next custom icons', disabled: currentPage === maxPage, onPress: () => setPage(currentPage + 1) })) : null);
    }
    function Settings() {
        useSettings();
        const [search, setSearch] = React.useState(''), [page, setPage] = React.useState(0);
        const [draft, setDraft] = React.useState(store.defaultColor || ''), [error, setError] = React.useState('');
        const names = [...new Set([...sdkIcons, ...iconNames, ...Object.keys(store.colors || {}), ...Object.keys(store.customIcons || {})])].sort().filter(name => name.toLowerCase().includes(search.toLowerCase()));
        const currentPage = Math.min(page, Math.max(0, Math.ceil(names.length / 12) - 1));
        return h(RN.ScrollView, { contentContainerStyle: { padding: 16, gap: 12 }, keyboardShouldPersistTaps: 'handled' },
            h(RN.View, { style: styles.card },
                h(RN.View, { style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } },
                    h(Text, null, 'custom icons'),
                    h(RN.Switch, { accessibilityLabel: 'custom icons', value: !!store.customEnabled, onValueChange: value => {
                        if (!value) r.set('customEnabled', false);
                        else { try { showWarning(); } catch (e) { r.error('Custom icon warning', e); } }
                    } })),
                h(Text, { muted: true }, 'Advanced · replace individual icons with your own images')),
            store.customEnabled ? h(CustomEditor) : null,
            h(Text, { accessibilityRole: 'header', style: [styles.text, { fontSize: 24, fontWeight: '700' }] }, 'icon themer'),
            h(Text, { muted: true }, 'Named icon overrides use Snow’s JSX hook API. Reopen a screen if it kept an older icon. Legacy bitmap images and render paths outside these hooks are unchanged. Missing or failed pack images use the original icon.'),
            h(Text, { muted: true }, rendererCount ? `${rendererCount} documented icon hooks · ${hits} matches observed · ${applied} overrides applied · ${engine.failed.size} failed image(s)` : 'Icon hooks are unavailable. Overrides are not active.'),
            h(Text, { muted: true }, `resolution per matched name (first 10): ${[...resolutions.entries()].map(([n, r]) => `${n}=${r}`).join(' , ') || 'none'}`),
            h(Text, { accessibilityRole: 'header' }, 'Preset icon packs'),
            h(Button, { text: `${!store.pack ? '✓ ' : ''}Original / theme icons`, onPress: () => { engine.retry(); r.set('pack', ''); } }),
            ...packs.map(pack => h(RN.View, { key: pack.id, style: styles.card },
                h(Button, { text: `${store.pack === pack.id ? '✓ ' : ''}${pack.name}`, onPress: () => { engine.retry(); r.set('pack', pack.id); } }),
                h(RN.View, { style: { flexDirection: 'row', gap: 18 } }, ...['SettingsIcon', 'MagnifyingGlassIcon', 'BellIcon'].map(name => {
                    const uri = previewUrl(pack.id, name);
                    return uri ? h(RN.Image, { key: name, source: { uri }, accessibilityLabel: `${pack.name} ${name} preview`, resizeMode: 'contain', style: { width: 28, height: 28 } }) : null;
                })),
                h(Text, { muted: true }, `${pack.count} asset replacements · merged duplicate folders`),
                h(Button, { text: `${pack.name} source / credits`, onPress: () => RN.Linking.openURL(pack.groups[0].source) }))),
            h(RN.View, { style: styles.card },
                h(Text, { accessibilityRole: 'header' }, 'Default icon color'),
                h(Text, { muted: true }, 'Blank keeps pack artwork colors. A color here overrides theme tints; individual icon colors take priority. With Original / theme icons selected, blank leaves theme colors alone.'),
                h(Input, { value: draft, onChange: setDraft, placeholder: '#RRGGBB or blank', label: 'Default icon color' }),
                error ? h(Text, null, error) : null,
                h(Button, { text: 'Save default color', onPress: async () => { try { await saveSetting('defaultColor', colorValue(draft)); setError(''); } catch (e) { setError(e.message); } } }),
                h(Button, { text: 'Retry failed images', onPress: () => { engine.retry(); r.changed(); } })),
            h(Text, { accessibilityRole: 'header' }, 'Individual icon colors'),
            h(Input, { value: search, onChange: value => { setSearch(value); setPage(0); }, placeholder: 'Search icons, e.g. Settings or Search', label: 'Search individual icons' }),
            h(Text, { muted: true }, `${names.length} icons · page ${currentPage + 1} of ${Math.max(1, Math.ceil(names.length / 12))}`),
            ...names.slice(currentPage * 12, currentPage * 12 + 12).map(name => h(ColorEditor, { key: name, name })),
            names.length === 0 && /^[\w.-]{1,160}$/.test(search.trim()) && !['__proto__', 'constructor', 'prototype'].includes(search.trim()) ? h(ColorEditor, { key: search.trim(), name: search.trim() }) : null,
            h(Button, { text: 'Previous icons', disabled: currentPage === 0, onPress: () => setPage(currentPage - 1) }),
            h(Button, { text: 'Next icons', disabled: (currentPage + 1) * 12 >= names.length, onPress: () => setPage(currentPage + 1) }),
            h(Text, { muted: true }, 'Pack artwork: mudrhiod, Rairof, Rosiecord and upstream artists. Source and license details are in IconThemer/THIRD_PARTY_NOTICES.md.'));
    }
    return {
        Settings, engine,
        start() {
            const jsx = B.api?.react?.jsx;
            if (typeof jsx?.onJsxCreate !== 'function' || typeof jsx?.deleteJsxCreate !== 'function') throw new Error('Snow JSX icon hooks are unavailable.');
            for (const name of sdkIcons) {
                const callback = (_Component, element) => {
                    if (!enabled || !r.active || !React.isValidElement(element)) return;
                    hits++;
                    return h(IconReplacement, { element, name, key: element.key });
                };
                jsx.onJsxCreate(name, callback);
                r.own(() => jsx.deleteJsxCreate(name, callback));
                rendererCount++;
            }
        },
        stop() { enabled = false; for (const cancel of pending) cancel(); pending.clear(); B.ui.dismissAlert('custom-icons-warning'); r.changed(); },
    };
}
factory.defaults = { pack: '', defaultColor: '', colors: {}, customEnabled: false, customIcons: {} };
