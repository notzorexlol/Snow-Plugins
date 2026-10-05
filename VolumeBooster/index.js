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

  // VolumeBooster.entry.js
  var VolumeBooster_entry_exports = {};
  __export(VolumeBooster_entry_exports, {
    default: () => VolumeBooster_entry_default
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

  // project:src/plugins/volume-booster.js
  function VolumeBooster(r) {
    const { h } = r, { Page, Text, Toggle, Button } = ui(r);
    function apply(percent) {
      if (!r.store.enabled) return 0;
      const gain = Math.max(1, Math.min(5, Number(percent) / 100));
      const modules = r.RN.NativeModules || {};
      const candidates = [
        r.find("setOutputVolume"),
        r.find("setLocalVolume"),
        modules.VoiceEngine,
        modules.MediaEngine
      ].filter(Boolean);
      let applied = 0;
      for (const mod of candidates) {
        try {
          if (typeof mod.setOutputVolume === "function") {
            mod.setOutputVolume(gain);
            applied++;
          }
        } catch {
        }
      }
      r.status.support = applied ? `Applied ${percent}% via ${applied} output method(s).` : "No safe mobile volume hook found. Discord\u2019s slider is left unchanged to avoid crashes.";
      r.changed();
      return applied;
    }
    function bump(delta) {
      const next = Math.max(100, Math.min(500, Number(r.store.percent || 200) + delta));
      r.set("percent", next);
      apply(next);
    }
    return {
      start() {
        try {
          if (r.store.enabled) apply(r.store.percent || 200);
        } catch {
        }
      },
      Settings() {
        r.useRefresh();
        return h(
          Page,
          { title: "VolumeBooster" },
          h(Toggle, { setting: "enabled", label: "Boost voice output volume" }),
          h(Text, null, `Boost: ${r.store.percent}%`),
          h(Button, { text: "\u2212 25%", variant: "secondary", onPress: () => bump(-25) }),
          h(Button, { text: "+ 25%", variant: "secondary", onPress: () => bump(25) }),
          h(Text, { muted: true }, r.status.support || "Uses VoiceEngine/MediaEngine setOutputVolume only. Discord volume sliders are not patched.")
        );
      }
    };
  }
  VolumeBooster.defaults = { enabled: false, percent: 200 };

  // VolumeBooster.entry.js
  var VolumeBooster_entry_default = register({ "id": "mime.volumebooster", "name": "VolumeBooster", "description": "Optional voice output boost without patching Discord sliders.", "version": "1.2.2", "authors": [{ "name": "Nuckyz", "id": "235834946571337729" }, { "name": "sadan", "id": "521819891141967883" }, { "name": "Mime | N0_.q3", "id": "957164619061932045" }], "license": "GPL-3.0-or-later", "source": "https://github.com/xMimiez/Snow-Plugins/tree/main/VolumeBooster" }, VolumeBooster);
  return __toCommonJS(VolumeBooster_entry_exports);
})();
