/**
 * Settings card for dsh-file in the settings panel.
 *
 * Rendered through the `settings.plugin.item` slot, keyed by the `dsh-file`
 * settings namespace the host registers, so the card appears inside the
 * EXISTING 设置 → 插件 → 可配置 tab without adding a new navigation tab.
 *
 * Card chrome mirrors @wingsky-1/dsh-mcp-manager's settings card verbatim
 * (accordion `li` + head name/description/chevron + expandable body + save
 * footer), CSS prefixed `df-` so the two plugins' sheets never collide:
 *   li.df-set-card / df-set-head / df-set-chevron / df-set-body /
 *   df-set-row / df-set-input / df-set-hint / df-set-foot / df-set-save
 * Colors are the same DSH tokens (--dsw-alias-*) with light fallbacks.
 */
import { useEffect, useState } from 'react';

export interface FileManagerSettingValue {
  root?: string;
  openLinksInEditor?: boolean;
}

/** Client-side face of the bound `dsh-file` settings scope. */
export interface FileManagerSettingsScope {
  getSnapshot(): {
    status: 'loading' | 'ready' | 'unavailable';
    value?: FileManagerSettingValue;
    base?: FileManagerSettingValue;
    user?: Partial<FileManagerSettingValue>;
    writable?: boolean;
  };
  subscribe(listener: () => void): () => void;
  set(field: keyof FileManagerSettingValue, value: unknown): Promise<void>;
  unset(field: keyof FileManagerSettingValue): Promise<void>;
}

/**
 * Card CSS — verbatim dsh-mcp-manager `.dm-set-*` rules, renamed `df-`.
 * Injected once as a <style> element (like dsh-mcp-manager does).
 */
export const SETTINGS_CARD_CSS = `
.df-set-card{list-style:none;margin:0;padding:0;border:1px solid var(--dsw-alias-border-l2,#e2e5ea);border-radius:12px;background:var(--dsw-alias-bg-layer-3,#fbfbfc);overflow:hidden;transition:border-color .16s,background .16s}
.df-set-card:hover{border-color:var(--dsw-alias-label-dimmed,#9ba1a6)}
.df-set-head{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;background:transparent;border:none;cursor:pointer;text-align:left;color:var(--dsw-alias-label-primary,#1f2329)}
.df-set-head:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.04))}
.df-set-headText{display:flex;flex-direction:column;gap:4px;flex:1;min-width:0}
.df-set-name{display:block;font-size:15px;font-weight:600;line-height:1.4;color:var(--dsw-alias-label-primary,#1f2329)}
.df-set-description{display:block;font-size:13px;line-height:1.5;color:var(--dsw-alias-label-tertiary,#8a919c)}
.df-set-chevron{flex:none;color:var(--dsw-alias-label-tertiary,#5f6672);transition:transform .16s ease}
.df-set-chevronOpen{transform:rotate(180deg)}
.df-set-body{padding:4px 14px 14px;border-top:1px solid var(--dsw-alias-border-l1,#e2e5ea);display:flex;flex-direction:column;gap:9px}
.df-set-row{display:flex;align-items:center;gap:12px;margin:0;flex-wrap:wrap}
.df-set-row>label{font-size:12.5px;color:var(--dsw-alias-label-secondary,#5f6672);font-weight:600;white-space:nowrap}
.df-set-check{align-items:center;gap:8px}
.df-set-row input[type=checkbox]{width:auto;height:16px;accent-color:var(--dsw-alias-brand-primary,#4f6ef7);cursor:pointer}
.df-set-input{min-width:88px;flex:0 1 460px;padding:5px 8px;border:1px solid var(--dsw-alias-border-l1,#e2e5ea);border-radius:6px;font-size:12.5px;color:var(--dsw-alias-label-primary,#1f2329);background:var(--dsw-alias-bg-layer-1,#fff);box-sizing:border-box}
.df-set-input:focus{outline:none;border-color:var(--dsw-alias-state-info-primary,#3b82f6)}
.df-set-badge{font-size:10px;padding:1px 7px;border-radius:99px;background:var(--dsw-alias-bg-layer-2,#f1f2f5);color:var(--dsw-alias-label-secondary,#525866);border:1px solid var(--dsw-alias-border-l2,#e2e4ea)}
.df-set-reset{font:inherit;font-size:11px;color:var(--dsw-alias-label-tertiary,#8a919c);cursor:pointer;background:none;border:none;padding:0;text-decoration:underline}
.df-set-hint{margin-top:0;font-size:11px;color:var(--dsw-alias-label-tertiary,#8a919c);line-height:1.5}
.df-set-foot{display:flex;align-items:center;justify-content:flex-end;gap:10px;margin-top:10px}
.df-set-foot .df-set-saved{font-size:12px;color:var(--dsw-alias-state-success-primary,#16a34a)}
.df-set-foot .df-set-error{font-size:12px;color:var(--dsw-alias-state-danger-primary,#dc2626)}
.df-set-save{border:1px solid var(--dsw-alias-border-l1,#e2e5ea);background:var(--dsw-alias-bg-base,#fff);color:var(--dsw-alias-label-primary,#3a3f4b);border-radius:6px;padding:5px 14px;font-size:12px;cursor:pointer}
.df-set-save:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06))}
.df-set-save:disabled{opacity:.5;cursor:not-allowed}
`;

/** Inject the card stylesheet once (mirrors dsh-mcp-manager's style injection). */
export function injectSettingsCardStyle(): void {
  if (typeof document === 'undefined') return;
  if (document.querySelector('style[data-dsh-file-settings-style]') !== null) return;
  const style = document.createElement('style');
  style.dataset.dshFileSettingsStyle = '';
  style.textContent = SETTINGS_CARD_CSS;
  document.head.appendChild(style);
}

const rootDefaultOf = (v: unknown): string => (typeof v === 'string' ? v : '');

const FIELDS: Array<{ key: keyof FileManagerSettingValue; type: 'text' | 'bool' }> = [
  { key: 'root', type: 'text' },
  { key: 'openLinksInEditor', type: 'bool' },
];

export function FileManagerSettingsCard(props: {
  scope?: FileManagerSettingsScope;
  t?: (key: string) => string;
}): JSX.Element {
  const { scope, t } = props;
  const [snap, setSnap] = useState(() => scope?.getSnapshot());
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [edits, setEdits] = useState<Partial<FileManagerSettingValue>>({});

  useEffect(() => {
    if (!scope) return;
    return scope.subscribe(() => setSnap(scope.getSnapshot()));
  }, [scope]);

  const text = (key: string, fallback: string): string => {
    const v = t ? t(key) : '';
    return v === '' || v === key ? fallback : v;
  };

  const ready = scope !== undefined && snap !== undefined && snap.status === 'ready';
  const value = ready ? (snap?.value ?? {}) : {};
  const base = ready && snap?.base ? snap.base : {};
  const user = ready ? (snap?.user ?? {}) : {};
  const writable = ready && !!snap?.writable;

  // Edited (or current) value of a field, for the inputs.
  const cur = (key: keyof FileManagerSettingValue, type: 'text' | 'bool'): string | boolean => {
    if (key in edits) return edits[key] as string | boolean;
    const v = value[key];
    if (type === 'bool') return v === true;
    return rootDefaultOf(v);
  };

  const stage = (key: keyof FileManagerSettingValue, val: string | boolean): void => {
    setEdits((e) => ({ ...e, [key]: val }));
    setMsg(null);
  };

  // Save the edited fields against the BASE layer: equal → unset (re-inherit
  // the composition layer), different → set. Saving is hot: the host watches
  // the namespace and re-applies, so no restart is needed.
  const save = async (): Promise<void> => {
    if (!scope) return;
    setSaving(true);
    setMsg(null);
    try {
      for (const f of FIELDS) {
        if (!(f.key in edits)) continue;
        const edited = edits[f.key] as string | boolean;
        const baseV = base[f.key];
        if (f.type === 'bool') {
          if (edited === (baseV === true)) {
            if (user[f.key] !== undefined) await scope.unset(f.key);
          } else {
            await scope.set(f.key, edited);
          }
        } else {
          const s = rootDefaultOf(edited).trim();
          if (s === '' || s === rootDefaultOf(baseV).trim()) {
            if (user[f.key] !== undefined) await scope.unset(f.key);
          } else {
            await scope.set(f.key, s);
          }
        }
      }
      setEdits({});
      setMsg({ ok: true, text: text('settings.saved', '已保存——立即生效（无需重启）') });
      setTimeout(() => setMsg(null), 2400);
    } catch (error) {
      setMsg({
        ok: false,
        text: `${text('settings.failed', '保存失败')}：${error instanceof Error ? error.message : String(error)}`,
      });
    }
    setSaving(false);
  };

  return (
    <li className="df-set-card">
      <button
        type="button"
        className="df-set-head"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="df-set-headText">
          <span className="df-set-name">{text('settings.name', '文件管理器（dsh-file）')}</span>
          <span className="df-set-description">
            {text('settings.desc', '工作区根目录 / 会话文件链接用编辑器打开')}
          </span>
        </span>
        <svg
          className={'df-set-chevron' + (open ? ' df-set-chevronOpen' : '')}
          width={14}
          height={14}
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M11.8486 5.5L11.4238 5.92383L8.69727 8.65137C8.44157 8.90706 8.21562 9.13382 8.01172 9.29785C7.79912 9.46883 7.55595 9.61756 7.25 9.66602C7.08435 9.69222 6.91565 9.69222 6.75 9.66602C6.44405 9.61756 6.20088 9.46883 5.98828 9.29785C5.78438 9.13382 5.55843 8.90706 5.30273 8.65137L2.57617 5.92383L2.15137 5.5L3 4.65137L3.42383 5.07617L6.15137 7.80273C6.42595 8.07732 6.59876 8.24849 6.74023 8.3623C6.87291 8.46904 6.92272 8.47813 6.9375 8.48047C6.97895 8.48703 7.02105 8.48703 7.0625 8.48047C7.07728 8.47813 7.12709 8.46904 7.25977 8.3623C7.40124 8.24849 7.57405 8.07732 7.84863 7.80273L10.5762 5.07617L11 4.65137L11.8486 5.5Z"
            fill="currentColor"
          />
        </svg>
      </button>
      {open ? (
        <div className="df-set-body">
          {ready && !writable ? (
            <p className="df-set-hint" style={{ color: 'var(--dsw-alias-state-warn-primary,#b45309)' }}>
              {text('settings.readOnly', '当前设置只读（未挂载可写设置存储）。')}
            </p>
          ) : null}
          {ready ? (
            <>
              <div className="df-set-row" style={{ alignItems: 'center' }}>
                <label htmlFor="dsh-file-root">{text('settings.root', '工作区根目录（兜底）')}</label>
                {user.root !== undefined ? <span className="df-set-badge">{text('settings.overridden', '已覆盖')}</span> : null}
                {user.root !== undefined ? (
                  <button type="button" className="df-set-reset" onClick={() => stage('root', typeof base.root === 'string' ? base.root : '')}>
                    {text('settings.reset', '重置')}
                  </button>
                ) : null}
                <input
                  id="dsh-file-root"
                  type="text"
                  className="df-set-input"
                  value={cur('root', 'text') as string}
                  disabled={!writable || saving}
                  onChange={(e) => stage('root', e.target.value)}
                  placeholder={rootDefaultOf(base.root)}
                />
              </div>
              <div className="df-set-row df-set-check">
                <label htmlFor="dsh-file-openLinks">{text('settings.openLinks', '会话文件链接用编辑器打开')}</label>
                {user.openLinksInEditor !== undefined ? <span className="df-set-badge">{text('settings.overridden', '已覆盖')}</span> : null}
                <input
                  id="dsh-file-openLinks"
                  type="checkbox"
                  checked={cur('openLinksInEditor', 'bool') as boolean}
                  disabled={!writable || saving}
                  onChange={(e) => stage('openLinksInEditor', e.target.checked)}
                />
              </div>
              <p className="df-set-hint">
                {text('settings.hint', '保存即热生效：宿主监听 dsh-file 设置即时应用（无需重启）；文件管理器打开文件时会自动钉到当前会话工作区，覆盖此处兜底根目录。')}
              </p>
              <div className="df-set-foot">
                {msg !== null ? (
                  <span className={msg.ok ? 'df-set-saved' : 'df-set-error'}>{msg.text}</span>
                ) : null}
                <button
                  type="button"
                  className="df-set-save"
                  disabled={!writable || saving || Object.keys(edits).length === 0}
                  onClick={() => {
                    void save();
                  }}
                >
                  {saving ? text('settings.saving', '保存中…') : text('settings.save', '保存')}
                </button>
              </div>
            </>
          ) : (
            <p className="df-set-hint">
              {text('settings.unavailable', '设置服务暂不可用——展示说明，待可用后再编辑。')}
            </p>
          )}
        </div>
      ) : null}
    </li>
  );
}
