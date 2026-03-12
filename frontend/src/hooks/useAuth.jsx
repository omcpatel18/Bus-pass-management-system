/**
 * BusPassPro — useAuth Hook
 * Global auth state: login, logout, register, user info
 *
 * Usage:
 *   const { user, login, logout, loading, error } = useAuth();
 */

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import AuthService from "../services/authService";
import { TokenService } from "../services/api";

// ── Context ───────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => TokenService.getUser());
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Hydrate user from token on mount
  useEffect(() => {
    if (TokenService.getAccess() && !user) {
      AuthService.getProfile()
        .then(setUser)
        .catch(() => TokenService.clearTokens());
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true); setError(null);
    try {
      const data = await AuthService.login(email, password);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.non_field_errors?.[0]
                || err.response?.data?.detail
                || "Login failed. Please check your credentials.";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true); setError(null);
    try {
      const data = await AuthService.register(payload);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(" ")
        : "Registration failed.";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try { await AuthService.logout(); } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      isAuthenticated: !!user,
      role: user?.role || null,
      login,
      logout,
      register,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
