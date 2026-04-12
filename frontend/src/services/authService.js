/**
 * BusPassPro — Auth Service
 * Wraps all /api/v1/auth/ endpoints
 */

import api, { TokenService } from "./api";

const AuthService = {

  /** Register new student */
  register: async (payload) => {
    const { data } = await api.post("/auth/register/", payload);
    TokenService.setTokens(data.tokens.access, data.tokens.refresh);
    TokenService.setUser(data.user);
    return data;
  },

  /** Login — returns { user, tokens } */
  login: async (email, password) => {
    const { data } = await api.post("/auth/login/", { email, password });
    TokenService.setTokens(data.tokens.access, data.tokens.refresh);
    TokenService.setUser(data.user);
    return data;
  },

  /** Logout — blacklist refresh token */
  logout: async () => {
    try {
      await api.post("/auth/logout/", { refresh: TokenService.getRefresh() });
    } finally {
      TokenService.clearTokens();
    }
  },

  /** Get current user profile */
  getProfile: async () => {
    const { data } = await api.get("/auth/profile/");
    return data;
  },

  /** Update profile */
  updateProfile: async (payload) => {
    const { data } = await api.patch("/auth/profile/", payload);
    TokenService.setUser(data);
    return data;
  },

  /** Send OTP to email */
  sendOTP: async () => {
    const { data } = await api.post("/auth/send-otp/");
    return data;
  },

  /** Verify OTP */
  verifyOTP: async (otp) => {
    const { data } = await api.post("/auth/verify-otp/", { otp });
    return data;
  },

  /** Change password */
  changePassword: async (old_password, new_password) => {
    const { data } = await api.post("/auth/change-password/", { old_password, new_password });
    return data;
  },

  /** Check if user is authenticated */
  isAuthenticated: () => !!TokenService.getAccess(),

  /** Get cached user */
  getCurrentUser: () => TokenService.getUser(),
};

export default AuthService;
