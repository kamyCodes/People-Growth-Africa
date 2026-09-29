/**
 * api/ is deployed as native ES modules: Vercel compiles each .ts file to a .js
 * file beside its neighbours and lets Node resolve the specifiers at runtime,
 * which is why every relative import in api/ carries a .js extension. Those .js
 * files do not exist in the repository, so this hook points a `./http.js`
 * specifier at the ./http.ts source instead.
 *
 * Only explicit .js specifiers are rewritten. A leftover extensionless import
 * fails here exactly as it fails in production, rather than passing locally and
 * breaking on deploy.
 *
 * This file is the fallback for Node releases without registerHooks; on newer
 * Node the same rule runs inline in scripts/api-server.mjs. Nothing in api/ or
 * the deployed build depends on either.
 */
export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') && specifier.endsWith('.js')) {
    try {
      return await nextResolve(`${specifier.slice(0, -3)}.ts`, context);
    } catch {
      // Fall through to the normal resolution, which may still succeed.
    }
  }
  return nextResolve(specifier, context);
}
