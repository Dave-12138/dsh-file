window.__ModuleLoader__.load({
  id: "dsh-file",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

"use strict";
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

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/remote.ts
var passthrough = { parse: (value) => value };
var jsonParam = (name) => ({
  name,
  wire: name,
  source: "json",
  codec: { mode: "strict", typeSymbol: "json", schema: passthrough }
});
var jsonResult = { mode: "strict", typeSymbol: "json", schema: passthrough };
var direct = (method, parameters) => ({
  id: `dsh-file#fileManager/${method}`,
  service: "fileManager",
  namespace: "fileManager",
  method,
  invocation: { kind: "direct" },
  parameters: parameters.map(jsonParam),
  result: jsonResult
});
var TYPERT_REMOTE = {
  package: "dsh-file",
  descriptors: [
    direct("listDir", ["path"]),
    direct("readText", ["path"]),
    direct("writeText", ["path", "content"]),
    direct("createFile", ["path"]),
    direct("createDirectory", ["path"]),
    direct("rename", ["from", "to"]),
    direct("delete", ["path"]),
    direct("stat", ["path"]),
    direct("resolve", ["path"]),
    direct("getRoot", []),
    direct("setRoot", ["path"])
  ]
};
function unwrap(result) {
  if (result.ok) return result.value;
  const { code, message } = result.error;
  const err = new Error(`${message}${code ? ` (${code})` : ""}`);
  err.code = code;
  throw err;
}

// src/client/FileManagerPanel.tsx
var import_react3 = require("react");

// src/client/FileTree.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}
var FileTree = (0, import_react.forwardRef)(function FileTree2({ remote, root, onOpenFile, onRename, onDelete }, ref) {
  const [expanded, setExpanded] = (0, import_react.useState)({ [root]: { path: root, entries: null } });
  const [selected, setSelected] = (0, import_react.useState)(null);
  const [rev, setRev] = (0, import_react.useState)(0);
  const loaded = (0, import_react.useRef)({});
  const loadDir = (0, import_react.useCallback)(
    async (path) => {
      setExpanded((prev) => ({ ...prev, [path]: { ...prev[path] ?? { path }, entries: null, error: void 0 } }));
      try {
        const value = unwrap(await remote.listDir(path));
        setExpanded((prev) => ({ ...prev, [path]: { path, entries: value.entries } }));
      } catch (error) {
        setExpanded((prev) => ({ ...prev, [path]: { path, entries: [], error: error instanceof Error ? error.message : String(error) } }));
      }
    },
    [remote]
  );
  (0, import_react.useEffect)(() => {
    void loadDir(root);
  }, [root, rev, loadDir]);
  (0, import_react.useImperativeHandle)(ref, () => ({
    selected: () => selected,
    refresh: () => setRev((v) => v + 1),
    cwd: () => {
      if (selected === null) return root;
      const last = selected.split("/").filter(Boolean).pop() ?? "";
      if (expanded[selected] !== void 0) return selected;
      return selected.slice(0, selected.length - last.length - 1) || root;
    }
  }), [selected, root, expanded]);
  const node = expanded[root];
  const renderLevel = (0, import_react.useCallback)(
    (path, entries, depth) => {
      return entries.map((entry) => {
        const full = `${path.replace(/\/$/, "")}/${entry.name}`;
        const isDir = entry.type === "directory";
        const isOpen = expanded[full] !== void 0;
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "div",
            {
              className: cx("dshf-node", selected === full && "dshf-selected"),
              style: { paddingLeft: `${8 + depth * 14}px` },
              onClick: () => {
                setSelected(full);
                if (isDir) {
                  if (isOpen) {
                    setExpanded((prev) => {
                      const next = { ...prev };
                      delete next[full];
                      return next;
                    });
                  } else {
                    void loadDir(full);
                  }
                } else {
                  onOpenFile(full);
                }
              },
              onDoubleClick: () => {
                if (!isDir && selected === full) onOpenFile(full);
              },
              title: full,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshf-caret", children: isDir ? isOpen ? "\u25BE" : "\u25B8" : "" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cx("dshf-icon", isDir ? "dshf-icon-dir" : "dshf-icon-file"), children: isDir ? "\u{1F4C1}" : "\u{1F4C4}" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshf-name", children: entry.name }),
                isDir && isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dshf-node-actions", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dshf-mini", title: "\u91CD\u547D\u540D", onClick: (e) => {
                    e.stopPropagation();
                    onRename(full);
                  }, children: "\u270E" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dshf-mini", title: "\u5220\u9664", onClick: (e) => {
                    e.stopPropagation();
                    onDelete(full);
                  }, children: "\u{1F5D1}" })
                ] }),
                !isDir && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dshf-node-actions", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dshf-mini", title: "\u91CD\u547D\u540D", onClick: (e) => {
                    e.stopPropagation();
                    onRename(full);
                  }, children: "\u270E" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dshf-mini", title: "\u5220\u9664", onClick: (e) => {
                    e.stopPropagation();
                    onDelete(full);
                  }, children: "\u{1F5D1}" })
                ] })
              ]
            }
          ),
          isDir && isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            DirChildren,
            {
              node: expanded[full],
              depth: depth + 1,
              onRender: renderLevel,
              onLoad: loadDir
            }
          )
        ] }, full);
      });
    },
    [expanded, selected, loadDir, onOpenFile, onRename, onDelete]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshf-tree-scroll", children: node === void 0 ? null : node.entries === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshf-tree-hint", children: node.error ? `\u52A0\u8F7D\u5931\u8D25: ${node.error}` : "\u52A0\u8F7D\u4E2D\u2026" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshf-tree-list", children: [
    node.entries.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshf-tree-hint", children: "\uFF08\u7A7A\u76EE\u5F55\uFF09" }),
    renderLevel(root, node.entries, 0)
  ] }) });
});
function DirChildren({ node, depth, onRender, onLoad }) {
  if (node === void 0 || node.entries === null) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshf-tree-hint", style: { paddingLeft: `${8 + depth * 14}px` }, children: node?.error ?? "\u52A0\u8F7D\u4E2D\u2026" });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: onRender(node.path, node.entries, depth) });
}

// src/client/store.ts
var import_react2 = require("react");
var tabs = [];
var activePath = null;
var listeners = /* @__PURE__ */ new Set();
function emit() {
  for (const listener of listeners) listener();
}
function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function snapshot() {
  return tabs;
}
function snapshotActive() {
  return activePath;
}
function useTabs() {
  return (0, import_react2.useSyncExternalStore)(subscribe, snapshot);
}
function useActivePath() {
  return (0, import_react2.useSyncExternalStore)(subscribe, snapshotActive);
}
function openTab(tab) {
  const existing = tabs.find((t) => t.path === tab.path);
  if (existing) {
    activePath = tab.path;
  } else {
    tabs = [...tabs, tab];
    activePath = tab.path;
  }
  emit();
}
function focusTab(path) {
  if (tabs.some((t) => t.path === path)) {
    activePath = path;
    emit();
  }
}
function updateActiveContent(content) {
  if (activePath === null) return;
  tabs = tabs.map((t) => t.path === activePath ? { ...t, content, dirty: content !== t.savedContent } : t);
  emit();
}
function markSaved(path) {
  tabs = tabs.map((t) => t.path === path ? { ...t, savedContent: t.content, dirty: false } : t);
  emit();
}
function closeTab(path) {
  tabs = tabs.filter((t) => t.path !== path);
  if (activePath === path) {
    activePath = tabs.length > 0 ? tabs[tabs.length - 1].path : null;
  }
  emit();
}
function renameTab(from, to) {
  tabs = tabs.map((t) => t.path === from ? { ...t, path: to } : t);
  if (activePath === from) activePath = to;
  emit();
}
function removeTabs(paths) {
  const gone = new Set(paths);
  tabs = tabs.filter((t) => !gone.has(t.path));
  if (activePath !== null && gone.has(activePath)) {
    activePath = tabs.length > 0 ? tabs[tabs.length - 1].path : null;
  }
  emit();
}
function closeEditor() {
  activePath = null;
  emit();
}
function resetAll() {
  tabs = [];
  activePath = null;
  emit();
}
var editorViewActive = false;
var viewListeners = /* @__PURE__ */ new Set();
function emitView() {
  for (const listener of viewListeners) listener();
}
function setEditorViewActive(active) {
  if (editorViewActive === active) return;
  editorViewActive = active;
  emitView();
}
function isEditorViewActive() {
  return editorViewActive;
}
function subscribeEditorViewActive(listener) {
  viewListeners.add(listener);
  return () => {
    viewListeners.delete(listener);
  };
}

// src/client/FileManagerPanel.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function cx2(...parts) {
  return parts.filter(Boolean).join(" ");
}
function FileManagerPanel({ remote, onClose, useSessions }) {
  const [root, setRoot] = (0, import_react3.useState)(null);
  const [rootError, setRootError] = (0, import_react3.useState)(null);
  const [busy, setBusy] = (0, import_react3.useState)(false);
  const [notice, setNotice] = (0, import_react3.useState)(null);
  const treeRef = (0, import_react3.useRef)(null);
  const sessionCwd = useSessions ? useSessions((s) => s.current !== void 0 ? s.byId[s.current]?.cwd : void 0) : void 0;
  (0, import_react3.useEffect)(() => {
    let cancelled = false;
    (async () => {
      try {
        if (sessionCwd !== void 0) {
          try {
            await unwrap(await remote.setRoot(sessionCwd));
          } catch {
          }
        }
        const { path } = unwrap(await remote.getRoot());
        if (!cancelled) {
          setRoot(path);
          setRootError(null);
        }
      } catch (error) {
        if (!cancelled) setRootError(error instanceof Error ? error.message : String(error));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [remote, sessionCwd]);
  (0, import_react3.useEffect)(() => () => {
    resetAll();
  }, []);
  const handleNotice = (0, import_react3.useCallback)((message) => {
    setNotice(message);
  }, []);
  const openFile = (0, import_react3.useCallback)(
    async (path) => {
      setBusy(true);
      try {
        const value = unwrap(await remote.readText(path));
        openTab({ path, content: value.content, savedContent: value.content, mtimeMs: value.mtimeMs, dirty: false });
      } catch (error) {
        handleNotice(`\u6253\u5F00\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setBusy(false);
      }
    },
    [remote, handleNotice]
  );
  const handleCreate = (0, import_react3.useCallback)(
    async (kind) => {
      const cwd = treeRef.current?.cwd() ?? root ?? "";
      const name = window.prompt(kind === "directory" ? "\u65B0\u5EFA\u76EE\u5F55\u540D\u79F0:" : "\u65B0\u5EFA\u6587\u4EF6\u540D\u79F0:");
      if (!name) return;
      setBusy(true);
      try {
        const target = `${cwd.replace(/\/$/, "")}/${name}`;
        if (kind === "directory") await unwrap(await remote.createDirectory(target));
        else {
          await unwrap(await remote.createFile(target));
          await openFile(target);
        }
        treeRef.current?.refresh();
        handleNotice(kind === "directory" ? `\u5DF2\u521B\u5EFA\u76EE\u5F55 ${name}` : `\u5DF2\u521B\u5EFA\u6587\u4EF6 ${name}`);
      } catch (error) {
        handleNotice(`\u521B\u5EFA\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setBusy(false);
      }
    },
    [remote, root, openFile, handleNotice]
  );
  const handleRename = (0, import_react3.useCallback)(
    async (from) => {
      const name = window.prompt("\u91CD\u547D\u540D\u4E3A:", from.split("/").pop() ?? "");
      if (!name || name === from.split("/").pop()) return;
      const to = `${from.slice(0, from.lastIndexOf("/"))}/${name}`;
      setBusy(true);
      try {
        await unwrap(await remote.rename(from, to));
        renameTab(from, to);
        treeRef.current?.refresh();
        handleNotice(`\u5DF2\u91CD\u547D\u540D ${name}`);
      } catch (error) {
        handleNotice(`\u91CD\u547D\u540D\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setBusy(false);
      }
    },
    [remote, handleNotice]
  );
  const handleDelete = (0, import_react3.useCallback)(
    async (path) => {
      if (!window.confirm(`\u786E\u5B9A\u5220\u9664 ${path}\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002`)) return;
      setBusy(true);
      try {
        await unwrap(await remote.delete(path));
        removeTabs([path]);
        treeRef.current?.refresh();
        handleNotice("\u5DF2\u5220\u9664");
      } catch (error) {
        handleNotice(`\u5220\u9664\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setBusy(false);
      }
    },
    [remote, handleNotice]
  );
  const title = (0, import_react3.useMemo)(() => {
    if (root === null) return "\u2026";
    return root.split("/").filter(Boolean).pop() || "/";
  }, [root]);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshf-root", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshf-toolbar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dshf-title", title: root ?? "", children: title }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dshf-spacer" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dshf-btn", title: "\u65B0\u5EFA\u6587\u4EF6", onClick: () => void handleCreate("file"), children: "\uFF0B\u6587\u4EF6" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dshf-btn", title: "\u65B0\u5EFA\u76EE\u5F55", onClick: () => void handleCreate("directory"), children: "\uFF0B\u76EE\u5F55" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dshf-btn", title: "\u5173\u95ED\u6587\u4EF6\u7BA1\u7406\u5668", onClick: onClose, children: "\u2715" })
    ] }),
    rootError !== null && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dshf-error", children: rootError }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dshf-tree-pane", children: root !== null && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      FileTree,
      {
        ref: treeRef,
        remote,
        root,
        onOpenFile: (p) => void openFile(p),
        onRename: (p) => void handleRename(p),
        onDelete: (p) => void handleDelete(p)
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshf-status", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dshf-status-busy", children: busy ? "\u2026" : "" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: cx2("dshf-status-notice", notice === null && "dshf-hidden"), children: notice ?? "" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dshf-spacer" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dshf-status-hint", children: "\u70B9\u6587\u4EF6\u540E\u5728\u4E0A\u65B9\u300C\u6587\u4EF6\u300D\u6807\u7B7E\u4E2D\u7F16\u8F91" })
    ] })
  ] });
}

// src/client/FileEditorView.tsx
var import_react5 = require("react");

// src/client/monaco.ts
var MONACO_BASE = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs";
var loading = null;
var failed = false;
function loadLoader() {
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = `${MONACO_BASE}/loader.js`;
    el.async = true;
    el.addEventListener("load", () => resolve());
    el.addEventListener("error", () => reject(new Error("failed to load monaco loader")));
    document.head.append(el);
  });
}
function ensureMonaco() {
  if (failed) return Promise.reject(new Error("monaco previously failed to load"));
  if (loading) return loading;
  loading = (async () => {
    try {
      await loadLoader();
      await new Promise((resolve, reject) => {
        window.require.config({ paths: { vs: MONACO_BASE } });
        window.require(["vs/editor/editor.main"], () => resolve(), (err) => reject(err));
      });
      return window.monaco;
    } catch (error) {
      failed = true;
      loading = null;
      throw error;
    }
  })();
  return loading;
}

// src/client/themeStore.ts
var import_react4 = require("react");
var EDITOR_THEME_PRESETS = {
  light: { background: "#ffffff", foreground: "#1f2328", fontSize: 13 },
  dark: { background: "#1e1e1e", foreground: "#d4d4d4", fontSize: 13 },
  "one-dark": { background: "#282c34", foreground: "#abb2bf", fontSize: 13 },
  github: { background: "#ffffff", foreground: "#24292e", fontSize: 13 }
};
var EDITOR_THEME_PRESET_ORDER = ["light", "dark", "one-dark", "github"];
var EDITOR_THEME_PRESET_LABELS = {
  light: "\u6D45\u8272",
  dark: "\u6DF1\u8272",
  "one-dark": "One Dark",
  github: "GitHub"
};
var DEFAULT_EDITOR_THEME = { ...EDITOR_THEME_PRESETS.light };
function hexToRgb(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  if (Number.isNaN(n) || h.length !== 6) return [0, 0, 0];
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
function rgbToHex(r, g, b) {
  const c = (x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
function mixColors(a, b, amount) {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * amount, ag + (bg - ag) * amount, ab + (bb - ab) * amount);
}
function luminanceOf(hex) {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
function isLightColor(hex) {
  return luminanceOf(hex) > 0.5;
}
function themeChrome(theme) {
  const light = isLightColor(theme.background);
  const chrome = mixColors(theme.background, light ? "#000000" : "#ffffff", light ? 0.06 : 0.08);
  const border = mixColors(theme.background, light ? "#000000" : "#ffffff", light ? 0.22 : 0.18);
  const muted = mixColors(theme.foreground, theme.background, 0.45);
  const chip = mixColors(theme.background, light ? "#000000" : "#ffffff", light ? 0.05 : 0.06);
  const dirty = light ? "#c2410c" : "#e2c08d";
  return { chrome, border, muted, chip, dirty };
}
var STORAGE_KEY = "dsh-file:editor-theme:v2";
var HEX6 = /^#[0-9a-f]{6}$/i;
function load() {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.background === "string" && HEX6.test(parsed.background) && typeof parsed?.foreground === "string" && HEX6.test(parsed.foreground)) {
          return {
            background: parsed.background.toLowerCase(),
            foreground: parsed.foreground.toLowerCase(),
            fontSize: typeof parsed.fontSize === "number" && parsed.fontSize > 0 ? parsed.fontSize : 13
          };
        }
      }
    }
  } catch {
  }
  return { ...DEFAULT_EDITOR_THEME };
}
var current = load();
var listeners2 = /* @__PURE__ */ new Set();
function emit2() {
  for (const listener of listeners2) listener();
}
function subscribe2(listener) {
  listeners2.add(listener);
  return () => {
    listeners2.delete(listener);
  };
}
function snapshot2() {
  return current;
}
function useEditorTheme() {
  return (0, import_react4.useSyncExternalStore)(subscribe2, snapshot2);
}
function setEditorTheme(partial) {
  current = { ...current, ...partial };
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
  }
  emit2();
}
function resetEditorTheme() {
  current = { ...DEFAULT_EDITOR_THEME };
  try {
    if (typeof localStorage !== "undefined") localStorage.removeItem(STORAGE_KEY);
  } catch {
  }
  emit2();
}
function presetIdOf(theme) {
  for (const [id, preset] of Object.entries(EDITOR_THEME_PRESETS)) {
    if (preset.background === theme.background && preset.foreground === theme.foreground) return id;
  }
  return void 0;
}
function exportThemeText(theme, name) {
  return JSON.stringify({
    name,
    type: "dsh-file-theme",
    version: 1,
    background: theme.background,
    foreground: theme.foreground,
    fontSize: theme.fontSize,
    colors: {
      "editor.background": theme.background,
      "editor.foreground": theme.foreground
    }
  }, null, 2);
}
function parseImportedTheme(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("\u6587\u4EF6\u4E0D\u662F\u6709\u6548\u7684 JSON");
  }
  if (typeof data !== "object" || data === null) throw new Error("JSON \u5185\u5BB9\u5FC5\u987B\u662F\u5BF9\u8C61");
  const obj = data;
  let background = typeof obj.background === "string" ? obj.background : void 0;
  let foreground = typeof obj.foreground === "string" ? obj.foreground : void 0;
  if ((background === void 0 || foreground === void 0) && typeof obj.colors === "object" && obj.colors !== null) {
    const colors = obj.colors;
    if (background === void 0) background = typeof colors["editor.background"] === "string" ? colors["editor.background"] : void 0;
    if (foreground === void 0) foreground = typeof colors["editor.foreground"] === "string" ? colors["editor.foreground"] : void 0;
  }
  if (background === void 0 || !HEX6.test(background)) {
    throw new Error('\u7F3A\u5C11\u6709\u6548\u7684\u80CC\u666F\u8272\uFF08background \u6216 colors["editor.background"]\uFF0C\u9700\u8981 #rrggbb\uFF09');
  }
  if (foreground === void 0 || !HEX6.test(foreground)) {
    throw new Error('\u7F3A\u5C11\u6709\u6548\u7684\u6587\u5B57\u8272\uFF08foreground \u6216 colors["editor.foreground"]\uFF0C\u9700\u8981 #rrggbb\uFF09');
  }
  const fontSize = typeof obj.fontSize === "number" && obj.fontSize > 0 ? obj.fontSize : 13;
  const name = typeof obj.name === "string" && obj.name.trim() ? obj.name.trim() : void 0;
  return { name, background: background.toLowerCase(), foreground: foreground.toLowerCase(), fontSize };
}

// src/client/FileEditorView.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
function cx3(...parts) {
  return parts.filter(Boolean).join(" ");
}
function FileEditorView({ remote, t }) {
  const tabs2 = useTabs();
  const activePath2 = useActivePath();
  const active = activePath2 === null ? void 0 : tabs2.find((t2) => t2.path === activePath2);
  const [busy, setBusy] = (0, import_react5.useState)(false);
  const [notice, setNotice] = (0, import_react5.useState)(null);
  const theme = useEditorTheme();
  const chrome = themeChrome(theme);
  (0, import_react5.useEffect)(() => {
    setEditorViewActive(true);
    return () => setEditorViewActive(false);
  }, []);
  const saveActive = (0, import_react5.useCallback)(async () => {
    if (active === void 0 || !active.dirty) return;
    setBusy(true);
    try {
      await unwrap(await remote.writeText(active.path, active.content));
      markSaved(active.path);
      setNotice(`\u5DF2\u4FDD\u5B58 ${active.path.split("/").pop()}`);
    } catch (error) {
      setNotice(`\u4FDD\u5B58\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  }, [active, remote]);
  const saveRef = (0, import_react5.useRef)(saveActive);
  saveRef.current = saveActive;
  (0, import_react5.useEffect)(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveRef.current();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  const themeVars = {
    "--dshf-bg": theme.background,
    "--dshf-fg": theme.foreground,
    "--dshf-chrome": chrome.chrome,
    "--dshf-border": chrome.border,
    "--dshf-muted": chrome.muted,
    "--dshf-chip": chrome.chip,
    "--dshf-dirty": chrome.dirty,
    "--dshf-accent": "#094771",
    "--dshf-font-size": `${theme.fontSize}px`
  };
  if (active === void 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dshf-editor-view", style: themeVars, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dshf-editor-toolbar", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dshf-title", children: t ? t("view.label") : "\u6587\u4EF6" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dshf-spacer" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ThemeButton, {})
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dshf-empty", children: t ? t("view.empty") : "\u5728\u5DE6\u4FA7\u6587\u4EF6\u6811\u4E2D\u9009\u62E9\u4E00\u4E2A\u6587\u4EF6\uFF0C\u5373\u53EF\u5728\u6B64\u7F16\u8F91" })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dshf-editor-view", style: themeVars, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dshf-editor-toolbar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: cx3("dshf-tabname", active.dirty && "dshf-dirty"), title: active.path, children: [
        active.dirty ? "\u25CF " : "",
        active.path.split("/").pop()
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dshf-spacer" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dshf-editor-path", title: active.path, children: active.path }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ThemeButton, {}),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "button",
        {
          type: "button",
          className: "dshf-btn",
          title: "\u4FDD\u5B58 (Ctrl+S)",
          disabled: !active.dirty || busy,
          onClick: () => void saveActive(),
          children: "\u4FDD\u5B58"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "button",
        {
          type: "button",
          className: "dshf-btn",
          title: "\u5173\u95ED\u5F53\u524D\u6587\u4EF6",
          disabled: tabs2.length <= 1,
          onClick: closeEditor,
          children: "\u2715"
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: cx3("dshf-status", "dshf-status-top"), children: [
      tabs2.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dshf-tabs-strip", children: tabs2.map((t2) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
        "span",
        {
          className: cx3("dshf-tab-chip", t2.path === activePath2 && "dshf-tab-chip-active"),
          title: t2.path,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "button",
              {
                type: "button",
                className: "dshf-tab-chip-name",
                onClick: () => focusTab(t2.path),
                children: t2.path.split("/").pop()
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "button",
              {
                type: "button",
                className: "dshf-tab-chip-close",
                "aria-label": `\u5173\u95ED ${t2.path.split("/").pop()}`,
                title: "\u5173\u95ED",
                onClick: () => closeTab(t2.path),
                children: "\u2715"
              }
            )
          ]
        },
        t2.path
      )) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "dshf-status-meta", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dshf-status-busy", children: busy ? "\u2026" : "" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: cx3("dshf-status-notice", notice === null && "dshf-hidden"), children: notice ?? "" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      EditorPane,
      {
        path: active.path,
        content: active.content,
        onChange: updateActiveContent,
        theme
      },
      active.path
    )
  ] });
}
function ThemeButton() {
  const [open, setOpen] = (0, import_react5.useState)(false);
  const [importError, setImportError] = (0, import_react5.useState)(null);
  const fileRef = (0, import_react5.useRef)(null);
  const theme = useEditorTheme();
  const presetId = presetIdOf(theme);
  const handleExport = () => {
    const name = presetId !== void 0 ? `dsh-file \xB7 ${EDITOR_THEME_PRESET_LABELS[presetId] ?? presetId}` : "dsh-file \xB7 \u81EA\u5B9A\u4E49";
    const text = exportThemeText(theme, name);
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dsh-file-theme-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = parseImportedTheme(String(reader.result ?? ""));
        setEditorTheme({ background: imported.background, foreground: imported.foreground, fontSize: imported.fontSize });
        setImportError(null);
      } catch (error) {
        setImportError(error instanceof Error ? error.message : String(error));
      }
    };
    reader.onerror = () => setImportError("\u8BFB\u53D6\u6587\u4EF6\u5931\u8D25");
    reader.readAsText(file);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "dshf-theme-wrap", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "button",
      {
        type: "button",
        className: "dshf-btn",
        title: "\u7F16\u8F91\u5668\u4E3B\u9898\u8BBE\u7F6E",
        onClick: () => setOpen((v) => !v),
        children: "\u4E3B\u9898"
      }
    ),
    open && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dshf-theme-panel", role: "dialog", "aria-label": "\u7F16\u8F91\u5668\u4E3B\u9898", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { className: "dshf-theme-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dshf-theme-label", children: "\u9884\u8BBE" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "select",
          {
            className: "dshf-theme-select",
            value: presetId ?? "custom",
            onChange: (e) => {
              const preset = EDITOR_THEME_PRESETS[e.target.value];
              if (preset) setEditorTheme(preset);
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "custom", disabled: true, children: "\u81EA\u5B9A\u4E49" }),
              EDITOR_THEME_PRESET_ORDER.map((id) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: id, children: EDITOR_THEME_PRESET_LABELS[id] ?? id }, id))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { className: "dshf-theme-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dshf-theme-label", children: "\u80CC\u666F" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            type: "color",
            value: theme.background,
            onChange: (e) => setEditorTheme({ background: e.target.value })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("code", { className: "dshf-theme-hex", children: theme.background })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { className: "dshf-theme-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dshf-theme-label", children: "\u6587\u5B57" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            type: "color",
            value: theme.foreground,
            onChange: (e) => setEditorTheme({ foreground: e.target.value })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("code", { className: "dshf-theme-hex", children: theme.foreground })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { className: "dshf-theme-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dshf-theme-label", children: "\u5B57\u53F7" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            type: "number",
            className: "dshf-theme-fontsize",
            min: 10,
            max: 28,
            value: theme.fontSize,
            onChange: (e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n) && n > 0) setEditorTheme({ fontSize: n });
            }
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dshf-theme-unit", children: "px" })
      ] }),
      importError !== null && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dshf-theme-error", children: importError }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dshf-theme-row dshf-theme-actions", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "dshf-btn", title: "\u5C06\u5F53\u524D\u4E3B\u9898\u4FDD\u5B58\u4E3A JSON \u6587\u4EF6", onClick: handleExport, children: "\u5BFC\u51FA\u4E3B\u9898" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "dshf-btn", title: "\u4ECE JSON \u6587\u4EF6\u5BFC\u5165\u4E3B\u9898", onClick: () => fileRef.current?.click(), children: "\u5BFC\u5165\u4E3B\u9898" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            ref: fileRef,
            type: "file",
            accept: ".json,application/json",
            className: "dshf-hidden-input",
            onChange: handleImportFile
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "dshf-btn", title: "\u6062\u590D\u9ED8\u8BA4\u6D45\u8272\u4E3B\u9898", onClick: () => resetEditorTheme(), children: "\u91CD\u7F6E" })
      ] })
    ] })
  ] });
}
function EditorPane({ path, content, onChange, theme }) {
  const [mode, setMode] = (0, import_react5.useState)("loading");
  const [monacoLib, setMonacoLib] = (0, import_react5.useState)(null);
  const hostRef = (0, import_react5.useRef)(null);
  const editorRef = (0, import_react5.useRef)(null);
  const onChangeRef = (0, import_react5.useRef)(onChange);
  onChangeRef.current = onChange;
  const initialRef = (0, import_react5.useRef)(content);
  initialRef.current = content;
  (0, import_react5.useEffect)(() => {
    let disposed = false;
    setMode("loading");
    ensureMonaco().then((monaco) => {
      if (disposed) return;
      setMonacoLib(monaco);
      setMode("monaco");
    }).catch(() => {
      if (!disposed) setMode("textarea");
    });
    return () => {
      disposed = true;
      setMonacoLib(null);
    };
  }, [path]);
  (0, import_react5.useEffect)(() => {
    if (mode !== "monaco" || monacoLib === null || hostRef.current === null) return;
    const initial = initialRef.current;
    const monacoAny = monacoLib;
    const editor = monacoAny.editor.create(hostRef.current, {
      value: initial,
      language: languageOf(path),
      automaticLayout: true,
      fontSize: theme.fontSize,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      tabSize: 2
    });
    editor.onDidChangeModelContent(() => onChangeRef.current(editor.getValue()));
    editorRef.current = editor;
    return () => {
      editor.dispose();
      editorRef.current = null;
    };
  }, [mode, monacoLib, path]);
  (0, import_react5.useEffect)(() => {
    if (mode !== "monaco" || monacoLib === null) return;
    const monacoAny = monacoLib;
    try {
      const light = isLightColor(theme.background);
      monacoAny.editor.defineTheme("dshf-editor", {
        base: light ? "vs" : "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": theme.background,
          "editor.foreground": theme.foreground,
          "editorLineNumber.foreground": mixColors(theme.foreground, theme.background, 0.45),
          "editorLineNumber.activeForeground": theme.foreground,
          "editorCursor.foreground": theme.foreground,
          "editor.selectionBackground": light ? "#add6ff" : "#264f78",
          "editor.inactiveSelectionBackground": light ? "#e5ebf1" : "#3a3d41",
          "editor.lineHighlightBackground": light ? "#e3edf7" : "#282a2d",
          "editorWidget.background": mixColors(theme.background, light ? "#000000" : "#ffffff", 0.08),
          "editorWidget.border": mixColors(theme.background, light ? "#000000" : "#ffffff", 0.2),
          "scrollbarSlider.background": mixColors(theme.foreground, theme.background, 0.2),
          "scrollbarSlider.hoverBackground": mixColors(theme.foreground, theme.background, 0.3)
        }
      });
      monacoAny.editor.setTheme("dshf-editor");
    } catch {
    }
    editorRef.current?.updateOptions?.({ fontSize: theme.fontSize });
  }, [mode, monacoLib, theme.background, theme.foreground, theme.fontSize]);
  if (mode === "loading") {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dshf-empty", children: "\u7F16\u8F91\u5668\u52A0\u8F7D\u4E2D\u2026" });
  }
  if (mode === "monaco") {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { ref: hostRef, className: "dshf-monaco" });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "textarea",
    {
      className: "dshf-textarea",
      value: content,
      onChange: (e) => onChange(e.target.value),
      spellCheck: false
    }
  );
}
function languageOf(path) {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "ts":
    case "tsx":
    case "mts":
    case "cts":
      return "typescript";
    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
      return "javascript";
    case "json":
      return "json";
    case "md":
    case "markdown":
      return "markdown";
    case "html":
    case "htm":
      return "html";
    case "css":
      return "css";
    case "scss":
      return "scss";
    case "less":
      return "less";
    case "py":
      return "python";
    case "rb":
      return "ruby";
    case "go":
      return "go";
    case "rs":
      return "rust";
    case "java":
      return "java";
    case "c":
    case "h":
      return "c";
    case "cpp":
    case "cc":
    case "hpp":
      return "cpp";
    case "cs":
      return "csharp";
    case "sh":
    case "bash":
      return "shell";
    case "yml":
    case "yaml":
      return "yaml";
    case "xml":
    case "svg":
      return "xml";
    case "sql":
      return "sql";
    case "php":
      return "php";
    case "vue":
      return "html";
    case "svelte":
      return "html";
    default:
      return "plaintext";
  }
}

// src/client/styles.css
var styles_default = `/* dsh-file plugin styles. Kept dependency-free: plain CSS with DSH design
 * tokens where available, sensible fallbacks elsewhere. */

/* \u2500\u2500 sidebar tree panel \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.dshf-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  font-size: 13px;
  color: var(--dsw-alias-label-primary, #1f2328);
}

.dshf-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.08));
  flex: none;
}

.dshf-title {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.dshf-spacer {
  flex: 1;
}

.dshf-btn {
  background: transparent;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.15));
  border-radius: 6px;
  color: inherit;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 6px;
  line-height: 1.5;
}
.dshf-btn:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.05));
}
.dshf-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.dshf-error {
  padding: 8px 12px;
  color: var(--dsw-alias-danger-fg, #c92a2a);
  font-size: 12px;
}

.dshf-tree-pane {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.dshf-tree-scroll {
  overflow: auto;
  flex: 1;
  min-height: 0;
  padding: 4px 0;
}

.dshf-tree-list {
  min-width: max-content;
}

.dshf-tree-hint {
  padding: 4px 12px;
  color: var(--dsw-alias-label-tertiary, #868e96);
  font-size: 12px;
}

.dshf-node {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  min-height: 22px;
}
.dshf-node:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.05));
}
.dshf-selected {
  background: var(--dsw-alias-interactive-bg-selected, rgba(77, 171, 247, 0.15));
}

.dshf-caret {
  width: 12px;
  flex: none;
  font-size: 10px;
  color: var(--dsw-alias-label-tertiary, #868e96);
}

.dshf-icon {
  flex: none;
  font-size: 13px;
}

.dshf-name {
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.dshf-node-actions {
  display: none;
  margin-left: auto;
  gap: 2px;
  flex: none;
}
.dshf-node:hover .dshf-node-actions {
  display: inline-flex;
}

.dshf-mini {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 11px;
  padding: 0 2px;
  opacity: 0.7;
}
.dshf-mini:hover {
  opacity: 1;
}

.dshf-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-top: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.08));
  flex: none;
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #868e96);
  min-height: 22px;
}

/* Status row placed at the TOP of the editor view (below the toolbar):
 * the open-file tab strip reads top-down, so the border flips sides. */
.dshf-status-top {
  border-top: none;
  border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.08));
}

.dshf-status-busy {
  color: var(--dsw-alias-accent-strong, #4dabf7);
}

.dshf-status-notice {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dshf-status-hint {
  margin-left: auto;
  white-space: nowrap;
  color: var(--dsw-alias-label-tertiary, #868e96);
}

.dshf-hidden {
  display: none;
}

/* \u2500\u2500 center-column editor view (conversation.view) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

/* Renders IN the conversation center column's view area (inside the session
 * scroll body), alongside chat / trajectory \u2014 never a popup. Fills the view
 * area the session body reserves for the active view.
 *
 * The whole view is ONE cohesive surface. Colors come from the editor theme
 * (themeStore) via CSS custom properties with LIGHT defaults (the default
 * theme is light), so the chrome always matches the Monaco background
 * instead of clashing with the page. */
.dshf-editor-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  position: relative;
  background: var(--dshf-bg, #ffffff);
  color: var(--dshf-fg, #1f2328);
  font-size: 13px;
}

.dshf-editor-view .dshf-editor-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: var(--dshf-chrome, #f3f3f3);
  border-bottom: 1px solid var(--dshf-border, #e0e0e0);
  flex: none;
  font-size: 12px;
  color: var(--dshf-fg, #1f2328);
}

.dshf-editor-view .dshf-tabname {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--dshf-fg, #1f2328);
}
.dshf-editor-view .dshf-dirty {
  color: var(--dshf-dirty, #c2410c);
}

.dshf-editor-view .dshf-editor-path {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--dshf-muted, #868e96);
  font-size: 11px;
}

.dshf-editor-view .dshf-status-top {
  background: var(--dshf-chrome, #f3f3f3);
  color: var(--dshf-muted, #868e96);
}

.dshf-editor-view .dshf-empty {
  color: var(--dshf-muted, #868e96);
}

.dshf-editor-view .dshf-monaco {
  flex: 1;
  min-height: 0;
}

.dshf-editor-view .dshf-textarea {
  flex: 1;
  min-height: 0;
  resize: none;
  border: none;
  outline: none;
  padding: 8px 12px;
  font-family: var(--dsw-font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  font-size: var(--dshf-font-size, 13px);
  line-height: 1.5;
  background: var(--dshf-bg, #ffffff);
  color: var(--dshf-fg, #1f2328);
}

.dshf-editor-view .dshf-btn {
  color: var(--dshf-fg, #1f2328);
  border-color: var(--dshf-border, #d0d0d0);
}
.dshf-editor-view .dshf-btn:hover {
  background: var(--dshf-chip, #ececec);
}

.dshf-editor-view .dshf-tab-chip {
  background: var(--dshf-chip, #ececec);
  border-color: var(--dshf-border, #d0d0d0);
  color: var(--dshf-fg, #1f2328);
}
.dshf-editor-view .dshf-tab-chip:hover {
  background: var(--dshf-border, #c9c9c9);
}
.dshf-editor-view .dshf-tab-chip-active {
  background: var(--dshf-accent, #094771);
  border-color: var(--dshf-accent, #094771);
  color: #ffffff;
}
.dshf-editor-view .dshf-tab-chip-close:hover {
  background: var(--dshf-border, rgba(0, 0, 0, 0.1));
}

/* \u2500\u2500 editor theme panel (VS Code style) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.dshf-theme-wrap {
  position: relative;
  display: inline-flex;
}

.dshf-theme-panel {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 40;
  width: 252px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;
  padding: 10px;
  background: var(--dshf-chrome, #f3f3f3);
  border: 1px solid var(--dshf-border, #d0d0d0);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  color: var(--dshf-fg, #1f2328);
  font-size: 12px;
}

.dshf-theme-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.dshf-theme-label {
  flex: none;
  width: 44px;
  color: var(--dshf-muted, #868e96);
}

.dshf-theme-select {
  flex: 1;
  min-width: 0;
  background: var(--dshf-chip, #ececec);
  border: 1px solid var(--dshf-border, #d0d0d0);
  border-radius: 6px;
  color: var(--dshf-fg, #1f2328);
  font-size: 12px;
  padding: 2px 6px;
  cursor: pointer;
}
.dshf-theme-select:focus {
  outline: none;
  border-color: var(--dshf-accent, #094771);
}

.dshf-theme-row input[type='color'] {
  width: 34px;
  height: 22px;
  padding: 0;
  border: 1px solid var(--dshf-border, #d0d0d0);
  border-radius: 4px;
  background: var(--dshf-chip, #ececec);
  cursor: pointer;
}

.dshf-theme-hex {
  font-family: var(--dsw-font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  font-size: 11px;
  color: var(--dshf-muted, #868e96);
  overflow: hidden;
  text-overflow: ellipsis;
}

.dshf-theme-error {
  color: var(--dshf-dirty, #c2410c);
  font-size: 11px;
  line-height: 1.4;
}

.dshf-hidden-input {
  display: none;
}

.dshf-theme-fontsize {
  width: 52px;
  background: var(--dshf-chip, #ececec);
  border: 1px solid var(--dshf-border, #d0d0d0);
  border-radius: 4px;
  color: var(--dshf-fg, #1f2328);
  font-size: 12px;
  padding: 1px 4px;
}

.dshf-theme-unit {
  color: var(--dshf-muted, #868e96);
  font-size: 11px;
}

.dshf-theme-actions {
  justify-content: flex-end;
  border-top: 1px solid var(--dshf-border, rgba(0, 0, 0, 0.1));
  padding-top: 8px;
}

.dshf-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--dsw-alias-label-tertiary, #868e96);
  font-size: 12px;
}

.dshf-tabs-strip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  max-width: 60%;
}

/* One open-file tab: a chip container holding the (clickable) name and a
 * per-file close "\u2715". Left-aligned in the status row. */
.dshf-tab-chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: transparent;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  border-radius: 6px;
  color: var(--dsw-alias-label-secondary, #495057);
  font-size: 11px;
  padding: 1px 2px 1px 6px;
  white-space: nowrap;
  max-width: 160px;
}
.dshf-tab-chip:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.05));
}
.dshf-tab-chip-active {
  background: var(--dsw-alias-interactive-bg-selected, rgba(77, 171, 247, 0.15));
  border-color: var(--dsw-alias-accent-strong, #4dabf7);
}

/* Filename part of a tab (click to focus). */
.dshf-tab-chip-name {
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.dshf-tab-chip-name:hover {
  text-decoration: underline;
}

/* Per-file close button. */
.dshf-tab-chip-close {
  background: transparent;
  border: none;
  padding: 0 3px;
  margin: 0;
  font-size: 10px;
  line-height: 1;
  color: inherit;
  cursor: pointer;
  opacity: 0.55;
  border-radius: 4px;
  flex: none;
}
.dshf-tab-chip-close:hover {
  opacity: 1;
  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.08));
}

/* Busy / notice group pushed to the right end of the status row. */
.dshf-status-meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  min-width: 0;
}

/* Sidebar footer toggle button */
.dshf-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--dsw-alias-label-secondary, #495057);
  cursor: pointer;
  padding: 6px 10px;
  flex: 1;
  min-width: 0;
}
.dshf-toggle:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.06));
}

.dshf-toggle-label {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
`;

// src/client/index.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var CSS_TAG = "dsh-file/styles.css";
if (typeof document !== "undefined" && document.querySelector(`style[data-plugin-css="${CSS_TAG}"]`) === null) {
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-file";
  tag.dataset.pluginCss = CSS_TAG;
  tag.textContent = styles_default;
  document.head.appendChild(tag);
}
var NS = "dshFile";
var zh = {
  "toggle.label": "\u6587\u4EF6",
  "toggle.open": "\u6253\u5F00\u6587\u4EF6\u7BA1\u7406\u5668",
  "toggle.close": "\u5173\u95ED\u6587\u4EF6\u7BA1\u7406\u5668",
  "view.label": "\u6587\u4EF6",
  "view.empty": "\u5728\u5DE6\u4FA7\u6587\u4EF6\u6811\u4E2D\u9009\u62E9\u4E00\u4E2A\u6587\u4EF6\uFF0C\u5373\u53EF\u5728\u6B64\u7F16\u8F91"
};
var en = {
  "toggle.label": "Files",
  "toggle.open": "Open file manager",
  "toggle.close": "Close file manager",
  "view.label": "Files",
  "view.empty": "Select a file in the sidebar tree to edit it here"
};
var inject = ["slots", "locale", "remote"];
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-file: dictionaries");
  const t = ctx.locale.bind(NS);
  const mountRemote = ctx.effect(async () => {
    const dispose = await ctx.remote.$mount(TYPERT_REMOTE);
    return () => dispose();
  }, "dsh-file: remote mount");
  let disposePanel = null;
  let open = false;
  const closePanel = () => {
    if (disposePanel === null) return;
    disposePanel();
    disposePanel = null;
    open = false;
    ctx.logger?.info?.("[dsh-file] file manager closed");
  };
  const openPanel = () => {
    if (disposePanel !== null) return;
    const remote = ctx.get("remote.fileManager");
    const face = {
      remote,
      onClose: closePanel
    };
    disposePanel = ctx.slots.register({
      name: "sidebar.workspaces",
      priority: -1,
      registrant: "dsh-file"
    }, (props) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(FileManagerPanel, { ...face, useSessions: props.useSessions }));
    open = true;
    ctx.logger?.info?.("[dsh-file] file manager opened");
  };
  const togglePanel = () => open ? closePanel() : openPanel();
  const syncSidebarWithView = () => {
    if (isEditorViewActive()) openPanel();
    else closePanel();
  };
  ctx.effect(() => subscribeEditorViewActive(syncSidebarWithView), "dsh-file: view\u2194sidebar sync");
  ctx.slots.inject("conversation.view", () => ctx.slots.register({
    name: "conversation.view",
    id: "dsh-file",
    order: 20,
    label: () => t("view.label"),
    locale: NS,
    registrant: "dsh-file"
  }, () => {
    const remote = ctx.get("remote.fileManager");
    if (remote === void 0) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(FileEditorView, { remote });
  }));
  ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
    name: "sidebar.footer.action",
    id: "dsh-file-toggle",
    locale: NS,
    inject: () => ({
      onToggle: togglePanel,
      isOpen: () => open
    })
  }, FileToggleButton));
  ctx.effect(() => () => {
    closePanel();
  }, "dsh-file: panel cleanup");
  void mountRemote;
}
function FileToggleButton(props) {
  const { wide, t, onToggle, isOpen } = props;
  const label = t ? t("toggle.label") : "\u6587\u4EF6";
  const title = t ? isOpen() ? t("toggle.close") : t("toggle.open") : void 0;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "button",
    {
      type: "button",
      className: "dshf-toggle",
      title,
      "aria-label": label,
      onClick: onToggle,
      style: isOpen() ? { fontWeight: 700, color: "var(--dsw-alias-accent-strong, #4dabf7)" } : void 0,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { "aria-hidden": "true", style: { fontSize: wide ? 14 : 16, lineHeight: 1 }, children: "\u{1F5C2}" }),
        wide ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "dshf-toggle-label", children: label }) : null
      ]
    }
  );
}
return module.exports;
  }
});

