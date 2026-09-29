import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ContourPanel } from '../components/ContourPattern';
import SEO from '../components/SEO';
import { authRequest } from '../lib/authClient';

const inputClass =
  'w-full rounded-xl border border-charcoal/20 bg-white px-4 py-3 font-[family-name:var(--font-body)] text-base text-charcoal placeholder:text-charcoal/40 transition-colors motion-reduce:transition-none focus:border-brand-green focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-1';

const labelClass =
  'block font-[family-name:var(--font-body)] text-sm font-semibold text-charcoal mb-1.5';

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  async function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError(null);
    setMessage(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter your email address.');
      document.getElementById('forgot-email')?.focus();
      return;
    }

    setSubmitting(true);
    const result = await authRequest<{ ok: boolean; message?: string }>('/api/auth/forgot-password', {
      body: { email: trimmed },
    });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.failure.error);
      return;
    }
    setMessage(
      result.data.message ?? 'If that email has an account, we sent a link to reset the password.',
    );
  }

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError(null);
    setMessage(null);
    setFieldError(null);

    if (password.length < 8) {
      setFieldError('Use at least 8 characters.');
      document.getElementById('reset-password')?.focus();
      return;
    }
    if (password !== confirm) {
      setFieldError('Both passwords must match.');
      document.getElementById('reset-confirm')?.focus();
      return;
    }

    setSubmitting(true);
    const result = await authRequest<{ ok: boolean; message?: string }>(
      '/api/auth/reset-password',
      { body: { token, password } },
    );
    setSubmitting(false);

    if (!result.ok) {
      setError(result.failure.error);
      return;
    }
    setMessage(result.data.message ?? 'Your password is updated. Log in with it now.');
    setPassword('');
    setConfirm('');
  }

  return (
    <>
      <SEO
        title={token ? 'Choose a new password' : 'Reset your password'}
        description="Reset the password for your People Growth Africa account."
        url="/forgot-password"
      />
      <section className="bg-cream pt-[120px] pb-[100px] min-h-screen">
        <div className="max-w-[460px] mx-auto px-5 md:px-6">
          {/* Heading on the brand panel, form in the card below, the same
              shape as the account page these flows are reached from. */}
          <ContourPanel className="mb-6 px-6 py-7 md:px-8 md:py-8">
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-white mb-2">
              {token ? 'Choose a new password' : 'Reset your password'}
            </h1>
            <p className="font-[family-name:var(--font-body)] text-sm text-white/80 leading-relaxed">
              {token
                ? 'Enter a new password for your account. Resetting it ends every signed in session.'
                : 'Enter the email address on your account and we will send a link to reset the password.'}
            </p>
          </ContourPanel>

          <div className="rounded-[20px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-6 py-7 md:px-8 md:py-9">

            {error && (
              <p
                role="alert"
                className="mb-5 rounded-xl border border-terracotta/40 bg-terracotta/10 px-4 py-3 font-[family-name:var(--font-body)] text-sm text-charcoal"
              >
                {error}
              </p>
            )}

            {message && (
              <p
                role="status"
                className="mb-5 rounded-xl border border-brand-green/40 bg-mint/60 px-4 py-3 font-[family-name:var(--font-body)] text-sm text-charcoal"
              >
                {message}
              </p>
            )}

            {token ? (
              <form onSubmit={handleReset} noValidate>
                <div className="mb-4">
                  <label className={labelClass} htmlFor="reset-password">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="reset-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className={`${inputClass} pr-20`}
                      aria-invalid={Boolean(fieldError)}
                      aria-describedby={fieldError ? 'reset-error' : 'reset-help'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-pressed={showPassword}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm px-2 py-1 font-[family-name:var(--font-body)] text-sm font-semibold text-deep-green focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <p id="reset-help" className="mt-1.5 font-[family-name:var(--font-body)] text-xs text-charcoal/60">
                    Use at least 8 characters.
                  </p>
                </div>

                <div className="mb-6">
                  <label className={labelClass} htmlFor="reset-confirm">
                    Repeat the new password
                  </label>
                  <input
                    id="reset-confirm"
                    name="confirm"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    className={inputClass}
                    aria-invalid={Boolean(fieldError)}
                    aria-describedby={fieldError ? 'reset-error' : undefined}
                  />
                  {fieldError && (
                    <p id="reset-error" className="mt-1.5 font-[family-name:var(--font-body)] text-xs text-charcoal/60">
                      {fieldError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  aria-busy={submitting}
                  className="w-full inline-flex items-center justify-center rounded-full bg-brand-green px-6 py-3.5 font-[family-name:var(--font-body)] text-base font-semibold text-white transition-colors motion-reduce:transition-none hover:bg-terracotta focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 disabled:opacity-70"
                >
                  {submitting ? 'Please wait' : 'Save the new password'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRequest} noValidate>
                <div className="mb-6">
                  <label className={labelClass} htmlFor="forgot-email">
                    Email
                  </label>
                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  aria-busy={submitting}
                  className="w-full inline-flex items-center justify-center rounded-full bg-brand-green px-6 py-3.5 font-[family-name:var(--font-body)] text-base font-semibold text-white transition-colors motion-reduce:transition-none hover:bg-terracotta focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 disabled:opacity-70"
                >
                  {submitting ? 'Please wait' : 'Send the reset link'}
                </button>
              </form>
            )}

            <p className="mt-6 font-[family-name:var(--font-body)] text-sm text-charcoal/65">
              <Link
                to="/auth#login"
                className="font-semibold text-deep-green underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green rounded-sm"
              >
                Back to log in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
