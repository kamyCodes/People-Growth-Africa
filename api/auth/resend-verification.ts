import { clientIp, endpoint, parseJsonBody, sendJson } from '../_lib/http';
import { emptyBodySchema, parseInput } from '../_lib/validation';
import { requireSession } from '../_lib/current-user';
import { issueToken } from '../_lib/auth-tokens';
import { sendVerificationEmail } from '../_lib/email';
import { enforceRateLimit } from '../_lib/ratelimit';
import { recordAuthEvent } from '../_lib/audit';

/**
 * Sends a fresh confirmation link to the signed in user. Rate limited per
 * account and per address so it cannot be used to flood someone's inbox.
 */
export default endpoint({ methods: ['POST'], csrf: true }, async (req, res) => {
  const ip = clientIp(req);
  const user = await requireSession(req, res);
  parseInput(emptyBodySchema, parseJsonBody(req));

  await enforceRateLimit({ name: 'resend-ip', identifier: ip, limit: 10, windowSeconds: 3600 });
  await enforceRateLimit({
    name: 'resend-user',
    identifier: user.id,
    limit: 3,
    windowSeconds: 3600,
  });

  if (user.email_verified) {
    sendJson(res, 200, { ok: true, message: 'That email address is already confirmed.' });
    return;
  }

  const token = await issueToken(user.id, 'verify');
  await sendVerificationEmail(user.email, token);
  await recordAuthEvent('verification_resent', { userId: user.id, ip });

  sendJson(res, 200, {
    ok: true,
    message: 'We sent a new confirmation link. It works once and expires in 24 hours.',
  });
});
