var plugin = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // InstallLinks.entry.js
  var InstallLinks_entry_exports = {};
  __export(InstallLinks_entry_exports, {
    default: () => InstallLinks_entry_default
  });

  // project:src/runtime.js
  function createRuntime(B, meta, defaults = {}) {
    const React = B.React;
    const RN = B.ReactNative;
    if (!React?.createElement || !RN?.View) throw new Error(`${meta.name}: host React/React Native unavailable`);
    const D = B.metro?.common?.components || {};
    const C = B.ui?.components || D;
    const cleanups = [];
    const listeners = /* @__PURE__ */ new Set();
    const requests = /* @__PURE__ */ new Set();
    const openSheets = /* @__PURE__ */ new Map();
    const control = new AbortController();
    let active = true;
    const initial = JSON.parse(JSON.stringify(defaults));
    const store = B.plugin?.createStorage ? B.plugin.createStorage(initial) : initial;
    for (const [key, value] of Object.entries(initial)) if (store[key] === void 0) store[key] = value;
    const alerts = /* @__PURE__ */ new Set();
    const r = {
      B,
      meta,
      React,
      RN,
      C,
      D,
      h: React.createElement,
      store,
      metro: B.metro,
      common: B.metro?.common || {},
      host: B,
      context: { signal: control.signal },
      get active() {
        return active && !control.signal.aborted;
      },
      status: {},
      api: {
        commands: B.commands || B.api?.commands,
        flux: B.flux || B.api?.flux,
        patcher: B.patcher || B.api?.patcher,
        storage: {
          createStorage: () => store,
          get value() {
            return store;
          },
          flush: () => B.plugin?.flushStorage?.() || Promise.resolve()
        },
        ui: {
          ...B.ui,
          openAlert(id, element) {
            if (!r.active) return;
            alerts.add(id);
            return B.ui.openAlert(id, element);
          },
          dismissAlert(id) {
            alerts.delete(id);
            return B.ui.dismissAlert(id);
          }
        }
      },
      own(fn) {
        if (typeof fn === "function") cleanups.push(fn);
        return fn;
      },
      changed() {
        for (const fn of listeners) fn();
      },
      useRefresh() {
        B.plugin?.useProxy?.(store);
        const [, bump] = React.useState(0);
        React.useEffect(() => {
          if (!r.active) return;
          const fn = () => bump((n) => n + 1);
          listeners.add(fn);
          return () => listeners.delete(fn);
        }, []);
        return () => r.changed();
      },
      set(key, value) {
        if (!r.active) return;
        store[key] = value;
        r.changed();
        Promise.resolve(B.plugin?.flushStorage?.()).catch((e) => r.error("Save settings", e));
      },
      find(...props) {
        try {
          return B.metro.findByProps?.(...props);
        } catch {
          return void 0;
        }
      },
      byName(name, raw = false) {
        try {
          return B.metro.findByName?.(name, !raw) || B.metro.findByDisplayName?.(name, !raw);
        } catch {
          return void 0;
        }
      },
      byStore(name) {
        try {
          return B.metro.findByStoreName?.(name);
        } catch {
          return void 0;
        }
      },
      toast(message, icon) {
        if (!r.active) return;
        const text = String(message);
        const show = B.ui?.showToast || B.ui?.toasts?.showToast;
        if (typeof show !== "function") return;
        if (icon) {
          try {
            show(text, icon);
            return;
          } catch {
          }
          try {
            show({ content: text, icon });
            return;
          } catch {
          }
        }
        show(text);
      },
      error(label, error) {
        const text = `${label}: ${error?.message || error}`;
        console.error(`[${meta.name}]`, text);
        r.status.lastError = text;
        r.changed();
        r.toast(text);
      },
      patch(kind, parent, key, callback) {
        const patcher = r.api.patcher;
        if (typeof parent?.[key] !== "function" || typeof patcher?.[kind] !== "function") return false;
        r.own(patcher[kind](key, parent, callback));
        return true;
      },
      subscribe(type, callback) {
        const flux = r.api.flux;
        if (typeof flux?.subscribe !== "function") throw new Error(`${meta.name}: flux.subscribe unavailable`);
        return r.own(flux.subscribe(type, (payload) => {
          if (r.active) callback(payload);
        }));
      },
      channelId(ctx) {
        if (typeof ctx === "string" && /^\d{5,}$/.test(ctx)) return ctx;
        if (ctx && !Array.isArray(ctx)) {
          const id = ctx.channel?.id || ctx.channel?.channelId || ctx.channelId || ctx.channel_id;
          if (id) return id;
        }
        const selected = r.byStore("SelectedChannelStore");
        return selected?.getChannelId?.() || selected?.getCurrentlySelectedChannelId?.() || selected?.getLastSelectedChannelId?.() || null;
      },
      local(channelId, content) {
        if (!r.active) return false;
        const util = r.find("sendBotMessage");
        if (typeof util?.sendBotMessage === "function") {
          try {
            util.sendBotMessage(channelId, content);
            return true;
          } catch {
          }
        }
        r.toast(String(content));
        return false;
      },
      command(command) {
        const register2 = r.api.commands?.registerCommand;
        if (typeof register2 !== "function") throw new Error(`${meta.name}: commands.registerCommand unavailable`);
        const name = command.name;
        const execute = command.execute;
        const prepared = {
          ...command,
          name,
          options: (command.options || []).map((opt) => ({ ...opt })),
          async execute(args, ctx) {
            if (!r.active) return;
            try {
              const result = await execute(args, ctx);
              if (!r.active) return;
              return result;
            } catch (error) {
              if (r.active) r.error(`/${name}`, error);
            }
          }
        };
        return r.own(register2(prepared));
      },
      wait(ms) {
        if (!r.active) return Promise.reject(new Error("Plugin stopped"));
        return new Promise((resolve, reject) => {
          const finish = () => {
            clearTimeout(timer);
            control.signal.removeEventListener("abort", abort);
          };
          const abort = () => {
            finish();
            reject(new Error("Plugin stopped"));
          };
          const timer = setTimeout(() => {
            finish();
            resolve();
          }, ms);
          control.signal.addEventListener("abort", abort, { once: true });
        });
      },
      async request(url, options = {}, timeout = 15e3, maxBytes = Infinity) {
        if (!r.active) throw new Error("Plugin stopped");
        const controller = new AbortController();
        let rejectDeadline;
        const deadline = new Promise((_, reject) => {
          rejectDeadline = reject;
        });
        const abort = () => {
          controller.abort();
          rejectDeadline(new Error(r.active ? "Request timed out" : "Plugin stopped"));
        };
        requests.add(abort);
        control.signal.addEventListener("abort", abort, { once: true });
        const timer = setTimeout(abort, timeout);
        try {
          const response = await Promise.race([fetch(url, { ...options, signal: controller.signal }), deadline]);
          if (Number(response.headers?.get("content-length")) > maxBytes) {
            controller.abort();
            throw new Error("Response exceeds the preview size limit");
          }
          const text = await Promise.race([response.text(), deadline]);
          if (text.length > maxBytes) throw new Error("Response exceeds the preview size limit");
          if (!r.active) throw new Error("Plugin stopped");
          if (!response.ok) {
            let body;
            try {
              body = JSON.parse(text);
            } catch {
              body = {};
            }
            const error = new Error(body.message || `HTTP ${response.status}`);
            error.status = response.status;
            error.retryAfter = Number(body.retry_after) || 0;
            throw error;
          }
          return { response, text, json() {
            return text ? JSON.parse(text) : null;
          } };
        } finally {
          clearTimeout(timer);
          requests.delete(abort);
          control.signal.removeEventListener("abort", abort);
        }
      },
      async discord(path, options = {}) {
        if (!path.startsWith("/") || path.startsWith("//")) throw new Error("Invalid Discord API path");
        if (!r.active) throw new Error("Plugin stopped");
        const found = r.find("HTTP", "get", "post", "put", "patch", "del") || r.find("get", "post", "put", "del");
        const client = found?.HTTP || found;
        const method = (options.method || "GET").toLowerCase().replace(/^delete$/, "del");
        if (typeof client?.[method] !== "function") throw new Error("Discord HTTP client unavailable");
        try {
          const response = await client[method]({ url: path, ...options.body != null ? { body: typeof options.body === "string" ? JSON.parse(options.body) : options.body } : {} });
          if (!r.active) throw new Error("Plugin stopped");
          if (response?.status >= 400) throw Object.assign(new Error(response.body?.message || `HTTP ${response.status}`), { status: response.status, body: response.body });
          return { response, json() {
            return response?.body ?? null;
          } };
        } catch (cause) {
          const error = new Error(cause?.body?.message || cause?.message || "Discord request failed");
          error.status = cause?.status;
          error.retryAfter = Number(cause?.body?.retry_after) || 0;
          throw error;
        }
      },
      hook(names, transform) {
        const set = new Set(names);
        const jsx = B.api?.react?.jsx;
        if (jsx?.onJsxCreate && jsx?.deleteJsxCreate) {
          for (const name of names) {
            const callback = (_Component, element) => {
              if (!r.active) return;
              r.status[name] = (r.status[name] || 0) + 1;
              try {
                return transform(element, name);
              } catch (error) {
                r.error(`JSX ${name}`, error);
              }
            };
            jsx.onJsxCreate(name, callback);
            r.own(() => jsx.deleteJsxCreate(name, callback));
          }
        }
        r.patch("after", React, "createElement", (args, result) => {
          if (!r.active || !result) return;
          const type = args[0];
          const name = typeof type === "string" ? type : type?.displayName || type?.name || type?.type?.name;
          if (!name || !set.has(name)) return;
          r.status[name] = (r.status[name] || 0) + 1;
          try {
            return transform(result, name) ?? result;
          } catch (error) {
            r.error(`createElement ${name}`, error);
          }
        });
      },
      patchRows(transform) {
        const apply = (value) => {
          try {
            const wasString = typeof value === "string";
            const rows = wasString ? JSON.parse(value) : value;
            const next = transform(rows);
            if (next == null) return value;
            return wasString ? typeof next === "string" ? next : JSON.stringify(next) : next;
          } catch {
            return value;
          }
        };
        const modules = r.RN.NativeModules || {};
        for (const key of Object.keys(modules)) {
          if (typeof modules[key]?.updateRows === "function") {
            r.patch("before", modules[key], "updateRows", (args) => {
              if (args && args[1] != null) args[1] = apply(args[1]);
            });
          }
        }
        const manager = r.byName("RowManager");
        const proto = manager?.prototype || manager;
        if (typeof proto?.generate === "function") {
          r.patch("after", proto, "generate", (_args, row) => apply(row));
        }
      },
      hideSheets() {
        for (const close of [...openSheets.values()]) {
          try {
            close();
          } catch {
          }
        }
        openSheets.clear();
      },
      open(key, Component, props = {}, options = {}) {
        if (!r.active) throw new Error("Plugin stopped");
        const sheets = B.ui?.sheets;
        const ActionSheet = D.ActionSheet || C.ActionSheet;
        if (!sheets?.showSheet || !sheets?.hideSheet || !ActionSheet) throw new Error("Snow bottom-sheet components unavailable");
        const id = `${meta.id}.${key}`;
        openSheets.get(id)?.();
        let closed = false;
        const close = () => {
          if (closed) return;
          closed = true;
          if (openSheets.get(id) === close) openSheets.delete(id);
          sheets.hideSheet(id);
        };
        class Boundary extends React.Component {
          state = { error: null };
          static getDerivedStateFromError(error) {
            return { error };
          }
          componentDidCatch(error) {
            r.error("Sheet rendering", error);
          }
          render() {
            if (!this.state.error) return this.props.children;
            const U = ui(r);
            return r.h(U.Page, { title: "Could not display this page", close }, r.h(U.Text, null, this.state.error.message));
          }
        }
        function Page() {
          React.useEffect(() => () => {
            if (openSheets.get(id) === close) openSheets.delete(id);
            closed = true;
          }, []);
          return r.h(ActionSheet, { scrollable: options.scrollable ?? true }, r.h(Boundary, null, r.h(Component, { ...props, close })));
        }
        openSheets.set(id, close);
        try {
          sheets.showSheet(id, Page);
        } catch (error) {
          close();
          throw error;
        }
        return close;
      },
      copy(text) {
        if (!r.active) return;
        const clip = r.common.clipboard || r.find("setString");
        if (!clip?.setString) throw new Error("Clipboard unavailable");
        clip.setString(String(text));
        r.toast("Copied");
      },
      dispose() {
        active = false;
        control.abort();
        for (const id of alerts) {
          try {
            B.ui?.dismissAlert?.(id);
          } catch (e) {
            console.error(`[${meta.name}] alert cleanup`, e?.message);
          }
        }
        alerts.clear();
        for (const abort of requests) abort();
        requests.clear();
        for (const close of [...openSheets.values()]) {
          try {
            close();
          } catch {
          }
        }
        openSheets.clear();
        while (cleanups.length) {
          try {
            cleanups.pop()();
          } catch (e) {
            console.error(`[${meta.name}] cleanup`, e?.message);
          }
        }
        r.changed();
        listeners.clear();
        return r.api.storage.flush();
      }
    };
    return r;
  }
  function ui(r) {
    const { h, C, D, RN, store } = r;
    function Text({ children, muted = false, heading = false, color, ...props }) {
      const Comp = D.Text || C.Text;
      if (Comp) return h(Comp, { variant: heading ? "heading-md/semibold" : "text-md/normal", color: color || (muted ? "text-muted" : "text-normal"), ...props }, children);
      return h(RN.Text, props, children);
    }
    function Button({ text, onPress, disabled, variant = "primary", ...props }) {
      const Comp = D.Button;
      if (Comp) return h(Comp, { text, onPress, disabled, variant, size: "md", ...props });
      return h(RN.Pressable || RN.TouchableOpacity, { onPress, disabled, accessibilityRole: "button", style: { padding: 12 } }, h(Text, null, text));
    }
    function Page({ title, children, close }) {
      const body = [
        title ? h(Text, { key: "title", heading: true, accessibilityRole: "header" }, title) : null,
        children,
        close ? h(Button, { key: "close", text: "Close", variant: "secondary", onPress: close }) : null
      ];
      if (C.SettingsPage) return h(C.SettingsPage, null, ...body);
      return h(RN.View, { style: { padding: 16, gap: 12 } }, ...body);
    }
    function Input({ value, onChange, ...props }) {
      if (D.TextInput) return h(D.TextInput, { value, onChange, ...props });
      if (C.TextInput) return h(C.TextInput, { value, onChange, ...props });
      return h(RN.TextInput, { value, onChangeText: onChange, ...props });
    }
    function Toggle({ setting, label, subLabel, icon }) {
      r.useRefresh();
      const Row = D.TableSwitchRow || C.TableSwitchRow;
      if (!Row) return null;
      return h(Row, {
        label,
        subLabel,
        icon: icon || (C.RowIcon ? h(C.RowIcon, { name: "SettingsIcon" }) : void 0),
        value: !!store[setting],
        onValueChange: (v) => r.set(setting, v)
      });
    }
    function Slider({ value, onValueChange, minimumValue = 0, maximumValue = 1, step, ...props }) {
      const Comp = D.Slider || C.Slider;
      if (Comp) return h(Comp, { value, onValueChange, minimumValue, maximumValue, step, ...props });
      return h(Input, { value: String(value), onChange: (text) => onValueChange(Number(text) || 0), keyboardType: "numeric" });
    }
    return { Text, Button, Page, Input, Toggle, Slider };
  }
  function register(meta, factory) {
    const B = bunny;
    let runtime;
    let instance;
    return definePlugin({
      async start() {
        if (runtime) {
          try {
            await instance?.stop?.();
          } finally {
            await runtime.dispose();
          }
        }
        runtime = createRuntime(B, meta, factory.defaults || {});
        try {
          instance = factory(runtime);
          await instance.start?.();
        } catch (error) {
          runtime.error("Start failed", error);
          await runtime.dispose();
          throw error;
        }
      },
      async stop() {
        try {
          await instance?.stop?.();
        } finally {
          await runtime?.dispose();
          instance = null;
          runtime = null;
        }
      },
      SettingsComponent() {
        return instance?.Settings ? runtime.h(instance.Settings) : null;
      }
    });
  }

  // project:src/url-hub.js
  var KEY = /* @__PURE__ */ Symbol.for("mime.snow.urlHandlers.v1");
  function install(target, method, hub) {
    if (!target || typeof target[method] !== "function" || target[method] === hub.wrapper) return;
    const original = target[method];
    const wrapper = function(...args) {
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url || args[0]?.uri;
      if (url) for (const entry of [...hub.handlers]) {
        try {
          if (entry.handler(url, () => original.apply(this, args))) return;
        } catch (error) {
          entry.r.error("Open link", error);
        }
      }
      return original.apply(this, args);
    };
    hub.restores.push(() => {
      if (target[method] === wrapper) target[method] = original;
    });
    target[method] = wrapper;
  }
  function addUrlHandler(r, priority, handler) {
    let hub = globalThis[KEY];
    if (!hub) {
      hub = { handlers: [], restores: [] };
      const urlMod = r.common.url?.openURL ? r.common.url : r.find("openURL", "openDeeplink") || r.find("openURL", "handleURL");
      install(urlMod, "openURL", hub);
      install(urlMod, "openDeeplink", hub);
      install(urlMod, "handleURL", hub);
      install(r.RN.Linking, "openURL", hub);
      const linkingMod = r.find("openURL", "canOpenURL");
      if (linkingMod !== urlMod && linkingMod !== r.RN.Linking) install(linkingMod, "openURL", hub);
      if (!hub.restores.length) throw new Error("This Discord build has no supported openURL module");
      globalThis[KEY] = hub;
    }
    const entry = { r, priority, handler };
    hub.handlers.push(entry);
    hub.handlers.sort((a, b) => b.priority - a.priority);
    r.own(() => {
      hub.handlers = hub.handlers.filter((item) => item !== entry);
      if (!hub.handlers.length) {
        for (const restore of hub.restores) try {
          restore();
        } catch {
        }
        delete globalThis[KEY];
      }
    });
  }

  // project:src/plugins/install-links.js
  var SCHEME_RE = /snow:\/\/[^\s<>\]]+/gi;
  var ZWSP = "\u200B";
  function stripFormatChars(value) {
    return String(value || "").replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, "");
  }
  function hideInnerHttps(value) {
    return String(value).replace(/https:\/\//gi, "https:" + ZWSP + "//");
  }
  function snowInstallLink(pluginUrl) {
    const url = sanitizePluginUrl(pluginUrl) || pluginUrl;
    const params = String(url).replace(/&/g, "%26").replace(/#/g, "%23");
    return hideInnerHttps("snow://snow?id=-1&command=install-plugin&params=" + params);
  }
  function parseInstallLink(value) {
    if (!value || typeof value !== "string") return null;
    const trimmed = stripFormatChars(value.trim());
    let parsed;
    try {
      parsed = new URL(trimmed);
    } catch {
      return null;
    }
    if (parsed.protocol.replace(":", "").toLowerCase() !== "snow") return null;
    const host = (parsed.hostname || parsed.host || "").toLowerCase();
    const path = (parsed.pathname || "").replace(/^\//, "");
    const command = (parsed.searchParams.get("command") || path || "").toLowerCase();
    const rawQuery = trimmed.split("?")[1] || "";
    const paramsMatch = rawQuery.match(/(?:^|&)params=([^&]*)/);
    const param = (paramsMatch ? paramsMatch[1] : "") || parsed.searchParams.get("params") || parsed.searchParams.get("url") || parsed.searchParams.get("plugin") || "";
    if (command === "install-plugin" || command === "installplugin" || path === "install-plugin" || path === "plugin" || path === "install" || host === "install-plugin" || host === "plugin") {
      const url = sanitizePluginUrl(param);
      return url ? { kind: "plugin", source: "snow", url, raw: trimmed } : null;
    }
    return null;
  }
  function sanitizePluginUrl(value) {
    if (!value) return null;
    let text = stripFormatChars(String(value).trim());
    try {
      text = decodeURIComponent(text);
    } catch {
    }
    let url;
    try {
      url = new URL(text);
    } catch {
      return null;
    }
    if (url.protocol !== "https:" || url.username || url.password) return null;
    if (url.hostname === "github.com" && /\/blob\//.test(url.pathname)) {
      url.hostname = "raw.githubusercontent.com";
      url.pathname = url.pathname.replace(/\/blob\//, "/");
    }
    if (url.pathname.endsWith("/")) return url.href;
    return url.href;
  }
  function manifestUrl(url) {
    const href = sanitizePluginUrl(url) || url;
    if (!href) return href;
    if (/\/$/.test(href)) return href + "manifest.json";
    return href;
  }
  function snowLinkParts(text) {
    if (typeof text !== "string" || !text.includes("snow://")) return null;
    const parts = [];
    let last = 0;
    for (const match of text.matchAll(SCHEME_RE)) {
      if (!parseInstallLink(match[0])) continue;
      if (match.index > last) parts.push({ type: "text", content: text.slice(last, match.index) });
      const raw = stripFormatChars(match[0]);
      parts.push({
        type: "link",
        target: raw,
        url: raw,
        content: [{ type: "text", content: hideInnerHttps(raw) }]
      });
      last = match.index + match[0].length;
    }
    if (!parts.length) return null;
    if (last < text.length) parts.push({ type: "text", content: text.slice(last) });
    return parts;
  }
  function rewriteNode(node) {
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        if (typeof node[i] === "string") {
          const parts = snowLinkParts(node[i]);
          if (parts) {
            node.splice(i, 1, ...parts);
            i += parts.length - 1;
          }
        } else rewriteNode(node[i]);
      }
      return;
    }
    if (!node || typeof node !== "object") return;
    if (typeof node.content === "string") {
      const parts = snowLinkParts(node.content);
      if (parts) node.content = parts;
    } else if (Array.isArray(node.content) || node.content && typeof node.content === "object") rewriteNode(node.content);
    if (typeof node.text === "string") {
      const parts = snowLinkParts(node.text);
      if (parts) node.content = parts;
    }
    for (const value of Object.values(node)) {
      if (value && typeof value === "object" && value !== node.content) rewriteNode(value);
    }
  }
  function expandUrlRegex(value) {
    if (!(value instanceof RegExp) || !/https\?:/.test(value.source) || /snow\?:/.test(value.source)) return value;
    return new RegExp(value.source.replace(/https\?:/g, "(?:https?|snow):"), value.flags);
  }
  function patchAutolink(r) {
    const modules = [
      r.find("isUrl"),
      r.find("isLink"),
      r.find("isWebUrl"),
      r.find("URL_REGEX"),
      r.find("WEB_URL"),
      r.find("defaultRules"),
      r.find("parse", "reactParser"),
      r.find("parseInline"),
      ...r.metro.findByPropsAll?.("parse") || []
    ].filter(Boolean);
    for (const module of modules) {
      if (!module || typeof module !== "object") continue;
      for (const key of Object.keys(module)) {
        const current = module[key];
        const expanded = expandUrlRegex(current);
        if (expanded !== current) {
          try {
            module[key] = expanded;
            r.own(() => {
              if (module[key] === expanded) module[key] = current;
            });
          } catch {
          }
        }
      }
    }
  }
  function InstallLinks(r) {
    const { h, React } = r, { Page, Text, Button, Input } = ui(r);
    let close;
    function Prompt({ link, close: dismiss }) {
      return h(
        Page,
        { title: "Install in Snow", close: dismiss },
        h(Text, { selectable: true }, link.url),
        h(Text, null, "Copy the manifest URL, then open Snow Settings \u2192 Plugins \u2192 Install from URL. Review the plugin there, install it, and enable it."),
        h(Text, { muted: true }, "Snow does not expose plugin installation or enabling other plugins through its compatibility SDK."),
        h(Button, { text: "Copy manifest URL", onPress: () => r.copy(link.url) }),
        h(Button, { text: "Copy snow:// link", variant: "secondary", onPress: () => r.copy(snowInstallLink(link.url)) })
      );
    }
    async function openPrompt(link) {
      if (!r.active) return;
      close?.();
      close = r.open("install", Prompt, { link: { ...link, url: manifestUrl(link.url) } });
    }
    function handle(url) {
      const link = parseInstallLink(url);
      if (!link) return false;
      openPrompt(link).catch((error) => r.error("Install link", error));
      return true;
    }
    function Settings() {
      const [draft, setDraft] = React.useState("");
      r.useRefresh();
      const example = snowInstallLink("https://raw.githubusercontent.com/xMimiez/Snow-Plugins/main/Decor/manifest.json");
      return h(
        Page,
        { title: "Install Links" },
        h(Text, { muted: true }, "Send a snow:// install-plugin link. Discord does not autolink custom schemes, so this plugin marks snow:// as a URL and intercepts taps."),
        h(Text, { selectable: true }, example),
        h(Input, { label: "Plugin HTTPS URL", value: draft, onChange: setDraft, autoCapitalize: "none" }),
        h(Button, { text: "Preview install", onPress: () => {
          const url = sanitizePluginUrl(draft);
          if (!url) return r.toast("Enter an https plugin URL");
          openPrompt({ kind: "plugin", source: "snow", url, raw: snowInstallLink(url) });
        } }),
        h(Button, { text: "Copy snow:// link", variant: "secondary", onPress: () => {
          const url = sanitizePluginUrl(draft);
          if (!url) return r.toast("Enter an https plugin URL");
          r.copy(snowInstallLink(url));
        } })
      );
    }
    return {
      start() {
        addUrlHandler(r, 200, (url) => {
          if (!parseInstallLink(url)) return false;
          handle(stripFormatChars(url));
          return true;
        });
        patchAutolink(r);
        r.patchRows((rows) => {
          const next = typeof rows === "string" ? JSON.parse(rows) : JSON.parse(JSON.stringify(rows));
          rewriteNode(next);
          return typeof rows === "string" ? JSON.stringify(next) : next;
        });
        const linking = r.RN.Linking;
        if (linking?.canOpenURL) {
          r.patch("instead", linking, "canOpenURL", (args, next) => {
            if (/^snow:/i.test(stripFormatChars(String(args[0] || "")))) return Promise.resolve(true);
            return next(...args);
          });
        }
        if (typeof linking?.addEventListener === "function") {
          const sub = linking.addEventListener("url", (event) => {
            if (event?.url) handle(event.url);
          });
          r.own(() => sub?.remove?.());
        }
        linking?.getInitialURL?.().then((url) => {
          if (url && r.active) handle(url);
        }).catch(() => {
        });
        r.command({
          name: "snowlink",
          description: "Send a snow:// install-plugin link",
          options: [{ name: "url", description: "HTTPS plugin manifest URL", type: 3, required: true }],
          execute(args) {
            const url = sanitizePluginUrl(args.find((a) => a.name === "url")?.value);
            if (!url) {
              r.toast("Need an https plugin URL");
              return;
            }
            return { content: snowInstallLink(url) };
          }
        });
        r.command({
          name: "installplugin",
          description: "Open installation instructions for a snow:// or https URL",
          options: [{ name: "url", description: "snow:// or https plugin URL", type: 3, required: true }],
          execute(args) {
            const raw = String(args.find((a) => a.name === "url")?.value || "");
            const link = parseInstallLink(raw) || sanitizePluginUrl(raw) && { kind: "plugin", source: "snow", url: sanitizePluginUrl(raw), raw };
            if (!link) {
              r.toast("Need a snow:// or https plugin URL");
              return;
            }
            openPrompt(link);
          }
        });
      },
      stop() {
        close?.();
      },
      Settings
    };
  }
  InstallLinks.defaults = {};

  // InstallLinks.entry.js
  var InstallLinks_entry_default = register({ "id": "mime.installlinks", "name": "InstallLinks", "description": "Share snow:// links and copy manifest URLs for manual installation.", "version": "1.0.7", "authors": [{ "name": "Mime | N0_.q3", "id": "957164619061932045" }], "license": "MIT", "source": "https://github.com/xMimiez/Snow-Plugins/tree/main/InstallLinks" }, InstallLinks);
  return __toCommonJS(InstallLinks_entry_exports);
})();
