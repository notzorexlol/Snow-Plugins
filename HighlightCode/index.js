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

  // HighlightCode.entry.js
  var HighlightCode_entry_exports = {};
  __export(HighlightCode_entry_exports, {
    default: () => HighlightCode_entry_default
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

  // project:src/plugins/highlight-code.js
  function HighlightCode(r) {
    var unpatches = [];
    var _storage;
    var THEME = {
      punctuation: "#959da5",
      "class-name": "#fb8532",
      keyword: "#ff7b72",
      boolean: "#ff7b72",
      parameter: "#f6f8fa",
      function: "#b392f0",
      property: "#b392f0",
      comment: "#8b949e",
      operator: "#79c0ff",
      constant: "#79c0ff",
      number: "#79c0ff",
      string: "#79b8ff",
      selector: "#79b8ff",
      builtin: "#79b8ff"
    };
    var DECORATOR = { bold: "strong", important: "strong", italic: "em" };
    var LANG_LIST = {
      html: ["html", true],
      css: ["CSS", true],
      javascript: ["JavaScript", true],
      js: ["JavaScript", true],
      python: ["Python", true],
      py: ["Python", true],
      bash: ["bash", true],
      sh: ["bash", true],
      shell: ["bash", true],
      typescript: ["TypeScript", true],
      ts: ["TypeScript", true],
      tsx: ["React TSX", false],
      c: ["c", true],
      markdown: ["markdown", true],
      md: ["markdown", true],
      go: ["Go", true],
      json: ["JSON", true],
      swift: ["Swift", true],
      perl: ["Perl", false],
      ruby: ["Ruby", true],
      rb: ["Ruby", true],
      php: ["PHP", true],
      java: ["Java", true],
      jsx: ["React JSX", false],
      lua: ["Lua", true],
      kt: ["Kotlin", true],
      kts: ["Kotlin", true],
      objc: ["Objective-C", false],
      objectivec: ["Objective-C", false]
    };
    var KW = {
      javascript: "\\b(?:const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|new|this|true|false|null|undefined|try|catch|throw|typeof|instanceof|switch|case|break|default|of|in)\\b",
      python: "\\b(?:def|class|import|from|return|if|elif|else|for|while|True|False|None|and|or|not|in|as|with|try|except|lambda|yield|async|await|pass|raise)\\b",
      typescript: "\\b(?:const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|new|this|true|false|null|undefined|interface|type|extends|implements|public|private|readonly)\\b",
      bash: "\\b(?:if|then|else|fi|for|do|done|in|while|case|esac|function|echo|export|alias|cd|exit)\\b",
      go: "\\b(?:func|package|import|return|if|else|for|range|var|const|type|struct|interface|map|go|defer|chan)\\b",
      java: "\\b(?:public|private|protected|class|interface|void|int|new|return|if|else|for|while|static|final|import|package|try|catch|throw|this)\\b",
      swift: "\\b(?:func|let|var|class|struct|enum|if|else|for|while|return|import|guard|nil|true|false|self)\\b",
      ruby: "\\b(?:def|class|module|end|if|else|elsif|unless|while|do|return|require|nil|true|false|self)\\b",
      php: "\\b(?:function|class|return|if|else|foreach|for|while|echo|new|public|private|protected|namespace|use)\\b",
      lua: "\\b(?:function|local|return|if|then|else|end|for|while|do|nil|true|false)\\b",
      kotlin: "\\b(?:fun|val|var|class|if|else|for|when|return|import|null|true|false|override)\\b",
      c: "\\b(?:int|char|void|return|if|else|for|while|struct|typedef|const|static|sizeof)\\b",
      css: "\\b(?:color|background|display|flex|margin|padding|font|border|width|height|position)\\b",
      json: "\\b(?:true|false|null)\\b"
    };
    function log() {
      try {
        console.log.apply(console, ["[HighlightCode]"].concat([].slice.call(arguments)));
      } catch (_e) {
      }
    }
    function logError() {
      try {
        console.error.apply(console, ["[HighlightCode]"].concat([].slice.call(arguments)));
      } catch (_e) {
      }
    }
    function eachClient(fn) {
      fn(r.host);
    }
    function getMod() {
      return r.host;
    }
    function metroRoots() {
      return [r.metro];
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
        } catch (_e) {
        }
      }
      return null;
    }
    function findByName(name) {
      var roots = metroRoots();
      for (var i = 0; i < roots.length; i++) {
        var fn = roots[i].findByName;
        if (!fn) continue;
        try {
          var found = fn.call(roots[i], name);
          if (found) return found;
        } catch (_e) {
        }
      }
      return null;
    }
    function getReact() {
      return r.React;
    }
    function getRN() {
      return r.RN;
    }
    function getNativeModules() {
      return r.RN.NativeModules || {};
    }
    function getPatcher() {
      return r.api.patcher;
    }
    function patchMethod(kind, obj, method, cb) {
      if (typeof obj?.[method] !== "function") return null;
      return r.own(r.api.patcher[kind](method, obj, cb));
    }
    function getStorage() {
      return r.store;
    }
    function processColor(color) {
      var RN = getRN();
      if (RN && typeof RN.processColor === "function") {
        try {
          return RN.processColor(color);
        } catch (_e) {
        }
      }
      if (typeof color === "string" && color.charAt(0) === "#" && color.length === 7) {
        var n = parseInt(color.slice(1), 16);
        if (!isNaN(n)) return (n | 4278190080) >>> 0;
      }
      return color;
    }
    function langKey(lang) {
      var l = String(lang || "").toLowerCase();
      if (l === "js" || l === "jsx") return "javascript";
      if (l === "ts" || l === "tsx") return "typescript";
      if (l === "py") return "python";
      if (l === "sh" || l === "shell") return "bash";
      if (l === "rb") return "ruby";
      if (l === "kt" || l === "kts") return "kotlin";
      if (l === "md") return "markdown";
      if (l === "objc" || l === "objectivec") return "c";
      return l;
    }
    function isSupportedLang(lang) {
      var k = langKey(lang);
      return !!(LANG_LIST[lang] || LANG_LIST[k] || KW[k]);
    }
    function blockLang(obj) {
      if (!obj) return "";
      return obj.lang || obj.language || obj.syntax || "";
    }
    function nodeText(n) {
      if (n == null) return "";
      if (typeof n === "string" || typeof n === "number") return String(n);
      if (Array.isArray(n)) {
        var s = "";
        for (var i = 0; i < n.length; i++) s += nodeText(n[i]);
        return s;
      }
      if (typeof n === "object") return nodeText(n.content) || nodeText(n.text) || "";
      return String(n);
    }
    function highlight(text, lang) {
      var rules = [
        { type: "comment", re: /\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*/ },
        { type: "string", re: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/ },
        { type: "number", re: /\b\d+(?:\.\d+)?\b/ },
        { type: "punctuation", re: /[{}[\]();,.]/ },
        { type: "operator", re: /===|!==|==|!=|<=|>=|=>|\+\+|--|&&|\|\||[+\-*/%=<>!&|]/ }
      ];
      var key = langKey(lang);
      if (KW[key]) rules.splice(2, 0, { type: "keyword", re: new RegExp(KW[key]) });
      if (key === "javascript" || key === "typescript") {
        rules.splice(2, 0, { type: "boolean", re: /\b(?:true|false|null|undefined)\b/ });
        rules.splice(2, 0, { type: "function", re: /\b[A-Za-z_][A-Za-z0-9_]*(?=\s*\()/ });
      }
      var out = [];
      var remaining = String(text);
      while (remaining.length) {
        var best = null;
        for (var i = 0; i < rules.length; i++) {
          var m = remaining.match(rules[i].re);
          if (m && m.index != null && (!best || m.index < best.index)) {
            best = { type: rules[i].type, index: m.index, text: m[0] };
          }
        }
        if (!best) {
          out.push(remaining);
          break;
        }
        if (best.index > 0) out.push(remaining.slice(0, best.index));
        out.push({ type: best.type, content: best.text });
        remaining = remaining.slice(best.index + best.text.length);
      }
      return out;
    }
    function colorNode(text, color) {
      return {
        content: [{ type: "text", content: text }],
        target: "usernameOnClick",
        context: {
          username: 1,
          usernameOnClick: { linkColor: processColor(color) },
          medium: true
        },
        type: "link"
      };
    }
    function highlightText(text, lang) {
      if (getStorage().show_line_num) {
        text = String(text).split("\n").map(function(code, idx) {
          return String(idx + 1).padStart(3) + "  " + code;
        }).join("\n");
      }
      var res = highlight(text, lang);
      var contents = [];
      for (var i = 0; i < res.length; i++) {
        var part = res[i];
        if (typeof part === "object") {
          var style = part.alias || part.type;
          if (THEME[style]) contents.push(colorNode(part.content, THEME[style]));
          else if (DECORATOR[style]) contents.push({ type: DECORATOR[style], content: part.content });
          else contents.push({ type: "text", content: part.content });
        } else {
          contents.push({ type: "text", content: part });
        }
      }
      return contents;
    }
    function highlightCodeNode(obj) {
      var lang = blockLang(obj);
      if (!lang || !isSupportedLang(lang)) return false;
      var src = nodeText(obj.content);
      obj.type = "paragraph";
      obj.content = highlightText(src, lang);
      try {
        delete obj.lang;
      } catch (_e) {
        obj.lang = void 0;
      }
      try {
        delete obj.language;
      } catch (_e2) {
        obj.language = void 0;
      }
      try {
        delete obj.syntax;
      } catch (_e3) {
      }
      return true;
    }
    function walkContent(content) {
      if (typeof content === "string") {
        var converted = transformStringContent(content);
        return converted || [content, []];
      }
      if (!Array.isArray(content)) return [content, []];
      content = content.map(function(obj) {
        if (!obj) return obj;
        var type = obj.type;
        if (type === "codeBlock" || type === "code" || type === "blockCode") {
          highlightCodeNode(obj);
          return obj;
        }
        if (obj.content != null && typeof obj.content === "object") {
          obj.content = walkContent(obj.content)[0];
        }
        return obj;
      });
      return [content, []];
    }
    function transformStringContent(str) {
      var re = /```([A-Za-z0-9_+-]+)\r?\n([\s\S]*?)```/g;
      var parts = [];
      var last = 0;
      var m;
      var found = false;
      while (m = re.exec(str)) {
        found = true;
        if (m.index > last) {
          parts.push({ type: "paragraph", content: [{ type: "text", content: str.slice(last, m.index) }] });
        }
        var lang = m[1];
        var code = m[2];
        if (isSupportedLang(lang)) {
          parts.push({ type: "paragraph", content: highlightText(code, lang) });
        } else {
          parts.push({ type: "codeBlock", lang, content: code });
        }
        last = m.index + m[0].length;
      }
      if (!found) return null;
      if (last < str.length) {
        parts.push({ type: "paragraph", content: [{ type: "text", content: str.slice(last) }] });
      }
      return [parts, []];
    }
    function handleRow(row) {
      if (!row || !row.message || row.message.content == null) return;
      row.message.content = walkContent(row.message.content)[0];
    }
    function transformRowsJson(json) {
      var rows = typeof json === "string" ? JSON.parse(json) : JSON.parse(JSON.stringify(json));
      if (!Array.isArray(rows)) return json;
      for (var i = 0; i < rows.length; i++) handleRow(rows[i]);
      return typeof json === "string" ? JSON.stringify(rows) : rows;
    }
    function start() {
      stop();
      var patcher = getPatcher();
      if (!patcher) {
        log("no patcher");
        return;
      }
      var NM = getNativeModules() || {};
      var patchedRows = false;
      var names = [];
      try {
        names = Object.keys(NM);
      } catch (_e) {
      }
      for (var i = 0; i < names.length; i++) {
        var nativeMod = NM[names[i]];
        if (nativeMod && typeof nativeMod.updateRows === "function") {
          var un = patchMethod("before", nativeMod, "updateRows", function(args) {
            try {
              if (args && args[1] != null) args[1] = transformRowsJson(args[1]);
            } catch (err) {
              logError("updateRows", err);
            }
          });
          if (un) {
            unpatches.push(un);
            patchedRows = true;
            log("updateRows on", names[i]);
          }
        }
      }
      var dcd = NM.DCDChatManager;
      if (!patchedRows && dcd && typeof dcd.updateRows === "function") {
        var unDcd = patchMethod("before", dcd, "updateRows", function(args) {
          try {
            if (args && args[1] != null) args[1] = transformRowsJson(args[1]);
          } catch (err2) {
            logError("updateRows", err2);
          }
        });
        if (unDcd) {
          unpatches.push(unDcd);
          patchedRows = true;
        }
      }
      var RowManager = findByName("RowManager");
      var proto = RowManager && (RowManager.prototype || RowManager);
      if (proto && typeof proto.generate === "function") {
        var unRm = patchMethod("after", proto, "generate", function(_args, row) {
          try {
            row = JSON.parse(JSON.stringify(row));
            handleRow(row);
          } catch (err3) {
            logError("RowManager.generate", err3);
          }
          return row;
        });
        if (unRm) unpatches.push(unRm);
      }
      log("started", "nativeKeys=" + names.slice(0, 12).join(","), "rows=" + patchedRows);
    }
    function stop() {
      for (var i = 0; i < unpatches.length; i++) {
        try {
          if (typeof unpatches[i] === "function") unpatches[i]();
        } catch (_e) {
        }
      }
      unpatches = [];
    }
    function SettingsComponent() {
      r.useRefresh();
      var React = getReact();
      if (!React) return null;
      var store = getStorage();
      var comps = getMod().metro && getMod().metro.common && getMod().metro.common.components || {};
      var TableSwitchRow = comps.TableSwitchRow;
      var TableRowGroup = comps.TableRowGroup;
      var [, bump] = React.useState(0);
      var row = TableSwitchRow ? React.createElement(TableSwitchRow, {
        label: "Show line numbers",
        value: !!store.show_line_num,
        onValueChange: function(v) {
          r.set("show_line_num", v);
          bump(function(n) {
            return n + 1;
          });
        }
      }) : null;
      if (TableRowGroup) return React.createElement(TableRowGroup, { title: "HighlightCode" }, row);
      var RN = getRN();
      if (RN && RN.View) return React.createElement(RN.View, { style: { padding: 12 } }, row);
      return row;
    }
    return { start, stop, Settings: SettingsComponent, highlight, highlightText, walkContent, transformRowsJson, isSupportedLang, langKey, getStorage, nodeText };
  }
  HighlightCode.defaults = { show_line_num: false };

  // HighlightCode.entry.js
  var HighlightCode_entry_default = register({ "id": "mime.highlightcode", "name": "HighlightCode", "description": "Highlight supported native chat code blocks.", "version": "2.2.1", "authors": [{ "name": "mafu", "id": "519760564755365888" }, { "name": "Mime | N0_.q3", "id": "957164619061932045" }], "license": "GPL-3.0-or-later", "source": "https://github.com/xMimiez/Snow-Plugins/tree/main/HighlightCode" }, HighlightCode);
  return __toCommonJS(HighlightCode_entry_exports);
})();
