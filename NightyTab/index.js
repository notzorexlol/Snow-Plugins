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

  // NightyTab.entry.js
  var NightyTab_entry_exports = {};
  __export(NightyTab_entry_exports, {
    default: () => NightyTab_entry_default
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

  // project:src/settings-section.js
  function registerSection(r, section) {
    const constants = r.find("SETTING_RENDERER_CONFIG");
    const lists = r.find("createList");
    if (!constants || !lists || !r.api.patcher?.before) return false;
    const navigationRef = r.find("getRootNavigationRef");
    const navigation = r.common.NavigationNative;
    const routeName = "MIME_PLUGIN_SETTINGS_PAGE";
    const canNavigate = navigationRef && navigation?.useRoute && navigation?.useNavigation;
    const key = /* @__PURE__ */ Symbol.for("mime.snow.settingsSections.v2");
    let hub = constants[key];
    if (!hub) {
      let CustomPageRenderer = function() {
        const route = navigation.useRoute();
        const nav = navigation.useNavigation();
        r.React.useEffect(() => {
          nav.setOptions({ title: route.params.title, headerShown: route.params.headerShown !== false });
        }, [nav, route.params.title, route.params.headerShown]);
        return route.params.render();
      };
      const descriptor = Object.getOwnPropertyDescriptor(constants, "SETTING_RENDERER_CONFIG");
      if (!descriptor?.configurable) return false;
      const entries = /* @__PURE__ */ new Map();
      let value = constants.SETTING_RENDERER_CONFIG;
      const get = () => {
        const base = descriptor.get ? descriptor.get.call(constants) : value;
        const extra = {};
        if (canNavigate) extra[routeName] = {
          type: "route",
          useTitle: () => "Plugin",
          screen: { route: routeName, getComponent: () => CustomPageRenderer }
        };
        for (const { runtime, section: s } of entries.values()) for (const row of s.items) {
          extra[row.key] = {
            type: "pressable",
            icon: row.icon,
            IconComponent: row.IconComponent || (() => null),
            useTitle: row.title,
            usePredicate: row.usePredicate,
            useTrailing: row.useTrailing,
            withArrow: true,
            onPress: row.onPress || (async () => {
              try {
                const page = await row.render();
                if (!runtime.active) return;
                if (canNavigate) {
                  const nav = navigationRef.getRootNavigationRef();
                  nav.navigate(routeName, {
                    title: row.title(),
                    headerShown: row.headerShown,
                    owner: runtime.meta.id,
                    render: () => runtime.active ? runtime.h(page.default, { close: () => nav.goBack() }) : null
                  });
                } else runtime.open(row.key, page.default, {}, { scrollable: false });
              } catch (error) {
                if (runtime.active) runtime.error("Open settings page", error);
              }
            }),
            ...row.rawTabsConfig
          };
        }
        return { ...base, ...extra };
      };
      Object.defineProperty(constants, "SETTING_RENDERER_CONFIG", {
        configurable: true,
        enumerable: descriptor.enumerable,
        get,
        set: descriptor.set ? (v) => descriptor.set.call(constants, v) : (v) => {
          value = v;
        }
      });
      hub = { entries, close() {
        if (Object.getOwnPropertyDescriptor(constants, "SETTING_RENDERER_CONFIG")?.get === get) {
          Object.defineProperty(constants, "SETTING_RENDERER_CONFIG", descriptor.get ? descriptor : { ...descriptor, value });
        }
        delete constants[key];
      } };
      Object.defineProperty(constants, key, { value: hub, configurable: true });
    }
    const id = Symbol(section.name);
    hub.entries.set(id, { runtime: r, section });
    r.patch("before", lists, "createList", (args) => {
      if (!r.active) return;
      const config = args[0];
      if (!config?.sections?.some((s) => s.settings?.includes("ACCOUNT"))) return;
      const sections = config.sections.map((s) => ({ ...s, settings: s.settings ? [...s.settings] : s.settings }));
      const keys = section.items.map((row) => row.key);
      const existing = sections.find((s) => s.label === section.name);
      if (existing) existing.settings = [.../* @__PURE__ */ new Set([...existing.settings || [], ...keys])];
      else sections.unshift({ label: section.name, title: section.name, settings: keys });
      args[0] = { ...config, sections };
    });
    r.own(() => {
      if (canNavigate) {
        const nav = navigationRef.getRootNavigationRef();
        const current = nav?.getCurrentRoute?.();
        if (current?.name === routeName && current.params?.owner === r.meta.id) nav.goBack();
      }
      hub.entries.delete(id);
      if (!hub.entries.size) hub.close();
    });
    return true;
  }

  // project:src/action-sheet.js
  function mapTree(React, node, transform) {
    const replacement = transform(node);
    if (replacement !== void 0) return replacement;
    if (Array.isArray(node)) return node.map((child) => mapTree(React, child, transform));
    if (!React.isValidElement(node) || node.props.children == null) return node;
    return React.cloneElement(node, {}, mapTree(React, node.props.children, transform));
  }
  function appendAction(r, tree, item) {
    let inserted = false;
    const name = (node) => node?.type?.displayName || node?.type?.name || node?.type?.type?.name;
    const result = mapTree(r.React, tree, (node) => {
      if (inserted || !Array.isArray(node)) return;
      const sample = node.find((n) => name(n) === "ButtonRow" || name(n) === "ActionSheetRow");
      if (!sample || node.some((n) => n?.key === item.key)) return;
      inserted = true;
      const Row = name(sample) === "ButtonRow" ? r.D.Forms?.FormRow || r.C.Forms?.FormRow || sample.type : sample.type;
      return [...node, r.h(Row, { key: item.key, label: item.label, onPress: item.onPress, ...item.icon ? { icon: item.icon, leading: item.icon } : {} })];
    });
    return inserted ? result : tree;
  }
  function patchLazySheet(r, getItem) {
    const sheets = r.find("openLazy", "hideActionSheet");
    if (!sheets || !r.api.patcher?.before) return false;
    return r.patch("before", sheets, "openLazy", (args) => {
      const [pending, key, props] = args;
      const item = getItem(key, props);
      if (!item || !pending?.then) return;
      args[0] = pending.then((module) => {
        if (!r.active || typeof module?.default !== "function" || module.default.prototype?.isReactComponent) return module;
        const Original = module.default;
        function WithAction(screenProps) {
          const tree = Original(screenProps);
          const current = r.active ? getItem(key, screenProps?.message || screenProps?.channel ? screenProps : props) : null;
          if (!current) return tree;
          return appendAction(r, tree, { ...current, onPress: () => {
            if (!r.active) return;
            sheets.hideActionSheet();
            Promise.resolve().then(() => current.onPress()).catch((error) => {
              if (r.active) r.error(current.label, error);
            });
          } });
        }
        return { ...module, default: WithAction };
      });
    });
  }

  // project:src/plugins/nighty-tab.js
  function pageUrl(value) {
    try {
      const url = new URL(String(value).trim());
      return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : null;
    } catch {
      return null;
    }
  }
  function canDownload(settings, message) {
    return !!settings.scriptUtils && typeof settings.nightyPrefix === "string" && Array.from(settings.nightyPrefix).length === 1 && !!settings.nightyPrefix.trim() && !!message?.id && !!messageChannelId(message) && !!message.attachments?.length;
  }
  function messageChannelId(message) {
    return message?.getChannelId?.() || message?.channel_id || message?.channelId;
  }
  function NightyTab(r) {
    const { h, React, RN, store } = r;
    const { Page, Text, Button, Input, Toggle } = ui(r);
    const iconUrl = () => store.iconType === "custom" ? pageUrl(store.customIconUrl) : `https://raw.githubusercontent.com/aboveproof/Equicord-Nighty-Tab/main/asset/icon${store.iconType === "grayscale" ? "-grayscale" : ""}.png`;
    function Icon() {
      r.useRefresh();
      const uri = iconUrl();
      return uri ? h(
        RN.View,
        { style: { width: 24, height: 24, alignItems: "center", justifyContent: "center" } },
        h(RN.Image, { source: { uri }, resizeMode: "contain", style: { width: 18, height: 18 }, accessibilityIgnoresInvertColors: true })
      ) : null;
    }
    const sending = /* @__PURE__ */ new Set();
    async function download(message) {
      if (!r.active || !canDownload(store, message) || sending.has(message.id)) return;
      sending.add(message.id);
      try {
        const module = r.find("HTTP", "get", "post", "put", "patch", "del") || r.find("get", "post", "put", "del");
        const rest = module?.HTTP || module;
        if (typeof rest?.post !== "function") throw new Error("Discord message API unavailable");
        const channelId = messageChannelId(message);
        await rest.post({ url: `/channels/${channelId}/messages`, body: {
          content: `${store.nightyPrefix}dls`,
          message_reference: { message_id: message.id, channel_id: channelId, ...message.guild_id ? { guild_id: message.guild_id } : {} },
          allowed_mentions: { parse: [], replied_user: false }
        } });
      } finally {
        sending.delete(message.id);
      }
    }
    function NightyPage() {
      r.useRefresh();
      const src = pageUrl(store.url);
      const WebView = r.find("WebView")?.WebView || r.byName("WebView");
      const [error, setError] = React.useState("");
      return h(
        RN.View,
        { style: { flex: 1 } },
        !src ? h(Text, null, "Set a valid HTTP or HTTPS URL in Nighty Tab settings.") : !WebView ? h(Text, null, "WebView is unavailable in this Snow build.") : h(WebView, {
          key: src,
          source: { uri: src },
          style: { flex: 1 },
          originWhitelist: ["http://*", "https://*"],
          javaScriptEnabled: true,
          domStorageEnabled: true,
          sharedCookiesEnabled: false,
          thirdPartyCookiesEnabled: false,
          startInLoadingState: true,
          onShouldStartLoadWithRequest: (req) => !!pageUrl(req.url),
          onError: (event) => setError(event.nativeEvent?.description || "Could not load Nighty."),
          onHttpError: (event) => setError(`Nighty returned HTTP ${event.nativeEvent?.statusCode}.`),
          onLoad: () => setError("")
        }),
        error ? h(Text, null, error) : null
      );
    }
    function Settings({ close }) {
      r.useRefresh();
      return h(
        Page,
        { title: "Nighty Tab", close },
        h(Text, null, "URL"),
        h(Input, { value: store.url, placeholder: "https://", autoCapitalize: "none", onChange: (v) => r.set("url", v) }),
        store.url && !pageUrl(store.url) ? h(Text, null, "Enter an HTTP or HTTPS URL without embedded credentials.") : null,
        h(Button, { text: "Open Nighty", onPress: () => r.open("nighty", NightyPage, {}, { scrollable: false }) }),
        h(Toggle, { setting: "scriptUtils", label: "Script Utils functions", subLabel: "Download Script replies to an attachment with your prefix followed by dls." }),
        h(Text, null, "Nighty prefix (one character)"),
        h(Input, { value: store.nightyPrefix, onChange: (v) => r.set("nightyPrefix", v), autoCapitalize: "none", placeholder: "." }),
        ...["blue", "grayscale", "custom"].map((style) => h(Button, { key: style, text: `${store.iconType === style ? "\u2713 " : ""}${style} icon`, onPress: () => r.set("iconType", style) })),
        store.iconType === "custom" ? h(Input, { value: store.customIconUrl, placeholder: "https:// image URL", autoCapitalize: "none", onChange: (v) => r.set("customIconUrl", v) }) : null,
        h(Icon),
        h(Text, { muted: true }, `Settings entry: ${r.status.settingsEntry ? "registered" : "unavailable"} \xB7 Message menu: ${r.status.messageMenu ? "registered" : "unavailable"}`)
      );
    }
    return { Settings, NightyPage, download, start() {
      r.status.settingsEntry = registerSection(r, { name: "Nighty", items: [{ key: "MIME_NIGHTY", title: () => "Nighty", headerShown: false, IconComponent: Icon, render: async () => ({ default: NightyPage }) }] });
      r.status.messageMenu = patchLazySheet(r, (key, props) => key === "MessageLongPressActionSheet" && canDownload(store, props?.message) ? { key: "mime-nighty-download", label: "Download Script", icon: h(Icon), onPress: () => download(props.message) } : null);
    } };
  }
  NightyTab.defaults = { url: "", scriptUtils: false, nightyPrefix: ".", iconType: "blue", customIconUrl: "" };

  // NightyTab.entry.js
  var NightyTab_entry_default = register({ "id": "mime.nightytab", "name": "Nighty Tab", "description": "Nighty in mobile settings, with optional Download Script replies.", "authors": [{ "name": "Mime | N0_.q3", "id": "957164619061932045" }, { "name": "rico | wkcp", "id": "1361736124858630274" }], "version": "1.0.1", "license": "GPL-3.0-or-later", "source": "https://github.com/xMimiez/Snow-Plugins/tree/main/NightyTab" }, NightyTab);
  return __toCommonJS(NightyTab_entry_exports);
})();
