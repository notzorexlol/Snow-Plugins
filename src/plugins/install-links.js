import { ui } from '../runtime.js';
import { addUrlHandler } from '../url-hub.js';

const SCHEME_RE = /snow:\/\/[^\s<>\]]+/gi;
const ZWSP = '\u200B';

export function stripFormatChars(value) {
    return String(value || '').replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, '');
}

export function hideInnerHttps(value) {
    return String(value).replace(/https:\/\//gi, 'https:' + ZWSP + '//');
}

export function snowInstallLink(pluginUrl) {
    const url = sanitizePluginUrl(pluginUrl) || pluginUrl;
    const params = String(url).replace(/&/g, '%26').replace(/#/g, '%23');
    return hideInnerHttps('snow://snow?id=-1&command=install-plugin&params=' + params);
}

export function parseInstallLink(value) {
    if (!value || typeof value !== 'string') return null;
    const trimmed = stripFormatChars(value.trim());
    let parsed;
    try { parsed = new URL(trimmed); } catch { return null; }
    if (parsed.protocol.replace(':', '').toLowerCase() !== 'snow') return null;
    const host = (parsed.hostname || parsed.host || '').toLowerCase();
    const path = (parsed.pathname || '').replace(/^\//, '');
    const command = (parsed.searchParams.get('command') || path || '').toLowerCase();
    const rawQuery = trimmed.split('?')[1] || '';
    const paramsMatch = rawQuery.match(/(?:^|&)params=([^&]*)/);
    const param = (paramsMatch ? paramsMatch[1] : '') || parsed.searchParams.get('params') || parsed.searchParams.get('url') || parsed.searchParams.get('plugin') || '';
    if (command === 'install-plugin' || command === 'installplugin' || path === 'install-plugin' || path === 'plugin' || path === 'install' || host === 'install-plugin' || host === 'plugin') {
        const url = sanitizePluginUrl(param);
        return url ? { kind: 'plugin', source: 'snow', url, raw: trimmed } : null;
    }
    return null;
}

export function sanitizePluginUrl(value) {
    if (!value) return null;
    let text = stripFormatChars(String(value).trim());
    try { text = decodeURIComponent(text); } catch {}
    let url;
    try { url = new URL(text); } catch { return null; }
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    if (url.hostname === 'github.com' && /\/blob\//.test(url.pathname)) {
        url.hostname = 'raw.githubusercontent.com';
        url.pathname = url.pathname.replace(/\/blob\//, '/');
    }
    if (url.pathname.endsWith('/')) return url.href;
    return url.href;
}

export function manifestUrl(url) {
    const href = sanitizePluginUrl(url) || url;
    if (!href) return href;
    if (/\/$/.test(href)) return href + 'manifest.json';
    return href;
}

function snowLinkParts(text) {
    if (typeof text !== 'string' || !text.includes('snow://')) return null;
    const parts = [];
    let last = 0;
    for (const match of text.matchAll(SCHEME_RE)) {
        if (!parseInstallLink(match[0])) continue;
        if (match.index > last) parts.push({ type: 'text', content: text.slice(last, match.index) });
        const raw = stripFormatChars(match[0]);
        parts.push({
            type: 'link',
            target: raw,
            url: raw,
            content: [{ type: 'text', content: hideInnerHttps(raw) }],
        });
        last = match.index + match[0].length;
    }
    if (!parts.length) return null;
    if (last < text.length) parts.push({ type: 'text', content: text.slice(last) });
    return parts;
}

function rewriteNode(node) {
    if (Array.isArray(node)) {
        for (let i = 0; i < node.length; i++) {
            if (typeof node[i] === 'string') {
                const parts = snowLinkParts(node[i]);
                if (parts) {
                    node.splice(i, 1, ...parts);
                    i += parts.length - 1;
                }
            } else rewriteNode(node[i]);
        }
        return;
    }
    if (!node || typeof node !== 'object') return;
    if (typeof node.content === 'string') {
        const parts = snowLinkParts(node.content);
        if (parts) node.content = parts;
    } else if (Array.isArray(node.content) || (node.content && typeof node.content === 'object')) rewriteNode(node.content);
    if (typeof node.text === 'string') {
        const parts = snowLinkParts(node.text);
        if (parts) node.content = parts;
    }
    for (const value of Object.values(node)) {
        if (value && typeof value === 'object' && value !== node.content) rewriteNode(value);
    }
}

function expandUrlRegex(value) {
    if (!(value instanceof RegExp) || !/https\?:/.test(value.source) || /snow\?:/.test(value.source)) return value;
    return new RegExp(value.source.replace(/https\?:/g, '(?:https?|snow):'), value.flags);
}

function patchAutolink(r) {
    const modules = [
        r.find('isUrl'), r.find('isLink'), r.find('isWebUrl'),
        r.find('URL_REGEX'), r.find('WEB_URL'), r.find('defaultRules'),
        r.find('parse', 'reactParser'), r.find('parseInline'),
        ...(r.metro.findByPropsAll?.('parse') || []),
    ].filter(Boolean);
    for (const module of modules) {
        if (!module || typeof module !== 'object') continue;
        for (const key of Object.keys(module)) {
            const current = module[key];
            const expanded = expandUrlRegex(current);
            if (expanded !== current) {
                try { module[key] = expanded; r.own(() => { if (module[key] === expanded) module[key] = current; }); } catch {}
            }
        }
    }
}

export default function InstallLinks(r) {
    const { h, React } = r, { Page, Text, Button, Input } = ui(r);
    let close;
    function Prompt({ link, close: dismiss }) {
        return h(Page, { title: 'Install in Snow', close: dismiss },
            h(Text, { selectable: true }, link.url),
            h(Text, null, 'Copy the manifest URL, then open Snow Settings → Plugins → Install from URL. Review the plugin there, install it, and enable it.'),
            h(Text, { muted: true }, 'Snow does not expose plugin installation or enabling other plugins through its compatibility SDK.'),
            h(Button, { text: 'Copy manifest URL', onPress: () => r.copy(link.url) }),
            h(Button, { text: 'Copy snow:// link', variant: 'secondary', onPress: () => r.copy(snowInstallLink(link.url)) }));
    }
    async function openPrompt(link) {
        if (!r.active) return;
        close?.();
        close = r.open('install', Prompt, { link: { ...link, url: manifestUrl(link.url) } });
    }
    function handle(url) {
        const link = parseInstallLink(url);
        if (!link) return false;
        openPrompt(link).catch(error => r.error('Install link', error));
        return true;
    }
    function Settings() {
        const [draft, setDraft] = React.useState('');
        r.useRefresh();
        const example = snowInstallLink('https://raw.githubusercontent.com/xMimiez/Snow-Plugins/main/Decor/manifest.json');
        return h(Page, { title: 'Install Links' },
            h(Text, { muted: true }, 'Send a snow:// install-plugin link. Discord does not autolink custom schemes, so this plugin marks snow:// as a URL and intercepts taps.'),
            h(Text, { selectable: true }, example),
            h(Input, { label: 'Plugin HTTPS URL', value: draft, onChange: setDraft, autoCapitalize: 'none' }),
            h(Button, { text: 'Preview install', onPress: () => {
                const url = sanitizePluginUrl(draft);
                if (!url) return r.toast('Enter an https plugin URL');
                openPrompt({ kind: 'plugin', source: 'snow', url, raw: snowInstallLink(url) });
            } }),
            h(Button, { text: 'Copy snow:// link', variant: 'secondary', onPress: () => {
                const url = sanitizePluginUrl(draft);
                if (!url) return r.toast('Enter an https plugin URL');
                r.copy(snowInstallLink(url));
            } }));
    }
    return {
        start() {
            addUrlHandler(r, 200, url => {
                if (!parseInstallLink(url)) return false;
                handle(stripFormatChars(url));
                return true;
            });
            patchAutolink(r);
            r.patchRows(rows => {
                const next = typeof rows === 'string' ? JSON.parse(rows) : JSON.parse(JSON.stringify(rows));
                rewriteNode(next);
                return typeof rows === 'string' ? JSON.stringify(next) : next;
            });
            const linking = r.RN.Linking;
            if (linking?.canOpenURL) {
                r.patch('instead', linking, 'canOpenURL', (args, next) => {
                    if (/^snow:/i.test(stripFormatChars(String(args[0] || '')))) return Promise.resolve(true);
                    return next(...args);
                });
            }
            if (typeof linking?.addEventListener === 'function') {
                const sub = linking.addEventListener('url', event => { if (event?.url) handle(event.url); });
                r.own(() => sub?.remove?.());
            }
            linking?.getInitialURL?.().then(url => { if (url && r.active) handle(url); }).catch(() => {});
            r.command({
                name: 'snowlink',
                description: 'Send a snow:// install-plugin link',
                options: [{ name: 'url', description: 'HTTPS plugin manifest URL', type: 3, required: true }],
                execute(args) {
                    const url = sanitizePluginUrl(args.find(a => a.name === 'url')?.value);
                    if (!url) { r.toast('Need an https plugin URL'); return; }
                    return { content: snowInstallLink(url) };
                },
            });
            r.command({
                name: 'installplugin',
                description: 'Open installation instructions for a snow:// or https URL',
                options: [{ name: 'url', description: 'snow:// or https plugin URL', type: 3, required: true }],
                execute(args) {
                    const raw = String(args.find(a => a.name === 'url')?.value || '');
                    const link = parseInstallLink(raw) || (sanitizePluginUrl(raw) && { kind: 'plugin', source: 'snow', url: sanitizePluginUrl(raw), raw });
                    if (!link) { r.toast('Need a snow:// or https plugin URL'); return; }
                    openPrompt(link);
                },
            });
        },
        stop() { close?.(); },
        Settings,
    };
}
InstallLinks.defaults = {};
