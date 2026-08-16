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
 *  4. Register the file EDITOR as a `conversation.view` tab ("文件"). The
 *     sidebar tree only browses; clicking a file loads it into the shared
 *     store and the editor renders IN the conversation center column's scroll
 *     body (beside chat / trajectory), never as a popup.
 *
 * The client bundle is built to the ModuleLoader handoff format
 * (`window.__ModuleLoader__.load({ id, factory })`) by build.mjs; this module
 * is the bundle's entry, exporting the cordis plugin surface.
 */
import type { Context } from '@deepseek-ai/cordis';
import { TYPERT_REMOTE, type FileManagerRemote } from './remote.ts';
import { FileManagerPanel, type FileManagerSessionHook } from './FileManagerPanel.tsx';
import { FileEditorView } from './FileEditorView.tsx';
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
  'view.label': '文件',
  'view.empty': '在左侧文件树中选择一个文件，即可在此编辑',
};

const en: Record<keyof typeof zh, string> = {
  'toggle.label': 'Files',
  'toggle.open': 'Open file manager',
  'toggle.close': 'Close file manager',
  'view.label': 'Files',
  'view.empty': 'Select a file in the sidebar tree to edit it here',
};

/** Required client services. */
export const inject = ['slots', 'locale', 'remote'];

/**
 * Client plugin body: mount the remote, register the footer button, the
 * sidebar tree panel toggle, and the center-column editor view.
 */
export function apply(ctx: Context) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-file: dictionaries');
  const t = ctx.locale.bind(NS);

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
    // the lowest live entry (ours) renders while we stay registered. The
    // panel receives the slot's standard kit (useSessions / useWorkspaces)
    // so it can resolve the current conversation's workspace directory.
    disposePanel = ctx.slots.register({
      name: 'sidebar.workspaces',
      priority: -1,
      registrant: 'dsh-file',
    }, (props: { wide?: boolean; useSessions?: FileManagerSessionHook }) => (
      <FileManagerPanel {...face} useSessions={props.useSessions} />
    ));
    open = true;
    ctx.logger?.info?.('[dsh-file] file manager opened');
  };

  const togglePanel = () => (open ? closePanel() : openPanel());

  // ── center-column editor view (conversation.view) ────────────────────────
  // A view tab beside chat / trajectory. The session header renders the tab;
  // the view area (inside the conversation scroll body) renders our editor
  // when active. Renders a hint until a file is opened from the sidebar tree.
  ctx.slots.inject('conversation.view', () => ctx.slots.register({
    name: 'conversation.view',
    id: 'dsh-file',
    order: 20,
    label: () => t('view.label'),
    locale: NS,
    registrant: 'dsh-file',
  }, () => {
    const remote = ctx.get('remote.fileManager') as unknown as FileManagerRemote | undefined;
    if (remote === undefined) return null;
    return <FileEditorView remote={remote} />;
  }));

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
