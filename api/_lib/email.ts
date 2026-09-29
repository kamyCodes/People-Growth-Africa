import { Resend } from 'resend';

/**
 * Transactional email. When RESEND_API_KEY is not configured the message is
 * logged instead of sent, so local work and preview deploys stay usable. The
 * links themselves are only ever printed outside production, because a reset
 * link in a log is a reset link for anyone who can read the log.
 */

const FROM_ADDRESS =
  process.env.EMAIL_FROM ??
  process.env.AUTH_EMAIL_FROM ??
  'People Growth Africa <no-reply@peoplegrowthafrica.com>';

const IS_PRODUCTION = process.env.VERCEL_ENV === 'production';

/**
 * Fixed, server side origin for links in emails. Building a link from the
 * request's Host header would let an attacker make the reset link point at
 * their own domain.
 */
export function appUrl(): string {
  const configured =
    process.env.APP_URL ?? process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  return (configured ?? 'https://www.peoplegrowthafrica.com').replace(/\/+$/, '');
}

async function sendEmail(message: { to: string; subject: string; text: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (IS_PRODUCTION) {
      console.error(
        `[auth] RESEND_API_KEY is not set, so this email was not sent: "${message.subject}"`,
      );
      return;
    }
    console.warn(
      [
        '[auth] RESEND_API_KEY is not set, so no email was sent. Message follows.',
        `To: ${message.to}`,
        `Subject: ${message.subject}`,
        message.text,
      ].join('\n'),
    );
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
    if (error) console.error('[auth] email send failed', error);
  } catch (error) {
    // The account still exists and the user can request another link, so this
    // must not throw into the request path.
    console.error('[auth] email send threw', error);
  }
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const link = `${appUrl()}/auth/verify?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to,
    subject: 'Confirm your People Growth Africa email address',
    text: [
      'Welcome to People Growth Africa.',
      '',
      'Confirm your email address to finish setting up your account:',
      link,
      '',
      'This link works once and expires in 24 hours.',
      'If you did not create an account, you can ignore this message.',
    ].join('\n'),
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const link = `${appUrl()}/forgot-password?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to,
    subject: 'Reset your People Growth Africa password',
    text: [
      'Someone asked to reset the password for this email address.',
      '',
      'Choose a new password here:',
      link,
      '',
      'This link works once and expires in 1 hour.',
      'If this was not you, you can ignore this message. Your password is unchanged.',
    ].join('\n'),
  });
}

/**
 * Sent after a reset so an account holder finds out if someone else changed
 * their password. It deliberately carries no link.
 */
export async function sendPasswordChangedEmail(to: string): Promise<void> {
  await sendEmail({
    to,
    subject: 'Your People Growth Africa password was changed',
    text: [
      'The password for this account was just changed, and every signed in device has been logged out.',
      '',
      'If this was you, nothing further is needed.',
      'If it was not you, reset the password again immediately and reply to this message so we can help.',
    ].join('\n'),
  });
}
