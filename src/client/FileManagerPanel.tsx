/**
 * File manager panel: the sidebar main-area view shown while the file manager
 * is open. Composes a file tree, an editor, and a compact action toolbar.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FileManagerRemote, FileEntry } from './remote.ts';
import { unwrap } from './remote.ts';
import { ensureMonaco, monacoUnavailable } from './monaco.ts';
import { FileTree, type TreeRef } from './FileTree.tsx';

/** Simple classnames helper (no deps). */
function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

interface FileManagerPanelProps {
  /** The mounted remote face (ctx.remote.fileManager after $mount). */
  remote: FileManagerRemote;
  /** Called when the user closes the panel (returns to the workspace browser). */
  onClose: () => void;
}

/** One open editor tab. */
interface OpenTab {
  path: string;
  content: string;
  savedContent: string;
  mtimeMs: number;
  dirty: boolean;
  error?: string;
}

export function FileManagerPanel({ remote, onClose }: FileManagerPanelProps): JSX.Element | null {
  const [root, setRoot] = useState<string | null>(null);
  const [rootError, setRootError] = useState<string | null>(null);
  const [tabs, setTabs] = useState<OpenTab[]>([]);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const treeRef = useRef<TreeRef>(null);

  // Resolve the workspace root on mount.
  useEffect(() => {
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

  const activeTab = useMemo(
    () => (activePath === null ? undefined : tabs.find((t) => t.path === activePath)),
    [tabs, activePath],
  );

  /** Open a file: read it if not already open, then focus its tab. */
  const openFile = useCallback(
    async (path: string) => {
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
          { path, content: value.content, savedContent: value.content, mtimeMs: value.mtimeMs, dirty: false },
        ]);
        setActivePath(path);
      } catch (error) {
        setNotice(`打开失败: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setBusy(false);
      }
    },
    [remote, tabs],
  );

  /** Update editor content for the active tab. */
  const updateContent = useCallback((content: string) => {
    setTabs((prev) => prev.map((t) => (t.path === activePath ? { ...t, content, dirty: content !== t.savedContent } : t)));
  }, [activePath]);

  /** Save the active tab back to disk. */
  const saveActive = useCallback(async () => {
    if (activeTab === undefined || !activeTab.dirty) return;
    setBusy(true);
    try {
      await unwrap(await remote.writeText(activeTab.path, activeTab.content));
      setTabs((prev) => prev.map((t) => (t.path === activeTab.path ? { ...t, savedContent: t.content, dirty: false } : t)));
      setNotice(`已保存 ${activeTab.path.split('/').pop()}`);
      treeRef.current?.refresh();
    } catch (error) {
      setNotice(`保存失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  }, [activeTab, remote, treeRef]);

  /** Close the active tab (discards unsaved changes after confirm). */
  const closeActive = useCallback(() => {
    if (activeTab === undefined) return;
    if (activeTab.dirty && !window.confirm(`放弃对 ${activeTab.path} 的未保存修改？`)) return;
    setTabs((prev) => prev.filter((t) => t.path !== activeTab.path));
    setActivePath((current) => {
      if (current === null) return null;
      const remaining = tabs.filter((t) => t.path !== current);
      return remaining.length > 0 ? remaining[remaining.length - 1].path : null;
    });
  }, [activeTab, tabs]);

  /** Create a new file/dir in the tree's current directory. */
  const handleCreate = useCallback(
    async (kind: 'file' | 'directory') => {
      const cwd = treeRef.current?.cwd() ?? root ?? '';
      const name = window.prompt(kind === 'directory' ? '新建目录名称:' : '新建文件名称:');
      if (!name) return;
      setBusy(true);
      try {
        const target = `${cwd.replace(/\/$/, '')}/${name}`;
        if (kind === 'directory') await unwrap(await remote.createDirectory(target));
        else {
          await unwrap(await remote.createFile(target));
          await openFile(target);
        }
        treeRef.current?.refresh();
        setNotice(kind === 'directory' ? `已创建目录 ${name}` : `已创建文件 ${name}`);
      } catch (error) {
        setNotice(`创建失败: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setBusy(false);
      }
    },
    [remote, root, openFile, treeRef],
  );

  /** Rename the currently selected tree node. */
  const handleRename = useCallback(
    async (from: string) => {
      const name = window.prompt('重命名为:', from.split('/').pop() ?? '');
      if (!name || name === from.split('/').pop()) return;
      const to = `${from.slice(0, from.lastIndexOf('/'))}/${name}`;
      setBusy(true);
      try {
        await unwrap(await remote.rename(from, to));
        setTabs((prev) => prev.map((t) => (t.path === from ? { ...t, path: to } : t)));
        if (activePath === from) setActivePath(to);
        treeRef.current?.refresh();
        setNotice(`已重命名 ${name}`);
      } catch (error) {
        setNotice(`重命名失败: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setBusy(false);
      }
    },
    [remote, activePath, treeRef],
  );

  /** Delete the currently selected tree node (confirm first). */
  const handleDelete = useCallback(
    async (path: string) => {
      if (!window.confirm(`确定删除 ${path}？此操作不可撤销。`)) return;
      setBusy(true);
      try {
        await unwrap(await remote.delete(path));
        setTabs((prev) => prev.filter((t) => t.path !== path));
        if (activePath === path) setActivePath(null);
        treeRef.current?.refresh();
        setNotice(`已删除`);
      } catch (error) {
        setNotice(`删除失败: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setBusy(false);
      }
    },
    [remote, activePath, treeRef],
  );

  return (
    <div className="dshf-root" onKeyDown={(e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void saveActive();
      }
    }}>
      <div className="dshf-toolbar">
        <span className="dshf-title" title={root ?? ''}>{root ? root.split('/').filter(Boolean).pop() || '/' : '…'}</span>
        <span className="dshf-spacer" />
        <button type="button" className="dshf-btn" title="新建文件" onClick={() => void handleCreate('file')}>＋文件</button>
        <button type="button" className="dshf-btn" title="新建目录" onClick={() => void handleCreate('directory')}>＋目录</button>
        <button type="button" className="dshf-btn" title="保存 (Ctrl+S)" disabled={activeTab === undefined || !activeTab.dirty} onClick={() => void saveActive()}>保存</button>
        <button type="button" className="dshf-btn" title="关闭文件管理器" onClick={onClose}>✕</button>
      </div>

      {rootError !== null && <div className="dshf-error">{rootError}</div>}

      <div className="dshf-body">
        <div className="dshf-tree">
          {root !== null && (
            <FileTree
              ref={treeRef}
              remote={remote}
              root={root}
              onOpenFile={(p) => void openFile(p)}
              onRename={(p) => void handleRename(p)}
              onDelete={(p) => void handleDelete(p)}
            />
          )}
        </div>
        <div className="dshf-editor">
          {activeTab === undefined ? (
            <div className="dshf-empty">选择左侧文件以查看或编辑</div>
          ) : (
            <EditorPane
              key={activeTab.path}
              path={activeTab.path}
              content={activeTab.content}
              dirty={activeTab.dirty}
              onChange={updateContent}
            />
          )}
        </div>
      </div>

      <div className="dshf-status">
        <span className="dshf-status-busy">{busy ? '…' : ''}</span>
        <span className={cx('dshf-status-notice', notice === null && 'dshf-hidden')}>{notice ?? ''}</span>
        {activeTab !== undefined && (
          <span className="dshf-status-path" title={activeTab.path}>{activeTab.path}</span>
        )}
      </div>
    </div>
  );
}

/** Editor pane: Monaco when available, textarea fallback otherwise.
 *
 * The Monaco instance is UNCONTROLLED: it is created once per `path` with the
 * initial content, and every change is reported up via `onChange` (through a
 * ref so the listener never goes stale). The parent owns the "dirty" state;
 * we never re-create the editor from `content` (that would drop the caret
 * and lose keystrokes on each keystroke).
 */
function EditorPane({ path, content, dirty, onChange }: {
  path: string;
  content: string;
  dirty: boolean;
  onChange: (content: string) => void;
}): JSX.Element {
  const [mode, setMode] = useState<'loading' | 'monaco' | 'textarea'>('loading');
  const [monacoLib, setMonacoLib] = useState<unknown>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<{ dispose(): void } | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  // Initial content captured once per path (uncontrolled editor).
  const initialRef = useRef(content);
  initialRef.current = content;

  // Stage 1: load Monaco (async). When the CDN is unreachable, fall back to a
  // plain textarea. Runs once per path.
  useEffect(() => {
    let disposed = false;
    setMode('loading');
    ensureMonaco().then((monaco) => {
      if (disposed) return;
      setMonacoLib(monaco);
      setMode('monaco');
    }).catch(() => {
      if (!disposed) setMode('textarea');
    });
    return () => {
      disposed = true;
      setMonacoLib(null);
    };
  }, [path]);

  // Stage 2: create the Monaco editor once the lib AND the host node exist.
  useEffect(() => {
    if (mode !== 'monaco' || monacoLib === null || hostRef.current === null) return;
    const initial = initialRef.current;
    const monacoAny = monacoLib as unknown as {
      editor: {
        create(el: HTMLElement, options: Record<string, unknown>): { dispose(): void; getValue(): string; onDidChangeModelContent(fn: () => void): void; setValue(v: string): void };
        setTheme(name: string): void;
      };
    };
    try {
      monacoAny.editor.setTheme('vs-dark');
    } catch { /* theme is optional */ }
    const editor = monacoAny.editor.create(hostRef.current, {
      value: initial,
      language: languageOf(path),
      automaticLayout: true,
      fontSize: 13,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      tabSize: 2,
    });
    editor.onDidChangeModelContent(() => onChangeRef.current(editor.getValue()));
    editorRef.current = editor;
    return () => {
      editor.dispose();
      editorRef.current = null;
    };
    // Create the editor once per path (uncontrolled Monaco; see module doc).
  }, [mode, monacoLib, path]);

  if (mode === 'monaco') {
    return (
      <div className="dshf-editor-host">
        <div className="dshf-editor-tabbar">
          <span className={cx('dshf-tabname', dirty && 'dshf-dirty')}>{dirty ? '● ' : ''}{path.split('/').pop()}</span>
        </div>
        <div ref={hostRef} className="dshf-monaco" />
      </div>
    );
  }

  if (mode === 'loading') {
    return <div className="dshf-empty">编辑器加载中…</div>;
  }

  // textarea fallback (Monaco CDN unreachable)
  return (
    <div className="dshf-editor-host">
      <div className="dshf-editor-tabbar">
        <span className={cx('dshf-tabname', dirty && 'dshf-dirty')}>{dirty ? '● ' : ''}{path.split('/').pop()}</span>
      </div>
      <textarea
        className="dshf-textarea"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
    </div>
  );
}

/** Map a file path to a Monaco language id (small built-in subset). */
function languageOf(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  switch (ext) {
    case 'ts': case 'tsx': case 'mts': case 'cts': return 'typescript';
    case 'js': case 'jsx': case 'mjs': case 'cjs': return 'javascript';
    case 'json': return 'json';
    case 'md': case 'markdown': return 'markdown';
    case 'html': case 'htm': return 'html';
    case 'css': return 'css';
    case 'scss': return 'scss';
    case 'less': return 'less';
    case 'py': return 'python';
    case 'rb': return 'ruby';
    case 'go': return 'go';
    case 'rs': return 'rust';
    case 'java': return 'java';
    case 'c': case 'h': return 'c';
    case 'cpp': case 'cc': case 'hpp': return 'cpp';
    case 'cs': return 'csharp';
    case 'sh': case 'bash': return 'shell';
    case 'yml': case 'yaml': return 'yaml';
    case 'xml': case 'svg': return 'xml';
    case 'sql': return 'sql';
    case 'php': return 'php';
    case 'vue': return 'html';
    case 'svelte': return 'html';
    default: return 'plaintext';
  }
}

export type { FileEntry };
export { monacoUnavailable };
