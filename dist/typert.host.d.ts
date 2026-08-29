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
interface StrictCodec {
    mode: 'strict';
    typeSymbol: string;
    schema: unknown;
}
interface Invocation {
    id: string;
    service: string;
    namespace: string;
    method: string;
    invocation: {
        kind: 'direct';
    };
    parameters: Array<{
        name: string;
        wire: string;
        source: 'json';
        codec: StrictCodec;
    }>;
    result: StrictCodec;
}
export declare const TYPERT: {
    package: string;
    face: "host";
    schemas: never[];
    invocations: Invocation[];
    model: {
        services: never[];
        events: never[];
        objects: never[];
    };
};
export {};
