/**
 * BusPassPro — Axios API Client
 * Handles: base URL, JWT attach, silent token refresh, 401 logout
 */

import axios from "axios";

// ── Config ────────────────────────────────────────────────────────────────
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_URL = `${BASE_URL}/api/v1`;

// ── Token helpers ─────────────────────────────────────────────────────────
export const TokenService = {
  getAccess:  ()    => localStorage.getItem("access_token"),
  getRefresh: ()    => localStorage.getItem("refresh_token"),
  setTokens:  (a,r) => { localStorage.setItem("access_token", a); localStorage.setItem("refresh_token", r); },
  clearTokens:()    => { localStorage.removeItem("access_token"); localStorage.removeItem("refresh_token"); localStorage.removeItem("user"); },
  setUser:    (u)   => localStorage.setItem("user", JSON.stringify(u)),
  getUser:    ()    => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } },
};

// ── Axios instance ────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// ── Request interceptor: attach access token ─────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = TokenService.getAccess();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: silent refresh on 401 ──────────────────────────
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const refresh = TokenService.getRefresh();
        if (!refresh) throw new Error("No refresh token");
        const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh });
        TokenService.setTokens(data.access, refresh);
        processQueue(null, data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        TokenService.clearTokens();
        window.location.href = "/";   // force logout
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
