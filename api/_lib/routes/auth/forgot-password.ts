import { ApiError, clientIp, endpoint, parseJsonBody, sendJson } from '../../http.js';
import { forgotPasswordSchema, parseInput } from '../../validation.js';
import { findUserByEmail } from '../../db.js';
import { issueToken } from '../../auth-tokens.js';
import { sendPasswordResetEmail } from '../../email.js';
import { enforceRateLimit } from '../../ratelimit.js';
import { recordAuthEvent } from '../../audit.js';

export default endpoint({ methods: ['POST'], csrf: true }, async (req, res) => {
  const ip = clientIp(req);
  const data = parseInput(forgotPasswordSchema, parseJsonBody(req));

  await enforceRateLimit({ name: 'forgot-ip', identifier: ip, limit: 10, windowSeconds: 3600 });
  await enforceRateLimit({
    name: 'forgot-email',
    identifier: data.email,
    limit: 3,
    windowSeconds: 3600,
  });

  const user = await findUserByEmail(data.email);

  // Same response either way: whether an address has an account is not
  // something an unauthenticated caller gets to learn.
  if (user) {
    const token = await issueToken(user.id, 'reset');
    // A rejected send has to break the silence: someone locked out of their
    // account waiting on a link that was never posted is worse than a 503.
    const sent = await sendPasswordResetEmail(user.email, token);
    if (!sent) {
      throw new ApiError(
        503,
        'email_send_failed',
        'We could not send the email just now. Try again in a moment.',
      );
    }
    await recordAuthEvent('password_reset_requested', { userId: user.id, ip });
  } else {
    await recordAuthEvent('password_reset_unknown_email', { ip });
  }

  sendJson(res, 200, {
    ok: true,
    message: 'If that email has an account, we sent a link to reset the password.',
  });
});
