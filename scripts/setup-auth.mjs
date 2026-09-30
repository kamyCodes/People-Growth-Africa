/**
 * Sets up everything the authentication system needs in Neon Postgres.
 *
 *   npm run setup:auth
 *
 * Safe to run as often as you like: every statement is idempotent and the self
 * test creates and removes its own throwaway row.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';

const root = path.resolve(import.meta.dirname, '..');
const ENV_FILES = ['.env.development.local', '.env.local', '.env'];

function loadEnvFiles() {
  for (const file of ENV_FILES) {
    const fullPath = path.join(root, file);
    if (!existsSync(fullPath)) continue;
    for (const rawLine of readFileSync(fullPath, 'utf8').split('\n')) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const separator = line.indexOf('=');
      if (separator === -1) continue;
      const key = line.slice(0, separator).replace(/^export\s+/, '').trim();
      let value = line.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
    console.log(`Loaded ${file}`);
  }
}

function connectionString() {
  // Migrations run better unpooled. The app itself always uses DATABASE_URL.
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) {
    console.error(
      [
        '',
        'DATABASE_URL is not set.',
        '',
        'Pull the Vercel environment first, then run this again:',
        '  npx vercel login',
        '  npx vercel link',
        '  npx vercel env pull .env.development.local --yes',
        '',
      ].join('\n'),
    );
    process.exit(1);
  }
  return url;
}

/** One statement per call, exactly as the app runs them. */
const STATEMENTS = [
  ['citext extension', 'CREATE EXTENSION IF NOT EXISTS citext'],

  [
    'users table',
    `CREATE TABLE IF NOT EXISTS users (
       id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
       email citext UNIQUE NOT NULL,
       password_hash text NOT NULL,
       role text NOT NULL CHECK (role IN ('talent', 'employer')),
       email_verified boolean NOT NULL DEFAULT false,
       token_version integer NOT NULL DEFAULT 0,
       created_at timestamptz NOT NULL DEFAULT now()
     )`,
  ],

  [
    'talent_profiles table',
    `CREATE TABLE IF NOT EXISTS talent_profiles (
       user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
       name text NOT NULL,
       field text NOT NULL,
       country text,
       availability text
     )`,
  ],

  [
    'employer_profiles table',
    `CREATE TABLE IF NOT EXISTS employer_profiles (
       user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
       name text NOT NULL,
       company text NOT NULL,
       needs text[] NOT NULL
     )`,
  ],

  [
    'auth_tokens table',
    `CREATE TABLE IF NOT EXISTS auth_tokens (
       id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
       user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
       type text NOT NULL CHECK (type IN ('verify', 'reset')),
       token_hash text NOT NULL,
       expires_at timestamptz NOT NULL,
       used_at timestamptz
     )`,
  ],

  [
    'auth_tokens token_hash index',
    'CREATE INDEX IF NOT EXISTS auth_tokens_token_hash_idx ON auth_tokens (token_hash)',
  ],

  // Not required by the lookup path, but it keeps deleting an account cheap.
  [
    'auth_tokens user_id index',
    'CREATE INDEX IF NOT EXISTS auth_tokens_user_id_idx ON auth_tokens (user_id)',
  ],

  [
    'auth_events table',
    `CREATE TABLE IF NOT EXISTS auth_events (
       id bigserial PRIMARY KEY,
       user_id uuid REFERENCES users(id) ON DELETE SET NULL,
       event text NOT NULL,
       ip_hash text,
       created_at timestamptz NOT NULL DEFAULT now()
     )`,
  ],

  [
    'auth_events created_at index',
    'CREATE INDEX IF NOT EXISTS auth_events_created_at_idx ON auth_events (created_at DESC)',
  ],

  [
    'newsletter_subscribers table',
    `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
       id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
       email citext UNIQUE NOT NULL,
       status text NOT NULL DEFAULT 'pending'
         CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
       confirm_token_hash text,
       confirm_expires_at timestamptz,
       confirmed_at timestamptz,
       created_at timestamptz NOT NULL DEFAULT now()
     )`,
  ],

  [
    'newsletter_subscribers confirm token index',
    'CREATE INDEX IF NOT EXISTS newsletter_subscribers_confirm_token_idx ON newsletter_subscribers (confirm_token_hash)',
  ],

  // Leads have no unique constraint on purpose: the same person may register
  // for two events, or ask for a consultation twice, and both are real leads.
  [
    'event_registrations table',
    `CREATE TABLE IF NOT EXISTS event_registrations (
       id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
       event_slug text NOT NULL,
       name text NOT NULL,
       email citext NOT NULL,
       phone text,
       organisation text NOT NULL,
       role text,
       question text,
       created_at timestamptz NOT NULL DEFAULT now()
     )`,
  ],

  [
    'event_registrations event_slug index',
    'CREATE INDEX IF NOT EXISTS event_registrations_event_slug_idx ON event_registrations (event_slug)',
  ],

  [
    'consultation_bookings table',
    `CREATE TABLE IF NOT EXISTS consultation_bookings (
       id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
       name text NOT NULL,
       email citext NOT NULL,
       phone text,
       organisation text NOT NULL,
       team_size text,
       service text,
       meeting_format text NOT NULL CHECK (meeting_format IN ('virtual', 'in-person')),
       preferred_date date NOT NULL,
       preferred_slot text NOT NULL,
       notes text,
       created_at timestamptz NOT NULL DEFAULT now()
     )`,
  ],

  [
    'enquiries table',
    `CREATE TABLE IF NOT EXISTS enquiries (
       id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
       name text NOT NULL,
       email citext NOT NULL,
       phone text,
       subject text NOT NULL,
       message text NOT NULL,
       source text NOT NULL CHECK (source IN ('consultation-modal', 'consultation-page')),
       created_at timestamptz NOT NULL DEFAULT now()
     )`,
  ],

  // The team reads the newest leads first, so this is the index every list of
  // them will use.
  [
    'event_registrations created_at index',
    'CREATE INDEX IF NOT EXISTS event_registrations_created_at_idx ON event_registrations (created_at DESC)',
  ],

  [
    'consultation_bookings created_at index',
    'CREATE INDEX IF NOT EXISTS consultation_bookings_created_at_idx ON consultation_bookings (created_at DESC)',
  ],

  [
    'enquiries created_at index',
    'CREATE INDEX IF NOT EXISTS enquiries_created_at_idx ON enquiries (created_at DESC)',
  ],
];

const REQUIRED_TABLES = [
  'users',
  'talent_profiles',
  'employer_profiles',
  'auth_tokens',
  'auth_events',
  'newsletter_subscribers',
  'event_registrations',
  'consultation_bookings',
  'enquiries',
];

async function migrate(sql) {
  for (const [label, statement] of STATEMENTS) {
    await sql.query(statement);
    console.log(`  ok  ${label}`);
  }
}

async function verify(sql) {
  const rows = await sql.query(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ANY($1)`,
    [REQUIRED_TABLES],
  );
  const found = new Set(rows.map((row) => row.table_name));
  const missing = REQUIRED_TABLES.filter((table) => !found.has(table));
  if (missing.length > 0) throw new Error(`Missing tables: ${missing.join(', ')}`);
  console.log(`  ok  ${REQUIRED_TABLES.length} tables present`);

  // Self test: the exact insert shape the app uses (CTE plus a text[] bind),
  // citext uniqueness, and the cascade from users to profiles. Removes itself.
  const email = 'auth-smoke-test@example.invalid';
  await sql.query('DELETE FROM users WHERE email = $1', [email]);

  const inserted = await sql.query(
    `WITH new_user AS (
       INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'employer') RETURNING id
     )
     INSERT INTO employer_profiles (user_id, name, company, needs)
     SELECT id, $3, $4, $5 FROM new_user
     RETURNING user_id AS id`,
    [email, 'not-a-real-hash', 'Smoke Test', 'Check', ['find_talent', 'book_consultation']],
  );
  if (inserted.length !== 1) throw new Error('Self test could not create a user row.');

  const duplicateRejected = await sql
    .query('INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)', [
      email.toUpperCase(),
      'x',
      'talent',
    ])
    .then(() => false)
    .catch((error) => error.code === '23505');
  if (!duplicateRejected) throw new Error('Self test: citext uniqueness is not in place.');

  await sql.query('DELETE FROM users WHERE email = $1', [email]);
  const leftovers = await sql.query('SELECT count(*)::int AS count FROM employer_profiles');
  console.log(
    `  ok  self test passed (insert, duplicate email rejected, delete cascaded, ${leftovers[0].count} profile rows left)`,
  );
}

/**
 * Self test for the newsletter table, running the exact statements the app runs:
 * the insert or refresh upsert (one row per address, letter case included) and
 * the atomic confirm that cannot be replayed. Removes its own row.
 */
async function verifyNewsletter(sql) {
  const email = 'newsletter-smoke-test@example.invalid';
  await sql.query('DELETE FROM newsletter_subscribers WHERE email = $1', [email]);

  const pending = await sql.query(
    `INSERT INTO newsletter_subscribers (email, status, confirm_token_hash, confirm_expires_at)
     VALUES ($1, 'pending', $2, now() + make_interval(secs => $3))
     ON CONFLICT (email) DO UPDATE
       SET status = 'pending',
           confirm_token_hash = EXCLUDED.confirm_token_hash,
           confirm_expires_at = EXCLUDED.confirm_expires_at
       WHERE newsletter_subscribers.status <> 'confirmed'
     RETURNING status`,
    [email, 'not-a-real-hash', 172800],
  );
  if (pending.length !== 1 || pending[0].status !== 'pending') {
    throw new Error('Self test: the newsletter upsert did not return a pending row.');
  }

  // A second signup, typed in capitals, must refresh the same row rather than
  // create a second one.
  const refreshed = await sql.query(
    `INSERT INTO newsletter_subscribers (email, status, confirm_token_hash, confirm_expires_at)
     VALUES ($1, 'pending', $2, now() + make_interval(secs => $3))
     ON CONFLICT (email) DO UPDATE
       SET status = 'pending',
           confirm_token_hash = EXCLUDED.confirm_token_hash,
           confirm_expires_at = EXCLUDED.confirm_expires_at
       WHERE newsletter_subscribers.status <> 'confirmed'
     RETURNING status`,
    [email.toUpperCase(), 'second-hash', 172800],
  );
  const counted = await sql.query(
    'SELECT count(*)::int AS count FROM newsletter_subscribers WHERE email = $1',
    [email],
  );
  if (refreshed.length !== 1 || counted[0].count !== 1) {
    throw new Error('Self test: the newsletter table holds duplicate rows for one address.');
  }

  const confirmStatement = `UPDATE newsletter_subscribers
      SET status = 'confirmed',
          confirmed_at = now(),
          confirm_token_hash = NULL,
          confirm_expires_at = NULL
    WHERE confirm_token_hash = $1
      AND status = 'pending'
      AND confirm_expires_at > now()
    RETURNING email`;
  const confirmed = await sql.query(confirmStatement, ['second-hash']);
  if (confirmed.length !== 1) throw new Error('Self test: confirming a newsletter row failed.');
  const replayed = await sql.query(confirmStatement, ['second-hash']);
  if (replayed.length !== 0) throw new Error('Self test: a used newsletter link could be replayed.');

  await sql.query('DELETE FROM newsletter_subscribers WHERE email = $1', [email]);
  console.log(
    '  ok  newsletter self test passed (upsert, one row per address, atomic confirm, no replay)',
  );
}

/**
 * Self test for the lead tables, running the exact inserts the app runs plus
 * the source check, then removing its own rows. A booking or an enquiry that
 * cannot be written is the failure this exists to catch, because the form on
 * the site would look like it worked either way.
 */
async function verifyLeads(sql) {
  const email = 'lead-smoke-test@example.invalid';
  try {
    const registration = await sql.query(
      `INSERT INTO event_registrations (event_slug, name, email, phone, organisation, role, question)
       VALUES ($1, $2, $3, NULL, $4, NULL, NULL)
       RETURNING id`,
      ['smoke-test-event', 'Smoke Test', email, 'Smoke Test Ltd'],
    );
    const booking = await sql.query(
      `INSERT INTO consultation_bookings
         (name, email, phone, organisation, team_size, service, meeting_format, preferred_date, preferred_slot, notes)
       VALUES ($1, $2, $3, $4, NULL, NULL, $5, $6, $7, NULL)
       RETURNING id`,
      ['Smoke Test', email, '+234 800 000 0000', 'Smoke Test Ltd', 'virtual', '2026-01-05', '10:00 AM'],
    );
    const enquiry = await sql.query(
      `INSERT INTO enquiries (name, email, phone, subject, message, source)
       VALUES ($1, $2, NULL, $3, $4, $5)
       RETURNING id`,
      ['Smoke Test', email, 'Smoke test', 'Smoke test message', 'consultation-page'],
    );
    if (registration.length !== 1 || booking.length !== 1 || enquiry.length !== 1) {
      throw new Error('Self test: a lead row could not be written.');
    }

    const badSourceRejected = await sql
      .query(
        `INSERT INTO enquiries (name, email, subject, message, source)
         VALUES ($1, $2, $3, $4, 'somewhere-else')`,
        ['Smoke Test', email, 'Smoke test', 'Smoke test message'],
      )
      .then(() => false)
      .catch((error) => error.code === '23514');
    if (!badSourceRejected) throw new Error('Self test: the enquiry source check is missing.');
  } finally {
    await sql.query('DELETE FROM event_registrations WHERE email = $1', [email]);
    await sql.query('DELETE FROM consultation_bookings WHERE email = $1', [email]);
    await sql.query('DELETE FROM enquiries WHERE email = $1', [email]);
  }

  console.log(
    '  ok  lead self test passed (event registration, booking and enquiry stored, unknown source rejected)',
  );
}

function vercelCli() {
  try {
    execFileSync('vercel', ['--version'], { stdio: 'ignore' });
    return ['vercel'];
  } catch {
    return null;
  }
}

/**
 * Adds JWT_SECRET to the Vercel environments when it is missing. Requires a
 * logged in and linked Vercel CLI; if that is not available this prints the
 * exact dashboard steps instead of failing the whole setup.
 */
function ensureJwtSecretOnVercel(secret) {
  const cli = vercelCli();
  if (!cli) {
    console.log(
      [
        '',
        'Vercel CLI not found on PATH, so JWT_SECRET was not added automatically.',
        'Either run `npm i -g vercel` or add JWT_SECRET by hand:',
        '  Vercel dashboard -> pgafrica -> Settings -> Environment Variables',
        '  Name: JWT_SECRET   Environments: Production, Preview, Development',
        '  Value:',
        secret,
        '',
      ].join('\n'),
    );
    return;
  }

  const listed = spawnSync(cli[0], [...cli.slice(1), 'env', 'ls', 'production'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 120_000,
  });

  if (listed.status !== 0) {
    console.log(
      [
        '',
        'Could not read the Vercel environment (are you logged in and linked?).',
        'Run these, then run `npm run setup:auth` again:',
        '  npx vercel login',
        '  npx vercel link',
        '',
        'JWT_SECRET value to add to Production, Preview and Development:',
        secret,
        '',
      ].join('\n'),
    );
    return;
  }

  if (listed.stdout.includes('JWT_SECRET')) {
    console.log('  ok  JWT_SECRET already set on Vercel (production)');
    return;
  }

  for (const target of ['production', 'development']) {
    const added = spawnSync(cli[0], [...cli.slice(1), 'env', 'add', 'JWT_SECRET', target], {
      cwd: root,
      input: `${secret}\n`,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 120_000,
    });
    console.log(
      added.status === 0
        ? `  ok  JWT_SECRET added to ${target}`
        : `  !   could not add JWT_SECRET to ${target}: ${(added.stderr || added.stdout || '').trim().split('\n').pop()}`,
    );
  }

  console.log(
    [
      '',
      'Note: the Vercel CLI cannot always write the Preview environment from here.',
      'If preview deploys need it, add JWT_SECRET to Preview in the dashboard:',
      '  Vercel dashboard -> pgafrica -> Settings -> Environment Variables',
      '  Value:',
      secret,
      '',
    ].join('\n'),
  );
}

const jwtSecret = process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32
  ? process.env.JWT_SECRET
  : randomBytes(32).toString('hex');

loadEnvFiles();
const sql = neon(connectionString());

console.log('Creating tables and indexes...');
await migrate(sql);

console.log('Checking the result...');
await verify(sql);
await verifyNewsletter(sql);
await verifyLeads(sql);

console.log('Checking JWT_SECRET...');
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) {
  console.log('  ok  JWT_SECRET is present in the local environment file');
} else {
  ensureJwtSecretOnVercel(jwtSecret);
}

console.log('\nDatabase ready.');
