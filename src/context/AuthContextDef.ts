import { createContext } from 'react';
import type { AuthUser, Role } from '../lib/authClient';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

export type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  /** Called after signup or login so the shell updates without a refetch. */
  setUser: (user: AuthUser) => void;
  /** Re-reads the session from the server. Returns the user, or null. */
  refresh: () => Promise<AuthUser | null>;
  /** Clears the session on the server and in the client. */
  signOut: () => Promise<void>;
  hasRole: (role: Role) => boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
