/**
 * Optional behavior replacement for conversation file links (config `openLinksInEditor`,
 * default off) — implemented at the SERVICE layer, not by DOM interception.
 *
 * Every conversation file-open affordance — produced-files chips, inline code file
 * mentions, and tool-call file rows (Read / Edit / Write summaries) — converges on the
 * chat view's `openFile` leaf. That leaf's implementation changed across DSH releases,
 * so this module patches whichever seam the running DSH exposes:
 *
 *   - DSH >= 0.1.2-rc.1: `openFile` calls
 *     `ctx.remote.session.openWorkspacePath({ path: resolveWorkspacePath(cwd, path) })`
 *     — an RPC to the host SessionController's native opener. The `workspaces` client
 *     service lost its `openPath` in this release (only registry commands remain), and
 *     the `remote.session` namespace mounts methods as configurable accessors via
 *     `Object.defineProperty`, so the patch redefines that accessor.
 *   - DSH 0.1.1-rc.2 and earlier: `openFile` returned
 *     `workspaces.openPath(resolveWorkspacePath(cwd, path))` — a plain writable method
 *     on the `workspaces` client service, swapped directly by the patch.
 *
 * `patchOpenLinks` picks the present seam (session first, workspaces as fallback) so
 * the plugin keeps working across both releases. Nothing else is hookable: the host's
 * replaceable opener is wired inside the Session controller (not exposed to plugins),
 * and cordis forbids a third party from re-providing core services.
 *
 * When the flag is on, the patched method first offers the host-facing absolute path
 * (the chat resolved it before calling) to the plugin editor; if the editor cannot show
 * it (binary, oversized, outside the workspace, gateway unmounted), the wrapper
 * delegates to the original native opener. Disposing restores the original behaviour.
 */

/** Per-open handlers the patched method consults. */
export interface OpenPathHandlers {
  /** Try to open the host-facing path in the editor; true when handled. */
  tryOpen(path: string): Promise<boolean>;
}

/** One `remote.session.openWorkspacePath` invocation. */
export interface SessionOpenWorkspacePath {
  (request: { path: string }, signal?: AbortSignal): Promise<SessionOpenPathResult>;
}

/** Business result shape of the Session open RPC (the native opener's contract). */
export type SessionOpenPathResult =
  | { ok: true; value: { opened: true } }
  | { ok: false; error: unknown };

/** Minimal structural face of the `remote.session` namespace service. */
export interface SessionNamespace {
  openWorkspacePath: SessionOpenWorkspacePath;
}

/** Minimal structural face of the legacy `workspaces` client service. */
export interface WorkspacesService {
  openPath(path: string): Promise<unknown>;
}

/** Both seams a running DSH may expose; at most one is present per release. */
export interface OpenLinkSeam {
  session?: SessionNamespace | undefined;
  workspaces?: WorkspacesService | undefined;
}

/**
 * Replace `remote.session.openWorkspacePath` behaviour with the plugin's editor route.
 * Returns a disposer that restores the original behaviour. No-op when the namespace is
 * unavailable or the method is missing.
 *
 * The namespace method is mounted as a `configurable: true` getter (accessor), so the
 * patch redefines that accessor instead of assigning the property; the original getter
 * is kept for the fallback (native open) path. A plain writable method is handled via a
 * direct swap when present.
 */
export function patchOpenWorkspacePath(
  session: SessionNamespace | undefined,
  handlers: OpenPathHandlers,
): () => void {
  if (session === undefined || typeof session.openWorkspacePath !== 'function') return () => {};
  const descriptor = Object.getOwnPropertyDescriptor(session, 'openWorkspacePath');
  let active = true;
  if (descriptor !== undefined && typeof descriptor.get === 'function') {
    // Accessor-mounted namespace method: keep the original getter, redefine the accessor.
    const originalGet = descriptor.get;
    Object.defineProperty(session, 'openWorkspacePath', {
      configurable: true,
      enumerable: descriptor.enumerable !== false,
      get(this: unknown): SessionOpenWorkspacePath {
        const original = originalGet.call(this) as SessionOpenWorkspacePath;
        if (!active) return original;
        return async (request, signal) => {
          try {
            const handled = await handlers.tryOpen(request.path);
            if (!handled) return await original(request, signal);
            return { ok: true, value: { opened: true } }; // handled — native caller sees success
          } catch {
            return await original(request, signal); // a throwing handler never swallows the open gesture
          }
        };
      },
    });
    return () => {
      active = false;
    };
  }
  // Plain writable method (robustness fallback): swap and restore directly.
  const original = session.openWorkspacePath.bind(session) as SessionOpenWorkspacePath;
  session.openWorkspacePath = async (request, signal) => {
    if (!active) return original(request, signal);
    try {
      const handled = await handlers.tryOpen(request.path);
      if (!handled) return original(request, signal);
      return { ok: true, value: { opened: true } };
    } catch {
      return original(request, signal);
    }
  };
  return () => {
    active = false;
    session.openWorkspacePath = original;
  };
}

/**
 * Replace the legacy `workspaces.openPath` behaviour with the plugin's editor route
 * (DSH 0.1.1-rc.2 and earlier). Returns a disposer that restores the original method.
 * No-op when `workspaces` is unavailable.
 */
export function patchOpenPath(
  workspaces: WorkspacesService | undefined,
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

/**
 * Patch whichever file-open seam the running DSH exposes. Prefers
 * `remote.session.openWorkspacePath` (DSH >= 0.1.2-rc.1), falls back to
 * `workspaces.openPath` (DSH 0.1.1-rc.2 and earlier). No-op when neither is available.
 */
export function patchOpenLinks(
  seam: OpenLinkSeam,
  handlers: OpenPathHandlers,
): () => void {
  if (seam.session !== undefined && typeof (seam.session as SessionNamespace).openWorkspacePath === 'function') {
    return patchOpenWorkspacePath(seam.session, handlers);
  }
  if (seam.workspaces !== undefined && typeof seam.workspaces.openPath === 'function') {
    return patchOpenPath(seam.workspaces, handlers);
  }
  return () => {};
}