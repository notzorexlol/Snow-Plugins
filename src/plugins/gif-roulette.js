export function unwrapDiscordProxy(url) {
    if (!url || typeof url !== 'string') return url;
    const match = url.match(/\/external\/[^/]+\/(https?)\/([^?]+)/);
    if (match) {
        try { return match[1] + '://' + decodeURIComponent(match[2]); } catch { return url; }
    }
    return url;
}

export function isWeakGifUrl(url) {
    return !url || url.includes('images-ext-') || url.includes('format=webp');
}

export function gifUrlFrom(entry) {
    if (!entry) return null;
    if (typeof entry === 'string') return /^https?:\/\//.test(entry) ? unwrapDiscordProxy(entry) : null;
    const raw = entry.url || entry.gif || entry.uri || entry.src || entry.video || entry.sourceURI;
    return raw ? unwrapDiscordProxy(raw) : null;
}

export function favoriteGifsMapFrom(value) {
    if (!value) return null;
    if (Array.isArray(value) || Array.isArray(value.favorites)) return value.favorites || value;
    if (value.favoriteGifs?.gifs) return value.favoriteGifs.gifs;
    if (value.favorite_gifs?.gifs) return value.favorite_gifs.gifs;
    if (value.gifs && typeof value.gifs === 'object') return value.gifs;
    if (value.favoriteGifs && typeof value.favoriteGifs === 'object') return value.favoriteGifs;
    if (value.favoriteGIFs && typeof value.favoriteGIFs === 'object') return value.favoriteGIFs;
    return null;
}

export function collectGifUrls(gifs) {
    const urls = [];
    const push = url => { if (url && !urls.includes(url)) urls.push(url); };
    if (!gifs) return urls;
    if (typeof gifs.forEach === 'function' && typeof gifs.keys === 'function' && !Array.isArray(gifs)) {
        gifs.forEach((val, key) => {
            if (typeof key === 'string' && /^https?:\/\//.test(key)) push(unwrapDiscordProxy(key));
            else push(gifUrlFrom(val));
        });
        return urls;
    }
    if (Array.isArray(gifs)) {
        for (const item of gifs) push(gifUrlFrom(item));
        return urls;
    }
    for (const [key, value] of Object.entries(gifs)) {
        if (/^https?:\/\//.test(key)) push(unwrapDiscordProxy(key));
        else push(gifUrlFrom(value));
    }
    return urls;
}

export function gifUrls(value) {
    return collectGifUrls(favoriteGifsMapFrom(value) || value);
}

function readFavoriteGifsFromModule(mod) {
    if (!mod) return null;
    const inner = mod.FrecencyUserSettingsActionCreators || mod.default || mod;
    try { inner.loadIfNecessary?.(); } catch {}
    for (const getter of ['getCurrentValue', 'getState', 'getFavoriteGifs', 'getFavoriteGIFs', 'getSavedGifs', 'getFavorites', 'getFavoriteGIFsMobile']) {
        if (typeof inner[getter] !== 'function') continue;
        try {
            const value = inner[getter]();
            const map = favoriteGifsMapFrom(value) || favoriteGifsMapFrom(value?.frecencyUserSettings) || favoriteGifsMapFrom(value?.settings);
            if (map && collectGifUrls(map).length) return map;
        } catch {}
    }
    if (Array.isArray(inner.favorites) && inner.favorites.length) return inner.favorites;
    return favoriteGifsMapFrom(inner.favoriteGifs) || favoriteGifsMapFrom(inner);
}

export function pickFavoriteGif(r) {
    const modules = [
        r.find('addFavoriteGIF'),
        r.find('useFavoriteGIFsMobile'),
        r.find('FrecencyUserSettingsActionCreators'),
        r.byStore('FrecencyUserSettingsStore'),
        r.byStore('FavoriteGIFStore'),
        r.byStore('UserSettingsProtoStore'),
        r.find('favoriteGifs'),
        r.find('getFavoriteGifs'),
        r.find('getFavoriteGIFs'),
        r.find('loadIfNecessary', 'getCurrentValue'),
        r.find('ProtoClass', 'getCurrentValue'),
    ].filter(Boolean);
    let urls = [];
    for (const module of modules) {
        urls = collectGifUrls(readFavoriteGifsFromModule(module));
        if (urls.length) break;
    }
    if (!urls.length) return null;
    const strong = urls.filter(url => !isWeakGifUrl(url));
    const pool = strong.length ? strong : urls;
    return pool[Math.floor(Math.random() * pool.length)];
}

export async function sendFavoriteGif(r, ctx) {
    const channelId = r.channelId(ctx);
    const url = pickFavoriteGif(r);
    if (!url) {
        r.local(channelId, 'No favorite GIFs found. Star a GIF in the GIF picker first.');
        return;
    }
    return { content: url };
}

export default function GifRoulette(r) {
    return {
        start() {
            r.command({
                name: 'gifroulette',
                description: 'Send a random favorite GIF',
                execute(_args, ctx) { return sendFavoriteGif(r, ctx); },
            });
        },
    };
}
