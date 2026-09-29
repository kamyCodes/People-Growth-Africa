import { logAuthEvent } from './db';
import { hashIp } from './security';

/**
 * Security relevant events (signup, login, failed login, password reset,
 * account deletion) are recorded in auth_events with a keyed hash of the IP
 * address rather than the address itself.
 */
export async function recordAuthEvent(
  event: string,
  options: { userId?: string | null; ip?: string | undefined } = {},
): Promise<void> {
  try {
    await logAuthEvent({
      userId: options.userId ?? null,
      event,
      ipHash: hashIp(options.ip),
    });
  } catch (error) {
    // A missing audit row must never turn into a failed signup or login, but it
    // should be visible in the logs.
    console.error('[auth] audit write failed', event, error);
  }
}
