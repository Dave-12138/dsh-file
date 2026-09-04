/**
 * Guards the editor view's conversation-composer-overlay marker.
 *
 * The "文件" editor renders inside the conversation center column
 * (`conversation.view`). The conversation UI hides its two [data-width-handle]
 * resizers while such a view occupies the column — its stylesheet contains
 * `.wSkVaW_root:has([data-conversation-composer-overlay]) .wSkVaW_widthHandle {
 * display: none }` (the same marker dsh-client-ui-conversation's own
 * 轨迹/trajectory view sets). FileEditorView has two render branches (idle
 * hint / open file) and BOTH must keep the marker on their root, or the
 * resizers float back over the editor. There is no DOM in these unit tests,
 * so this test guards the source directly against accidental regressions.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const MARKER = 'data-conversation-composer-overlay=""';
const ROOT_OPEN = '<div className="dshf-editor-view"';

const source = readFileSync(join(process.cwd(), 'src/client/FileEditorView.tsx'), 'utf8');

test('every FileEditorView root branch carries the conversation-composer-overlay marker', () => {
  const roots = source.split(ROOT_OPEN).length - 1;
  assert.ok(roots >= 2, 'expected at least the idle-hint and open-file root branches');
  const marked = source.split(ROOT_OPEN + ' ' + MARKER).length - 1;
  assert.equal(
    marked,
    roots,
    'every <div className="dshf-editor-view"> root must set ' + MARKER +
      ' (the DSH marker that hides the chat [data-width-handle] resizers over this view)',
  );
});
