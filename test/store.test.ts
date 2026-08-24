import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  openTab,
  getTabs,
  getActivePath,
  updateActiveContent,
  markSaved,
  resetAll,
  setWorkspaceRoot,
  type OpenTab,
} from '../src/client/store.ts';

/**
 * These cover the "editor state survives switching the '文件' view ↔ '对话'
 * view, but is dropped on a real workspace switch" contract. The sidebar panel
 * used to call `resetAll()` on its own unmount — and since the panel unmounts
 * whenever the "文件" view loses focus, toggling views silently wiped every
 * open tab and unsaved edit (issue #1). State is now reset only when the
 * workspace root actually changes.
 */

function tab(path: string, content = 'hello'): OpenTab {
  return { path, content, savedContent: content, mtimeMs: 1, dirty: false };
}

test('setWorkspaceRoot: 同一工作区（视图切换）不清空已打开的标签和未保存内容', () => {
  resetAll();
  setWorkspaceRoot('/ws');

  openTab(tab('/ws/README.md'));
  updateActiveContent('hello **edited**'); // 未保存的编辑

  // 切到"对话"再切回"文件"：面板重新挂载后会再次上报同一工作区根。
  setWorkspaceRoot('/ws');

  assert.equal(getTabs().length, 1);
  assert.equal(getActivePath(), '/ws/README.md');
  assert.equal(getTabs()[0].content, 'hello **edited**');
  assert.equal(getTabs()[0].dirty, true);
});

test('setWorkspaceRoot: 真正切换工作区时清空旧工作区的标签', () => {
  resetAll();
  setWorkspaceRoot('/ws-a');

  openTab(tab('/ws-a/a.ts'));
  updateActiveContent('changed');

  setWorkspaceRoot('/ws-b');

  assert.equal(getTabs().length, 0);
  assert.equal(getActivePath(), null);
});

test('markSaved 在保存后清除 dirty 标记', () => {
  resetAll();
  setWorkspaceRoot('/ws');

  openTab(tab('/ws/x.ts'));
  updateActiveContent('v2');
  assert.equal(getTabs()[0].dirty, true);

  markSaved('/ws/x.ts');
  assert.equal(getTabs()[0].dirty, false);
  assert.equal(getTabs()[0].savedContent, 'v2');
});
