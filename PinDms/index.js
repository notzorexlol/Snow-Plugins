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

  // PinDms.entry.js
  var PinDms_entry_exports = {};
  __export(PinDms_entry_exports, {
    default: () => PinDms_entry_default
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

  // project:src/plugins/pin-dms-data.js
  var DEFAULT_COLOR = 10070709;
  var SWATCHES = [1752220, 3066993, 3447003, 10181046, 15277667, 15844367, 15105570, 15158332, 9807270, 6323595, 1146986, 2067276, 2123412, 7419530, 11342935, 12745742, 11027200, 10038562, 9936031, 5533306];
  function move(items, index, direction) {
    const next = index + direction;
    if (![-1, 1].includes(direction) || index < 0 || next < 0 || next >= items.length) return items;
    const result = [...items];
    [result[index], result[next]] = [result[next], result[index]];
    return result;
  }
  function categoryChannels(category, order, recentIds) {
    if (order === 1) return [...category.channels];
    const positions = new Map(recentIds.map((id, index) => [id, index]));
    return [...category.channels].sort((a, b) => (positions.get(a) ?? Infinity) - (positions.get(b) ?? Infinity));
  }
  function sectionsFor(categories, settings, recentIds, selectedId, exists = () => true) {
    const pinned = new Set(categories.flatMap((c) => c.channels));
    return [
      ...categories.map((category) => ({ ...category, data: categoryChannels(category, settings.pinOrder, recentIds).filter((id) => exists(id) && (!category.collapsed || id === selectedId)) })),
      {
        id: "uncategorized",
        name: "Direct Messages",
        collapsed: !!settings.canCollapseDmSection && !!settings.dmSectionCollapsed,
        data: settings.canCollapseDmSection && settings.dmSectionCollapsed ? [] : recentIds.filter((id) => !pinned.has(id) && exists(id))
      }
    ];
  }
  function createPinData(r) {
    const userId = () => r.byStore("UserStore")?.getCurrentUser?.()?.id;
    const categories = () => r.store.userBasedCategoryList?.[userId()] || [];
    function update(fn) {
      const id = userId();
      if (!id) throw new Error("Sign in to manage pinned DMs.");
      r.set("userBasedCategoryList", { ...r.store.userBasedCategoryList, [id]: fn(categories()) });
    }
    let serial = 0;
    return {
      userId,
      categories,
      save(categoryId, name, color, initialChannelId) {
        if (!name.trim()) throw new Error("Enter a category name.");
        if (!Number.isInteger(color) || color < 0 || color > 16777215) throw new Error("Enter a valid color.");
        if (categoryId && !categories().some((c) => c.id === categoryId)) throw new Error("Category no longer exists.");
        const id = categoryId || `pin-${Date.now().toString(36)}-${++serial}`;
        update((list) => categoryId ? list.map((c) => c.id === id ? { ...c, name: name.trim(), color } : c) : [
          ...list.map((c) => ({ ...c, channels: c.channels.filter((ch) => ch !== initialChannelId) })),
          { id, name: name.trim(), color, collapsed: false, channels: initialChannelId ? [initialChannelId] : [] }
        ]);
        return id;
      },
      remove(id) {
        update((list) => list.filter((c) => c.id !== id));
      },
      collapse(id) {
        update((list) => list.map((c) => c.id === id ? { ...c, collapsed: !c.collapsed } : c));
      },
      pin(channelId, categoryId) {
        if (!categories().some((c) => c.id === categoryId)) return;
        update((list) => list.map((c) => ({ ...c, channels: [...c.channels.filter((id) => id !== channelId), ...c.id === categoryId ? [channelId] : []] })));
      },
      unpin(channelId) {
        update((list) => list.map((c) => ({ ...c, channels: c.channels.filter((id) => id !== channelId) })));
      },
      moveCategory(id, direction) {
        update((list) => move(list, list.findIndex((c) => c.id === id), direction));
      },
      moveChannel(id, direction) {
        update((list) => list.map((c) => c.channels.includes(id) ? { ...c, channels: move(c.channels, c.channels.indexOf(id), direction) } : c));
      }
    };
  }

  // project:src/plugins/pin-dms-list.js
  function createInboxAdapter(r, { data, recent, selected, getChannel, Header }) {
    const { React, h, store } = r;
    const recordId = (value) => {
      const id = typeof value === "string" ? value : value?.channel?.id || value?.channelId || value?.id;
      const channel = getChannel(id);
      if (![1, 3].includes(channel?.type)) return null;
      if (typeof value === "string" || value === channel || value?.channel === channel || value?.channelId === id || value?.type === channel.type) return id;
      return null;
    };
    function inspect(props) {
      if (!Array.isArray(props?.data) || !props.data.length || typeof props.renderItem !== "function" || props.horizontal || props.numColumns > 1 || props.searchQuery || props.stickyHeaderIndices?.length || props.inverted) return null;
      const ids = props.data.map(recordId), dmIds = ids.filter(Boolean), inbox = recent().filter((id) => [1, 3].includes(getChannel(id)?.type));
      if (!dmIds.length || new Set(dmIds).size !== dmIds.length || dmIds.length !== inbox.length || !inbox.every((id) => dmIds.includes(id))) return null;
      const first = ids.findIndex(Boolean), last = ids.length - 1 - [...ids].reverse().findIndex(Boolean);
      if (ids.slice(first, last + 1).some((id) => !id)) return null;
      return { ids, first, last };
    }
    function NativeInbox({ original }) {
      r.useRefresh();
      React.useEffect(() => {
        const stores = ["UserStore", "ChannelStore", "PrivateChannelSortStore", "SelectedChannelStore"].map((name) => r.byStore(name)).filter(Boolean);
        const update = () => {
          if (r.active) r.changed();
        };
        if (!r.active) return;
        stores.forEach((s) => s.addChangeListener?.(update));
        let done = false;
        const stop = () => {
          if (done) return;
          done = true;
          stores.forEach((s) => s.removeChangeListener?.(update));
        };
        r.own(stop);
        return stop;
      }, []);
      const props = original.props, shape = inspect(props), current = React.useRef(null);
      const sourceRef = Object.getOwnPropertyDescriptor(props, "ref")?.value || Object.getOwnPropertyDescriptor(original, "ref")?.value;
      const rows = [], indexMap = /* @__PURE__ */ new Map();
      if (shape) {
        const entries = props.data.map((item, index) => ({ item, index, id: shape.ids[index], key: String(props.keyExtractor ? props.keyExtractor(item, index) : item?.key ?? item?.id ?? index) }));
        const byId = new Map(entries.filter((e) => e.id).map((e) => [e.id, e]));
        const sections = sectionsFor(data.categories(), store, shape.ids.filter(Boolean), selected(), (id) => byId.has(id));
        rows.push(...entries.slice(0, shape.first));
        for (const section of sections) {
          const headerIndex = rows.length;
          rows.push({ header: section, key: `mime-pin-header:${section.id}` });
          for (const id of section.id === "uncategorized" ? [...byId.keys()].filter((id2) => !data.categories().some((c) => c.channels.includes(id2))) : section.channels) {
            if (byId.has(id)) indexMap.set(byId.get(id).index, headerIndex);
          }
          rows.push(...section.data.map((id) => byId.get(id)));
        }
        rows.push(...entries.slice(shape.last + 1));
        rows.forEach((row, index) => {
          if (!row.header) indexMap.set(row.index, index);
        });
      }
      const enabled = !!shape && r.active && store.nativeList;
      current.current = { rows, indexMap, enabled, props };
      const bridgeRef = React.useMemo(() => (node) => {
        const value = node && new Proxy(node, { get(target, key) {
          if (key === "scrollToIndex") return (options) => {
            const state = current.current;
            return target.scrollToIndex({ ...options, index: state.enabled ? state.indexMap.get(options.index) ?? options.index : options.index });
          };
          if (key === "scrollToItem") return (options) => {
            const state = current.current;
            const item = state.enabled ? state.rows.find((row) => row.item === options.item) : options.item;
            if (item) return target.scrollToItem({ ...options, item });
            const index = state.props.data.indexOf(options.item);
            if (index >= 0) return target.scrollToIndex({ ...options, index: state.indexMap.get(index) });
          };
          const member = Reflect.get(target, key, target);
          return typeof member === "function" ? member.bind(target) : member;
        } });
        if (typeof sourceRef === "function") return sourceRef(value);
        if (sourceRef) sourceRef.current = value;
      }, [sourceRef]);
      const remapViews = (callback) => (payload) => {
        if (!current.current.enabled) return callback(payload);
        const convert = (tokens) => tokens.filter((t) => t.item && !t.item.header).map((t) => ({ ...t, item: t.item.item, index: t.item.index, key: t.item.key }));
        return callback({ ...payload, viewableItems: convert(payload.viewableItems), changed: convert(payload.changed) });
      };
      const onViewableItemsChanged = React.useMemo(() => props.onViewableItemsChanged && remapViews(props.onViewableItemsChanged), [props.onViewableItemsChanged]);
      const viewabilityConfigCallbackPairs = React.useMemo(() => props.viewabilityConfigCallbackPairs?.map((pair) => ({ ...pair, onViewableItemsChanged: remapViews(pair.onViewableItemsChanged) })), [props.viewabilityConfigCallbackPairs]);
      if (!enabled) return React.cloneElement(original, { ...sourceRef ? { ref: bridgeRef } : {}, onViewableItemsChanged, viewabilityConfigCallbackPairs });
      return React.cloneElement(original, {
        data: rows,
        ...sourceRef ? { ref: bridgeRef } : {},
        extraData: { host: props.extraData, pins: store.userBasedCategoryList, order: store.pinOrder, collapsed: store.dmSectionCollapsed },
        keyExtractor: (row) => row.key,
        renderItem: (info) => info.item.header ? h(Header, { section: info.item.header }) : props.renderItem({ ...info, item: info.item.item, index: info.item.index }),
        getItemType: (row) => row.header ? "mime-pin-header" : props.getItemType?.(row.item, row.index, props.extraData) ?? "mime-original-row",
        overrideItemLayout: props.overrideItemLayout ? (layout, row, _index, maxColumns) => row.header ? Object.assign(layout, { size: 48, span: 1 }) : props.overrideItemLayout(layout, row.item, row.index, maxColumns, props.extraData) : void 0,
        getItemLayout: props.getItemLayout ? (_data, index) => {
          const length = (row) => row.header ? 48 : props.getItemLayout(props.data, row.index).length;
          const gap = (row, next) => {
            if (row.header || next?.header || row.index + 1 >= props.data.length) return 0;
            const here = props.getItemLayout(props.data, row.index), after = props.getItemLayout(props.data, row.index + 1);
            return Math.max(0, after.offset - here.offset - here.length);
          };
          return { index, length: length(rows[index]), offset: rows.slice(0, index).reduce((sum, row, i) => sum + length(row) + gap(row, rows[i + 1]), props.getItemLayout(props.data, 0).offset || 0) };
        } : void 0,
        initialScrollIndex: props.initialScrollIndex == null ? void 0 : indexMap.get(props.initialScrollIndex),
        onViewableItemsChanged,
        viewabilityConfigCallbackPairs,
        ItemSeparatorComponent: props.ItemSeparatorComponent ? (info) => info.leadingItem?.header || info.trailingItem?.header ? null : h(props.ItemSeparatorComponent, { ...info, leadingItem: info.leadingItem?.item, trailingItem: info.trailingItem?.item }) : void 0
      });
    }
    return (element) => {
      if (!store.nativeList || !inspect(element?.props)) return;
      r.status.nativeList = true;
      return h(NativeInbox, { ...element.key != null ? { key: element.key } : {}, original: element });
    };
  }

  // project:src/plugins/pin-dms.js
  function PinDms(r) {
    const { h, React, RN, store } = r, { Page, Text, Input, Button, Toggle } = ui(r);
    const data = createPinData(r);
    const channelStore = () => r.byStore("ChannelStore");
    const isDm = (channel) => channel && [1, 3].includes(channel.type);
    const getChannel = (id) => channelStore()?.getChannel?.(id);
    const recent = () => r.byStore("PrivateChannelSortStore")?.getPrivateChannelIds?.() || [];
    const selected = () => r.byStore("SelectedChannelStore")?.getChannelId?.();
    const sections = () => sectionsFor(data.categories(), store, recent(), selected(), (id) => isDm(getChannel(id)));
    const title = (id) => {
      const channel = getChannel(id);
      return channel?.name || channel?.recipients?.map((id2) => {
        const user = r.byStore("UserStore")?.getUser?.(id2);
        return user?.globalName || user?.global_name || user?.username || "Unknown user";
      }).join(", ") || "Direct Message";
    };
    function openDm(id, close) {
      const navigation = r.find("transitionToChannel");
      if (!isDm(getChannel(id)) || !navigation) return r.toast("This DM is unavailable.");
      close?.();
      navigation.transitionToChannel(id, {});
    }
    function guard(action, owner = data.userId()) {
      return async () => {
        if (!r.active) return;
        try {
          if (owner !== data.userId()) throw new Error("Account changed. Reopen this menu.");
          await action();
        } catch (e) {
          if (r.active) r.error("Pin DMs", e);
        }
      };
    }
    function useStores() {
      r.useRefresh();
      React.useEffect(() => {
        if (!r.active) return;
        const stores = ["UserStore", "ChannelStore", "PrivateChannelSortStore", "SelectedChannelStore", "ReadStateStore"].map((name) => r.byStore(name)).filter(Boolean);
        const update = () => {
          if (r.active) r.changed();
        };
        for (const s of stores) s.addChangeListener?.(update);
        let disposed = false;
        const cleanup = () => {
          if (disposed) return;
          disposed = true;
          for (const s of stores) s.removeChangeListener?.(update);
        };
        r.own(cleanup);
        return cleanup;
      }, []);
    }
    function Editor({ categoryId, channelId, close }) {
      const category = data.categories().find((c) => c.id === categoryId);
      const [name, setName] = React.useState(category?.name || `Pin Category ${data.categories().length + 1}`);
      const [color, setColor] = React.useState(`#${(category?.color ?? DEFAULT_COLOR).toString(16).padStart(6, "0")}`);
      const owner = React.useRef(data.userId());
      const [saving, setSaving] = React.useState(false);
      const pending = React.useRef(false);
      const savedId = React.useRef(categoryId);
      return h(
        Page,
        { title: categoryId ? "Edit Category" : "New Category", close },
        h(Text, null, "Name"),
        h(Input, { value: name, onChange: setName }),
        h(Text, null, "Color (#RRGGBB)"),
        h(Input, { value: color, onChange: setColor, autoCapitalize: "none" }),
        h(RN.View, { style: { flexDirection: "row", flexWrap: "wrap" } }, ...SWATCHES.map((c) => {
          const hex = "#" + c.toString(16).padStart(6, "0");
          return h(RN.Pressable, { key: c, accessibilityRole: "button", accessibilityLabel: `Color ${hex}`, onPress: () => setColor(hex), style: { width: 32, height: 32, margin: 4, backgroundColor: hex, borderWidth: color === hex ? 3 : 0, borderColor: "#fff" } });
        })),
        h(Button, { text: saving ? "Saving\u2026" : "Save", disabled: saving || !name.trim() || !/^#[0-9a-f]{6}$/i.test(color), onPress: guard(async () => {
          if (pending.current) return;
          if (owner.current !== data.userId()) throw new Error("Account changed. Reopen the category editor.");
          pending.current = true;
          setSaving(true);
          try {
            savedId.current = data.save(savedId.current, name, parseInt(color.slice(1), 16), channelId);
            await r.api.storage.flush();
            if (r.active && owner.current === data.userId()) close?.();
          } finally {
            pending.current = false;
            if (r.active) setSaving(false);
          }
        }) })
      );
    }
    function CategoryActions({ categoryId, close }) {
      useStores();
      const list = data.categories(), index = list.findIndex((c) => c.id === categoryId), category = list[index];
      if (!category) return h(Page, { title: "Category no longer exists", close });
      return h(
        Page,
        { title: category.name, close },
        h(Button, { text: "Edit category", onPress: guard(() => {
          close?.();
          r.open("category-edit", Editor, { categoryId });
        }) }),
        h(Button, { text: category.collapsed ? "Expand category" : "Collapse category", onPress: guard(() => data.collapse(categoryId)) }),
        h(Button, { text: "Move up", disabled: index === 0, onPress: guard(() => data.moveCategory(categoryId, -1)) }),
        h(Button, { text: "Move down", disabled: index === list.length - 1, onPress: guard(() => data.moveCategory(categoryId, 1)) }),
        h(Button, { text: "Delete category", onPress: guard(() => {
          data.remove(categoryId);
          close?.();
        }) })
      );
    }
    function ChannelActions({ channelId, close }) {
      useStores();
      const category = data.categories().find((c) => c.channels.includes(channelId));
      const index = category?.channels.indexOf(channelId) ?? -1;
      return h(
        Page,
        { title: title(channelId), close },
        category ? h(Button, { text: "Unpin DM", onPress: guard(() => {
          data.unpin(channelId);
          close?.();
        }) }) : null,
        category && store.pinOrder === 1 ? h(
          RN.View,
          null,
          h(Button, { text: "Move up", disabled: index <= 0, onPress: guard(() => data.moveChannel(channelId, -1)) }),
          h(Button, { text: "Move down", disabled: index >= category.channels.length - 1, onPress: guard(() => data.moveChannel(channelId, 1)) })
        ) : null,
        ...data.categories().filter((c) => c.id !== category?.id).map((c) => h(Button, { key: c.id, text: `Pin in ${c.name}`, onPress: guard(() => {
          data.pin(channelId, c.id);
          close?.();
        }) })),
        h(Button, { text: "New category", onPress: guard(() => {
          close?.();
          r.open("category-edit", Editor, { channelId });
        }) })
      );
    }
    function Header({ section }) {
      const uncategorized = section.id === "uncategorized";
      return h(RN.Pressable, {
        accessibilityRole: "button",
        accessibilityLabel: section.name,
        accessibilityState: { expanded: !section.collapsed },
        style: { height: 48, paddingHorizontal: 12, justifyContent: "center" },
        onPress: guard(() => uncategorized ? store.canCollapseDmSection && r.set("dmSectionCollapsed", !store.dmSectionCollapsed) : data.collapse(section.id)),
        onLongPress: uncategorized ? void 0 : () => r.open("category-actions", CategoryActions, { categoryId: section.id })
      }, h(Text, { heading: true, style: section.color != null ? { color: "#" + section.color.toString(16).padStart(6, "0") } : void 0 }, `${section.collapsed ? "\u25B8" : "\u25BE"} ${section.name}`));
    }
    function DmRow({ id, close }) {
      const read = r.byStore("ReadStateStore");
      const unread = !!read?.hasUnread?.(id), count = read?.getMentionCount?.(id) || 0;
      const label = `${title(id)}${count ? ` (${count})` : ""}${unread ? " \u2022" : ""}`;
      const onPress = () => openDm(id, close), onLongPress = () => r.open("channel-actions", ChannelActions, { channelId: id });
      return h(RN.Pressable, {
        onPress,
        onLongPress,
        accessibilityRole: "button",
        accessibilityState: { selected: id === selected() },
        style: { padding: 12 }
      }, h(Text, null, label));
    }
    function PinsPage({ close }) {
      useStores();
      const list = sections();
      return h(
        RN.View,
        { style: { height: Math.max(420, (RN.Dimensions?.get("window")?.height || 640) * 0.75) } },
        h(Text, { heading: true }, "Pin DMs"),
        h(Text, { muted: true }, "Tap a category to collapse it. Hold a category or DM to edit, pin or reorder."),
        h(Button, { text: "New category", onPress: () => r.open("category-edit", Editor) }),
        RN.SectionList ? h(RN.SectionList, { sections: list, keyExtractor: (id) => id, renderItem: ({ item }) => h(DmRow, { id: item, close }), renderSectionHeader: ({ section }) => h(Header, { section }), stickySectionHeadersEnabled: false }) : h(RN.ScrollView || RN.View, null, ...list.map((s) => h(RN.View, { key: s.id }, h(Header, { section: s }), ...s.data.map((id) => h(DmRow, { key: id, id, close }))))),
        close ? h(Button, { text: "Close", onPress: close }) : null
      );
    }
    const adaptList = createInboxAdapter(r, { data, recent, selected, getChannel, Header });
    function menuChannel(props) {
      if (props?.message) return null;
      const channel = props?.channel || getChannel(props?.channelId);
      if (isDm(channel)) return channel;
      const userId = props?.userId || props?.user?.id;
      return userId ? recent().map(getChannel).find((c) => c?.type === 1 && c.recipients?.includes(userId)) : null;
    }
    function menuItem(props) {
      const channel = menuChannel(props);
      if (!channel) return null;
      return { key: "mime-pin-dms", label: "Pin DMs", onPress: guard(() => r.open("channel-actions", ChannelActions, { channelId: channel.id })) };
    }
    function patchChannelMenu() {
      const module = r.byName("ChannelLongPressActionSheet", true);
      const wrappers = /* @__PURE__ */ new WeakMap();
      return r.patch("after", module, "default", (_args, element) => {
        if (!r.active || !React.isValidElement(element) || !menuItem(element.props)) return;
        const Original = element.type;
        if (typeof Original !== "function" || Original.prototype?.isReactComponent) return;
        if (!wrappers.has(Original)) wrappers.set(Original, function WithPinActions(props) {
          const tree = Original(props), item = r.active ? menuItem(props) : null;
          if (!item) return tree;
          return appendAction(r, tree, { ...item, onPress: () => {
            if (!r.active) return;
            r.find("hideActionSheet")?.hideActionSheet();
            item.onPress();
          } });
        });
        const ref = Object.getOwnPropertyDescriptor(element, "ref")?.value || Object.getOwnPropertyDescriptor(element.props, "ref")?.value;
        if (ref) return;
        return h(wrappers.get(Original), { ...element.props, key: element.key });
      });
    }
    function Settings({ close }) {
      useStores();
      return h(
        Page,
        { title: "Pin DMs", close },
        h(Button, { text: "Open pinned DMs", onPress: () => r.open("pins", PinsPage, {}, { scrollable: false }) }),
        h(Button, { text: `Order: ${store.pinOrder === 1 ? "Custom" : "Most recent message"}`, onPress: () => r.set("pinOrder", store.pinOrder === 1 ? 0 : 1) }),
        h(Toggle, { setting: "canCollapseDmSection", label: "Allow collapsing uncategorized DMs" }),
        h(Toggle, { setting: "nativeList", label: "Categories in compatible native DM lists" }),
        h(Text, { muted: true }, `Hold a DM to add a category or pin it. ${r.status.nativeList ? "Categories are connected to your DM list." : "Open your DM list to connect categories; Open pinned DMs is also available."}`)
      );
    }
    function wrapDmRow(element, props = element.props) {
      const channel = props?.channel;
      if (!isDm(channel)) return;
      const open = guard(() => r.open("channel-actions", ChannelActions, { channelId: channel.id }));
      return h(RN.Pressable, {
        ...element.key != null ? { key: element.key } : {},
        onPress: (event) => {
          event?.stopPropagation?.();
          if (props.onPress) props.onPress(event);
          else openDm(channel.id);
        },
        onLongPress: (event) => {
          event?.stopPropagation?.();
          open();
        },
        accessibilityActions: [{ name: "pin-dms", label: "Pin DMs" }],
        onAccessibilityAction: (event) => {
          if (event.nativeEvent.actionName === "pin-dms") open();
        }
      }, element);
    }
    return { Settings, PinsPage, ChannelActions, CategoryActions, Editor, data, sections, adaptList, start() {
      r.status.settingsEntry = registerSection(r, { name: "Pin DMs", items: [{ key: "MIME_PIN_DMS", title: () => "Pinned DMs", render: async () => ({ default: PinsPage }) }] });
      r.status.channelMenu = !!patchChannelMenu();
      const lazyMenu = patchLazySheet(r, (_key, props) => menuItem(props));
      r.status.channelMenu = r.status.channelMenu || !!lazyMenu;
      r.hook(["FlatList", "AnimatedFlatList", "FlashList"], adaptList);
      const FlashList = r.D.FlashList || r.find("FlashList")?.FlashList;
      if (FlashList) r.patch("after", React, "createElement", (args, result) => args[0] === FlashList ? adaptList(result) : void 0);
      let rowModule;
      try {
        rowModule = r.B.metro.findByTypeName?.("MessagesItemChannelContent");
      } catch {
      }
      const rowPatched = r.patch("after", rowModule, "type", (args, result) => r.active && React.isValidElement(result) ? wrapDmRow(result, args[0]) : void 0);
      if (!rowPatched) r.hook(["MessagesItemChannelContent"], (element) => wrapDmRow(element));
    } };
  }
  PinDms.defaults = { pinOrder: 0, canCollapseDmSection: false, dmSectionCollapsed: false, userBasedCategoryList: {}, nativeList: true };

  // PinDms.entry.js
  var PinDms_entry_default = register({ "id": "mime.pindms", "name": "Pin DMs", "description": "Per-account DM categories, colors, ordering and collapsible sections for mobile.", "authors": [{ "name": "Vendicated", "id": "343383572805058560" }, { "name": "Aria" }, { "name": "Mime | N0_.q3", "id": "957164619061932045" }], "version": "1.0.1", "license": "GPL-3.0-or-later", "source": "https://github.com/xMimiez/Snow-Plugins/tree/main/PinDms" }, PinDms);
  return __toCommonJS(PinDms_entry_exports);
})();
