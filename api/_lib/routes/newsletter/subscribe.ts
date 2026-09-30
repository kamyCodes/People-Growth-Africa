import { ApiError, clientIp, endpoint, parseJsonBody, sendJson } from '../../http.js';
import { newsletterSubscribeSchema, parseInput } from '../../validation.js';
import {
  findNewsletterSubscriberByEmail,
  upsertNewsletterSubscriber,
} from '../../db.js';
import { hashToken, newToken } from '../../security.js';
import { sendNewsletterConfirmationEmail } from '../../email.js';
import { enforceRateLimit } from '../../ratelimit.js';
import { recordAuthEvent } from '../../audit.js';

/**
 * A signup stores the address as pending and mails a link; only opening that
 * link confirms the subscription. The address is not added to any list until
 * then, so a stranger cannot subscribe someone else.
 */

/** Two days leaves room for a weekend without an unread mail. */
const CONFIRM_TTL_SECONDS = 60 * 60 * 48;

export default endpoint({ methods: ['POST'], csrf: true }, async (req, res) => {
  const ip = clientIp(req);
  const data = parseInput(newsletterSubscribeSchema, parseJsonBody(req));

  await enforceRateLimit({ name: 'newsletter-ip', identifier: ip, limit: 10, windowSeconds: 3600 });
  await enforceRateLimit({
    name: 'newsletter-email',
    identifier: data.email,
    limit: 3,
    windowSeconds: 3600,
  });

  // A fresh link every time, so only the newest email works.
  const token = newToken();
  const row = await upsertNewsletterSubscriber({
    email: data.email,
    tokenHash: hashToken(token),
    ttlSeconds: CONFIRM_TTL_SECONDS,
  });

  // No row means this address is already confirmed, and a confirmed address is
  // left alone: no second confirmation mail, no reset to pending. The one
  // honest answer to the person typing is that they are already on the list -
  // the old wording sent them hunting an email that was never coming.
  if (!row) {
    const existing = await findNewsletterSubscriberByEmail(data.email);
    if (existing?.status === 'confirmed') {
      sendJson(res, 200, {
        ok: true,
        already: true,
        message: 'That address is already subscribed. Nothing more is needed.',
      });
      return;
    }
  }

  if (row) {
    // A rejected send (an unreachable provider, a refused address) must not be
    // reported as a confirmation link in the post, so the outcome changes the
    // answer: an honest failure asks the visitor to try again instead.
    const sent = await sendNewsletterConfirmationEmail(data.email, token);
    if (!sent) {
      throw new ApiError(
        503,
        'email_send_failed',
        'We could not send the confirmation email just now. Try again in a moment.',
      );
    }
    await recordAuthEvent('newsletter_subscribe_requested', { ip });
  }

  // One answer for every other outcome. Whether an unconfirmed address is on
  // the list is not something an anonymous caller gets to probe for, the same
  // reason login and password reset do not say whether an account exists.
  sendJson(res, 200, {
    ok: true,
    message:
      'Thanks. If that address is not already on the list, a confirmation link is on its way. Check your inbox and spam folder.',
  });
});
