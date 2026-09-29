import { ApiError, clientIp, endpoint, parseJsonBody, sendJson } from '../_lib/http';
import { parseInput, verifyEmailSchema } from '../_lib/validation';
import { markEmailVerified } from '../_lib/db';
import { hashToken } from '../_lib/security';
import { redeemToken } from '../_lib/auth-tokens';
import { enforceRateLimit } from '../_lib/ratelimit';
import { recordAuthEvent } from '../_lib/audit';

export default endpoint({ methods: ['POST'], csrf: true }, async (req, res) => {
  const ip = clientIp(req);
  const data = parseInput(verifyEmailSchema, parseJsonBody(req));

  await enforceRateLimit({ name: 'verify-email-ip', identifier: ip, limit: 20, windowSeconds: 900 });
  await enforceRateLimit({
    name: 'verify-email-token',
    identifier: hashToken(data.token),
    limit: 10,
    windowSeconds: 900,
  });

  const userId = await redeemToken(data.token, 'verify');
  if (!userId) {
    throw new ApiError(
      400,
      'token_invalid',
      'That confirmation link has already been used or has expired. Log in and request a new one.',
    );
  }

  await markEmailVerified(userId);
  await recordAuthEvent('email_verified', { userId, ip });

  sendJson(res, 200, { ok: true });
});
