/**
 * Lazy file tree: lists the workspace root, expands directories on demand,
 * and opens files on click. Selection + rename/delete actions are surfaced
 * through a small imperative handle for the toolbar.
 */
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { FileManagerRemote, FileEntry } from './remote.ts';
import { unwrap } from './remote.ts';

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** A directory node that has been expanded at least once. */
interface DirNode {
  path: string;
  entries: FileEntry[] | null; // null while loading
  error?: string;
}

export interface TreeRef {
  /** Current selected path, if any. */
  selected(): string | null;
  /** Refresh the root listing. */
  refresh(): void;
  /** Current directory for "new file/dir" targets (selected dir, else root). */
  cwd(): string;
}

interface FileTreeProps {
  remote: FileManagerRemote;
  root: string;
  onOpenFile: (path: string) => void;
  onRename: (path: string) => void;
  onDelete: (path: string) => void;
}

export const FileTree = forwardRef<TreeRef, FileTreeProps>(function FileTree(
  { remote, root, onOpenFile, onRename, onDelete },
  ref,
) {
  const [expanded, setExpanded] = useState<Record<string, DirNode>>({ [root]: { path: root, entries: null } });
  const [selected, setSelected] = useState<string | null>(null);
  const [rev, setRev] = useState(0); // bump to reload the root
  const loaded = useRef<Record<string, boolean>>({});

  /** Load (or reload) one directory level. */
  const loadDir = useCallback(
    async (path: string) => {
      setExpanded((prev) => ({ ...prev, [path]: { ...(prev[path] ?? { path }), entries: null, error: undefined } }));
      try {
        const value = unwrap(await remote.listDir(path));
        setExpanded((prev) => ({ ...prev, [path]: { path, entries: value.entries } }));
      } catch (error) {
        setExpanded((prev) => ({ ...prev, [path]: { path, entries: [], error: error instanceof Error ? error.message : String(error) } }));
      }
    },
    [remote],
  );

  // Initial load of the root.
  useEffect(() => {
    void loadDir(root);
  }, [root, rev, loadDir]);

  // The toolbar "new file/dir" flow targets the selected directory.
  useImperativeHandle(ref, () => ({
    selected: () => selected,
    refresh: () => setRev((v) => v + 1),
    cwd: () => {
      // Selected directory wins; a selected file falls back to its parent;
      // otherwise the root.
      if (selected === null) return root;
      const last = selected.split('/').filter(Boolean).pop() ?? '';
      if (expanded[selected] !== undefined) return selected; // selected dir
      return selected.slice(0, selected.length - last.length - 1) || root;
    },
  }), [selected, root, expanded]);

  const node = expanded[root];

  /** Recursively render one level (inline; the tree is shallow by default). */
  const renderLevel = useCallback(
    (path: string, entries: FileEntry[], depth: number) => {
      return entries.map((entry) => {
        const full = `${path.replace(/\/$/, '')}/${entry.name}`;
        const isDir = entry.type === 'directory';
        const isOpen = expanded[full] !== undefined;
        return (
          <div key={full}>
            <div
              className={cx('dshf-node', selected === full && 'dshf-selected')}
              style={{ paddingLeft: `${8 + depth * 14}px` }}
              onClick={() => {
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
              }}
              onDoubleClick={() => {
                if (!isDir && selected === full) onOpenFile(full);
              }}
              title={full}
            >
              <span className="dshf-caret">{isDir ? (isOpen ? '▾' : '▸') : ''}</span>
              <span className={cx('dshf-icon', isDir ? 'dshf-icon-dir' : 'dshf-icon-file')}>{isDir ? '📁' : '📄'}</span>
              <span className="dshf-name">{entry.name}</span>
              {isDir && isOpen && (
                <span className="dshf-node-actions">
                  <button type="button" className="dshf-mini" title="重命名" onClick={(e) => { e.stopPropagation(); onRename(full); }}>✎</button>
                  <button type="button" className="dshf-mini" title="删除" onClick={(e) => { e.stopPropagation(); onDelete(full); }}>🗑</button>
                </span>
              )}
              {!isDir && (
                <span className="dshf-node-actions">
                  <button type="button" className="dshf-mini" title="重命名" onClick={(e) => { e.stopPropagation(); onRename(full); }}>✎</button>
                  <button type="button" className="dshf-mini" title="删除" onClick={(e) => { e.stopPropagation(); onDelete(full); }}>🗑</button>
                </span>
              )}
            </div>
            {isDir && isOpen && (
              <DirChildren
                node={expanded[full]}
                depth={depth + 1}
                onRender={renderLevel}
                onLoad={loadDir}
              />
            )}
          </div>
        );
      });
    },
    [expanded, selected, loadDir, onOpenFile, onRename, onDelete],
  );

  return (
    <div className="dshf-tree-scroll">
      {node === undefined ? null : node.entries === null ? (
        <div className="dshf-tree-hint">{node.error ? `加载失败: ${node.error}` : '加载中…'}</div>
      ) : (
        <div className="dshf-tree-list">
          {node.entries.length === 0 && <div className="dshf-tree-hint">（空目录）</div>}
          {renderLevel(root, node.entries, 0)}
        </div>
      )}
    </div>
  );
});

/** Rendered children of one expanded directory (loading state handled here). */
function DirChildren({ node, depth, onRender, onLoad }: {
  node: DirNode;
  depth: number;
  onRender: (path: string, entries: FileEntry[], depth: number) => React.ReactNode;
  onLoad: (path: string) => void;
}): JSX.Element | null {
  if (node === undefined || node.entries === null) {
    return <div className="dshf-tree-hint" style={{ paddingLeft: `${8 + depth * 14}px` }}>{node?.error ?? '加载中…'}</div>;
  }
  return <>{onRender(node.path, node.entries, depth)}</>;
}
