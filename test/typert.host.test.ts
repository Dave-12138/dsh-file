import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TYPERT } from '../src/typert.host.ts';

/**
 * Structural checks mirroring dsh-typert-loader's `validateTypertManifest` /
 * `requireInvocation` / `requireStrictCodec` (issue #2). The manifest is what
 * makes the `fileManager/*` endpoints resolvable even when the plugin runs
 * against a different `@deepseek-ai/dsh-typert-protocol` instance (tsx/source
 * mode), so a malformed manifest must fail loudly at build time.
 */

test('TYPERT 声明归属与 host 面', () => {
  assert.equal(TYPERT.package, '@rose43/dsh-file');
  assert.equal(TYPERT.face, 'host');
  assert.ok(Array.isArray(TYPERT.schemas));
  assert.ok(Array.isArray(TYPERT.model.services));
  assert.ok(Array.isArray(TYPERT.model.events));
  assert.ok(Array.isArray(TYPERT.model.objects));
});

function assertStrictCodec(codec: unknown, where: string): void {
  assert.ok(codec !== null && typeof codec === 'object', `${where} codec 必须是对象`);
  const c = codec as { mode: string; typeSymbol: string; schema: { _zod: unknown; parse: unknown } };
  assert.equal(c.mode, 'strict', `${where} codec.mode 必须是 strict`);
  assert.ok(typeof c.typeSymbol === 'string' && c.typeSymbol.length > 0, `${where} codec.typeSymbol 非空`);
  assert.ok('_zod' in c.schema, `${where} codec.schema 需要 _zod 标记`);
  assert.equal(typeof c.schema.parse, 'function', `${where} codec.schema.parse 必须是函数`);
}

test('invocations 覆盖全部 13 个端点，且每个结构合法', () => {
  const methods = [
    'readDataUrl', 'listDir', 'readText', 'writeText', 'createFile',
    'createDirectory', 'rename', 'delete', 'stat', 'resolve', 'getRoot', 'setRoot', 'getConfig',
  ];
  assert.equal(TYPERT.invocations.length, methods.length);

  for (const inv of TYPERT.invocations) {
    assert.ok(inv.id.startsWith('@rose43/dsh-file#fileManager/'), `${inv.id} id 前缀`);
    assert.equal(inv.service, 'fileManager');
    assert.equal(inv.namespace, 'fileManager');
    assert.ok(typeof inv.method === 'string' && inv.method.length > 0);
    assert.deepEqual(inv.invocation, { kind: 'direct' });
    assert.ok(Array.isArray(inv.parameters));
    const wires: string[] = [];
    for (const p of inv.parameters) {
      assert.ok(typeof p.name === 'string' && p.name.length > 0);
      assert.ok(typeof p.wire === 'string' && p.wire.length > 0);
      assert.equal(p.source, 'json');
      assert.equal(p.name, p.wire, 'SRC 契约：参数名 = wire 字段名');
      assert.ok(!wires.includes(p.wire), `wire 字段重复: ${p.wire}`);
      wires.push(p.wire);
      assertStrictCodec(p.codec, `${inv.method}(${p.name})`);
    }
    assertStrictCodec(inv.result, `${inv.method} result`);
  }
});

test('端点的参数集与网关方法签名一致', () => {
  const byId = Object.fromEntries(
    TYPERT.invocations.map((inv) => [`${inv.method}`, inv.parameters.map((p) => p.name)]),
  );
  assert.deepEqual(byId['getRoot'], []);
  assert.deepEqual(byId['getConfig'], []);
  assert.deepEqual(byId['writeText'], ['path', 'content']);
  assert.deepEqual(byId['rename'], ['from', 'to']);
  assert.deepEqual(byId['readText'], ['path']);
  assert.deepEqual(byId['listDir'], ['path']);
  assert.deepEqual(byId['setRoot'], ['path']);
});
