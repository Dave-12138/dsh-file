/**
 * Client half of the dsh-file plugin.
 *
 * Responsibilities:
 *  1. Mount the `fileManager` Typert Remote contribution so
 *     `ctx.remote.fileManager.*` becomes callable.
 *  2. Register a "文件" button into the sidebar footer action list.
 *  3. Toggle the file-manager panel: while open, we register a shadow entry
 *     into the `sidebar.workspaces` slot at priority -1 (the workspace
 *     browser's own entry sits at default priority 0, so ours wins the cell);
 *     closing disposes the entry and the workspace browser returns.
 *
 * The client bundle is built to the ModuleLoader handoff format
 * (`window.__ModuleLoader__.load({ id, factory })`) by build.mjs; this module
 * is the bundle's entry, exporting the cordis plugin surface.
 */
import type { Context } from '@deepseek-ai/cordis';
import { TYPERT_REMOTE, type FileManagerRemote } from './remote.ts';
import { FileManagerPanel } from './FileManagerPanel.tsx';
import styles from './styles.css';

// Inject the plugin stylesheet once (the bundle's css is text via esbuild).
const CSS_TAG = 'dsh-file/styles.css';
if (typeof document !== 'undefined' && document.querySelector(`style[data-plugin-css="${CSS_TAG}"]`) === null) {
  const tag = document.createElement('style');
  tag.dataset.plugin = 'dsh-file';
  tag.dataset.pluginCss = CSS_TAG;
  tag.textContent = styles;
  document.head.appendChild(tag);
}

/** Dictionary namespace owned by this plugin. */
const NS = 'dshFile';

const zh = {
  'toggle.label': '文件',
  'toggle.open': '打开文件管理器',
  'toggle.close': '关闭文件管理器',
};

const en: Record<keyof typeof zh, string> = {
  'toggle.label': 'Files',
  'toggle.open': 'Open file manager',
  'toggle.close': 'Close file manager',
};

/** Required client services. */
export const inject = ['slots', 'locale', 'remote'];

/**
 * Client plugin body: mount the remote, register the footer button, and
 * wire the panel toggle.
 */
export function apply(ctx: Context) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-file: dictionaries');

  // Mount the remote contribution (async; $mount installs namespace services).
  const mountRemote = ctx.effect(async () => {
    const dispose = await ctx.remote.$mount(TYPERT_REMOTE);
    return () => dispose();
  }, 'dsh-file: remote mount');

  // ── panel toggle state ───────────────────────────────────────────────────
  // While open, `disposePanel` holds the disposer of our sidebar.workspaces
  // shadow entry; closing runs it and the workspace browser resurfaces.
  let disposePanel: (() => void) | null = null;
  let open = false;

  const closePanel = () => {
    if (disposePanel === null) return;
    disposePanel();
    disposePanel = null;
    open = false;
    ctx.logger?.info?.('[dsh-file] file manager closed');
  };

  const openPanel = () => {
    if (disposePanel !== null) return;
    // Resolve the mounted namespace service through ctx.get (a bare property
    // read would require the `remote.fileManager` inject, which cannot be
    // declared because we mount the contribution inside our own apply).
    const remote = ctx.get('remote.fileManager') as unknown as FileManagerRemote;
    const face = {
      remote,
      onClose: closePanel,
    };
    // Register a shadow entry at priority -1: the sidebar.workspaces cell is
    // single, and the workspace browser registered at default priority 0, so
    // the lowest live entry (ours) renders while we stay registered.
    disposePanel = ctx.slots.register({
      name: 'sidebar.workspaces',
      priority: -1,
      registrant: 'dsh-file',
    }, (props: { wide?: boolean }) => (
      <FileManagerPanel {...face} />
    ));
    open = true;
    ctx.logger?.info?.('[dsh-file] file manager opened');
  };

  const togglePanel = () => (open ? closePanel() : openPanel());

  // ── footer button ────────────────────────────────────────────────────────
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'dsh-file-toggle',
    locale: NS,
    inject: () => ({
      onToggle: togglePanel,
      isOpen: () => open,
    }),
  }, FileToggleButton));

  // On unload, close the panel (restores the workspace browser).
  ctx.effect(() => () => {
    closePanel();
  }, 'dsh-file: panel cleanup');

  // Keep the mount effect referenced so it isn't tree-shaken.
  void mountRemote;
}

/** The footer action button. */
function FileToggleButton(props: {
  wide?: boolean;
  t?: (key: string) => string;
  onToggle: () => void;
  isOpen: () => boolean;
}): JSX.Element {
  const { wide, t, onToggle, isOpen } = props;
  const label = t ? t('toggle.label') : '文件';
  const title = t ? (isOpen() ? t('toggle.close') : t('toggle.open')) : undefined;
  return (
    <button
      type="button"
      className="dshf-toggle"
      title={title}
      aria-label={label}
      onClick={onToggle}
      style={isOpen() ? { fontWeight: 700, color: 'var(--dsw-alias-accent-strong, #4dabf7)' } : undefined}
    >
      <span aria-hidden="true" style={{ fontSize: wide ? 14 : 16, lineHeight: 1 }}>🗂</span>
      {wide ? <span className="dshf-toggle-label">{label}</span> : null}
    </button>
  );
}
