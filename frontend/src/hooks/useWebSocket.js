/**
 * BusPassPro — useWebSocket Hook
 * Connects to Django Channels WebSocket for real-time bus tracking
 *
 * Usage:
 *   const { buses, connected, sendLocation } = useWebSocket(routeId);
 *
 * Messages from server:
 *   { type: "initial_positions", data: [...] }
 *   { type: "location_update",   data: { bus_number, latitude, longitude, speed_kmh, stop_name } }
 *
 * Messages to server (conductor):
 *   { type: "location_update", bus_number, latitude, longitude, speed_kmh, stop_name }
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { BASE_URL } from "../services/api";
import { TokenService } from "../services/api";

const WS_BASE = BASE_URL.replace("http", "ws");

export function useWebSocket(routeId = null) {
  const [buses,     setBuses]     = useState([]);
  const [connected, setConnected] = useState(false);
  const [error,     setError]     = useState(null);
  const wsRef       = useRef(null);
  const retryCount  = useRef(0);
  const retryTimer  = useRef(null);

  const connect = useCallback(() => {
    const path    = routeId ? `${WS_BASE}/ws/buses/track/${routeId}/` : `${WS_BASE}/ws/buses/track/`;
    const token   = TokenService.getAccess();
    const url     = token ? `${path}?token=${token}` : path;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
      retryCount.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "initial_positions") {
          setBuses(msg.data);
        } else if (msg.type === "location_update") {
          setBuses((prev) => {
            const exists = prev.find((b) => b.bus_number === msg.data.bus_number);
            if (exists) {
              return prev.map((b) =>
                b.bus_number === msg.data.bus_number ? { ...b, ...msg.data } : b
              );
            }
            return [...prev, msg.data];
          });
        }
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };

    ws.onerror = () => setError("WebSocket connection error");

    ws.onclose = (e) => {
      setConnected(false);
      // Auto-reconnect with exponential backoff (max 30s)
      if (e.code !== 1000) {
        const delay = Math.min(1000 * 2 ** retryCount.current, 30000);
        retryCount.current += 1;
        retryTimer.current = setTimeout(connect, delay);
      }
    };
  }, [routeId]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(retryTimer.current);
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounted");
      }
    };
  }, [connect]);

  /** Conductor: send live GPS update */
  const sendLocation = useCallback((busNumber, latitude, longitude, speedKmh = 0, stopName = "") => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type:       "location_update",
        bus_number: busNumber,
        latitude,
        longitude,
        speed_kmh:  speedKmh,
        stop_name:  stopName,
        timestamp:  new Date().toISOString(),
      }));
    }
  }, []);

  return { buses, connected, error, sendLocation };
}
