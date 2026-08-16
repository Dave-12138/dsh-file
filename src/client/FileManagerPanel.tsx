/**
 * File manager SIDEBAR panel: the tree-only view shown while the file manager
 * is open. Clicking a file loads it into the shared store; the center-column
 * "文件" view (`conversation.view`) then displays and edits it inside the
 * page — never a popup, never inside the narrow sidebar.
 *
 * On mount it resolves the CURRENT conversation's workspace directory from the
 * session list (`SessionSummary.cwd`) and re-pins the host gateway root via
 * `remote.setRoot`, so the tree always reflects the active session's workspace
 * instead of the directory `dsh web` was launched from. When no session is
 * open yet it falls back to the gateway's configured root.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FileManagerRemote, FileEntry } from './remote.ts';
import { unwrap } from './remote.ts';
import { FileTree, type TreeRef } from './FileTree.tsx';
import { openTab, removeTabs, renameTab, resetAll } from './store.ts';

/** Simple classnames helper (no deps). */
function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

interface FileManagerPanelProps {
  /** The mounted remote face (ctx.remote.fileManager after $mount). */
  remote: FileManagerRemote;
  /** Called when the user closes the panel (returns to the workspace browser). */
  onClose: () => void;
  /** Standard sidebar.workspaces kit: read the current session's workspace. */
  useSessions?: FileManagerSessionHook;
}

/** Structural view of the standard useSessions selector hook (sidebar.workspaces kit). */
export type FileManagerSessionHook = <S>(
  sel: (s: { current?: string; byId: Record<string, { cwd?: string }> }) => S,
  eq?: (a: S, b: S) => boolean,
) => S;

export function FileManagerPanel({ remote, onClose, useSessions }: FileManagerPanelProps): JSX.Element | null {
  const [root, setRoot] = useState<string | null>(null);
  const [rootError, setRootError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const treeRef = useRef<TreeRef>(null);

  // Current conversation's workspace directory (SessionHeader.cwd), if any.
  const sessionCwd = useSessions
    ? useSessions((s) => (s.current !== undefined ? s.byId[s.current]?.cwd : undefined))
    : undefined;

  // Re-pin the gateway root to the active session's workspace; refresh the tree.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (sessionCwd !== undefined) {
          try {
            await unwrap(await remote.setRoot(sessionCwd));
          } catch {
            // setRoot unavailable (host not restarted yet): keep the configured root.
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

  // Panel closed: drop editor state (the center dialog closes with the tree).
  useEffect(() => () => {
    resetAll();
  }, []);

  const handleNotice = useCallback((message: string) => {
    setNotice(message);
  }, []);

  /** Open a file: read it if not already open, then focus its tab (center editor). */
  const openFile = useCallback(
    async (path: string) => {
      setBusy(true);
      try {
        const value = unwrap(await remote.readText(path));
        openTab({ path, content: value.content, savedContent: value.content, mtimeMs: value.mtimeMs, dirty: false });
      } catch (error) {
        handleNotice(`打开失败: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setBusy(false);
      }
    },
    [remote, handleNotice],
  );

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
        handleNotice(kind === 'directory' ? `已创建目录 ${name}` : `已创建文件 ${name}`);
      } catch (error) {
        handleNotice(`创建失败: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setBusy(false);
      }
    },
    [remote, root, openFile, handleNotice],
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
        renameTab(from, to);
        treeRef.current?.refresh();
        handleNotice(`已重命名 ${name}`);
      } catch (error) {
        handleNotice(`重命名失败: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setBusy(false);
      }
    },
    [remote, handleNotice],
  );

  /** Delete the currently selected tree node (confirm first). */
  const handleDelete = useCallback(
    async (path: string) => {
      if (!window.confirm(`确定删除 ${path}？此操作不可撤销。`)) return;
      setBusy(true);
      try {
        await unwrap(await remote.delete(path));
        removeTabs([path]);
        treeRef.current?.refresh();
        handleNotice('已删除');
      } catch (error) {
        handleNotice(`删除失败: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setBusy(false);
      }
    },
    [remote, handleNotice],
  );

  const title = useMemo(() => {
    if (root === null) return '…';
    return root.split('/').filter(Boolean).pop() || '/';
  }, [root]);

  return (
    <div className="dshf-root">
      <div className="dshf-toolbar">
        <span className="dshf-title" title={root ?? ''}>{title}</span>
        <span className="dshf-spacer" />
        <button type="button" className="dshf-btn" title="新建文件" onClick={() => void handleCreate('file')}>＋文件</button>
        <button type="button" className="dshf-btn" title="新建目录" onClick={() => void handleCreate('directory')}>＋目录</button>
        <button type="button" className="dshf-btn" title="关闭文件管理器" onClick={onClose}>✕</button>
      </div>

      {rootError !== null && <div className="dshf-error">{rootError}</div>}

      <div className="dshf-tree-pane">
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

      <div className="dshf-status">
        <span className="dshf-status-busy">{busy ? '…' : ''}</span>
        <span className={cx('dshf-status-notice', notice === null && 'dshf-hidden')}>{notice ?? ''}</span>
        <span className="dshf-spacer" />
        <span className="dshf-status-hint">点文件后在上方「文件」标签中编辑</span>
      </div>
    </div>
  );
}

export type { FileEntry };
