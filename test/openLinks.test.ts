import { test } from 'node:test';
import assert from 'node:assert/strict';
import { patchOpenPath } from '../src/client/openLinks.ts';

function makeWorkspaces(): { w: { openPath(path: string): Promise<unknown> }; calls: string[] } {
  const calls: string[] = [];
  const w = {
    openPath: async (path: string): Promise<unknown> => {
      calls.push(path);
    },
  };
  return { w, calls };
}

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

test('patchOpenPath: a throwing tryOpen never swallows the open gesture', async () => {
  const { w, calls } = makeWorkspaces();
  const dispose = patchOpenPath(w, {
    tryOpen: async (): Promise<boolean> => {
      throw new Error('boom');
    },
  });
  await w.openPath('/ws/c.ts');
  assert.deepEqual(calls, ['/ws/c.ts']);
  dispose();
});

test('patchOpenPath: disposing restores the original method', async () => {
  const { w, calls } = makeWorkspaces();
  const dispose = patchOpenPath(w, { tryOpen: async () => true });
  dispose();
  await w.openPath('/ws/d.ts');
  assert.deepEqual(calls, ['/ws/d.ts']);
});

test('patchOpenPath: no-op disposer when workspaces is unavailable', () => {
  const dispose = patchOpenPath(undefined, { tryOpen: async () => true });
  assert.equal(typeof dispose, 'function');
  dispose();
});

test('patchOpenPath: no-op disposer when openPath is missing', () => {
  const w = {} as { openPath(path: string): Promise<unknown> };
  const dispose = patchOpenPath(w, { tryOpen: async () => true });
  assert.equal(typeof dispose, 'function');
  dispose();
});
