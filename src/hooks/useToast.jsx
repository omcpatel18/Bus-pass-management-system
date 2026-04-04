/**
 * BusPassPro — useToast Hook + ToastContainer
 * Lightweight toast notification system
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success("Pass approved!");
 *   toast.error("Payment failed.");
 *   toast.info("Processing...");
 *
 * Add <ToastContainer /> once in your App root.
 */

import { useState, useCallback, createContext, useContext, useRef } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = "info", duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => add(msg, "success"),
    error:   (msg) => add(msg, "error", 6000),
    info:    (msg) => add(msg, "info"),
    warn:    (msg) => add(msg, "warn"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;

  const colorMap = {
    success: { border: "#2D6A4F", bg: "#EDFAF3", text: "#2D6A4F", icon: "✓" },
    error:   { border: "#C0392B", bg: "#FFF0EE", text: "#C0392B", icon: "✕" },
    warn:    { border: "#BC7820", bg: "#FFF8EC", text: "#BC7820", icon: "⚠" },
    info:    { border: "#1A1208", bg: "#F5EFE0", text: "#1A1208", icon: "◆" },
  };

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      display: "flex", flexDirection: "column", gap: 10,
      zIndex: 9999, pointerEvents: "none",
    }}>
      {toasts.map((t) => {
        const c = colorMap[t.type] || colorMap.info;
        return (
          <div key={t.id} onClick={() => onRemove(t.id)} style={{
            background: c.bg, border: `2px solid ${c.border}`,
            padding: "12px 16px", minWidth: 280, maxWidth: 380,
            display: "flex", alignItems: "center", gap: 10,
            pointerEvents: "all", cursor: "pointer",
            animation: "fadeUp .3s ease",
            fontFamily: "'Instrument Sans', sans-serif",
          }}>
            <span style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color: c.text }}>{c.icon}</span>
            <span style={{ fontSize: 13, color: c.text, flex: 1 }}>{t.message}</span>
            <span style={{ fontSize: 11, color: c.border, opacity: 0.6 }}>✕</span>
          </div>
        );
      })}
    </div>
  );
}
