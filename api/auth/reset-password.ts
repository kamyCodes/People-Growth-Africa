import { ApiError, clientIp, endpoint, parseJsonBody, safeRedirect, sendJson } from '../_lib/http';
import { parseInput, resetPasswordSchema } from '../_lib/validation';
import { findSessionUserById, setPassword } from '../_lib/db';
import { hashPassword, hashToken, isPasswordBreached } from '../_lib/security';
import { redeemToken } from '../_lib/auth-tokens';
import { clearSessionCookie } from '../_lib/session';
import { enforceRateLimit } from '../_lib/ratelimit';
import { recordAuthEvent } from '../_lib/audit';
import { sendPasswordChangedEmail } from '../_lib/email';

export default endpoint({ methods: ['POST'], csrf: true }, async (req, res) => {
  const ip = clientIp(req);
  const data = parseInput(resetPasswordSchema, parseJsonBody(req));

  await enforceRateLimit({ name: 'reset-password-ip', identifier: ip, limit: 20, windowSeconds: 3600 });
  // The client already holds the token, so counting by its hash slows down
  // anyone trying to guess a valid one without making legitimate use harder.
  await enforceRateLimit({
    name: 'reset-password-token',
    identifier: hashToken(data.token),
    limit: 10,
    windowSeconds: 3600,
  });

  if (await isPasswordBreached(data.password)) {
    throw new ApiError(
      400,
      'password_breached',
      'That password has appeared in a known data breach. Choose one you have not used anywhere else.',
      { password: 'This password has appeared in a known data breach.' },
    );
  }

  const userId = await redeemToken(data.token, 'reset');
  if (!userId) {
    throw new ApiError(
      400,
      'token_invalid',
      'That reset link has already been used or has expired. Request a new one.',
    );
  }

  // setPassword also bumps token_version, which ends every existing session,
  // including one an attacker may already hold.
  await setPassword(userId, await hashPassword(data.password));
  clearSessionCookie(req, res);
  await recordAuthEvent('password_reset', { userId, ip });

  const user = await findSessionUserById(userId);
  if (user) await sendPasswordChangedEmail(user.email);

  sendJson(res, 200, {
    ok: true,
    message: 'Your password is updated. Log in with it now.',
    redirect: safeRedirect('/auth#login'),
  });
});
