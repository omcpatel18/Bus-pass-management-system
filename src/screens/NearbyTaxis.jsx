/**
 * ══════════════════════════════════════════════════════════════════════
 *  BUSPASSPRO — TAXI BOOKING
 *  File: src/screens/TaxiBooking.jsx
 *
 *  Full ride-booking feature for college students.
 *
 *  FLOW:
 *  ─────────────────────────────────────────────────────────────────
 *  BOOK tab
 *    1. SEARCH   — set pickup + destination + ride type + schedule
 *    2. CONFIRM  — fare breakdown, driver ETA, payment mode
 *    3. TRACKING — driver assigned card, live countdown, OTP, cancel
 *    4. COMPLETE — receipt, star rating, share/download
 *
 *  MY RIDES tab — full history with status, fare, rating
 *  NEARBY tab   — schematic map of nearby available drivers
 *
 *  ADD TO App.jsx:
 *  ─────────────────────────────────────────────────────────────────
 *  import TaxiBooking from "./screens/TaxiBooking";
 *
 *  In NAV_CONFIG.student:
 *    { label: "TAXI", page: "taxi" }
 *
 *  In SCREENS:
 *    taxi: () => <TaxiBooking />
 * ══════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ── Fonts + CSS tokens (identical to DesignSystem.jsx) ────────────────
const G = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;700&family=Instrument+Sans:wght@400;500;600&display=swap');
:root{
  --cream:#F6F0E4; --surface:#FDFAF3; --parchment:#EDE4CC;
  --ink:#1A1208; --ink-mid:#3D2410;
  --amber:#C8832A; --amber-text:#8B520A; --amber-on-ink:#F0A830;
  --amber-light:#F5D49A; --muted:#6B5535; --rule:#D4C4A0;
  --green:#1E6641; --green-on-ink:#52B788;
  --red:#B02020; --cream-on-ink:#F6F0E4; --muted-on-ink:#B09878;
  --success-bg:#EBF7F0; --error-bg:#FDEAEA; --warn-bg:#FEF7E6;
  --font-display:'Bebas Neue',sans-serif;
  --font-serif:'DM Serif Display',serif;
  --font-mono:'JetBrains Mono',monospace;
  --font-sans:'Instrument Sans',sans-serif;
}
@keyframes fadeUp  {from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn  {from{opacity:0}to{opacity:1}}
@keyframes spin    {to{transform:rotate(360deg)}}
@keyframes shimmer {0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes stampIn {0%{transform:scale(2.2)rotate(-8deg);opacity:0}65%{transform:scale(.92)rotate(2deg);opacity:1}100%{transform:scale(1)rotate(-3deg);opacity:1}}
@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse   {0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.65)}}
@keyframes drivePing{0%{transform:scale(1);opacity:.8}70%{transform:scale(2.2);opacity:0}100%{transform:scale(1);opacity:0}}
@keyframes progressFill{from{width:0%}to{width:var(--target-w)}}
@keyframes tickDown{0%{stroke-dashoffset:0}100%{stroke-dashoffset:283}}
@keyframes carMove {
  0%   {transform:translateX(0px) rotate(0deg)}
  25%  {transform:translateX(6px) rotate(2deg)}
  50%  {transform:translateX(12px) rotate(0deg)}
  75%  {transform:translateX(6px) rotate(-2deg)}
  100% {transform:translateX(0px) rotate(0deg)}
}
`;

// ── Campus locations (shared with rest of app) ────────────────────────
const CAMPUS_STOPS = [
  "College Gate", "North Campus", "Library Sq",
  "Main Market",  "City Centre",  "Tech Park",
  "Ring Road",    "IT Hub",       "Railway Station",
  "East Campus",  "Airport Road", "Bus Terminal",
];

const QUICK_PICKUP = ["College Gate", "Library Sq", "North Campus", "Tech Park"];
const QUICK_DEST   = ["Railway Station", "City Centre", "Airport Road", "Main Market", "IT Hub"];

// ── Ride types ────────────────────────────────────────────────────────
const RIDE_TYPES = [
  {
    id: "auto",
    label: "AUTO",
    desc: "3-Wheeler Rickshaw",
    icon: "🛺",
    rate: 12,        // ₹/km
    base: 30,        // base fare
    capacity: 3,
    eta_base: 4,     // minutes
    features: ["No AC", "Quick & nimble", "Cash/UPI"],
    color: "#C8832A",
    bg: "#FEF7E6",
  },
  {
    id: "economy",
    label: "ECONOMY",
    desc: "AC Sedan",
    icon: "🚗",
    rate: 16,
    base: 50,
    capacity: 4,
    eta_base: 6,
    features: ["AC", "4 seats", "Verified driver"],
    color: "#1E6641",
    bg: "#EBF7F0",
  },
  {
    id: "premium",
    label: "PREMIUM",
    desc: "AC SUV",
    icon: "🚙",
    rate: 24,
    base: 80,
    capacity: 6,
    eta_base: 8,
    features: ["AC", "6 seats", "Top-rated drivers", "Luggage space"],
    color: "#1A1208",
    bg: "#F6F0E4",
  },
  {
    id: "shared",
    label: "SHARED",
    desc: "Pooled Ride",
    icon: "🚌",
    rate: 8,
    base: 20,
    capacity: 4,
    eta_base: 10,
    features: ["AC", "Split fare", "Eco-friendly", "Minor detours"],
    color: "#6B5535",
    bg: "#F6F0E4",
  },
];

// ── Payment methods ───────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: "upi",     label: "UPI",          icon: "⚡", sub: "Google Pay / PhonePe / BHIM" },
  { id: "card",    label: "CARD",         icon: "💳", sub: "Debit or Credit card"          },
  { id: "cash",    label: "CASH",         icon: "💵", sub: "Pay driver directly"            },
  { id: "wallet",  label: "BPP WALLET",   icon: "👝", sub: "Balance: ₹320"                  },
];

// ── Mock ride history ─────────────────────────────────────────────────
const MOCK_HISTORY = [
  { id: "TXN-8821", date: "02 Mar 2024", time: "08:12", from: "College Gate", to: "Railway Station", type: "economy",  fare: 182, km: 8.2,  status: "COMPLETED", rating: 5, driver: "Vikram S.",    vehicle: "Hyundai i20 · KA-05-MN-2234" },
  { id: "TXN-8810", date: "01 Mar 2024", time: "17:45", from: "Library Sq",   to: "City Centre",     type: "auto",     fare: 86,  km: 4.7,  status: "COMPLETED", rating: 4, driver: "Rajan A.",      vehicle: "Auto · KA-02-TN-9901"         },
  { id: "TXN-8795", date: "28 Feb 2024", time: "09:00", from: "College Gate", to: "Airport Road",    type: "premium",  fare: 340, km: 11.5, status: "COMPLETED", rating: 5, driver: "Anand M.",      vehicle: "Toyota Innova · KA-04-AB-1122" },
  { id: "TXN-8781", date: "26 Feb 2024", time: "11:30", from: "Tech Park",    to: "Main Market",     type: "shared",   fare: 52,  km: 3.8,  status: "COMPLETED", rating: 3, driver: "Suresh K.",     vehicle: "Maruti Swift · KA-09-QR-5566"  },
  { id: "TXN-8762", date: "24 Feb 2024", time: "18:22", from: "IT Hub",       to: "Ring Road",       type: "auto",     fare: 48,  km: 2.9,  status: "CANCELLED", rating: 0, driver: "—",             vehicle: "—"                             },
];

// ── Mock nearby drivers (for schematic view) ─────────────────────────
const NEARBY_DRIVERS = [
  { id: 1, name: "Vikram",   type: "economy", x: 32,  y: 28,  eta: 3,  rating: 4.9 },
  { id: 2, name: "Rajan",    type: "auto",    x: 58,  y: 45,  eta: 5,  rating: 4.7 },
  { id: 3, name: "Anand",    type: "premium", x: 18,  y: 62,  eta: 7,  rating: 5.0 },
  { id: 4, name: "Suresh",   type: "economy", x: 72,  y: 30,  eta: 6,  rating: 4.5 },
  { id: 5, name: "Mohan",    type: "auto",    x: 44,  y: 72,  eta: 4,  rating: 4.8 },
  { id: 6, name: "Pradeep",  type: "shared",  x: 82,  y: 58,  eta: 9,  rating: 4.6 },
  { id: 7, name: "Kiran",    type: "economy", x: 22,  y: 40,  eta: 8,  rating: 4.4 },
];

// ── Shared atoms ──────────────────────────────────────────────────────
const Tag = ({ children }) => (
  <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 4, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>{children}</div>
);
const Rule = ({ my = 20 }) => <div style={{ height: 1, background: "var(--rule)", margin: `${my}px 0` }} />;

const Pill = ({ s, small }) => {
  const m = { COMPLETED: { bg: "#1E6641", c: "#F6F0E4" }, ACTIVE: { bg: "#1E6641", c: "#F6F0E4" }, CANCELLED: { bg: "#B02020", c: "#F6F0E4" }, PENDING: { bg: "#C8832A", c: "#1A1208" }, "EN ROUTE": { bg: "#C8832A", c: "#1A1208" }, ARRIVED: { bg: "#1E6641", c: "#F6F0E4" }, "IN TRIP": { bg: "#1A1208", c: "#F0A830" } };
  const p = m[(s || "").toUpperCase()] || { bg: "#6B5535", c: "#F6F0E4" };
  return <span style={{ background: p.bg, color: p.c, fontFamily: "var(--font-mono)", fontSize: small ? 7 : 9, fontWeight: 700, letterSpacing: 2, padding: small ? "2px 8px" : "3px 10px", clipPath: "polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)", display: "inline-block", lineHeight: 1.7 }}>{(s || "").toUpperCase()}</span>;
};

const Btn = ({ children, onClick, variant = "primary", size = "md", full = false, disabled = false }) => {
  const [h, setH] = useState(false);
  const pad = { sm: "7px 16px", md: "11px 26px", lg: "14px 36px" }[size] || "11px 26px";
  const fs  = { sm: 11, md: 13, lg: 16 }[size] || 13;
  const s = {
    primary:   { bg: h && !disabled ? "#2C1E0A" : "var(--ink)",          c: "var(--amber-on-ink)", b: "none"                           },
    secondary: { bg: h && !disabled ? "var(--parchment)" : "transparent", c: "var(--ink)",          b: "1.5px solid var(--ink)"         },
    danger:    { bg: h && !disabled ? "#8A1818" : "var(--red)",           c: "var(--cream-on-ink)", b: "none"                           },
    success:   { bg: h && !disabled ? "#155230" : "var(--green)",         c: "var(--cream-on-ink)", b: "none"                           },
    ghost:     { bg: h && !disabled ? "var(--parchment)" : "transparent", c: "var(--amber-text)",   b: "1.5px solid var(--rule)"        },
    amber:     { bg: h && !disabled ? "#7A4206" : "var(--amber-text)",    c: "var(--cream-on-ink)", b: "none"                           },
  }[variant] || {};
  return <button onClick={onClick} disabled={disabled} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
    style={{ padding: pad, background: s.bg, color: s.c, border: s.b || "none", fontFamily: "var(--font-display)", fontSize: fs, letterSpacing: 2, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1, width: full ? "100%" : "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .18s" }}
  >{children}</button>;
};

const Spinner = ({ size = 18, color = "var(--amber)" }) => (
  <div style={{ width: size, height: size, border: `2px solid rgba(200,131,42,.25)`, borderTop: `2px solid ${color}`, borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block", flexShrink: 0 }} />
);

// ── Local toast ───────────────────────────────────────────────────────
function useToast() {
  const [ts, setTs] = useState([]);
  const add = useCallback((msg, type = "info") => {
    const id = Date.now();
    setTs(t => [...t, { id, msg, type }]);
    setTimeout(() => setTs(t => t.filter(x => x.id !== id)), type === "error" ? 6000 : 3500);
  }, []);
  const C = { success: { bg: "var(--success-bg)", b: "var(--green)",      t: "var(--green)",      i: "✓" }, error: { bg: "var(--error-bg)", b: "var(--red)", t: "var(--red)", i: "✕" }, info: { bg: "var(--surface)", b: "var(--ink)", t: "var(--ink)", i: "◆" }, warn: { bg: "var(--warn-bg)", b: "var(--amber-text)", t: "var(--amber-text)", i: "⚠" } };
  const Toaster = () => (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {ts.map(t => { const c = C[t.type] || C.info; return <div key={t.id} style={{ background: c.bg, border: `2px solid ${c.b}`, padding: "11px 16px", minWidth: 280, display: "flex", gap: 10, alignItems: "center", animation: "slideDown .3s ease", boxShadow: "0 4px 20px rgba(26,18,8,.12)" }}><span style={{ fontFamily: "var(--font-display)", fontSize: 18, color: c.t }}>{c.i}</span><span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: c.t }}>{t.msg}</span></div>; })}
    </div>
  );
  return { success: m => add(m, "success"), error: m => add(m, "error"), info: m => add(m, "info"), warn: m => add(m, "warn"), Toaster };
}

// ══════════════════════════════════════════════════════════════════════
//  STOP SEARCH — typeahead input replacing <select> dropdowns
// ══════════════════════════════════════════════════════════════════════
function StopSearch({ value, onChange, placeholder, exclude = [], label, labelColor = "var(--muted)" }) {
  const [query,  setQuery]  = useState(value || "");
  const [open,   setOpen]   = useState(false);
  const [cursor, setCursor] = useState(-1);
  const wrapRef  = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { setQuery(value || ""); }, [value]);

  const pool = CAMPUS_STOPS.filter(s => !exclude.includes(s));
  const filtered = query.trim().length === 0
    ? pool
    : pool.filter(s => s.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    const h = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const select = stop => { setQuery(stop); setOpen(false); setCursor(-1); onChange(stop); };

  const handleKey = e => {
    if (e.key === "ArrowDown")  { e.preventDefault(); setOpen(true); setCursor(c => Math.min(c + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp")   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    else if (e.key === "Enter"  && cursor >= 0 && filtered[cursor]) { select(filtered[cursor]); }
    else if (e.key === "Escape")    { setOpen(false); }
  };

  const highlight = text => {
    const q = query.trim();
    if (!q) return <span style={{ color: "var(--ink)" }}>{text}</span>;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return <span style={{ color: "var(--muted)" }}>{text}</span>;
    return (
      <span style={{ color: "var(--muted)" }}>
        {text.slice(0, idx)}
        <span style={{ color: "var(--ink)", fontWeight: 700, background: "var(--amber-light)", padding: "0 1px" }}>{text.slice(idx, idx + q.length)}</span>
        {text.slice(idx + q.length)}
      </span>
    );
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      {label && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 4, color: labelColor, marginBottom: 6, textTransform: "uppercase" }}>{label}</div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input ref={inputRef} value={query} placeholder={placeholder || "Type a stop name…"}
          onChange={e => { setQuery(e.target.value); setOpen(true); setCursor(-1); if (!e.target.value) onChange(""); }}
          onFocus={() => setOpen(true)} onKeyDown={handleKey}
          style={{ flex: 1, background: "transparent", border: "none", fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--ink)", outline: "none", fontWeight: value ? 500 : 400, minWidth: 0 }} />
        {query
          ? <button onClick={() => { setQuery(""); onChange(""); inputRef.current?.focus(); setOpen(true); }}
              style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 16, lineHeight: 1, cursor: "pointer", flexShrink: 0, padding: 0 }}>×</button>
          : <span style={{ color: "var(--muted)", fontSize: 10, flexShrink: 0, pointerEvents: "none" }}>▾</span>
        }
      </div>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 12px)", left: -18, right: -18, background: "var(--surface)", border: "2px solid var(--ink)", zIndex: 600, maxHeight: 256, overflowY: "auto", animation: "slideDown .15s ease", boxShadow: "0 10px 32px rgba(26,18,8,.14)" }}>
          <div style={{ padding: "8px 14px 6px", borderBottom: "1px solid var(--rule)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)" }}>
              {query.trim() ? `${filtered.length} RESULT${filtered.length !== 1 ? "S" : ""}` : "ALL STOPS"}
            </span>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer", padding: 0 }}>✕</button>
          </div>
          {filtered.length === 0 && (
            <div style={{ padding: "18px 14px", fontFamily: "var(--font-serif)", fontSize: 14, color: "var(--muted)", fontStyle: "italic" }}>No stops match "{query}"</div>
          )}
          {filtered.map((stop, i) => (
            <div key={stop} onMouseDown={e => { e.preventDefault(); select(stop); }} onMouseEnter={() => setCursor(i)}
              style={{ padding: "11px 14px", cursor: "pointer", background: i === cursor ? "var(--parchment)" : "transparent", borderBottom: "1px solid var(--rule)", display: "flex", alignItems: "center", gap: 10, transition: "background .1s" }}>
              <span style={{ fontSize: 9, color: stop === value ? "var(--green)" : "var(--amber)", flexShrink: 0 }}>◉</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, flex: 1 }}>{highlight(stop)}</span>
              {stop === value && <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--green)", flexShrink: 0 }}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Fare calculator ───────────────────────────────────────────────────
function calcFare(type, from, to) {
  const i1 = CAMPUS_STOPS.indexOf(from);
  const i2 = CAMPUS_STOPS.indexOf(to);
  const idxDiff = Math.abs(i1 - i2);
  const km = idxDiff <= 0 ? 2 : idxDiff * 2.2 + 1.5;
  const fare = Math.round(type.base + km * type.rate);
  return { km: km.toFixed(1), fare, surge: km > 10 ? 1.2 : 1.0, eta: type.eta_base + Math.floor(km / 4) };
}

// ── Star rating ───────────────────────────────────────────────────────
function Stars({ value, onChange, size = 22 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange?.(n)} onMouseEnter={() => onChange && setHover(n)} onMouseLeave={() => setHover(0)}
          style={{ background: "none", border: "none", fontSize: size, lineHeight: 1, cursor: onChange ? "pointer" : "default", color: n <= (hover || value) ? "#C8832A" : "#D4C4A0", transition: "color .15s" }}>★</button>
      ))}
    </div>
  );
}

// ── OTP display ───────────────────────────────────────────────────────
function OTPDisplay({ otp }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {otp.split("").map((d, i) => (
        <div key={i} style={{ width: 36, height: 44, background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 22, color: "var(--amber-on-ink)", letterSpacing: 1 }}>{d}</div>
      ))}
    </div>
  );
}

// ── SVG Car icon ──────────────────────────────────────────────────────
function CarIcon({ size = 28, color = "#1A1208" }) {
  return (
    <svg width={size} height={size * 0.55} viewBox="0 0 48 28" fill="none" style={{ animation: "carMove 2s ease-in-out infinite" }}>
      <rect x="4" y="10" width="40" height="14" rx="2" fill={color} />
      <path d="M10 10 L14 4 L34 4 L38 10" fill={color} />
      <circle cx="11" cy="24" r="4" fill="#F6F0E4" stroke={color} strokeWidth="2" />
      <circle cx="37" cy="24" r="4" fill="#F6F0E4" stroke={color} strokeWidth="2" />
      <rect x="7" y="12" width="8" height="5" rx="1" fill="#F0A830" opacity="0.7" />
      <rect x="17" y="12" width="14" height="5" rx="1" fill="#F0A830" opacity="0.5" />
      <rect x="33" y="12" width="8" height="5" rx="1" fill="#F0A830" opacity="0.7" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  PHASE 1 — SEARCH
//  Pickup, destination, ride type, schedule
// ═══════════════════════════════════════════════════════════════════════
function SearchPhase({ onConfirm }) {
  const [pickup,   setPickup]   = useState("College Gate");
  const [dest,     setDest]     = useState("");
  const [rideType, setRideType] = useState("economy");
  const [schedMode, setSchedMode] = useState("now"); // "now" | "later"
  const [schedTime, setSchedTime] = useState("");
  const [destErr,  setDestErr]  = useState("");

  const sel = RIDE_TYPES.find(r => r.id === rideType);
  const canCalc = pickup && dest && pickup !== dest;
  const calc = canCalc ? calcFare(sel, pickup, dest) : null;

  const handleBook = () => {
    if (!dest) { setDestErr("Please enter a destination."); return; }
    if (dest === pickup) { setDestErr("Pickup and destination cannot be the same."); return; }
    setDestErr("");
    onConfirm({ pickup, dest, rideType, schedMode, schedTime, calc, sel });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 28, alignItems: "start", animation: "fadeUp .35s ease" }}>

      {/* Left — inputs + ride types */}
      <div>
        {/* Location inputs */}
        <div style={{ border: "1.5px solid var(--ink)", background: "var(--surface)", marginBottom: 20 }}>
          {/* Pickup */}
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--rule)" }}>
            <StopSearch
              value={pickup}
              onChange={val => { if (val) setPickup(val); }}
              placeholder="Your pickup location…"
              exclude={dest ? [dest] : []}
              label="◉ PICKUP"
              labelColor="var(--green)"
            />
          </div>

          {/* Swap button */}
          <div style={{ position: "relative", height: 0 }}>
            <button onClick={() => { const t = pickup; setPickup(dest || pickup); setDest(t); }}
              style={{ position: "absolute", right: 18, top: -16, width: 32, height: 32, borderRadius: "50%", background: "var(--ink)", border: "2px solid var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2 }}>
              <span style={{ color: "var(--amber-on-ink)", fontSize: 14, lineHeight: 1 }}>⇅</span>
            </button>
          </div>

          {/* Destination */}
          <div style={{ padding: "14px 18px" }}>
            <StopSearch
              value={dest}
              onChange={val => { setDest(val); setDestErr(""); }}
              placeholder="Where are you going?"
              exclude={pickup ? [pickup] : []}
              label="◉ DESTINATION"
              labelColor="var(--red)"
            />
          </div>
        </div>
        {destErr && <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--red)", marginTop: -14, marginBottom: 12 }}>{destErr}</div>}

        {/* Quick destination chips */}
        <div style={{ marginBottom: 24 }}>
          <Tag>Quick Destinations</Tag>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {QUICK_DEST.map(s => (
              <button key={s} onClick={() => { setDest(s); setDestErr(""); }}
                style={{ padding: "6px 14px", background: dest === s ? "var(--ink)" : "var(--parchment)", color: dest === s ? "var(--amber-on-ink)" : "var(--ink)", border: `1.5px solid ${dest === s ? "var(--ink)" : "var(--rule)"}`, fontFamily: "var(--font-sans)", fontSize: 12, cursor: "pointer", transition: "all .18s" }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Ride type selection */}
        <Tag>Choose Ride Type</Tag>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
          {RIDE_TYPES.map(r => {
            const f = canCalc ? calcFare(r, pickup, dest) : null;
            const active = rideType === r.id;
            return (
              <div key={r.id} onClick={() => setRideType(r.id)} style={{ border: `2px solid ${active ? "var(--ink)" : "var(--rule)"}`, padding: "16px 18px", cursor: "pointer", background: active ? "var(--ink)" : r.bg, transition: "all .18s", position: "relative" }}>
                {/* Type header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 24, lineHeight: 1, marginBottom: 4 }}>{r.icon}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 17, letterSpacing: 2, color: active ? "var(--amber-on-ink)" : "var(--ink)", lineHeight: 1 }}>{r.label}</div>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: active ? "var(--muted-on-ink)" : "var(--muted)", marginTop: 2 }}>{r.desc}</div>
                  </div>
                  {f && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: 1, color: active ? "var(--cream-on-ink)" : "var(--ink)", lineHeight: 1 }}>₹{f.fare}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 1, color: active ? "var(--muted-on-ink)" : "var(--muted)", marginTop: 2 }}>{f.eta} MIN</div>
                    </div>
                  )}
                  {!f && (
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1, color: active ? "var(--muted-on-ink)" : "var(--muted)" }}>₹{r.rate}/km</div>
                  )}
                </div>
                {/* Features */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {r.features.map(ft => (
                    <span key={ft} style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 1, color: active ? "var(--muted-on-ink)" : "var(--amber-text)", background: active ? "rgba(255,255,255,.08)" : "rgba(200,131,42,.1)", padding: "2px 7px" }}>{ft}</span>
                  ))}
                </div>
                {/* Capacity */}
                <div style={{ position: "absolute", bottom: 12, right: 14, fontFamily: "var(--font-mono)", fontSize: 7, color: active ? "var(--muted-on-ink)" : "var(--muted)", letterSpacing: 2 }}>👤 {r.capacity}</div>
              </div>
            );
          })}
        </div>

        {/* Schedule toggle */}
        <div style={{ marginBottom: 20 }}>
          <Tag>When</Tag>
          <div style={{ display: "flex", border: "1.5px solid var(--ink)", width: "fit-content" }}>
            {[["now", "NOW"], ["later", "SCHEDULE"]].map(([v, l]) => (
              <button key={v} onClick={() => setSchedMode(v)} style={{ padding: "9px 24px", background: schedMode === v ? "var(--ink)" : "transparent", color: schedMode === v ? "var(--amber-on-ink)" : "var(--muted)", border: "none", borderRight: v === "now" ? "1px solid var(--ink)" : "none", fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2, cursor: "pointer", transition: "all .18s" }}>{l}</button>
            ))}
          </div>
          {schedMode === "later" && (
            <input type="datetime-local" value={schedTime} onChange={e => setSchedTime(e.target.value)}
              style={{ marginTop: 10, padding: "10px 14px", border: "1.5px solid var(--rule)", background: "var(--cream)", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", outline: "none", display: "block" }} />
          )}
        </div>
      </div>

      {/* Right — fare estimate card + book button */}
      <div style={{ position: "sticky", top: 80 }}>
        {/* Fare estimate */}
        <div style={{ border: "1.5px solid var(--rule)", background: "var(--surface)", padding: "22px 22px", marginBottom: 14 }}>
          <Tag>Fare Estimate</Tag>

          {!canCalc ? (
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 15, color: "var(--muted)", fontStyle: "italic", padding: "12px 0" }}>Select pickup and destination to see fare.</div>
          ) : (
            <>
              {/* Route summary */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, padding: "12px 14px", background: "var(--parchment)", border: "1px solid var(--rule)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{pickup}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2, color: "var(--muted)", margin: "4px 0" }}>↓ {calc.km} km</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{dest}</div>
                </div>
                <CarIcon size={32} />
              </div>

              {/* Breakdown */}
              {[
                ["Base fare",           `₹${sel.base}`],
                [`Distance (${calc.km} km × ₹${sel.rate})`, `₹${Math.round(parseFloat(calc.km) * sel.rate)}`],
                calc.surge > 1 && ["Surge (1.2×)", `+₹${Math.round(calc.fare * 0.17)}`],
                ["Estimated ETA",       `${calc.eta} min`],
              ].filter(Boolean).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--rule)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1, color: "var(--muted)" }}>{k}</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink)", fontWeight: 500 }}>{v}</span>
                </div>
              ))}

              {/* Total */}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 2px" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 2, color: "var(--ink)" }}>TOTAL</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 1, color: "var(--ink)" }}>₹{calc.fare}</span>
              </div>
              {calc.surge > 1 && <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--amber-text)", marginTop: 4 }}>⚡ Surge pricing active — high demand area</div>}

              {/* Ride type badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                <span style={{ fontSize: 18 }}>{sel.icon}</span>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: 2, color: "var(--ink)" }}>{sel.label}</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)" }}>{sel.desc}</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Schedule indicator */}
        {schedMode === "later" && schedTime && (
          <div style={{ padding: "10px 14px", background: "var(--parchment)", border: "1.5px solid var(--ink)", marginBottom: 14, fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2, color: "var(--ink)" }}>
            ◷ SCHEDULED FOR: {new Date(schedTime).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </div>
        )}

        {/* Book button */}
        <Btn variant="primary" full size="lg" onClick={handleBook} disabled={!canCalc}>
          {schedMode === "later" ? "SCHEDULE RIDE →" : `BOOK RIDE${calc ? ` — ₹${calc.fare}` : ""} →`}
        </Btn>

        <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)", marginTop: 10, textAlign: "center" }}>
          FARE IS ESTIMATED · FINAL AMOUNT MAY VARY
        </div>

        {/* Safety note */}
        <div style={{ marginTop: 16, padding: "12px 14px", border: "1px solid var(--rule)", background: "var(--parchment)" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)", marginBottom: 4 }}>SAFETY</div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>All drivers are verified by the college transport office. Share your ride OTP only with the assigned driver.</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  PHASE 2 — CONFIRM
//  Full fare breakdown + payment method selection
// ═══════════════════════════════════════════════════════════════════════
function ConfirmPhase({ booking, onBack, onConfirm }) {
  const [payment, setPayment] = useState("upi");
  const [confirming, setConfirming] = useState(false);
  const { pickup, dest, calc, sel, schedMode, schedTime } = booking;

  const confirm = async () => {
    setConfirming(true);
    await new Promise(r => setTimeout(r, 1200));
    setConfirming(false);
    onConfirm({ ...booking, payment, otp: String(Math.floor(1000 + Math.random() * 9000)), txnId: `TXN-${Date.now().toString().slice(-4)}` });
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", animation: "fadeUp .35s ease" }}>
      <Tag>Confirm Booking</Tag>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--ink)", marginBottom: 22, lineHeight: 1.1 }}>Review your ride</div>

      {/* Route strip */}
      <div style={{ background: "var(--ink)", padding: "20px 22px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--green-on-ink)", marginBottom: 4 }}>◉ FROM</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: 1, color: "var(--cream-on-ink)" }}>{pickup}</div>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--amber-on-ink)" }}>→</div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--red-on-ink)", marginBottom: 4 }}>◉ TO</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: 1, color: "var(--cream-on-ink)" }}>{dest}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
          {[[sel.icon + " " + sel.label, sel.desc], [calc.km + " KM", "Distance"], ["₹" + calc.fare, "Est. fare"], [calc.eta + " MIN", "ETA"]].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: 1, color: "var(--amber-on-ink)", lineHeight: 1 }}>{v}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted-on-ink)", marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment */}
      <Tag>Payment Method</Tag>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
        {PAYMENT_METHODS.map(m => (
          <div key={m.id} onClick={() => setPayment(m.id)} style={{ border: `2px solid ${payment === m.id ? "var(--ink)" : "var(--rule)"}`, padding: "14px 16px", cursor: "pointer", background: payment === m.id ? "var(--parchment)" : "var(--surface)", transition: "all .18s", display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 20 }}>{m.icon}</span>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: 2, color: "var(--ink)" }}>{m.label}</div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{m.sub}</div>
            </div>
            {payment === m.id && <span style={{ marginLeft: "auto", fontFamily: "var(--font-display)", fontSize: 14, color: "var(--green)" }}>✓</span>}
          </div>
        ))}
      </div>

      {/* Schedule info */}
      {schedMode === "later" && schedTime && (
        <div style={{ padding: "12px 16px", background: "var(--warn-bg)", border: "1.5px solid var(--amber)", marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 3, color: "var(--amber-text)" }}>◷ SCHEDULED RIDE</div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", marginTop: 4 }}>{new Date(schedTime).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}</div>
        </div>
      )}

      {/* Final total */}
      <div style={{ border: "2px solid var(--ink)", padding: "16px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 3, color: "var(--muted)" }}>TOTAL PAYABLE</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: 1, color: "var(--ink)", lineHeight: 1 }}>₹{calc.fare}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2, color: "var(--muted)" }}>VIA</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: 2, color: "var(--ink)" }}>{PAYMENT_METHODS.find(m => m.id === payment)?.label}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="secondary" size="md" onClick={onBack}>← EDIT</Btn>
        <Btn variant="primary" full size="lg" onClick={confirm} disabled={confirming}>
          {confirming ? <><Spinner size={18} /> FINDING DRIVER…</> : `CONFIRM & ${schedMode === "later" ? "SCHEDULE" : "BOOK"} →`}
        </Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  PHASE 3 — TRACKING
//  Driver assigned, live ETA, OTP, cancel
// ═══════════════════════════════════════════════════════════════════════
const MOCK_DRIVERS = [
  { name: "Vikram Singh",  initials: "VS", phone: "+91 98765 43210", rating: 4.9, trips: 1248, vehicle: "Hyundai i20", plate: "KA-05-MN-2234", color: "#C8832A" },
  { name: "Rajan Kumar",   initials: "RK", phone: "+91 87654 32109", rating: 4.7, trips: 876,  vehicle: "Maruti Swift",  plate: "KA-02-QR-8871", color: "#1E6641" },
  { name: "Anand Murthy",  initials: "AM", phone: "+91 76543 21098", rating: 5.0, trips: 2103, vehicle: "Toyota Innova", plate: "KA-04-AB-1122", color: "#1A1208" },
];

const TRIP_STAGES = ["DRIVER ASSIGNED", "EN ROUTE TO YOU", "DRIVER ARRIVED", "IN TRIP", "COMPLETED"];

function TrackingPhase({ booking, onComplete, onCancel }) {
  const driver = MOCK_DRIVERS.find(d => d.name.includes(booking.rideType === "premium" ? "Anand" : booking.rideType === "auto" ? "Rajan" : "Vikram")) || MOCK_DRIVERS[0];
  const [stage, setStage]     = useState(0);
  const [eta,   setEta]       = useState(booking.calc.eta);
  const [elapsed, setElapsed] = useState(0);
  const [cancelling, setCancelling] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  // Auto-advance stages
  useEffect(() => {
    const intervals = [5000, 8000, 5000, 12000]; // ms between stage advances
    let t;
    const advance = (s) => {
      if (s >= TRIP_STAGES.length - 1) return;
      t = setTimeout(() => { setStage(s + 1); advance(s + 1); }, intervals[s] || 5000);
    };
    advance(stage);
    return () => clearTimeout(t);
  }, []);

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => {
      setEta(e => Math.max(0, e - 1));
      setElapsed(e => e + 1);
    }, 60000 / booking.calc.eta); // simulate 1 min per eta tick
    return () => clearInterval(t);
  }, []);

  // Trigger complete
  useEffect(() => {
    if (stage === TRIP_STAGES.length - 1) {
      setTimeout(() => onComplete(driver), 2500);
    }
  }, [stage]);

  const cancelRide = async () => {
    if (stage >= 2) return; // can't cancel once arrived
    setCancelling(true);
    await new Promise(r => setTimeout(r, 800));
    onCancel();
  };

  const stageColor = ["var(--amber-text)", "var(--amber-text)", "var(--green)", "var(--ink)", "var(--green)"][stage];

  return (
    <div style={{ maxWidth: 580, margin: "0 auto", animation: "fadeUp .35s ease" }}>

      {/* Stage progress */}
      <div style={{ background: "var(--ink)", padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 4, color: "var(--muted-on-ink)", marginBottom: 8 }}>RIDE STATUS</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 2, color: "var(--amber-on-ink)", marginBottom: 16 }}>{TRIP_STAGES[stage]}</div>
        {/* Progress bar */}
        <div style={{ display: "flex", gap: 4 }}>
          {TRIP_STAGES.map((s, i) => (
            <div key={s} style={{ flex: 1, height: 3, background: i <= stage ? "var(--amber-on-ink)" : "rgba(255,255,255,.15)", transition: "background .4s" }} />
          ))}
        </div>
        {/* Car animation */}
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <CarIcon size={32} color="#F0A830" />
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: "var(--muted-on-ink)" }}>
            {stage < 2 ? `${eta > 0 ? eta : "<1"} MIN AWAY` : stage === 2 ? "DRIVER IS HERE" : stage === 3 ? "ON YOUR WAY" : "ARRIVED SAFELY"}
          </div>
        </div>
      </div>

      {/* Driver card */}
      <div style={{ border: "1.5px solid var(--rule)", background: "var(--surface)", padding: "20px 22px", marginBottom: 16 }}>
        <Tag>Your Driver</Tag>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          {/* Avatar */}
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: driver.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 20, color: driver.color === "#1A1208" ? "var(--amber-on-ink)" : "var(--cream-on-ink)" }}>{driver.initials}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)", marginBottom: 2 }}>{driver.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Stars value={Math.floor(driver.rating)} size={14} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2, color: "var(--muted)" }}>{driver.rating} · {driver.trips.toLocaleString()} TRIPS</span>
            </div>
          </div>
          {/* Call button */}
          <a href={`tel:${driver.phone}`} style={{ padding: "8px 16px", background: "var(--green)", color: "var(--cream-on-ink)", fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: 2, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>📞 CALL</a>
        </div>
        {/* Vehicle info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px" }}>
          {[["VEHICLE", driver.vehicle], ["PLATE NO.", driver.plate], ["ROUTE", `${booking.pickup} → ${booking.dest}`], ["FARE", `₹${booking.calc.fare}`]].map(([l, v]) => (
            <div key={l} style={{ borderBottom: "1px solid var(--rule)", padding: "7px 0" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)" }}>{l}</div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* OTP */}
      <div style={{ border: "2px solid var(--amber)", background: "var(--warn-bg)", padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 4, color: "var(--amber-text)", marginBottom: 10 }}>SHARE THIS OTP WITH YOUR DRIVER</div>
        <OTPDisplay otp={booking.otp} />
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", marginTop: 10, lineHeight: 1.6 }}>
          Do <strong>not</strong> share this OTP until the driver physically arrives at your location.
        </div>
      </div>

      {/* Cancel */}
      {stage < 2 && (
        <div>
          {!showCancel ? (
            <Btn variant="ghost" size="sm" onClick={() => setShowCancel(true)}>CANCEL RIDE</Btn>
          ) : (
            <div style={{ border: "1.5px solid var(--red)", padding: "14px 16px", background: "var(--error-bg)" }}>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--red)", marginBottom: 12 }}>Cancellation fee of ₹20 may apply. Are you sure?</div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="danger" size="sm" onClick={cancelRide} disabled={cancelling}>{cancelling ? "CANCELLING…" : "YES, CANCEL"}</Btn>
                <Btn variant="ghost"  size="sm" onClick={() => setShowCancel(false)}>KEEP RIDE</Btn>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completing overlay */}
      {stage === TRIP_STAGES.length - 1 && (
        <div style={{ textAlign: "center", padding: "20px 0", animation: "fadeIn .3s ease" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 3, color: "var(--green)", animation: "stampIn .5s ease" }}>✓ RIDE COMPLETE</div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", marginTop: 6 }}>Loading receipt…</div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  PHASE 4 — COMPLETED
//  Receipt + star rating + share
// ═══════════════════════════════════════════════════════════════════════
function CompletedPhase({ booking, driver, onNewRide, toast }) {
  const [rating, setRating] = useState(0);
  const [rated, setRated]   = useState(false);
  const [comment, setComment] = useState("");

  const submitRating = async () => {
    if (!rating) { toast.warn("Please give a star rating."); return; }
    await new Promise(r => setTimeout(r, 500));
    setRated(true);
    toast.success("Thanks for your feedback!");
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", animation: "fadeUp .4s ease" }}>
      {/* Big success stamp */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ display: "inline-block", border: "4px solid var(--green)", padding: "8px 24px", transform: "rotate(-3deg)", animation: "stampIn .5s ease" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 42, letterSpacing: 4, color: "var(--green)", lineHeight: 1 }}>RIDE DONE!</div>
        </div>
      </div>

      {/* Receipt */}
      <div style={{ border: "1.5px solid var(--ink)", background: "var(--surface)", overflow: "hidden", marginBottom: 20 }}>
        {/* Header */}
        <div style={{ background: "var(--ink)", padding: "16px 20px", display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 4, color: "var(--muted-on-ink)" }}>RECEIPT</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 2, color: "var(--amber-on-ink)" }}>{booking.txnId}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted-on-ink)" }}>AMOUNT PAID</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 1, color: "var(--cream-on-ink)" }}>₹{booking.calc.fare}</div>
          </div>
        </div>
        {/* Body */}
        <div style={{ padding: "18px 20px" }}>
          {[
            ["Route",     `${booking.pickup} → ${booking.dest}`],
            ["Ride type", booking.sel.label + " · " + booking.sel.desc],
            ["Distance",  booking.calc.km + " km"],
            ["Driver",    driver.name + " · " + driver.plate],
            ["Payment",   PAYMENT_METHODS.find(m => m.id === booking.payment)?.label || "—"],
            ["Date/Time", new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })],
          ].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--rule)" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2, color: "var(--muted)" }}>{l}</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
        {/* Barcode decoration */}
        <div style={{ padding: "12px 20px", borderTop: "1px dashed var(--rule)", display: "flex", gap: 1, alignItems: "flex-end" }}>
          {Array.from({ length: 50 }).map((_, i) => {
            const h = [3, 5, 2, 4, 3, 5, 2, 4, 3, 2][i % 10];
            return <div key={i} style={{ width: 3, height: h * 4, background: "var(--rule)", opacity: i % 9 === 0 ? 0 : 1 }} />;
          })}
          <div style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 7, color: "var(--muted)", textAlign: "right", letterSpacing: 1 }}>{booking.txnId}</div>
        </div>
      </div>

      {/* Rating */}
      <div style={{ border: "1px solid var(--rule)", background: "var(--surface)", padding: "20px 22px", marginBottom: 20 }}>
        <Tag>Rate Your Ride</Tag>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 16, color: "var(--ink)", marginBottom: 12, fontStyle: "italic" }}>
          How was your ride with {driver.name.split(" ")[0]}?
        </div>
        {!rated ? (
          <>
            <Stars value={rating} onChange={setRating} size={32} />
            {rating > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)", marginBottom: 8 }}>OPTIONAL COMMENT</div>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} placeholder="Clean car, polite driver…"
                  style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--rule)", background: "var(--cream)", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", outline: "none", resize: "none" }} />
                <div style={{ marginTop: 10 }}><Btn variant="success" size="sm" onClick={submitRating}>SUBMIT RATING →</Btn></div>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10, animation: "fadeIn .3s ease" }}>
            <Stars value={rating} size={22} />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--green)" }}>Rating submitted — thank you!</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="primary" size="md" full onClick={onNewRide}>BOOK ANOTHER RIDE →</Btn>
        <Btn variant="ghost"   size="sm" onClick={() => toast.info("Receipt will be emailed to you.")}>⬇ RECEIPT</Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  TAB: MY RIDES
// ═══════════════════════════════════════════════════════════════════════
function MyRides({ onRebook }) {
  const [expandedId, setExpandedId] = useState(null);
  const TYPE_MAP = Object.fromEntries(RIDE_TYPES.map(r => [r.id, r]));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <Tag>Ride History</Tag>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--ink)" }}>My Rides</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)" }}>TOTAL SPENT</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 1, color: "var(--ink)" }}>
            ₹{MOCK_HISTORY.filter(r => r.status === "COMPLETED").reduce((s, r) => s + r.fare, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderTop: "3px solid var(--ink)", borderBottom: "1px solid var(--rule)", marginBottom: 24 }}>
        {[
          [MOCK_HISTORY.filter(r => r.status === "COMPLETED").length, "COMPLETED", "var(--green)"],
          [MOCK_HISTORY.filter(r => r.status === "CANCELLED").length, "CANCELLED",  "var(--red)"],
          [(MOCK_HISTORY.reduce((s, r) => s + r.km, 0)).toFixed(1) + " KM", "TOTAL DISTANCE", "var(--ink)"],
        ].map(([v, l, c], i) => (
          <div key={l} style={{ padding: "16px 20px", textAlign: "center", borderRight: i < 2 ? "1px solid var(--rule)" : "none" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 1, color: c, lineHeight: 1 }}>{v}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)", marginTop: 6 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Ride list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {MOCK_HISTORY.map((ride, i) => {
          const type = TYPE_MAP[ride.type] || RIDE_TYPES[0];
          const expanded = expandedId === ride.id;
          return (
            <div key={ride.id} style={{ border: `1px solid ${expanded ? "var(--amber)" : "var(--rule)"}`, background: expanded ? "var(--parchment)" : i % 2 === 0 ? "var(--surface)" : "var(--cream)", transition: "all .18s", animation: `fadeUp .3s ease ${i * 0.05}s both` }}>
              {/* Row */}
              <div onClick={() => setExpandedId(expanded ? null : ride.id)} style={{ display: "grid", gridTemplateColumns: "80px 1fr 80px 80px 80px", gap: 12, padding: "14px 16px", alignItems: "center", cursor: "pointer" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1, color: "var(--muted)" }}>{ride.date.slice(0, 6)}</div>
                <div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{ride.from} → {ride.to}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 1, color: "var(--muted)", marginTop: 2 }}>{type.icon} {type.label} · {ride.km}km · {ride.time}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 1, color: "var(--ink)" }}>₹{ride.fare}</div>
                </div>
                <Pill s={ride.status} small />
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: "var(--muted)", textAlign: "center" }}>
                  {expanded ? "▲" : "▼"}
                </div>
              </div>

              {/* Expanded detail */}
              {expanded && (
                <div style={{ padding: "0 16px 16px", animation: "fadeUp .2s ease", borderTop: "1px solid var(--rule)" }}>
                  <div style={{ paddingTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px", marginBottom: 14 }}>
                    {[["TRANSACTION ID", ride.id], ["DRIVER", ride.driver], ["VEHICLE", ride.vehicle], ["DISTANCE", ride.km + " km"]].map(([l, v]) => (
                      <div key={l} style={{ borderBottom: "1px solid var(--rule)", padding: "6px 0" }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)" }}>{l}</div>
                        <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink)", fontWeight: 500 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {ride.status === "COMPLETED" && ride.rating > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)" }}>YOUR RATING</span>
                      <Stars value={ride.rating} size={14} />
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn variant="secondary" size="sm" onClick={() => onRebook(ride)}>REBOOK →</Btn>
                    <Btn variant="ghost"     size="sm" onClick={() => {}}>⬇ RECEIPT</Btn>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  TAB: NEARBY TAXIS (schematic map)
// ═══════════════════════════════════════════════════════════════════════
function NearbyView() {
  const [selected, setSelected] = useState(null);
  const [drivers, setDrivers] = useState(NEARBY_DRIVERS);
  const TYPE_MAP = Object.fromEntries(RIDE_TYPES.map(r => [r.id, r]));

  // Wiggle drivers every 3s
  useEffect(() => {
    const t = setInterval(() => {
      setDrivers(d => d.map(dr => ({
        ...dr,
        x: Math.max(5, Math.min(92, dr.x + (Math.random() - 0.5) * 4)),
        y: Math.max(5, Math.min(92, dr.y + (Math.random() - 0.5) * 4)),
      })));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const TYPE_COLOR = { auto: "#C8832A", economy: "#1E6641", premium: "#1A1208", shared: "#6B5535" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, alignItems: "start" }}>
      {/* Schematic map */}
      <div style={{ border: "1.5px solid var(--ink)", background: "var(--ink)", position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
        {/* Grid lines (simulate roads) */}
        {[20, 40, 60, 80].map(p => (
          <div key={"h" + p} style={{ position: "absolute", left: 0, right: 0, top: `${p}%`, height: 1, background: "rgba(240,168,48,0.12)" }} />
        ))}
        {[20, 40, 60, 80].map(p => (
          <div key={"v" + p} style={{ position: "absolute", top: 0, bottom: 0, left: `${p}%`, width: 1, background: "rgba(240,168,48,0.12)" }} />
        ))}

        {/* Campus label */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--amber-on-ink)", border: "2px solid var(--cream)", margin: "0 auto 4px" }} />
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--amber-on-ink)", whiteSpace: "nowrap" }}>YOU</div>
        </div>

        {/* Driver dots */}
        {drivers.map(d => {
          const color = TYPE_COLOR[d.type] || "#C8832A";
          const isSelected = selected?.id === d.id;
          return (
            <div key={d.id} onClick={() => setSelected(isSelected ? null : d)}
              style={{ position: "absolute", left: `${d.x}%`, top: `${d.y}%`, transform: "translate(-50%,-50%)", cursor: "pointer", transition: "left 3s ease, top 3s ease" }}>
              {/* Ping ring */}
              {isSelected && <div style={{ position: "absolute", inset: -6, borderRadius: "50%", border: `2px solid ${color}`, animation: "drivePing 1.2s ease infinite" }} />}
              {/* Dot */}
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: color, border: `2px solid ${isSelected ? "white" : "rgba(255,255,255,.4)"}`, transition: "border .2s", boxShadow: isSelected ? `0 0 12px ${color}` : "none" }} />
              {/* Name tag on select */}
              {isSelected && (
                <div style={{ position: "absolute", top: -26, left: "50%", transform: "translateX(-50%)", background: color, color: "white", fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 1, padding: "2px 7px", whiteSpace: "nowrap" }}>
                  {d.name} · {d.eta}m
                </div>
              )}
            </div>
          );
        })}

        {/* Legend */}
        <div style={{ position: "absolute", bottom: 10, left: 12, display: "flex", gap: 10 }}>
          {Object.entries(TYPE_COLOR).map(([type, color]) => (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 6, letterSpacing: 1, color: "var(--muted-on-ink)", textTransform: "uppercase" }}>{type}</span>
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", top: 10, right: 12, fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted-on-ink)" }}>
          {drivers.length} DRIVERS NEARBY
        </div>
      </div>

      {/* Driver list */}
      <div>
        <Tag>Available Now</Tag>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {drivers.slice().sort((a, b) => a.eta - b.eta).map(d => {
            const t = TYPE_MAP[d.type] || RIDE_TYPES[0];
            const sel = selected?.id === d.id;
            return (
              <div key={d.id} onClick={() => setSelected(sel ? null : d)}
                style={{ border: `1.5px solid ${sel ? "var(--amber)" : "var(--rule)"}`, padding: "12px 14px", cursor: "pointer", background: sel ? "var(--parchment)" : "var(--surface)", transition: "all .18s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{t.icon}</span>
                    <div>
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{d.name}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)" }}>★ {d.rating}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 1, color: "var(--ink)", lineHeight: 1 }}>{d.eta} min</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)" }}>{t.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 16, fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)", textAlign: "center" }}>
          UPDATES EVERY 3 SECONDS
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  MAIN EXPORT — TAXI BOOKING
// ═══════════════════════════════════════════════════════════════════════
const TABS = [
  { id: "book",   label: "BOOK RIDE"  },
  { id: "rides",  label: "MY RIDES"   },
  { id: "nearby", label: "NEARBY"     },
];

export default function TaxiBooking() {
  const [tab, setTab] = useState("book");

  // Booking flow phases: "search" | "confirm" | "tracking" | "completed"
  const [phase,   setPhase]   = useState("search");
  const [booking, setBooking] = useState(null);
  const [driver,  setDriver]  = useState(null);

  const toast = useToast();

  const handleConfirm = (bookingData) => {
    setBooking(bookingData);
    setPhase("confirm");
  };
  const handleBooked = (confirmedData) => {
    setBooking(confirmedData);
    setPhase("tracking");
    toast.success("Ride booked! Driver is on the way.");
  };
  const handleComplete = (driverData) => {
    setDriver(driverData);
    setPhase("completed");
  };
  const handleCancel = () => {
    setPhase("search");
    setBooking(null);
    toast.info("Ride cancelled.");
  };
  const handleNewRide = () => {
    setPhase("search");
    setBooking(null);
    setDriver(null);
    setTab("book");
  };
  const handleRebook = (ride) => {
    setTab("book");
    setPhase("search");
    toast.info(`Rebooking ${ride.from} → ${ride.to}`);
  };

  return (
    <>
      <style>{G}</style>

      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 0 }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 4, color: "var(--muted)", marginBottom: 8 }}>STUDENT SERVICES</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 40, letterSpacing: 1, color: "var(--ink)", lineHeight: 1 }}>TAXI BOOKING</div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 14, color: "var(--muted)", fontStyle: "italic", marginTop: 6 }}>Book nearby taxis directly from campus.</div>
        </div>
        {/* Live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", animation: "pulse 2s ease-in-out infinite" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 3, color: "var(--green)" }}>
            {NEARBY_DRIVERS.length} DRIVERS ONLINE
          </span>
        </div>
      </div>

      {/* Breadcrumb (when in flow) */}
      {phase !== "search" && tab === "book" && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)" }}>
          {["SEARCH", "CONFIRM", "TRACKING", "DONE"].map((s, i) => {
            const phaseIdx = { search: 0, confirm: 1, tracking: 2, completed: 3 }[phase];
            return (
              <span key={s} style={{ color: i === phaseIdx ? "var(--amber-text)" : i < phaseIdx ? "var(--green)" : "var(--muted)" }}>
                {i > 0 && <span style={{ marginRight: 8 }}>›</span>}{i < phaseIdx ? "✓ " : ""}{s}
              </span>
            );
          })}
        </div>
      )}

      {/* Tab nav */}
      <div style={{ display: "flex", borderBottom: "2px solid var(--rule)", margin: "20px 0 28px", gap: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: "none", border: "none", fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 3, color: tab === t.id ? "var(--ink)" : "var(--muted)", padding: "12px 20px 10px", borderBottom: `2px solid ${tab === t.id ? "var(--amber)" : "transparent"}`, cursor: "pointer", marginBottom: -2, transition: "color .18s, border-color .18s" }}>{t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "book" && (
        <>
          {phase === "search"    && <SearchPhase   onConfirm={handleConfirm} />}
          {phase === "confirm"   && <ConfirmPhase  booking={booking} onBack={() => setPhase("search")} onConfirm={handleBooked} />}
          {phase === "tracking"  && <TrackingPhase booking={booking} onComplete={handleComplete} onCancel={handleCancel} />}
          {phase === "completed" && <CompletedPhase booking={booking} driver={driver} onNewRide={handleNewRide} toast={toast} />}
        </>
      )}
      {tab === "rides"  && <MyRides onRebook={handleRebook} />}
      {tab === "nearby" && <NearbyView />}

      <toast.Toaster />
    </>
  );
}