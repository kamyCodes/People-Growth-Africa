import { ApiError, clientIp, endpoint, parseJsonBody, sendJson } from '../../http.js';
import { newsletterConfirmSchema, parseInput } from '../../validation.js';
import {
  confirmNewsletterSubscriber,
  findNewsletterSubscriberByTokenHash,
} from '../../db.js';
import { hashToken } from '../../security.js';
import { enforceRateLimit } from '../../ratelimit.js';
import { recordAuthEvent } from '../../audit.js';

/**
 * Redeems a confirmation link. The first click confirms; a second visit to the
 * same link is not an error but the answer "this is already done", because the
 * commonest way it happens is the page being refreshed after success. Only a
 * link that was never issued, or one whose window closed unclicked, is an error.
 */
export default endpoint({ methods: ['POST'], csrf: true }, async (req, res) => {
  const ip = clientIp(req);
  const data = parseInput(newsletterConfirmSchema, parseJsonBody(req));

  await enforceRateLimit({
    name: 'newsletter-confirm-ip',
    identifier: ip,
    limit: 20,
    windowSeconds: 900,
  });
  await enforceRateLimit({
    name: 'newsletter-confirm-token',
    identifier: hashToken(data.token),
    limit: 10,
    windowSeconds: 900,
  });

  const tokenHash = hashToken(data.token);
  const email = await confirmNewsletterSubscriber(tokenHash);
  if (email) {
    await recordAuthEvent('newsletter_confirmed', { ip });
    sendJson(res, 200, { ok: true });
    return;
  }

  // The hash stays on the row after confirmation, so a replayed link is
  // recognisable and says already confirmed. A pending row whose window has
  // closed also lands here - it still carries its hash - and resending is the
  // right advice for it, which the message below gives.
  const existing = await findNewsletterSubscriberByTokenHash(tokenHash);
  if (existing?.status === 'confirmed') {
    sendJson(res, 200, { ok: true, already: true });
    return;
  }

  throw new ApiError(
    400,
    'token_invalid',
    'That confirmation link has expired. Enter your email on the blog page and we will send a fresh one.',
  );
});
