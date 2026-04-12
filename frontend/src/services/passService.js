/**
 * BusPassPro — Pass Service
 * Wraps all /api/v1/passes/ endpoints
 */

import api from "./api";

const PassService = {

  // ── Routes ───────────────────────────────────────────────────────────────

  /** List all active routes */
  getRoutes: async () => {
    const { data } = await api.get("/passes/routes/");
    return data.results ?? data;
  },

  /** Get single route */
  getRoute: async (id) => {
    const { data } = await api.get(`/passes/routes/${id}/`);
    return data;
  },

  /** Admin: create route */
  createRoute: async (payload) => {
    const { data } = await api.post("/passes/routes/", payload);
    return data;
  },

  /** Admin: update route */
  updateRoute: async (id, payload) => {
    const { data } = await api.patch(`/passes/routes/${id}/`, payload);
    return data;
  },

  // ── Applications ─────────────────────────────────────────────────────────

  /** Student: apply for a pass */
  applyForPass: async (payload) => {
    // payload: { route, boarding_stop, duration_type }
    const { data } = await api.post("/passes/applications/", payload);
    return data;
  },

  /** Get applications — filtered by role automatically in backend */
  getApplications: async (status = null) => {
    const params = status ? { status__iexact: status } : {};
    const { data } = await api.get("/passes/applications/", { params });
    return data.results ?? data;
  },

  /** Get single application */
  getApplication: async (id) => {
    const { data } = await api.get(`/passes/applications/${id}/`);
    return data;
  },

  /** Admin: approve application */
  approveApplication: async (id) => {
    const { data } = await api.post(`/passes/applications/${id}/approve/`);
    return data;
  },

  /** Admin: reject application */
  rejectApplication: async (id, note = "") => {
    const { data } = await api.post(`/passes/applications/${id}/reject/`, { note });
    return data;
  },

  // ── Bus Passes ────────────────────────────────────────────────────────────

  /** Student: get my passes */
  getMyPasses: async () => {
    const { data } = await api.get("/passes/my-passes/");
    return data.results ?? data;
  },

  /** Get single pass */
  getPass: async (id) => {
    const { data } = await api.get(`/passes/my-passes/${id}/`);
    return data;
  },

  /** Get QR code URL for a pass */
  getQRCode: async (id) => {
    const { data } = await api.get(`/passes/my-passes/${id}/qr/`);
    return data; // { qr_code_url, pass_number, valid_until }
  },

  // ── QR Scanning ───────────────────────────────────────────────────────────

  /** Conductor: verify a scanned QR token */
  scanQR: async (qr_token, bus_number = "", location = "") => {
    const { data } = await api.post("/passes/scan/", { qr_token, bus_number, location });
    return data; // { result, message, student_name, route, valid_until }
  },
};

export default PassService;
