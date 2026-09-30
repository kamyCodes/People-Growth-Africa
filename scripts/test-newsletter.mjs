/**
 * Newsletter test suite. Checks the double opt in signup over real HTTP and a
 * real database: a signup is stored as pending with only a hash of its link,
 * the emailed link confirms it exactly once, and the endpoints refuse another
 * origin, an unknown key and a flood of requests.
 *
 *   npm run test:newsletter                          # local: needs DATABASE_URL
 *   npm run test:newsletter -- --base-url=https://x # against a deployment
 *
 * A local run needs DATABASE_URL (and DATABASE_URL_UNPOOLED for clean up) in
 * .env.development.local, .env.local or .env. Test rows carry an obvious prefix
 * and are removed at the end.
 */
import { createHash, randomBytes } from 'node:crypto';
import { loadEnvFiles, startApiServer } from './api-server.mjs';
import { checkApiImports } from './check-api-imports.mjs';

const EMAIL_PREFIX = `test-newsletter-${Date.now().toString(36)}`;
const EMAIL_A = `${EMAIL_PREFIX}-a@example.com`;
const EMAIL_B = `${EMAIL_PREFIX}-b@example.com`;
const EMAIL_C = `${EMAIL_PREFIX}-c@example.com`;
/** The one answer every signup gets, whatever state the address is in. */
const GENERIC_MESSAGE =
  'Thanks. If that address is not already on the list, a confirmation link is on its way. Check your inbox and spam folder.';

const results = [];
let failures = 0;

function check(number, description, passed, detail = '') {
  results.push({ number, description, passed, detail });
  if (!passed) failures += 1;
  const mark = passed ? 'PASS' : 'FAIL';
  console.log(`${mark}  ${String(number).padStart(2)}. ${description}${detail ? ` (${detail})` : ''}`);
}

/** For checks that need something this runner cannot obtain, e.g. the link. */
function skipCheck(number, description, reason) {
  results.push({ number, description, passed: true, skipped: true, detail: reason });
  console.log(`SKIP  ${String(number).padStart(2)}. ${description} (${reason})`);
}

// --- email capture -----------------------------------------------------------
// With no RESEND_API_KEY the API prints the message instead of sending it, and
// that is how this script recovers the confirmation link.
const logged = [];
const originalWarn = console.warn;
console.warn = (...args) => {
  logged.push(args.map((value) => String(value)).join(' '));
};

function linksSince(mark) {
  const text = logged.slice(mark).join('\n');
  return [...text.matchAll(/newsletter\/confirm\?token=([A-Za-z0-9_-]+)/g)].map((match) => match[1]);
}

// --- http helpers ------------------------------------------------------------
async function call(baseUrl, path, options = {}) {
  const { method = 'POST', body, headers = {} } = options;
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    ...(body === undefined ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }),
    redirect: 'manual',
  });

  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: response.status, json, text, response };
}

const subscriberRow = (sql, email) =>
  sql.query(
    'SELECT status, confirm_token_hash, confirm_expires_at, confirmed_at FROM newsletter_subscribers WHERE email = $1',
    [email],
  );

async function cleanup(sql) {
  if (!sql) return;
  await sql.query('DELETE FROM newsletter_subscribers WHERE email LIKE $1', [`${EMAIL_PREFIX}%`]);
  originalWarn.call(console, `Cleaned up test rows for ${EMAIL_PREFIX}`);
}

async function main() {
  const baseUrlArg = process.argv.find((argument) => argument.startsWith('--base-url='));
  const configuredBaseUrl = baseUrlArg?.split('=')[1] ?? process.env.NEWSLETTER_TEST_BASE_URL;
  const isLocal = !configuredBaseUrl;

  if (isLocal) {
    loadEnvFiles({ quiet: true });
    if (!process.env.DATABASE_URL) {
      console.error(
        [
          '',
          'DATABASE_URL is not set, so the suite cannot start the API locally.',
          '',
          'Either pull the Vercel environment (vercel env pull .env.development.local --yes)',
          'or point the suite at a deployment:',
          '  npm run test:newsletter -- --base-url=https://your-preview.vercel.app',
          '',
        ].join('\n'),
      );
      process.exit(1);
    }
    process.env.JWT_SECRET ??= randomBytes(32).toString('hex');
    // A previous run must not leave rate limit counters behind, the link has to
    // reach this process's log, and a real send to example.com would bounce.
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.RESEND_API_KEY;
  }

  // Every route in api/ has to import cleanly as a native ES module before any
  // request is worth making, the same check test:auth runs first.
  const imports = await checkApiImports({ quiet: true });
  if (!imports.ok) {
    console.error(`\n${imports.summary}\n\nRun \`node scripts/check-api-imports.mjs\` for the details.\n`);
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? null;
  const server = isLocal ? await startApiServer({ quiet: true }) : null;
  const baseUrl = configuredBaseUrl ?? server.origin;
  const suppliedLink = process.argv
    .find((argument) => argument.startsWith('--confirm-link='))
    ?.split('=')[1];
  const suppliedToken = suppliedLink ? new URL(suppliedLink).searchParams.get('token') : null;

  let sql = null;
  if (databaseUrl) {
    const { neon } = await import('@neondatabase/serverless');
    sql = neon(databaseUrl);
  }
  console.log(`\nTesting ${baseUrl} as ${EMAIL_PREFIX}\n`);

  try {
    // 1. A new address is accepted, with the answer every outcome gets.
    const mark = logged.length;
    const signup = await call(baseUrl, '/api/newsletter/subscribe', { body: { email: EMAIL_A } });
    const token = linksSince(mark).at(-1) ?? suppliedToken;
    check(
      1,
      'Signing up returns 200 with the generic answer',
      signup.status === 200 &&
        signup.json?.ok === true &&
        signup.json?.message === GENERIC_MESSAGE,
      `status ${signup.status}`,
    );

    // 2. The row waits for confirmation, and the database never holds the link.
    if (sql && token) {
      const row = (await subscriberRow(sql, EMAIL_A))[0];
      const expectedHash = createHash('sha256').update(token).digest('hex');
      const hoursLeft = row
        ? (new Date(String(row.confirm_expires_at)).getTime() - Date.now()) / 3_600_000
        : 0;
      check(
        2,
        'The address is stored as pending with only a hash of the link, expiring in about 48 hours',
        Boolean(row) &&
          row.status === 'pending' &&
          row.confirmed_at === null &&
          row.confirm_token_hash === expectedHash &&
          row.confirm_token_hash !== token &&
          hoursLeft > 47 &&
          hoursLeft < 49,
        row ? `status ${row.status}, link expires in ${hoursLeft.toFixed(1)}h` : 'no row stored',
      );
    } else {
      skipCheck(2, 'The pending row stores only a hash of the link', 'no database access or no captured link');
    }

    // 3. A token nobody was ever sent is refused.
    const bogus = await call(baseUrl, '/api/newsletter/confirm', { body: { token: 'x'.repeat(43) } });
    check(
      3,
      'An unknown confirmation token returns 400',
      bogus.status === 400 && bogus.json?.code === 'token_invalid',
      `status ${bogus.status}, code ${bogus.json?.code}`,
    );

    // 4. The emailed link confirms the subscription.
    const confirmed = token
      ? await call(baseUrl, '/api/newsletter/confirm', { body: { token } })
      : null;
    if (token) {
      check(
        4,
        'The emailed link confirms the subscription',
        confirmed.status === 200 && confirmed.json?.ok === true,
        `status ${confirmed.status}`,
      );
    } else {
      skipCheck(
        4,
        'The emailed link confirms the subscription',
        'no confirmation link captured; pass --confirm-link=<full url>, or run locally where it is printed',
      );
    }

    // 5. ...and the row shows it, with the spent link cleared.
    if (sql && token) {
      const row = (await subscriberRow(sql, EMAIL_A))[0];
      check(
        5,
        'The row is confirmed and its link is cleared',
        Boolean(row) &&
          row.status === 'confirmed' &&
          Boolean(row.confirmed_at) &&
          row.confirm_token_hash === null &&
          row.confirm_expires_at === null,
        row ? `status ${row.status}, link ${row.confirm_token_hash === null ? 'cleared' : 'still stored'}` : 'no row',
      );
    } else {
      skipCheck(5, 'The row is confirmed and its link is cleared', 'no database access or no captured link');
    }

    // 6. A link works once.
    const replay = token ? await call(baseUrl, '/api/newsletter/confirm', { body: { token } }) : null;
    if (token) {
      check(
        6,
        'Replaying the same link returns 400',
        replay.status === 400 && replay.json?.code === 'token_invalid',
        `status ${replay.status}`,
      );
    } else {
      skipCheck(6, 'Replaying the same link returns 400', 'no confirmation link captured');
    }

    // 7. A confirmed address is left alone and nothing new is sent. Typed in
    //    capitals, which must match the same row.
    const beforeRepeat = logged.length;
    const repeat = await call(baseUrl, '/api/newsletter/subscribe', {
      body: { email: EMAIL_A.toUpperCase() },
    });
    const repeatLinks = linksSince(beforeRepeat);
    check(
      7,
      'Signing up again for a confirmed address answers identically and sends nothing',
      repeat.status === 200 &&
        repeat.json?.message === GENERIC_MESSAGE &&
        repeatLinks.length === 0,
      `status ${repeat.status}, ${repeatLinks.length} new link(s)`,
    );

    if (sql) {
      const rows = await subscriberRow(sql, EMAIL_A);
      check(
        8,
        'The confirmed row is untouched and there is exactly one row for that address',
        rows.length === 1 && rows[0].status === 'confirmed' && rows[0].confirm_token_hash === null,
        `${rows.length} row(s), status ${rows[0]?.status}`,
      );
    } else {
      skipCheck(8, 'There is exactly one row for that address', 'no database access');
    }

    // 9. Signing up twice before confirming leaves only the newest link alive.
    const markC = logged.length;
    await call(baseUrl, '/api/newsletter/subscribe', { body: { email: EMAIL_C } });
    const olderToken = linksSince(markC).at(-1);
    await call(baseUrl, '/api/newsletter/subscribe', { body: { email: EMAIL_C } });
    const newestToken = linksSince(markC).at(-1);
    if (olderToken && newestToken && olderToken !== newestToken) {
      const superseded = await call(baseUrl, '/api/newsletter/confirm', {
        body: { token: olderToken },
      });
      const newest = await call(baseUrl, '/api/newsletter/confirm', {
        body: { token: newestToken },
      });
      check(
        9,
        'After a second signup only the newest link works',
        superseded.status === 400 && newest.status === 200,
        `older ${superseded.status}, newest ${newest.status}`,
      );
    } else {
      skipCheck(9, 'After a second signup only the newest link works', 'two links were not captured');
    }

    // 10. Both endpoints are guarded like the auth routes.
    const foreignSubscribe = await call(baseUrl, '/api/newsletter/subscribe', {
      body: { email: `${EMAIL_PREFIX}-evil@example.com` },
      headers: { Origin: 'https://evil.example' },
    });
    const foreignConfirm = await call(baseUrl, '/api/newsletter/confirm', {
      body: { token: 'x'.repeat(43) },
      headers: { Origin: 'https://evil.example' },
    });
    check(
      10,
      'Both endpoints refuse a request from another origin',
      foreignSubscribe.status === 403 && foreignConfirm.status === 403,
      `subscribe ${foreignSubscribe.status}, confirm ${foreignConfirm.status}`,
    );

    if (sql) {
      const rows = await sql.query(
        'SELECT count(*)::int AS count FROM newsletter_subscribers WHERE email = $1',
        [`${EMAIL_PREFIX}-evil@example.com`],
      );
      check(11, 'The refused request stored nothing', rows[0].count === 0, `${rows[0].count} row(s)`);
    } else {
      skipCheck(11, 'The refused request stored nothing', 'no database access');
    }

    // 12. A malformed address and an unknown key are both refused.
    const badEmail = await call(baseUrl, '/api/newsletter/subscribe', {
      body: { email: 'not-an-address' },
    });
    const extraKey = await call(baseUrl, '/api/newsletter/subscribe', {
      body: { email: `${EMAIL_PREFIX}-extra@example.com`, admin: true },
    });
    check(
      12,
      'A malformed address and an unknown key are both refused with 400',
      badEmail.status === 400 &&
        badEmail.json?.code === 'validation_failed' &&
        Boolean(badEmail.json?.fields?.email) &&
        extraKey.status === 400 &&
        extraKey.json?.code === 'validation_failed',
      `bad email ${badEmail.status}, extra key ${extraKey.status}`,
    );

    // 13. The wrong method is refused.
    const get = await call(baseUrl, '/api/newsletter/subscribe', { method: 'GET' });
    check(
      13,
      'A GET is refused with 405 and an Allow header naming POST',
      get.status === 405 && (get.response.headers.get('allow') ?? '').includes('POST'),
      `status ${get.status}, allow ${get.response.headers.get('allow')}`,
    );

    // 14. Three signups an hour per address, then a 429 a client can back off from.
    const statuses = [];
    let limited = null;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await call(baseUrl, '/api/newsletter/subscribe', {
        body: { email: EMAIL_B },
      });
      statuses.push(response.status);
      if (response.status === 429) limited = response;
    }
    const retryAfter = limited?.response.headers.get('retry-after') ?? null;
    check(
      14,
      'The fourth signup for one address in an hour is refused with 429 and Retry-After',
      statuses.join('/') === '200/200/200/429' &&
        limited?.json?.code === 'rate_limited' &&
        Number(retryAfter) > 0,
      `statuses ${statuses.join('/')}, Retry-After ${retryAfter}`,
    );
  } finally {
    console.warn = originalWarn;
    await cleanup(sql);
    if (server) await server.close();
  }

  const skipped = results.filter((result) => result.skipped).length;
  const passed = results.length - failures - skipped;
  console.log(
    `\n${passed}/${results.length} checks passed${skipped > 0 ? ` (${skipped} skipped)` : ''}`,
  );
  if (failures > 0) {
    console.log('\nFailing checks:');
    for (const result of results.filter((entry) => !entry.passed)) {
      console.log(`  ${result.number}. ${result.description} (${result.detail})`);
    }
  }
  process.exit(failures > 0 ? 1 : 0);
}

await main();
