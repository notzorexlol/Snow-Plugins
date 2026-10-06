/*
Made with ❤️ by neoarz
Snow/Bunny port — original author kept; Mime | N0_.q3 added.
I am not responsible for any damage caused by this plugin; use at your own risk
Vencord does not endorse/support this plugin
https://github.com/neoarz/NitroSniper
Snow SDK: capture bunny during eval.
*/

var B = (typeof bunny !== "undefined" && bunny) || (typeof snow !== "undefined" && snow) || null;
var unpatches = [];
var startTime = 0;
var claiming = false;
var claimQueue = [];
var _storage;

var GIFT_LINK_REGEX = /(?:discord(?:app)?\.gift\/|discord(?:app)?\.com\/gifts?\/)([a-zA-Z0-9]{16,24})/i;
var SUCCESS_COLOR = 0x43b581;
var FAILURE_COLOR = 0xf04747;
var TEST_COLOR = 0x5865f2;
var WEBHOOK_NAME = "NitroSniper";

var SETTINGS_META = {
    ignoreOwnGiftLinks: {
        type: "boolean",
        description: "Do not redeem Nitro gift links from messages sent by you.",
        default: false
    },
    webhookUrl: {
        type: "string",
        description: "Discord webhook URL to notify after each redeem attempt. Leave empty to disable.",
        default: ""
    }
};

var HCAPTCHA_HEADERS: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Origin": "https://discord.com",
    "Referer": "https://discord.com/"
};

interface CaptchaChallenge {
    service: string;
    sitekey: string | null;
}

function captchaErrorInfo(error: any): CaptchaChallenge | null {
    var body = error && error.body ? error.body : {};
    if (body.captcha_required || body.captcha_service || body.captcha_sitekey) {
        return {
            service: body.captcha_service || "hcaptcha",
            sitekey: body.captcha_sitekey || body.captcha_site_key || null
        };
    }
    return null;
}

async function oneClickSolve(sitekey: string): Promise<string> {
    var probe = await fetch("https://hcaptcha.com/checksiteconfig?v=1&r=null&host=discord.com&sc=1&swa=1", { headers: HCAPTCHA_HEADERS });
    var config = await probe.json();
    if (!config || config.pass !== true) throw new Error("hCaptcha served a full challenge; one-click unavailable");
    var now = Date.now();
    var form = new URLSearchParams({
        v: "1",
        r: "null",
        host: "discord.com",
        sitekey: sitekey,
        hl: "en",
        motionData: JSON.stringify({
            st: now, dct: now,
            mm: [[now, 0, 0]],
            md: [[now, 0, 0]],
            mj: [[now, 0]],
            fst: now, ft: now,
            did: 0, v: 1
        })
    });
    if (config.c && config.c.req) form.set("n", config.c.req);
    var res = await fetch("https://hcaptcha.com/getcaptcha/" + encodeURIComponent(sitekey), {
        method: "POST",
        headers: HCAPTCHA_HEADERS,
        body: form.toString()
    });
    var data = await res.json();
    var token = (data && (data.generated_pass_UUID || (data.pass && data.pass.generated_pass_UUID))) || null;
    if (!token) {
        var why = data && data.error_code === "challenge" ? "full challenge served" : "unexpected getcaptcha response (" + ((data && data.error_code) || "no token") + ")";
        throw new Error("One-click captcha failed: " + why);
    }
    return token;
}

function getMod() {
    if (B && (B.metro || B.patcher || B.ui || B.api || B.plugin || B.flux)) return B;
    var list = [];
    try { if (typeof snow !== "undefined" && snow) list.push(snow); } catch (_e) {}
    try { if (typeof bunny !== "undefined" && bunny) list.push(bunny); } catch (_e2) {}
    var g = typeof globalThis !== "undefined" ? globalThis : {};
    if (g.snow) list.push(g.snow);
    if (g.bunny) list.push(g.bunny);
    if (g.vendetta) list.push(g.vendetta);
    function ok(m) {
        return m && ((m.api && (m.api.flux || m.api.patcher)) || m.plugin || m.metro);
    }
    var i;
    for (i = 0; i < list.length; i++) if (ok(list[i]) && list[i].api) return list[i];
    for (i = 0; i < list.length; i++) if (ok(list[i])) return list[i];
    return list[0] || {};
}

function metroRoots() {
    var roots = [];
    var mod = getMod();
    var g = typeof globalThis !== "undefined" ? globalThis : {};
    [mod.metro, mod.metro && mod.metro.common, g.vendetta && g.vendetta.metro].forEach(function (r) {
        if (r && roots.indexOf(r) < 0) roots.push(r);
    });
    return roots;
}

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
    return null;
}

function getReact() {
    var mod = getMod();
    return (mod.metro && mod.metro.common && mod.metro.common.React)
        || findByProps("createElement", "useState")
        || (typeof globalThis !== "undefined" && globalThis.React);
}

function getStorage() {
    if (_storage) return _storage;
    try {
        _storage = getMod().plugin.createStorage();
    } catch (_e) {
        _storage = {};
    }
    if (_storage.ignoreOwnGiftLinks === undefined) _storage.ignoreOwnGiftLinks = false;
    if (_storage.webhookUrl === undefined) _storage.webhookUrl = "";
    return _storage;
}

function getToken() {
    var auth = findByProps("getToken");
    return auth && typeof auth.getToken === "function" ? auth.getToken() : null;
}

function getCurrentUser() {
    var store = findByStoreName("UserStore") || findByProps("getCurrentUser", "getUser");
    return store && store.getCurrentUser ? store.getCurrentUser() : (getMod()._test && getMod()._test.currentUser);
}

function showToast(message, kind) {
    if (B && B.ui && typeof B.ui.showToast === "function") {
        try { B.ui.showToast(message); return; } catch (_e0) {}
    }
    var t = findByProps("showToast") || (getMod().ui && getMod().ui.toasts);
    if (t && t.showToast) {
        try { t.showToast(message); return; } catch (_e) {}
    }
    try { console.log("[NitroSniper toast]", kind || "info", message); } catch (_e2) {}
}

function log() {
    try { console.log.apply(console, ["[NitroSniper]"].concat([].slice.call(arguments))); } catch (_e) {}
}

function logError() {
    try { console.error.apply(console, ["[NitroSniper]"].concat([].slice.call(arguments))); } catch (_e) {}
}

function resetState() {
    startTime = Date.now();
    claimQueue.length = 0;
    claiming = false;
}

function toError(error) {
    return error instanceof Error ? error : new Error(String(error));
}

function extractGiftCode(content) {
    if (!content) return null;
    var m = String(content).match(GIFT_LINK_REGEX);
    return m ? m[1] : null;
}

function isOwnMessage(message) {
    var me = getCurrentUser();
    return !!(me && message && message.author && message.author.id === me.id);
}

function shouldSkipMessage(message) {
    return !!(getStorage().ignoreOwnGiftLinks && isOwnMessage(message));
}

function isMessageOlderThanStart(message) {
    if (!message || !message.timestamp) return false;
    var t = new Date(message.timestamp).getTime();
    return t < startTime;
}

function createClaimRequest(message) {
    var code = message && message.content ? extractGiftCode(message.content) : null;
    if (!code) return null;
    var authorId = message.author && message.author.id;
    var authorAvatar = message.author && message.author.avatar;
    return {
        code: code,
        authorId: authorId,
        authorName: (message.author && (message.author.globalName || message.author.username)) || undefined,
        authorUsername: message.author && message.author.username,
        authorAvatarUrl: authorId && authorAvatar
            ? "https://cdn.discordapp.com/avatars/" + authorId + "/" + authorAvatar + ".png?size=128"
            : undefined,
        channelId: message.channel_id,
        guildId: message.guild_id,
        messageId: message.id
    };
}

function parseWebhookUrl(webhookUrl) {
    var trimmed = String(webhookUrl || "").trim();
    if (!trimmed) return null;
    try {
        return new URL(trimmed);
    } catch (_e) {
        throw new Error("Webhook URL is invalid.");
    }
}

function escapeMarkdown(value) {
    return String(value).replace(/([\\`*_{}\[\]()#+.!|>~-])/g, "\\$1");
}

function buildUserProfileUrl(userId) {
    return userId ? "https://discord.com/users/" + userId : null;
}

function buildMessageUrl(request) {
    if (!request.channelId || !request.messageId) return null;
    return "https://discordapp.com/channels/" + (request.guildId || "@me") + "/" + request.channelId + "/" + request.messageId;
}

function buildClaimFields(request, giftType) {
    var fields = [];
    if (giftType) fields.push({ name: "Gift Type:", value: escapeMarkdown(giftType), inline: false });
    var label = request.authorName || request.authorUsername || request.authorId;
    if (label) {
        var profileUrl = buildUserProfileUrl(request.authorId);
        fields.push({
            name: "Code sent by:",
            value: profileUrl ? "[" + escapeMarkdown(label) + "](" + profileUrl + ")" : escapeMarkdown(label),
            inline: false
        });
    }
    var messageUrl = buildMessageUrl(request);
    if (messageUrl) fields.push({ name: "Message:", value: "[Posted here!](" + messageUrl + ")", inline: false });
    return fields;
}

function buildClaimWebhookPayload(result, request, giftType) {
    var claimed = result === "claimed";
    var authorName = request.authorName || request.authorUsername;
    return {
        username: WEBHOOK_NAME,
        allowed_mentions: { parse: [] },
        embeds: [{
            title: claimed ? "Yay! Claimed a Nitro!" : "Failed to claim nitro",
            color: claimed ? SUCCESS_COLOR : FAILURE_COLOR,
            fields: buildClaimFields(request, giftType),
            timestamp: new Date().toISOString(),
            author: authorName ? { name: authorName, icon_url: request.authorAvatarUrl } : undefined,
            footer: { text: WEBHOOK_NAME }
        }]
    };
}

function buildTestWebhookPayload() {
    return {
        username: WEBHOOK_NAME,
        allowed_mentions: { parse: [] },
        embeds: [{
            title: "NitroSniper Webhook Test",
            color: TEST_COLOR,
            description: "Your NitroSniper webhook is configured correctly.",
            timestamp: new Date().toISOString(),
            footer: { text: WEBHOOK_NAME }
        }]
    };
}

async function postWebhook(url, payload) {
    var u = new URL(url.toString());
    u.searchParams.set("wait", "true");
    var response = await fetch(u.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    var data = await response.text();
    if (response.status < 200 || response.status >= 300) {
        throw new Error("Webhook request failed with status " + response.status + (data ? ": " + data : "."));
    }
}

async function sendClaimWebhook(webhookUrl, result, request, giftType) {
    var url = parseWebhookUrl(webhookUrl);
    if (!url) return;
    await postWebhook(url, buildClaimWebhookPayload(result, request, giftType));
}

async function sendTestWebhook(webhookUrl) {
    var url = parseWebhookUrl(webhookUrl);
    if (!url) throw new Error("Webhook URL is empty.");
    await postWebhook(url, buildTestWebhookPayload());
}

async function resolveGiftType(code) {
    try {
        var token = getToken();
        if (!token || typeof fetch !== "function") return null;
        var res = await fetch("https://discord.com/api/v9/entitlements/gift-codes/" + encodeURIComponent(code) + "?with_application=false&with_subscription_plan=true", {
            headers: { Authorization: token }
        });
        if (!res.ok) return null;
        var body = await res.json();
        return (body.subscription_plan && body.subscription_plan.name)
            || (body.store_listing && body.store_listing.sku && body.store_listing.sku.name)
            || null;
    } catch (_e) {
        return null;
    }
}

function redeemViaActions(request, onOk, onErr) {
    var GiftActions = findByProps("redeemGiftCode");
    if (GiftActions && typeof GiftActions.redeemGiftCode === "function") {
        GiftActions.redeemGiftCode({
            code: request.code,
            onRedeemed: onOk,
            onError: onErr
        });
        return true;
    }
    return false;
}

async function postRedeem(request, captchaKey) {
    var token = getToken();
    if (!token) throw new Error("No auth token");
    var body = captchaKey
        ? { channel_id: request.channelId || null, captcha_key: captchaKey }
        : { channel_id: request.channelId || null };
    var res = await fetch("https://discord.com/api/v9/entitlements/gift-codes/" + encodeURIComponent(request.code) + "/redeem", {
        method: "POST",
        headers: {
            Authorization: token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    var text = await res.text();
    if (res.status < 200 || res.status >= 300) {
        var err = new Error("redeem " + res.status + (text ? ": " + text : ""));
        try { err.body = JSON.parse(text); } catch (_e) { err.body = {}; }
        throw err;
    }
}

function notifyClaim(result, request, giftType) {
    void sendClaimWebhook(getStorage().webhookUrl, result, request, giftType).catch(function (webhookError) {
        logError("Failed to send NitroSniper webhook notification", webhookError);
    });
}

function continueQueue() {
    claiming = false;
    processQueue();
}

function handleClaimSuccess(request, giftType) {
    log("Successfully redeemed code:", request.code);
    void Promise.resolve(giftType).then(function (type) { notifyClaim("claimed", request, type); });
    continueQueue();
}

function handleClaimFailure(request, error, giftType) {
    logError("Failed to redeem code:", request.code, error);
    void Promise.resolve(giftType).then(function (type) { notifyClaim("failed", request, type); });
    continueQueue();
}

function solveAndRetry(request, giftType, captchaError) {
    var info = captchaErrorInfo(captchaError);
    var resolveSitekey = info && info.sitekey
        ? Promise.resolve(info.sitekey)
        : postRedeem(request, null).then(function () {
            throw new Error("captcha solved itself on retry probe");
        }, function (probeError) {
            var probeInfo = captchaErrorInfo(probeError);
            if (!probeInfo || !probeInfo.sitekey) throw new Error("captcha sitekey unavailable");
            return probeInfo.sitekey;
        });
    resolveSitekey.then(function (sitekey) {
        log("captcha required for", request.code, "- attempting one-click solve");
        return oneClickSolve(sitekey);
    }).then(function (token) {
        return postRedeem(request, token);
    }).then(function () {
        handleClaimSuccess(request, giftType);
    }).catch(function (error) {
        handleClaimFailure(request, toError(error), giftType);
    });
}

function processQueue() {
    if (claiming) return;
    var request = claimQueue.shift();
    if (!request) return;
    claiming = true;
    var giftType = String(getStorage().webhookUrl || "").trim()
        ? resolveGiftType(request.code)
        : Promise.resolve(null);

    var usedActions = redeemViaActions(
        request,
        function () { handleClaimSuccess(request, giftType); },
        function (error) {
            var cap = captchaErrorInfo(error);
            if (cap) solveAndRetry(request, giftType, error);
            else handleClaimFailure(request, toError(error), giftType);
        }
    );
    if (usedActions) return;

    postRedeem(request, null).then(function () {
        handleClaimSuccess(request, giftType);
    }).catch(function (error) {
        var cap = captchaErrorInfo(error);
        if (cap) solveAndRetry(request, giftType, error);
        else handleClaimFailure(request, toError(error), giftType);
    });
}

function onMessageCreate(message) {
    if (!message || !message.content) return;
    if (shouldSkipMessage(message) || isMessageOlderThanStart(message)) return;
    var request = createClaimRequest(message);
    if (!request) return;
    log("queued gift", request.code);
    claimQueue.push(request);
    processQueue();
}

function fluxHandler(event) {
    try {
        if (!event) return;
        var type = event.type;
        var message = event.message;
        if (type === "MESSAGE_CREATE" || (!type && event.content && event.channel_id)) {
            onMessageCreate(message || event);
        }
    } catch (err) {
        logError("flux handler", err);
    }
}

function start() {
    stop();
    resetState();
    var mod = getMod();
    if (mod.api && mod.api.flux && typeof mod.api.flux.intercept === "function") {
        unpatches.push(mod.api.flux.intercept(fluxHandler));
        log("flux.intercept attached");
    }
    var FluxDispatcher = findByProps("subscribe", "unsubscribe", "dispatch")
        || findByProps("_interceptors");
    if (FluxDispatcher && typeof FluxDispatcher.subscribe === "function") {
        var sub = function (payload) { fluxHandler(payload); };
        FluxDispatcher.subscribe("MESSAGE_CREATE", sub);
        unpatches.push(function () {
            try { FluxDispatcher.unsubscribe("MESSAGE_CREATE", sub); } catch (_e) {}
        });
        log("FluxDispatcher.subscribe attached");
    }
    log("started");
}

function stop() {
    for (var i = 0; i < unpatches.length; i++) {
        try { if (typeof unpatches[i] === "function") unpatches[i](); } catch (_e) {}
    }
    unpatches = [];
    claimQueue.length = 0;
    claiming = false;
}

function SettingsComponent() {
    var React = getReact();
    if (!React) return null;
    var store = getStorage();
    var comps = (getMod().metro && getMod().metro.common && getMod().metro.common.components) || {};
    var TableSwitchRow = comps.TableSwitchRow;
    var TableRowGroup = comps.TableRowGroup;
    var TextInput = comps.TextInput;
    var Button = comps.Button || comps.LegacyButton;
    var [, bump] = React.useState(0);
    function refresh() { bump(function (n) { return n + 1; }); }

    var children = [];
    if (TableSwitchRow) {
        children.push(React.createElement(TableSwitchRow, {
            key: "ignoreOwn",
            label: "ignoreOwnGiftLinks",
            subLabel: SETTINGS_META.ignoreOwnGiftLinks.description,
            value: !!store.ignoreOwnGiftLinks,
            onValueChange: function (v) { store.ignoreOwnGiftLinks = v; refresh(); }
        }));
    }
    if (TextInput) {
        children.push(React.createElement(TextInput, {
            key: "webhook",
            label: "webhookUrl",
            placeholder: "https://discord.com/api/webhooks/...",
            value: store.webhookUrl || "",
            onChange: function (v) { store.webhookUrl = v; refresh(); }
        }));
    }
    if (Button) {
        children.push(React.createElement(Button, {
            key: "test",
            text: "Send Test Webhook",
            onPress: function () {
                sendTestWebhook(store.webhookUrl).then(function () {
                    showToast("Test webhook sent successfully.", "success");
                }).catch(function (err) {
                    showToast(err && err.message ? err.message : "Failed to send test webhook.", "failure");
                });
            }
        }));
    }
    if (TableRowGroup) return React.createElement(TableRowGroup, { title: "NitroSniper" }, children);
    var RN = findByProps("View", "Text");
    if (RN && RN.View) return React.createElement(RN.View, { style: { padding: 12 } }, children);
    return null;
}

const plugin = definePlugin({
    start: start,
    stop: stop,
    onLoad: start,
    onUnload: stop,
    SettingsComponent: SettingsComponent,
    settings: SettingsComponent,
    extractGiftCode: extractGiftCode,
    createClaimRequest: createClaimRequest,
    shouldSkipMessage: shouldSkipMessage,
    isMessageOlderThanStart: isMessageOlderThanStart,
    buildClaimWebhookPayload: buildClaimWebhookPayload,
    onMessageCreate: onMessageCreate,
    getStorage: getStorage,
    SETTINGS_META: SETTINGS_META,
    GIFT_LINK_REGEX: GIFT_LINK_REGEX
});
