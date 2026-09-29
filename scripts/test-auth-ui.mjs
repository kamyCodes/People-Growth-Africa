/**
 * Browser end to end test for the auth forms. Drives the real signup and login
 * forms in headless Chrome or Edge, over the same local server test:auth uses,
 * so a client side validation change cannot silently break logging in again
 * (that bug shipped once already: see the isSignup note in Auth.tsx).
 *
 *   npm run test:auth:ui
 *
 * Needs dist/ (run `npm run build` first when the UI changed) and DATABASE_URL
 * in .env.development.local, .env.local or .env. No browser download happens:
 * playwright-core drives an installed Chrome or Edge. The account the signup
 * check creates is deleted through the API at the end, success or failure.
 *
 * The form checks here are deliberately the ones an API test cannot see: what
 * a visitor's click actually submits, what the validation banner says, and
 * which page they land on afterwards.
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { loadEnvFiles, startApiServer } from './api-server.mjs';
import { checkApiImports } from './check-api-imports.mjs';

const EMAIL_PREFIX = `test-auth-ui-${Date.now().toString(36)}`;
const EMAIL = `${EMAIL_PREFIX}@example.com`;
const PASSWORD = 'Quiet-Harbour-7712';
const NAME = 'Ada UI Test';

const results = [];
let failures = 0;

function check(number, description, passed, detail = '') {
  results.push({ number, description, passed });
  if (!passed) failures += 1;
  const mark = passed ? 'PASS' : 'FAIL';
  console.log(`${mark}  ${String(number).padStart(2)}. ${description}${detail ? ` (${detail})` : ''}`);
}

/**
 * Launches headless Chrome or Edge. Only what playwright-core can drive
 * without downloading anything: a channel browser if one is installed, then a
 * bare executable, then lastly a full playwright install's bundled Chromium.
 */
async function launchBrowser() {
  const { chromium } = await import('playwright-core');
  const options = { headless: true };
  for (const channel of ['chrome', 'msedge']) {
    try {
      return await chromium.launch({ ...options, channel });
    } catch {
      // Try the next way.
    }
  }
  for (const executablePath of [
    process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe') : null,
    process.env['ProgramFiles(x86)'] ? join(process.env['ProgramFiles(x86)'], 'Google/Chrome/Application/chrome.exe') : null,
    process.env['ProgramFiles(x86)'] ? join(process.env['ProgramFiles(x86)'], 'Microsoft/Edge/Application/msedge.exe') : null,
    process.env.ProgramFiles ? join(process.env.ProgramFiles, 'Google/Chrome/Application/chrome.exe') : null,
    process.env.ProgramFiles ? join(process.env.ProgramFiles, 'Microsoft/Edge/Application/msedge.exe') : null,
  ].filter(Boolean)) {
    try {
      return await chromium.launch({ ...options, executablePath });
    } catch {
      // Try the next way.
    }
  }
  return chromium.launch(options);
}

// How many same-origin requests the page has made so far. The shell calls
// /api/auth/me once per page load, so success waits are framed with these
// counters rather than a timeout guess: waiting until requests settle would
// otherwise also catch the /me call and pass before the submit went out.
async function requestCount(page) {
  return page.evaluate(() => window.__pgaRequestCount ?? null);
}

/** Waits until the page has made a request beyond `from` and is idle again. */
async function settle(page, from, description) {
  try {
    await page.waitForFunction(
      (mark) => window.__pgaSettled >= mark,
      await requestCount(page),
      { timeout: 15000, polling: 100 },
    );
  } catch {
    throw new Error(`Timed out waiting for the ${description} to finish`);
  }
}

/**
 * Clicks a submit button and waits for the outcome. A submit that passes the
 * client validation fires a request and the wait covers its whole round trip;
 * a submit the client validation rejects sends nothing at all, which is a
 * result to assert on, not a hang. Returns whether a request went out.
 */
async function submit(page, button, description) {
  const before = await requestCount(page);
  await button.click();
  let sent = true;
  try {
    await page.waitForFunction(
      (mark) => (window.__pgaRequestCount ?? 0) > mark,
      before,
      { timeout: 3000, polling: 50 },
    );
  } catch {
    sent = false;
  }
  if (sent) await settle(page, before, description);
  return sent;
}

/**
 * Watches fetch on the page. __pgaRequestCount rises with every call;
 * __pgaSettled mirrors the highest count at which no call was still in
 * flight, which is what settle() waits on.
 */
async function installRequestWatch(page) {
  await page.addInitScript(() => {
    const window = globalThis;
    window.__pgaRequestCount = 0;
    window.__pgaActive = 0;
    window.__pgaSettled = 0;
    const originalFetch = window.fetch.bind(window);
    // One wrapper: count every call and track in-flight ones, so "settled"
    // means every call finished, not just that the last one was dispatched.
    window.fetch = async (...args) => {
      window.__pgaRequestCount += 1;
      window.__pgaActive += 1;
      try {
        return await originalFetch(...args);
      } finally {
        window.__pgaActive -= 1;
        if (window.__pgaActive === 0) window.__pgaSettled = window.__pgaRequestCount;
      }
    };
  });
}

function assertTrustedUrl(page, prefix, description) {
  const url = new URL(page.url());
  if (!(url.origin === 'http://localhost' || /^https?:$/.test(url.protocol))) {
    throw new Error(`${description} landed on an unexpected origin: ${page.url()}`);
  }
  if (prefix && !page.url().startsWith(prefix)) {
    throw new Error(`${description} expected ${prefix}, got ${page.url()}`);
  }
}

async function main() {
  loadEnvFiles({ quiet: true });
  if (!process.env.DATABASE_URL) {
    console.error(
      [
        '',
        'DATABASE_URL is not set, so the suite cannot start the API locally.',
        'Pull the Vercel environment first:',
        '  vercel env pull .env.development.local --yes',
        '',
      ].join('\n'),
    );
    process.exit(1);
  }
  process.env.JWT_SECRET ??= randomBytes(32).toString('hex');
  // Same reason test:auth does this: a previous run must not leave rate limit
  // counters behind that would 429 this one.
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;

  const imports = await checkApiImports({ quiet: true });
  if (!imports.ok) {
    console.error(`\n${imports.summary}\n\nRun \`node scripts/check-api-imports.mjs\` for the details.\n`);
    process.exit(1);
  }

  const server = await startApiServer({ quiet: true });
  const baseUrl = server.origin;
  const userDataDir = mkdtempSync(join(tmpdir(), 'pga-auth-ui-'));
  console.log(`\nTesting ${baseUrl} as ${EMAIL_PREFIX}\n`);

  try {
    const browser = await launchBrowser();
    try {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 860 },
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      await installRequestWatch(page);

      // --- 1. The regression: an empty log in submit --------------------------
      // The form once required a name on this tab too, so nothing could ever
      // pass validation. Every message here is asserted exactly.
      await page.goto(`${baseUrl}/auth#login`, { waitUntil: 'networkidle' });
      await page.getByRole('tab', { name: 'Log in' }).click();

      const emptySent = await submit(page, page.getByRole('button', { name: 'Log in', exact: true }), 'empty log in submit');

      const banner = await page.locator('[role=alert]').first().textContent();
      check(
        1.1,
        'The rejected log in never reached the server',
        emptySent === false,
        emptySent ? 'a request went out' : 'no request',
      );
      check(
        1,
        'Empty log in submit shows "Enter your email address." and nothing about a name',
        banner?.trim() === 'Enter your email address.',
        `banner "${banner?.trim()}"`,
      );

      // aria-invalid marks every offending field (both were empty); the banner
      // and focus go to the first one.
      const invalid = await page.locator('[aria-invalid="true"]');
      const flagged = await invalid.evaluateAll((nodes) => nodes.map((node) => node.id));
      const emailInvalid = await page.locator('#auth-email').getAttribute('aria-invalid');
      const emailInline = (await page.locator('#auth-email-error').textContent())?.trim();
      const focused = await page
        .locator('#auth-email')
        .evaluate((node) => node === document.activeElement);
      check(
        2,
        'Email is flagged with its inline error and holds focus (password flagged too)',
        emailInvalid === 'true' &&
          flagged.includes('auth-email') &&
          emailInline === 'Enter your email address.' &&
          focused,
        `flagged ${flagged.join(',')}, focused ${focused}`,
      );

      // --- 2. Filling the fields -----------------------
      // Errors are deliberately not cleared while typing: they stay up until
      // the next submit revalidates. Asserting that keeps a change either way
      // a visible decision rather than a silent one.
      await page.locator('#auth-email').fill(EMAIL);
      await page.locator('#auth-password').fill(PASSWORD);
      const bannersWhileTyping = await page.locator('[role=alert]').count();
      check(
        3,
        'The error banner stays up while typing; the next submit revalidates',
        bannersWhileTyping === 1,
        `${bannersWhileTyping} banners`,
      );

      // --- 3. Log in through the form with the wrong password first ----------
      // The password here is right for an account that does not exist yet, so
      // the server rejects it; this exercises the server error path in the UI.
      const wrongSent = await submit(page, page.getByRole('button', { name: 'Log in', exact: true }), 'wrong-password log in');
      const wrongBanner = (await page.locator('[role=alert]').first().textContent())?.trim();
      check(
        4.1,
        'The accepted log in reached the server',
        wrongSent === true,
        wrongSent ? 'request sent' : 'no request',
      );
      check(
        4,
        'Log in with an unknown account shows the server error banner',
        wrongBanner === 'Email or password is incorrect.',
        `banner "${wrongBanner}"`,
      );

      // --- 4. Sign up through the form ---------------------------------------
      // Tab switch first; selectTab must clear the login attempt's banner.
      await page.getByRole('tab', { name: 'Create account' }).click();
      const signupBanner = await page.locator('[role=alert]').count();
      check(5, 'Switching to the signup tab clears the login error banner', signupBanner === 0, `${signupBanner} banners`);
      await page.waitForURL(/#signup/);
      assertTrustedUrl(page, null, 'the signup tab');

      // An empty signup submit shows the first offender, the name.
      const emptySignupSent = await submit(
        page,
        page.getByRole('button', { name: 'Create talent account', exact: true }),
        'empty signup submit',
      );
      const signupEmptyBanner = (await page.locator('[role=alert]').first().textContent())?.trim();
      check(
        6,
        'Empty talent signup submit shows "Enter your full name." first',
        signupEmptyBanner === 'Enter your full name.',
        `banner "${signupEmptyBanner}"`,
      );
      check(
        6.1,
        'The rejected signup never reached the server',
        emptySignupSent === false,
        emptySignupSent ? 'a request went out' : 'no request',
      );

      await page.locator('#auth-name').fill(NAME);
      await page.locator('#auth-email').fill(EMAIL);
      await page.locator('#auth-field').fill('Data analysis');
      await page.locator('#auth-country').fill('Nigeria');
      await page.locator('#auth-password').fill(PASSWORD);
      await page.locator('#auth-acceptedTerms').check();

      await page.getByRole('button', { name: 'Create talent account', exact: true }).click();
      await page.waitForURL(/\/talent\/dashboard/, { timeout: 15000 });

      await page.locator('h1').filter({ hasText: `Hello ${NAME}` }).waitFor({ timeout: 15000 });
      check(
        7,
        'Submitting the signup form creates the account and lands on /talent/dashboard',
        true,
        page.url(),
      );
      check(8, 'The dashboard greets the account by name', true, `Hello ${NAME}`);

      // --- 5. Log out and log back in through the form -----------------------
      await page.getByRole('button', { name: 'Log out', exact: true }).click();
      await page.waitForURL(/\/($|\?|#)/, { timeout: 15000 });
      check(9, 'Log out returns to the home page', page.url() === `${baseUrl}/`, page.url());

      await page.goto(`${baseUrl}/auth#login`, { waitUntil: 'networkidle' });
      await page.locator('#auth-email').fill(EMAIL);
      await page.locator('#auth-password').fill(PASSWORD);
      await submit(page, page.getByRole('button', { name: 'Log in', exact: true }), 'final log in');
      await page.waitForURL(/\/talent\/dashboard/, { timeout: 15000 });
      await page.locator('h1').filter({ hasText: `Hello ${NAME}` }).waitFor({ timeout: 15000 });
      check(
        10,
        'Logging in through the form lands on the dashboard, greeted by name',
        true,
        page.url(),
      );

      // Delete the account through the dashboard, with the confirm password.
      await page.locator('#delete-password').fill(PASSWORD);
      const beforeDelete = await requestCount(page);
      await page.getByRole('button', { name: 'Delete my account', exact: true }).click();
      await settle(page, beforeDelete, 'account deletion');
      await page.waitForURL(`${baseUrl}/`, { timeout: 15000 });
      check(11, 'Deleting the account returns to the home page', page.url() === `${baseUrl}/`, page.url());

      // The deletion response cleared the session cookie, so the browser now
      // counts as signed out: /me must refuse the stale session.
      const sessionStatus = await page.evaluate(async () => {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        return response.status;
      });
      check(
        12,
        'After deletion the browser session no longer authenticates',
        sessionStatus === 401,
        `/api/auth/me ${sessionStatus}`,
      );
    } finally {
      await browser.close().catch(() => {});
    }
  } catch (error) {
    failures += 1;
    console.error(`\nERROR  ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof Error && error.stack) console.error(error.stack);
  } finally {
    rmSync(userDataDir, { recursive: true, force: true });
    await server.close();
  }

  const passed = results.filter((entry) => entry.passed).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  if (failures > 0) {
    console.log('\nFailing checks:');
    for (const result of results.filter((entry) => !entry.passed)) {
      console.log(`  ${result.number}. ${result.description}`);
    }
  }
  process.exit(failures > 0 ? 1 : 0);
}

await main();
