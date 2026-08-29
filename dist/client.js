window.__ModuleLoader__.load({
  id: "@rose43/dsh-file",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

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
    direct("readDataUrl", ["path"]),
    direct("writeText", ["path", "content"]),
    direct("createFile", ["path"]),
    direct("createDirectory", ["path"]),
    direct("rename", ["from", "to"]),
    direct("delete", ["path"]),
    direct("stat", ["path"]),
    direct("resolve", ["path"]),
    direct("getRoot", []),
    direct("getConfig", []),
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
var FileTree = (0, import_react.forwardRef)(function FileTree2({ remote, root, onOpenFile, onDelete, onRenamed, onNotice }, ref) {
  const [expanded, setExpanded] = (0, import_react.useState)({ [root]: { path: root, entries: null } });
  const [selected, setSelected] = (0, import_react.useState)(null);
  const [editing, setEditing] = (0, import_react.useState)(null);
  const [rev, setRev] = (0, import_react.useState)(0);
  const dirPaths = (0, import_react.useRef)(/* @__PURE__ */ new Set());
  const parentOf = (0, import_react.useCallback)(
    (p) => {
      const i = p.lastIndexOf("/");
      if (i <= 0) return root;
      return p.slice(0, i) || root;
    },
    [root]
  );
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
    setEditing(null);
    void loadDir(root);
  }, [root, rev, loadDir]);
  const cwdTarget = (0, import_react.useCallback)(() => {
    if (selected === null) return root;
    if (dirPaths.current.has(selected)) return selected;
    return parentOf(selected);
  }, [selected, root, parentOf]);
  const beginCreate = (0, import_react.useCallback)(
    (kind) => {
      const parent = cwdTarget();
      if (parent !== root && expanded[parent] === void 0) void loadDir(parent);
      setSelected(parent);
      setEditing({ mode: "create", parent, kind });
    },
    [cwdTarget, expanded, loadDir, root]
  );
  (0, import_react.useImperativeHandle)(ref, () => ({
    refresh: () => setRev((v2) => v2 + 1),
    beginCreate
  }), [beginCreate]);
  const cancelEdit = (0, import_react.useCallback)(() => setEditing(null), []);
  const submitCreate = (0, import_react.useCallback)(
    async (name) => {
      if (editing?.mode !== "create") return true;
      const trimmed = name.trim();
      if (trimmed === "") return true;
      if (trimmed.includes("/")) {
        onNotice("\u540D\u79F0\u4E0D\u80FD\u5305\u542B /");
        return false;
      }
      const target = `${editing.parent.replace(/\/$/, "")}/${trimmed}`;
      try {
        if (editing.kind === "directory") await unwrap(await remote.createDirectory(target));
        else await unwrap(await remote.createFile(target));
      } catch (error) {
        onNotice(`\u521B\u5EFA\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`);
        return false;
      }
      await loadDir(editing.parent);
      setEditing(null);
      setSelected(target);
      onNotice(editing.kind === "directory" ? `\u5DF2\u521B\u5EFA\u76EE\u5F55 ${trimmed}` : `\u5DF2\u521B\u5EFA\u6587\u4EF6 ${trimmed}`);
      if (editing.kind === "file") onOpenFile(target);
      return true;
    },
    [editing, remote, loadDir, onNotice, onOpenFile]
  );
  const submitRename = (0, import_react.useCallback)(
    async (name) => {
      if (editing?.mode !== "rename") return true;
      const from = editing.path;
      const trimmed = name.trim();
      const oldName = from.split("/").pop() ?? "";
      if (trimmed === "" || trimmed === oldName) return true;
      if (trimmed.includes("/")) {
        onNotice("\u540D\u79F0\u4E0D\u80FD\u5305\u542B /");
        return false;
      }
      const to = `${parentOf(from).replace(/\/$/, "")}/${trimmed}`;
      try {
        await unwrap(await remote.rename(from, to));
      } catch (error) {
        onNotice(`\u91CD\u547D\u540D\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`);
        return false;
      }
      await loadDir(parentOf(from));
      setEditing(null);
      setSelected(to);
      onRenamed(from, to);
      onNotice(`\u5DF2\u91CD\u547D\u540D ${trimmed}`);
      return true;
    },
    [editing, remote, loadDir, parentOf, onRenamed, onNotice]
  );
  const node = expanded[root];
  const renderLevel = (0, import_react.useCallback)(
    (path, entries, depth) => {
      const draftHere = editing?.mode === "create" && editing.parent === path ? editing : null;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        draftHere !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          InlineInput,
          {
            depth,
            isDir: draftHere.kind === "directory",
            initial: "",
            onSubmit: submitCreate,
            onCancel: cancelEdit
          }
        ),
        entries.map((entry) => {
          const full = `${path.replace(/\/$/, "")}/${entry.name}`;
          const isDir = entry.type === "directory";
          if (isDir) dirPaths.current.add(full);
          const isOpen = expanded[full] !== void 0;
          const isRenaming = editing?.mode === "rename" && editing.path === full;
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            isRenaming ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              InlineInput,
              {
                depth,
                isDir,
                initial: entry.name,
                onSubmit: submitRename,
                onCancel: cancelEdit
              }
            ) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
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
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dshf-node-actions", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dshf-mini", title: "\u91CD\u547D\u540D", onClick: (e) => {
                      e.stopPropagation();
                      setSelected(full);
                      setEditing({ mode: "rename", path: full });
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
                onRender: renderLevel
              }
            )
          ] }, full);
        })
      ] });
    },
    [expanded, selected, editing, loadDir, onOpenFile, onDelete, submitCreate, submitRename, cancelEdit]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshf-tree-scroll", children: node === void 0 ? null : node.entries === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshf-tree-hint", children: node.error ? `\u52A0\u8F7D\u5931\u8D25: ${node.error}` : "\u52A0\u8F7D\u4E2D\u2026" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshf-tree-list", children: [
    node.entries.length === 0 && editing?.mode !== "create" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshf-tree-hint", children: "\uFF08\u7A7A\u76EE\u5F55\uFF09" }),
    renderLevel(root, node.entries, 0)
  ] }) });
});
function DirChildren({ node, depth, onRender }) {
  if (node === void 0 || node.entries === null) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshf-tree-hint", style: { paddingLeft: `${8 + depth * 14}px` }, children: node?.error ?? "\u52A0\u8F7D\u4E2D\u2026" });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: onRender(node.path, node.entries, depth) });
}
function InlineInput({ depth, isDir, initial, onSubmit, onCancel }) {
  const [value, setValue] = (0, import_react.useState)(initial);
  const inputRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    const el = inputRef.current;
    if (el === null) return;
    el.focus();
    const dot = initial.lastIndexOf(".");
    if (initial !== "" && dot > 0) el.setSelectionRange(0, dot);
    else el.select();
  }, [initial]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshf-node dshf-node-editing", style: { paddingLeft: `${8 + depth * 14}px` }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshf-caret" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cx("dshf-icon", isDir ? "dshf-icon-dir" : "dshf-icon-file"), children: isDir ? "\u{1F4C1}" : "\u{1F4C4}" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "input",
      {
        ref: inputRef,
        className: "dshf-inline-input",
        value,
        placeholder: initial === "" ? isDir ? "\u76EE\u5F55\u540D\u79F0" : "\u6587\u4EF6\u540D\u79F0" : void 0,
        onChange: (e) => setValue(e.target.value),
        onClick: (e) => e.stopPropagation(),
        onKeyDown: (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void onSubmit(value);
          } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        },
        onBlur: onCancel
      }
    )
  ] });
}

// src/client/store.ts
var import_react2 = require("react");
var tabs = [];
var activePath = null;
var workspaceRoot = null;
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
function getTabs() {
  return tabs;
}
function getActivePath() {
  return activePath;
}
function useTabs() {
  return (0, import_react2.useSyncExternalStore)(subscribe, getTabs);
}
function useActivePath() {
  return (0, import_react2.useSyncExternalStore)(subscribe, getActivePath);
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
function setWorkspaceRoot(root) {
  if (workspaceRoot === root) return;
  workspaceRoot = root;
  resetAll();
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
function IconPlus(props) {
  const size = props.size ?? 16;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", style: { display: "block" }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M8.64453 1.5V7.34961H14.5V8.65039H8.64453V14.5H7.34473V8.65039H1.5V7.34961H7.34473V1.5H8.64453Z", fill: "currentColor" }) });
}
function IconFolderAdd(props) {
  const size = props.size ?? 16;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", style: { display: "block" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { transform: "translate(9.52 2.52)", d: "M3.55246 0L3.55246 2.44252L6 2.44252L6 3.55748L3.55246 3.55748L3.55246 6L2.43834 6L2.43834 3.55748L0 3.55748L0 2.44252L2.43834 2.44252L2.43834 0L3.55246 0Z", fill: "currentColor" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { transform: "translate(0.3496 2.35)", d: "M4.76367 0C5.36861 1.80598e-05 5.93113 0.310294 6.25488 0.821289L6.78027 1.64941C6.79685 1.67558 6.81791 1.69775 6.83887 1.71973C6.72186 2.15521 6.65702 2.61192 6.65137 3.08301C6.25601 2.96045 5.90909 2.70478 5.68164 2.3457L5.15723 1.5166C5.07183 1.38189 4.92318 1.3008 4.76367 1.30078L2.32422 1.30078C1.7589 1.30078 1.30078 1.7589 1.30078 2.32422L1.30078 10.1338C1.30078 10.6991 1.7589 11.1572 2.32422 11.1572L11.9766 11.1572C12.5419 11.1572 13 10.6991 13 8.58398C13.4545 8.5135 13.8903 8.38748 14.3008 8.21289L14.3008 10.1338C14.3008 11.4171 13.2598 12.458 11.9766 12.458L2.32422 12.458C1.04093 12.458 0 11.4171 0 10.1338L0 2.32422C0 1.04093 1.04093 0 2.32422 0L4.76367 0Z", fill: "currentColor" })
  ] });
}
function FileManagerPanel({ remote, onClose, useSessions, onFileOpened }) {
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
          setWorkspaceRoot(path);
        }
      } catch (error) {
        if (!cancelled) setRootError(error instanceof Error ? error.message : String(error));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [remote, sessionCwd]);
  const handleNotice = (0, import_react3.useCallback)((message) => {
    setNotice(message);
  }, []);
  const openFile = (0, import_react3.useCallback)(
    async (path) => {
      setBusy(true);
      try {
        const value = unwrap(await remote.readText(path));
        openTab({ path, content: value.content, savedContent: value.content, mtimeMs: value.mtimeMs, dirty: false });
        onFileOpened?.();
      } catch (error) {
        handleNotice(`\u6253\u5F00\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setBusy(false);
      }
    },
    [remote, handleNotice, onFileOpened]
  );
  const handleCreate = (0, import_react3.useCallback)((kind) => {
    treeRef.current?.beginCreate(kind);
  }, []);
  const handleRenamed = (0, import_react3.useCallback)((from, to) => {
    renameTab(from, to);
  }, []);
  const [pendingDelete, setPendingDelete] = (0, import_react3.useState)(null);
  const handleDelete = (0, import_react3.useCallback)((path) => {
    setPendingDelete(path);
  }, []);
  const confirmDelete = (0, import_react3.useCallback)(
    async () => {
      const path = pendingDelete;
      setPendingDelete(null);
      if (path === null) return;
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
    [pendingDelete, remote, handleNotice]
  );
  const title = (0, import_react3.useMemo)(() => {
    if (root === null) return "\u2026";
    return root.split("/").filter(Boolean).pop() || "/";
  }, [root]);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshf-root", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshf-toolbar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dshf-title", title: root ?? "", children: title }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dshf-spacer" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dshf-btn dshf-btn-icon", title: "\u65B0\u5EFA\u6587\u4EF6", "aria-label": "\u65B0\u5EFA\u6587\u4EF6", onClick: () => handleCreate("file"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(IconPlus, {}) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dshf-btn dshf-btn-icon", title: "\u65B0\u5EFA\u76EE\u5F55", "aria-label": "\u65B0\u5EFA\u76EE\u5F55", onClick: () => handleCreate("directory"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(IconFolderAdd, {}) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dshf-btn dshf-btn-icon", title: "\u5173\u95ED\u6587\u4EF6\u7BA1\u7406\u5668", "aria-label": "\u5173\u95ED\u6587\u4EF6\u7BA1\u7406\u5668", onClick: onClose, children: "\u2715" })
    ] }),
    rootError !== null && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dshf-error", children: rootError }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dshf-tree-pane", children: root !== null && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      FileTree,
      {
        ref: treeRef,
        remote,
        root,
        onOpenFile: (p) => void openFile(p),
        onDelete: (p) => void handleDelete(p),
        onRenamed: handleRenamed,
        onNotice: handleNotice
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshf-status", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dshf-status-busy", children: busy ? "\u2026" : "" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: cx2("dshf-status-notice", notice === null && "dshf-hidden"), children: notice ?? "" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dshf-spacer" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dshf-status-hint", children: "\u70B9\u6587\u4EF6\u540E\u5728\u4E0A\u65B9\u300C\u6587\u4EF6\u300D\u6807\u7B7E\u4E2D\u7F16\u8F91" })
    ] }),
    pendingDelete !== null && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      DeleteConfirmDialog,
      {
        path: pendingDelete,
        onConfirm: () => void confirmDelete(),
        onCancel: () => setPendingDelete(null)
      }
    )
  ] });
}
function DeleteConfirmDialog({ path, onConfirm, onCancel }) {
  const name = path.split("/").pop() ?? path;
  const confirmRef = (0, import_react3.useRef)(null);
  (0, import_react3.useEffect)(() => {
    confirmRef.current?.focus();
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "div",
    {
      className: "dshf-modal-overlay",
      onClick: onCancel,
      onKeyDown: (e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onCancel();
        }
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshf-modal", role: "alertdialog", "aria-modal": "true", "aria-label": "\u5220\u9664\u786E\u8BA4", onClick: (e) => e.stopPropagation(), children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshf-modal-title", children: [
          "\u5220\u9664 ",
          name
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshf-modal-body", children: [
          "\u786E\u5B9A\u5220\u9664 ",
          name,
          " \u5417\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshf-modal-actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dshf-btn", onClick: onCancel, children: "\u53D6\u6D88" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { ref: confirmRef, type: "button", className: "dshf-btn dshf-btn-danger", onClick: onConfirm, children: "\u5220\u9664" })
        ] })
      ] })
    }
  );
}

// src/client/FileEditorView.tsx
var import_react6 = require("react");

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

// node_modules/marked/lib/marked.esm.js
function A() {
  return { async: false, breaks: false, extensions: null, gfm: true, hooks: null, pedantic: false, renderer: null, silent: false, tokenizer: null, walkTokens: null };
}
var R = A();
function j(l3) {
  R = l3;
}
var z = { exec: () => null };
function I(l3) {
  let e = [];
  return (t) => {
    let n = Math.max(0, Math.min(3, t - 1)), s = e[n];
    return s || (s = l3(n), e[n] = s), s;
  };
}
function k(l3, e = "") {
  let t = typeof l3 == "string" ? l3 : l3.source, n = { replace: (s, r) => {
    let i = typeof r == "string" ? r : r.source;
    return i = i.replace(m.caret, "$1"), t = t.replace(s, i), n;
  }, getRegex: () => new RegExp(t, e) };
  return n;
}
var Oe = ((l3 = "") => {
  try {
    return !!new RegExp("(?<=1)(?<!1)" + l3);
  } catch {
    return false;
  }
})();
var m = { codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm, outputLinkReplace: /\\([\[\]])/g, indentCodeCompensation: /^(\s+)(?:```)/, beginningSpace: /^\s+/, endingHash: /#$/, startingSpaceChar: /^ /, endingSpaceChar: / $/, nonSpaceChar: /[^ ]/, newLineCharGlobal: /\n/g, tabCharGlobal: /\t/g, multipleSpaceGlobal: /\s+/g, blankLine: /^[ \t]*$/, doubleBlankLine: /\n[ \t]*\n[ \t]*$/, blockquoteStart: /^ {0,3}>/, blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g, blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm, listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g, listIsTask: /^\[[ xX]\] +\S/, listReplaceTask: /^\[[ xX]\] +/, listTaskCheckbox: /\[[ xX]\]/, anyLine: /\n.*\n/, hrefBrackets: /^<(.*)>$/, tableDelimiter: /[:|]/, tableAlignChars: /^\||\| *$/g, tableRowBlankLine: /\n[ \t]*$/, tableAlignRight: /^ *-+: *$/, tableAlignCenter: /^ *:-+: *$/, tableAlignLeft: /^ *:-+ *$/, startATag: /^<a /i, endATag: /^<\/a>/i, startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i, endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i, startAngleBracket: /^</, endAngleBracket: />$/, pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/, unicodeAlphaNumeric: /[\p{L}\p{N}]/u, escapeTest: /[&<>"']/, escapeReplace: /[&<>"']/g, escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/, escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, caret: /(^|[^\[])\^/g, percentDecode: /%25/g, findPipe: /\|/g, splitPipe: / \|/, slashPipe: /\\\|/g, carriageReturn: /\r\n|\r/g, spaceLine: /^ +$/gm, notSpaceStart: /^\S*/, endingNewline: /\n$/, listItemRegex: (l3) => new RegExp(`^( {0,3}${l3})((?:[	 ][^\\n]*)?(?:\\n|$))`), nextBulletRegex: I((l3) => new RegExp(`^ {0,${l3}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)), hrRegex: I((l3) => new RegExp(`^ {0,${l3}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`)), fencesBeginRegex: I((l3) => new RegExp(`^ {0,${l3}}(?:\`\`\`|~~~)`)), headingBeginRegex: I((l3) => new RegExp(`^ {0,${l3}}#`)), htmlBeginRegex: I((l3) => new RegExp(`^ {0,${l3}}<(?:[a-z].*>|!--)`, "i")), blockquoteBeginRegex: I((l3) => new RegExp(`^ {0,${l3}}>`)) };
var Te = /^(?:[ \t]*(?:\n|$))+/;
var we = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
var ye = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/;
var q = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
var Pe = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
var U = / {0,3}(?:[*+-]|\d{1,9}[.)])/;
var oe = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/;
var ae = k(oe).replace(/bull/g, U).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex();
var Se = k(oe).replace(/bull/g, U).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex();
var K = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/;
var _e = /^[^\n]+/;
var W = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/;
var $e = k(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", W).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex();
var Le = k(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g, U).getRegex();
var Q = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
var X = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
var Ee = k("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", X).replace("tag", Q).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
var le = (l3) => k(K).replace("hr", q).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", l3).replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Q).getRegex();
var ze = le(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/);
var Me = le(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/);
var Ae = k(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Me).getRegex();
var J = { blockquote: Ae, code: we, def: $e, fences: ye, heading: Pe, hr: q, html: Ee, lheading: ae, list: Le, newline: Te, paragraph: ze, table: z, text: _e };
var se = k("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", q).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Q).getRegex();
var Ie = { ...J, lheading: Se, table: se, paragraph: k(K).replace("hr", q).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", se).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Q).getRegex() };
var Ce = { ...J, html: k(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", X).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(), def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/, heading: /^(#{1,6})(.*)(?:\n+|$)/, fences: z, lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/, paragraph: k(K).replace("hr", q).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", ae).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex() };
var Be = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
var De = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
var ue = /^( {2,}|\\)\n(?!\s*$)/;
var qe = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
var _ = /[\p{P}\p{S}]/u;
var C = /[\s\p{P}\p{S}]/u;
var v = /[^\s\p{P}\p{S}]/u;
var ve = k(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, C).getRegex();
var He = /[\p{Pi}\p{Ps}"']/u;
var pe = /(?!~)[\p{P}\p{S}]/u;
var Ze = /(?!~)[\s\p{P}\p{S}]/u;
var Ge = /(?:[^\s\p{P}\p{S}]|~)/u;
var Qe = k(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", Oe ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex();
var ce = /^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/;
var Ne = k(ce, "u").replace(/punct/g, _).getRegex();
var je = k(ce, "u").replace(/punct/g, pe).getRegex();
var Fe = /^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/;
var Ue = k(Fe, "u").replace(/openQuote/g, He).replace(/punct/g, _).getRegex();
var he = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)";
var Ke = k(he, "gu").replace(/notPunctSpace/g, v).replace(/punctSpace/g, C).replace(/punct/g, _).getRegex();
var We = k(he, "gu").replace(/notPunctSpace/g, Ge).replace(/punctSpace/g, Ze).replace(/punct/g, pe).getRegex();
var Xe = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)";
var Je = k(Xe, "gu").replace(/notPunctSpace/g, v).replace(/punctSpace/g, C).replace(/punct/g, _).getRegex();
var Ve = k("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, v).replace(/punctSpace/g, C).replace(/punct/g, _).getRegex();
var Ye = "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)";
var et = k(Ye, "gu").replace(/notPunctSpace/g, v).replace(/punctSpace/g, C).replace(/punct/g, _).getRegex();
var tt = k(/^~~?(?:((?!~)punct)|[^\s~])/, "u").replace(/punct/g, _).getRegex();
var nt = "^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)";
var rt = k(nt, "gu").replace(/notPunctSpace/g, v).replace(/punctSpace/g, C).replace(/punct/g, _).getRegex();
var st = k(/\\(punct)/, "gu").replace(/punct/g, _).getRegex();
var it = k(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex();
var ot = k(X).replace("(?:-->|$)", "-->").getRegex();
var at = k("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", ot).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex();
var G = /(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/;
var lt = k(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/).replace("label", G).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex();
var ke = k(/^!?\[(label)\]\[(ref)\]/).replace("label", G).replace("ref", W).getRegex();
var de = k(/^!?\[(ref)\](?:\[\])?/).replace("ref", W).getRegex();
var ut = k("reflink|nolink(?!\\()", "g").replace("reflink", ke).replace("nolink", de).getRegex();
var ie = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/;
var V = { _backpedal: z, anyPunctuation: st, autolink: it, blockSkip: Qe, br: ue, code: De, del: z, delLDelim: z, delRDelim: z, emStrongLDelim: Ne, emStrongRDelimAst: Ke, emStrongRDelimUnd: Ve, escape: Be, link: lt, nolink: de, punctuation: ve, reflink: ke, reflinkSearch: ut, tag: at, text: qe, url: z };
var pt = { ...V, emStrongLDelim: Ue, emStrongRDelimAst: Je, emStrongRDelimUnd: et, link: k(/^!?\[(label)\]\((.*?)\)/).replace("label", G).getRegex(), reflink: k(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", G).getRegex() };
var F = { ...V, emStrongRDelimAst: We, emStrongLDelim: je, delLDelim: tt, delRDelim: rt, url: k(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol", ie).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(), _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/, del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/, text: k(/^(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol", ie).getRegex() };
var ct = { ...F, br: k(ue).replace("{2,}", "*").getRegex(), text: k(F.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex() };
var H = { normal: J, gfm: Ie, pedantic: Ce };
var B = { normal: V, gfm: F, breaks: ct, pedantic: pt };
var ht = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
var ge = (l3) => ht[l3];
function T(l3, e) {
  if (e) {
    if (m.escapeTest.test(l3)) return l3.replace(m.escapeReplace, ge);
  } else if (m.escapeTestNoEncode.test(l3)) return l3.replace(m.escapeReplaceNoEncode, ge);
  return l3;
}
function Y(l3) {
  try {
    l3 = encodeURI(l3).replace(m.percentDecode, "%");
  } catch {
    return null;
  }
  return l3;
}
function ee(l3, e) {
  let t = l3.replace(m.findPipe, (r, i, o) => {
    let u = false, a = i;
    for (; --a >= 0 && o[a] === "\\"; ) u = !u;
    return u ? "|" : " |";
  }), n = t.split(m.splitPipe), s = 0;
  if (n[0].trim() || n.shift(), n.length > 0 && !n.at(-1)?.trim() && n.pop(), e) if (n.length > e) n.splice(e);
  else for (; n.length < e; ) n.push("");
  for (; s < n.length; s++) n[s] = n[s].trim().replace(m.slashPipe, "|");
  return n;
}
function $(l3, e, t) {
  let n = l3.length;
  if (n === 0) return "";
  let s = 0;
  for (; s < n; ) {
    let r = l3.charAt(n - s - 1);
    if (r === e && !t) s++;
    else if (r !== e && t) s++;
    else break;
  }
  return l3.slice(0, n - s);
}
function te(l3) {
  let e = l3.split(`
`), t = e.length - 1;
  for (; t >= 0 && m.blankLine.test(e[t]); ) t--;
  return e.length - t <= 2 ? l3 : e.slice(0, t + 1).join(`
`);
}
function fe(l3, e) {
  if (l3.indexOf(e[1]) === -1) return -1;
  let t = 0;
  for (let n = 0; n < l3.length; n++) if (l3[n] === "\\") n++;
  else if (l3[n] === e[0]) t++;
  else if (l3[n] === e[1] && (t--, t < 0)) return n;
  return t > 0 ? -2 : -1;
}
function me(l3, e = 0) {
  let t = e, n = "";
  for (let s of l3) if (s === "	") {
    let r = 4 - t % 4;
    n += " ".repeat(r), t += r;
  } else n += s, t++;
  return n;
}
function xe(l3, e, t, n, s) {
  let r = e.href, i = e.title || null, o = l3[1].replace(s.other.outputLinkReplace, "$1"), u = l3[0].charAt(0) === "!";
  n.state.inLink = true;
  let a = n.state.linkEmitted, p = n.state.inRawBlock;
  n.state.linkEmitted = false;
  let c = n.inlineTokens(o), h = n.state.linkEmitted;
  if (n.state.linkEmitted = a, n.state.inLink = false, !u) {
    if (h) {
      n.state.inRawBlock = p;
      return;
    }
    n.state.linkEmitted = true;
  }
  return { type: u ? "image" : "link", raw: t, href: r, title: i, text: o, tokens: c };
}
function kt(l3, e, t) {
  let n = l3.match(t.other.indentCodeCompensation);
  if (n === null) return e;
  let s = n[1];
  return e.split(`
`).map((r) => {
    let i = r.match(t.other.beginningSpace);
    if (i === null) return r;
    let [o] = i;
    return o.length >= s.length ? r.slice(s.length) : r;
  }).join(`
`);
}
var y = class {
  constructor(e) {
    __publicField(this, "options");
    __publicField(this, "rules");
    __publicField(this, "lexer");
    this.options = e || R;
  }
  space(e) {
    let t = this.rules.block.newline.exec(e);
    if (t && t[0].length > 0) return { type: "space", raw: t[0] };
  }
  code(e) {
    let t = this.rules.block.code.exec(e);
    if (t) {
      let n = this.options.pedantic ? t[0] : te(t[0]), s = n.replace(this.rules.other.codeRemoveIndent, "");
      return { type: "code", raw: n, codeBlockStyle: "indented", text: s };
    }
  }
  fences(e) {
    let t = this.rules.block.fences.exec(e);
    if (t) {
      let n = t[0], s = kt(n, t[3] || "", this.rules);
      return { type: "code", raw: n, lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2], text: s };
    }
  }
  heading(e) {
    let t = this.rules.block.heading.exec(e);
    if (t) {
      let n = t[2].trim();
      if (this.rules.other.endingHash.test(n)) {
        let s = $(n, "#");
        (this.options.pedantic || !s || this.rules.other.endingSpaceChar.test(s)) && (n = s.trim());
      }
      return { type: "heading", raw: $(t[0], `
`), depth: t[1].length, text: n, tokens: this.lexer.inline(n) };
    }
  }
  hr(e) {
    let t = this.rules.block.hr.exec(e);
    if (t) return { type: "hr", raw: $(t[0], `
`) };
  }
  blockquote(e) {
    let t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = $(t[0], `
`).split(`
`), s = "", r = "", i = [];
      for (; n.length > 0; ) {
        let o = false, u = [], a;
        for (a = 0; a < n.length; a++) if (this.rules.other.blockquoteStart.test(n[a])) u.push(n[a]), o = true;
        else if (!o) u.push(n[a]);
        else break;
        n = n.slice(a);
        let p = u.join(`
`), c = p.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        s = s ? `${s}
${p}` : p, r = r ? `${r}
${c}` : c;
        let h = this.lexer.state.top;
        if (this.lexer.state.top = true, this.lexer.blockTokens(c, i, true), this.lexer.state.top = h, n.length === 0) break;
        let d = i.at(-1);
        if (d?.type === "code") break;
        if (d?.type === "blockquote") {
          let O = d, g = n.join(`
`), w = O.raw + `
` + g.replace(this.rules.other.blockquoteSetextReplace2, ""), E = this.blockquote(w);
          i[i.length - 1] = E, s = `${s}
${g}`, r = r.substring(0, r.length - O.text.length) + E.text;
          break;
        } else if (d?.type === "list") {
          let O = d, g = O.raw + `
` + n.join(`
`), w = this.list(g);
          i[i.length - 1] = w, s = s.substring(0, s.length - d.raw.length) + w.raw, r = r.substring(0, r.length - O.raw.length) + w.raw, n = g.substring(i.at(-1).raw.length).split(`
`);
          continue;
        }
      }
      return { type: "blockquote", raw: s, tokens: i, text: r };
    }
  }
  list(e) {
    let t = this.rules.block.list.exec(e);
    if (t) {
      let n = t[1].trim(), s = n.length > 1, r = { type: "list", raw: "", ordered: s, start: s ? +n.slice(0, -1) : "", loose: false, items: [] };
      n = s ? `\\d{1,9}\\${n.slice(-1)}` : `\\${n}`, this.options.pedantic && (n = s ? n : "[*+-]");
      let i = this.rules.other.listItemRegex(n), o = false;
      for (; e; ) {
        let a = false, p = "", c = "";
        if (!(t = i.exec(e)) || this.rules.block.hr.test(e)) break;
        p = t[0], e = e.substring(p.length);
        let h = me(t[2].split(`
`, 1)[0], t[1].length), d = e.split(`
`, 1)[0], O = !h.trim(), g = 0;
        if (this.options.pedantic ? (g = 2, c = h.trimStart()) : O ? g = t[1].length + 1 : (g = h.search(this.rules.other.nonSpaceChar), g = g > 4 ? 1 : g, c = h.slice(g), g += t[1].length), O && this.rules.other.blankLine.test(d) && (p += d + `
`, e = e.substring(d.length + 1), a = true), !a) {
          let w = this.rules.other.nextBulletRegex(g), E = this.rules.other.hrRegex(g), ne = this.rules.other.fencesBeginRegex(g), re = this.rules.other.headingBeginRegex(g), be = this.rules.other.htmlBeginRegex(g), Re = this.rules.other.blockquoteBeginRegex(g);
          for (; e; ) {
            let N = e.split(`
`, 1)[0], D;
            if (d = N, this.options.pedantic ? (d = d.replace(this.rules.other.listReplaceNesting, "  "), D = d) : D = d.replace(this.rules.other.tabCharGlobal, "    "), ne.test(d) || re.test(d) || be.test(d) || Re.test(d) || w.test(d) || E.test(d)) break;
            if (D.search(this.rules.other.nonSpaceChar) >= g || !d.trim()) c += `
` + D.slice(g);
            else {
              if (O || h.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || ne.test(h) || re.test(h) || E.test(h)) break;
              c += `
` + d;
            }
            O = !d.trim(), p += N + `
`, e = e.substring(N.length + 1), h = D.slice(g);
          }
        }
        r.loose || (o ? r.loose = true : this.rules.other.doubleBlankLine.test(p) && (o = true)), r.items.push({ type: "list_item", raw: p, task: !!this.options.gfm && this.rules.other.listIsTask.test(c), loose: false, text: c, tokens: [] }), r.raw += p;
      }
      let u = r.items.at(-1);
      if (u) u.raw = u.raw.trimEnd(), u.text = u.text.trimEnd();
      else return;
      r.raw = r.raw.trimEnd();
      for (let a of r.items) if (this.lexer.state.top = false, a.tokens = this.lexer.blockTokens(a.text, []), !r.loose) {
        let p = a.tokens.filter((h) => h.type === "space"), c = p.length > 0 && p.some((h) => this.rules.other.anyLine.test(h.raw));
        r.loose = c;
      }
      for (let a of r.items) {
        let p = a.tokens[0];
        if (a.task && (p?.type === "text" || p?.type === "paragraph")) {
          a.text = a.text.replace(this.rules.other.listReplaceTask, ""), p.raw = p.raw.replace(this.rules.other.listReplaceTask, ""), p.text = p.text.replace(this.rules.other.listReplaceTask, "");
          for (let h = this.lexer.inlineQueue.length - 1; h >= 0; h--) if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[h].src)) {
            this.lexer.inlineQueue[h].src = this.lexer.inlineQueue[h].src.replace(this.rules.other.listReplaceTask, "");
            break;
          }
          let c = this.rules.other.listTaskCheckbox.exec(a.raw);
          if (c) {
            let h = { type: "checkbox", raw: c[0] + " ", checked: c[0] !== "[ ]" };
            a.checked = h.checked, r.loose ? a.tokens[0] && ["paragraph", "text"].includes(a.tokens[0].type) && "tokens" in a.tokens[0] && a.tokens[0].tokens ? (a.tokens[0].raw = h.raw + a.tokens[0].raw, a.tokens[0].text = h.raw + a.tokens[0].text, a.tokens[0].tokens.unshift(h)) : a.tokens.unshift({ type: "paragraph", raw: h.raw, text: h.raw, tokens: [h] }) : a.tokens.unshift(h);
          }
        } else a.task && (a.task = false);
      }
      if (r.loose) for (let a of r.items) {
        a.loose = true;
        for (let p of a.tokens) p.type === "text" && (p.type = "paragraph");
      }
      return r;
    }
  }
  html(e) {
    let t = this.rules.block.html.exec(e);
    if (t) {
      let n = te(t[0]);
      return { type: "html", block: true, raw: n, pre: t[1] === "pre" || t[1] === "script" || t[1] === "style", text: n };
    }
  }
  def(e) {
    let t = this.rules.block.def.exec(e);
    if (t) {
      let n = t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), s = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", r = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
      return { type: "def", tag: n, raw: $(t[0], `
`), href: s, title: r };
    }
  }
  table(e) {
    let t = this.rules.block.table.exec(e);
    if (!t || !this.rules.other.tableDelimiter.test(t[2])) return;
    let n = ee(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = t[3]?.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], i = { type: "table", raw: $(t[0], `
`), header: [], align: [], rows: [] };
    if (n.length === s.length) {
      for (let o of s) this.rules.other.tableAlignRight.test(o) ? i.align.push("right") : this.rules.other.tableAlignCenter.test(o) ? i.align.push("center") : this.rules.other.tableAlignLeft.test(o) ? i.align.push("left") : i.align.push(null);
      for (let o = 0; o < n.length; o++) i.header.push({ text: n[o], tokens: this.lexer.inline(n[o]), header: true, align: i.align[o] });
      for (let o of r) i.rows.push(ee(o, i.header.length).map((u, a) => ({ text: u, tokens: this.lexer.inline(u), header: false, align: i.align[a] })));
      return i;
    }
  }
  lheading(e) {
    let t = this.rules.block.lheading.exec(e);
    if (t) {
      let n = t[1].trim();
      return { type: "heading", raw: $(t[0], `
`), depth: t[2].charAt(0) === "=" ? 1 : 2, text: n, tokens: this.lexer.inline(n) };
    }
  }
  paragraph(e) {
    let t = this.rules.block.paragraph.exec(e);
    if (t) {
      let n = t[1].charAt(t[1].length - 1) === `
` ? t[1].slice(0, -1) : t[1];
      return { type: "paragraph", raw: t[0], text: n, tokens: this.lexer.inline(n) };
    }
  }
  text(e) {
    let t = this.rules.block.text.exec(e);
    if (t) return { type: "text", raw: t[0], text: t[0], tokens: this.lexer.inline(t[0]) };
  }
  escape(e) {
    let t = this.rules.inline.escape.exec(e);
    if (t) return { type: "escape", raw: t[0], text: t[1] };
  }
  tag(e) {
    let t = this.rules.inline.tag.exec(e);
    if (t) return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = true : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = false), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = true : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = false), { type: "html", raw: t[0], inLink: this.lexer.state.inLink, inRawBlock: this.lexer.state.inRawBlock, block: false, text: t[0] };
  }
  link(e) {
    let t = this.rules.inline.link.exec(e);
    if (t) {
      let n = t[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(n)) {
        if (!this.rules.other.endAngleBracket.test(n)) return;
        let i = $(n.slice(0, -1), "\\");
        if ((n.length - i.length) % 2 === 0) return;
      } else {
        let i = fe(t[2], "()");
        if (i === -2) return;
        if (i > -1) {
          let u = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + i;
          t[2] = t[2].substring(0, i), t[0] = t[0].substring(0, u).trim(), t[3] = "";
        }
      }
      let s = t[2], r = "";
      if (this.options.pedantic) {
        let i = this.rules.other.pedanticHrefTitle.exec(s);
        i && (s = i[1], r = i[3]);
      } else r = t[3] ? t[3].slice(1, -1) : "";
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), xe(t, { href: s && s.replace(this.rules.inline.anyPunctuation, "$1"), title: r && r.replace(this.rules.inline.anyPunctuation, "$1") }, t[0], this.lexer, this.rules);
    }
  }
  reflink(e, t) {
    let n;
    if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
      let s = (n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " "), r = t[s.toLowerCase()];
      if (!r) {
        let i = n[0].charAt(0);
        return { type: "text", raw: i, text: i };
      }
      return xe(n, r, n[0], this.lexer, this.rules);
    }
  }
  emStrong(e, t, n = "") {
    let s = this.rules.inline.emStrongLDelim.exec(e);
    if (!s || !s[1] && !s[2] && !s[3] && !s[4] || s[4] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
    if (!(s[1] || s[3] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      let i = [...s[0]].length - 1, o, u, a = i, p = 0, c = s[0][0], h = n === c, d = c === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (d.lastIndex = 0, t = t.slice(-1 * e.length + i); (s = d.exec(t)) !== null; ) {
        if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o) continue;
        if (u = [...o].length, s[3] || s[4]) {
          a += u;
          continue;
        } else if (s[5] || s[6]) {
          if (i % 3 && !((i + u) % 3)) {
            p += u;
            continue;
          }
          if (h) break;
        }
        if (a -= u, a > 0) continue;
        u = Math.min(u, u + a + p);
        let O = [...s[0]][0].length, g = e.slice(0, i + s.index + O + u);
        if (Math.min(i, u) % 2) {
          let E = g.slice(1, -1);
          return { type: "em", raw: g, text: E, tokens: this.lexer.inlineTokens(E) };
        }
        let w = g.slice(2, -2);
        return { type: "strong", raw: g, text: w, tokens: this.lexer.inlineTokens(w) };
      }
    }
  }
  codespan(e) {
    let t = this.rules.inline.code.exec(e);
    if (t) {
      let n = t[2].replace(this.rules.other.newLineCharGlobal, " "), s = this.rules.other.nonSpaceChar.test(n), r = this.rules.other.startingSpaceChar.test(n) && this.rules.other.endingSpaceChar.test(n);
      return s && r && (n = n.substring(1, n.length - 1)), { type: "codespan", raw: t[0], text: n };
    }
  }
  br(e) {
    let t = this.rules.inline.br.exec(e);
    if (t) return { type: "br", raw: t[0] };
  }
  del(e, t, n = "") {
    let s = this.rules.inline.delLDelim.exec(e);
    if (!s) return;
    if (!(s[1] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      let i = [...s[0]].length - 1, o, u, a = i, p = this.rules.inline.delRDelim;
      for (p.lastIndex = 0, t = t.slice(-1 * e.length + i); (s = p.exec(t)) !== null; ) {
        if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o || (u = [...o].length, u !== i)) continue;
        if (s[3] || s[4]) {
          a += u;
          continue;
        }
        if (a -= u, a > 0) continue;
        u = Math.min(u, u + a);
        let c = [...s[0]][0].length, h = e.slice(0, i + s.index + c + u), d = h.slice(i, -i);
        return { type: "del", raw: h, text: d, tokens: this.lexer.inlineTokens(d) };
      }
    }
  }
  autolink(e) {
    let t = this.rules.inline.autolink.exec(e);
    if (t) {
      let n, s;
      return t[2] === "@" ? (n = t[1], s = "mailto:" + n) : (n = t[1], s = n), { type: "link", raw: t[0], text: n, href: s, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  url(e) {
    let t;
    if (t = this.rules.inline.url.exec(e)) {
      let n, s;
      if (t[2] === "@") n = t[0], s = "mailto:" + n;
      else {
        let r;
        do
          r = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "";
        while (r !== t[0]);
        n = t[0], t[1] === "www." ? s = "http://" + t[0] : s = t[0];
      }
      return { type: "link", raw: t[0], text: n, href: s, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  inlineText(e) {
    let t = this.rules.inline.text.exec(e);
    if (t) {
      let n = this.lexer.state.inRawBlock;
      return { type: "text", raw: t[0], text: t[0], escaped: n };
    }
  }
};
var x = class l {
  constructor(e) {
    __publicField(this, "tokens");
    __publicField(this, "options");
    __publicField(this, "state");
    __publicField(this, "inlineQueue");
    __publicField(this, "tokenizer");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = e || R, this.options.tokenizer = this.options.tokenizer || new y(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = { inLink: false, inRawBlock: false, linkEmitted: false, top: true };
    let t = { other: m, block: H.normal, inline: B.normal };
    this.options.pedantic ? (t.block = H.pedantic, t.inline = B.pedantic) : this.options.gfm && (t.block = H.gfm, this.options.breaks ? t.inline = B.breaks : t.inline = B.gfm), this.tokenizer.rules = t;
  }
  static get rules() {
    return { block: H, inline: B };
  }
  static lex(e, t) {
    return new l(t).lex(e);
  }
  static lexInline(e, t) {
    return new l(t).inlineTokens(e);
  }
  lex(e) {
    e = e.replace(m.carriageReturn, `
`), this.blockTokens(e, this.tokens);
    for (let t = 0; t < this.inlineQueue.length; t++) {
      let n = this.inlineQueue[t];
      this.inlineTokens(n.src, n.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(e, t = [], n = false) {
    this.tokenizer.lexer = this, this.options.pedantic && (e = e.replace(m.tabCharGlobal, "    ").replace(m.spaceLine, ""));
    let s = 1 / 0;
    for (; e; ) {
      if (e.length < s) s = e.length;
      else {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
      let r;
      if (this.options.extensions?.block?.some((o) => (r = o.call({ lexer: this }, e, t)) ? (e = e.substring(r.raw.length), t.push(r), true) : false)) continue;
      if (r = this.tokenizer.space(e)) {
        e = e.substring(r.raw.length);
        let o = t.at(-1);
        r.raw.length === 1 && o !== void 0 ? o.raw += `
` : t.push(r);
        continue;
      }
      if (r = this.tokenizer.code(e)) {
        e = e.substring(r.raw.length);
        let o = t.at(-1);
        o?.type === "paragraph" || o?.type === "text" ? (o.raw += (o.raw.endsWith(`
`) ? "" : `
`) + r.raw, o.text += `
` + r.text, this.inlineQueue.at(-1).src = o.text) : t.push(r);
        continue;
      }
      if (r = this.tokenizer.fences(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.heading(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.hr(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.blockquote(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.list(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.html(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.def(e)) {
        e = e.substring(r.raw.length);
        let o = t.at(-1);
        o?.type === "paragraph" || o?.type === "text" ? (o.raw += (o.raw.endsWith(`
`) ? "" : `
`) + r.raw, o.text += `
` + r.raw, this.inlineQueue.at(-1).src = o.text) : this.tokens.links[r.tag] || (this.tokens.links[r.tag] = { href: r.href, title: r.title }, t.push(r));
        continue;
      }
      if (r = this.tokenizer.table(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.lheading(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      let i = e;
      if (this.options.extensions?.startBlock) {
        let o = 1 / 0, u = e.slice(1), a;
        this.options.extensions.startBlock.forEach((p) => {
          a = p.call({ lexer: this }, u), typeof a == "number" && a >= 0 && (o = Math.min(o, a));
        }), o < 1 / 0 && o >= 0 && (i = e.substring(0, o + 1));
      }
      if (this.state.top && (r = this.tokenizer.paragraph(i))) {
        let o = t.at(-1);
        n && o?.type === "paragraph" ? (o.raw += (o.raw.endsWith(`
`) ? "" : `
`) + r.raw, o.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = o.text) : t.push(r), n = i.length !== e.length, e = e.substring(r.raw.length);
        continue;
      }
      if (r = this.tokenizer.text(e)) {
        e = e.substring(r.raw.length);
        let o = t.at(-1);
        o?.type === "text" ? (o.raw += (o.raw.endsWith(`
`) ? "" : `
`) + r.raw, o.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = o.text) : t.push(r);
        continue;
      }
      if (e) {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
    }
    return this.state.top = true, t;
  }
  inline(e, t = []) {
    return this.inlineQueue.push({ src: e, tokens: t }), t;
  }
  linkInText(e) {
    if (!e.includes("[")) return false;
    let t = this.tokenizer.rules.inline.link;
    for (let n of e.matchAll(this.tokenizer.rules.inline.blockSkip)) if (t.test(n[0]) && e.charAt(n.index - 1) !== "!") return true;
    for (let n of e.matchAll(this.tokenizer.rules.inline.reflinkSearch)) {
      let s = n[0], r = s.lastIndexOf("[");
      if (!(s.charAt(0) === "!" || !Object.hasOwn(this.tokens.links, s.slice(r + 1, -1))) && !(r > 1 && this.linkInText(s.slice(1, r - 1)))) return true;
    }
    return false;
  }
  inlineTokens(e, t = []) {
    this.tokenizer.lexer = this;
    let n = e;
    if (this.tokens.links && e.includes("[")) {
      let o = this.tokenizer.rules.inline.reflinkSearch, u = (a) => {
        let p = a.lastIndexOf("[");
        if (!Object.hasOwn(this.tokens.links, a.slice(p + 1, -1))) return a;
        if (p > 1 && a.charAt(0) !== "!") {
          let c = a.slice(1, p - 1);
          if (this.linkInText(c)) return "[" + c.replace(o, u) + "][" + "a".repeat(a.length - p - 2) + "]";
        }
        return "[" + "a".repeat(a.length - 2) + "]";
      };
      n = n.replace(o, u);
    }
    n = n.replace(this.tokenizer.rules.inline.anyPunctuation, (o) => "+".repeat(o.length)), n = n.replace(this.tokenizer.rules.inline.blockSkip, (o, u, a) => {
      let p = a ? a.length : 0;
      return o.slice(0, p) + "[" + "a".repeat(o.length - p - 2) + "]";
    }), n = this.options.hooks?.emStrongMask?.call({ lexer: this }, n) ?? n;
    let s = false, r = "", i = 1 / 0;
    for (; e; ) {
      if (e.length < i) i = e.length;
      else {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
      s || (r = ""), s = false;
      let o;
      if (this.options.extensions?.inline?.some((a) => (o = a.call({ lexer: this }, e, t)) ? (e = e.substring(o.raw.length), t.push(o), true) : false)) continue;
      if (o = this.tokenizer.escape(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.tag(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.link(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.reflink(e, this.tokens.links)) {
        e = e.substring(o.raw.length);
        let a = t.at(-1);
        o.type === "text" && a?.type === "text" ? (a.raw += o.raw, a.text += o.text) : t.push(o);
        continue;
      }
      if (o = this.tokenizer.emStrong(e, n, r)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.codespan(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.br(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.del(e, n, r)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.autolink(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (!this.state.inLink && (o = this.tokenizer.url(e))) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      let u = e;
      if (this.options.extensions?.startInline) {
        let a = 1 / 0, p = e.slice(1), c;
        this.options.extensions.startInline.forEach((h) => {
          c = h.call({ lexer: this }, p), typeof c == "number" && c >= 0 && (a = Math.min(a, c));
        }), a < 1 / 0 && a >= 0 && (u = e.substring(0, a + 1));
      }
      if (o = this.tokenizer.inlineText(u)) {
        e = e.substring(o.raw.length), o.raw.slice(-1) !== "_" && (r = o.raw.slice(-1)), s = true;
        let a = t.at(-1);
        a?.type === "text" ? (a.raw += o.raw, a.text += o.text) : t.push(o);
        continue;
      }
      if (e) {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
    }
    return t;
  }
  infiniteLoopError(e) {
    let t = "Infinite loop on byte: " + e;
    if (this.options.silent) console.error(t);
    else throw new Error(t);
  }
};
var P = class {
  constructor(e) {
    __publicField(this, "options");
    __publicField(this, "parser");
    this.options = e || R;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    let s = (t || "").match(m.notSpaceStart)?.[0], r = e.replace(m.endingNewline, "") + `
`;
    return s ? '<pre><code class="language-' + T(s) + '">' + (n ? r : T(r, true)) + `</code></pre>
` : "<pre><code>" + (n ? r : T(r, true)) + `</code></pre>
`;
  }
  blockquote({ tokens: e }) {
    return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
  }
  html({ text: e }) {
    return e;
  }
  def(e) {
    return "";
  }
  heading({ tokens: e, depth: t }) {
    return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`;
  }
  hr(e) {
    return `<hr>
`;
  }
  list(e) {
    let t = e.ordered, n = e.start, s = "";
    for (let o = 0; o < e.items.length; o++) {
      let u = e.items[o];
      s += this.listitem(u);
    }
    let r = t ? "ol" : "ul", i = t && n !== 1 ? ' start="' + n + '"' : "";
    return "<" + r + i + `>
` + s + "</" + r + `>
`;
  }
  listitem(e) {
    return `<li>${this.parser.parse(e.tokens)}</li>
`;
  }
  checkbox({ checked: e }) {
    return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox"> ';
  }
  paragraph({ tokens: e }) {
    return `<p>${this.parser.parseInline(e)}</p>
`;
  }
  table(e) {
    let t = "", n = "";
    for (let r = 0; r < e.header.length; r++) n += this.tablecell(e.header[r]);
    t += this.tablerow({ text: n });
    let s = "";
    for (let r = 0; r < e.rows.length; r++) {
      let i = e.rows[r];
      n = "";
      for (let o = 0; o < i.length; o++) n += this.tablecell(i[o]);
      s += this.tablerow({ text: n });
    }
    return s && (s = `<tbody>${s}</tbody>`), `<table>
<thead>
` + t + `</thead>
` + s + `</table>
`;
  }
  tablerow({ text: e }) {
    return `<tr>
${e}</tr>
`;
  }
  tablecell(e) {
    let t = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
    return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
`;
  }
  strong({ tokens: e }) {
    return `<strong>${this.parser.parseInline(e)}</strong>`;
  }
  em({ tokens: e }) {
    return `<em>${this.parser.parseInline(e)}</em>`;
  }
  codespan({ text: e }) {
    return `<code>${T(e, true)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, tokens: n }) {
    let s = this.parser.parseInline(n), r = Y(e);
    if (r === null) return s;
    e = r;
    let i = '<a href="' + e + '"';
    return t && (i += ' title="' + T(t) + '"'), i += ">" + s + "</a>", i;
  }
  image({ href: e, title: t, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    let r = Y(e);
    if (r === null) return T(n);
    e = r;
    let i = `<img src="${e}" alt="${T(n)}"`;
    return t && (i += ` title="${T(t)}"`), i += ">", i;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : T(e.text);
  }
};
var L = class {
  strong({ text: e }) {
    return e;
  }
  em({ text: e }) {
    return e;
  }
  codespan({ text: e }) {
    return e;
  }
  del({ text: e }) {
    return e;
  }
  html({ text: e }) {
    return e;
  }
  text({ text: e }) {
    return e;
  }
  link({ text: e }) {
    return "" + e;
  }
  image({ text: e }) {
    return "" + e;
  }
  br() {
    return "";
  }
  checkbox({ raw: e }) {
    return e;
  }
};
var b = class l2 {
  constructor(e) {
    __publicField(this, "options");
    __publicField(this, "renderer");
    __publicField(this, "textRenderer");
    this.options = e || R, this.options.renderer = this.options.renderer || new P(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new L();
  }
  static parse(e, t) {
    return new l2(t).parse(e);
  }
  static parseInline(e, t) {
    return new l2(t).parseInline(e);
  }
  parse(e) {
    this.renderer.parser = this;
    let t = "";
    for (let n = 0; n < e.length; n++) {
      let s = e[n];
      if (this.options.extensions?.renderers?.[s.type]) {
        let i = s, o = this.options.extensions.renderers[i.type].call({ parser: this }, i);
        if (o !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "checkbox", "html", "def", "paragraph", "text"].includes(i.type)) {
          t += o || "";
          continue;
        }
      }
      let r = s;
      switch (r.type) {
        case "space": {
          t += this.renderer.space(r);
          break;
        }
        case "hr": {
          t += this.renderer.hr(r);
          break;
        }
        case "heading": {
          t += this.renderer.heading(r);
          break;
        }
        case "code": {
          t += this.renderer.code(r);
          break;
        }
        case "table": {
          t += this.renderer.table(r);
          break;
        }
        case "blockquote": {
          t += this.renderer.blockquote(r);
          break;
        }
        case "list": {
          t += this.renderer.list(r);
          break;
        }
        case "checkbox": {
          t += this.renderer.checkbox(r);
          break;
        }
        case "html": {
          t += this.renderer.html(r);
          break;
        }
        case "def": {
          t += this.renderer.def(r);
          break;
        }
        case "paragraph": {
          t += this.renderer.paragraph(r);
          break;
        }
        case "text": {
          t += this.renderer.text(r);
          break;
        }
        default: {
          let i = 'Token with "' + r.type + '" type was not found.';
          if (this.options.silent) return console.error(i), "";
          throw new Error(i);
        }
      }
    }
    return t;
  }
  parseInline(e, t = this.renderer) {
    this.renderer.parser = this;
    let n = "";
    for (let s = 0; s < e.length; s++) {
      let r = e[s];
      if (this.options.extensions?.renderers?.[r.type]) {
        let o = this.options.extensions.renderers[r.type].call({ parser: this }, r);
        if (o !== false || !["escape", "html", "link", "image", "checkbox", "strong", "em", "codespan", "br", "del", "text"].includes(r.type)) {
          n += o || "";
          continue;
        }
      }
      let i = r;
      switch (i.type) {
        case "escape": {
          n += t.text(i);
          break;
        }
        case "html": {
          n += t.html(i);
          break;
        }
        case "link": {
          n += t.link(i);
          break;
        }
        case "image": {
          n += t.image(i);
          break;
        }
        case "checkbox": {
          n += t.checkbox(i);
          break;
        }
        case "strong": {
          n += t.strong(i);
          break;
        }
        case "em": {
          n += t.em(i);
          break;
        }
        case "codespan": {
          n += t.codespan(i);
          break;
        }
        case "br": {
          n += t.br(i);
          break;
        }
        case "del": {
          n += t.del(i);
          break;
        }
        case "text": {
          n += t.text(i);
          break;
        }
        default: {
          let o = 'Token with "' + i.type + '" type was not found.';
          if (this.options.silent) return console.error(o), "";
          throw new Error(o);
        }
      }
    }
    return n;
  }
};
var _a;
var S = (_a = class {
  constructor(e) {
    __publicField(this, "options");
    __publicField(this, "block");
    this.options = e || R;
  }
  preprocess(e) {
    return e;
  }
  postprocess(e) {
    return e;
  }
  processAllTokens(e) {
    return e;
  }
  emStrongMask(e) {
    return e;
  }
  provideLexer(e = this.block) {
    return e ? x.lex : x.lexInline;
  }
  provideParser(e = this.block) {
    return e ? b.parse : b.parseInline;
  }
}, __publicField(_a, "passThroughHooks", /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens", "emStrongMask"])), __publicField(_a, "passThroughHooksRespectAsync", /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens"])), _a);
var Z = class {
  constructor(...e) {
    __publicField(this, "defaults", A());
    __publicField(this, "options", this.setOptions);
    __publicField(this, "parse", this.parseMarkdown(true));
    __publicField(this, "parseInline", this.parseMarkdown(false));
    __publicField(this, "Parser", b);
    __publicField(this, "Renderer", P);
    __publicField(this, "TextRenderer", L);
    __publicField(this, "Lexer", x);
    __publicField(this, "Tokenizer", y);
    __publicField(this, "Hooks", S);
    this.use(...e);
  }
  walkTokens(e, t) {
    let n = [];
    for (let s of e) switch (n = n.concat(t.call(this, s)), s.type) {
      case "table": {
        let r = s;
        for (let i of r.header) n = n.concat(this.walkTokens(i.tokens, t));
        for (let i of r.rows) for (let o of i) n = n.concat(this.walkTokens(o.tokens, t));
        break;
      }
      case "list": {
        let r = s;
        n = n.concat(this.walkTokens(r.items, t));
        break;
      }
      default: {
        let r = s;
        this.defaults.extensions?.childTokens?.[r.type] ? this.defaults.extensions.childTokens[r.type].forEach((i) => {
          let o = r[i].flat(1 / 0);
          n = n.concat(this.walkTokens(o, t));
        }) : r.tokens && (n = n.concat(this.walkTokens(r.tokens, t)));
      }
    }
    return n;
  }
  use(...e) {
    let t = this.defaults.extensions || { renderers: {}, childTokens: {} };
    return e.forEach((n) => {
      let s = { ...n };
      if (s.async = this.defaults.async || s.async || false, n.extensions && (n.extensions.forEach((r) => {
        if (!r.name) throw new Error("extension name required");
        if ("renderer" in r) {
          let i = t.renderers[r.name];
          i ? t.renderers[r.name] = function(...o) {
            let u = r.renderer.apply(this, o);
            return u === false && (u = i.apply(this, o)), u;
          } : t.renderers[r.name] = r.renderer;
        }
        if ("tokenizer" in r) {
          if (!r.level || r.level !== "block" && r.level !== "inline") throw new Error("extension level must be 'block' or 'inline'");
          let i = t[r.level];
          i ? i.unshift(r.tokenizer) : t[r.level] = [r.tokenizer], r.start && (r.level === "block" ? t.startBlock ? t.startBlock.push(r.start) : t.startBlock = [r.start] : r.level === "inline" && (t.startInline ? t.startInline.push(r.start) : t.startInline = [r.start]));
        }
        "childTokens" in r && r.childTokens && (t.childTokens[r.name] = r.childTokens);
      }), s.extensions = t), n.renderer) {
        let r = this.defaults.renderer || new P(this.defaults);
        for (let i in n.renderer) {
          if (!(i in r)) throw new Error(`renderer '${i}' does not exist`);
          if (["options", "parser"].includes(i)) continue;
          let o = i, u = n.renderer[o], a = r[o];
          r[o] = (...p) => {
            let c = u.apply(r, p);
            return c === false && (c = a.apply(r, p)), c || "";
          };
        }
        s.renderer = r;
      }
      if (n.tokenizer) {
        let r = this.defaults.tokenizer || new y(this.defaults);
        for (let i in n.tokenizer) {
          if (!(i in r)) throw new Error(`tokenizer '${i}' does not exist`);
          if (["options", "rules", "lexer"].includes(i)) continue;
          let o = i, u = n.tokenizer[o], a = r[o];
          r[o] = (...p) => {
            let c = u.apply(r, p);
            return c === false && (c = a.apply(r, p)), c;
          };
        }
        s.tokenizer = r;
      }
      if (n.hooks) {
        let r = this.defaults.hooks || new S();
        for (let i in n.hooks) {
          if (!(i in r)) throw new Error(`hook '${i}' does not exist`);
          if (["options", "block"].includes(i)) continue;
          let o = i, u = n.hooks[o], a = r[o];
          S.passThroughHooks.has(i) ? r[o] = (p) => {
            if (this.defaults.async && S.passThroughHooksRespectAsync.has(i)) return (async () => {
              let h = await u.call(r, p);
              return a.call(r, h);
            })();
            let c = u.call(r, p);
            return a.call(r, c);
          } : r[o] = (...p) => {
            if (this.defaults.async) return (async () => {
              let h = await u.apply(r, p);
              return h === false && (h = await a.apply(r, p)), h;
            })();
            let c = u.apply(r, p);
            return c === false && (c = a.apply(r, p)), c;
          };
        }
        s.hooks = r;
      }
      if (n.walkTokens) {
        let r = this.defaults.walkTokens, i = n.walkTokens;
        s.walkTokens = function(o) {
          let u = [];
          return u.push(i.call(this, o)), r && (u = u.concat(r.call(this, o))), u;
        };
      }
      this.defaults = { ...this.defaults, ...s };
    }), this;
  }
  setOptions(e) {
    return this.defaults = { ...this.defaults, ...e }, this;
  }
  lexer(e, t) {
    return x.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return b.parse(e, t ?? this.defaults);
  }
  parseMarkdown(e) {
    return (n, s) => {
      let r = { ...s }, i = { ...this.defaults, ...r }, o = this.onError(!!i.silent, !!i.async);
      if (this.defaults.async === true && r.async === false) return o(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      if (typeof n > "u" || n === null) return o(new Error("marked(): input parameter is undefined or null"));
      if (typeof n != "string") return o(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n) + ", string expected"));
      if (i.hooks && (i.hooks.options = i, i.hooks.block = e), i.async) return (async () => {
        let u = i.hooks ? await i.hooks.preprocess(n) : n, p = await (i.hooks ? await i.hooks.provideLexer(e) : e ? x.lex : x.lexInline)(u, i), c = i.hooks ? await i.hooks.processAllTokens(p) : p;
        i.walkTokens && await Promise.all(this.walkTokens(c, i.walkTokens));
        let d = await (i.hooks ? await i.hooks.provideParser(e) : e ? b.parse : b.parseInline)(c, i);
        return i.hooks ? await i.hooks.postprocess(d) : d;
      })().catch(o);
      try {
        i.hooks && (n = i.hooks.preprocess(n));
        let a = (i.hooks ? i.hooks.provideLexer(e) : e ? x.lex : x.lexInline)(n, i);
        i.hooks && (a = i.hooks.processAllTokens(a)), i.walkTokens && this.walkTokens(a, i.walkTokens);
        let c = (i.hooks ? i.hooks.provideParser(e) : e ? b.parse : b.parseInline)(a, i);
        return i.hooks && (c = i.hooks.postprocess(c)), c;
      } catch (u) {
        return o(u);
      }
    };
  }
  onError(e, t) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
        let s = "<p>An error occurred:</p><pre>" + T(n.message + "", true) + "</pre>";
        return t ? Promise.resolve(s) : s;
      }
      if (t) return Promise.reject(n);
      throw n;
    };
  }
};
var M = new Z();
function f(l3, e) {
  return M.parse(l3, e);
}
f.options = f.setOptions = function(l3) {
  return M.setOptions(l3), f.defaults = M.defaults, j(f.defaults), f;
};
f.getDefaults = A;
f.defaults = R;
function dt(...l3) {
  return M.use(...l3), f.defaults = M.defaults, j(f.defaults), f;
}
f.use = dt;
f.walkTokens = function(l3, e) {
  return M.walkTokens(l3, e);
};
f.parseInline = M.parseInline;
f.Parser = b;
f.parser = b.parse;
f.Renderer = P;
f.TextRenderer = L;
f.Lexer = x;
f.lexer = x.lex;
f.Tokenizer = y;
f.Hooks = S;
f.parse = f;
var nn = f.options;
var rn = f.setOptions;
var sn = f.walkTokens;
var on = f.parseInline;
var ln = b.parse;
var un = x.lex;

// src/client/markdown.ts
function renderMarkdown(text) {
  try {
    const html = f.parse(text, { gfm: true, breaks: true });
    return typeof html === "string" ? html : String(html);
  } catch {
    return `<pre>${escapeHtml(text)}</pre>`;
  }
}
function isMarkdownPath(path) {
  const dot = path.lastIndexOf(".");
  if (dot <= 0) return false;
  const ext = path.slice(dot + 1).toLowerCase();
  return ext === "md" || ext === "markdown";
}
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// src/client/mdModeStore.ts
var import_react4 = require("react");
var DEFAULT_MD_MODE = "preview";
var MD_MODE_STORAGE_KEY = "dsh-file:md-mode:v1";
var VALID = /* @__PURE__ */ new Set(["preview", "source"]);
function loadMdMode(storage) {
  try {
    const raw = storage?.getItem(MD_MODE_STORAGE_KEY);
    return raw !== null && raw !== void 0 && VALID.has(raw) ? raw : DEFAULT_MD_MODE;
  } catch {
    return DEFAULT_MD_MODE;
  }
}
function persistMdMode(mode, storage) {
  try {
    storage?.setItem(MD_MODE_STORAGE_KEY, mode);
  } catch {
  }
}
var current = loadMdMode(safeStorage());
var listeners2 = /* @__PURE__ */ new Set();
function emit2() {
  for (const listener of listeners2) listener();
}
function safeStorage() {
  try {
    return typeof localStorage !== "undefined" ? localStorage : void 0;
  } catch {
    return void 0;
  }
}
function subscribe2(listener) {
  listeners2.add(listener);
  return () => {
    listeners2.delete(listener);
  };
}
function snapshot() {
  return current;
}
function useMdMode() {
  return (0, import_react4.useSyncExternalStore)(subscribe2, snapshot);
}
function setMdMode(mode) {
  current = mode;
  const storage = safeStorage();
  if (storage !== void 0) persistMdMode(mode, storage);
  emit2();
}

// src/client/themeStore.ts
var import_react5 = require("react");
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
function rgbToHex(r, g, b2) {
  const c = (x2) => Math.max(0, Math.min(255, Math.round(x2))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b2)}`;
}
function mixColors(a, b2, amount) {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b2);
  return rgbToHex(ar + (br - ar) * amount, ag + (bg - ag) * amount, ab + (bb - ab) * amount);
}
function luminanceOf(hex) {
  const [r, g, b2] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b2) / 255;
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
var current2 = load();
var listeners3 = /* @__PURE__ */ new Set();
function emit3() {
  for (const listener of listeners3) listener();
}
function subscribe3(listener) {
  listeners3.add(listener);
  return () => {
    listeners3.delete(listener);
  };
}
function snapshot2() {
  return current2;
}
function useEditorTheme() {
  return (0, import_react5.useSyncExternalStore)(subscribe3, snapshot2);
}
function setEditorTheme(partial) {
  current2 = { ...current2, ...partial };
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(current2));
  } catch {
  }
  emit3();
}
function resetEditorTheme() {
  current2 = { ...DEFAULT_EDITOR_THEME };
  try {
    if (typeof localStorage !== "undefined") localStorage.removeItem(STORAGE_KEY);
  } catch {
  }
  emit3();
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
  const [busy, setBusy] = (0, import_react6.useState)(false);
  const [notice, setNotice] = (0, import_react6.useState)(null);
  const theme = useEditorTheme();
  const chrome = themeChrome(theme);
  const mdMode = useMdMode();
  (0, import_react6.useEffect)(() => {
    setEditorViewActive(true);
    return () => setEditorViewActive(false);
  }, []);
  const saveActive = (0, import_react6.useCallback)(async () => {
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
  const saveRef = (0, import_react6.useRef)(saveActive);
  saveRef.current = saveActive;
  (0, import_react6.useEffect)(() => {
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
      isMarkdownPath(active.path) && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "button",
        {
          type: "button",
          className: "dshf-btn dshf-md-toggle",
          title: mdMode === "preview" ? "\u7F16\u8F91\u6E90\u7801" : "\u9884\u89C8\u6E32\u67D3\u6548\u679C",
          onClick: () => setMdMode(mdMode === "preview" ? "source" : "preview"),
          children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MdModeIcon, { mode: mdMode })
        }
      ),
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
    isMarkdownPath(active.path) && mdMode === "preview" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MarkdownPreview, { content: active.content, path: active.path, remote }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
  const [open, setOpen] = (0, import_react6.useState)(false);
  const [importError, setImportError] = (0, import_react6.useState)(null);
  const fileRef = (0, import_react6.useRef)(null);
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
        onClick: () => setOpen((v2) => !v2),
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
  const [mode, setMode] = (0, import_react6.useState)("loading");
  const [monacoLib, setMonacoLib] = (0, import_react6.useState)(null);
  const hostRef = (0, import_react6.useRef)(null);
  const editorRef = (0, import_react6.useRef)(null);
  const onChangeRef = (0, import_react6.useRef)(onChange);
  onChangeRef.current = onChange;
  const initialRef = (0, import_react6.useRef)(content);
  initialRef.current = content;
  (0, import_react6.useEffect)(() => {
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
  (0, import_react6.useEffect)(() => {
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
  (0, import_react6.useEffect)(() => {
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
function MarkdownPreview({ content, path, remote }) {
  const html = (0, import_react6.useMemo)(() => renderMarkdown(content), [content]);
  const rootRef = (0, import_react6.useRef)(null);
  const remoteRef = (0, import_react6.useRef)(remote);
  remoteRef.current = remote;
  (0, import_react6.useEffect)(() => {
    const root = rootRef.current;
    if (root === null) return;
    const dir = path.slice(0, path.lastIndexOf("/") + 1);
    const imgs = root.querySelectorAll("img[src]");
    let cancelled = false;
    for (const img of imgs) {
      const src = img.getAttribute("src") ?? "";
      if (/^(?:https?:|data:|blob:)/i.test(src)) continue;
      if (src.startsWith("#")) continue;
      const target = src.startsWith("/") ? src.slice(1) : `${dir}${src}`;
      void remoteRef.current.readDataUrl(target).then((result) => unwrap(result)).then(({ dataUrl }) => {
        if (cancelled) return;
        img.setAttribute("src", dataUrl);
      }).catch(() => {
      });
    }
    return () => {
      cancelled = true;
    };
  }, [html, path]);
  const onPreviewClick = (0, import_react6.useCallback)((e) => {
    const anchor = e.target.closest("a");
    if (anchor === null) return;
    const href = anchor.getAttribute("href") ?? "";
    e.preventDefault();
    if (/^https?:\/\//i.test(href)) {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "div",
    {
      ref: rootRef,
      className: "dshf-md-preview",
      onClick: onPreviewClick,
      dangerouslySetInnerHTML: { __html: html }
    }
  );
}
function MdModeIcon({ mode }) {
  if (mode === "preview") {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { width: "14", height: "14", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M4 2h8v1H4zM2 4h12v1H2zM4 6h8v1H4zM2 8h12v1H2zM4 10h4v1H4z", fill: "currentColor" }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { width: "14", height: "14", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M11.3 1.3l3.4 3.4-7.9 7.9L3 13l.4-3.8 7.9-7.9z", fill: "currentColor" }) });
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

// src/client/openLinks.ts
var OPEN_LABEL_RE = /^(?:打开|Open)\s/;
var DOUBLE_BACKSLASH = String.fromCharCode(92, 92);
function hasAncestorFlag(node, attr) {
  let current3 = node;
  while (current3 !== null) {
    const value = current3.getAttribute(attr);
    if (value !== null && value !== "false" && value !== "") return true;
    current3 = current3.parent;
  }
  return false;
}
function isHidden(node) {
  let current3 = node;
  while (current3 !== null) {
    if (current3.getAttribute("aria-hidden") === "true") return true;
    current3 = current3.parent;
  }
  return false;
}
function findOpenableLink(node) {
  let current3 = node;
  while (current3 !== null) {
    if (current3.tag === "button") {
      const title = current3.getAttribute("title");
      if (title === null || title.trim() === "") return null;
      const label = current3.getAttribute("aria-label") ?? "";
      const inRow = hasAncestorFlag(current3, "data-produced-files-row");
      if (inRow || OPEN_LABEL_RE.test(label)) {
        if (isHidden(current3)) return null;
        return title;
      }
      return null;
    }
    current3 = current3.parent;
  }
  return null;
}
function stripTrailingSlashes(value) {
  let end = value.length;
  while (end > 0 && (value.charCodeAt(end - 1) === 47 || value.charCodeAt(end - 1) === 92)) end -= 1;
  return value.slice(0, end);
}
function stripLeadingSlashes(value) {
  let start = 0;
  while (start < value.length && (value.charCodeAt(start) === 47 || value.charCodeAt(start) === 92)) start += 1;
  return value.slice(start);
}
function resolveWorkspacePath(cwd, path) {
  const winDrive = path.length >= 3 && path.charCodeAt(1) === 58 && // ':'
  (path[2] === "/" || path.charCodeAt(2) === 92) && // '/' or '\'
  /^[A-Za-z]$/.test(path.charAt(0));
  if (path.startsWith("/") || winDrive || path.startsWith(DOUBLE_BACKSLASH)) return path;
  if (cwd === void 0 || cwd === "") return path;
  return `${stripTrailingSlashes(cwd)}/${stripLeadingSlashes(path)}`;
}
function domNodeOf(element) {
  const parent = element.parentElement;
  return {
    tag: (element.tagName ?? "").toLowerCase() || null,
    getAttribute: (name) => element.getAttribute(name),
    parent: parent === null ? null : domNodeOf(parent)
  };
}
function installOpenLinksInterceptor(handlers) {
  if (typeof document === "undefined") return () => {
  };
  const onCapture = (event) => {
    if (event.button !== 0) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target === null) return;
    const path = findOpenableLink(domNodeOf(target));
    if (path === null) return;
    event.preventDefault();
    event.stopPropagation();
    void (async () => {
      try {
        const handled = await handlers.openInEditor(path);
        if (handled) return;
        const abs = resolveWorkspacePath(handlers.getCwd(), path);
        await handlers.openNative(abs);
      } catch (error) {
        handlers.onFail?.(path, error);
      }
    })();
  };
  document.addEventListener("click", onCapture, true);
  return () => document.removeEventListener("click", onCapture, true);
}

// src/client/settingsCard.tsx
var import_react7 = require("react");
var import_jsx_runtime4 = require("react/jsx-runtime");
var CLEAR = Symbol("clear");
var FIELDS = [
  { key: "root", type: "text", labelKey: "settings.root", hintKey: "settings.rootHint" },
  { key: "openLinksInEditor", type: "bool", labelKey: "settings.openLinks", hintKey: "settings.openLinksHint" }
];
var sCard = {
  pending: { whiteSpace: "nowrap", background: "var(--dsw-alias-bg-module-platform)", color: "var(--dsw-alias-label-secondary)", borderRadius: 999, padding: "1px 8px", fontSize: 11, fontWeight: 500, lineHeight: "17px" },
  readOnly: { color: "var(--dsw-alias-label-tertiary)", margin: "12px 0 0", fontSize: 12, lineHeight: 1.5 },
  field: { flexDirection: "column", gap: 6, padding: "12px 0", display: "flex" },
  fieldBorder: { borderTop: "1px solid var(--dsw-alias-border-l2)" },
  labelRow: { alignItems: "center", gap: 8, display: "flex" },
  label: { minWidth: 0, color: "var(--dsw-alias-label-primary)", flex: 1, fontSize: 13, fontWeight: 500, lineHeight: "20px" },
  badge: { background: "var(--dsw-alias-bg-module-platform)", color: "var(--dsw-alias-label-secondary)", borderRadius: 999, padding: "1px 8px", fontSize: 11, fontWeight: 500, lineHeight: "17px" },
  reset: { font: "inherit", color: "var(--dsw-alias-label-secondary)", cursor: "pointer", background: "none", border: "none", padding: 0, textDecoration: "underline" },
  hint: { color: "var(--dsw-alias-label-tertiary)", margin: 0, fontSize: 12, lineHeight: 1.5 },
  input: { border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-specific-input-major)", height: 34, borderRadius: 6, padding: "0 10px", color: "var(--dsw-alias-label-primary)", font: "inherit", fontSize: 13, width: "100%", boxSizing: "border-box", outline: "none" },
  boolRow: { alignItems: "center", gap: 12, minHeight: 34, display: "flex" },
  boolInput: { blockSize: 18, inlineSize: 34, accentColor: "var(--dsw-alias-brand-primary)", cursor: "pointer", flex: "none" },
  discard: { appearance: "none", font: "inherit", cursor: "pointer", border: "1px solid var(--dsw-alias-border-l2)", background: "transparent", borderRadius: 8, padding: "5px 12px", fontSize: 12, color: "var(--dsw-alias-label-secondary)" },
  save: { appearance: "none", font: "inherit", cursor: "pointer", border: "1px solid transparent", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 500, color: "#fff", background: "var(--dsw-alias-brand-primary)" },
  disabled: { opacity: 0.4, cursor: "default" },
  failed: { whiteSpace: "nowrap", color: "var(--dsw-alias-label-error)", fontSize: 12, lineHeight: 1.5 }
};
var draftText = (d, current3) => {
  if (d === void 0) return current3 === void 0 || current3 === null ? "" : String(current3);
  if (d === CLEAR) return "";
  return String(d);
};
var draftBool = (d, current3) => {
  if (d === void 0 || d === CLEAR) return !!current3;
  return !!d;
};
function FileManagerSettingsCard(props) {
  const { scope, t } = props;
  const [snap, setSnap] = (0, import_react7.useState)(() => scope?.getSnapshot());
  const [drafts, setDrafts] = (0, import_react7.useState)({});
  const [saving, setSaving] = (0, import_react7.useState)(false);
  const [failed2, setFailed] = (0, import_react7.useState)(false);
  (0, import_react7.useEffect)(() => {
    if (!scope) return;
    return scope.subscribe(() => setSnap(scope.getSnapshot()));
  }, [scope]);
  if (!scope || !snap || snap.status !== "ready") return null;
  const value = snap.value ?? {};
  const user = snap.user ?? {};
  const writable = !!snap.writable;
  const dirty = Object.keys(drafts).length > 0;
  const text = (key, fallback) => {
    const v2 = t ? t(key) : "";
    return v2 === "" || v2 === key ? fallback : v2;
  };
  const stage = (key, val) => {
    setDrafts((d) => ({ ...d, [key]: val }));
    setFailed(false);
  };
  const save = async () => {
    const ops = [];
    for (const f2 of FIELDS) {
      const d = drafts[f2.key];
      if (d === void 0) continue;
      if (d === CLEAR) {
        if (user[f2.key] !== void 0) ops.push({ key: f2.key, clear: true });
        continue;
      }
      if (f2.type === "bool") {
        if (d !== !!value[f2.key]) ops.push({ key: f2.key, value: !!d });
      } else {
        const raw = String(d).trim();
        if (raw === "") {
          if (user[f2.key] !== void 0) ops.push({ key: f2.key, clear: true });
        } else if (raw !== (value[f2.key] ?? "")) {
          ops.push({ key: f2.key, value: raw });
        }
      }
    }
    if (ops.length === 0) {
      setDrafts({});
      return;
    }
    setSaving(true);
    setFailed(false);
    try {
      for (const op of ops) {
        if (op.clear) await scope.unset(op.key);
        else await scope.set(op.key, op.value);
      }
      setDrafts({});
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { padding: "16px 16px 20px" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h4", { style: { margin: 0, fontSize: 14, fontWeight: 600, color: "var(--dsw-alias-label-primary)", flex: 1 }, children: text("settings.title", "\u6587\u4EF6\u7BA1\u7406\u5668\u8BBE\u7F6E") }),
      dirty ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: sCard.pending, children: text("settings.pending", "\u6709\u672A\u4FDD\u5B58\u4FEE\u6539") }) : null,
      failed2 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: sCard.failed, children: text("settings.failed", "\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5") }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            type: "button",
            style: { ...sCard.discard, ...!dirty || saving ? sCard.disabled : {} },
            disabled: !dirty || saving,
            onClick: () => setDrafts({}),
            children: text("settings.discard", "\u653E\u5F03\u4FEE\u6539")
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            type: "button",
            style: { ...sCard.save, ...!dirty || saving || !writable ? sCard.disabled : {} },
            disabled: !dirty || saving || !writable,
            onClick: () => void save(),
            children: saving ? text("settings.saving", "\u4FDD\u5B58\u4E2D\u2026") : text("settings.save", "\u4FDD\u5B58")
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { style: { color: "var(--dsw-alias-label-tertiary)", margin: "6px 0 0", fontSize: 12, lineHeight: 1.5 }, children: text("settings.desc", "\u5DE5\u4F5C\u533A\u6839\u76EE\u5F55\u4E0E\u4F1A\u8BDD\u6587\u4EF6\u94FE\u63A5\u884C\u4E3A\uFF1B\u4FDD\u5B58\u540E\u7ACB\u5373\u751F\u6548") }),
    writable ? null : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { style: sCard.readOnly, children: text("settings.readOnly", "\u5F53\u524D\u8BBE\u7F6E\u53EA\u8BFB\uFF08\u672A\u6302\u8F7D\u53EF\u5199\u8BBE\u7F6E\u5B58\u50A8\uFF09\u3002") }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { children: FIELDS.map((f2, i) => {
      const draft = drafts[f2.key];
      const overridden = user[f2.key] !== void 0 && draft !== CLEAR;
      const isClear = draft === CLEAR;
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { ...sCard.field, ...i > 0 ? sCard.fieldBorder : {} }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: sCard.labelRow, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("label", { style: sCard.label, htmlFor: `dsh-file-${f2.key}`, children: text(f2.labelKey, f2.labelKey) }),
          overridden ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: sCard.badge, children: text("settings.overridden", "\u5DF2\u8986\u76D6") }) : null,
          user[f2.key] !== void 0 && !isClear ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", style: sCard.reset, onClick: () => stage(f2.key, CLEAR), children: text("settings.reset", "\u91CD\u7F6E") }) : null
        ] }),
        f2.type === "bool" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: sCard.boolRow, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { ...sCard.hint, flex: 1 }, children: text(f2.hintKey, "") }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            "input",
            {
              id: `dsh-file-${f2.key}`,
              type: "checkbox",
              style: sCard.boolInput,
              checked: draftBool(draft, value[f2.key]),
              disabled: !writable || saving,
              onChange: (e) => stage(f2.key, e.target.checked)
            }
          )
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "input",
          {
            id: `dsh-file-${f2.key}`,
            type: "text",
            style: sCard.input,
            value: draftText(draft, value[f2.key]),
            disabled: !writable || saving,
            onChange: (e) => stage(f2.key, e.target.value)
          }
        ),
        f2.type === "text" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { style: sCard.hint, children: text(f2.hintKey, "") }) : null
      ] }, f2.key);
    }) })
  ] });
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

/* \u7EAF\u56FE\u6807\u6309\u94AE\uFF08\u5DE5\u5177\u6761\uFF09\uFF1ADSH \u98CE\u683C\u7684\u65E0\u8FB9\u6846 ghost \u56FE\u6807\u6309\u94AE */
.dshf-btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-color: transparent;
  padding: 4px;
  border-radius: 6px;
}

/* \u9875\u9762\u5185\u786E\u8BA4\u5F39\u5C42\uFF08\u66FF\u4EE3 window.confirm\uFF0C\u684C\u9762\u7AEF Electron \u4E0D\u652F\u6301\u539F\u751F\u5F39\u6846\uFF09 */
.dshf-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}
.dshf-modal {
  min-width: 260px;
  max-width: 360px;
  background: var(--dsw-alias-bg-primary, #ffffff);
  color: var(--dsw-alias-label-primary, #1f2328);
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.15));
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
  padding: 14px 16px;
}
.dshf-modal-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dshf-modal-body {
  font-size: 13px;
  color: var(--dsw-alias-label-secondary, #495057);
  margin-bottom: 14px;
  word-break: break-all;
}
.dshf-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.dshf-btn-danger {
  background: var(--dsw-alias-danger-fg, #c92a2a);
  border-color: transparent;
  color: #ffffff;
}
.dshf-btn-danger:hover {
  background: var(--dsw-alias-danger-fg, #c92a2a);
  filter: brightness(1.1);
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

/* VS Code \u5F0F\u5185\u8054\u8F93\u5165\u884C\uFF08\u65B0\u5EFA/\u91CD\u547D\u540D\uFF09\uFF1Aaccent \u8FB9\u6846\u7684\u8F93\u5165\u6846 */
.dshf-node-editing {
  cursor: default;
}
.dshf-inline-input {
  flex: 1;
  min-width: 0;
  font: inherit;
  font-size: 13px;
  line-height: 1.4;
  color: inherit;
  background: var(--dsw-alias-bg-primary, #ffffff);
  border: 1px solid var(--dsw-alias-accent-strong, #4dabf7);
  border-radius: 4px;
  padding: 1px 4px;
  outline: none;
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

/* \u2500\u2500 Markdown preview (read-only rendered view) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.dshf-editor-view .dshf-md-preview {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px 20px 32px;
  font-size: var(--dshf-font-size, 13px);
  line-height: 1.6;
  color: var(--dshf-fg, #1f2328);
  background: var(--dshf-bg, #ffffff);
  box-sizing: border-box;
  word-wrap: break-word;
}

.dshf-editor-view .dshf-md-preview > :first-child {
  margin-top: 0;
}

.dshf-editor-view .dshf-md-preview h1,
.dshf-editor-view .dshf-md-preview h2,
.dshf-editor-view .dshf-md-preview h3,
.dshf-editor-view .dshf-md-preview h4 {
  margin: 1.2em 0 0.5em;
  line-height: 1.3;
  color: var(--dshf-fg, #1f2328);
}
.dshf-editor-view .dshf-md-preview h1 { font-size: 1.6em; border-bottom: 1px solid var(--dshf-border, #e0e0e0); padding-bottom: 0.3em; }
.dshf-editor-view .dshf-md-preview h2 { font-size: 1.35em; border-bottom: 1px solid var(--dshf-border, #e0e0e0); padding-bottom: 0.25em; }
.dshf-editor-view .dshf-md-preview h3 { font-size: 1.15em; }
.dshf-editor-view .dshf-md-preview h4 { font-size: 1em; }

.dshf-editor-view .dshf-md-preview p {
  margin: 0.6em 0;
}

.dshf-editor-view .dshf-md-preview ul,
.dshf-editor-view .dshf-md-preview ol {
  margin: 0.6em 0;
  padding-left: 1.6em;
}

.dshf-editor-view .dshf-md-preview li {
  margin: 0.2em 0;
}

.dshf-editor-view .dshf-md-preview blockquote {
  margin: 0.8em 0;
  padding: 0.1em 1em;
  border-left: 3px solid var(--dshf-border, #d0d0d0);
  color: var(--dshf-muted, #868e96);
  background: var(--dshf-chip, #f3f3f3);
  border-radius: 0 6px 6px 0;
}

.dshf-editor-view .dshf-md-preview code {
  font-family: var(--dsw-font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  font-size: 0.92em;
  background: var(--dshf-chip, #ececec);
  border-radius: 4px;
  padding: 0.1em 0.35em;
}

.dshf-editor-view .dshf-md-preview pre {
  margin: 0.8em 0;
  padding: 10px 12px;
  background: var(--dshf-chip, #ececec);
  border: 1px solid var(--dshf-border, #d0d0d0);
  border-radius: 8px;
  overflow: auto;
}
.dshf-editor-view .dshf-md-preview pre code {
  background: transparent;
  padding: 0;
  font-size: 0.92em;
  line-height: 1.5;
}

.dshf-editor-view .dshf-md-preview a {
  color: var(--dshf-accent, #094771);
  text-decoration: none;
}
.dshf-editor-view .dshf-md-preview a:hover {
  text-decoration: underline;
}

.dshf-editor-view .dshf-md-preview img {
  max-width: 100%;
}

.dshf-editor-view .dshf-md-preview table {
  border-collapse: collapse;
  margin: 0.8em 0;
  display: block;
  overflow: auto;
  max-width: 100%;
}
.dshf-editor-view .dshf-md-preview th,
.dshf-editor-view .dshf-md-preview td {
  border: 1px solid var(--dshf-border, #d0d0d0);
  padding: 4px 10px;
}
.dshf-editor-view .dshf-md-preview th {
  background: var(--dshf-chip, #ececec);
  font-weight: 600;
}

.dshf-editor-view .dshf-md-preview hr {
  border: none;
  border-top: 1px solid var(--dshf-border, #d0d0d0);
  margin: 1em 0;
}

.dshf-editor-view .dshf-md-preview input[type='checkbox'] {
  margin-right: 0.4em;
}

/* Toggle button: keep it subtle like the theme button */
.dshf-editor-view .dshf-md-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 5px;
}
.dshf-editor-view .dshf-md-toggle svg {
  display: block;
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
var import_jsx_runtime5 = require("react/jsx-runtime");
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
  "view.empty": "\u5728\u5DE6\u4FA7\u6587\u4EF6\u6811\u4E2D\u9009\u62E9\u4E00\u4E2A\u6587\u4EF6\uFF0C\u5373\u53EF\u5728\u6B64\u7F16\u8F91",
  "settings.title": "\u6587\u4EF6\u7BA1\u7406\u5668\u8BBE\u7F6E",
  "settings.desc": "\u5DE5\u4F5C\u533A\u6839\u76EE\u5F55\u4E0E\u4F1A\u8BDD\u6587\u4EF6\u94FE\u63A5\u884C\u4E3A\uFF1B\u4FDD\u5B58\u540E\u7ACB\u5373\u751F\u6548",
  "settings.root": "\u5DE5\u4F5C\u533A\u6839\u76EE\u5F55\uFF08\u515C\u5E95\uFF09",
  "settings.rootHint": "\u6587\u4EF6\u7BA1\u7406\u5668\u6253\u5F00\u65F6\u4F1A\u9489\u5230\u5F53\u524D\u4F1A\u8BDD\u7684\u5DE5\u4F5C\u533A\uFF1B\u6B64\u5904\u4EC5\u5728\u4F1A\u8BDD\u672A\u9489\u5B9A\u6839\u76EE\u5F55\u65F6\u4F5C\u4E3A\u8D77\u59CB\u76EE\u5F55\u3002",
  "settings.openLinks": "\u4F1A\u8BDD\u6587\u4EF6\u94FE\u63A5\u7528\u7F16\u8F91\u5668\u6253\u5F00",
  "settings.openLinksHint": "\u5F00\u542F\u540E\u70B9\u51FB\u4F1A\u8BDD\u4E2D\u7684\u6587\u4EF6\u94FE\u63A5\uFF08\u4EA7\u7269 / \u884C\u5185\u5F15\u7528\uFF09\u4F1A\u5728\u6B64\u7F16\u8F91\u5668\u4E2D\u6253\u5F00\uFF1B\u7F16\u8F91\u5668\u5904\u7406\u4E0D\u4E86\u7684\u6587\u4EF6\u56DE\u9000\u5230\u7CFB\u7EDF\u6253\u5F00\u3002",
  "settings.overridden": "\u5DF2\u8986\u76D6",
  "settings.reset": "\u91CD\u7F6E",
  "settings.discard": "\u653E\u5F03\u4FEE\u6539",
  "settings.save": "\u4FDD\u5B58",
  "settings.saving": "\u4FDD\u5B58\u4E2D\u2026",
  "settings.pending": "\u6709\u672A\u4FDD\u5B58\u4FEE\u6539",
  "settings.failed": "\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5",
  "settings.readOnly": "\u5F53\u524D\u8BBE\u7F6E\u53EA\u8BFB\uFF08\u672A\u6302\u8F7D\u53EF\u5199\u8BBE\u7F6E\u5B58\u50A8\uFF09\u3002"
};
var en = {
  "toggle.label": "Files",
  "toggle.open": "Open file manager",
  "toggle.close": "Close file manager",
  "view.label": "Files",
  "view.empty": "Select a file in the sidebar tree to edit it here",
  "settings.title": "File manager settings",
  "settings.desc": "Workspace root and conversation file-link behavior; applies immediately on save",
  "settings.root": "Workspace root (fallback)",
  "settings.rootHint": "The manager pins to the active session workspace when opened; this root is only used until a session pins one.",
  "settings.openLinks": "Open conversation file links in the editor",
  "settings.openLinksHint": "When enabled, clicking conversation file links (produced files / inline mentions) opens them in this editor; files it cannot handle fall back to the system opener.",
  "settings.overridden": "Overridden",
  "settings.reset": "Reset",
  "settings.discard": "Discard changes",
  "settings.save": "Save",
  "settings.saving": "Saving...",
  "settings.pending": "Unsaved changes",
  "settings.failed": "Save failed, retry",
  "settings.readOnly": "Settings are read-only (no writable settings storage mounted)."
};
var inject = ["slots", "locale", "remote", "settingsScope"];
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-file: dictionaries");
  const t = ctx.locale.bind(NS);
  const SETTINGS_NS = "dsh-file";
  const settingsScope = ctx.settingsScope.bind({ namespace: SETTINGS_NS });
  ctx.slots.inject(
    "settings.plugin.item",
    () => ctx.slots.register({
      name: "settings.plugin.item",
      key: SETTINGS_NS,
      locale: NS,
      inject: () => ({ scope: settingsScope })
    }, FileManagerSettingsCard)
  );
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
    }, (props) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FileManagerPanel, { ...face, useSessions: props.useSessions, onFileOpened: activateEditorView }));
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
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FileEditorView, { remote });
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
  const activateEditorView = () => {
    const label = t("view.label");
    for (const tab of Array.from(document.querySelectorAll('[role="tab"]'))) {
      if (tab.textContent?.trim() === label) {
        tab.click();
        return;
      }
    }
  };
  let disposeLinkInterceptor = null;
  let unloaded = false;
  const setLinkInterceptor = (enabled) => {
    if (enabled && disposeLinkInterceptor === null) {
      disposeLinkInterceptor = installOpenLinksInterceptor(handlers);
      ctx.logger?.info?.("[dsh-file] openLinksInEditor: conversation file links open in the editor");
    } else if (!enabled && disposeLinkInterceptor !== null) {
      disposeLinkInterceptor();
      disposeLinkInterceptor = null;
    }
  };
  const syncFromSettings = () => {
    const snap = settingsScope.getSnapshot();
    if (snap.status !== "ready") return false;
    setLinkInterceptor(snap.value?.openLinksInEditor === true);
    return true;
  };
  const getSessionCwd = () => {
    const sessions = ctx.get("sessions");
    const snapshot3 = sessions?.list?.getSnapshot?.();
    const current3 = snapshot3?.current;
    if (current3 === void 0 || current3 === null) return void 0;
    return snapshot3?.byId?.[current3]?.cwd ?? void 0;
  };
  const openInEditor = async (path) => {
    const remote = ctx.get("remote.fileManager");
    if (remote === void 0) return false;
    try {
      const cwd = getSessionCwd();
      if (cwd !== void 0) {
        try {
          await unwrap(await remote.setRoot(cwd));
        } catch {
        }
      }
      const value = unwrap(await remote.readText(path));
      if (cwd !== void 0) setWorkspaceRoot(cwd);
      openTab({
        path,
        content: value.content,
        savedContent: value.content,
        mtimeMs: value.mtimeMs,
        dirty: false
      });
      activateEditorView();
      openPanel();
      return true;
    } catch {
      return false;
    }
  };
  const openNative = async (absPath) => {
    const workspaces = ctx.get("workspaces");
    if (workspaces === void 0) throw new Error("workspaces service unavailable");
    await workspaces.openPath(absPath);
  };
  const handlers = {
    getCwd: getSessionCwd,
    openInEditor,
    openNative,
    onFail: (path, error) => {
      ctx.logger?.warn?.(
        "[dsh-file] failed to open file link",
        path,
        error instanceof Error ? error.message : error
      );
    }
  };
  void mountRemote.then(() => {
    if (unloaded) return;
    const remote = ctx.get("remote.fileManager");
    if (remote === void 0) return;
    if (syncFromSettings()) return;
    void (async () => {
      try {
        const { openLinksInEditor } = unwrap(await remote.getConfig());
        setLinkInterceptor(openLinksInEditor);
      } catch (error) {
        ctx.logger?.warn?.(
          "[dsh-file] could not read openLinksInEditor (interceptor stays off)",
          error instanceof Error ? error.message : error
        );
      }
    })();
  });
  const disposeSettingsSync = settingsScope.subscribe(() => syncFromSettings());
  ctx.effect(() => () => {
    unloaded = true;
    disposeSettingsSync();
    closePanel();
    if (disposeLinkInterceptor !== null) {
      disposeLinkInterceptor();
      disposeLinkInterceptor = null;
    }
  }, "dsh-file: panel cleanup");
  void mountRemote;
}
function FileToggleButton(props) {
  const { wide, t, onToggle, isOpen } = props;
  const label = t ? t("toggle.label") : "\u6587\u4EF6";
  const title = t ? isOpen() ? t("toggle.close") : t("toggle.open") : void 0;
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    "button",
    {
      type: "button",
      className: "dshf-toggle",
      title,
      "aria-label": label,
      onClick: onToggle,
      style: isOpen() ? { fontWeight: 700 } : void 0,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FolderOpenIcon, { size: wide ? 14 : 16 }),
        wide ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "dshf-toggle-label", children: label }) : null
      ]
    }
  );
}
function FolderOpenIcon(props) {
  const size = props.size ?? 16;
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", style: { display: "block" }, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    "path",
    {
      d: "M5.19629 1.57104C5.81144 1.5711 6.38623 1.8786 6.72754 2.39038L7.19922 3.09839C7.28454 3.22635 7.42824 3.30344 7.58203 3.30347H12.1699C13.5039 3.30348 14.5859 4.38548 14.5859 5.71948V6.62671C15.2694 7.02689 15.6605 7.85012 15.4385 8.68726L14.3848 12.658C14.1037 13.7164 13.1449 14.4527 12.0498 14.4529H2.91699C1.51651 14.4529 0.451662 13.2814 0.501954 11.9519V3.98706C0.501954 2.65305 1.58396 1.57104 2.91797 1.57104H5.19629ZM3.7793 7.75562C3.30994 7.75562 2.89883 8.07153 2.77832 8.52515L1.91602 11.7722C1.74167 12.4291 2.23734 13.073 2.91699 13.073H12.0498C12.5191 13.0728 12.9304 12.757 13.0508 12.3035L14.1045 8.33374C14.1819 8.04202 13.9619 7.756 13.6602 7.75562H3.7793ZM2.91797 2.9519C2.34625 2.9519 1.88281 3.41534 1.88281 3.98706V7.2937C2.33068 6.7269 3.02249 6.37476 3.7793 6.37476H13.2051V5.71948C13.2051 5.14777 12.7416 4.68434 12.1699 4.68433H7.58203C6.96675 4.6843 6.39209 4.37595 6.05078 3.86401L5.5791 3.15601C5.49379 3.02821 5.34995 2.95196 5.19629 2.9519H2.91797Z",
      fill: "currentColor"
    }
  ) });
}
return module.exports;
  }
});

