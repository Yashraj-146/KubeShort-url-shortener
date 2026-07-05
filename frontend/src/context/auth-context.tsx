import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { api, type AuthSession } from "../lib/api";
import { clearSession, readSession, writeSession } from "../lib/storage";

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  loginWithGoogleToken: (idToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() =>
    readSession()
  );

  const loginWithGoogleToken = useCallback(async (idToken: string) => {
    const nextSession = await api.googleLogin(idToken);
    writeSession(nextSession);
    setSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      loginWithGoogleToken,
      logout,
    }),
    [loginWithGoogleToken, logout, session]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return value;
}
