import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { dashboardPath, type Role } from '../lib/authClient';
import DashboardSkeleton from './dashboard/DashboardSkeleton';

/**
 * Route guard for signed in pages. The API checks the session on every request,
 * so this only decides what the visitor sees: a short wait, the log in page, or
 * their own dashboard.
 */
export default function RequireAuth({ role, children }: { role: Role; children: ReactNode }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    // Skeleton loading rather than a line of text on an empty page: the shapes
    // of the real layout say what is coming and the page settles instead of
    // jumping (9.2).
    return <DashboardSkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth#login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== role) {
    return <Navigate to={dashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
}
