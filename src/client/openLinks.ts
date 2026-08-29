/**
 * Optional behavior replacement for conversation file links (config `openLinksInEditor`,
 * default off) — implemented at the SERVICE layer, not by DOM interception.
 *
 * DSH has no event or slot for "open a file path". Every conversation file-open affordance
 * — produced-files chips, inline code file mentions, and tool-call file rows (Read / Edit /
 * Write summaries) — converges on the SAME client service method
 * `workspaces.openPath(path)` (the leaf of the chat view's `openFile` injection). Nothing
 * else is hookable: the host's replaceable opener (`createApiProxy`'s `defaults.openPath`)
 * is not exposed to plugins, and cordis forbids a third party from re-providing core
 * services. So the bus-level seam a plugin can actually reach is `workspaces.openPath`
 * itself: swapping it replaces the open behavior for EVERY conversation file link at once,
 * with zero dependence on DOM shape (tool-row links carry no title/aria-label and put the
 * path in their text) and zero click-ordering fragility.
 *
 * When the flag is on, this module swaps `workspaces.openPath` for a wrapper that first
 * offers the host-facing absolute path (the caller resolved it before calling) to the
 * plugin editor; if the editor cannot show it (binary, oversized, outside the workspace,
 * gateway unmounted), the wrapper delegates to the original native opener. Disposing
 * restores the original method.
 */

/** Per-open handlers the patched method consults. */
export interface OpenPathHandlers {
  /** Try to open the host-facing path in the editor; true when handled. */
  tryOpen(path: string): Promise<boolean>;
}

/**
 * Replace `workspaces.openPath` behavior with the plugin's editor route. Returns a disposer
 * that restores the original method. No-op when `workspaces` is unavailable.
 */
export function patchOpenPath(
  workspaces: { openPath(path: string): Promise<unknown> } | undefined,
  handlers: OpenPathHandlers,
): () => void {
  if (workspaces === undefined || typeof workspaces.openPath !== 'function') return () => {};
  const original = workspaces.openPath.bind(workspaces) as (path: string) => Promise<unknown>;
  let active = true;
  workspaces.openPath = async (path: string): Promise<unknown> => {
    if (!active) return original(path);
    try {
      const handled = await handlers.tryOpen(path);
      if (!handled) return original(path);
      return; // handled by the editor — the native caller expects void success
    } catch {
      return original(path); // a throwing handler never swallows the open gesture
    }
  };
  return () => {
    active = false;
    workspaces.openPath = original;
  };
}
