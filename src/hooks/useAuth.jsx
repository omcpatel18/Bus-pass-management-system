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

// ── Shared Error Parser ───────────────────────────────────────────────────
export const parseError = (err, fallback = "Action failed. Please try again.") => {
  if (!err.response?.data) return err.message || fallback;
  const data = err.response.data;

  if (typeof data === "string") return data;
  if (data.non_field_errors) return data.non_field_errors[0];
  if (data.detail) return data.detail;

  // Handle field-level errors: { "email": ["already exists"], "password": ["too short"] }
  return Object.entries(data)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
    .join(" | ");
};

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
      const msg = parseError(err, "Login failed. Please check your credentials.");
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
      const msg = parseError(err, "Registration failed.");
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
