import { consumeAuthToken, insertAuthToken } from './db.js';
import type { TokenType } from './db.js';
import { hashToken, newToken } from './security.js';

/**
 * Verification and reset links carry a random token. Only its SHA-256 hash is
 * stored, and redeeming is a single atomic statement, so a link works once.
 */

const TTL_SECONDS: Record<TokenType, number> = {
  verify: 60 * 60 * 24,
  reset: 60 * 60,
};

export async function issueToken(userId: string, type: TokenType): Promise<string> {
  const token = newToken();
  await insertAuthToken({
    userId,
    type,
    tokenHash: hashToken(token),
    ttlSeconds: TTL_SECONDS[type],
  });
  return token;
}

export async function redeemToken(token: string, type: TokenType): Promise<string | null> {
  return consumeAuthToken(hashToken(token), type);
}
