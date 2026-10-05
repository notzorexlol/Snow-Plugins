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

  // MoreCommands.entry.js
  var MoreCommands_entry_exports = {};
  __export(MoreCommands_entry_exports, {
    default: () => MoreCommands_entry_default
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

  // project:src/plugins/gif-roulette.js
  function unwrapDiscordProxy(url) {
    if (!url || typeof url !== "string") return url;
    const match = url.match(/\/external\/[^/]+\/(https?)\/([^?]+)/);
    if (match) {
      try {
        return match[1] + "://" + decodeURIComponent(match[2]);
      } catch {
        return url;
      }
    }
    return url;
  }
  function isWeakGifUrl(url) {
    return !url || url.includes("images-ext-") || url.includes("format=webp");
  }
  function gifUrlFrom(entry) {
    if (!entry) return null;
    if (typeof entry === "string") return /^https?:\/\//.test(entry) ? unwrapDiscordProxy(entry) : null;
    const raw = entry.url || entry.gif || entry.uri || entry.src || entry.video || entry.sourceURI;
    return raw ? unwrapDiscordProxy(raw) : null;
  }
  function favoriteGifsMapFrom(value) {
    if (!value) return null;
    if (Array.isArray(value) || Array.isArray(value.favorites)) return value.favorites || value;
    if (value.favoriteGifs?.gifs) return value.favoriteGifs.gifs;
    if (value.favorite_gifs?.gifs) return value.favorite_gifs.gifs;
    if (value.gifs && typeof value.gifs === "object") return value.gifs;
    if (value.favoriteGifs && typeof value.favoriteGifs === "object") return value.favoriteGifs;
    if (value.favoriteGIFs && typeof value.favoriteGIFs === "object") return value.favoriteGIFs;
    return null;
  }
  function collectGifUrls(gifs) {
    const urls = [];
    const push = (url) => {
      if (url && !urls.includes(url)) urls.push(url);
    };
    if (!gifs) return urls;
    if (typeof gifs.forEach === "function" && typeof gifs.keys === "function" && !Array.isArray(gifs)) {
      gifs.forEach((val, key) => {
        if (typeof key === "string" && /^https?:\/\//.test(key)) push(unwrapDiscordProxy(key));
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
  function readFavoriteGifsFromModule(mod) {
    if (!mod) return null;
    const inner = mod.FrecencyUserSettingsActionCreators || mod.default || mod;
    try {
      inner.loadIfNecessary?.();
    } catch {
    }
    for (const getter of ["getCurrentValue", "getState", "getFavoriteGifs", "getFavoriteGIFs", "getSavedGifs", "getFavorites", "getFavoriteGIFsMobile"]) {
      if (typeof inner[getter] !== "function") continue;
      try {
        const value = inner[getter]();
        const map = favoriteGifsMapFrom(value) || favoriteGifsMapFrom(value?.frecencyUserSettings) || favoriteGifsMapFrom(value?.settings);
        if (map && collectGifUrls(map).length) return map;
      } catch {
      }
    }
    if (Array.isArray(inner.favorites) && inner.favorites.length) return inner.favorites;
    return favoriteGifsMapFrom(inner.favoriteGifs) || favoriteGifsMapFrom(inner);
  }
  function pickFavoriteGif(r) {
    const modules = [
      r.find("addFavoriteGIF"),
      r.find("useFavoriteGIFsMobile"),
      r.find("FrecencyUserSettingsActionCreators"),
      r.byStore("FrecencyUserSettingsStore"),
      r.byStore("FavoriteGIFStore"),
      r.byStore("UserSettingsProtoStore"),
      r.find("favoriteGifs"),
      r.find("getFavoriteGifs"),
      r.find("getFavoriteGIFs"),
      r.find("loadIfNecessary", "getCurrentValue"),
      r.find("ProtoClass", "getCurrentValue")
    ].filter(Boolean);
    let urls = [];
    for (const module of modules) {
      urls = collectGifUrls(readFavoriteGifsFromModule(module));
      if (urls.length) break;
    }
    if (!urls.length) return null;
    const strong = urls.filter((url) => !isWeakGifUrl(url));
    const pool = strong.length ? strong : urls;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  async function sendFavoriteGif(r, ctx) {
    const channelId = r.channelId(ctx);
    const url = pickFavoriteGif(r);
    if (!url) {
      r.local(channelId, "No favorite GIFs found. Star a GIF in the GIF picker first.");
      return;
    }
    return { content: url };
  }

  // project:src/plugins/more-commands.js
  var faces = [
    ["dissatisfaction", " \uFF1E\uFE4F\uFF1C"],
    ["smug", "\u0CA0_\u0CA0"],
    ["happy", "\u30FD(\xB4\u25BD`)/"],
    ["crying", "\u0CA5_\u0CA5"],
    ["angry", "\u30FD(\uFF40\u0414\xB4)\uFF89"],
    ["anger", "\u30FD(\uFF4F`\u76BF\u2032\uFF4F)\uFF89"],
    ["joy", "<(\uFFE3\uFE36\uFFE3)>"],
    ["blush", "\u0AEE \u02F6\u1D54 \u1D55 \u1D54\u02F6 \u10D0"],
    ["confused", "(\u2022\u0E34_\u2022\u0E34)?"],
    ["sleeping", "(\u1D17_\u1D17)"],
    ["laughing", "o(\u2267\u25BD\u2266)o"],
    ["giving", "(\uFF89\u25D5\u30EE\u25D5)\uFF89*:\uFF65\uFF9F\u2727"],
    ["peace", "\u270C(\u25D5\u203F-)\u270C"],
    ["ending1", "\u13EA \u08EA\u05B8 \u06F0 \u0359\u22B9"],
    ["uwu", "(>\u2A4A<)"],
    ["comfy", "(\u2500\u203F\u203F\u2500)\u2661"],
    ["lovehappy", "(*\u2267\u03C9\u2266*)"],
    ["loveee", "(\u2044 \u2044>\u2044 \u25BD \u2044<\u2044 \u2044)"],
    ["give", "(\u30CE= \u2A4A = )\u30CE"],
    ["lovegive", "\u10E6\u309D\u25E1\u2579)\u30CE\u2661"],
    ["music", "(\uFFE3\u25BD\uFFE3)/\u266B\u2022\xA8\u2022.\xB8\xB8\u266A"],
    ["stars", ".\u{16954} \u0741 \u02D6\u0E4B \u08ED \u2B51"],
    ["lovegiving", "\u2E1C(\uFF61\u02C3 \u1D55 \u02C2 )\u2E1D\u2661"]
  ];
  var freakyMap = {
    q: "\u{1D4FA}",
    w: "\u{1D500}",
    e: "\u{1D4EE}",
    r: "\u{1D4FB}",
    t: "\u{1D4FD}",
    y: "\u{1D502}",
    u: "\u{1D4FE}",
    i: "\u{1D4F2}",
    o: "\u{1D4F8}",
    p: "\u{1D4F9}",
    a: "\u{1D4EA}",
    s: "\u{1D4FC}",
    d: "\u{1D4ED}",
    f: "\u{1D4EF}",
    g: "\u{1D4F0}",
    h: "\u{1D4F1}",
    j: "\u{1D4F3}",
    k: "\u{1D4F4}",
    l: "\u{1D4F5}",
    z: "\u{1D503}",
    x: "\u{1D501}",
    c: "\u{1D4EC}",
    v: "\u{1D4FF}",
    b: "\u{1D4EB}",
    n: "\u{1D4F7}",
    m: "\u{1D4F6}",
    Q: "\u{1D4E0}",
    W: "\u{1D4E6}",
    E: "\u{1D4D4}",
    R: "\u{1D4E1}",
    T: "\u{1D4E3}",
    Y: "\u{1D4E8}",
    U: "\u{1D4E4}",
    I: "\u{1D4D8}",
    O: "\u{1D4DE}",
    P: "\u{1D4DF}",
    A: "\u{1D4D0}",
    S: "\u{1D4E2}",
    D: "\u{1D4D3}",
    F: "\u{1D4D5}",
    G: "\u{1D4D6}",
    H: "\u{1D4D7}",
    J: "\u{1D4D9}",
    K: "\u{1D4DA}",
    L: "\u{1D4DB}",
    Z: "\u{1D4E9}",
    X: "\u{1D4E7}",
    C: "\u{1D4D2}",
    V: "\u{1D4E5}",
    B: "\u{1D4D1}",
    N: "\u{1D4DD}",
    M: "\u{1D4DC}"
  };
  var morseMap = {
    A: ".-",
    B: "-...",
    C: "-.-.",
    D: "-..",
    E: ".",
    F: "..-.",
    G: "--.",
    H: "....",
    I: "..",
    J: ".---",
    K: "-.-",
    L: ".-..",
    M: "--",
    N: "-.",
    O: "---",
    P: ".--.",
    Q: "--.-",
    R: ".-.",
    S: "...",
    T: "-",
    U: "..-",
    V: "...-",
    W: ".--",
    X: "-..-",
    Y: "-.--",
    Z: "--..",
    0: "-----",
    1: ".----",
    2: "..---",
    3: "...--",
    4: "....-",
    5: ".....",
    6: "-....",
    7: "--...",
    8: "---..",
    9: "----.",
    " ": "/"
  };
  var endings = ["rawr x3", "OwO", "UwU", ":3", "nyaa~~", "^^", "\u{1F97A}", "XD", "(\u02C6 \uFECC \u02C6)\u2661"];
  var replacements = [["small", "smol"], ["cute", "kawaii"], ["love", "luv"], ["stupid", "baka"], ["hello", "hewwo"]];
  function arg(args, name, fallback) {
    const found = (args || []).find((item) => item && item.name === name);
    return found && found.value != null ? found.value : fallback;
  }
  function mock(input) {
    return [...String(input)].map((char, i) => i % 2 ? char.toUpperCase() : char.toLowerCase()).join("");
  }
  function freaky(text, extra) {
    const mapped = [...String(text || "freaky")].map((char) => freakyMap[char] || char).join("");
    return extra ? mapped + (Math.random() < 0.25 ? " \u{1F445}" : " \u2764\uFE0F") : mapped;
  }
  function toMorse(text) {
    return String(text).toUpperCase().split("").map((char) => morseMap[char] ?? "").join(" ");
  }
  function fromMorse(text) {
    const reversed = Object.fromEntries(Object.entries(morseMap).map(([k, v]) => [v, k]));
    const raw = String(text).split(" ").map((code) => reversed[code] ?? "").join("").toLowerCase();
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }
  function uwuify(message) {
    const words = String(message).match(/\S+|\s+/g);
    if (!words) return "";
    let out = "";
    for (const word of words) {
      if (word.startsWith("https://") || [...word].every((char) => char === word[0])) {
        out += word;
        continue;
      }
      let replaced = word;
      for (const [from, to] of replacements) replaced = replaced.replace(new RegExp("\\b" + from + "\\b", "gi"), to);
      out += replaced === word ? word.replace(/n(?=[aeo])/g, "ny").replace(/l|r/g, "w") : replaced;
    }
    return out + " " + endings[Math.floor(Math.random() * endings.length)];
  }
  function MoreCommands(r) {
    const { Page, Text, Toggle } = ui(r);
    const opt = (name, description, extra = {}) => ({ name, description, type: 3, required: false, ...extra });
    function cmd(name, description, options, execute) {
      r.command({ name, description, options: options || [], execute });
    }
    return {
      start() {
        cmd("systeminfo", "Show device information", [], () => {
          const n = globalThis.navigator || {};
          const s = globalThis.screen || {};
          return { content: [
            `> **Platform**: ${r.RN.Platform?.OS || n.platform || "unknown"}`,
            `> **CPU cores**: ${n.hardwareConcurrency || "N/A"}`,
            `> **Screen**: ${s.width || "?"}x${s.height || "?"}`,
            `> **Languages**: ${(n.languages || []).join(", ") || n.language || "N/A"}`,
            `> **Online**: ${n.onLine === false ? "no" : "yes"}`
          ].join("\n") };
        });
        cmd("getuptime", "Show app uptime", [], () => {
          const seconds = Math.floor((performance?.now?.() || 0) / 1e3);
          return { content: `> **Uptime**: ${Math.floor(seconds / 60)} minutes` };
        });
        cmd("gettime", "Show the current time", [], () => ({ content: `> **Current time**: ${(/* @__PURE__ */ new Date()).toLocaleString()}` }));
        cmd("choose", "Pick a random choice", [opt("choices", "Comma-separated choices", { required: true })], (args) => {
          const choices = String(arg(args, "choices", "")).split(",").map((item) => item.trim()).filter(Boolean);
          return { content: choices.length ? "I choose: " + choices[Math.floor(Math.random() * choices.length)] : "Give me some choices." };
        });
        cmd("rolldice", "Roll a die", [opt("sides", "Number of sides", { type: 4 })], (args) => {
          const sides = Number(arg(args, "sides", 6));
          if (!Number.isSafeInteger(sides) || sides < 2 || sides > 1e3) return { content: "Choose a whole number from 2 to 1000." };
          return { content: `Rolled ${1 + Math.floor(Math.random() * sides)} on a ${sides}-sided die.` };
        });
        cmd("flipcoin", "Flip a coin", [], () => ({ content: Math.random() < 0.5 ? "Heads" : "Tails" }));
        cmd("ask", "Ask a yes/no question", [opt("question", "Your question", { required: true })], (args) => {
          const answers = ["Yes", "No", "Maybe", "Ask again later", "Definitely", "I would not count on it"];
          return { content: `**${arg(args, "question", "")}**
${answers[Math.floor(Math.random() * answers.length)]}` };
        });
        cmd("randomanimal", "Random cat or dog image", [opt("animal", "cat or dog")], async (args) => {
          const kind = String(arg(args, "animal", Math.random() < 0.5 ? "cat" : "dog")).toLowerCase();
          const url = kind === "dog" ? "https://dog.ceo/api/breeds/image/random" : "https://api.thecatapi.com/v1/images/search";
          const data = (await r.request(url)).json();
          const image = Array.isArray(data) ? data[0]?.url : data?.message || data?.url;
          return { content: image || "No image returned." };
        });
        cmd("randomnumber", "Random number", [opt("min", "Minimum", { type: 4 }), opt("max", "Maximum", { type: 4 })], (args) => {
          const min = Number(arg(args, "min", 1)), max = Number(arg(args, "max", 100));
          if (![min, max].every(Number.isFinite) || min > max) return { content: "Provide a valid min and max." };
          return { content: String(min + Math.floor(Math.random() * (max - min + 1))) };
        });
        cmd("transform", "Transform text", [opt("text", "Text", { required: true }), opt("transformation", "toLowerCase, toUpperCase, reverse")], (args) => {
          const text = String(arg(args, "text", ""));
          const mode = String(arg(args, "transformation", "toLowerCase"));
          const out = mode === "toUpperCase" ? text.toUpperCase() : mode === "reverse" ? [...text].reverse().join("") : text.toLowerCase();
          return { content: out };
        });
        cmd("wordcount", "Count words", [opt("message", "Text", { required: true })], (args) => {
          const text = String(arg(args, "message", "")).trim();
          const words = text ? text.split(/\s+/).length : 0;
          return { content: `${words} words, ${text.length} characters` };
        });
        cmd("countdown", "Count down locally", [opt("number", "Start from", { type: 4 })], async (args, ctx) => {
          let n = Number(arg(args, "number", 3));
          if (!Number.isSafeInteger(n) || n < 1 || n > 10) n = 3;
          for (let i = n; i >= 0; i--) {
            r.local(r.channelId(ctx), i === 0 ? "\u{1F389} Go! \u{1F389}" : i + "...");
            if (i) await r.wait(1e3);
          }
        });
        cmd("nekos", "Send a neko image", [], async () => {
          const data = (await r.request("https://nekos.best/api/v2/neko")).json();
          return { content: data?.results?.[0]?.url || "No image returned." };
        });
        cmd("anime-boys", "Send cute anime boys", [{ name: "cat", description: "Cat boys", type: 5, required: false }], async (args) => {
          const sub = arg(args, "cat") === true || arg(args, "cat") === "true" ? "animecatboys" : "cuteanimeboys";
          const data = (await r.request("https://www.reddit.com/r/" + sub + "/random.json")).json();
          const url = data?.[0]?.data?.children?.[0]?.data?.url || data?.data?.children?.[0]?.data?.url;
          return { content: url || "No image returned." };
        });
        cmd("ping", "Local pong", [], (_a, ctx) => {
          r.local(r.channelId(ctx), "Pong!");
        });
        cmd("echo", "Show text locally", [opt("message", "Text")], (args, ctx) => {
          r.local(r.channelId(ctx), String(arg(args, "message", "")));
        });
        cmd("lenny", "Send a lenny face", [opt("message", "Prefix")], (args) => ({ content: arg(args, "message", "") + " ( \u0361\xB0 \u035C\u0296 \u0361\xB0)" }));
        cmd("mock", "mOcK tExT", [opt("message", "Text", { required: true })], (args) => ({ content: mock(arg(args, "message", "")) }));
        cmd("slap", "Slap someone", [opt("victim", "Who to slap", { required: true })], (args) => {
          const me = r.byStore("UserStore")?.getCurrentUser?.();
          return { content: `<@${me?.id || "me"}> slaps ${arg(args, "victim", "the void")} around a bit with a large trout` };
        });
        cmd("freaky", "Make text freaky", [opt("message", "Text", { required: true })], (args) => ({ content: freaky(arg(args, "message", ""), r.store.addFreakyEnding) }));
        cmd("morse", "To or from Morse", [opt("text", "Text", { required: true })], (args) => {
          const input = String(arg(args, "text", ""));
          return { content: /^[.\-/ ]+$/.test(input) ? fromMorse(input) : toMorse(input) };
        });
        cmd("uwuify", "uwuify text", [opt("message", "Text", { required: true })], (args) => ({ content: uwuify(arg(args, "message", "")) }));
        cmd("more-gifroulette", "Send a random favorite GIF", [], (_a, ctx) => sendFavoriteGif(r, ctx));
        for (const [name, face] of faces) {
          cmd(name, face, [opt("message", "Prefix")], (args) => ({ content: (arg(args, "message", "") + " " + face).trim() }));
        }
      },
      Settings() {
        r.useRefresh();
        return r.h(
          Page,
          { title: "MoreCommands" },
          r.h(Toggle, { setting: "addFreakyEnding", label: "Add a random ending to /freaky" }),
          r.h(Text, { muted: true }, "Snow sends returned command results once. /more-gifroulette uses your starred GIFs and can coexist with GifRoulette.")
        );
      }
    };
  }
  MoreCommands.defaults = { addFreakyEnding: true };

  // MoreCommands.entry.js
  var MoreCommands_entry_default = register({ "id": "mime.morecommands", "name": "MoreCommands", "description": "Fun and utility slash commands, including /more-gifroulette.", "version": "2.2.1", "authors": [{ "name": "Mime | N0_.q3", "id": "957164619061932045" }], "license": "MIT", "source": "https://github.com/xMimiez/Snow-Plugins/tree/main/MoreCommands" }, MoreCommands);
  return __toCommonJS(MoreCommands_entry_exports);
})();
