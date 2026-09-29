import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authRequest } from '../lib/authClient';

export type DashboardDetail = { label: string; value: string };

type DashboardPanelProps = {
  eyebrow: string;
  title: string;
  intro: string;
  details: DashboardDetail[];
  children?: ReactNode;
};

const inputClass =
  'w-full rounded-xl border border-charcoal/20 bg-white px-4 py-3 font-[family-name:var(--font-body)] text-base text-charcoal transition-colors motion-reduce:transition-none focus:border-brand-green focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-1';

export default function DashboardPanel({
  eyebrow,
  title,
  intro,
  details,
  children,
}: DashboardPanelProps) {
  const { user, signOut, refresh } = useAuth();
  const navigate = useNavigate();

  const [signingOut, setSigningOut] = useState(false);
  const [signingOutEverywhere, setSigningOutEverywhere] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    navigate('/', { replace: true });
  }

  async function handleSignOutEverywhere() {
    if (signingOutEverywhere) return;
    setSigningOutEverywhere(true);
    setSignOutError(null);

    const result = await authRequest<{ ok: boolean }>('/api/auth/logout-all', { body: {} });
    if (!result.ok) {
      setSigningOutEverywhere(false);
      setSignOutError(result.failure.error);
      return;
    }

    // Every token including this one is now stale; read the session back so the
    // shell shows signed out before the log in page appears.
    await refresh();
    navigate('/auth#login', { replace: true });
  }

  async function handleResendVerification() {
    if (resending) return;
    setResending(true);
    setResendMessage(null);
    setResendError(null);

    const result = await authRequest<{ ok: boolean; message?: string }>(
      '/api/auth/resend-verification',
      { body: {} },
    );
    setResending(false);

    if (!result.ok) {
      setResendError(result.failure.error);
      return;
    }
    setResendMessage(result.data.message ?? 'We sent a new confirmation link.');
  }

  async function handleDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password) {
      setDeleteError('Enter your password to confirm.');
      return;
    }
    setDeleting(true);
    setDeleteError(null);

    const result = await authRequest<{ ok: boolean }>('/api/auth/account', {
      method: 'DELETE',
      body: { password },
    });

    if (!result.ok) {
      setDeleting(false);
      setDeleteError(result.failure.error);
      return;
    }

    // The server already cleared the session cookie.
    await signOut();
    navigate('/', { replace: true });
  }

  return (
    <section className="bg-cream pt-[120px] pb-[80px] min-h-screen">
      <div className="max-w-[820px] mx-auto px-5 md:px-6">
        <p className="font-[family-name:var(--font-body)] text-xs font-semibold uppercase tracking-[0.12em] text-brand-green mb-2">
          {eyebrow}
        </p>
        <h1
          className="font-[family-name:var(--font-heading)] font-semibold text-charcoal leading-[1.2] mb-3"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)' }}
        >
          {title}
        </h1>
        <p className="font-[family-name:var(--font-body)] text-base text-charcoal/65 max-w-[52ch] leading-relaxed mb-8">
          {intro}
        </p>

        {user && !user.emailVerified && (
          <div className="mb-8 rounded-[20px] border border-terracotta/40 bg-terracotta/10 px-5 py-4">
            <p className="font-[family-name:var(--font-body)] text-sm text-charcoal">
              Confirm your email address. We sent a link to{' '}
              <span className="font-semibold">{user.email}</span>. The link expires in 24 hours.
            </p>

            {resendMessage && (
              <p
                role="status"
                className="mt-3 font-[family-name:var(--font-body)] text-sm text-charcoal"
              >
                {resendMessage}
              </p>
            )}

            {resendError && (
              <p role="alert" className="mt-3 font-[family-name:var(--font-body)] text-sm text-charcoal">
                {resendError}
              </p>
            )}

            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending}
              aria-busy={resending}
              className="mt-4 inline-flex items-center justify-center rounded-full border-2 border-charcoal/40 px-5 py-2.5 font-[family-name:var(--font-body)] text-sm font-semibold text-charcoal transition-colors motion-reduce:transition-none hover:border-charcoal hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 disabled:opacity-70"
            >
              {resending ? 'Please wait' : 'Send a new confirmation link'}
            </button>
          </div>
        )}

        <div className="rounded-[20px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-5 py-6 md:px-8 md:py-8">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-charcoal mb-4">
            Your details
          </h2>
          <dl className="grid gap-4 min-[560px]:grid-cols-2">
            {details.map((detail) => (
              <div key={detail.label}>
                <dt className="font-[family-name:var(--font-body)] text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                  {detail.label}
                </dt>
                <dd className="font-[family-name:var(--font-body)] text-base text-charcoal break-words">
                  {detail.value}
                </dd>
              </div>
            ))}
          </dl>

          {children}

          {signOutError && (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-terracotta/40 bg-terracotta/10 px-4 py-3 font-[family-name:var(--font-body)] text-sm text-charcoal"
            >
              {signOutError}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="inline-flex items-center justify-center rounded-full border-2 border-deep-green px-6 py-3 font-[family-name:var(--font-body)] text-sm font-semibold text-deep-green transition-colors motion-reduce:transition-none hover:bg-deep-green hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 disabled:opacity-70"
            >
              {signingOut ? 'Please wait' : 'Log out'}
            </button>

            <button
              type="button"
              onClick={handleSignOutEverywhere}
              disabled={signingOutEverywhere}
              className="inline-flex items-center justify-center rounded-full border-2 border-charcoal/25 px-6 py-3 font-[family-name:var(--font-body)] text-sm font-semibold text-charcoal transition-colors motion-reduce:transition-none hover:border-charcoal focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 disabled:opacity-70"
            >
              {signingOutEverywhere ? 'Please wait' : 'Log out on all devices'}
            </button>
          </div>

          <p className="mt-4 font-[family-name:var(--font-body)] text-sm text-charcoal/65">
            Log out on all devices also ends sessions on phones and shared computers, in case you
            signed in somewhere you no longer trust. To change your password,{' '}
            <Link
              to="/forgot-password"
              className="font-semibold text-deep-green underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green rounded-sm"
            >
              reset it by email
            </Link>
            .
          </p>
        </div>

        <div className="mt-8 rounded-[20px] border border-charcoal/15 bg-white px-5 py-6 md:px-8">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-charcoal mb-2">
            Delete your account
          </h2>
          <p className="font-[family-name:var(--font-body)] text-sm text-charcoal/65 mb-4 max-w-[56ch]">
            This removes your account, your profile and every sign in record. It cannot be undone.
          </p>

          {deleteError && (
            <p
              role="alert"
              className="mb-4 rounded-xl border border-terracotta/40 bg-terracotta/10 px-4 py-3 font-[family-name:var(--font-body)] text-sm text-charcoal"
            >
              {deleteError}
            </p>
          )}

          <form onSubmit={handleDelete} noValidate className="flex flex-col gap-3 min-[560px]:flex-row min-[560px]:items-end">
            <div className="flex-1">
              <label
                className="block font-[family-name:var(--font-body)] text-sm font-semibold text-charcoal mb-1.5"
                htmlFor="delete-password"
              >
                Confirm with your password
              </label>
              <input
                id="delete-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={deleting}
              className="inline-flex items-center justify-center rounded-full bg-charcoal px-6 py-3 font-[family-name:var(--font-body)] text-sm font-semibold text-white transition-colors motion-reduce:transition-none hover:bg-terracotta focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 disabled:opacity-70"
            >
              {deleting ? 'Please wait' : 'Delete my account'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
