import { ApiError, clientIp, endpoint, parseJsonBody, sendJson } from '../_lib/http.js';
import { newsletterConfirmSchema, parseInput } from '../_lib/validation.js';
import { confirmNewsletterSubscriber } from '../_lib/db.js';
import { hashToken } from '../_lib/security.js';
import { enforceRateLimit } from '../_lib/ratelimit.js';
import { recordAuthEvent } from '../_lib/audit.js';

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

  const email = await confirmNewsletterSubscriber(hashToken(data.token));
  if (!email) {
    throw new ApiError(
      400,
      'token_invalid',
      'That confirmation link has already been used or has expired. Enter your email on the blog page for a new one.',
    );
  }

  await recordAuthEvent('newsletter_confirmed', { ip });

  sendJson(res, 200, { ok: true });
});
