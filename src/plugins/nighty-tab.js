// Nighty Tab mobile port. Copyright 2026 Vendicated and contributors, Mime, rico.
// SPDX-License-Identifier: GPL-3.0-or-later
import { ui } from '../runtime.js';
import { registerSection } from '../settings-section.js';
import { patchLazySheet } from '../action-sheet.js';

export function pageUrl(value) {
    try {
        const url = new URL(String(value).trim());
        return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
    } catch { return null; }
}
export function canDownload(settings, message) {
    return !!settings.scriptUtils && typeof settings.nightyPrefix === 'string'
        && Array.from(settings.nightyPrefix).length === 1 && !!settings.nightyPrefix.trim()
        && !!message?.id && !!messageChannelId(message) && !!message.attachments?.length;
}
export function messageChannelId(message) { return message?.getChannelId?.() || message?.channel_id || message?.channelId; }
export default function NightyTab(r) {
    const { h, React, RN, store } = r;
    const { Page, Text, Button, Input, Toggle } = ui(r);
    const iconUrl = () => store.iconType === 'custom' ? pageUrl(store.customIconUrl)
        : `https://raw.githubusercontent.com/aboveproof/Equicord-Nighty-Tab/main/asset/icon${store.iconType === 'grayscale' ? '-grayscale' : ''}.png`;
    function Icon() {
        r.useRefresh();
        const uri = iconUrl();
        return uri ? h(RN.Image, { source: { uri }, style: { width: 24, height: 24 }, accessibilityIgnoresInvertColors: true }) : null;
    }
    const sending = new Set();
    async function download(message) {
        if (!r.active || !canDownload(store, message) || sending.has(message.id)) return;
        sending.add(message.id);
        try {
            const module = r.find('HTTP', 'get', 'post', 'put', 'patch', 'del') || r.find('get', 'post', 'put', 'del');
            const rest = module?.HTTP || module;
            if (typeof rest?.post !== 'function') throw new Error('Discord message API unavailable');
            const channelId = messageChannelId(message);
            await rest.post({ url: `/channels/${channelId}/messages`, body: {
                content: `${store.nightyPrefix}dls`,
                message_reference: { message_id: message.id, channel_id: channelId, ...(message.guild_id ? { guild_id: message.guild_id } : {}) },
                allowed_mentions: { parse: [], replied_user: false },
            } });
        } finally { sending.delete(message.id); }
    }
    function NightyPage({ close }) {
        r.useRefresh();
        const src = pageUrl(store.url);
        const WebView = r.find('WebView')?.WebView || r.byName('WebView');
        const [error, setError] = React.useState('');
        const [revision, reload] = React.useState(0);
        return h(RN.View, { style: { flex: 1, minHeight: 500 } },
            h(Text, { heading: true }, 'Nighty'),
            !src ? h(Text, null, 'Set a valid HTTP or HTTPS URL in Nighty Tab settings.')
                : !WebView ? h(Text, null, 'WebView is unavailable in this Snow build.')
                    : h(WebView, {
                        key: `${src}:${revision}`, source: { uri: src }, style: { flex: 1, minHeight: 440 },
                        originWhitelist: ['http://*', 'https://*'], javaScriptEnabled: true, domStorageEnabled: true,
                        sharedCookiesEnabled: false, thirdPartyCookiesEnabled: false, startInLoadingState: true,
                        onShouldStartLoadWithRequest: req => !!pageUrl(req.url),
                        onError: event => setError(event.nativeEvent?.description || 'Could not load Nighty.'),
                        onHttpError: event => setError(`Nighty returned HTTP ${event.nativeEvent?.statusCode}.`),
                        onLoad: () => setError(''),
                    }),
            error ? h(Text, null, error) : null,
            src ? h(Button, { text: 'Reload', onPress: () => { setError(''); reload(v => v + 1); } }) : null,
            close ? h(Button, { text: 'Close', onPress: close }) : null);
    }
    function Settings({ close }) {
        r.useRefresh();
        return h(Page, { title: 'Nighty Tab', close },
            h(Text, null, 'URL'), h(Input, { value: store.url, placeholder: 'https://', autoCapitalize: 'none', onChange: v => r.set('url', v) }),
            store.url && !pageUrl(store.url) ? h(Text, null, 'Enter an HTTP or HTTPS URL without embedded credentials.') : null,
            h(Button, { text: 'Open Nighty', onPress: () => r.open('nighty', NightyPage, {}, { scrollable: false }) }),
            h(Toggle, { setting: 'scriptUtils', label: 'Script Utils functions', subLabel: 'Download Script replies to an attachment with your prefix followed by dls.' }),
            h(Text, null, 'Nighty prefix (one character)'),
            h(Input, { value: store.nightyPrefix, onChange: v => r.set('nightyPrefix', v), autoCapitalize: 'none', placeholder: '.' }),
            ...['blue', 'grayscale', 'custom'].map(style => h(Button, { key: style, text: `${store.iconType === style ? '✓ ' : ''}${style} icon`, onPress: () => r.set('iconType', style) })),
            store.iconType === 'custom' ? h(Input, { value: store.customIconUrl, placeholder: 'https:// image URL', autoCapitalize: 'none', onChange: v => r.set('customIconUrl', v) }) : null,
            h(Icon), h(Text, { muted: true }, `Settings entry: ${r.status.settingsEntry ? 'registered' : 'unavailable'} · Message menu: ${r.status.messageMenu ? 'registered' : 'unavailable'}`));
    }
    return { Settings, NightyPage, download, start() {
        r.status.settingsEntry = registerSection(r, { name: 'Nighty', items: [{ key: 'MIME_NIGHTY', title: () => 'Nighty', IconComponent: Icon, render: async () => ({ default: NightyPage }) }] });
        r.status.messageMenu = patchLazySheet(r, (key, props) => key === 'MessageLongPressActionSheet' && canDownload(store, props?.message)
            ? { key: 'mime-nighty-download', label: 'Download Script', icon: h(Icon), onPress: () => download(props.message) } : null);
    } };
}
NightyTab.defaults = { url: '', scriptUtils: false, nightyPrefix: '.', iconType: 'blue', customIconUrl: '' };
