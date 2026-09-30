import { ApiError, clientIp, endpoint, parseJsonBody, sendJson } from '../../http.js';
import { emptyBodySchema, parseInput } from '../../validation.js';
import { requireSession } from '../../current-user.js';
import { issueToken } from '../../auth-tokens.js';
import { sendVerificationEmail } from '../../email.js';
import { enforceRateLimit } from '../../ratelimit.js';
import { recordAuthEvent } from '../../audit.js';

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
  // A rejected send must not be reported as a link in the post, or the person
  // waits on an email that is never coming.
  const sent = await sendVerificationEmail(user.email, token);
  if (!sent) {
    throw new ApiError(
      503,
      'email_send_failed',
      'We could not send the email just now. Try again in a moment.',
    );
  }
  await recordAuthEvent('verification_resent', { userId: user.id, ip });

  sendJson(res, 200, {
    ok: true,
    message: 'We sent a new confirmation link. It works once and expires in 24 hours.',
  });
});
