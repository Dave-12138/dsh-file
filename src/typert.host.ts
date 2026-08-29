/**
 * Strict Typert HOST invocation descriptor for the `fileManager` service.
 *
 * WHY THIS EXISTS (issue #2):
 * When dsh is run from a source checkout via tsx, the repo's `tsconfig.base.json`
 * `paths` maps `@deepseek-ai/dsh-typert-protocol` to the in-repo *src* instance,
 * while this plugin lives OUTSIDE the repo and resolves the compiled *lib*
 * instance. The `@Remote` decorators store their markers in a module-private
 * WeakMap, so the gateway's SRC-mode discovery (`remoteMethods()`) reads the
 * *src* WeakMap and finds nothing — `fileManager/*` endpoints are never claimed
 * and the browser gets an RPC 404.
 *
 * A strict descriptor is registered by dsh-typert-loader as PLAIN DATA
 * (`ctx.typert.register`), which is instance-independent, so the endpoints are
 * resolvable no matter which protocol instance the gateway landed on. The
 * api-gateway checks the strict table FIRST (`ctx.typert.local.get(endpoint)`)
 * and only falls back to SRC mode when no strict definition exists. This mirrors
 * the `./typert` export that the official `@deepseek-ai/*` packages ship.
 *
 * Codecs are intentionally permissive (no payload validation — the client face
 * already uses a passthrough schema, and dsh-file's RPC payloads are plain JSON).
 * dsh-typert-loader's `requireStrictCodec` only requires a schema carrying a
 * `_zod` marker and a `parse` function, which the passthrough below satisfies.
 */

/** Accept any JSON-safe value unchanged (no schema validation). */
const passthroughSchema = { _zod: true, parse: (value: unknown) => value };

interface StrictCodec {
  mode: 'strict';
  typeSymbol: string;
  schema: unknown;
}

/** One strict codec backed by the permissive passthrough schema. */
function codec(typeSymbol: string): StrictCodec {
  return { mode: 'strict', typeSymbol, schema: passthroughSchema };
}

interface Invocation {
  id: string;
  service: string;
  namespace: string;
  method: string;
  invocation: { kind: 'direct' };
  parameters: Array<{ name: string; wire: string; source: 'json'; codec: StrictCodec }>;
  result: StrictCodec;
}

/**
 * Build one direct invocation whose flat JSON parameters are exactly the wire
 * fields the client sends (the SRC-descriptor contract: parameter names equal
 * wire field names). `implementation` is omitted so it defaults to `method`,
 * which is the gateway method name (`Reflect.get` on the service).
 */
function build(method: string, params: string[]): Invocation {
  return {
    id: `@rose43/dsh-file#fileManager/${method}`,
    service: 'fileManager',
    namespace: 'fileManager',
    method,
    invocation: { kind: 'direct' },
    parameters: params.map((wire) => ({ name: wire, wire, source: 'json', codec: codec('json') })),
    result: codec('json'),
  };
}

export const TYPERT = {
  package: '@rose43/dsh-file',
  face: 'host' as const,
  schemas: [],
  invocations: [
    build('readDataUrl', ['path']),
    build('listDir', ['path']),
    build('readText', ['path']),
    build('writeText', ['path', 'content']),
    build('createFile', ['path']),
    build('createDirectory', ['path']),
    build('rename', ['from', 'to']),
    build('delete', ['path']),
    build('stat', ['path']),
    build('resolve', ['path']),
    build('getRoot', []),
    build('getConfig', []),
    build('setRoot', ['path']),
  ],
  model: { services: [], events: [], objects: [] },
};
