import { clientIp, endpoint, parseJsonBody, sendJson } from '../_lib/http.js';
import { newsletterSubscribeSchema, parseInput } from '../_lib/validation.js';
import { upsertNewsletterSubscriber } from '../_lib/db.js';
import { hashToken, newToken } from '../_lib/security.js';
import { sendNewsletterConfirmationEmail } from '../_lib/email.js';
import { enforceRateLimit } from '../_lib/ratelimit.js';
import { recordAuthEvent } from '../_lib/audit.js';

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
  // left alone: no second confirmation mail, no reset to pending.
  if (row) {
    await sendNewsletterConfirmationEmail(data.email, token);
    await recordAuthEvent('newsletter_subscribe_requested', { ip });
  }

  // One answer for every outcome. Whether an address is on the list is not
  // something an anonymous caller gets to probe for, the same reason login and
  // password reset do not say whether an account exists.
  sendJson(res, 200, {
    ok: true,
    message:
      'Thanks. If that address is not already on the list, a confirmation link is on its way. Check your inbox and spam folder.',
  });
});
