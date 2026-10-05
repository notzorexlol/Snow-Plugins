import { ui } from '../runtime.js';
import { toPng } from '../image-conversion.js';
// Original: Fiery. Native Snow port: Mime.
export default function Decor(r) {
let nativeClose;
const uploadAborters = new Set();
const uiTimers = new Set();
let stopped = false;
function schedule(callback, delay) {
    if (stopped || !r.active) return;
    const timer = setTimeout(() => { uiTimers.delete(timer); if (!stopped && r.active) callback(); }, delay);
    uiTimers.add(timer);
    return timer;
}
var unpatches = [];
var _storage;
var usersDecorations = {};
var fetchQueue = {};
var bulkTimer = null;
var presets = [];
var myDecorations = [];
var selectedHash = null;
var selectedDecorationObj = null;
var selectionEpoch = 0;
var selectionHydrated = false;
var selectionListeners = [];
var putInFlight = null;
var lastPutKey = undefined;
var createDraft = { asset: null, alt: "" };

function notifySelection() {
    for (var i = 0; i < selectionListeners.length; i++) {
        try { selectionListeners[i](); } catch (_e) {}
    }
}

function subscribeSelection(fn) {
    if (typeof fn !== "function") return function () {};
    selectionListeners.push(fn);
    return function () {
        var i = selectionListeners.indexOf(fn);
        if (i >= 0) selectionListeners.splice(i, 1);
    };
}

var BASE_URL = "https://decor.fieryflames.dev";
var API_URL = BASE_URL + "/api";
var AUTHORIZE_URL = API_URL + "/authorize";
var CDN_URL = "https://ugc.decor.fieryflames.dev";
var CLIENT_ID = "1096966363416899624";
var SKU_ID = "100101099111114";
var RAW_SKU_ID = "11497119";

function log() {
    try { console.log.apply(console, ["[Decor]"].concat([].slice.call(arguments))); } catch (_e) {}
}
function logError() {
    try { console.error.apply(console, ["[Decor]"].concat([].slice.call(arguments))); } catch (_e) {}
}

function eachClient(fn) { fn(r.host); }

function getMod() { return r.host; }

function metroRoots() { return [r.metro]; }

function findByProps() {
    var args = arguments;
    var roots = metroRoots();
    for (var i = 0; i < roots.length; i++) {
        var fn = roots[i].findByProps;
        if (!fn) continue;
        try {
            var found = fn.apply(roots[i], args);
            if (found) return found;
        } catch (_e) {}
    }
    return null;
}

function findByPropsAll() {
    var args = arguments;
    var roots = metroRoots();
    for (var i = 0; i < roots.length; i++) {
        var fn = roots[i].findByPropsAll;
        if (!fn) continue;
        try {
            var found = fn.apply(roots[i], args);
            if (found && found.length) return found;
        } catch (_e) {}
    }
    var one = findByProps.apply(null, args);
    return one ? [one] : [];
}

function findByName(name, expDefault) {
    if (expDefault === undefined) expDefault = true;
    var roots = metroRoots();
    for (var i = 0; i < roots.length; i++) {
        var fn = roots[i].findByName;
        if (!fn) continue;
        try {
            var found = fn.call(roots[i], name, expDefault);
            if (found) return found;
        } catch (_e) {
            try {
                var found2 = fn.call(roots[i], name);
                if (found2) return found2;
            } catch (_e2) {}
        }
    }
    return null;
}

function findByDisplayName(name, expDefault) {
    if (expDefault === undefined) expDefault = true;
    var roots = metroRoots();
    for (var i = 0; i < roots.length; i++) {
        var fn = roots[i].findByDisplayName;
        if (!fn) continue;
        try {
            var found = fn.call(roots[i], name, expDefault);
            if (found) return found;
        } catch (_e) {}
    }
    return null;
}

function findByTypeName(name, expDefault) {
    if (expDefault === undefined) expDefault = true;
    var roots = metroRoots();
    for (var i = 0; i < roots.length; i++) {
        var fn = roots[i].findByTypeName;
        if (!fn) continue;
        try {
            var found = fn.call(roots[i], name, expDefault);
            if (found) return found;
        } catch (_e) {}
    }
    return null;
}

function findByStoreName(name) {
    var roots = metroRoots();
    for (var i = 0; i < roots.length; i++) {
        var fn = roots[i].findByStoreName;
        if (!fn) continue;
        try {
            var found = fn.call(roots[i], name);
            if (found) return found;
        } catch (_e) {}
    }
    return findByName(name);
}

function getPatcher() { return r.api.patcher; }

function hardWrap(kind, obj, method, cb) { return patchMethod(kind, obj, method, cb); }

function patchMethod(kind, obj, method, cb) {
    if (typeof obj?.[method] !== 'function') return null;
    return r.own(r.api.patcher[kind](method, obj, cb));
}

function getReact() { return r.React; }

function getRN() { return r.RN; }

function getStorage() { return r.store; }

function getCurrentUser() {
    var store = findByStoreName("UserStore") || findByProps("getCurrentUser", "getUser");
    return store && store.getCurrentUser ? store.getCurrentUser() : null;
}

function getToken() {
    var me = getCurrentUser();
    var store = getStorage();
    if (me && store.tokens && store.tokens[me.id]) return store.tokens[me.id];
    return store.token || null;
}

function setToken(token) {
    var store = getStorage();
    var me = getCurrentUser();
    store.token = token; r.api.storage.flush().catch(error => r.error('Save Decor token', error));
    if (!store.tokens) store.tokens = {};
    if (me) store.tokens[me.id] = token;
}

function decorationToAsset(decoration) {
    if (!decoration) return null;
    if (typeof decoration === "string") return decoration;
    return (decoration.animated ? "a_" : "") + decoration.hash;
}

function decorationToAvatar(decoration) {
    var asset = decorationToAsset(decoration);
    if (!asset) return null;
    return { asset: asset, skuId: SKU_ID };
}

function getDecorAvatarDecorationURL(avatarDecoration, canAnimate) {
    if (!avatarDecoration) return null;
    if (avatarDecoration.skuId === SKU_ID) {
        var parts = String(avatarDecoration.asset || "").split("_");
        if (!canAnimate && parts[0] === "a") parts.shift();
        return CDN_URL + "/" + parts.join("_") + ".png";
    }
    if (avatarDecoration.skuId === RAW_SKU_ID) return avatarDecoration.asset;
    return null;
}

function applyDecorationToUser(user, decorationAsset) {
    if (!user) return user;
    if (decorationAsset) {
        user.avatarDecoration = { asset: decorationAsset, skuId: SKU_ID };
    } else if (user.avatarDecoration && (user.avatarDecoration.skuId === SKU_ID || user.avatarDecoration.skuId === RAW_SKU_ID)) {
        user.avatarDecoration = null;
    }
    user.avatarDecorationData = user.avatarDecoration;
    user.avatar_decoration_data = user.avatarDecoration;
    return user;
}

function doFetch(url, opts) {
    return r.request(url, opts).then(result => ({ ok: true, status: result.response.status, json: async () => result.json(), text: async () => result.text })).catch(error => {
        if (error.status === 401 && url.startsWith(API_URL)) setToken(null);
        throw error;
    });
}

function getUsersDecorations(ids) {
    if (ids && !ids.length) return Promise.resolve({});
    var url = API_URL + "/users";
    if (ids && ids.length) url += "?ids=" + encodeURIComponent(JSON.stringify(ids));
    return doFetch(url).then(function (r) {
        if (!r || (r.status && r.status >= 400)) throw new Error("http " + (r && r.status));
        return r.json();
    });
}

function authFetch(path, opts) {
    opts = opts || {};
    var token = getToken();
    if (!token) return Promise.reject(new Error("unauthorized"));
    var headers = Object.assign({}, opts.headers || {}, { Authorization: "Bearer " + token });
    return doFetch(API_URL + path, Object.assign({}, opts, { headers: headers })).then(function (r) {
        if (r && r.status === 401) {
            setToken(null);
            throw new Error("unauthorized");
        }
        if (!r || !r.ok) throw new Error("http " + (r && r.status));
        return r;
    });
}

function getFluxDispatcher() { return r.common.FluxDispatcher; }

function stampUserFromStore(userId, decoration) {
    var store = findByStoreName("UserStore") || findByProps("getUser", "getCurrentUser");
    var user = store && store.getUser ? store.getUser(userId) : null;
    if (!user) return;
    applyDecorationToUser(user, decoration);
    var Flux = getFluxDispatcher();
    if (Flux && typeof Flux.dispatch === "function") {
        try { Flux.dispatch({ type: "USER_UPDATE", user: user }); } catch (_e) {}
    }
}

function bulkFetch() {
    bulkTimer = null;
    var ids = Object.keys(fetchQueue);
    fetchQueue = {};
    if (!ids.length) return Promise.resolve();
    return getUsersDecorations(ids).then(function (map) {
        map = map || {};
        var me = getCurrentUser();
        var meId = me && me.id;
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            var deco = Object.prototype.hasOwnProperty.call(map, id) ? map[id] : null;
            if (meId && id === meId && selectionHydrated) {
                var local = selectedDecorationObj ? decorationToAsset(selectedDecorationObj) : (selectedHash || null);
                if (deco && selectedHash && String(deco).indexOf(selectedHash) >= 0) {
                    usersDecorations[id] = deco;
                } else {
                    usersDecorations[id] = local;
                }
                continue;
            }
            usersDecorations[id] = deco;
            if (deco) stampUserFromStore(id, deco);
        }
        log("fetched", ids.length, "users");
    }).catch(function (err) {
        logError("bulkFetch", err);
    });
}

function queueFetch(userId, force) {
    if (!userId) return;
    if (!force && Object.prototype.hasOwnProperty.call(usersDecorations, userId)) return;
    fetchQueue[userId] = true;
    if (bulkTimer) return;
    bulkTimer = setTimeout(bulkFetch, 250);
}

function queueMany(userIds) {
    if (!userIds || !userIds.length) return;
    for (var i = 0; i < userIds.length; i++) queueFetch(userIds[i], false);
}

function loadConfig() {
    return doFetch(API_URL + "/config").then(function (r) { return r && r.json ? r.json() : null; }).then(function (cfg) {
        if (!cfg) return;
        if (cfg.CDN_URL) CDN_URL = cfg.CDN_URL;
        if (cfg.CLIENT_ID) CLIENT_ID = cfg.CLIENT_ID;
        log("config", CDN_URL);
    }).catch(function () {});
}

function stampIfKnown(user) {
    if (!user || !user.id) return user;
    if (Object.prototype.hasOwnProperty.call(usersDecorations, user.id)) {
        applyDecorationToUser(user, usersDecorations[user.id]);
    } else {
        queueFetch(user.id, false);
    }
    return user;
}

function handleFlux(event) {
    if (!event) return;
    var type = event.type;
    if (type === "CONNECTION_OPEN") {
        var me = getCurrentUser();
        if (me) queueFetch(me.id, true);
        if (event.user) stampIfKnown(event.user);
        if (event.users) {
            var list = Array.isArray(event.users) ? event.users : [];
            queueMany(list.map(function (u) { return u && u.id; }).filter(Boolean));
            for (var i = 0; i < list.length; i++) stampIfKnown(list[i]);
        }
        if (getToken()) refreshMine();
        return;
    }
    if ((type === "USER_UPDATE" || type === "CURRENT_USER_UPDATE") && event.user) {
        stampIfKnown(event.user);
        return;
    }
    if (type === "USER_PROFILE_MODAL_OPEN" && event.userId) {
        queueFetch(event.userId, true);
        return;
    }
    if (type === "LOAD_MESSAGES_SUCCESS" && event.messages) {
        queueMany(event.messages.map(function (m) { return m && m.author && m.author.id; }).filter(Boolean));
        return;
    }
    if (type === "MESSAGE_CREATE") {
        var msg = event.message || event;
        var author = msg && msg.author;
        if (author && author.id) queueFetch(author.id, false);
        return;
    }
    if (type === "TYPING_START" && event.userId) queueFetch(event.userId, false);
}

function decoUrlFromAsset(asset, canAnimate) {
    if (!asset) return null;
    if (/^(https?:|file:|content:|ph:|data:)/i.test(String(asset))) return asset;
    return getDecorAvatarDecorationURL({ asset: asset, skuId: SKU_ID }, canAnimate !== false);
}

function decorationForUserId(userId) {
    if (!userId) return null;
    if (Object.prototype.hasOwnProperty.call(usersDecorations, userId)) return usersDecorations[userId] || null;
    queueFetch(userId, false);
    return null;
}

function decorationUrlFromOpts(opts) {
    if (!opts) return null;
    var uid = opts.userId || (opts.user && opts.user.id);
    var cached = decorationForUserId(uid);
    if (cached) return decoUrlFromAsset(cached, opts.canAnimate);
    return getDecorAvatarDecorationURL(opts.avatarDecoration, opts.canAnimate);
}

function avatarPixelSize(size) {
    if (typeof size === "number" && size > 0) return size;
    if (size && typeof size === "object") {
        if (typeof size.size === "number") return size.size;
        if (typeof size.width === "number") return size.width;
    }
    var named = {
        xxxsmall: 16, xxsmall: 20, xsmall: 24, extraSmall: 16, small: 32, medium: 40,
        large: 80, xlarge: 120, xxlarge: 160, xxxlarge: 192,
        size16: 16, size20: 20, size24: 24, size32: 32, size40: 40, size48: 48,
        size56: 56, size64: 64, size80: 80, size120: 120
    };
    if (typeof size === "string" && named[size] != null) return named[size];
    var mod = findByProps("AvatarSizes");
    try {
        var sizes = (mod && (mod.AvatarSizes || mod)) || {};
        var v = size != null ? sizes[size] : null;
        if (typeof v === "number") return v;
        if (v && typeof v.size === "number") return v.size;
    } catch (_e) {}
    return 32;
}

function styleDim(style, key) {
    if (!style) return null;
    if (Array.isArray(style)) {
        for (var i = style.length - 1; i >= 0; i--) {
            var v = styleDim(style[i], key);
            if (typeof v === "number") return v;
        }
        return null;
    }
    if (typeof style[key] === "number") return style[key];
    return null;
}

function resolveAvatarSize(props, ret) {
    var w = styleDim(props && props.style, "width") || styleDim(ret && ret.props && ret.props.style, "width");
    var h = styleDim(props && props.style, "height") || styleDim(ret && ret.props && ret.props.style, "height");
    if (w && h) return Math.min(w, h);
    if (w) return w;
    return avatarPixelSize(props && (props.size || props.avatarSize));
}

function overlayEl(uri, size) {
    var RN = getRN() || {};
    var Image = RN.Image;
    if (!Image || !uri) return null;
    return h(Image, {
        key: "mime-decor-overlay",
        source: { uri: uri },
        pointerEvents: "none",
        resizeMode: "contain",
        style: {
            position: "absolute",
            width: size * 1.2,
            height: size * 1.2,
            left: -size * 0.1,
            top: -size * 0.1,
            zIndex: 2
        }
    });
}

function swapOverlayChild(node, uri, size) {
    if (!node || !node.props) return false;
    var kids = node.props.children;
    var overlay = uri ? overlayEl(uri, size) : null;
    if (Array.isArray(kids)) {
        var idx = -1;
        for (var i = 0; i < kids.length; i++) {
            if (kids[i] && kids[i].key === "mime-decor-overlay") { idx = i; break; }
        }
        if (idx >= 0) {
            var next = kids.slice();
            if (overlay) next[idx] = overlay;
            else next.splice(idx, 1);
            node.props.children = next;
            return true;
        }
        return false;
    }
    if (kids && kids.key === "mime-decor-overlay") {
        node.props.children = overlay;
        return true;
    }
    return false;
}

function addDecorOverlay(ret, uri, size) {
    var RN = getRN() || {};
    var View = RN.View;
    if (!ret) return ret;
    if (swapOverlayChild(ret, uri, size)) return ret;
    if (!uri) return ret;
    var overlay = overlayEl(uri, size);
    if (!overlay) return ret;
    var t = ret.type;
    var native = typeof t === "string";
    if (native || !ret.props) {
        return h(View, { style: { width: size, height: size, overflow: "visible" } }, ret, overlay);
    }
    var kids = ret.props.children;
    if (Array.isArray(kids)) ret.props.children = kids.concat([overlay]);
    else if (kids != null) ret.props.children = [kids, overlay];
    else ret.props.children = overlay;
    var style = ret.props.style;
    if (style == null) ret.props.style = { overflow: "visible" };
    else if (Array.isArray(style)) ret.props.style = style.concat([{ overflow: "visible" }]);
    else ret.props.style = [style, { overflow: "visible" }];
    return ret;
}

function stripOfficialDecorArgs(args) {
    var props = args && args[0];
    if (!props || props.__mimeDecorPreview) return args;
    var user = props.user || props.guildMember || null;
    var uid = props.userId || (user && user.id);
    if (!uid || !decorationForUserId(uid)) return args;
    var next = Object.assign({}, props, {
        avatarDecoration: null,
        pendingAvatarDecoration: null
    });
    if (user) {
        next.user = Object.assign({}, user, {
            avatarDecoration: null,
            avatarDecorationData: null,
            avatar_decoration_data: null
        });
    }
    var out = [].slice.call(args);
    out[0] = next;
    return out;
}

function overlayFromProps(args, ret) {
    var props = (args && args[0]) || {};
    if (props.__mimeDecorPreview) return ret;
    var user = props.user || props.guildMember || null;
    var uid = props.userId || (user && user.id);
    if (!uid) return ret;
    var asset = decorationForUserId(uid);
    var size = resolveAvatarSize(props, ret);
    if (!asset) return addDecorOverlay(ret, null, size);
    return addDecorOverlay(ret, decoUrlFromAsset(asset, true), size);
}

function wrapAvatarExport(obj, key) {
    var orig = obj[key];
    if (typeof orig !== "function" || orig.__mimeDecorAvatar) return false;
    function wrapped() {
        var args = stripOfficialDecorArgs(arguments);
        var ret = orig.apply(this, args);
        try { ret = overlayFromProps(args, ret); } catch (err) { logError("avatar overlay", err); }
        return ret;
    }
    wrapped.__mimeDecorAvatar = true;
    obj[key] = wrapped;
    unpatches.push(function () {
        if (obj[key] === wrapped) obj[key] = orig;
    });
    return true;
}

function wrapAvatarModule(mod) {
    if (!mod) return;
    if (typeof mod === "function") return;
    if (typeof mod.default === "function") wrapAvatarExport(mod, "default");
    if (typeof mod.type === "function") wrapAvatarExport(mod, "type");
    if (mod.prototype && typeof mod.prototype.render === "function") wrapAvatarExport(mod.prototype, "render");
}

function patchUrlResolver(resolver) {
    if (!resolver) return;
    if (typeof resolver.getAvatarDecorationURL === "function") {
        var unUrl = patchMethod("instead", resolver, "getAvatarDecorationURL", function (args, orig) {
            var custom = decorationUrlFromOpts(args && args[0]);
            if (custom) return custom;
            try { return orig.apply(resolver, args); } catch (_e) { return orig(args[0]); }
        });
        if (unUrl) log("patched getAvatarDecorationURL");
    }
    if (resolver.default) patchUrlResolver(resolver.default);
}

function patchAvatars() {
    var i;
    var list = findByPropsAll("getAvatarDecorationURL");
    for (i = 0; i < list.length; i++) patchUrlResolver(list[i]);
    patchUrlResolver(findByProps("getAvatarDecorationURL", "default"));
    patchUrlResolver(findByProps("getAvatarDecorationURL", "getUserAvatarURL"));
    patchUrlResolver(findByProps("getAvatarDecorationURL"));

    var sizes = findByProps("AvatarSizes");
    if (sizes) wrapAvatarModule(sizes);

    var comps = (getMod().metro && getMod().metro.common && getMod().metro.common.components) || {};
    if (comps.Avatar) wrapAvatarModule(typeof comps.Avatar === "function" ? { default: comps.Avatar } : comps.Avatar);

    var names = ["Avatar", "UserAvatar", "DisplayAvatar"];
    for (i = 0; i < names.length; i++) {
        var raw = findByName(names[i], false) || findByDisplayName(names[i], false) || findByTypeName(names[i], false);
        if (raw) wrapAvatarModule(raw);
    }
    log("patched avatars");
}

function patchStores() {
    var UserStore = findByStoreName("UserStore") || findByProps("getUser", "getCurrentUser");
    if (UserStore) {
        var un = patchMethod("after", UserStore, "getUser", function (_args, user) {
            return stampIfKnown(user);
        });
        if (un) log("patched UserStore.getUser");
        if (typeof UserStore.getCurrentUser === "function") {
            patchMethod("after", UserStore, "getCurrentUser", function (_args, user) {
                return stampIfKnown(user);
            });
        }
    }
    patchAvatars();
    var anim = findByProps("isAnimatedAvatarDecoration");
    if (anim && typeof anim.isAnimatedAvatarDecoration === "function") {
        patchMethod("after", anim, "isAnimatedAvatarDecoration", function (args, ret) {
            var d = args && args[0];
            var asset = d && (d.asset || d);
            if (typeof asset === "string" && asset.indexOf("a_") === 0) return true;
            return ret;
        });
    }
    var Flux = getFluxDispatcher();
    if (Flux && typeof Flux.dispatch === "function") {
        patchMethod("before", Flux, "dispatch", function (args) {
            var e = args && args[0];
            if (!e) return;
            if (e.user) stampIfKnown(e.user);
            if (e.message && e.message.author) stampIfKnown(e.message.author);
        });
    }
}

function subscribeFlux() {
    for (const type of ['CONNECTION_OPEN','USER_PROFILE_MODAL_OPEN','LOAD_MESSAGES_SUCCESS','MESSAGE_CREATE','TYPING_START']) {
        r.subscribe(type, payload => handleFlux({ ...payload, type }));
    }
}

function showToast(message) { r.toast(message); }

function hideSheet() { nativeClose?.(); nativeClose = null; }

function getWebView() {
    var named = findByName("WebView");
    if (named) return named;
    var mod = findByProps("WebView");
    if (!mod) return null;
    if (typeof mod.WebView === "function") return mod.WebView;
    if (mod.default && typeof mod.default === "function") return mod.default;
    return null;
}

function discordAuthorizeUrl() {
    return "https://discord.com/oauth2/authorize"
        + "?client_id=" + encodeURIComponent(CLIENT_ID)
        + "&redirect_uri=" + encodeURIComponent(AUTHORIZE_URL)
        + "&response_type=code&scope=identify";
}

function decoImageUri(decoration) {
    var asset = decorationToAsset(decoration);
    if (!asset) return null;
    return CDN_URL + "/" + asset + ".png";
}

function isLikelyJwt(token) {
    token = String(token || "").trim();
    if (!token || token.length < 16) return false;
    if (token.charAt(0) === "<" || token.indexOf("<!DOCTYPE") >= 0 || token.indexOf("{") === 0) return false;
    return token.split(".").length >= 2;
}

function exchangeDecorToken(location) {
    var url = String(location || "");
    if (!url) return Promise.reject(new Error("no location"));
    if (url.indexOf("http") !== 0 && url.charAt(0) === "/") url = "https://discord.com" + url;
    if (new URL(url).origin !== BASE_URL || new URL(url).pathname !== '/api/authorize' || !new URL(url).searchParams.has('code')) {
        return Promise.reject(new Error("not a Decor redirect"));
    }
    function stripClient(u) {
        return u.replace(/([?&])client=[^&]*/g, "$1").replace(/[?&]$/, "").replace("?&", "?");
    }
    function tryClient(client) {
        var u = stripClient(url);
        u += (u.indexOf("?") >= 0 ? "&" : "?") + "client=" + encodeURIComponent(client);
        return doFetch(u).then(function (r) { return r.text(); }).then(function (token) {
            token = String(token || "").trim();
            if (!isLikelyJwt(token)) throw new Error("bad token for " + client);
            setToken(token);
            hideSheet();
            showToast("Decor authorized");
            log("authorized", client);
            return refreshMine().then(function () { return token; });
        });
    }
    // Decor's OAuth backend identifier, matching Equicord; not a plugin loader.
    return tryClient("vencord");
}

function finishAuthFromRedirect(location) {
    try { const u = new URL(location); if (u.origin !== BASE_URL || u.pathname !== '/api/authorize' || !u.searchParams.has('code')) return false; }
    catch { return false; }
    exchangeDecorToken(location).catch(error => r.error('Authorize Decor', error)); return true;
}

function authorizeSilent() {
    var qs = "client_id=" + encodeURIComponent(CLIENT_ID)
        + "&response_type=code"
        + "&redirect_uri=" + encodeURIComponent(AUTHORIZE_URL)
        + "&scope=identify";
    function post(body) {
        return r.discord("/oauth2/authorize?" + qs, {
            method: "POST",
            body: JSON.stringify(body)
        });
    }
    return post({ authorize: true, permissions: "0", integration_type: 0 }).catch(function (error) {
        if (error.status === 400 || error.status === 422) {
            return post({ authorize: true, permissions: "0" });
        }
        throw error;
    }).then(function (r) {
        return r.json();
    }).then(function (data) {
        var loc = data && (data.location || data.redirect_to || data.redirect_uri);
        if (!loc) throw new Error("no redirect");
        return exchangeDecorToken(loc);
    });
}

function ensureAuth() {
    if (getToken()) return Promise.resolve(getToken());
    return authorizeSilent().catch(function (err) {
        logError("ensureAuth", err);
        return null;
    });
}

function authorizeWebView() {
    const WebView = getWebView(); if (!WebView) return false;
    return openDecorTab('Authorize Decor', function Auth() { return h(WebView, {source:{uri:discordAuthorizeUrl()}, style:{height:520}, originWhitelist:['https://*'], onShouldStartLoadWithRequest(req) {
        if (finishAuthFromRedirect(req.url)) return false;
        try { const u = new URL(req.url); return u.protocol === 'https:' && ['discord.com','discordapp.com','decor.fieryflames.dev'].includes(u.hostname); } catch { return false; }
    }}); });
}

function authorize() {
    showToast("Authorizing Decor…");
    return authorizeSilent().catch(function (err) {
        logError("silent auth", err);
        if (authorizeWebView()) return;
        var Linking = findByProps("openURL", "openDeeplink") || findByProps("openURL");
        if (Linking && typeof Linking.openURL === "function") {
            try { Linking.openURL(discordAuthorizeUrl()); } catch (_e2) {}
            showToast("Finish login, then paste the Decor token in settings");
            return;
        }
        showToast("Could not authorize — paste a Decor token in settings");
    });
}

function normalizePresets(p) {
    if (!p) return [];
    if (Array.isArray(p)) return p;
    if (Array.isArray(p.presets)) return p.presets;
    if (Array.isArray(p.data)) return p.data;
    if (Array.isArray(p.results)) return p.results;
    return [];
}

function loadPresets() {
    return doFetch(API_URL + "/decorations/presets").then(function (r) { return r.json(); }).then(function (p) {
        presets = normalizePresets(p);
        log("presets", presets.length);
        return presets;
    }).catch(function (err) {
        logError("presets", err);
        presets = [];
        return [];
    });
}

function applySelectedLocally(decoration) {
    selectionEpoch++;
    selectionHydrated = true;
    selectedHash = decoration && decoration.hash ? decoration.hash : null;
    selectedDecorationObj = decoration || null;
    var me = getCurrentUser();
    var asset = decoration ? decorationToAsset(decoration) : null;
    if (me && me.id) {
        usersDecorations[me.id] = asset;
        applyDecorationToUser(me, asset);
        stampUserFromStore(me.id, asset);
        var Flux = getFluxDispatcher();
        if (Flux && typeof Flux.dispatch === "function") {
            try { Flux.dispatch({ type: "CURRENT_USER_UPDATE", user: me }); } catch (_e) {}
            try { Flux.dispatch({ type: "USER_UPDATE", user: me }); } catch (_e2) {}
        }
    }
    notifySelection();
}

function refreshMine() {
    var jobs = [loadPresets()];
    if (getToken()) {
        jobs.push(authFetch("/users/@me/decorations").then(function (r) { return r.json(); }).catch(function (error) { r.error("Refresh decorations", error); return null; }));
        jobs.push(authFetch("/users/@me/decoration").then(function (r) { return r.json(); }).catch(function () { return null; }));
    }
    var epoch = selectionEpoch;
    return Promise.all(jobs).then(function (parts) {
        if (epoch !== selectionEpoch) return;
        if (Array.isArray(parts[1])) myDecorations = parts[1];
        if (parts[2] !== undefined && !selectionHydrated) {
            var selected = parts[2];
            applySelectedLocally(selected && selected.hash ? selected : null);
            selectionHydrated = true;
        }
        log("mine", myDecorations.length, "presets", presets.length);
        notifySelection();
    }).catch(function (err) {
        if (String(err && err.message) === "unauthorized" && !refreshMine._retrying) {
            refreshMine._retrying = true;
            return ensureAuth().then(function (tok) {
                refreshMine._retrying = false;
                if (tok) return refreshMine();
            }).catch(function () { refreshMine._retrying = false; });
        }
        logError("refreshMine", err);
    });
}

function putDecoration(decoration) {
    var hash = decoration && decoration.hash ? decoration.hash : null;
    var key = hash == null ? "null" : String(hash);
    if (putInFlight && lastPutKey === key) return putInFlight;
    lastPutKey = key;
    var body = new FormData();
    body.append("hash", hash == null ? "null" : hash);
    putInFlight = authFetch("/users/@me/decoration", { method: "PUT", body: body }).then(function (r) {
        putInFlight = null;
        return r;
    }).catch(function (err) {
        putInFlight = null;
        throw err;
    });
    return putInFlight;
}

function selectDecoration(decoration) {
    var run = function () {
        if (!getToken()) {
            showToast("Authorize with Decor first");
            return Promise.resolve();
        }
        var nextHash = decoration && decoration.hash ? decoration.hash : null;
        if ((nextHash || null) === (selectedHash || null) && lastPutKey === (nextHash == null ? "null" : String(nextHash))) {
            applySelectedLocally(decoration);
            return Promise.resolve();
        }
        applySelectedLocally(decoration);
        return putDecoration(decoration).then(function () {
            showToast(decoration ? "Decoration applied" : "Decoration cleared");
        }).catch(function (err) {
            logError("select", err);
            if (String(err && err.message) === "unauthorized") {
                lastPutKey = undefined;
                return authorizeSilent().then(function () { return putDecoration(decoration); }).then(function () {
                    applySelectedLocally(decoration);
                    showToast(decoration ? "Decoration applied" : "Decoration cleared");
                }).catch(function () {
                    authorize();
                    showToast("Authorize with Decor, then tap again");
                });
            }
            showToast("Failed to apply decoration");
        });
    };
    if (!getToken()) {
        return authorizeSilent().then(run).catch(function () {
            authorize();
            return Promise.resolve();
        });
    }
    return run();
}

function h(type, props) {
    var React = getReact();
    if (!React) return null;
    var kids = [].slice.call(arguments, 2);
    if (kids.length === 1 && Array.isArray(kids[0])) kids = kids[0];
    var clean = [];
    for (var i = 0; i < kids.length; i++) {
        if (kids[i] != null && kids[i] !== false) clean.push(kids[i]);
    }
    if (clean.length === 0) return React.createElement(type, props);
    if (clean.length === 1) return React.createElement(type, props, clean[0]);
    return React.createElement.apply(React, [type, props].concat(clean));
}

function findAssetId(name) {
    var roots = metroRoots();
    var i;
    for (i = 0; i < roots.length; i++) {
        var api = roots[i];
        try {
            if (api.assets && typeof api.assets.findAssetId === "function") {
                var id = api.assets.findAssetId(name);
                if (id != null) return id;
            }
        } catch (_e) {}
    }
    var mod = getMod();
    try {
        if (mod.api && mod.api.assets && typeof mod.api.assets.findAssetId === "function") {
            var id2 = mod.api.assets.findAssetId(name);
            if (id2 != null) return id2;
        }
    } catch (_e2) {}
    var byName = findByProps("getAssetByName") || findByProps("registerAsset");
    try {
        if (byName && typeof byName.getAssetByName === "function") {
            var asset = byName.getAssetByName(name);
            if (asset && asset.id != null) return asset.id;
            if (typeof asset === "number") return asset;
        }
    } catch (_e3) {}
    return name;
}

function typeNameOf(node) {
    if (!node) return "";
    var t = node.type;
    if (!t) return "";
    if (typeof t === "string") return t;
    return String((t.displayName || t.name || (t.type && (t.type.displayName || t.type.name)) || ""));
}

function isOfficialDecorNode(node) {
    if (!node || typeof node !== "object" || !node.props) return false;
    if (node.props.__mimeDecor) return false;
    if (node.key === "mime-decor-picker") return false;
    var n = typeNameOf(node);
    if (/AvatarDecoration|DecorationPreview|CollectiblesAvatar|EditAvatarDecoration|AvatarDecorationSetting/i.test(n)) return true;
    var p = node.props;
    if (p.pendingAvatarDecoration !== undefined) return true;
    if (p.avatarDecoration !== undefined && (p.onSelectAvatarDecoration || p.setPendingAvatarDecoration || p.onChangeAvatarDecoration || p.onAvatarDecorationChange)) return true;
    if (p.section === "decoration" || p.id === "decoration" || p.setting === "decoration") return true;
    var label = p.label || p.title || p.heading;
    if (typeof label === "string" && /avatar decoration/i.test(label)) return true;
    return false;
}

function injectDecorAboveOfficial(node, pickerEl) {
    if (!node || typeof node !== "object" || !pickerEl) return false;
    if (node.props && node.props.__mimeDecor) return true;
    var kids = node.props && node.props.children;
    if (kids == null) return false;
    var isArr = Array.isArray(kids);
    var arr = isArr ? kids : [kids];
    var already = false;
    var idx = -1;
    var i;
    for (i = 0; i < arr.length; i++) {
        var c = arr[i];
        if (c && ((c.props && c.props.__mimeDecor) || c.key === "mime-decor-picker")) already = true;
        if (idx < 0 && isOfficialDecorNode(c)) idx = i;
    }
    if (already) return true;
    if (idx >= 0) {
        var next = arr.slice();
        next[idx] = pickerEl;
        node.props.children = isArr ? next : (next.length === 1 ? next[0] : next);
        return true;
    }
    for (i = 0; i < arr.length; i++) {
        if (injectDecorAboveOfficial(arr[i], pickerEl)) return true;
    }
    return false;
}

function wrapExport(obj, key, afterFn) {
    var orig = obj[key];
    if (typeof orig !== "function") return null;
    if (orig.__mimeDecorWrapped) return null;
    function wrapped() {
        var ret = orig.apply(this, arguments);
        try {
            var next = afterFn(arguments, ret);
            if (next !== undefined) ret = next;
        } catch (err) {
            logError("wrap", key, err);
        }
        return ret;
    }
    wrapped.__mimeDecorWrapped = true;
    try { Object.defineProperty(wrapped, "name", { value: orig.name }); } catch (_e) {}
    wrapped.displayName = orig.displayName || orig.name;
    try {
        Object.keys(orig).forEach(function (k) {
            try { wrapped[k] = orig[k]; } catch (_e2) {}
        });
    } catch (_e3) {}
    obj[key] = wrapped;
    unpatches.push(function () {
        if (obj[key] === wrapped) obj[key] = orig;
    });
    return true;
}

function wrapComponentModule(mod, afterFn) {
    if (!mod || typeof mod === "function") return false;
    var ok = false;
    if (typeof mod.default === "function" && wrapExport(mod, "default", afterFn)) ok = true;
    if (typeof mod.type === "function" && wrapExport(mod, "type", afterFn)) ok = true;
    if (mod.prototype && typeof mod.prototype.render === "function" && wrapExport(mod.prototype, "render", afterFn)) ok = true;
    return ok;
}

function makePickerEl() {
    var React = getReact();
    if (!React) return null;
    return React.createElement(EditProfileDecorBlock, { key: "mime-decor-picker", __mimeDecor: true });
}

function onEditProfileRender(_args, ret) {
    if (!ret) return ret;
    var picker = makePickerEl();
    if (picker) injectDecorAboveOfficial(ret, picker);
    return ret;
}

function onOfficialDecorRender(_args, _ret) {
    var picker = makePickerEl();
    return picker || _ret;
}

function patchNamedComponent(name, afterFn) {
    afterFn = afterFn || onEditProfileRender;
    var roots = metroRoots();
    var i;
    for (i = 0; i < roots.length; i++) {
        var r = roots[i];
        var raw = null;
        try { if (r.findByName) raw = r.findByName(name, false); } catch (_e) {}
        if (raw && wrapComponentModule(raw, afterFn)) {
            log("patched", name);
            return true;
        }
        try { if (r.findByDisplayName) raw = r.findByDisplayName(name, false); } catch (_e2) {}
        if (raw && wrapComponentModule(raw, afterFn)) {
            log("patched display", name);
            return true;
        }
        try { if (r.findByTypeName) raw = r.findByTypeName(name, false); } catch (_e3) {}
        if (raw && wrapComponentModule(raw, afterFn)) {
            log("patched type", name);
            return true;
        }
    }
    var named = findByName(name, false) || findByDisplayName(name, false) || findByTypeName(name, false);
    if (named && wrapComponentModule(named, afterFn)) {
        log("patched fallback", name);
        return true;
    }
    return false;
}

function patchEditProfile() {
    var screens = [
        "EditProfile",
        "EditProfileScreen",
        "UserSettingsEditProfile",
        "UserSettingsEditProfileScreen",
        "EditCurrentUserProfile",
        "UserProfileEdit",
        "UserProfileEditScreen",
        "ProfileEditForm",
        "ProfileCustomization",
        "ProfileCustomizationScreen",
        "UserSettingsProfile"
    ];
    var official = [
        "CollectiblesProfileSettings",
        "AvatarDecorationSettings",
        "EditAvatarDecoration",
        "AvatarDecorationSetting",
        "AvatarDecorationPicker",
        "CollectiblesAvatarDecoration"
    ];
    var hit = 0;
    var i;
    for (i = 0; i < screens.length; i++) {
        if (patchNamedComponent(screens[i], onEditProfileRender)) hit++;
    }
    for (i = 0; i < official.length; i++) {
        if (patchNamedComponent(official[i], onOfficialDecorRender)) hit++;
    }
    log("edit-profile patches", hit);
}

function getSelectedDecoration() {
    if (!selectedHash) return null;
    if (selectedDecorationObj && selectedDecorationObj.hash === selectedHash) return selectedDecorationObj;
    var i;
    var j;
    for (i = 0; i < myDecorations.length; i++) {
        if (myDecorations[i] && myDecorations[i].hash === selectedHash) return myDecorations[i];
    }
    for (i = 0; i < presets.length; i++) {
        var decos = (presets[i] && presets[i].decorations) || [];
        for (j = 0; j < decos.length; j++) {
            if (decos[j] && decos[j].hash === selectedHash) return decos[j];
        }
    }
    return null;
}

function presetFor(decoration) {
    if (!decoration || !decoration.presetId) return null;
    for (var i = 0; i < presets.length; i++) {
        if (presets[i] && presets[i].id === decoration.presetId) return presets[i];
    }
    return null;
}

function currentAvatarUri() {
    var user = getCurrentUser();
    var resolver = findByProps("getUserAvatarURL") || findByProps("getUserAvatarURL", "getGuildMemberAvatarURL");
    try {
        if (resolver && user && typeof resolver.getUserAvatarURL === "function") {
            return resolver.getUserAvatarURL(user, true, 128);
        }
    } catch (_e) {}
    if (user && user.avatar) return "https://cdn.discordapp.com/avatars/" + user.id + "/" + user.avatar + ".png?size=128";
    return null;
}

function hapticTap() {
    var haptics = findByProps("triggerHapticFeedback");
    try {
        if (haptics && haptics.triggerHapticFeedback) haptics.triggerHapticFeedback(haptics.HapticFeedbackTypes && haptics.HapticFeedbackTypes.IMPACT_LIGHT);
    } catch (_e) {}
}

function getSafeTop() {
    var RN = getRN() || {};
    try {
        if (RN.StatusBar && typeof RN.StatusBar.currentHeight === "number") {
            return RN.StatusBar.currentHeight + 8;
        }
    } catch (_e) {}
    try {
        if (RN.Platform && RN.Platform.OS === "ios") return 54;
    } catch (_e2) {}
    return 28;
}

function screenHeight() {
    var RN = getRN() || {};
    try {
        var d = RN.Dimensions && RN.Dimensions.get && RN.Dimensions.get("window");
        if (d && d.height) return d.height;
    } catch (_e) {}
    return 720;
}

function screenSize() {
    var RN = getRN() || {};
    try {
        var d = RN.Dimensions && RN.Dimensions.get && RN.Dimensions.get("window");
        if (d && d.width && d.height) return { width: d.width, height: d.height };
    } catch (_e) {}
    return { width: 400, height: screenHeight() };
}

function asColorString(v) {
    if (typeof v === "string" && (v.charAt(0) === "#" || v.indexOf("rgb") === 0 || v.indexOf("hsl") === 0)) return v;
    if (v && typeof v === "object") {
        if (typeof v.hex === "string") return v.hex;
        if (typeof v.color === "string") return asColorString(v.color);
    }
    return null;
}

function themeColors() {
    var fb = {
        bg: "#313338",
        bgSecondary: "#2b2d31",
        bgFloating: "#1e1f22",
        text: "#dbdee1",
        muted: "#949ba4",
        header: "#f2f3f5",
        link: "#00a8fc",
        border: "#3f4147",
        brand: "#5865F2"
    };
    try {
        var ThemeStore = findByStoreName("ThemeStore") || findByProps("theme");
        var theme = ThemeStore && ThemeStore.theme;
        var colorMod = findByProps("colors", "meta")
            || findByProps("colors", "unsafe_rawColors")
            || findByProps("SemanticColor");
        var root = colorMod && (colorMod.default || colorMod);
        var map = (root && (root.colors || root.SemanticColor))
            || (findByProps("ThemeColorMap") && findByProps("ThemeColorMap").ThemeColorMap);
        var meta = root && (root.meta || root.internal);
        var resolver = meta && meta.resolveSemanticColor;
        function resolve(keys, fallback) {
            if (!map) return fallback;
            for (var i = 0; i < keys.length; i++) {
                var sym = map[keys[i]];
                if (sym == null) continue;
                var hex = asColorString(sym);
                if (hex) return hex;
                if (typeof resolver === "function") {
                    try {
                        hex = asColorString(resolver(theme, sym)) || asColorString(resolver(sym));
                        if (hex) return hex;
                    } catch (_e) {}
                }
            }
            return fallback;
        }
        return {
            bg: resolve(["BACKGROUND_PRIMARY", "BG_BASE_PRIMARY", "BACKGROUND_BASE_LOW"], fb.bg),
            bgSecondary: resolve(["BACKGROUND_SECONDARY", "BG_BASE_SECONDARY"], fb.bgSecondary),
            bgFloating: resolve(["BACKGROUND_FLOATING", "BG_SURFACE_OVERLAY", "BACKGROUND_NESTED_FLOATING"], fb.bgFloating),
            text: resolve(["TEXT_NORMAL", "TEXT_PRIMARY", "HEADER_PRIMARY"], fb.text),
            muted: resolve(["TEXT_MUTED", "TEXT_SECONDARY", "HEADER_SECONDARY"], fb.muted),
            header: resolve(["HEADER_PRIMARY", "TEXT_NORMAL"], fb.header),
            link: resolve(["TEXT_LINK", "TEXT_BRAND"], fb.link),
            border: resolve(["BACKGROUND_MODIFIER_ACCENT", "BORDER_SUBTLE", "BACKGROUND_TERTIARY"], fb.border),
            brand: resolve(["BUTTON_OUTLINE_BRAND_BORDER_ACTIVE", "BRAND_500", "CONTROL_BRAND_FOREGROUND"], fb.brand)
        };
    } catch (_e2) {
        return fb;
    }
}

var overlayTab = { title: null, Page: null };
var overlayTabListeners = [];

function notifyOverlayTab() {
    for (var i = 0; i < overlayTabListeners.length; i++) {
        try { overlayTabListeners[i](); } catch (_e) {}
    }
}

function openDecorTab(title, Page) {
    try { hideSheet(); nativeClose = r.open('screen', function NativeDecorPage({close}) { const U = ui(r); return h(U.Page, {title,close}, h(r.RN.View, {style:{minHeight:480}}, h(Page))); }); return true; }
    catch(error) { r.error('Open Decor', error); return false; }
}

function closeDecorScreen() {
    overlayTab = { title: null, Page: null };
    notifyOverlayTab();
    hideSheet();
}

function DecorOverlayHost() { return null; }

function DecorScreenShell(props) {
    var RN = getRN() || {};
    var View = RN.View;
    var Text = RN.Text;
    var Pressable = RN.Pressable || RN.TouchableOpacity;
    if (!View) return null;
    var Page = props.page;
    var top = getSafeTop();
    var t = themeColors();
    var sz = screenSize();
    var comps = (getMod().metro && getMod().metro.common && getMod().metro.common.components) || {};
    var DText = comps.Text;
    var Touchable = RN.TouchableOpacity || Pressable;
    function titleEl() {
        if (DText) return h(DText, { variant: "heading-lg/semibold", color: "header-primary", style: { flex: 1, textAlign: "center", pointerEvents: "none" } }, props.title || "");
        return Text ? h(Text, { style: { color: t.header, fontSize: 16, fontWeight: "700", flex: 1, textAlign: "center" }, pointerEvents: "none" }, props.title || "") : null;
    }
    var closeLabel = Text ? h(Text, { style: { color: t.link, fontSize: 16, fontWeight: "600" } }, "Close") : "Close";
    var header = h(View, {
        style: {
            height: 52,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 4,
            borderBottomWidth: 1,
            borderBottomColor: t.border,
            backgroundColor: t.bg,
            zIndex: 30,
            elevation: 30
        }
    },
        Touchable ? h(Touchable, {
            onPress: function () { closeDecorScreen(); },
            accessibilityRole: "button",
            accessibilityLabel: "Close",
            hitSlop: { top: 16, bottom: 16, left: 16, right: 16 },
            style: { minWidth: 72, height: 44, paddingHorizontal: 12, justifyContent: "center", zIndex: 40, elevation: 40 }
        }, closeLabel) : null,
        titleEl()
    );
    var body = Page ? h(Page, null) : null;
    return h(View, {
        style: {
            flex: 1,
            width: sz.width,
            height: sz.height,
            minHeight: sz.height,
            backgroundColor: t.bg,
            paddingTop: top
        }
    }, header, h(View, { style: { flex: 1, backgroundColor: t.bg } }, body));
}

function forceOpenSheet(title, render) {
    return openDecorTab(title, render);
}

function openCustomPage(title, render) { return openDecorTab(title, render); }

function assetSource(names) {
    var list = Array.isArray(names) ? names : [names];
    for (var i = 0; i < list.length; i++) {
        var id = findAssetId(list[i]);
        if (typeof id === "number") return id;
        if (id && typeof id === "object") return id;
    }
    return null;
}

function DecorCard(props) {
    var RN = getRN() || {};
    var View = RN.View;
    var Touchable = RN.TouchableOpacity || RN.Pressable;
    var Image = RN.Image;
    if (!View || !Touchable) return null;
    var selected = !!props.selected;
    var disabled = !!props.disabled;
    var inner = props.children;
    if (!inner && Image && props.uri) {
        inner = h(Image, { source: { uri: props.uri }, style: { width: 72, height: 72 }, resizeMode: "contain" });
    }
    return h(View, {
        style: { width: 72, height: 72 }
    }, h(Touchable, {
        onPress: disabled ? undefined : function () {
            hapticTap();
            if (props.onPress) props.onPress();
        },
        onLongPress: disabled ? undefined : props.onLongPress,
        disabled: disabled,
        activeOpacity: 0.75
    }, h(View, {
        style: {
            width: 72,
            height: 72,
            borderRadius: 4,
            backgroundColor: themeColors().bgSecondary,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderWidth: selected ? 2 : 0,
            borderColor: themeColors().brand,
            opacity: disabled ? 0.5 : 1
        }
    }, inner)));
}

function HorizontalTiles(nodes) {
    var React = getReact();
    var RN = getRN() || {};
    var View = RN.View;
    var ScrollView = RN.ScrollView;
    if (!View || !nodes || !nodes.length) return null;
    var slots = [];
    for (var i = 0; i < nodes.length; i++) {
        if (!nodes[i]) continue;
        slots.push(h(View, {
            key: (nodes[i].key != null ? nodes[i].key : String(i)),
            style: { width: 72, height: 72, marginRight: 8 }
        }, nodes[i]));
    }
    if (ScrollView) {
        return React.createElement.apply(React, [ScrollView, {
            horizontal: true,
            showsHorizontalScrollIndicator: false,
            nestedScrollEnabled: true,
            style: { height: 88, width: "100%", flexGrow: 0, flexShrink: 0 },
            contentContainerStyle: { paddingHorizontal: 12, paddingVertical: 8, alignItems: "center" }
        }].concat(slots));
    }
    return React.createElement.apply(React, [View, {
        style: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, minHeight: 88 }
    }].concat(slots));
}

function CardButton(props) {
    var RN = getRN() || {};
    var View = RN.View;
    var Text = RN.Text;
    var Image = RN.Image;
    var inner = [];
    var src = props.source;
    if (Image && src != null) {
        inner.push(h(Image, { key: "icon", source: src, style: { width: 22, height: 22, marginBottom: 4, tintColor: themeColors().text } }));
    }
    if (Text) {
        inner.push(h(Text, {
            key: "label",
            numberOfLines: 1,
            style: { color: themeColors().text, fontSize: 11, fontWeight: "600" }
        }, props.label || ""));
    }
    return h(DecorCard, {
        selected: props.selected,
        disabled: props.disabled,
        onPress: props.onPress
    }, h(View, { style: { alignItems: "center", justifyContent: "center", paddingHorizontal: 4 } }, inner));
}

function DecorationTile(props) {
    var RN = getRN() || {};
    var Image = RN.Image;
    var decoration = props.decoration;
    var selected = selectedHash === (decoration && decoration.hash);
    var uri = decoImageUri(decoration);
    var img = (Image && uri) ? h(Image, {
        source: { uri: uri },
        style: { width: 72, height: 72 },
        resizeMode: "contain"
    }) : null;
    return h(DecorCard, {
        selected: selected,
        disabled: props.disabled,
        onPress: function () {
            selectDecoration(selected ? null : decoration).then(function () {
                if (props.onChanged) props.onChanged();
            });
        },
        onLongPress: function () {
            showToast((decoration && (decoration.alt || decoration.hash)) || "Decoration");
        }
    }, img);
}

function AvatarDecorationPreviews(props) {
    var RN = getRN() || {};
    var View = RN.View;
    var Image = RN.Image;
    if (!View) return null;
    var decoration = props.pendingAvatarDecoration;
    var decoUri = null;
    if (decoration) {
        if (decoration.asset && /^(file|content|ph|data):/i.test(String(decoration.asset))) decoUri = decoration.asset;
        else decoUri = getDecorAvatarDecorationURL(decoration, true) || decoImageUri(decoration);
    }
    var avatarUri = currentAvatarUri();
    var Avatar = null;
    var comps = (getMod().metro && getMod().metro.common && getMod().metro.common.components) || {};
    if (comps.Avatar) Avatar = comps.Avatar;
    var avatarEl = null;
    if (Avatar) {
        avatarEl = h(Avatar, { user: getCurrentUser(), size: "large", __mimeDecorPreview: true, style: { transform: [{ scale: 3 }] } });
    } else if (Image && avatarUri) {
        avatarEl = h(Image, {
            source: { uri: avatarUri },
            style: { width: 80, height: 80, borderRadius: 40 }
        });
    }
    return h(View, {
        style: { flexDirection: "row", width: "100%", justifyContent: "center", alignItems: "center", paddingHorizontal: 16, paddingTop: 16 }
    }, h(View, {
        style: {
            width: 208,
            height: 208,
            borderRadius: 4,
            backgroundColor: themeColors().bgFloating,
            alignItems: "center",
            justifyContent: "center"
        }
    }, avatarEl, decoUri && Image ? h(Image, {
        source: { uri: decoUri },
        style: { position: "absolute", width: 180, height: 180 }
    }) : null));
}

function DecorationPicker(props) {
    var React = getReact();
    var RN = getRN() || {};
    var View = RN.View;
    var Text = RN.Text;
    var Pressable = RN.Pressable || RN.TouchableOpacity;
    var FlatList = RN.FlatList;
    var ScrollView = RN.ScrollView;
    var ActivityIndicator = RN.ActivityIndicator;
    if (!React || !View) return null;
    var [, bump] = React.useState(0);
    function refresh() { bump(function (n) { return n + 1; }); }
    React.useEffect(function () {
        var unsub = subscribeSelection(refresh);
        loadPresets().then(refresh);
        if (getToken()) refreshMine().then(refresh);
        return unsub;
    }, []);
    var authorized = !!getToken();
    var selected = getSelectedDecoration();
    var selectedAvatar = selected ? decorationToAvatar(selected) : null;
    var decorPreset = presetFor(selected);
    var own = [];
    var i;
    for (i = 0; i < myDecorations.length; i++) {
        if (myDecorations[i] && (myDecorations[i].presetId == null)) own.push(myDecorations[i]);
    }
    if (!own.length) own = myDecorations.slice();
    if (selected && selected.hash) {
        var inOwn = false;
        for (i = 0; i < own.length; i++) {
            if (own[i] && own[i].hash === selected.hash) { inOwn = true; break; }
        }
        if (!inOwn) own = [selected].concat(own);
    }
    var hasPending = myDecorations.some(function (d) { return d && d.reviewed === false; });
    var disabled = !authorized;
    var TextStyleSheet = (findByProps("TextStyleSheet") || {}).TextStyleSheet || {};
    var Parser = findByProps("parse", "parseToAST");
    var showUserProfile = (findByProps("showUserProfile") || {}).showUserProfile;
    var UserUtils = findByProps("getUser", "fetchCurrentUser");
    var t = themeColors();
    var titleStyle = TextStyleSheet["text-lg/semibold"] || { color: t.text, fontSize: 18, fontWeight: "600" };
    var mutedStyle = TextStyleSheet.eyebrow || { color: t.muted, fontSize: 12, textTransform: "uppercase" };
    var bodyStyle = TextStyleSheet["text-md/normal"] || { color: t.text, fontSize: 14 };

    var meta = null;
    if (selected && Text) {
        var created = ["Created by "];
        if (selected.authorId && Pressable) {
            created.push(h(Pressable, {
                key: "author",
                onPress: function () {
                    var uid = selected.authorId;
                    try {
                        if (showUserProfile) showUserProfile({ userId: uid });
                        else if (UserUtils && UserUtils.getUser) UserUtils.getUser(uid);
                    } catch (_e) {}
                }
            }, Parser && Parser.parse ? Parser.parse("<@" + selected.authorId + ">", true) : ("@" + selected.authorId)));
        }
        meta = h(View, { style: { marginTop: 12, paddingHorizontal: 16 } },
            h(Text, { style: titleStyle }, selected.alt || selected.hash),
            decorPreset ? h(Text, { style: [mutedStyle, { marginTop: 4 }] }, "Part of the " + decorPreset.name + " Preset") : null,
            h(Text, { style: [bodyStyle, { marginTop: 4 }] }, created)
        );
    }

    var tiles = [];
    tiles.push(h(CardButton, {
        key: "none",
        source: assetSource(["img_none", "ic_close_circle", "CircleXIcon", "ic_close_16px"]),
        label: "None",
        selected: !selected,
        disabled: disabled,
        onPress: function () { selectDecoration(null).then(refresh); }
    }));
    if (selected) {
        tiles.push(h(DecorationTile, {
            key: selected.hash,
            decoration: selected,
            disabled: disabled,
            onChanged: refresh
        }));
    }
    tiles.push(h(CardButton, {
        key: "custom",
        source: assetSource(["ic_image", "ImageIcon", "ic_image_24px", "ic_gallery_24px"]),
        label: "Custom",
        selected: !!(selected && (selected.presetId == null || selected.presetId === undefined)),
        disabled: false,
        onPress: function () {
            if (!forceOpenSheet("Custom", CustomPage)) openCustomPage("Custom", CustomPage);
        }
    }));
    tiles.push(h(CardButton, {
        key: "presets",
        source: assetSource(["smile", "ReactionIcon", "ic_reaction_smile", "ic_emoji_24px"]),
        label: "Presets",
        selected: !!(selected && selected.presetId),
        disabled: disabled,
        onPress: function () {
            if (!forceOpenSheet("Presets", PresetsPage)) openCustomPage("Presets", PresetsPage);
        }
    }));
    var list = HorizontalTiles(tiles);

    var headerIcon = null;
    if (!authorized && ActivityIndicator) headerIcon = null;
    var FormTitle = ((getMod().metro && getMod().metro.common && getMod().metro.common.components && getMod().metro.common.components.FormTitle)
        || (findByProps("FormTitle") && findByProps("FormTitle").FormTitle));
    var titleRow = FormTitle
        ? h(FormTitle, { title: "Decorations" })
        : (Text ? h(Text, { style: { color: t.muted, fontSize: 12, fontWeight: "700", letterSpacing: 0.5, paddingHorizontal: 16, paddingTop: 8 } }, "DECORATIONS") : null);

    return h(View, { __mimeDecor: true, style: { gap: 0 } },
        h(AvatarDecorationPreviews, { pendingAvatarDecoration: selectedAvatar }),
        meta,
        titleRow,
        list,
        h(DecorOverlayHost, { key: "overlay-host" })
    );
}

function PresetsPage() {
    var React = getReact();
    var RN = getRN() || {};
    var View = RN.View;
    var Text = RN.Text;
    var ScrollView = RN.ScrollView;
    if (!React || !View) return null;
    var t = themeColors();
    var state = React.useState(presets.slice ? presets.slice() : []);
    var list = state[0] || [];
    var setList = state[1];
    var [, bump] = React.useState(0);
    React.useEffect(function () {
        var unsub = subscribeSelection(function () { bump(function (n) { return n + 1; }); });
        loadPresets().then(function (p) { setList(p || []); });
        return unsub;
    }, []);
    var rows = [];
    var i;
    if (!list.length && Text) {
        rows.push(h(Text, {
            key: "empty",
            style: { color: t.muted, padding: 16 }
        }, "Loading presets…"));
    }
    for (i = 0; i < list.length; i++) {
        var preset = list[i];
        if (!preset) continue;
        var decos = preset.decorations || preset.items || [];
        var cards = [];
        for (var j = 0; j < decos.length; j++) {
            if (!decos[j] || !decos[j].hash) continue;
            cards.push(h(DecorationTile, {
                key: decos[j].hash,
                decoration: decos[j],
                onChanged: function () {
                    notifySelection();
                    schedule(closeDecorScreen, 50);
                }
            }));
        }
        rows.push(h(View, { key: preset.id || String(i), style: { marginBottom: 20 } },
            Text ? h(Text, { style: { color: t.text, fontSize: 16, fontWeight: "600", paddingHorizontal: 16, paddingBottom: 4 } }, preset.name || "Preset") : null,
            (preset.description && Text) ? h(Text, { style: { color: t.muted, fontSize: 13, paddingHorizontal: 16, paddingBottom: 8 } }, preset.description) : null,
            cards.length ? HorizontalTiles(cards) : (Text ? h(Text, { style: { color: t.muted, paddingHorizontal: 16 } }, "No decorations in this preset") : null)
        ));
    }
    if (ScrollView) {
        return h(ScrollView, {
            style: { flex: 1, backgroundColor: t.bg },
            contentContainerStyle: { paddingTop: 8, paddingBottom: 40 }
        }, rows);
    }
    return h(View, { style: { flex: 1, backgroundColor: t.bg, paddingTop: 8 } }, rows);
}

function personalDecorations() {
    var out = [];
    for (var i = 0; i < myDecorations.length; i++) {
        if (myDecorations[i] && (myDecorations[i].presetId == null || myDecorations[i].presetId === undefined)) {
            out.push(myDecorations[i]);
        }
    }
    return out;
}

function CustomPage() {
    var React = getReact();
    var RN = getRN() || {};
    var View = RN.View;
    var Text = RN.Text;
    var ScrollView = RN.ScrollView;
    if (!React || !View) return null;
    var t = themeColors();
    var [, bump] = React.useState(0);
    React.useEffect(function () {
        var unsub = subscribeSelection(function () { bump(function (n) { return n + 1; }); });
        if (getToken()) refreshMine().then(function () { bump(function (n) { return n + 1; }); });
        return unsub;
    }, []);
    var mine = personalDecorations();
    var cards = [];
    for (var i = 0; i < mine.length; i++) {
        cards.push(h(DecorationTile, {
            key: mine[i].hash,
            decoration: mine[i],
            onChanged: function () {
                notifySelection();
                schedule(closeDecorScreen, 50);
            }
        }));
    }
    var inner = [];
    inner.push(Text ? h(Text, {
        key: "title",
        style: { color: t.text, fontSize: 16, fontWeight: "600", paddingHorizontal: 16, paddingBottom: 8 }
    }, "Your decorations") : null);
    inner.push(Text ? h(Text, {
        key: "sub",
        style: { color: t.muted, fontSize: 13, paddingHorizontal: 16, paddingBottom: 12 }
    }, mine.length ? "Tap one to equip it." : "Nothing here yet.") : null);
    if (cards.length) inner.push(h(View, { key: "grid", style: { paddingBottom: 16 } }, HorizontalTiles(cards)));
    if (ScrollView) {
        return h(ScrollView, {
            style: { flex: 1, backgroundColor: t.bg },
            contentContainerStyle: { paddingTop: 8, paddingBottom: 40 }
        }, inner);
    }
    return h(View, { style: { flex: 1, backgroundColor: t.bg, paddingTop: 8 } }, inner);
}

function normalizePickedImage(ret) {
    if (!ret || ret.didCancel || ret.cancelled || ret.error) return null;
    var a = (ret.assets && ret.assets[0]) || ret;
    var uri = a.uri || a.path || a.fileCopyUri || a.filePath;
    if (!uri && typeof ret === "string") uri = ret;
    var type = a.type || a.mimeType || "image/png";
    if (String(type).indexOf("/") < 0) type = "image/png";
    var b64 = a.base64 || a.data;
    if (b64) {
        b64 = String(b64).replace(/\s/g, "");
        uri = "data:" + type + ";base64," + b64;
    }
    if (!uri) return null;
    if (uri.indexOf("/") === 0 && uri.indexOf("file:") !== 0 && uri.indexOf("data:") !== 0) uri = "file://" + uri;
    return {
        uri: uri,
        type: type,
        fileName: a.fileName || a.name || "decoration.png",
        base64: b64 || null
    };
}

function pickImage(cb) {
    var opts = { mediaType: "photo", selectionLimit: 1, includeBase64: true, presentationStyle: "overFullScreen", includeExtra: true };
    function done(ret) {
        if (stopped || !r.active) return;
        var n = normalizePickedImage(ret);
        if (n) {
            createDraft.asset = n;
            cb(n);
            schedule(function () {
                try { openDecorTab("Create", CreateDecorationPage); } catch (_e) {}
            }, 300);
        } else if (ret && !ret.didCancel && !ret.cancelled) showToast("Could not read that image");
    }
    var lib = findByProps("launchImageLibrary", "launchCamera") || findByProps("launchImageLibrary");
    if (lib && typeof lib.launchImageLibrary === "function") {
        try { lib.launchImageLibrary(opts, done); return true; } catch (_e) {}
    }
    var RN = getRN() || {};
    var NM = RN.NativeModules || {};
    var mgr = NM.ImagePickerManager || NM.RNCImagePicker || NM.RNImagePicker || NM.NativeImagePicker;
    if (mgr) {
        try {
            if (typeof mgr.launchImageLibrary === "function") { mgr.launchImageLibrary(opts, done); return true; }
            if (typeof mgr.showImagePicker === "function") { mgr.showImagePicker(opts, done); return true; }
        } catch (_e2) {}
    }
    var doc = findByProps("pickFile") || findByProps("pick", "types") || findByProps("getDocumentAsync");
    if (doc) {
        try {
            if (typeof doc.pickFile === "function") {
                Promise.resolve(doc.pickFile({ type: "image/*" })).then(done).catch(function () {});
                return true;
            }
            if (typeof doc.pick === "function") {
                Promise.resolve(doc.pick({ type: ["image/*", "image/png"] })).then(done).catch(function () {});
                return true;
            }
            if (typeof doc.getDocumentAsync === "function") {
                Promise.resolve(doc.getDocumentAsync({ type: "image/*" })).then(done).catch(function () {});
                return true;
            }
        } catch (_e3) {}
    }
    showToast("No image picker on this Discord build");
    return false;
}

function altText(v) {
    if (v == null) return "";
    if (typeof v === "string") return v.trim();
    if (typeof v === "number") return String(v);
    if (typeof v === "object") {
        if (typeof v.text === "string") return v.text.trim();
        if (v.nativeEvent && typeof v.nativeEvent.text === "string") return v.nativeEvent.text.trim();
    }
    return "";
}

function withTimeout(promise, ms, msg) {
    return new Promise(function (resolve, reject) {
        var settled = false;
        function finish(error, value) {
            if (settled) return;
            settled = true; clearTimeout(timer);
            uploadAborters.delete(abort);
            r.context.signal.removeEventListener('abort', abort);
            if (error) reject(error); else resolve(value);
        }
        function abort() { finish(new Error('Plugin stopped')); }
        var timer = setTimeout(function () {
            finish(new Error(msg || "timed out"));
        }, ms);
        uploadAborters.add(abort);
        r.context.signal.addEventListener('abort', abort, { once: true });
        if (stopped || !r.active) abort();
        Promise.resolve(promise).then(v => finish(null, v), error => finish(error));
    });
}

function readFileBase64(uri) {
    var RN = getRN() || {};
    var NM = RN.NativeModules || {};
    var fm = NM.DCDFileManager || NM.RTNFileManager || NM.FileManager;
    if (!fm || typeof fm.readFile !== "function") return Promise.reject(new Error("no file reader"));
    var path = String(uri || "");
    if (path.indexOf("file://") === 0) path = path.slice(7);
    try {
        var result = fm.readFile(path, "base64");
        if (result && typeof result.then === "function") return result;
    } catch (_e) {}
    return new Promise(function (resolve, reject) {
        try {
            fm.readFile(path, "base64", function (err, data) {
                if (err) reject(err);
                else resolve(data);
            });
        } catch (e) {
            reject(e);
        }
    });
}

function xhrPutForm(url, form) {
    return new Promise((resolve, reject) => {
        if (!r.active) return reject(new Error('Plugin stopped'));
        if (typeof XMLHttpRequest !== 'function') return reject(new Error('Native upload transport unavailable'));
        const xhr = new XMLHttpRequest(); let settled = false, timer;
        const finish = (error, value) => { if (settled) return; settled = true; clearTimeout(timer); uploadAborters.delete(abort); r.context.signal?.removeEventListener('abort', abort); error ? reject(error) : resolve(value); };
        const abort = () => { finish(new Error(r.active ? 'Upload timed out or cancelled. Refresh Custom before retrying.' : 'Plugin stopped')); xhr.abort(); };
        r.context.signal?.addEventListener('abort', abort, {once:true}); uploadAborters.add(abort);
        timer = setTimeout(abort, 60000);
        xhr.open('PUT', url); xhr.setRequestHeader('Authorization', 'Bearer ' + getToken()); xhr.timeout = 60000;
        xhr.onload = () => { if (xhr.status === 401) setToken(null); if (xhr.status < 200 || xhr.status >= 300) return finish(new Error('Decor upload failed (HTTP ' + xhr.status + ')')); try { finish(null, JSON.parse(xhr.responseText)); } catch { finish(new Error('Decor returned an invalid upload response')); } };
        xhr.onerror = () => finish(new Error('Upload connection failed. Refresh Custom before retrying.'));
        xhr.ontimeout = abort; xhr.onabort = () => finish(new Error('Upload cancelled'));
        try { xhr.send(form); } catch(error) { finish(error); }
    });
}

function decodeBase64(b64) {
    b64 = String(b64 || "").replace(/[^A-Za-z0-9+/=]/g, "");
    if (!b64) return new Uint8Array(0);
    if (typeof atob === "function") {
        var bin = atob(b64);
        var bytes = new Uint8Array(bin.length);
        var i;
        for (i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) & 255;
        return bytes;
    }
    var table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var outLen = Math.floor(b64.length * 3 / 4);
    if (b64.charAt(b64.length - 1) === "=") outLen--;
    if (b64.charAt(b64.length - 2) === "=") outLen--;
    var out = new Uint8Array(outLen);
    var o = 0;
    var j;
    for (j = 0; j < b64.length; j += 4) {
        var n = (Math.max(table.indexOf(b64.charAt(j)), 0) << 18)
            | (Math.max(table.indexOf(b64.charAt(j + 1)), 0) << 12)
            | (Math.max(table.indexOf(b64.charAt(j + 2)), 0) << 6)
            | Math.max(table.indexOf(b64.charAt(j + 3)), 0);
        if (o < outLen) out[o++] = (n >> 16) & 255;
        if (o < outLen) out[o++] = (n >> 8) & 255;
        if (o < outLen) out[o++] = n & 255;
    }
    return out;
}

function encodeUtf8(str) {
    if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(String(str));
    var s = String(str);
    var out = [];
    var i;
    for (i = 0; i < s.length; i++) {
        var c = s.charCodeAt(i);
        if (c < 128) out.push(c);
        else if (c < 2048) out.push(192 | (c >> 6), 128 | (c & 63));
        else out.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63));
    }
    return new Uint8Array(out);
}

function concatBytes(parts) {
    var len = 0;
    var i;
    for (i = 0; i < parts.length; i++) len += parts[i].length;
    var out = new Uint8Array(len);
    var o = 0;
    for (i = 0; i < parts.length; i++) {
        out.set(parts[i], o);
        o += parts[i].length;
    }
    return out;
}

function getAssetBase64(asset) {
    if (asset && asset.base64) return Promise.resolve(String(asset.base64).replace(/\s/g, ""));
    var uri = asset && asset.uri;
    if (uri && String(uri).indexOf("data:") === 0) {
        var idx = String(uri).indexOf("base64,");
        if (idx >= 0) return Promise.resolve(String(uri).slice(idx + 7).replace(/\s/g, ""));
    }
    if (uri && (String(uri).indexOf("file:") === 0 || String(uri).indexOf("/") === 0)) {
        return withTimeout(readFileBase64(uri), 4000, "could not read file");
    }
    return Promise.reject(new Error("no image data — pick the PNG again"));
}

async function createDecorationUpload(asset, alt) {
    const name = altText(alt);
    if (!asset || !name) throw new Error('Select an image and enter a name');
    if (!getToken()) throw new Error('Authorize with Decor first');
    const image = toPng(await getAssetBase64(asset));
    const form = new FormData();
    // Same endpoint and image/alt fields as Equicord Decor; RN needs a URI file object.
    form.append('image', { uri: image.uri, type: image.type, name: image.name });
    form.append('alt', name);
    const created = await xhrPutForm(API_URL + '/users/@me/decoration', form);
    if (!created || typeof created.hash !== 'string' || !created.hash) throw new Error('Decor did not confirm a saved decoration. Refresh Custom before retrying.');
    selectionEpoch++;
    myDecorations = myDecorations.filter(d => d.hash !== created.hash).concat([created]);
    notifySelection();
    return created;
}

function openCreateDecoration() {
    var pending = myDecorations.some(function (d) { return d && d.reviewed === false; });
    if (pending) {
        showToast("You already have a decoration pending review");
        return;
    }
    function go() {
        if (forceOpenSheet("Submit a Decoration", CreateDecorationPage)) return;
        if (openCustomPage("Submit a Decoration", CreateDecorationPage)) return;
        showToast("Could not open the create screen");
    }
    if (!getToken()) {
        showToast("Authorizing…");
        ensureAuth().then(function (tok) {
            if (tok) go();
            else authorize();
        });
        return;
    }
    go();
}

function CreateDecorationPage() {
    const React = r.React, U = ui(r);
    const [asset, setAsset] = React.useState(createDraft.asset);
    const [alt, setAlt] = React.useState(createDraft.alt || '');
    const [busy, setBusy] = React.useState(false), [result, setResult] = React.useState('');
    const inFlight = React.useRef(false), mounted = React.useRef(true);
    React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
    async function submit() {
        if (inFlight.current) return; inFlight.current = true; setBusy(true); setResult('Converting and uploading…');
        try {
            const created = await createDecorationUpload(asset, alt);
            createDraft.asset = null; createDraft.alt = '';
            let message = 'Saved to Custom. Pending decorations may require review before others can see them.';
            try { await putDecoration(created); if (r.active) applySelectedLocally(created); message = 'Saved to Custom and equipped. May be pending review.'; }
            catch(error) { message = 'Saved to Custom, but could not equip: ' + error.message + '. Select it from Custom to retry.'; }
            if (mounted.current && r.active) { setResult(message); setAsset(null); setAlt(''); }
            showToast(message);
        } catch(error) { if (mounted.current && r.active) setResult(error.message); }
        finally { inFlight.current = false; if (mounted.current && r.active) setBusy(false); }
    }
    return h(r.RN.View, {style:{gap:12,padding:12}},
        h(U.Text, null, 'PNG/APNG are preserved. JPEG is converted locally to PNG. HEIC, GIF and WebP need external conversion. Up to 4 megapixels / 8 MB; the service may enforce a smaller limit.'),
        asset?.uri ? h(r.RN.Image,{source:{uri:asset.uri},style:{width:160,height:160},resizeMode:'contain'}) : null,
        h(U.Button, {text:asset ? 'Choose another image' : 'Choose image', disabled:busy,onPress:() => pickImage(picked => { createDraft.asset = picked; if(mounted.current) setAsset(picked); })}),
        h(U.Input, {label:'Decoration name',value:alt,editable:!busy,onChange:value => {createDraft.alt=value;setAlt(value);}}),
        h(U.Button,{text:busy?'Creating…':'Create decoration',disabled:busy||!asset||!alt.trim(),onPress:submit}),
        h(U.Text,null,result), h(U.Button,{text:'View Custom',variant:'secondary',disabled:busy,onPress:()=>openDecorTab('Custom',CustomPage)}));
}

function EditProfileDecorBlock() {
    var RN = getRN() || {};
    var View = RN.View;
    var Text = RN.Text;
    if (!View) return h(DecorationPicker, null);
    return h(View, { __mimeDecor: true, style: { marginBottom: 16, paddingBottom: 8 } },
        Text ? h(Text, { style: { color: themeColors().header, fontSize: 16, fontWeight: "600", paddingHorizontal: 16, paddingTop: 8 } }, "Avatar decoration") : null,
        h(DecorationPicker, null)
    );
}

function start() {
    stop();
    stopped = false;
    patchStores();
    subscribeFlux();
    patchEditProfile();
    loadConfig();
    loadPresets();
    var me = getCurrentUser();
    if (me) queueFetch(me.id, true);
    if (getToken()) refreshMine();
    log("started");
}

function stop() {
    stopped = true;
    for (const timer of uiTimers) clearTimeout(timer);
    uiTimers.clear();
    for(const abort of uploadAborters) abort(); uploadAborters.clear();
    hideSheet();
    if (bulkTimer) {
        try { clearTimeout(bulkTimer); } catch (_e) {}
        bulkTimer = null;
    }
    for (var i = 0; i < unpatches.length; i++) {
        try { if (typeof unpatches[i] === "function") unpatches[i](); } catch (_e2) {}
    }
    unpatches = [];
}

function SettingsComponent() {
    r.useRefresh();
    var React = getReact();
    if (!React) return null;
    var RN = getRN() || {};
    var View = RN.View;
    var Text = RN.Text;
    var ScrollView = RN.ScrollView;
    var comps = (getMod().metro && getMod().metro.common && getMod().metro.common.components) || {};
    var Button = comps.Button;
    var TextInput = comps.TextInput;
    var [, bump] = React.useState(0);
    React.useEffect(function () {
        loadPresets().then(function () { bump(function (n) { return n + 1; }); });
        if (getToken()) refreshMine().then(function () { bump(function (n) { return n + 1; }); });
    }, []);
    function refresh() { bump(function (n) { return n + 1; }); }
    var authorized = !!getToken();
    var children = [];
    children.push(h(DecorationPicker, { key: "picker" }));
    if (Text) {
        children.push(h(Text, {
            key: "status",
            style: { color: themeColors().text, marginTop: 16, marginBottom: 8, paddingHorizontal: 12 }
        }, authorized ? "Authorized with Decor." : "Authorize to equip decorations. Uses your Discord login."));
    }
    if (Button) {
        children.push(h(View, { key: "authwrap", style: { paddingHorizontal: 12, marginTop: 8, marginBottom: 8 } }, h(Button, {
            text: authorized ? "Re-authorize" : "Authorize with Decor",
            onPress: function () { authorize().then(() => { if (!stopped && r.active) refresh(); }); schedule(refresh, 2000); }
        })));
        if (authorized) {
            children.push(h(View, { key: "logoutwrap", style: { paddingHorizontal: 12, marginBottom: 8 } }, h(Button, {
                text: "Log out",
                onPress: function () { setToken(null); refresh(); }
            })));
        }
        children.push(h(View, { key: "reloadwrap", style: { paddingHorizontal: 12, marginBottom: 8 } }, h(Button, {
            text: "Reload list",
            onPress: function () { refreshMine().then(refresh); }
        })));
    }
    if (TextInput) {
        children.push(h(TextInput, {
            key: "paste",
            label: "Token fallback (only if authorize fails)",
            value: getToken() || "", secureTextEntry: true, autoCapitalize: "none",
            onChange: function (v) { setToken(v); refresh(); }
        }));
    }
    var t = themeColors();
    var inner = View ? h(View, { style: { paddingBottom: 40, backgroundColor: t.bg } }, children) : children[0];
    if (ScrollView) return h(ScrollView, { style: { flex: 1, backgroundColor: t.bg } }, inner);
    return inner;
}


return { start, stop, Settings: SettingsComponent, CreateDecorationPage, getCustomDecorations: () => myDecorations, createDecorationUpload, normalizePickedImage, decorationToAsset, getStorage };
}
Decor.defaults = { tokens: {} };
