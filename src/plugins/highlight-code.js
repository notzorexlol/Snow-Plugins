import { ui } from '../runtime.js';
// Original: mafu. Native Snow port: Mime.
export default function HighlightCode(r) {
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
    try { console.log.apply(console, ["[HighlightCode]"].concat([].slice.call(arguments))); } catch (_e) {}
}
function logError() {
    try { console.error.apply(console, ["[HighlightCode]"].concat([].slice.call(arguments))); } catch (_e) {}
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

function findByName(name) {
    var roots = metroRoots();
    for (var i = 0; i < roots.length; i++) {
        var fn = roots[i].findByName;
        if (!fn) continue;
        try {
            var found = fn.call(roots[i], name);
            if (found) return found;
        } catch (_e) {}
    }
    return null;
}

function getReact() { return r.React; }

function getRN() { return r.RN; }

function getNativeModules() { return r.RN.NativeModules || {}; }

function getPatcher() { return r.api.patcher; }

function patchMethod(kind, obj, method, cb) {
    if (typeof obj?.[method] !== 'function') return null;
    return r.own(r.api.patcher[kind](method, obj, cb));
}

function getStorage() { return r.store; }

function processColor(color) {
    var RN = getRN();
    if (RN && typeof RN.processColor === "function") {
        try { return RN.processColor(color); } catch (_e) {}
    }
    if (typeof color === "string" && color.charAt(0) === "#" && color.length === 7) {
        var n = parseInt(color.slice(1), 16);
        if (!isNaN(n)) return (n | 0xff000000) >>> 0;
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
        text = String(text).split("\n").map(function (code, idx) {
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
    try { delete obj.lang; } catch (_e) { obj.lang = undefined; }
    try { delete obj.language; } catch (_e2) { obj.language = undefined; }
    try { delete obj.syntax; } catch (_e3) {}
    return true;
}

function walkContent(content) {
    if (typeof content === "string") {
        var converted = transformStringContent(content);
        return converted || [content, []];
    }
    if (!Array.isArray(content)) return [content, []];
    content = content.map(function (obj) {
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
    while ((m = re.exec(str))) {
        found = true;
        if (m.index > last) {
            parts.push({ type: "paragraph", content: [{ type: "text", content: str.slice(last, m.index) }] });
        }
        var lang = m[1];
        var code = m[2];
        if (isSupportedLang(lang)) {
            parts.push({ type: "paragraph", content: highlightText(code, lang) });
        } else {
            parts.push({ type: "codeBlock", lang: lang, content: code });
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
    try { names = Object.keys(NM); } catch (_e) {}
    for (var i = 0; i < names.length; i++) {
        var nativeMod = NM[names[i]];
        if (nativeMod && typeof nativeMod.updateRows === "function") {
            var un = patchMethod("before", nativeMod, "updateRows", function (args) {
                try { if (args && args[1] != null) args[1] = transformRowsJson(args[1]); } catch (err) { logError("updateRows", err); }
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
        var unDcd = patchMethod("before", dcd, "updateRows", function (args) {
            try { if (args && args[1] != null) args[1] = transformRowsJson(args[1]); } catch (err2) { logError("updateRows", err2); }
        });
        if (unDcd) {
            unpatches.push(unDcd);
            patchedRows = true;
        }
    }
    var RowManager = findByName("RowManager");
    var proto = RowManager && (RowManager.prototype || RowManager);
    if (proto && typeof proto.generate === "function") {
        var unRm = patchMethod("after", proto, "generate", function (_args, row) {
            try { row = JSON.parse(JSON.stringify(row)); handleRow(row); } catch (err3) { logError("RowManager.generate", err3); }
            return row;
        });
        if (unRm) unpatches.push(unRm);
    }
    log("started", "nativeKeys=" + names.slice(0, 12).join(","), "rows=" + patchedRows);
}

function stop() {
    for (var i = 0; i < unpatches.length; i++) {
        try { if (typeof unpatches[i] === "function") unpatches[i](); } catch (_e) {}
    }
    unpatches = [];
}

function SettingsComponent() {
    r.useRefresh();
    var React = getReact();
    if (!React) return null;
    var store = getStorage();
    var comps = (getMod().metro && getMod().metro.common && getMod().metro.common.components) || {};
    var TableSwitchRow = comps.TableSwitchRow;
    var TableRowGroup = comps.TableRowGroup;
    var [, bump] = React.useState(0);
    var row = TableSwitchRow
        ? React.createElement(TableSwitchRow, {
            label: "Show line numbers",
            value: !!store.show_line_num,
            onValueChange: function (v) { r.set('show_line_num', v); bump(function (n) { return n + 1; }); }
        })
        : null;
    if (TableRowGroup) return React.createElement(TableRowGroup, { title: "HighlightCode" }, row);
    var RN = getRN();
    if (RN && RN.View) return React.createElement(RN.View, { style: { padding: 12 } }, row);
    return row;
}


return { start, stop, Settings: SettingsComponent, highlight, highlightText, walkContent, transformRowsJson, isSupportedLang, langKey, getStorage, nodeText };
}
HighlightCode.defaults = { show_line_num: false };
