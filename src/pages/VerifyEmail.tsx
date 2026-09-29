import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ContourPanel } from '../components/ContourPattern';
import SEO from '../components/SEO';
import { authRequest } from '../lib/authClient';

type State = { status: 'working' } | { status: 'done' } | { status: 'failed'; message: string };

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<State>({ status: 'working' });
  // Verification tokens work once, so the request must not run twice (React
  // runs effects twice in development, and a retry would burn the token).
  const requested = useRef(false);

  // A link with no code is a render time answer, not a state update.
  const view: State = token
    ? state
    : { status: 'failed', message: 'This link is missing its confirmation code.' };

  useEffect(() => {
    if (requested.current || !token) return;
    requested.current = true;

    void (async () => {
      const result = await authRequest<{ ok: boolean }>('/api/auth/verify-email', {
        body: { token },
      });
      setState(
        result.ok
          ? { status: 'done' }
          : { status: 'failed', message: result.failure.error },
      );
    })();
  }, [token]);

  return (
    <>
      <SEO
        title="Confirm your email"
        description="Confirm the email address on your People Growth Africa account."
        url="/auth/verify"
      />
      <section className="bg-cream pt-[140px] pb-[100px] min-h-screen">
        <div className="max-w-[520px] mx-auto px-5 md:px-6 text-center">
          <ContourPanel className="mb-8 px-6 py-7 md:px-8 md:py-9">
            <h1 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl font-semibold text-white mb-3">
              {view.status === 'done' ? 'Your email is confirmed.' : 'Confirming your email'}
            </h1>

            {view.status === 'working' && (
              <p role="status" className="font-[family-name:var(--font-body)] text-white/80">
                One moment.
              </p>
            )}

            {view.status === 'done' && (
              <p className="font-[family-name:var(--font-body)] text-white/80 leading-relaxed">
                Your account is ready. You can close this tab and continue where you left off.
              </p>
            )}

            {view.status === 'failed' && (
              <p
                role="alert"
                className="font-[family-name:var(--font-body)] text-white/85 leading-relaxed"
              >
                {view.message}
              </p>
            )}
          </ContourPanel>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/auth#login"
              className="inline-flex items-center justify-center rounded-full bg-brand-green px-6 py-3 font-[family-name:var(--font-body)] text-sm font-semibold text-white transition-colors motion-reduce:transition-none hover:bg-terracotta focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2"
            >
              Go to log in
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border-2 border-deep-green px-6 py-3 font-[family-name:var(--font-body)] text-sm font-semibold text-deep-green transition-colors motion-reduce:transition-none hover:bg-deep-green hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2"
            >
              Back to the site
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
