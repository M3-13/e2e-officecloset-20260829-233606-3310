import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiFetch, getToken, setStoredToken } from '../api/client';

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthContextValue {
  token: string | null;
  user: User | null;
  loading: boolean;
  setToken: (token: string | null) => void;
  loadMe: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const setToken = useCallback((next: string | null) => {
    setStoredToken(next);
    setTokenState(next);
  }, []);

  const loadMe = useCallback(async () => {
    const current = getToken();
    if (!current) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await apiFetch<User>('/api/auth/me');
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, [setToken]);

  useEffect(() => {
    void loadMe();
  }, [loadMe]);

  const value = useMemo<AuthContextValue>(
    () => ({ token, user, loading, setToken, loadMe, logout }),
    [token, user, loading, setToken, loadMe, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
