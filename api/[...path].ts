import type { VercelRequest, VercelResponse } from '@vercel/node';

import { sendJson } from './_lib/http.js';
import { ROUTES } from './_lib/routes/index.js';

/**
 * The one serverless function this API deploys.
 *
 * The routes themselves live under api/_lib/routes/ and are looked up in the
 * table there, because Vercel counts every file in api/ that is not behind an
 * underscore as its own function and fails the deployment once a Hobby plan
 * passes twelve of them. This file is the only such file, so the count is one.
 *
 * `[...path]` is Vercel's catch-all segment: it matches /api/<anything>, which
 * is exactly the surface the routes used to occupy as individual files, so no
 * client or test had to change. A path with no entry in the table answers with
 * JSON 404 rather than falling through to the site's SPA rewrite, which is what
 * used to happen for a mistyped endpoint.
 */

/** `/api/auth/login?next=/` -> `/auth/login` */
function routePath(url: string | undefined): string {
  const path = (url ?? '/').split('?')[0] ?? '/';
  // The prefix is stripped only if the platform left it on, so this lookup is
  // the same whether req.url arrives as the request path or the rewritten one.
  const withoutPrefix = path.startsWith('/api') ? path.slice(4) : path;
  const trimmed = withoutPrefix.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

/**
 * Where the endpoint name lives for a given request.
 *
 * The site's SPA rewrite would otherwise swallow every /api request (it rewrites
 * to index.html, which exists, so it always wins), so vercel.json sends /api/* to
 * this function first. That rewrite arrives with the endpoint in the `path` query
 * parameter the platform generated from `:path*` - `/api/newsletter/subscribe`
 * becomes `path=newsletter/subscribe` - while `req.url` then reads
 * `/api/[...path]`, which is not an endpoint. A request that reaches the function
 * unprefixed still carries the endpoint in `req.url`, so both are tried.
 */
function routeKey(req: VercelRequest): string {
  const captured = req.query.path;
  const fromQuery = Array.isArray(captured)
    ? captured.join('/')
    : typeof captured === 'string'
      ? captured
      : '';

  if (fromQuery) return routePath(`/api/${fromQuery.replace(/^\/+/, '')}`);
  return routePath(req.url);
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const route = ROUTES[routeKey(req)];

  if (!route) {
    sendJson(res, 404, { error: 'No such endpoint.', code: 'not_found' });
    return;
  }

  await route(req, res);
}
