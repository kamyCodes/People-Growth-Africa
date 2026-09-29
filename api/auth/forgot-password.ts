import { clientIp, endpoint, parseJsonBody, sendJson } from '../_lib/http';
import { forgotPasswordSchema, parseInput } from '../_lib/validation';
import { findUserByEmail } from '../_lib/db';
import { issueToken } from '../_lib/auth-tokens';
import { sendPasswordResetEmail } from '../_lib/email';
import { enforceRateLimit } from '../_lib/ratelimit';
import { recordAuthEvent } from '../_lib/audit';

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
    await sendPasswordResetEmail(user.email, token);
    await recordAuthEvent('password_reset_requested', { userId: user.id, ip });
  } else {
    await recordAuthEvent('password_reset_unknown_email', { ip });
  }

  sendJson(res, 200, {
    ok: true,
    message: 'If that email has an account, we sent a link to reset the password.',
  });
});
