import { ui } from '../runtime.js';
import { addUrlHandler, openExternal } from '../url-hub.js';

function walk(value, visit) {
    if (!value || typeof value !== 'object') return;
    visit(value);
    if (Array.isArray(value)) for (const item of value) walk(item, visit);
    else for (const item of Object.values(value)) walk(item, visit);
}

function cloneRows(rows) {
    return JSON.parse(JSON.stringify(rows));
}

export function AlwaysAnimate(r) {
    const { h, React } = r, { Page, Text, Toggle } = ui(r);
    let reduced = false;
    function allowed() { return !(reduced && r.store.respectReducedMotion); }
    function force(element) {
        if (!element || !allowed()) return;
        const props = {};
        for (const key of ['canAnimate', 'animate', 'animateEmoji', 'animateGradient', 'loop', 'shouldAnimate', 'animated']) {
            if (typeof element.props?.[key] === 'boolean') props[key] = true;
        }
        return Object.keys(props).length ? React.cloneElement(element, props) : undefined;
    }
    return {
        async start() {
            reduced = !!(await r.RN.AccessibilityInfo?.isReduceMotionEnabled?.());
            const listener = r.RN.AccessibilityInfo?.addEventListener?.('reduceMotionChanged', value => { reduced = !!value; });
            r.own(() => listener?.remove?.());
            for (const name of ['canUseAnimatedEmojis', 'canUseAnimatedAvatar', 'canUseNameplate', 'canUseAnimatedBanner', 'shouldAnimateEmoji']) {
                r.patch('after', r.find(name), name, () => allowed() ? true : undefined);
            }
            r.patch('after', r.find('getCurrentUser'), 'getCurrentUser', (_args, user) => {
                if (!allowed() || !user) return;
                try { if (user.premiumType === 0 || user.premiumType == null) user.premiumType = user.premiumType; } catch {}
            });
            r.hook(['Emoji', 'CustomEmoji', 'AnimatedEmoji', 'Avatar', 'GuildIcon', 'GuildBanner', 'Nameplate', 'RoleIcon', 'Image', 'FastImage'], force);
            r.patchRows(rows => {
                if (!allowed()) return rows;
                const next = cloneRows(rows);
                walk(next, node => {
                    for (const key of ['animate', 'animated', 'canAnimate', 'animateEmoji', 'shouldAnimate', 'loop']) {
                        if (typeof node[key] === 'boolean') node[key] = true;
                    }
                });
                return next;
            });
        },
        Settings() {
            r.useRefresh();
            return h(Page, { title: 'AlwaysAnimate' },
                h(Toggle, { setting: 'respectReducedMotion', label: 'Respect Reduce Motion' }),
                h(Text, null, 'Forces animation flags on emoji, avatars, and native chat rows. Nitro-gated animated emoji still needs Discord to have the asset.'));
        },
    };
}
AlwaysAnimate.defaults = { respectReducedMotion: true };

export function BlurNsfw(r) {
    const { h, React, RN } = r, { Page, Text, Button, Toggle } = ui(r);
    const Gate = React.createContext(false);
    function media(obj) {
        const type = obj.content_type || obj.contentType || '';
        const name = obj.filename || obj.name || obj.url || '';
        return /^(image|video)\//.test(type) || /\.(png|jpe?g|gif|webp|mp4|mov|webm)$/i.test(name);
    }
    function Media({ original }) {
        const nested = React.useContext(Gate), [shown, reveal] = React.useState(false);
        if (nested) return original;
        return h(Gate.Provider, { value: true }, h(RN.View, null,
            shown ? original : h(RN.View, { style: { height: 120, justifyContent: 'center', padding: 12, backgroundColor: '#00000099' } }, h(Text, null, 'Sensitive media hidden')),
            h(Button, { text: shown ? 'Hide' : 'Reveal', variant: 'secondary', onPress: () => reveal(v => !v) })));
    }
    function nsfwChannel(props) {
        const channel = props.channel || r.byStore('ChannelStore')?.getChannel?.(props.channelId || props.channel_id || props.message?.channel_id || props.message?.channelId);
        return r.store.blurAllChannels || !!(channel?.nsfw || channel?.nsfw_ || props.nsfw);
    }
    return {
        start() {
            r.hook(['MessageImage', 'MessageVideo', 'MessageAttachment', 'ImageAttachment', 'VideoAttachment', 'MediaAttachment', 'EmbedMedia', 'MessageMedia', 'Attachment'], element => {
                try {
                    const p = element?.props || {}, a = p.attachment || p.media || p;
                    if (a && !media(a) && a.filename) return;
                    if (nsfwChannel(p)) return h(Media, { original: element });
                } catch { return; }
            });
            r.patchRows(rows => {
                const next = cloneRows(rows);
                walk(next, node => {
                    const channel = r.byStore('ChannelStore')?.getChannel?.(node.channelId || node.channel_id || node.message?.channel_id);
                    if (!(r.store.blurAllChannels || channel?.nsfw || node.nsfw) || !media(node)) return;
                    node.spoiler = true;
                    node.obscure = true;
                    node.hidden = true;
                });
                return next;
            });
        },
        Settings() {
            r.useRefresh();
            return h(Page, { title: 'BlurNSFW' },
                h(Toggle, { setting: 'blurAllChannels', label: 'Hide media in every channel' }),
                h(Text, null, 'Marks NSFW attachments as spoilers in native chat and covers JSX media with a reveal button.'));
        },
    };
}
BlurNsfw.defaults = { blurAllChannels: false };

export function NsfwGateBypass(r) {
    const { h } = r, { Page, Text } = ui(r);
    return {
        start() {
            let count = 0;
            for (const name of ['isNSFWInvite', 'shouldNSFWGateGuild', 'isNSFW', 'canViewNSFWGuild', 'shouldShowNSFWGate', 'needsNSFWGate']) {
                if (r.patch('after', r.find(name), name, () => false)) count++;
            }
            r.patch('after', r.byStore('UserStore') || r.find('getCurrentUser'), 'getCurrentUser', (_args, user) => {
                if (user && user.nsfwAllowed === false) try { user.nsfwAllowed = true; } catch {}
            });
            r.status.support = count ? `${count} client gate hooks installed` : 'No named gate function found; nsfwAllowed is still forced on the current user object when present.';
        },
        Settings() { return h(Page, { title: 'NSFWGateBypass' }, h(Text, null, r.status.support), h(Text, { muted: true }, 'Local interstitial only. Server permissions stay enforced.')); },
    };
}

export function appLink(value) {
    try {
        const u = new URL(value);
        if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password) return null;
        const host = u.hostname.replace(/^www\./, '');
        const path = u.pathname.replace(/\/$/, '');
        if (host === 'open.spotify.com' && /^\/(?:intl-[a-z-]+\/)?(?:track|album|artist|playlist|episode|show)\/[A-Za-z0-9]+$/.test(path)) {
            return 'spotify:' + path.replace(/^\/(?:intl-[a-z-]+\/)?/, '').replace('/', ':');
        }
        if (['store.steampowered.com', 'steamcommunity.com', 'help.steampowered.com'].includes(host)) return 'steam://openurl/' + u.href;
        if (host === 'tidal.com' && /^\/browse\/(track|album|artist|playlist)\/[\w-]+$/.test(path)) return 'tidal://' + path.slice(8);
        if (host === 'music.apple.com') return 'musics://' + u.host + u.pathname + u.search;
        if (host === 't.me' || host === 'telegram.me') {
            const parts = path.slice(1).split('/');
            const domain = parts[0];
            if (domain && domain.startsWith('+')) return 'tg://join?invite=' + encodeURIComponent(domain.slice(1));
            if (domain && /^[A-Za-z][\w]{3,}$/.test(domain) && !parts[1]) return 'tg://resolve?domain=' + encodeURIComponent(domain);
            if (domain && parts[1]) return 'tg://resolve?domain=' + encodeURIComponent(domain) + '&post=' + encodeURIComponent(parts[1]);
        }
        if (host === 'instagram.com' || host === 'instagr.am') {
            const ig = path.slice(1).split('/');
            if (['p', 'reel', 'reels', 'tv'].includes(ig[0]) && ig[1]) return 'instagram://media?shortcode=' + encodeURIComponent(ig[1]);
            if (ig[0] && !['stories', 'explore', 'accounts'].includes(ig[0])) return 'instagram://user?username=' + encodeURIComponent(ig[0]);
        }
        if (host === 'tiktok.com' || host.endsWith('.tiktok.com')) {
            const user = path.match(/^\/@([^/]+)/);
            if (user) return 'tiktok://user?username=' + encodeURIComponent(user[1]);
            if (host === 'vm.tiktok.com' || path.startsWith('/t/')) return 'tiktok://' + path;
            return 'snssdk1233://' + path;
        }
    } catch {}
    return null;
}

export function OpenInApp(r) {
    const { h } = r, { Page, Text, Toggle } = ui(r);
    return {
        start() {
            addUrlHandler(r, 10, (url, fallback) => {
                const app = appLink(url);
                if (!r.store.enabled || !app) return false;
                openExternal(r, app).catch(() => r.active && fallback());
                return true;
            });
        },
        Settings() {
            r.useRefresh();
            return h(Page, { title: 'OpenInApp' },
                h(Toggle, { setting: 'enabled', label: 'Open supported links in their app' }),
                h(Text, null, 'Spotify, Steam, Tidal, Apple Music, Telegram, Instagram and TikTok. iOS cannot probe whether an app is installed, so the app URL is opened directly and the original link is used if that fails. SpotifyPreview still takes priority for Spotify URLs.'));
        },
    };
}
OpenInApp.defaults = { enabled: true };

export function ValidUser(r) {
    const { h, React } = r, { Page, Text, Button, Input, Toggle } = ui(r);
    const pending = new Map();
    let next = 0;
    async function resolve(id) {
        if (!/^\d{16,22}$/.test(id)) throw new Error('Enter a numeric Discord user ID');
        const cached = r.byStore('UserStore')?.getUser?.(id);
        if (cached?.username && cached.username !== 'Unknown User' && cached.username !== 'unknownuser') return cached;
        if (pending.has(id)) return pending.get(id);
        const wait = Math.max(0, next - Date.now());
        next = Date.now() + 1200;
        const task = (wait ? r.wait(wait) : Promise.resolve()).then(() => r.discord(`/users/${id}`)).then(result => {
            const user = result.json();
            if (!user?.id || !user?.username) throw new Error('User could not be resolved');
            r.common.FluxDispatcher?.dispatch?.({ type: 'USER_UPDATE', user });
            r.common.FluxDispatcher?.dispatch?.({ type: 'LOAD_USER_SUCCESS', user });
            return user;
        }).finally(() => pending.delete(id));
        pending.set(id, task);
        return task;
    }
    function idsFrom(value) {
        return [...new Set(Array.from(String(value || '').matchAll(/<@!?(\d{16,22})>/g), match => match[1]))];
    }
    function unknown(user) {
        return !user || !user.username || user.username === 'Unknown User' || user.username === 'unknownuser' || user.isUnknown;
    }
    function harvest(message) {
        const ids = idsFrom(message?.content);
        for (const mention of message?.mentions || []) if (mention?.id) ids.push(mention.id);
        for (const id of ids) {
            const user = r.byStore('UserStore')?.getUser?.(id);
            if (unknown(user)) resolve(id).catch(() => {});
        }
    }
    function Settings() {
        const [id, setId] = React.useState(''), [result, setResult] = React.useState(''), [busy, setBusy] = React.useState(false);
        return h(Page, { title: 'ValidUser' },
            h(Toggle, { setting: 'autoResolve', label: 'Automatically resolve unknown mentions' }),
            h(Input, { label: 'User ID', value: id, onChange: setId, keyboardType: 'number-pad' }),
            h(Button, { text: busy ? 'Resolving…' : 'Resolve user', disabled: busy, onPress: () => { setBusy(true); resolve(id.trim()).then(u => setResult(`${u.global_name || u.globalName || u.username} (@${u.username})`)).catch(e => setResult(e.message)).finally(() => setBusy(false)); } }),
            h(Text, null, result || 'Unknown mentions are fetched and USER_UPDATE is dispatched so @Unknown User is replaced with the real username.'));
    }
    return {
        start() {
            r.subscribe('MESSAGE_CREATE', event => { if (r.store.autoResolve) harvest(event?.message || event); });
            r.subscribe('MESSAGE_UPDATE', event => { if (r.store.autoResolve) harvest(event?.message || event); });
            r.subscribe('LOAD_MESSAGES_SUCCESS', event => {
                if (!r.store.autoResolve) return;
                for (const message of event?.messages || []) harvest(message);
            });
            const store = r.byStore('UserStore') || r.find('getUser', 'getCurrentUser');
            r.patch('after', store, 'getUser', (args, user) => {
                const id = String(args?.[0] || '');
                if (r.store.autoResolve && /^\d{16,22}$/.test(id) && unknown(user)) resolve(id).catch(() => {});
            });
            r.hook(['Mention', 'UserMention', 'UnknownUser', 'MentionedUser'], element => {
                const id = element.props?.userId || element.props?.id || element.props?.user?.id;
                const user = id && r.byStore('UserStore')?.getUser?.(id);
                if (id && unknown(user)) resolve(id).catch(() => {});
            });
            r.command({ name: 'resolveuser', description: 'Resolve a Discord user ID', options: [{ name: 'id', description: 'User ID', type: 3, required: true }], async execute(options) {
                const user = await resolve(String(options.find(o => o.name === 'id')?.value || ''));
                r.toast(`${user.global_name || user.username} (@${user.username})`);
            } });
        },
        Settings, resolve,
    };
}
ValidUser.defaults = { autoResolve: true };

export function PauseInvitesForever(r) {
    const { h, React } = r, { Page, Text, Button } = ui(r);
    function Confirm({ guildId, pause, close }) {
        const [busy, setBusy] = React.useState(false), inFlight = React.useRef(false), mounted = React.useRef(true);
        React.useEffect(() => () => { mounted.current = false; }, []);
        const pausing = pause === true;
        return h(Page, { title: pausing ? 'Pause server invites indefinitely?' : 'Resume server invites?', close },
            h(Text, null, `Server: ${r.byStore('GuildStore')?.getGuild?.(guildId)?.name || guildId}. This changes the invite setting for everyone.`),
            h(Button, { text: busy ? 'Saving…' : pausing ? 'Pause invites' : 'Resume invites', disabled: busy, onPress: async () => {
                if (inFlight.current) return; inFlight.current = true; setBusy(true);
                try {
                    const guild = (await r.discord(`/guilds/${guildId}`)).json();
                    if (!Array.isArray(guild?.features)) throw new Error('Could not read current server features');
                    const features = guild.features.filter(f => f !== 'INVITES_DISABLED');
                    if (pausing) features.push('INVITES_DISABLED');
                    await r.discord(`/guilds/${guildId}`, { method: 'PATCH', body: JSON.stringify({ features }) });
                    r.toast(pausing ? 'Invites paused' : 'Invites resumed');
                    if (mounted.current) close();
                } catch (e) { if (r.active) r.error('Server invites', e); }
                finally { inFlight.current = false; if (r.active && mounted.current) setBusy(false); }
            } }));
    }
    function run(pause) {
        return function execute(_options, context) {
            const channel = context?.channel || r.byStore('ChannelStore')?.getChannel?.(context?.channelId);
            const guildId = context?.guild?.id || context?.guildId || channel?.guild_id || channel?.guildId;
            if (!/^\d+$/.test(guildId || '')) throw new Error('Run this in a server channel');
            r.open(pause ? 'pause' : 'resume', Confirm, { guildId, pause });
        };
    }
    return {
        start() {
            r.command({ name: 'pauseinvites', description: 'Pause server invites without a timer', execute: run(true) });
            r.command({ name: 'resumeinvites', description: 'Resume server invites', execute: run(false) });
        },
        Settings() { return h(Page, { title: 'PauseInvitesForever' }, h(Text, null, 'Use /pauseinvites or /resumeinvites in a server. Each command opens its own confirmation.')); },
        Confirm,
    };
}

function setNativeVolume(r, gain) {
    const modules = r.RN.NativeModules || {};
    const candidates = [
        r.find('setOutputVolume'), r.find('setAbsoluteOutputVolume'), r.find('setVolume', 'getVolume'),
        r.find('setLocalVolume'), r.find('setOutputVolumeScalar'),
        modules.VoiceEngine, modules.AudioManager, modules.MediaEngine, modules.VoiceManager, modules.RTCEngine, modules.AudioModule,
    ].filter(Boolean);
    let applied = 0;
    for (const mod of candidates) {
        for (const method of ['setOutputVolume', 'setAbsoluteOutputVolume', 'setOutputVolumeScalar', 'setLocalVolume', 'setVolume', 'setSinkVolume']) {
            if (typeof mod[method] !== 'function') continue;
            try { mod[method](gain); applied++; } catch { try { mod[method](gain * 100); applied++; } catch {} }
        }
    }
    return applied;
}

export function VolumeBooster(r) {
    const { h } = r, { Page, Text, Toggle, Slider } = ui(r);
    function apply(percent) {
        const gain = Math.max(1, Math.min(5, Number(percent) / 100));
        const n = setNativeVolume(r, gain);
        r.status.support = n ? `Applied ${percent}% via ${n} native volume method(s).` : 'No VoiceEngine/MediaEngine volume method found; slider max is still raised where Discord renders a 200 cap.';
        r.changed();
        return n;
    }
    return {
        start() {
            apply(r.store.percent || 200);
            r.hook(['Slider', 'FormSlider', 'TableSliderRow', 'NativeSlider'], element => {
                const max = element.props?.maximumValue ?? element.props?.maxValue;
                if (max === 200 || max === 1) {
                    return r.React.cloneElement(element, {
                        maximumValue: max === 1 ? 5 : 500,
                        maxValue: max === 1 ? 5 : 500,
                    });
                }
            });
            const settings = r.find('setOutputVolume') || r.find('setLocalVolume');
            if (settings && typeof settings.setOutputVolume === 'function') {
                r.patch('before', settings, 'setOutputVolume', args => {
                    if (typeof args[0] === 'number' && r.store.enabled) args[0] = args[0] * ((r.store.percent || 200) / 100);
                });
            }
        },
        Settings() {
            r.useRefresh();
            return h(Page, { title: 'VolumeBooster' },
                h(Toggle, { setting: 'enabled', label: 'Boost voice output volume' }),
                h(Text, null, `Boost: ${r.store.percent}%`),
                h(Slider, { value: r.store.percent, minimumValue: 100, maximumValue: 500, step: 10, onValueChange: value => { r.set('percent', Math.round(value)); apply(value); } }),
                h(Text, { muted: true }, r.status.support || 'Uses MediaEngine/VoiceEngine volume setters when present, and raises Discord volume sliders that cap at 200%.'));
        },
    };
}
VolumeBooster.defaults = { enabled: true, percent: 200 };

export function shouldPing(message, channel, oldestUnread, settings, selfId) {
    if (![1, 3].includes(channel?.type) || String(settings.ignoreUsers || '').split(/[\s,]+/).includes(message.author?.id)) return true;
    if ((channel.type === 1 && settings.channelToAffect === 'group_dm') || (channel.type === 3 && settings.channelToAffect === 'user_dm')) return true;
    if (settings.allowMentions && message.mentions?.some(m => (m.id || m) === selfId)) return true;
    if (settings.allowEveryone && (message.mention_everyone || message.mentionEveryone)) return true;
    return !oldestUnread || oldestUnread === message.id;
}
