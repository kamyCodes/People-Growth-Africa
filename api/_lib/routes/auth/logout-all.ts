import { clientIp, endpoint, sendJson } from '../../http.js';
import { bumpTokenVersion } from '../../db.js';
import { requireSession } from '../../current-user.js';
import { clearSessionCookie } from '../../session.js';
import { recordAuthEvent } from '../../audit.js';

/**
 * Ends every session for the account, on every device, by raising the user's
 * token_version. The cookie is cleared here too, so this browser signs out
 * along with the rest.
 */
export default endpoint({ methods: ['POST'], csrf: true }, async (req, res) => {
  const user = await requireSession(req, res);

  await bumpTokenVersion(user.id);
  clearSessionCookie(req, res);
  await recordAuthEvent('logout_all', { userId: user.id, ip: clientIp(req) });

  sendJson(res, 200, { ok: true, redirect: '/auth#login' });
});
