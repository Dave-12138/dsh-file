import { test } from 'node:test';
import assert from 'node:assert/strict';
import { patchOpenWorkspacePath, patchOpenPath, patchOpenLinks, type SessionNamespace, type WorkspacesService, type OpenLinkSeam } from '../src/client/openLinks.ts';

function makeSession(): { s: SessionNamespace & Record<string, unknown>; calls: string[] } {
  const calls: string[] = [];
  // Mimic RemoteNamespaceService.install: the method is a configurable accessor.
  const native = async (request: { path: string }, _signal?: AbortSignal) => {
    calls.push(request.path);
    return { ok: true, value: { opened: true } } as const;
  };
  const s: SessionNamespace & Record<string, unknown> = {} as SessionNamespace & Record<string, unknown>;
  Object.defineProperty(s, 'openWorkspacePath', {
    configurable: true,
    enumerable: true,
    get() {
      return native;
    },
  });
  return { s, calls };
}

function makeWorkspaces(): { w: WorkspacesService & Record<string, unknown>; calls: string[] } {
  const calls: string[] = [];
  const w: WorkspacesService & Record<string, unknown> = {
    openPath: async (path: string): Promise<unknown> => {
      calls.push(path);
    },
  };
  return { w, calls };
}

test('patchOpenWorkspacePath: handled path routes to the editor, native opener skipped', async () => {
  const { s, calls } = makeSession();
  const dispose = patchOpenWorkspacePath(s, { tryOpen: async () => true });
  const result = await (s.openWorkspacePath as any)({ path: '/ws/a.ts' });
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, { opened: true });
  assert.deepEqual(calls, []);
  dispose();
});

test('patchOpenWorkspacePath: declined path falls back to the native opener', async () => {
  const { s, calls } = makeSession();
  const dispose = patchOpenWorkspacePath(s, { tryOpen: async () => false });
  await (s.openWorkspacePath as any)({ path: '/ws/b.ts' });
  assert.deepEqual(calls, ['/ws/b.ts']);
  dispose();
});

test('patchOpenWorkspacePath: a throwing tryOpen never swallows the open gesture', async () => {
  const { s, calls } = makeSession();
  const dispose = patchOpenWorkspacePath(s, {
    tryOpen: async (): Promise<boolean> => {
      throw new Error('boom');
    },
  });
  await (s.openWorkspacePath as any)({ path: '/ws/c.ts' });
  assert.deepEqual(calls, ['/ws/c.ts']);
  dispose();
});

test('patchOpenWorkspacePath: disposing restores the original behavior', async () => {
  const { s, calls } = makeSession();
  const dispose = patchOpenWorkspacePath(s, { tryOpen: async () => true });
  await (s.openWorkspacePath as any)({ path: '/ws/editor.ts' });
  assert.deepEqual(calls, []);
  dispose();
  await (s.openWorkspacePath as any)({ path: '/ws/d.ts' });
  assert.deepEqual(calls, ['/ws/d.ts']);
});

test('patchOpenWorkspacePath: no-op disposer when the namespace is unavailable', () => {
  const dispose = patchOpenWorkspacePath(undefined, { tryOpen: async () => true });
  assert.equal(typeof dispose, 'function');
  dispose();
});

test('patchOpenWorkspacePath: no-op disposer when openWorkspacePath is missing', () => {
  const s = {} as SessionNamespace;
  const dispose = patchOpenWorkspacePath(s, { tryOpen: async () => true });
  assert.equal(typeof dispose, 'function');
  dispose();
});

test('patchOpenPath: handled path routes to the editor, native opener skipped', async () => {
  const { w, calls } = makeWorkspaces();
  const dispose = patchOpenPath(w, { tryOpen: async () => true });
  await w.openPath('/ws/a.ts');
  assert.deepEqual(calls, []);
  dispose();
});

test('patchOpenPath: declined path falls back to the native opener', async () => {
  const { w, calls } = makeWorkspaces();
  const dispose = patchOpenPath(w, { tryOpen: async () => false });
  await w.openPath('/ws/b.ts');
  assert.deepEqual(calls, ['/ws/b.ts']);
  dispose();
});

test('patchOpenPath: disposing restores the original method', async () => {
  const { w, calls } = makeWorkspaces();
  const dispose = patchOpenPath(w, { tryOpen: async () => true });
  await w.openPath('/ws/editor.ts');
  assert.deepEqual(calls, []);
  dispose();
  await w.openPath('/ws/d.ts');
  assert.deepEqual(calls, ['/ws/d.ts']);
});

test('patchOpenPath: no-op disposer when workspaces is unavailable', () => {
  const dispose = patchOpenPath(undefined, { tryOpen: async () => true });
  assert.equal(typeof dispose, 'function');
  dispose();
});

test('patchOpenLinks: prefers the session seam when both are present', async () => {
  const { s, calls: sessionCalls } = makeSession();
  const { w, calls: wsCalls } = makeWorkspaces();
  const dispose = patchOpenLinks({ session: s, workspaces: w }, { tryOpen: async () => true });
  await (s.openWorkspacePath as any)({ path: '/ws/p.ts' });
  assert.deepEqual(sessionCalls, []); // session seam patched — editor handled it
  await w.openPath('/ws/q.ts');
  assert.deepEqual(wsCalls, ['/ws/q.ts']); // workspaces untouched — stays native
  dispose();
});

test('patchOpenLinks: falls back to the workspaces seam when session is absent', async () => {
  const { w, calls } = makeWorkspaces();
  const dispose = patchOpenLinks({ session: undefined, workspaces: w }, { tryOpen: async () => true });
  await w.openPath('/ws/a.ts');
  assert.deepEqual(calls, []); // workspaces seam patched — editor handled it
  dispose();
});

test('patchOpenLinks: no-op disposer when neither seam is present', () => {
  const dispose = patchOpenLinks({ session: undefined, workspaces: undefined }, { tryOpen: async () => true });
  assert.equal(typeof dispose, 'function');
  dispose();
});