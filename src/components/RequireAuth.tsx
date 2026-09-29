import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { dashboardPath, type Role } from '../lib/authClient';

/**
 * Route guard for signed in pages. The API checks the session on every request,
 * so this only decides what the visitor sees: a short wait, the log in page, or
 * their own dashboard.
 */
export default function RequireAuth({ role, children }: { role: Role; children: ReactNode }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <section className="bg-cream pt-[160px] pb-[120px] min-h-screen">
        <p
          role="status"
          className="text-center font-[family-name:var(--font-body)] text-sm text-charcoal/60"
        >
          Checking your session...
        </p>
      </section>
    );
  }

  if (!user) {
    return <Navigate to="/auth#login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== role) {
    return <Navigate to={dashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
}
