import { clientIp, endpoint, sendJson } from '../../http.js';
import { clearSessionCookie, readSession } from '../../session.js';
import { recordAuthEvent } from '../../audit.js';

export default endpoint({ methods: ['POST'], csrf: true }, async (req, res) => {
  // Best effort: identify the user for the audit row, but logging out must
  // succeed even with an expired or missing session.
  const claims = await readSession(req);
  clearSessionCookie(req, res);
  await recordAuthEvent('logout', { userId: claims?.userId ?? null, ip: clientIp(req) });
  sendJson(res, 200, { ok: true, redirect: '/' });
});
