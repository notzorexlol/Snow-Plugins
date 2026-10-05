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

  // NSFWGateBypass.entry.js
  var NSFWGateBypass_entry_exports = {};
  __export(NSFWGateBypass_entry_exports, {
    default: () => NSFWGateBypass_entry_default
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
  function openExternal(r, url) {
    return r.RN.Linking.openURL(url);
  }

  // project:src/plugins/mobile-ports.js
  function walk(value, visit) {
    if (!value || typeof value !== "object") return;
    visit(value);
    if (Array.isArray(value)) for (const item of value) walk(item, visit);
    else for (const item of Object.values(value)) walk(item, visit);
  }
  function cloneRows(rows) {
    return JSON.parse(JSON.stringify(rows));
  }
  function AlwaysAnimate(r) {
    const { h, React } = r, { Page, Text, Toggle } = ui(r);
    let reduced = false;
    function allowed() {
      return !(reduced && r.store.respectReducedMotion);
    }
    function force(element) {
      if (!element || !allowed()) return;
      const props = {};
      for (const key of ["canAnimate", "animate", "animateEmoji", "animateGradient", "loop", "shouldAnimate", "animated"]) {
        if (typeof element.props?.[key] === "boolean") props[key] = true;
      }
      return Object.keys(props).length ? React.cloneElement(element, props) : void 0;
    }
    return {
      async start() {
        reduced = !!await r.RN.AccessibilityInfo?.isReduceMotionEnabled?.();
        const listener = r.RN.AccessibilityInfo?.addEventListener?.("reduceMotionChanged", (value) => {
          reduced = !!value;
        });
        r.own(() => listener?.remove?.());
        for (const name of ["canUseAnimatedEmojis", "canUseAnimatedAvatar", "canUseNameplate", "canUseAnimatedBanner", "shouldAnimateEmoji"]) {
          r.patch("after", r.find(name), name, () => allowed() ? true : void 0);
        }
        r.patch("after", r.find("getCurrentUser"), "getCurrentUser", (_args, user) => {
          if (!allowed() || !user) return;
          try {
            if (user.premiumType === 0 || user.premiumType == null) user.premiumType = user.premiumType;
          } catch {
          }
        });
        r.hook(["Emoji", "CustomEmoji", "AnimatedEmoji", "Avatar", "GuildIcon", "GuildBanner", "Nameplate", "RoleIcon", "Image", "FastImage"], force);
        r.patchRows((rows) => {
          if (!allowed()) return rows;
          const next = cloneRows(rows);
          walk(next, (node) => {
            for (const key of ["animate", "animated", "canAnimate", "animateEmoji", "shouldAnimate", "loop"]) {
              if (typeof node[key] === "boolean") node[key] = true;
            }
          });
          return next;
        });
      },
      Settings() {
        r.useRefresh();
        return h(
          Page,
          { title: "AlwaysAnimate" },
          h(Toggle, { setting: "respectReducedMotion", label: "Respect Reduce Motion" }),
          h(Text, null, "Forces animation flags on emoji, avatars, and native chat rows. Nitro-gated animated emoji still needs Discord to have the asset.")
        );
      }
    };
  }
  AlwaysAnimate.defaults = { respectReducedMotion: true };
  function BlurNsfw(r) {
    const { h, React, RN } = r, { Page, Text, Button, Toggle } = ui(r);
    const Gate = React.createContext(false);
    function media(obj) {
      const type = obj.content_type || obj.contentType || "";
      const name = obj.filename || obj.name || obj.url || "";
      return /^(image|video)\//.test(type) || /\.(png|jpe?g|gif|webp|mp4|mov|webm)$/i.test(name);
    }
    function Media({ original }) {
      const nested = React.useContext(Gate), [shown, reveal] = React.useState(false);
      if (nested) return original;
      return h(Gate.Provider, { value: true }, h(
        RN.View,
        null,
        shown ? original : h(RN.View, { style: { height: 120, justifyContent: "center", padding: 12, backgroundColor: "#00000099" } }, h(Text, null, "Sensitive media hidden")),
        h(Button, { text: shown ? "Hide" : "Reveal", variant: "secondary", onPress: () => reveal((v) => !v) })
      ));
    }
    function nsfwChannel(props) {
      const channel = props.channel || r.byStore("ChannelStore")?.getChannel?.(props.channelId || props.channel_id || props.message?.channel_id || props.message?.channelId);
      return r.store.blurAllChannels || !!(channel?.nsfw || channel?.nsfw_ || props.nsfw);
    }
    return {
      start() {
        r.hook(["MessageImage", "MessageVideo", "MessageAttachment", "ImageAttachment", "VideoAttachment", "MediaAttachment", "EmbedMedia", "MessageMedia", "Attachment"], (element) => {
          try {
            const p = element?.props || {}, a = p.attachment || p.media || p;
            if (a && !media(a) && a.filename) return;
            if (nsfwChannel(p)) return h(Media, { original: element });
          } catch {
            return;
          }
        });
        r.patchRows((rows) => {
          const next = cloneRows(rows);
          walk(next, (node) => {
            const channel = r.byStore("ChannelStore")?.getChannel?.(node.channelId || node.channel_id || node.message?.channel_id);
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
        return h(
          Page,
          { title: "BlurNSFW" },
          h(Toggle, { setting: "blurAllChannels", label: "Hide media in every channel" }),
          h(Text, null, "Marks NSFW attachments as spoilers in native chat and covers JSX media with a reveal button.")
        );
      }
    };
  }
  BlurNsfw.defaults = { blurAllChannels: false };
  function NsfwGateBypass(r) {
    const { h } = r, { Page, Text } = ui(r);
    return {
      start() {
        let count = 0;
        for (const name of ["isNSFWInvite", "shouldNSFWGateGuild", "isNSFW", "canViewNSFWGuild", "shouldShowNSFWGate", "needsNSFWGate"]) {
          if (r.patch("after", r.find(name), name, () => false)) count++;
        }
        r.patch("after", r.byStore("UserStore") || r.find("getCurrentUser"), "getCurrentUser", (_args, user) => {
          if (user && user.nsfwAllowed === false) try {
            user.nsfwAllowed = true;
          } catch {
          }
        });
        r.status.support = count ? `${count} client gate hooks installed` : "No named gate function found; nsfwAllowed is still forced on the current user object when present.";
      },
      Settings() {
        return h(Page, { title: "NSFWGateBypass" }, h(Text, null, r.status.support), h(Text, { muted: true }, "Local interstitial only. Server permissions stay enforced."));
      }
    };
  }
  function appLink(value) {
    try {
      const u = new URL(value);
      if (!["http:", "https:"].includes(u.protocol) || u.username || u.password) return null;
      const host = u.hostname.replace(/^www\./, "");
      const path = u.pathname.replace(/\/$/, "");
      if (host === "open.spotify.com" && /^\/(?:intl-[a-z-]+\/)?(?:track|album|artist|playlist|episode|show)\/[A-Za-z0-9]+$/.test(path)) {
        return "spotify:" + path.replace(/^\/(?:intl-[a-z-]+\/)?/, "").replace("/", ":");
      }
      if (["store.steampowered.com", "steamcommunity.com", "help.steampowered.com"].includes(host)) return "steam://openurl/" + u.href;
      if (host === "tidal.com" && /^\/browse\/(track|album|artist|playlist)\/[\w-]+$/.test(path)) return "tidal://" + path.slice(8);
      if (host === "music.apple.com") return "musics://" + u.host + u.pathname + u.search;
      if (host === "t.me" || host === "telegram.me") {
        const parts = path.slice(1).split("/");
        const domain = parts[0];
        if (domain && domain.startsWith("+")) return "tg://join?invite=" + encodeURIComponent(domain.slice(1));
        if (domain && /^[A-Za-z][\w]{3,}$/.test(domain) && !parts[1]) return "tg://resolve?domain=" + encodeURIComponent(domain);
        if (domain && parts[1]) return "tg://resolve?domain=" + encodeURIComponent(domain) + "&post=" + encodeURIComponent(parts[1]);
      }
      if (host === "instagram.com" || host === "instagr.am") {
        const ig = path.slice(1).split("/");
        if (["p", "reel", "reels", "tv"].includes(ig[0]) && ig[1]) return "instagram://media?shortcode=" + encodeURIComponent(ig[1]);
        if (ig[0] && !["stories", "explore", "accounts"].includes(ig[0])) return "instagram://user?username=" + encodeURIComponent(ig[0]);
      }
      if (host === "tiktok.com" || host.endsWith(".tiktok.com")) {
        const user = path.match(/^\/@([^/]+)/);
        if (user) return "tiktok://user?username=" + encodeURIComponent(user[1]);
        if (host === "vm.tiktok.com" || path.startsWith("/t/")) return "tiktok://" + path;
        return "snssdk1233://" + path;
      }
    } catch {
    }
    return null;
  }
  function OpenInApp(r) {
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
        return h(
          Page,
          { title: "OpenInApp" },
          h(Toggle, { setting: "enabled", label: "Open supported links in their app" }),
          h(Text, null, "Spotify, Steam, Tidal, Apple Music, Telegram, Instagram and TikTok. iOS cannot probe whether an app is installed, so the app URL is opened directly and the original link is used if that fails. SpotifyPreview still takes priority for Spotify URLs.")
        );
      }
    };
  }
  OpenInApp.defaults = { enabled: true };
  function ValidUser(r) {
    const { h, React } = r, { Page, Text, Button, Input, Toggle } = ui(r);
    const pending = /* @__PURE__ */ new Map();
    let next = 0;
    async function resolve(id) {
      if (!/^\d{16,22}$/.test(id)) throw new Error("Enter a numeric Discord user ID");
      const cached = r.byStore("UserStore")?.getUser?.(id);
      if (cached?.username && cached.username !== "Unknown User" && cached.username !== "unknownuser") return cached;
      if (pending.has(id)) return pending.get(id);
      const wait = Math.max(0, next - Date.now());
      next = Date.now() + 1200;
      const task = (wait ? r.wait(wait) : Promise.resolve()).then(() => r.discord(`/users/${id}`)).then((result) => {
        const user = result.json();
        if (!user?.id || !user?.username) throw new Error("User could not be resolved");
        r.common.FluxDispatcher?.dispatch?.({ type: "USER_UPDATE", user });
        r.common.FluxDispatcher?.dispatch?.({ type: "LOAD_USER_SUCCESS", user });
        return user;
      }).finally(() => pending.delete(id));
      pending.set(id, task);
      return task;
    }
    function idsFrom(value) {
      return [...new Set(Array.from(String(value || "").matchAll(/<@!?(\d{16,22})>/g), (match) => match[1]))];
    }
    function unknown(user) {
      return !user || !user.username || user.username === "Unknown User" || user.username === "unknownuser" || user.isUnknown;
    }
    function harvest(message) {
      const ids = idsFrom(message?.content);
      for (const mention of message?.mentions || []) if (mention?.id) ids.push(mention.id);
      for (const id of ids) {
        const user = r.byStore("UserStore")?.getUser?.(id);
        if (unknown(user)) resolve(id).catch(() => {
        });
      }
    }
    function Settings() {
      const [id, setId] = React.useState(""), [result, setResult] = React.useState(""), [busy, setBusy] = React.useState(false);
      return h(
        Page,
        { title: "ValidUser" },
        h(Toggle, { setting: "autoResolve", label: "Automatically resolve unknown mentions" }),
        h(Input, { label: "User ID", value: id, onChange: setId, keyboardType: "number-pad" }),
        h(Button, { text: busy ? "Resolving\u2026" : "Resolve user", disabled: busy, onPress: () => {
          setBusy(true);
          resolve(id.trim()).then((u) => setResult(`${u.global_name || u.globalName || u.username} (@${u.username})`)).catch((e) => setResult(e.message)).finally(() => setBusy(false));
        } }),
        h(Text, null, result || "Unknown mentions are fetched and USER_UPDATE is dispatched so @Unknown User is replaced with the real username.")
      );
    }
    return {
      start() {
        r.subscribe("MESSAGE_CREATE", (event) => {
          if (r.store.autoResolve) harvest(event?.message || event);
        });
        r.subscribe("MESSAGE_UPDATE", (event) => {
          if (r.store.autoResolve) harvest(event?.message || event);
        });
        r.subscribe("LOAD_MESSAGES_SUCCESS", (event) => {
          if (!r.store.autoResolve) return;
          for (const message of event?.messages || []) harvest(message);
        });
        const store = r.byStore("UserStore") || r.find("getUser", "getCurrentUser");
        r.patch("after", store, "getUser", (args, user) => {
          const id = String(args?.[0] || "");
          if (r.store.autoResolve && /^\d{16,22}$/.test(id) && unknown(user)) resolve(id).catch(() => {
          });
        });
        r.hook(["Mention", "UserMention", "UnknownUser", "MentionedUser"], (element) => {
          const id = element.props?.userId || element.props?.id || element.props?.user?.id;
          const user = id && r.byStore("UserStore")?.getUser?.(id);
          if (id && unknown(user)) resolve(id).catch(() => {
          });
        });
        r.command({ name: "resolveuser", description: "Resolve a Discord user ID", options: [{ name: "id", description: "User ID", type: 3, required: true }], async execute(options) {
          const user = await resolve(String(options.find((o) => o.name === "id")?.value || ""));
          r.toast(`${user.global_name || user.username} (@${user.username})`);
        } });
      },
      Settings,
      resolve
    };
  }
  ValidUser.defaults = { autoResolve: true };
  function setNativeVolume(r, gain) {
    const modules = r.RN.NativeModules || {};
    const candidates = [
      r.find("setOutputVolume"),
      r.find("setAbsoluteOutputVolume"),
      r.find("setVolume", "getVolume"),
      r.find("setLocalVolume"),
      r.find("setOutputVolumeScalar"),
      modules.VoiceEngine,
      modules.AudioManager,
      modules.MediaEngine,
      modules.VoiceManager,
      modules.RTCEngine,
      modules.AudioModule
    ].filter(Boolean);
    let applied = 0;
    for (const mod of candidates) {
      for (const method of ["setOutputVolume", "setAbsoluteOutputVolume", "setOutputVolumeScalar", "setLocalVolume", "setVolume", "setSinkVolume"]) {
        if (typeof mod[method] !== "function") continue;
        try {
          mod[method](gain);
          applied++;
        } catch {
          try {
            mod[method](gain * 100);
            applied++;
          } catch {
          }
        }
      }
    }
    return applied;
  }
  function VolumeBooster(r) {
    const { h } = r, { Page, Text, Toggle, Slider } = ui(r);
    function apply(percent) {
      const gain = Math.max(1, Math.min(5, Number(percent) / 100));
      const n = setNativeVolume(r, gain);
      r.status.support = n ? `Applied ${percent}% via ${n} native volume method(s).` : "No VoiceEngine/MediaEngine volume method found; slider max is still raised where Discord renders a 200 cap.";
      r.changed();
      return n;
    }
    return {
      start() {
        apply(r.store.percent || 200);
        r.hook(["Slider", "FormSlider", "TableSliderRow", "NativeSlider"], (element) => {
          const max = element.props?.maximumValue ?? element.props?.maxValue;
          if (max === 200 || max === 1) {
            return r.React.cloneElement(element, {
              maximumValue: max === 1 ? 5 : 500,
              maxValue: max === 1 ? 5 : 500
            });
          }
        });
        const settings = r.find("setOutputVolume") || r.find("setLocalVolume");
        if (settings && typeof settings.setOutputVolume === "function") {
          r.patch("before", settings, "setOutputVolume", (args) => {
            if (typeof args[0] === "number" && r.store.enabled) args[0] = args[0] * ((r.store.percent || 200) / 100);
          });
        }
      },
      Settings() {
        r.useRefresh();
        return h(
          Page,
          { title: "VolumeBooster" },
          h(Toggle, { setting: "enabled", label: "Boost voice output volume" }),
          h(Text, null, `Boost: ${r.store.percent}%`),
          h(Slider, { value: r.store.percent, minimumValue: 100, maximumValue: 500, step: 10, onValueChange: (value) => {
            r.set("percent", Math.round(value));
            apply(value);
          } }),
          h(Text, { muted: true }, r.status.support || "Uses MediaEngine/VoiceEngine volume setters when present, and raises Discord volume sliders that cap at 200%.")
        );
      }
    };
  }
  VolumeBooster.defaults = { enabled: true, percent: 200 };

  // NSFWGateBypass.entry.js
  var NSFWGateBypass_entry_default = register({ "id": "mime.nsfwgatebypass", "name": "NSFWGateBypass", "description": "Bypass supported local guild interstitials without mutating account settings.", "version": "1.2.1", "authors": [{ "name": "eternal", "id": "263689920210534400" }, { "name": "Mime | N0_.q3", "id": "957164619061932045" }], "license": "GPL-3.0-or-later", "source": "https://github.com/xMimiez/Snow-Plugins/tree/main/NSFWGateBypass" }, NsfwGateBypass);
  return __toCommonJS(NSFWGateBypass_entry_exports);
})();
