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
    direct("getRoot", [])
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
var import_react2 = require("react");

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

// src/client/FileManagerPanel.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function cx2(...parts) {
  return parts.filter(Boolean).join(" ");
}
function FileManagerPanel({ remote, onClose }) {
  const [root, setRoot] = (0, import_react2.useState)(null);
  const [rootError, setRootError] = (0, import_react2.useState)(null);
  const [tabs, setTabs] = (0, import_react2.useState)([]);
  const [activePath, setActivePath] = (0, import_react2.useState)(null);
  const [busy, setBusy] = (0, import_react2.useState)(false);
  const [notice, setNotice] = (0, import_react2.useState)(null);
  const treeRef = (0, import_react2.useRef)(null);
  (0, import_react2.useEffect)(() => {
    let cancelled = false;
    (async () => {
      try {
        const { path } = unwrap(await remote.getRoot());
        if (!cancelled) setRoot(path);
      } catch (error) {
        if (!cancelled) setRootError(error instanceof Error ? error.message : String(error));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [remote]);
  const activeTab = (0, import_react2.useMemo)(
    () => activePath === null ? void 0 : tabs.find((t) => t.path === activePath),
    [tabs, activePath]
  );
  const openFile = (0, import_react2.useCallback)(
    async (path) => {
      setBusy(true);
      try {
        const existing = tabs.find((t) => t.path === path);
        if (existing) {
          setActivePath(path);
          return;
        }
        const value = unwrap(await remote.readText(path));
        setTabs((prev) => [
          ...prev,
          { path, content: value.content, savedContent: value.content, mtimeMs: value.mtimeMs, dirty: false }
        ]);
        setActivePath(path);
      } catch (error) {
        setNotice(`\u6253\u5F00\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setBusy(false);
      }
    },
    [remote, tabs]
  );
  const updateContent = (0, import_react2.useCallback)((content) => {
    setTabs((prev) => prev.map((t) => t.path === activePath ? { ...t, content, dirty: content !== t.savedContent } : t));
  }, [activePath]);
  const saveActive = (0, import_react2.useCallback)(async () => {
    if (activeTab === void 0 || !activeTab.dirty) return;
    setBusy(true);
    try {
      await unwrap(await remote.writeText(activeTab.path, activeTab.content));
      setTabs((prev) => prev.map((t) => t.path === activeTab.path ? { ...t, savedContent: t.content, dirty: false } : t));
      setNotice(`\u5DF2\u4FDD\u5B58 ${activeTab.path.split("/").pop()}`);
      treeRef.current?.refresh();
    } catch (error) {
      setNotice(`\u4FDD\u5B58\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  }, [activeTab, remote, treeRef]);
  const closeActive = (0, import_react2.useCallback)(() => {
    if (activeTab === void 0) return;
    if (activeTab.dirty && !window.confirm(`\u653E\u5F03\u5BF9 ${activeTab.path} \u7684\u672A\u4FDD\u5B58\u4FEE\u6539\uFF1F`)) return;
    setTabs((prev) => prev.filter((t) => t.path !== activeTab.path));
    setActivePath((current) => {
      if (current === null) return null;
      const remaining = tabs.filter((t) => t.path !== current);
      return remaining.length > 0 ? remaining[remaining.length - 1].path : null;
    });
  }, [activeTab, tabs]);
  const handleCreate = (0, import_react2.useCallback)(
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
        setNotice(kind === "directory" ? `\u5DF2\u521B\u5EFA\u76EE\u5F55 ${name}` : `\u5DF2\u521B\u5EFA\u6587\u4EF6 ${name}`);
      } catch (error) {
        setNotice(`\u521B\u5EFA\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setBusy(false);
      }
    },
    [remote, root, openFile, treeRef]
  );
  const handleRename = (0, import_react2.useCallback)(
    async (from) => {
      const name = window.prompt("\u91CD\u547D\u540D\u4E3A:", from.split("/").pop() ?? "");
      if (!name || name === from.split("/").pop()) return;
      const to = `${from.slice(0, from.lastIndexOf("/"))}/${name}`;
      setBusy(true);
      try {
        await unwrap(await remote.rename(from, to));
        setTabs((prev) => prev.map((t) => t.path === from ? { ...t, path: to } : t));
        if (activePath === from) setActivePath(to);
        treeRef.current?.refresh();
        setNotice(`\u5DF2\u91CD\u547D\u540D ${name}`);
      } catch (error) {
        setNotice(`\u91CD\u547D\u540D\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setBusy(false);
      }
    },
    [remote, activePath, treeRef]
  );
  const handleDelete = (0, import_react2.useCallback)(
    async (path) => {
      if (!window.confirm(`\u786E\u5B9A\u5220\u9664 ${path}\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002`)) return;
      setBusy(true);
      try {
        await unwrap(await remote.delete(path));
        setTabs((prev) => prev.filter((t) => t.path !== path));
        if (activePath === path) setActivePath(null);
        treeRef.current?.refresh();
        setNotice(`\u5DF2\u5220\u9664`);
      } catch (error) {
        setNotice(`\u5220\u9664\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setBusy(false);
      }
    },
    [remote, activePath, treeRef]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshf-root", onKeyDown: (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      void saveActive();
    }
  }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshf-toolbar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dshf-title", title: root ?? "", children: root ? root.split("/").filter(Boolean).pop() || "/" : "\u2026" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dshf-spacer" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dshf-btn", title: "\u65B0\u5EFA\u6587\u4EF6", onClick: () => void handleCreate("file"), children: "\uFF0B\u6587\u4EF6" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dshf-btn", title: "\u65B0\u5EFA\u76EE\u5F55", onClick: () => void handleCreate("directory"), children: "\uFF0B\u76EE\u5F55" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dshf-btn", title: "\u4FDD\u5B58 (Ctrl+S)", disabled: activeTab === void 0 || !activeTab.dirty, onClick: () => void saveActive(), children: "\u4FDD\u5B58" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dshf-btn", title: "\u5173\u95ED\u6587\u4EF6\u7BA1\u7406\u5668", onClick: onClose, children: "\u2715" })
    ] }),
    rootError !== null && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dshf-error", children: rootError }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshf-body", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dshf-tree", children: root !== null && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dshf-editor", children: activeTab === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dshf-empty", children: "\u9009\u62E9\u5DE6\u4FA7\u6587\u4EF6\u4EE5\u67E5\u770B\u6216\u7F16\u8F91" }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        EditorPane,
        {
          path: activeTab.path,
          content: activeTab.content,
          dirty: activeTab.dirty,
          onChange: updateContent
        },
        activeTab.path
      ) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshf-status", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dshf-status-busy", children: busy ? "\u2026" : "" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: cx2("dshf-status-notice", notice === null && "dshf-hidden"), children: notice ?? "" }),
      activeTab !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dshf-status-path", title: activeTab.path, children: activeTab.path })
    ] })
  ] });
}
function EditorPane({ path, content, dirty, onChange }) {
  const [mode, setMode] = (0, import_react2.useState)("loading");
  const [monacoLib, setMonacoLib] = (0, import_react2.useState)(null);
  const hostRef = (0, import_react2.useRef)(null);
  const editorRef = (0, import_react2.useRef)(null);
  const onChangeRef = (0, import_react2.useRef)(onChange);
  onChangeRef.current = onChange;
  const initialRef = (0, import_react2.useRef)(content);
  initialRef.current = content;
  (0, import_react2.useEffect)(() => {
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
  (0, import_react2.useEffect)(() => {
    if (mode !== "monaco" || monacoLib === null || hostRef.current === null) return;
    const initial = initialRef.current;
    const monacoAny = monacoLib;
    try {
      monacoAny.editor.setTheme("vs-dark");
    } catch {
    }
    const editor = monacoAny.editor.create(hostRef.current, {
      value: initial,
      language: languageOf(path),
      automaticLayout: true,
      fontSize: 13,
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
  if (mode === "monaco") {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshf-editor-host", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dshf-editor-tabbar", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: cx2("dshf-tabname", dirty && "dshf-dirty"), children: [
        dirty ? "\u25CF " : "",
        path.split("/").pop()
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ref: hostRef, className: "dshf-monaco" })
    ] });
  }
  if (mode === "loading") {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dshf-empty", children: "\u7F16\u8F91\u5668\u52A0\u8F7D\u4E2D\u2026" });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshf-editor-host", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dshf-editor-tabbar", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: cx2("dshf-tabname", dirty && "dshf-dirty"), children: [
      dirty ? "\u25CF " : "",
      path.split("/").pop()
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "textarea",
      {
        className: "dshf-textarea",
        value: content,
        onChange: (e) => onChange(e.target.value),
        spellCheck: false
      }
    )
  ] });
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
var styles_default = "/* dsh-file plugin styles. Kept dependency-free: plain CSS with DSH design\n * tokens where available, sensible fallbacks elsewhere. */\n\n.dshf-root {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  min-height: 0;\n  box-sizing: border-box;\n  font-size: 13px;\n  color: var(--dsw-alias-label-primary, #1f2328);\n}\n\n.dshf-toolbar {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  padding: 6px 8px;\n  border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.08));\n  flex: none;\n}\n\n.dshf-title {\n  font-weight: 600;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  max-width: 120px;\n}\n\n.dshf-spacer {\n  flex: 1;\n}\n\n.dshf-btn {\n  background: transparent;\n  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.15));\n  border-radius: 6px;\n  color: inherit;\n  cursor: pointer;\n  font-size: 12px;\n  padding: 2px 6px;\n  line-height: 1.5;\n}\n.dshf-btn:hover {\n  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.05));\n}\n\n.dshf-error {\n  padding: 8px 12px;\n  color: var(--dsw-alias-danger-fg, #c92a2a);\n  font-size: 12px;\n}\n\n.dshf-body {\n  display: flex;\n  flex: 1;\n  min-height: 0;\n}\n\n.dshf-tree {\n  width: 46%;\n  min-width: 140px;\n  max-width: 260px;\n  border-right: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.08));\n  overflow: hidden;\n  display: flex;\n}\n\n.dshf-tree-scroll {\n  overflow: auto;\n  flex: 1;\n  min-height: 0;\n  padding: 4px 0;\n}\n\n.dshf-tree-list {\n  min-width: max-content;\n}\n\n.dshf-tree-hint {\n  padding: 4px 12px;\n  color: var(--dsw-alias-label-tertiary, #868e96);\n  font-size: 12px;\n}\n\n.dshf-node {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  padding: 2px 8px;\n  cursor: pointer;\n  white-space: nowrap;\n  user-select: none;\n  min-height: 22px;\n}\n.dshf-node:hover {\n  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.05));\n}\n.dshf-selected {\n  background: var(--dsw-alias-interactive-bg-selected, rgba(77, 171, 247, 0.15));\n}\n\n.dshf-caret {\n  width: 12px;\n  flex: none;\n  font-size: 10px;\n  color: var(--dsw-alias-label-tertiary, #868e96);\n}\n\n.dshf-icon {\n  flex: none;\n  font-size: 13px;\n}\n\n.dshf-name {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  min-width: 0;\n}\n\n.dshf-node-actions {\n  display: none;\n  margin-left: auto;\n  gap: 2px;\n  flex: none;\n}\n.dshf-node:hover .dshf-node-actions {\n  display: inline-flex;\n}\n\n.dshf-mini {\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  font-size: 11px;\n  padding: 0 2px;\n  opacity: 0.7;\n}\n.dshf-mini:hover {\n  opacity: 1;\n}\n\n.dshf-editor {\n  flex: 1;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n}\n\n.dshf-editor-host {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n}\n\n.dshf-editor-tabbar {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  padding: 4px 8px;\n  border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.08));\n  flex: none;\n  font-size: 12px;\n}\n\n.dshf-tabname {\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.dshf-dirty {\n  color: var(--dsw-alias-warning-fg, #e8590c);\n}\n\n.dshf-monaco {\n  flex: 1;\n  min-height: 0;\n}\n\n.dshf-textarea {\n  flex: 1;\n  min-height: 0;\n  resize: none;\n  border: none;\n  outline: none;\n  padding: 8px 12px;\n  font-family: var(--dsw-font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);\n  font-size: 13px;\n  line-height: 1.5;\n  background: transparent;\n  color: inherit;\n}\n\n.dshf-empty {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex: 1;\n  color: var(--dsw-alias-label-tertiary, #868e96);\n  font-size: 12px;\n}\n\n.dshf-status {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 4px 8px;\n  border-top: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.08));\n  flex: none;\n  font-size: 11px;\n  color: var(--dsw-alias-label-tertiary, #868e96);\n  min-height: 22px;\n}\n\n.dshf-status-busy {\n  color: var(--dsw-alias-accent-strong, #4dabf7);\n}\n\n.dshf-status-notice {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.dshf-status-path {\n  margin-left: auto;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  max-width: 50%;\n}\n\n.dshf-hidden {\n  display: none;\n}\n\n/* Sidebar footer toggle button */\n.dshf-toggle {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  background: transparent;\n  border: 1px solid transparent;\n  border-radius: 8px;\n  color: var(--dsw-alias-label-secondary, #495057);\n  cursor: pointer;\n  padding: 6px 10px;\n  flex: 1;\n  min-width: 0;\n}\n.dshf-toggle:hover {\n  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.06));\n}\n\n.dshf-toggle-label {\n  font-size: 13px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n";

// src/client/index.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
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
  "toggle.close": "\u5173\u95ED\u6587\u4EF6\u7BA1\u7406\u5668"
};
var en = {
  "toggle.label": "Files",
  "toggle.open": "Open file manager",
  "toggle.close": "Close file manager"
};
var inject = ["slots", "locale", "remote"];
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-file: dictionaries");
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
    }, (props) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(FileManagerPanel, { ...face }));
    open = true;
    ctx.logger?.info?.("[dsh-file] file manager opened");
  };
  const togglePanel = () => open ? closePanel() : openPanel();
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
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "button",
    {
      type: "button",
      className: "dshf-toggle",
      title,
      "aria-label": label,
      onClick: onToggle,
      style: isOpen() ? { fontWeight: 700, color: "var(--dsw-alias-accent-strong, #4dabf7)" } : void 0,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { "aria-hidden": "true", style: { fontSize: wide ? 14 : 16, lineHeight: 1 }, children: "\u{1F5C2}" }),
        wide ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dshf-toggle-label", children: label }) : null
      ]
    }
  );
}
return module.exports;
  }
});

