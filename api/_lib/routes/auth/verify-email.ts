import { ApiError, clientIp, endpoint, parseJsonBody, sendJson } from '../../http.js';
import { parseInput, verifyEmailSchema } from '../../validation.js';
import { findSpentAuthToken, findUserById, markEmailVerified } from '../../db.js';
import { hashToken } from '../../security.js';
import { redeemToken } from '../../auth-tokens.js';
import { enforceRateLimit } from '../../ratelimit.js';
import { recordAuthEvent } from '../../audit.js';

/**
 * Redeems a verification link. The first click verifies the account; clicking
 * it again - a refresh, a second tab, a mail client that fetched the link - is
 * answered "already confirmed" rather than an error, because the account state
 * is what the visitor cares about. Tokens are single use, so the spent token's
 * stored hash is how a replay is recognised. Only an unknown token, or one
 * whose 24 hours passed unclicked, is an error.
 */
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
  if (userId) {
    await markEmailVerified(userId);
    await recordAuthEvent('email_verified', { userId, ip });
    sendJson(res, 200, { ok: true });
    return;
  }

  // Already redeemed: if that first redemption verified the account, say so.
  // An expired link is not in the table at all, so this lookup cannot fire for it.
  const spent = await findSpentAuthToken(hashToken(data.token), 'verify');
  if (spent) {
    const owner = await findUserById(spent.userId);
    if (owner?.email_verified) {
      sendJson(res, 200, { ok: true, already: true });
      return;
    }
  }

  throw new ApiError(
    400,
    'token_invalid',
    'That confirmation link has expired. Log in and we will send you a new one.',
  );
});
