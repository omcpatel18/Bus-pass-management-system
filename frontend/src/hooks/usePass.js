/**
 * BusPassPro — usePass Hook
 * Fetches and manages student pass data
 *
 * Usage:
 *   const { passes, applications, loading, applyForPass, refetch } = usePass();
 */

import { useState, useEffect, useCallback } from "react";
import PassService from "../services/passService";

export function usePass() {
  const [passes,       setPasses]       = useState([]);
  const [applications, setApplications] = useState([]);
  const [routes,       setRoutes]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [passData, appData, routeData] = await Promise.all([
        PassService.getMyPasses(),
        PassService.getApplications(),
        PassService.getRoutes(),
      ]);
      setPasses(passData);
      setApplications(appData);
      setRoutes(routeData);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load pass data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const applyForPass = useCallback(async (payload) => {
    const newApp = await PassService.applyForPass(payload);
    setApplications((prev) => [newApp, ...prev]);
    return newApp;
  }, []);

  const activePass = passes.find((p) => p.status === "active") || null;

  return {
    passes,
    activePass,
    applications,
    routes,
    loading,
    error,
    refetch: fetchAll,
    applyForPass,
  };
}

/** Hook for admin: all applications with approve/reject actions */
export function useAdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const data = await PassService.getApplications();
      setApplications(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const approve = useCallback(async (id) => {
    const result = await PassService.approveApplication(id);
    setApplications((prev) =>
      prev.map((a) => a.id === id ? { ...a, status: "approved" } : a)
    );
    return result;
  }, []);

  const reject = useCallback(async (id, note) => {
    await PassService.rejectApplication(id, note);
    setApplications((prev) =>
      prev.map((a) => a.id === id ? { ...a, status: "rejected" } : a)
    );
  }, []);

  return { applications, loading, error, approve, reject, refetch: fetchApps };
}
