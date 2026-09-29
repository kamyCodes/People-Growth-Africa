import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthContext, type AuthStatus } from './AuthContextDef';
import { authRequest, type AuthUser, type Role } from '../lib/authClient';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  // Any failure here (signed out, expired session, network) means the shell
  // should act as signed out rather than block the page.
  const loadSession = useCallback(async (): Promise<AuthUser | null> => {
    const result = await authRequest<{ user: AuthUser }>('/api/auth/me', { method: 'GET' });
    return result.ok ? (result.data.user ?? null) : null;
  }, []);

  const refresh = useCallback(async (): Promise<AuthUser | null> => {
    const next = await loadSession();
    setUser(next);
    setStatus(next ? 'signedIn' : 'signedOut');
    return next;
  }, [loadSession]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const next = await loadSession();
      if (!active) return;
      setUser(next);
      setStatus(next ? 'signedIn' : 'signedOut');
    })();
    return () => {
      active = false;
    };
  }, [loadSession]);

  const signOut = useCallback(async () => {
    await authRequest<{ ok: boolean }>('/api/auth/logout', { method: 'POST', body: {} });
    setUser(null);
    setStatus('signedOut');
  }, []);

  const applyUser = useCallback((next: AuthUser) => {
    setUser(next);
    setStatus('signedIn');
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      setUser: applyUser,
      refresh,
      signOut,
      hasRole: (role: Role) => user?.role === role,
    }),
    [status, user, applyUser, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
