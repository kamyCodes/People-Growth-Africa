import { clientIp, endpoint, sendJson } from '../_lib/http';
import { bumpTokenVersion } from '../_lib/db';
import { requireSession } from '../_lib/current-user';
import { clearSessionCookie } from '../_lib/session';
import { recordAuthEvent } from '../_lib/audit';

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
