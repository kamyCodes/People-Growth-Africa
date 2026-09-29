/**
 * Node resolves `./http` to ./http.js, and Vercel bundles api/ with a resolver
 * that also tries ./http.ts. This hook teaches a plain Node process the same
 * rule, so the auth endpoints can be exercised locally without adding file
 * extensions to the imports in api/ just to satisfy the test runner.
 *
 * This file is the fallback for Node releases without registerHooks; on newer
 * Node the same rule runs inline in scripts/api-server.mjs. Nothing in api/ or
 * the deployed build depends on either.
 */
export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') && !/\.[cm]?[jt]s$/i.test(specifier)) {
    try {
      return await nextResolve(`${specifier}.ts`, context);
    } catch {
      // Fall through to the normal resolution, which may still succeed.
    }
  }
  return nextResolve(specifier, context);
}
