/**
 * ══════════════════════════════════════════════════════════════════════
 *  BUSPASSPRO — PUBLIC CITY TRANSIT SYSTEM
 *  Unified entry point — all screens, all roles, premium experience.
 *
 *  WHAT CHANGED FROM v1 (college-only):
 *  ─────────────────────────────────────────────────────────────────
 *  ✦ Rebranded → Public City Transit, not college-only
 *  ✦ Passenger types: General · Student · Senior · Differently Abled · Corporate
 *  ✦ Pass types: Daily · Weekly · Monthly · Quarterly · Annual
 *  ✦ City-scale routes with transit line identifiers (R1/R2/R3)
 *  ✦ Nav copy: "STUDENTS" → "PASSENGERS", "APPLY PASS" → "GET PASS"
 *  ✦ Premium UI: animated route badges, grain texture, spring curves
 *  ✦ Better hover states, richer empty states, proper focus rings
 *  ✦ Register: passenger-type aware (student ID only shown for students)
 *  ✦ Admin: passenger-type column, category-aware discount display
 *  ✦ Footer: proper public transit branding, no college reference
 * ══════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import PassengerDashboard from "./screens/PassengerDashboard";
import ApplyPass from "./screens/ApplyPass";
import PassengerProfile from "./screens/PassengerProfile";
import NearbyTaxis from "./screens/NearbyTaxis";
import TicketBooking from "./screens/TicketBooking";
import AIChatbot from "./screens/Aichatbot";
import {
  NotificationsScreen,
  RenewalFlow,
  BusRouteMap,
  CameraScanner,
  TripLog,
  ManualLookup,
} from "./screens/MissingScreens";
import {
  RouteManagerClone,
  UserManagerClone,
  AnalyticsDashboardClone,
  AnnouncementSenderClone,
  AdminApplicationsClone,
  AdminHubClone
} from "./screens/AdminScreensClone";
import AdminHub from "./screens/AdminHub";
import AuthService from "./services/authService";
// import AdminPaymentDashboard from "./screens/AdminPaymentDashboard";

// ══════════════════════════════════════════════════════════════════════
//  DESIGN SYSTEM
// ══════════════════════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;700&family=Instrument+Sans:wght@400;500;600&display=swap');

*,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

:root {
  --cream:#F6F0E4;  --surface:#FDFAF3; --parchment:#EDE4CC;
  --ink:#1A1208;    --ink-mid:#3D2410;
  --amber:#C8832A;  --amber-text:#8B520A; --amber-on-ink:#F0A830;
  --amber-light:#F5D49A;
  --muted:#6B5535;  --rule:#D4C4A0;
  --green:#1E6641;  --green-on-ink:#52B788;
  --red:#B02020;    --cream-on-ink:#F6F0E4; --muted-on-ink:#B09878;
  --success-bg:#EBF7F0; --error-bg:#FDEAEA;
  --warn-bg:#FEF7E6;    --info-bg:#EDE4CC;
  --font-display:'Bebas Neue',sans-serif;
  --font-serif:'DM Serif Display',serif;
  --font-mono:'JetBrains Mono',monospace;
  --font-sans:'Instrument Sans',sans-serif;
  --ease-spring:cubic-bezier(.34,1.28,.64,1);
  --ease-out:cubic-bezier(.22,.68,0,1.2);
  --r-xs:4px; --r-sm:8px; --r-md:14px; --r-lg:20px; --r-xl:28px; --r-full:999px;
  --shadow-sm:0 2px 8px rgba(26,18,8,.08);
  --shadow-md:0 6px 24px rgba(26,18,8,.12);
  --shadow-lg:0 16px 48px rgba(26,18,8,.18);
}

body { background:var(--cream); color:var(--ink); font-family:var(--font-sans); font-size: 16px; line-height: 1.6; -webkit-font-smoothing:antialiased; }
button { cursor:pointer; }
input,select,textarea { font-family:var(--font-sans); font-size: inherit; }

body::after {
  content:''; position:fixed; inset:0; pointer-events:none; z-index:9998; opacity:.018;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size:200px 200px;
}

:focus-visible { outline:2px solid var(--amber); outline-offset:2px; }
::-webkit-scrollbar { width:4px; height:4px; }
::-webkit-scrollbar-track { background:var(--parchment); }
::-webkit-scrollbar-thumb { background:var(--rule); }
::-webkit-scrollbar-thumb:hover { background:var(--amber); }

@keyframes tickerScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
@keyframes fadeUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn    { from{opacity:0} to{opacity:1} }
@keyframes stampDrop { 0%{transform:scale(2.2)rotate(-8deg);opacity:0} 65%{transform:scale(.92)rotate(3deg);opacity:1} 100%{transform:scale(1)rotate(-3deg);opacity:1} }
@keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideUp   { from{opacity:0;transform:translateY(10px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes spin      { to{transform:rotate(360deg)} }
@keyframes pulseDot  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.65)} }
@keyframes shimmer   { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes inkReveal { from{clip-path:inset(0 100% 0 0)} to{clip-path:inset(0 0% 0 0)} }
@keyframes badgePop  { 0%{transform:scale(0)} 70%{transform:scale(1.18)} 100%{transform:scale(1)} }
@keyframes lineGrow  { from{transform:scaleX(0)} to{transform:scaleX(1)} }
@keyframes bellWiggle{ 0%,100%{transform:rotate(0)} 20%{transform:rotate(-12deg)} 40%{transform:rotate(10deg)} 60%{transform:rotate(-8deg)} 80%{transform:rotate(6deg)} }
@keyframes fadeUpStagger { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
@keyframes arrowShift { from{transform:translateX(0)} to{transform:translateX(4px)} }
`;

// ══════════════════════════════════════════════════════════════════════
//  TRANSIT DATA
// ══════════════════════════════════════════════════════════════════════

import { User, GraduationCap, Leaf, Accessibility, Briefcase, Eye, EyeOff } from "lucide-react";

const PASSENGER_TYPES = [
  { id: "general", label: "GENERAL", sub: "Standard full fare", disc: 0, color: "#1A1208", icon: <User size={20} color="#E8DFD5" /> },
  { id: "student", label: "STUDENT", sub: "30% off — valid student ID req.", disc: 30, color: "#1E6641", icon: <GraduationCap size={20} color="#E8DFD5" /> },
  { id: "senior", label: "SENIOR CITIZEN", sub: "50% off — age 60+ (Govt scheme)", disc: 50, color: "#C8832A", icon: <Leaf size={20} color="#1A1208" /> },
  { id: "differently_abled", label: "DIFFERENTLY ABLED", sub: "75% off — disability cert. req.", disc: 75, color: "#3D2410", icon: <Accessibility size={20} color="#E8DFD5" /> },
  { id: "corporate", label: "CORPORATE", sub: "15% off — employer code req.", disc: 15, color: "#6B5535", icon: <Briefcase size={20} color="#E8DFD5" /> },
];

const CITY_ROUTES = [
  {
    id: 1, name: "Red Line", code: "R1", color: "#B02020",
    src: "Central Station", dst: "City Mall",
    stops: ["Old Market", "Hospital Gate", "Library Square", "IT Park", "Tech Hub"],
    fare: 380, km: 14.2, min: 42
  },
  {
    id: 2, name: "Blue Line", code: "R2", color: "#1A4A8A",
    src: "Central Station", dst: "Airport Road",
    stops: ["Railway Station", "Bus Terminal", "Ring Road", "Outer Ring"],
    fare: 520, km: 22.6, min: 58
  },
  {
    id: 3, name: "Green Line", code: "R3", color: "#1E6641",
    src: "North Zone", dst: "South End",
    stops: ["University Gate", "Sector 4", "Main Market", "City Square"],
    fare: 440, km: 16.8, min: 48
  },
];

const CITY_STOPS = [
  "Central Station", "Old Market", "Hospital Gate", "Library Square",
  "IT Park", "Tech Hub", "City Mall", "Railway Station", "Bus Terminal",
  "Ring Road", "Outer Ring", "Airport Road", "North Zone",
  "University Gate", "Sector 4", "Main Market", "City Square", "South End",
];

const PASS_DURATIONS = [
  { id: "daily", label: "DAILY", days: 1, mo: 0, disc: 0, badge: "24 HRS", desc: "24-hour unlimited" },
  { id: "weekly", label: "WEEKLY", days: 7, mo: 0, disc: 0, badge: "7 DAYS", desc: "7-day unlimited" },
  { id: "monthly", label: "MONTHLY", days: 30, mo: 1, disc: 0, badge: "30 DAYS", desc: "Calendar month" },
  { id: "quarterly", label: "QUARTERLY", days: 90, mo: 3, disc: 10, badge: "SAVE 10%", desc: "3 months, 10% off" },
  { id: "annual", label: "ANNUAL", days: 365, mo: 12, disc: 20, badge: "SAVE 20%", desc: "Best value" },
];

const DURATION_FARE_FACTOR = { daily: .08, weekly: .32, monthly: 1, quarterly: 2.7, annual: 9.6 };

const LINE_COLORS = { "Red Line": "#B02020", "Blue Line": "#1A4A8A", "Green Line": "#1E6641" };

// ══════════════════════════════════════════════════════════════════════
//  MOCK DATA
// ══════════════════════════════════════════════════════════════════════

const INITIAL_NOTIFS = [
  { id: 1, role: "passenger", type: "success", title: "Pass Approved!", body: "Your monthly pass BPP·2024·001234 for Red Line has been approved. QR ready.", time: "2 min ago", read: false },
  { id: 2, role: "passenger", type: "warn", title: "Pass Expiring Soon", body: "Your current pass expires in 7 days. Renew to avoid disruption.", time: "1 hr ago", read: false },
  { id: 3, role: "all", type: "info", title: "Blue Line Delay", body: "Blue Line (R2) running 14 minutes late near Ring Road.", time: "3 hrs ago", read: true },
  { id: 4, role: "passenger", type: "success", title: "Payment Confirmed", body: "₹520 received for pass BPP·2024·001234.", time: "2 days ago", read: true },
  { id: 5, role: "admin", type: "warn", title: "System Load Alert", body: "Server memory usage exceeded 85%. Automated optimization triggered.", time: "10 min ago", read: false },
  { id: 6, role: "admin", type: "info", title: "New Registrations", body: "14 new passenger applications received in the last hour.", time: "45 min ago", read: false },
];

const MOCK_APPS = [
  { id: "A-001", passenger: "Priya Patel", pid: "STU-10018", ptype: "student", email: "priya@mail.com", route: "Red Line", stop: "Library Square", type: "Monthly", status: "PENDING", date: "01 Mar 2024", amt: 266, phone: "+91 98765 11111", reason: "Daily commute to university." },
  { id: "A-002", passenger: "Ramesh Kumar", pid: "SEN-10027", ptype: "senior", email: "ramesh@mail.com", route: "Blue Line", stop: "Railway Station", type: "Monthly", status: "APPROVED", date: "28 Feb 2024", amt: 260, phone: "+91 98765 22222", reason: "Regular travel to hospital." },
  { id: "A-003", passenger: "Sneha Iyer", pid: "GEN-10031", ptype: "general", email: "sneha@mail.com", route: "Green Line", stop: "Main Market", type: "Quarterly", status: "PENDING", date: "02 Mar 2024", amt: 1188, phone: "+91 98765 33333", reason: "Work commute — office near City Square." },
  { id: "A-004", passenger: "Amit Singh", pid: "COR-10045", ptype: "corporate", email: "amit@techcorp.com", route: "Red Line", stop: "IT Park", type: "Quarterly", status: "REJECTED", date: "25 Feb 2024", amt: 969, phone: "+91 98765 44444", reason: "Employee corporate pass." },
  { id: "A-005", passenger: "Divya Menon", pid: "DAB-10052", ptype: "differently_abled", email: "divya@mail.com", route: "Blue Line", stop: "Bus Terminal", type: "Monthly", status: "APPROVED", date: "01 Mar 2024", amt: 130, phone: "+91 98765 55555", reason: "Daily essential travel." },
];

// ══════════════════════════════════════════════════════════════════════
//  SHARED ATOMS
// ══════════════════════════════════════════════════════════════════════

const Tag = ({ children, color }) => (
  <div style={{
    fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 3,
    color: color || "var(--muted)", textTransform: "uppercase", marginBottom: 8
  }}>{children}</div>
);

const Rule = ({ my = 20 }) => <div style={{ height: 1, background: "var(--rule)", margin: `${my}px 0` }} />;

const LineBadge = ({ name, small }) => {
  const c = LINE_COLORS[name] || "var(--muted)";
  const r = CITY_ROUTES.find(x => x.name === name);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: c, color: "white",
      fontFamily: "var(--font-mono)", fontSize: small ? 10 : 12, fontWeight: 700, letterSpacing: 2,
      padding: small ? "4px 10px" : "6px 14px", borderRadius: 3
    }}>
      {r?.code || "?"}{!small && " " + name.toUpperCase()}
    </span>
  );
};

const PassengerBadge = ({ type, small }) => {
  const p = PASSENGER_TYPES.find(x => x.id === type); if (!p) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: p.color, color: "#F6F0E4",
      fontFamily: "var(--font-mono)", fontSize: small ? 10 : 11, fontWeight: 700, letterSpacing: 2,
      padding: small ? "4px 10px" : "5px 14px",
      borderRadius: "var(--r-full)"
    }}>
      {small ? p.label : `${p.icon} ${p.label}`}
    </span>
  );
};

const Pill = ({ s }) => {
  const m = { ACTIVE: { bg: "#1E6641", c: "#F6F0E4" }, APPROVED: { bg: "#1E6641", c: "#F6F0E4" }, VALID: { bg: "#1E6641", c: "#F6F0E4" }, PENDING: { bg: "#C8832A", c: "#1A1208" }, REJECTED: { bg: "#B02020", c: "#F6F0E4" }, EXPIRED: { bg: "#6B5535", c: "#F6F0E4" }, INACTIVE: { bg: "#6B5535", c: "#F6F0E4" }, UPCOMING: { bg: "#C8832A", c: "#1A1208" }, CANCELLED: { bg: "#B02020", c: "#F6F0E4" } };
  const p = m[(s || "").toUpperCase()] || { bg: "#6B5535", c: "#F6F0E4" };
  return <span style={{ background: p.bg, color: p.c, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: 2, padding: "5px 15px", borderRadius: "var(--r-full)", display: "inline-block", lineHeight: 1.7 }}>{(s || "").toUpperCase()}</span>;
};

const Btn = ({ children, onClick, variant = "primary", size = "md", full = false, disabled = false, type = "button" }) => {
  const [h, setH] = useState(false);
  const pad = { sm: "10px 20px", md: "14px 32px", lg: "18px 48px" }[size] || "14px 32px";
  const fs = { sm: 13, md: 17, lg: 21 }[size] || 17;

  const themes = {
    primary: { bg: "var(--ink)", c: "var(--amber-on-ink)", b: "none" },
    secondary: { bg: "transparent", c: "var(--ink)", b: "1.5px solid var(--ink)" },
    danger: { bg: "var(--red)", c: "white", b: "none" },
    success: { bg: "var(--green)", c: "white", b: "none" },
    ghost: { bg: "transparent", c: "var(--ink)", b: "1.5px solid var(--rule)" },
  };
  const s = themes[variant] || themes.primary;

  return (
    <div style={{
      display: full ? "block" : "inline-block",
      overflow: "hidden",
      borderRadius: "var(--r-xs)",
      width: full ? "100%" : "auto"
    }}>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        style={{
          width: "100%",
          padding: pad,
          background: s.bg,
          color: s.c,
          border: s.b,
          fontFamily: "var(--font-display)",
          fontSize: fs,
          letterSpacing: 2,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.45 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          position: "relative",
          transition: "background 200ms ease, transform 200ms ease",
          transform: h && !disabled ? "translateY(-1px)" : "none"
        }}
      >
        <span style={{
          position: "absolute",
          left: 12,
          opacity: h ? 1 : 0,
          transform: h ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 220ms ease, opacity 220ms ease",
          fontSize: "1.2em"
        }}>→</span>
        <span style={{
          display: "inline-block",
          transform: h ? "translateX(6px)" : "translateX(0)",
          transition: "transform 220ms ease"
        }}>
          {children}
        </span>
      </button>
    </div>
  );
};

const Field = ({ label, type = "text", value, onChange, placeholder, error, readOnly, hint, required }) => {
  const [foc, setFoc] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && showPassword ? "text" : type;

  return (
    <div style={{ marginBottom: 20 }}>
      {label && <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 3, color: "var(--muted)", textTransform: "uppercase", marginBottom: 9 }}>
        {label}{required && <span style={{ color: "var(--red)", marginLeft: 4 }}>*</span>}</div>}
      <div style={{ position: "relative" }}>
        <input type={resolvedType} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
          onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
          style={{
            width: "100%", padding: isPassword ? "14px 48px 14px 16px" : "14px 16px",
            border: `2px solid ${error ? "var(--red)" : foc ? "var(--amber)" : "var(--rule)"}`,
            background: readOnly ? "var(--parchment)" : foc ? "var(--surface)" : "var(--cream)",
            fontFamily: "var(--font-sans)", fontSize: 16, color: readOnly ? "var(--muted)" : "var(--ink)", outline: "none",
            transition: "border-color .18s, background .18s",
            borderRadius: "var(--r-sm)",
            boxShadow: foc && !error ? "0 0 0 4px rgba(200,131,42,.08)" : "none"
          }} />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(s => !s)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "transparent",
              color: "var(--muted)",
              cursor: "pointer",
              padding: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--red)", marginTop: 6 }}>{error}</div>}
      {hint && !error && <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", marginTop: 6 }}>{hint}</div>}
    </div>
  );
};

const Spinner = ({ size = 18 }) => (
  <div style={{ width: size, height: size, border: "2px solid rgba(200,131,42,.25)", borderTop: "2px solid var(--amber)", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} />
);

// ══════════════════════════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════════════════════════
function useToast() {
  const [ts, setTs] = useState([]);
  const add = useCallback((msg, type = "info") => { const id = Date.now(); setTs(t => [...t, { id, msg, type }]); setTimeout(() => setTs(t => t.filter(x => x.id !== id)), type === "error" ? 6000 : 3500); }, []);
  const C = { success: { bg: "var(--success-bg)", b: "var(--green)", t: "var(--green)", i: "✓" }, error: { bg: "var(--error-bg)", b: "var(--red)", t: "var(--red)", i: "✕" }, info: { bg: "var(--surface)", b: "var(--ink)", t: "var(--ink)", i: "◆" }, warn: { bg: "var(--warn-bg)", b: "var(--amber-text)", t: "var(--amber-text)", i: "⚠" } };
  const Toaster = () => (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {ts.map(t => {
        const c = C[t.type] || C.info; return (
          <div key={t.id} style={{ background: c.bg, border: `2px solid ${c.b}`, padding: "12px 16px", minWidth: 280, display: "flex", gap: 10, alignItems: "center", borderRadius: "var(--r-md)", animation: "slideDown .3s var(--ease-spring)", boxShadow: "0 8px 32px rgba(26,18,8,.14)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 18, color: c.t }}>{c.i}</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: c.t }}>{t.msg}</span>
          </div>
        );
      })}
    </div>
  );
  return { success: m => add(m, "success"), error: m => add(m, "error"), info: m => add(m, "info"), warn: m => add(m, "warn"), Toaster };
}

// ══════════════════════════════════════════════════════════════════════
//  NAV CONFIG  (public transit terminology)
// ══════════════════════════════════════════════════════════════════════
const NAV_CONFIG = {
  passenger: [
    { label: "HOME", page: "dashboard" },
    { label: "GET PASS", page: "apply" },
    { label: "RENEW", page: "renew" },
    { label: "LIVE MAP", page: "busmap" },
    { label: "TICKETS", page: "tickets" },
    { label: "TAXI", page: "taxi" },
    { label: "MY ACCOUNT", page: "profile" },
  ],
  admin: [
    { label: "PASS REQUESTS", page: "admin" },
    { label: "ROUTES", page: "routes" },
    { label: "PASSENGERS", page: "users" },
    { label: "ANALYTICS", page: "analytics" },
    { label: "ANNOUNCE", page: "announce" },
    { label: "HUB", page: "hub" },
  ],
  conductor: [
    { label: "SCANNER", page: "conductor" },
    { label: "CAMERA", page: "camera" },
    { label: "TRIP LOG", page: "triplog" },
    { label: "LOOKUP", page: "lookup" },
  ],
};

const DEFAULT_PAGE = { passenger: "dashboard", admin: "admin", conductor: "conductor" };

// ══════════════════════════════════════════════════════════════════════
//  TICKER
// ══════════════════════════════════════════════════════════════════════
const TICKER_MSGS = [
  "R1 RED LINE · ON TIME", "R2 BLUE LINE · 14 MIN DELAY — RING ROAD CONGESTION", "R3 GREEN LINE · ON TIME",
  "NEW STOP: TECH HUB GATE 2 — EFFECTIVE 15 MARCH", "SENIOR & DIFFERENTLY-ABLED PASSES — 50–75% DISCOUNT",
  "CORPORATE BULK PASSES — CONTACT ADMIN FOR EMPLOYER CODE", "DAILY PASS VALID 24 HRS FROM FIRST SCAN",
];
function Ticker() {
  const t = [...TICKER_MSGS, ...TICKER_MSGS].join("   ◆   ");
  return (
    <div style={{ background: "var(--ink)", color: "var(--amber-on-ink)", fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: 2, overflow: "hidden", padding: "10px 0", borderBottom: "2px solid var(--amber)" }}>
      <div style={{ display: "flex", animation: "tickerScroll 38s linear infinite", whiteSpace: "nowrap" }}>
        <span style={{ paddingRight: 80 }}>{t}</span><span style={{ paddingRight: 80 }}>{t}</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  NOTIFICATION BELL
// ══════════════════════════════════════════════════════════════════════
function NotificationBell({ notifs, setNotifs, onOpenNotifications }) {
  const [open, setOpen] = useState(false);
  const [wiggle, setWiggle] = useState(false);
  const ref = useRef(null);
  const unread = notifs.filter(n => !n.read).length;
  useEffect(() => { if (unread > 0) { setWiggle(true); setTimeout(() => setWiggle(false), 600); } }, [unread]);
  useEffect(() => { const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  const TYPE_COLOR = { success: "var(--green)", warn: "var(--amber-text)", info: "var(--ink)" };
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ position: "relative", background: "none", border: "none", padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ animation: wiggle ? "bellWiggle .6s ease" : "none" }}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && <div style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "var(--red)", border: "1.5px solid var(--cream)", fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 700, color: "white", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, animation: "badgePop .3s var(--ease-spring)" }}>{unread > 9 ? "9+" : unread}</div>}
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, width: 340, background: "var(--surface)", border: "2px solid var(--ink)", borderRadius: "var(--r-sm)", boxShadow: "0 12px 40px rgba(26,18,8,.16)", zIndex: 500, animation: "slideDown .22s var(--ease-spring)", overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "2px solid var(--ink)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--parchment)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: 2, color: "var(--ink)" }}>NOTIFICATIONS {unread > 0 && <span style={{ color: "var(--red)" }}>· {unread}</span>}</div>
            {unread > 0 && <button onClick={() => setNotifs(n => n.map(x => ({ ...x, read: true })))} style={{ background: "none", border: "none", fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)", cursor: "pointer" }}>MARK ALL READ</button>}
          </div>
          {notifs.slice(0, 4).map(n => (
            <div key={n.id} onClick={() => setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x))}
              style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--rule)", cursor: "pointer", background: n.read ? "transparent" : "var(--warn-bg)", transition: "background .15s" }}>
              <div style={{ width: 4, background: n.read ? "transparent" : TYPE_COLOR[n.type] || "var(--ink)", flexShrink: 0 }} />
              <div style={{ flex: 1, padding: "11px 14px" }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink)", fontWeight: n.read ? 400 : 600 }}>{n.title}</div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", marginTop: 2, lineHeight: 1.5 }}>{n.body.slice(0, 72)}…</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 1, color: "var(--muted)", marginTop: 4 }}>{n.time}</div>
              </div>
            </div>
          ))}
          <button onClick={() => { setOpen(false); onOpenNotifications(); }} style={{ width: "100%", padding: "11px 0", background: "var(--ink)", color: "var(--amber-on-ink)", border: "none", fontFamily: "var(--font-display)", fontSize: 12, letterSpacing: 3, cursor: "pointer" }}>VIEW ALL →</button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  LOGIN SCREEN
// ══════════════════════════════════════════════════════════════════════
// ── Animated bus SVG icon ─────────────────────────────────────────────
function BusSVG({ color = "#F0A830", size = 18 }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 32 20" fill="none">
      <rect x="1" y="3" width="30" height="13" rx="2" fill={color} />
      <rect x="3" y="1" width="26" height="5" rx="1" fill={color} opacity=".7" />
      <rect x="4" y="5" width="6" height="4" rx=".5" fill="rgba(26,18,8,.35)" />
      <rect x="13" y="5" width="6" height="4" rx=".5" fill="rgba(26,18,8,.35)" />
      <rect x="22" y="5" width="6" height="4" rx=".5" fill="rgba(26,18,8,.35)" />
      <circle cx="7" cy="17" r="3" fill="#1A1208" stroke={color} strokeWidth="1.5" />
      <circle cx="25" cy="17" r="3" fill="#1A1208" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

// ── Animated counter ──────────────────────────────────────────────────
function AnimatedCount({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const isNum = !isNaN(parseInt(target));
  const num = parseInt(target) || 0;

  useEffect(() => {
    if (!isNum) return;
    let start = 0;
    const steps = 40;
    const inc = num / steps;
    const t = setInterval(() => {
      start += inc;
      if (start >= num) { setCount(num); clearInterval(t); }
      else setCount(Math.floor(start));
    }, 35);
    return () => clearInterval(t);
  }, [num, isNum]);

  if (!isNum) return <>{target}</>;
  return <>{count.toLocaleString()}{suffix}</>;
}

// ── Live clock ────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  const hh = String(time.getHours()).padStart(2, "0");
  const mm = String(time.getMinutes()).padStart(2, "0");
  const ss = String(time.getSeconds()).padStart(2, "0");
  const date = time.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" }).toUpperCase();
  return (
    <div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 28, letterSpacing: 4,
        color: "var(--amber-on-ink)", lineHeight: 1
      }}>
        {hh}<span style={{ opacity: time.getSeconds() % 2 === 0 ? .3 : 1, transition: "opacity .1s" }}>:</span>{mm}<span style={{ opacity: .5 }}>:{ss}</span>
      </div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3,
        color: "var(--muted-on-ink)", marginTop: 3
      }}>{date}</div>
    </div>
  );
}

function LoginScreen({ onLogin, onRegister, onForgot }) {
  const [role, setRole] = useState("passenger");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Bus positions along each route line (0–100% vertical)
  const [busPos, setBusPos] = useState([15, 45, 72]);

  // Floating particles
  const particles = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: 8 + Math.random() * 84,
      y: 5 + Math.random() * 90,
      size: 1.5 + Math.random() * 2.5,
      opacity: 0.06 + Math.random() * 0.1,
      speed: 0.04 + Math.random() * 0.08,
      drift: (Math.random() - .5) * 0.04,
    }))
  );
  const [ptick, setPtick] = useState(0);

  useEffect(() => {
    // Animate buses continuously
    const busTimer = setInterval(() => {
      setBusPos(p => p.map((pos, i) => {
        const speed = [0.6, 0.4, 0.5][i];
        return pos >= 95 ? 2 : pos + speed;
      }));
    }, 50);

    // Drift particles
    const partTimer = setInterval(() => {
      particles.current = particles.current.map(p => ({
        ...p,
        y: p.y <= -2 ? 102 : p.y - p.speed,
        x: Math.max(2, Math.min(98, p.x + p.drift)),
      }));
      setPtick(t => t + 1);
    }, 60);

    return () => { clearInterval(busTimer); clearInterval(partTimer); };
  }, []);

  // Route line horizontal positions (x%)
  const ROUTE_LINES = [
    { x: 84, color: "#B02020", busColor: "#FF6B6B" },
    { x: 88, color: "#1A4A8A", busColor: "#6B9FFF" },
    { x: 92, color: "#1E6641", busColor: "#52B788" },
  ];

  // Stop positions for each line (y%)
  const STOP_Y = [12, 28, 44, 60, 76, 90];

  const submit = async () => {
    setErr("");
    if (!email.trim()) { setErr("Email is required."); return; }
    if (!pw.trim()) { setErr("Password is required."); return; }

    setLoading(true);
    try {
      const data = await AuthService.login(email, pw);
      const serverRole = data?.user?.role || role;
      onLogin(serverRole);
    } catch (e) {
      const msg = e?.response?.data?.non_field_errors?.[0]
        || e?.response?.data?.detail
        || e?.response?.data?.error
        || "Login failed. Please check your credentials.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex" }}>

      {/* ── LEFT — dark hero panel with live effects ── */}
      <div style={{
        width: "54%",
        background: "radial-gradient(ellipse at 30% 80%, rgba(200,131,42,0.08) 0%, transparent 60%), var(--ink)",
        position: "relative",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        padding: 56, overflow: "hidden"
      }}>

        {/* Ghost watermark */}
        <div style={{
          position: "absolute", top: -20, left: -10,
          fontFamily: "var(--font-display)", fontSize: 210,
          color: "rgba(200,131,42,0.042)", lineHeight: .85,
          userSelect: "none", letterSpacing: -8, pointerEvents: "none"
        }}>
          BUS<br />PASS<br />PRO
        </div>

        {/* Floating particles */}
        {particles.current.map(p => (
          <div key={p.id} style={{
            position: "absolute",
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: "50%",
            background: "var(--amber-on-ink)", opacity: p.opacity,
            pointerEvents: "none", transition: "none"
          }} />
        ))}

        {/* Horizontal rule lines (like a ruled ledger) */}
        {[18, 34, 50, 66, 82].map((y, i) => (
          <div key={i} style={{
            position: "absolute", left: 0, right: 0, top: `${y}%`,
            height: 1, background: i % 2 === 0 ? "rgba(200,131,42,.06)" : "rgba(255,255,255,.025)",
            pointerEvents: "none"
          }} />
        ))}

        {/* ── 3 Animated route lines on the right edge ── */}
        {ROUTE_LINES.map((line, li) => (
          <div key={li} style={{
            position: "absolute", left: `${line.x}%`, top: 0, bottom: 0, width: 4,
            background: line.color, opacity: .4, filter: `drop-shadow(0 0 4px ${line.color})`
          }}>

            {/* Stop circles on the line */}
            {STOP_Y.map((sy, si) => {
              const busNear = Math.abs(busPos[li] - sy) < 8;
              return (
                <div key={si} style={{
                  position: "absolute", top: `${sy}%`,
                  left: "50%", transform: "translate(-50%,-50%)",
                  width: busNear ? 10 : 7, height: busNear ? 10 : 7,
                  borderRadius: "50%",
                  background: busNear ? line.color : "rgba(240,168,48,.15)",
                  border: `2px solid ${busNear ? line.busColor : "rgba(240,168,48,.3)"}`,
                  boxShadow: busNear ? `0 0 8px ${line.busColor}` : "none",
                  transition: "all .3s ease",
                  zIndex: 2
                }} />
              );
            })}

            {/* Animated bus icon on the line */}
            <div style={{
              position: "absolute", top: `${busPos[li]}%`,
              left: "50%", transform: "translate(-50%,-50%)",
              zIndex: 3, filter: `drop-shadow(0 0 6px ${line.busColor})`,
              transition: "top .05s linear"
            }}>
              <BusSVG color={line.busColor} size={20} />
            </div>
          </div>
        ))}

        {/* Dot grid accent */}
        <div style={{
          position: "absolute", top: 36, right: 112, width: 80, height: 110,
          backgroundImage: "radial-gradient(circle,rgba(240,168,48,.18) 1px,transparent 1px)",
          backgroundSize: "10px 10px", pointerEvents: "none"
        }} />

        {/* ── Content ── */}
        <div style={{ position: "relative", zIndex: 5 }}>

          {/* Live clock */}
          <div style={{ marginBottom: 24 }}>
            <LiveClock />
          </div>

          {/* Route code badges */}
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            {CITY_ROUTES.map(r => (
              <div key={r.id} style={{
                background: r.color, padding: "5px 12px",
                fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 3,
                color: "white", fontWeight: 700
              }}>{r.code}</div>
            ))}
            <div style={{
              background: "rgba(255,255,255,.07)", padding: "5px 12px",
              fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2,
              color: "var(--muted-on-ink)"
            }}>+ MORE ROUTES</div>
          </div>

          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 4,
            color: "var(--amber)", marginBottom: 14
          }}>◆ PUBLIC CITY TRANSIT SYSTEM</div>

          <div style={{
            fontFamily: "var(--font-display)", fontSize: 64,
            color: "var(--cream-on-ink)", lineHeight: .88, letterSpacing: 1, marginBottom: 20,
            animation: "inkReveal .9s ease .1s both"
          }}>
            YOUR<br />CITY.<br /><span style={{ color: "var(--amber-on-ink)" }}>YOUR RIDE.</span>
          </div>

          <div style={{
            fontFamily: "var(--font-serif)", fontSize: 14,
            color: "var(--muted-on-ink)", fontStyle: "italic",
            maxWidth: 320, lineHeight: 1.75, marginBottom: 32
          }}>
            Digital passes for everyone — students, seniors, daily commuters.
            Real-time tracking, AI routing, instant booking.
          </div>

          {/* Animated stats */}
          <div style={{
            display: "flex", gap: 24, paddingTop: 18,
            borderTop: "1px solid rgba(240,168,48,.15)"
          }}>
            {[["12", "", "ROUTES"], ["50", "K+", "DAILY RIDERS"], ["5", "", "PASS TYPES"], ["99", "%", "UPTIME"]].map(([n, suf, l], idx) => (
              <div key={l} style={{ animation: `fadeUp .5s ease ${300 + idx * 150}ms both` }}>
                <div style={{
                  fontFamily: "var(--font-display)", fontSize: 32,
                  color: "var(--amber-on-ink)", letterSpacing: 1, lineHeight: 1,
                  paddingBottom: 8, borderBottom: "1px solid var(--amber)",
                  animation: "lineGrow .6s ease .3s both", transformOrigin: "left"
                }}>
                  <AnimatedCount target={n} suffix={suf} />
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 6,
                  color: "var(--muted-on-ink)", letterSpacing: 3, marginTop: 4
                }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Live route status strip */}
          <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { code: "R1", status: "ON TIME", color: "#52B788" },
              { code: "R2", status: "14 MIN DELAY", color: "#F0A830" },
              { code: "R3", status: "ON TIME", color: "#52B788" },
            ].map(r => {
              const bgColor = r.color === "#52B788"
                ? "rgba(82,183,136,0.15)"
                : "rgba(200,131,42,0.15)";
              const borderColor = r.color === "#52B788"
                ? "rgba(82,183,136,0.3)"
                : "rgba(200,131,42,0.3)";
              return (
                <div key={r.code} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: bgColor, padding: "6px 12px",
                  border: `1px solid ${borderColor}`, borderRadius: "var(--r-full)"
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%", background: r.color,
                    animation: "pulseDot 2s ease-in-out infinite"
                  }} />
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2,
                    color: r.color, fontWeight: 700
                  }}>{r.code}</span>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 6, letterSpacing: 1,
                    color: "var(--muted-on-ink)"
                  }}>{r.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RIGHT — form panel ── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "56px 52px",
        paddingTop: "8vh",
        background: "var(--cream)"
      }}>
        <div style={{ maxWidth: 360, animation: "fadeUp .5s ease" }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 5,
              color: "var(--amber-text)", marginBottom: 12
            }}>SIGN IN</div>
            <div style={{
              fontFamily: "var(--font-serif)", fontSize: 48,
              color: "var(--ink)", lineHeight: 1.05, marginBottom: 4
            }}>
              Welcome<br />back.
            </div>
            {/* Animated underline */}
            <div style={{
              height: 4, background: "var(--amber)", width: 80,
              animation: "lineGrow .6s ease .3s both", transformOrigin: "left"
            }} />
          </div>

          {/* Portal selector */}
          <div style={{ marginBottom: 28 }}>
            <Tag>Portal Type</Tag>
            <div style={{ display: "flex", border: "1.5px solid var(--ink)", overflow: "hidden" }}>
              {[["passenger", "🚌 PASSENGER"], ["admin", "⚙ ADMIN"]].map(([r, l]) => (
                <button key={r} onClick={() => setRole(r)}
                  style={{
                    flex: 1, padding: "14px 0",
                    background: role === r ? "var(--ink)" : "transparent",
                    color: role === r ? "var(--amber-on-ink)" : "var(--muted)",
                    border: "none",
                    borderRight: r !== "admin" ? "1px solid var(--ink)" : "none",
                    borderBottom: role === r ? "3px solid var(--amber)" : "none",
                    fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1,
                    cursor: "pointer", transition: "background .25s, color .25s, border-bottom .25s"
                  }}>{l}</button>
              ))}
            </div>
          </div>

          <Field label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Field label="Password" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" required />

          {err && <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--red)", marginBottom: 10, padding: "8px 12px", background: "var(--error-bg)", border: "1px solid var(--red)" }}>{err}</div>}

          <Btn variant="primary" full size="md" onClick={submit} disabled={loading}>
            {loading ? <><Spinner size={16} /> SIGNING IN…</> : <>ENTER PORTAL <span style={{ display: "inline-block", transition: "transform .25s" }}>→</span></>}
          </Btn>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <span onClick={onRegister} style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--amber-text)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>New here? Register →</span>
            <span onClick={onForgot} style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>Forgot password?</span>
          </div>

          {/* Divider with passenger type icons */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--rule)" }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 6, letterSpacing: 4,
              color: "var(--muted)", marginBottom: 10, textAlign: "center"
            }}>
              PASSES FOR EVERYONE
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              {PASSENGER_TYPES.map((p, idx) => (
                <div key={p.id}
                  title={`${p.label} — ${p.disc > 0 ? p.disc + "% OFF" : "STANDARD FARE"}`}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: p.color, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 16,
                    boxShadow: "0 2px 8px rgba(26,18,8,.12)",
                    transition: "transform .18s, box-shadow .18s",
                    animation: `fadeUpStagger .4s ease ${idx * 80}ms both`,
                    cursor: "pointer"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "scale(1.2)";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,18,8,.2)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(26,18,8,.12)";
                  }}>
                  {p.icon}
                </div>
              ))}
            </div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 6, letterSpacing: 3,
              color: "var(--muted)", marginTop: 12, textAlign: "center", opacity: .7
            }}>
              LIVE AUTH MODE · USE VALID ACCOUNT
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  REGISTER SCREEN (passenger-type aware)
// ══════════════════════════════════════════════════════════════════════
function RegisterScreen({ onDone, onBack }) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("passenger");
  const [ptype, setPtype] = useState("general");
  const [form, setForm] = useState({ name: "", email: "", phone: "", pid: "", org: "", password: "", confirm: "" });
  const [errs, setErrs] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (step === 2) { if (!form.name.trim()) e.name = "Required"; if (!form.email.includes("@")) e.email = "Invalid"; if (form.phone.length < 10) e.phone = "10 digits required"; }
    if (step === 3 && role === "passenger") { if (!form.pid.trim()) e.pid = "ID required"; }
    if (step === 4) { if (form.password.length < 8) e.password = "Min 8 chars"; if (form.password !== form.confirm) e.confirm = "Doesn't match"; }
    setErrs(e); return Object.keys(e).length === 0;
  };

  const next = async () => {
    if (!validate()) return;
    if (step < 4) { setStep(s => s + 1); return; }

    if (role !== "passenger") {
      setErrs(e => ({ ...e, role: "Self-registration is enabled for passenger accounts only." }));
      return;
    }

    setLoading(true);
    try {
      await AuthService.register({
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        confirm_password: form.confirm,
        student_profile: {
          student_id: form.pid.trim(),
          full_name: form.name.trim(),
          gender: "O",
          date_of_birth: "2000-01-01",
          department: (form.org || "General").trim(),
          year_of_study: 1,
          college_name: (form.org || "BusPassPro").trim(),
          home_address: "Not provided",
        }
      });
      setDone(true);
    } catch (err) {
      const data = err?.response?.data;
      if (typeof data === "object" && data !== null) {
        const msg = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`)
          .join(" | ");
        setErrs(e => ({ ...e, submit: msg || "Registration failed." }));
      } else {
        setErrs(e => ({ ...e, submit: "Registration failed." }));
      }
    } finally {
      setLoading(false);
    }
  };

  const STEPS = ["PORTAL", "PERSONAL", "IDENTITY", "SECURE"];

  if (done) return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: 48, animation: "fadeUp .5s ease" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--success-bg)", border: "3px solid var(--green)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", animation: "stampDrop .5s ease" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--green)" }}>✓</span>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 44, letterSpacing: 1, color: "var(--ink)", lineHeight: 1, marginBottom: 8 }}>WELCOME ABOARD!</div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 16, color: "var(--muted)", fontStyle: "italic", marginBottom: 28, lineHeight: 1.7 }}>Account created.<br />Check your email to verify.</div>
        <Btn variant="primary" size="lg" onClick={onDone}>GO TO LOGIN →</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex" }}>
      {/* Left */}
      <div style={{ width: "38%", background: "var(--ink)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 52, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", top: -20, left: -10, fontFamily: "var(--font-display)", fontSize: 170, color: "rgba(240,168,48,0.05)", lineHeight: .85, userSelect: "none", letterSpacing: -5 }}>NEW<br />RIDE</div>
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {CITY_ROUTES.map(r => <div key={r.id} style={{ background: r.color, padding: "3px 8px", fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2, color: "white" }}>{r.code}</div>)}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 4, color: "var(--amber)", marginBottom: 14 }}>◆ BUSPASSPRO</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 46, color: "var(--cream-on-ink)", lineHeight: .9, letterSpacing: 1, marginBottom: 20 }}>JOIN THE<br />TRANSIT<br /><span style={{ color: "var(--amber-on-ink)" }}>NETWORK.</span></div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 13, color: "var(--muted-on-ink)", fontStyle: "italic", lineHeight: 1.7, marginBottom: 28 }}>Get your digital pass in minutes. No paperwork, no queues.</div>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, opacity: step >= i + 1 ? 1 : 0.3 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: step > i + 1 ? "var(--green-on-ink)" : step === i + 1 ? "var(--amber-on-ink)" : "transparent", border: `2px solid ${step > i + 1 ? "var(--green-on-ink)" : step === i + 1 ? "var(--amber-on-ink)" : "rgba(255,255,255,.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 12, color: step >= i + 1 ? "var(--ink)" : "rgba(255,255,255,.3)", transition: "all .3s" }}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 3, color: step >= i + 1 ? "var(--cream-on-ink)" : "rgba(255,255,255,.25)" }}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted-on-ink)" }}>STEP {step} OF {STEPS.length}</div>
      </div>

      {/* Right */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "52px 56px" }}>
        <div style={{ maxWidth: 440, animation: "fadeUp .35s ease" }}>
          {step === 1 && (
            <>
              <Tag>Step 1 — Portal</Tag>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--ink)", marginBottom: 22 }}>Who are you?</div>
              <Tag color="var(--muted)">Portal Type</Tag>
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {[["passenger", "🚌 PASSENGER", "Book passes & tickets"], ["admin", "⚙ ADMIN", "Manage system"]].map(([r, l, sub]) => (
                  <div key={r} onClick={() => setRole(r)} style={{ flex: 1, border: `2px solid ${role === r ? "var(--ink)" : "var(--rule)"}`, padding: "12px 10px", cursor: "pointer", background: role === r ? "var(--ink)" : "var(--surface)", textAlign: "center", transition: "all .18s" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 12, letterSpacing: 2, color: role === r ? "var(--amber-on-ink)" : "var(--ink)" }}>{l}</div>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: role === r ? "var(--muted-on-ink)" : "var(--muted)", marginTop: 3 }}>{sub}</div>
                  </div>
                ))}
              </div>
              {errs.role && (
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--red)", marginBottom: 10, padding: "8px 12px", background: "var(--error-bg)", border: "1px solid var(--red)" }}>
                  {errs.role}
                </div>
              )}
              {role === "passenger" && (
                <>
                  <Tag color="var(--muted)">Passenger Category</Tag>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {PASSENGER_TYPES.map(p => (
                      <div key={p.id} onClick={() => setPtype(p.id)} style={{ border: `2px solid ${ptype === p.id ? "var(--ink)" : "var(--rule)"}`, padding: "11px 14px", cursor: "pointer", background: ptype === p.id ? "var(--parchment)" : "var(--surface)", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all .18s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 16 }}>{p.icon}</span>
                          <div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: 2, color: "var(--ink)" }}>{p.label}</div>
                            <div style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: "var(--muted)", marginTop: 1 }}>{p.sub}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {p.disc > 0 && <div style={{ fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: 1, color: "var(--green)" }}>{p.disc}%</div>}
                          {ptype === p.id && <span style={{ color: "var(--green)", fontFamily: "var(--font-display)", fontSize: 14 }}>✓</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
          {step === 2 && (
            <>
              <Tag>Step 2 — Personal Info</Tag>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--ink)", marginBottom: 22 }}>About you</div>
              <Field label="Full Name" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your full name" error={errs.name} required />
              <Field label="Email" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" error={errs.email} required />
              <Field label="Mobile" type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="10-digit number" error={errs.phone} required />
            </>
          )}
          {step === 3 && (
            <>
              <Tag>Step 3 — Identity Verification</Tag>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--ink)", marginBottom: 16 }}>Verify your category</div>
              {role === "passenger" && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--parchment)", border: "1px solid var(--rule)", marginBottom: 18 }}>
                  <span style={{ fontSize: 18 }}>{PASSENGER_TYPES.find(p => p.id === ptype)?.icon}</span>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: 2, color: "var(--ink)" }}>{PASSENGER_TYPES.find(p => p.id === ptype)?.label}</div>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)" }}>{PASSENGER_TYPES.find(p => p.id === ptype)?.sub}</div>
                  </div>
                </div>
              )}
              <Field
                label={ptype === "student" ? "Student ID" : ptype === "corporate" ? "Employee ID" : ptype === "senior" ? "Aadhaar / Govt ID" : ptype === "differently_abled" ? "Disability Certificate No." : "Govt Photo ID"}
                value={form.pid} onChange={e => set("pid", e.target.value)}
                placeholder={ptype === "student" ? "STU-2024-001" : ptype === "corporate" ? "EMP-CORP-001" : "ID-001"}
                error={errs.pid} required
                hint={ptype === "student" ? "Institution-issued student ID" : ptype === "senior" ? "Will be verified at first scan" : ptype === "differently_abled" ? "Issued by competent authority" : "Any valid government photo ID"} />
              {ptype === "corporate" &&
                <Field label="Organisation / Company" value={form.org} onChange={e => set("org", e.target.value)} placeholder="TechCorp India Pvt Ltd" hint="Your employer's registered name" />}
            </>
          )}
          {step === 4 && (
            <>
              <Tag>Step 4 — Secure Account</Tag>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--ink)", marginBottom: 22 }}>Set your password</div>
              <Field label="Password" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Minimum 8 characters" error={errs.password} required />
              <Field label="Confirm Password" type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)} placeholder="Repeat password" error={errs.confirm} required />
              {form.password.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ height: 4, background: "var(--rule)", position: "relative", marginBottom: 5 }}>
                    <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${Math.min(100, form.password.length * 8)}%`, background: form.password.length < 8 ? "var(--red)" : form.password.length < 12 ? "var(--amber)" : "var(--green)", transition: "width .3s, background .3s" }} />
                  </div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: form.password.length < 8 ? "var(--red)" : form.password.length < 12 ? "var(--amber-text)" : "var(--green)" }}>
                    {form.password.length < 8 ? "Too short" : form.password.length < 12 ? "Fair — consider stronger" : "Strong ✓"}
                  </div>
                </div>
              )}
            </>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            {step > 1 && <Btn variant="secondary" size="md" onClick={() => setStep(s => s - 1)}>← BACK</Btn>}
            <Btn variant="primary" full size="md" onClick={next} disabled={loading}>
              {loading ? <><Spinner size={16} /> CREATING…</> : step < 4 ? "CONTINUE →" : "CREATE ACCOUNT →"}
            </Btn>
          </div>
          {errs.submit && (
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--red)", marginTop: 10, padding: "8px 12px", background: "var(--error-bg)", border: "1px solid var(--red)" }}>
              {errs.submit}
            </div>
          )}
          <Rule my={18} />
          <div style={{ textAlign: "center" }}>
            <span onClick={onBack} style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--amber-text)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>← Already registered? Sign in</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  FORGOT PASSWORD
// ══════════════════════════════════════════════════════════════════════
function ForgotPasswordScreen({ onDone, onBack }) {
  const [step, setStep] = useState(1); const [email, setEmail] = useState(""); const [otp, setOtp] = useState(["", "", "", "", "", ""]); const [pw, setPw] = useState(""); const [confirm, setConfirm] = useState(""); const [loading, setLoading] = useState(false); const [cd, setCd] = useState(0); const refs = useRef([]);
  useEffect(() => { if (cd > 0) { const t = setTimeout(() => setCd(c => c - 1), 1000); return () => clearTimeout(t); } }, [cd]);
  const sendOTP = async () => { if (!email.includes("@")) return; setLoading(true); await new Promise(r => setTimeout(r, 700)); setLoading(false); setStep(2); setCd(60); };
  const verifyOTP = async () => { if (otp.join("").length < 6) return; setLoading(true); await new Promise(r => setTimeout(r, 600)); setLoading(false); setStep(3); };
  const resetPw = async () => { if (pw.length < 8 || pw !== confirm) return; setLoading(true); await new Promise(r => setTimeout(r, 800)); setLoading(false); setStep(4); };
  const handleOtp = (i, val) => { if (!/^\d*$/.test(val)) return; const n = [...otp]; n[i] = val.slice(-1); setOtp(n); if (val && i < 5) refs.current[i + 1]?.focus(); };

  if (step === 4) return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: 48, animation: "fadeUp .5s ease" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 50, color: "var(--ink)", letterSpacing: 1, lineHeight: 1, marginBottom: 10 }}>PASSWORD RESET!</div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 15, color: "var(--muted)", fontStyle: "italic", marginBottom: 26 }}>Your password has been updated.</div>
        <Btn variant="primary" size="lg" onClick={onDone}>SIGN IN NOW →</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "44px 40px", border: "1.5px solid var(--rule)", background: "var(--surface)", borderRadius: "var(--r-xl)", animation: "fadeUp .4s ease", boxShadow: "0 20px 60px rgba(26,18,8,.08)" }}>
        <Tag>Password Recovery</Tag>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--ink)", lineHeight: 1.1, marginBottom: 8 }}>{step === 1 ? "Reset password" : step === 2 ? "Enter OTP" : "New password"}</div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", marginBottom: 22 }}>{step === 1 ? "Enter your registered email." : step === 2 ? `OTP sent to ${email}.` : "Create a strong password."}</div>
        {step === 1 && <><Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /><Btn variant="primary" full onClick={sendOTP} disabled={loading}>{loading ? "SENDING…" : "SEND OTP →"}</Btn></>}
        {step === 2 && (<>
          <Tag>6-Digit OTP</Tag>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {otp.map((d, i) => <input key={i} ref={el => refs.current[i] = el} value={d} onChange={e => handleOtp(i, e.target.value)} onKeyDown={e => e.key === "Backspace" && !d && i > 0 && refs.current[i - 1]?.focus()} maxLength={1} inputMode="numeric" style={{ width: 46, height: 54, textAlign: "center", border: `2px solid ${d ? "var(--amber)" : "var(--rule)"}`, background: d ? "var(--amber-light)" : "var(--cream)", fontFamily: "var(--font-display)", fontSize: 24, color: "var(--ink)", outline: "none", transition: "border-color .15s, background .15s" }} />)}
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", marginBottom: 14 }}>{cd > 0 ? `Resend in ${cd}s` : <span onClick={sendOTP} style={{ color: "var(--amber-text)", cursor: "pointer" }}>Resend OTP</span>}</div>
          <Btn variant="primary" full onClick={verifyOTP} disabled={loading || otp.join("").length < 6}>{loading ? "VERIFYING…" : "VERIFY →"}</Btn></>)}
        {step === 3 && <><Field label="New Password" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Min 8 characters" /><Field label="Confirm Password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat" /><Btn variant="primary" full onClick={resetPw} disabled={loading}>{loading ? "UPDATING…" : "RESET PASSWORD →"}</Btn></>}
        <Rule my={18} />
        <div style={{ textAlign: "center" }}><span onClick={onBack} style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--amber-text)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>← Back to Sign In</span></div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  APP DETAIL MODAL
// ══════════════════════════════════════════════════════════════════════
function AppDetailModal({ app, onClose, onApprove, onReject }) {
  if (!app) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(26,18,8,.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, animation: "fadeIn .2s ease" }} onClick={onClose}>
      <div style={{ background: "var(--cream)", border: "2px solid var(--ink)", borderRadius: "var(--r-xl)", width: 560, maxHeight: "85vh", overflow: "auto", animation: "slideUp .3s var(--ease-spring)", boxShadow: "0 24px 80px rgba(26,18,8,.22)" }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "var(--ink)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 4, color: "var(--muted-on-ink)", marginBottom: 4 }}>PASS REQUEST</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: 1, color: "var(--amber-on-ink)" }}>{app.id}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Pill s={app.status} />
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted-on-ink)", fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1, cursor: "pointer" }}>✕</button>
          </div>
        </div>
        <div style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <Tag>Passenger Information</Tag>
            <PassengerBadge type={app.ptype} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            {[["Full Name", app.passenger], ["Passenger ID", app.pid], ["Email", app.email], ["Phone", app.phone]].map(([l, v]) => (
              <div key={l} style={{ padding: "9px 0", borderBottom: "1px solid var(--rule)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)" }}>{l}</div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", fontWeight: 500, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
          <Rule my={20} />
          <Tag>Pass Details</Tag>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            {[["Route", app.route], ["Boarding Stop", app.stop], ["Pass Type", app.type], ["Amount", `₹${app.amt.toLocaleString()}`], ["Applied On", app.date]].map(([l, v]) => (
              <div key={l} style={{ padding: "9px 0", borderBottom: "1px solid var(--rule)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)" }}>{l}</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", fontWeight: 500, marginTop: 2 }}>{v}</div>
                </div>
                {l === "Route" && <LineBadge name={v} small />}
              </div>
            ))}
          </div>
          <Rule my={20} />
          <Tag>Reason</Tag>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", lineHeight: 1.65, background: "var(--surface)", padding: "12px 14px", border: "1px solid var(--rule)", marginBottom: 24 }}>{app.reason}</div>
          {app.status === "PENDING" ? (
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="success" size="md" onClick={() => { onApprove(app.id); onClose(); }}>✓ APPROVE</Btn>
              <Btn variant="danger" size="md" onClick={() => { onReject(app.id); onClose(); }}>✕ REJECT</Btn>
              <Btn variant="ghost" size="md" onClick={onClose}>CANCEL</Btn>
            </div>
          ) : <Btn variant="secondary" size="sm" onClick={onClose}>CLOSE</Btn>}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  ADMIN APPLICATIONS  (with passenger types + route line badges)
// ══════════════════════════════════════════════════════════════════════
function AdminApplications() {
  const [apps, setApps] = useState(MOCK_APPS);
  const [filter, setFilter] = useState("ALL");
  const [ptFilter, setPtFilter] = useState("ALL");
  const [detail, setDetail] = useState(null);
  const [detailHoverId, setDetailHoverId] = useState(null);
  const toast = useToast();
  const approve = id => { setApps(a => a.map(x => x.id === id ? { ...x, status: "APPROVED" } : x)); toast.success("Pass request approved!"); };
  const reject = id => { setApps(a => a.map(x => x.id === id ? { ...x, status: "REJECTED" } : x)); toast.warn("Request rejected."); };
  const visible = apps.filter(a => filter === "ALL" || a.status === filter).filter(a => ptFilter === "ALL" || a.ptype === ptFilter);
  const counts = { ALL: apps.length, PENDING: apps.filter(a => a.status === "PENDING").length, APPROVED: apps.filter(a => a.status === "APPROVED").length, REJECTED: apps.filter(a => a.status === "REJECTED").length };
  const STATUS_BORDER = { PENDING: "var(--amber)", APPROVED: "var(--green)", REJECTED: "var(--red)" };

  return (
    <>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "3px solid var(--ink)", borderBottom: "1px solid var(--rule)", marginBottom: 24 }}>
        {[["TOTAL", apps.length, "var(--ink)"], ["PENDING", counts.PENDING, "var(--amber-text)"], ["APPROVED", counts.APPROVED, "var(--green)"], ["REJECTED", counts.REJECTED, "var(--red)"]].map(([l, n, c], i) => (
          <div key={l} style={{ padding: "18px 22px", textAlign: "center", borderRight: i < 3 ? "1px solid var(--rule)" : "none" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: 1, color: c, lineHeight: 1 }}>{n}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)", marginTop: 6 }}>REQUESTS — {l}</div>
          </div>
        ))}
      </div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 2 }}>
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 14px", background: filter === f ? "var(--ink)" : "transparent", color: filter === f ? "var(--amber-on-ink)" : "var(--muted)", border: "1.5px solid var(--ink)", fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, cursor: "pointer", transition: "all .18s" }}>
              {f} ({counts[f] ?? apps.filter(a => a.status === f).length})
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, marginLeft: "auto", flexWrap: "wrap" }}>
          {["ALL", ...PASSENGER_TYPES.map(p => p.id)].map(pt => {
            const pMeta = PASSENGER_TYPES.find(p => p.id === pt);
            const activeBg = pt === "ALL" ? "var(--parchment)" : `${pMeta?.color || "#1A1208"}26`;
            return (
              <button key={pt} onClick={() => setPtFilter(pt)} style={{ padding: "5px 10px", background: ptFilter === pt ? activeBg : "transparent", color: "var(--ink)", border: "1px solid var(--rule)", fontFamily: "var(--font-mono)", fontSize: 6, letterSpacing: 2, cursor: "pointer", transition: "all .15s" }}>
                {pt === "ALL" ? "ALL" : PASSENGER_TYPES.find(p => p.id === pt)?.icon + " " + pt.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>
      {/* Table */}
      <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 90px 120px 90px 80px 80px 160px", gap: 10, padding: "6px 12px", borderBottom: "2px solid var(--ink)" }}>
        {["ID", "PASSENGER", "CATEGORY", "ROUTE", "PASS", "DATE", "AMT", "ACTION"].map(h => (
          <span key={h} style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)" }}>{h}</span>
        ))}
      </div>
      {visible.map((app, i) => (
        <div key={app.id}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--parchment)"; e.currentTarget.style.transform = "translateX(2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? "var(--surface)" : "var(--cream)"; e.currentTarget.style.transform = "translateX(0)"; }}
          style={{ display: "grid", gridTemplateColumns: "70px 1fr 90px 120px 90px 80px 80px 160px", gap: 10, padding: "13px 12px", borderBottom: "1px solid var(--rule)", borderLeft: `4px solid ${STATUS_BORDER[app.status] || "var(--rule)"}`, alignItems: "center", background: i % 2 === 0 ? "var(--surface)" : "var(--cream)", animation: `fadeUp .3s ease ${i * .05}s both`, transition: "background .18s, transform .18s" }}>
          <button onClick={() => setDetail(app)} style={{ background: "none", border: "none", fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1, color: "var(--amber-text)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3, textAlign: "left" }}>{app.id}</button>
          <div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{app.passenger}</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)" }}>{app.pid}</div>
          </div>
          <PassengerBadge type={app.ptype} small />
          <LineBadge name={app.route} small />
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1, color: "var(--muted)" }}>{app.type}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>{app.date.slice(0, 6)}</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: app.amt >= 1000 ? 20 : 16, color: "var(--ink)", letterSpacing: 1, fontWeight: app.amt >= 1000 ? 700 : 400 }}>₹{app.amt.toLocaleString()}</div>
          <div style={{ display: "flex", gap: 4 }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => setDetail(app)}
                onMouseEnter={() => setDetailHoverId(app.id)}
                onMouseLeave={() => setDetailHoverId(null)}
                style={{ padding: "4px 8px", background: "none", border: "1px solid var(--rule)", fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 1, color: "var(--muted)", cursor: "pointer" }}>DETAIL</button>
              {detailHoverId === app.id && (
                <div style={{
                  position: "absolute", left: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)",
                  background: "var(--ink)", color: "var(--amber-on-ink)", padding: "8px 10px", minWidth: 190,
                  border: "1px solid var(--amber-text)", zIndex: 5, boxShadow: "0 6px 18px rgba(26,18,8,.2)"
                }}>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, lineHeight: 1.4 }}>{app.passenger}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1, opacity: .9 }}>{app.route} · ₹{app.amt.toLocaleString()}</div>
                </div>
              )}
            </div>
            {app.status === "PENDING" && (<>
              <button onClick={() => approve(app.id)} style={{ padding: "4px 8px", background: "var(--green)", border: "none", fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 1, color: "var(--cream-on-ink)", cursor: "pointer" }}>✓</button>
              <button onClick={() => reject(app.id)} style={{ padding: "4px 8px", background: "none", border: "1px solid var(--red)", fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 1, color: "var(--red)", cursor: "pointer" }}>✕</button>
            </>)}
            {app.status !== "PENDING" && <Pill s={app.status} />}
          </div>
        </div>
      ))}

      {visible.length < 4 && (
        <div style={{ position: "sticky", bottom: 16, marginTop: 18, padding: "14px 18px", background: "var(--ink)", color: "var(--cream-on-ink)", border: "1.5px solid var(--ink)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted-on-ink)", marginBottom: 4 }}>SPARSE REQUEST VIEW</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 2, color: "var(--amber-on-ink)" }}>FILTER IS NARROW. SHOW ALL REQUESTS FOR THE FULL QUEUE.</div>
          </div>
          <button onClick={() => setFilter("ALL")} style={{ padding: "8px 14px", background: "transparent", border: "1px solid var(--amber-text)", color: "var(--amber-on-ink)", fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, cursor: "pointer" }}>SHOW ALL</button>
        </div>
      )}

      <AppDetailModal app={detail} onClose={() => setDetail(null)} onApprove={approve} onReject={reject} />
      <toast.Toaster />
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  NOT FOUND
// ══════════════════════════════════════════════════════════════════════
function NotFoundScreen({ onGoHome }) {
  return (
    <div style={{ minHeight: "calc(100vh - 62px)", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 44px" }}>
      <div style={{ textAlign: "center", animation: "fadeUp .5s ease" }}>
        <div style={{ position: "relative", display: "inline-block", marginBottom: 24 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 160, color: "var(--ink)", lineHeight: 1, letterSpacing: -4, userSelect: "none" }}>404</div>
          <div style={{ position: "absolute", top: "50%", right: -20, transform: "translateY(-50%) rotate(-12deg)", border: "3px solid var(--red)", padding: "6px 14px", animation: "stampDrop .6s ease .3s both" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 3, color: "var(--red)" }}>LOST</div>
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 2, color: "var(--ink)", marginBottom: 10 }}>PAGE NOT FOUND</div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 16, color: "var(--muted)", fontStyle: "italic", marginBottom: 32, lineHeight: 1.7 }}>
          The page you're looking for boarded the wrong bus.<br />Let's get you back on route.
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Btn variant="primary" size="md" onClick={onGoHome}>← GO HOME</Btn>
          <Btn variant="secondary" size="md" onClick={() => window.history.back()}>GO BACK</Btn>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  PLACEHOLDER
// ══════════════════════════════════════════════════════════════════════
function Placeholder({ name }) {
  return (
    <div style={{ minHeight: 420, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14, border: "2px dashed var(--rule)", margin: "24px 0", animation: "fadeIn .3s ease", background: "var(--surface)" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 2, color: "var(--muted)" }}>{name.toUpperCase()}</div>
      <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)" }}>Import this screen from the appropriate file</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--rule)" }}>PLACEHOLDER · REPLACE WITH REAL COMPONENT</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  SCREENS REGISTRY
// ══════════════════════════════════════════════════════════════════════
const SCREENS = {
  dashboard: PassengerDashboard,
  apply: ApplyPass,
  profile: PassengerProfile,
  renew: RenewalFlow,
  busmap: BusRouteMap,
  tickets: TicketBooking,
  taxi: NearbyTaxis,
  notifications: NotificationsScreen,
  routes: RouteManagerClone,
  users: UserManagerClone,
  analytics: AnalyticsDashboardClone,
  announce: AnnouncementSenderClone,
  hub: AdminHub,
  conductor: CameraScanner,
  camera: CameraScanner,
  triplog: TripLog,
  lookup: ManualLookup,
};

// ══════════════════════════════════════════════════════════════════════
//  FOOTER  (premium public transit branding)
// ══════════════════════════════════════════════════════════════════════
function Footer() {
  const [time, setTime] = useState(new Date());
  const [routeStatuses] = useState([
    { code: "R1", name: "Red Line", color: "#B02020", status: "ON TIME", delay: 0 },
    { code: "R2", name: "Blue Line", color: "#1A4A8A", status: "14 MIN DELAY", delay: 14 },
    { code: "R3", name: "Green Line", color: "#1E6641", status: "ON TIME", delay: 0 },
  ]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hh = String(time.getHours()).padStart(2, "0");
  const mm = String(time.getMinutes()).padStart(2, "0");

  return (
    <footer style={{ background: "var(--ink)", borderTop: "3px solid var(--amber)" }}>

      {/* ── Live route status bar ── */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,.06)",
        padding: "12px 44px", maxWidth: 1200, margin: "0 auto"
      }}>
        <div style={{ display: "flex", gap: 0, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 6, letterSpacing: 4,
            color: "var(--muted-on-ink)", marginRight: 20, flexShrink: 0
          }}>LIVE STATUS</div>
          {routeStatuses.map((r, i) => (
            <div key={r.code} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 16px",
              borderLeft: i > 0 ? "1px solid rgba(255,255,255,.08)" : "none"
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: r.delay > 0 ? "#F0A830" : "#52B788",
                animation: "pulseDot 2s ease-in-out infinite"
              }} />
              <div style={{ width: 3, height: 14, background: r.color, borderRadius: 1 }} />
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2,
                color: "var(--cream-on-ink)", fontWeight: 700
              }}>{r.code}</span>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 1,
                color: r.delay > 0 ? "#F0A830" : "#52B788"
              }}>{r.status}</span>
            </div>
          ))}
          {/* Live clock on the right */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%", background: "#52B788",
              animation: "pulseDot 1.5s ease-in-out infinite"
            }} />
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 4,
              color: "var(--amber-on-ink)"
            }}>{hh}:{mm}</span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 6, letterSpacing: 3,
              color: "var(--muted-on-ink)"
            }}>
              {time.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" }).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main footer body ── */}
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "40px 44px 32px",
        display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1.2fr",
        gap: 40, alignItems: "start"
      }}>

        {/* Col 1 — Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 0, marginBottom: 16 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 2, color: "var(--cream-on-ink)" }}>BUSP</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 2, color: "var(--amber-on-ink)" }}>ASS</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 2, color: "var(--cream-on-ink)" }}>PRO</span>
          </div>
          <div style={{
            fontFamily: "var(--font-serif)", fontSize: 16,
            color: "var(--muted-on-ink)", lineHeight: 1.8, marginBottom: 24,
            fontStyle: "italic", maxWidth: 260
          }}>
            Public City Transit Pass System. Serving <em>everyone</em> — students, seniors, daily commuters.
          </div>
          {/* Passenger type icons */}
          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            {PASSENGER_TYPES.map(p => (
              <div key={p.id} title={`${p.label}${p.disc > 0 ? " — " + p.disc + "% off" : ""}`}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: p.color, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 16,
                  border: "2px solid rgba(255,255,255,.1)",
                  transition: "transform .18s, border-color .18s",
                  cursor: "default"
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.15)"; e.currentTarget.style.borderColor = "rgba(240,168,48,.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.1)"; }}>
                {p.icon}
              </div>
            ))}
          </div>
          {/* Newsletter */}
          <div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 4,
              color: "var(--muted-on-ink)", marginBottom: 10
            }}>GET TRANSIT ALERTS</div>
            <div style={{ display: "flex", gap: 0 }}>
              <input placeholder="your@email.com"
                style={{
                  flex: 1, padding: "12px 16px",
                  background: "rgba(255,255,255,.07)", border: "1.5px solid rgba(255,255,255,.12)",
                  borderRight: "none", fontFamily: "var(--font-sans)", fontSize: 14,
                  color: "var(--cream-on-ink)", outline: "none",
                  "::placeholder": { color: "var(--muted-on-ink)" }
                }} />
              <button style={{
                padding: "12px 20px",
                background: "var(--amber)", border: "none",
                fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: 2,
                color: "var(--ink)", cursor: "pointer",
                transition: "background .18s"
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#F0A830"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--amber)"}>
                →
              </button>
            </div>
          </div>
        </div>

        {/* Col 2 — Transit Lines */}
        <div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 4,
            color: "var(--amber-on-ink)", marginBottom: 16,
            paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,.08)"
          }}>
            TRANSIT LINES
          </div>
          {CITY_ROUTES.map(r => (
            <div key={r.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <div style={{ width: 20, height: 3, background: r.color, borderRadius: 1 }} />
                <span style={{
                  fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: 2,
                  color: "var(--cream-on-ink)"
                }}>{r.name.toUpperCase()}</span>
              </div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 6, letterSpacing: 1,
                color: "var(--muted-on-ink)", lineHeight: 1.9, paddingLeft: 28
              }}>
                {r.src} → {r.dst}<br />
                {r.km}km · ~{r.min}min · ₹{r.fare}/mo
              </div>
            </div>
          ))}
        </div>

        {/* Col 3 — Pass Types */}
        <div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 4,
            color: "var(--amber-on-ink)", marginBottom: 16,
            paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,.08)"
          }}>
            PASS TYPES
          </div>
          {PASS_DURATIONS.map(d => (
            <div key={d.id} style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 10,
              paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,.04)"
            }}>
              <div>
                <div style={{
                  fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: 2,
                  color: "var(--cream-on-ink)"
                }}>{d.label}</div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 6, letterSpacing: 1,
                  color: "var(--muted-on-ink)"
                }}>{d.desc}</div>
              </div>
              {d.disc > 0 && (
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1,
                  color: "var(--green-on-ink)", background: "rgba(82,183,136,.12)",
                  padding: "2px 7px"
                }}>-{d.disc}%</div>
              )}
            </div>
          ))}
        </div>

        {/* Col 4 — Discounts */}
        <div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 4,
            color: "var(--amber-on-ink)", marginBottom: 16,
            paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,.08)"
          }}>
            CONCESSIONS
          </div>
          {PASSENGER_TYPES.filter(p => p.disc > 0).map(p => (
            <div key={p.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 12
            }}>
              <span style={{ fontSize: 16 }}>{p.icon}</span>
              <div>
                <div style={{
                  fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: 1,
                  color: "var(--cream-on-ink)"
                }}>{p.label}</div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 6, letterSpacing: 1,
                  color: "var(--green-on-ink)"
                }}>{p.disc}% OFF</div>
              </div>
            </div>
          ))}
        </div>

        {/* Col 5 — Tech stack + links */}
        <div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 4,
            color: "var(--amber-on-ink)", marginBottom: 16,
            paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,.08)"
          }}>
            BUILT WITH
          </div>
          {[
            ["Django REST Framework", "Backend API"],
            ["React + Vite", "Frontend"],
            ["WebSocket", "Live tracking"],
            ["Razorpay", "Payments"],
            ["AI Route Optimizer", "Smart routing"],
            ["PostgreSQL + Redis", "Database"],
          ].map(([name, sub]) => (
            <div key={name} style={{ marginBottom: 10 }}>
              <div style={{
                fontFamily: "var(--font-sans)", fontSize: 11,
                color: "var(--cream-on-ink)", fontWeight: 500
              }}>{name}</div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 6, letterSpacing: 1,
                color: "var(--muted-on-ink)"
              }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,.06)",
        padding: "14px 44px", maxWidth: 1200, margin: "0 auto",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 12
      }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 6, letterSpacing: 3,
          color: "var(--muted-on-ink)"
        }}>
          © 2024 BUSPASSPRO · ALL RIGHTS RESERVED · PUBLIC CITY TRANSIT SYSTEM
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {["TERMS", "PRIVACY", "SUPPORT", "ACCESSIBILITY", "CONTACT"].map(l => (
            <span key={l} style={{
              fontFamily: "var(--font-mono)", fontSize: 6, letterSpacing: 2,
              color: "var(--muted-on-ink)", cursor: "pointer", transition: "color .18s"
            }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--amber-on-ink)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--muted-on-ink)"}>
              {l}
            </span>
          ))}
        </div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 6, letterSpacing: 2,
          color: "var(--muted-on-ink)"
        }}>
          DJANGO + REACT · WEBSOCKET · AI POWERED
        </div>
      </div>
    </footer>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════════════════════════
export default function App() {
  const [auth, setAuth] = useState({ loggedIn: false, role: "passenger" });
  const [authView, setAuthView] = useState("login");
  const [page, setPage] = useState("dashboard");
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
  const toast = useToast();

  const handleLogin = role => {
    const uiRole = role === "student" ? "passenger" : role;
    setAuth({ loggedIn: true, role: uiRole });
    setPage(DEFAULT_PAGE[uiRole] || "dashboard");
    toast.success(`Welcome! Signed in as ${uiRole}.`);
  };
  const handleLogout = () => { setAuth({ loggedIn: false, role: "passenger" }); setAuthView("login"); setPage("dashboard"); toast.info("Signed out."); };
  const navItems = NAV_CONFIG[auth.role] || NAV_CONFIG.passenger;

  const renderPage = () => {
    if (auth.role === "admin" && page === "admin") return <AdminApplicationsClone onNavigate={setPage} toast={toast} />;
    const Screen = SCREENS[page];
    if (Screen) return <div key={page} style={{ animation: "fadeUp .3s ease" }}><Screen onNavigate={setPage} auth={auth} toast={toast} /></div>;
    return <NotFoundScreen onGoHome={() => setPage(DEFAULT_PAGE[auth.role] || "dashboard")} />;
  };

  const ROLE_DISPLAY = { passenger: "Aryan Sharma", admin: "Administrator" };
  const ROLE_SUB = { passenger: "PASSENGER", admin: "SYSTEM ADMIN" };

  if (!auth.loggedIn) return (
    <>
      <style>{CSS}</style>
      {authView === "login" && <LoginScreen onLogin={handleLogin} onRegister={() => setAuthView("register")} onForgot={() => setAuthView("forgot")} />}
      {authView === "register" && <RegisterScreen onDone={() => setAuthView("login")} onBack={() => setAuthView("login")} />}
      {authView === "forgot" && <ForgotPasswordScreen onDone={() => setAuthView("login")} onBack={() => setAuthView("login")} />}
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", flexDirection: "column" }}>

        <Ticker />

        {/* Header */}
        <header style={{ borderBottom: "1px solid var(--rule)", padding: "0 44px", display: "flex", alignItems: "center", gap: 24, background: "var(--cream)", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)", boxShadow: "0 1px 0 var(--rule), 0 4px 16px rgba(26,18,8,.04)" }}>

          {/* Logo */}
          <div style={{ padding: "18px 0", display: "flex", alignItems: "baseline", gap: 0, flexShrink: 0, cursor: "pointer" }} onClick={() => setPage(DEFAULT_PAGE[auth.role] || "dashboard")}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 26, letterSpacing: 2, color: "var(--ink)" }}>BUS</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 26, letterSpacing: 2, color: "var(--amber)" }}>PASS</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 26, letterSpacing: 2, color: "var(--ink)" }}>PRO</span>
          </div>

          {/* Role badge */}
          <div style={{ padding: "5px 12px", background: "var(--parchment)", borderRadius: "var(--r-full)", border: "1px solid var(--rule)", flexShrink: 0 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 3, color: "var(--amber-text)" }}>{ROLE_SUB[auth.role]}</span>
          </div>

          <div style={{ width: 1, height: 28, background: "var(--rule)", flexShrink: 0 }} />

          {/* Nav */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {navItems.map(({ label, page: pg }) => (
              <button key={label} onClick={() => setPage(pg)}
                style={{ background: "none", border: "none", fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: 3, color: page === pg ? "var(--ink)" : "var(--muted)", padding: "24px 16px", flexShrink: 0, borderBottom: `3px solid ${page === pg ? "var(--amber)" : "transparent"}`, transition: "color .18s, border-color .18s", position: "relative" }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* Right cluster */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <NotificationBell notifs={notifs} setNotifs={setNotifs} onOpenNotifications={() => setPage("notifications")} />
            <div style={{ width: 1, height: 28, background: "var(--rule)" }} />
            <div style={{ textAlign: "right", cursor: "pointer" }} onClick={() => setPage("profile")}>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--ink)", fontWeight: 500 }}>{ROLE_DISPLAY[auth.role]}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase" }}>{ROLE_SUB[auth.role]}</div>
            </div>
            <button onClick={handleLogout}
              style={{ padding: "8px 18px", border: "1.5px solid var(--rule)", borderRadius: "var(--r-sm)", background: "none", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 2, color: "var(--muted)", cursor: "pointer", transition: "border-color .18s, color .18s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--ink)"; e.currentTarget.style.color = "var(--ink)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--rule)"; e.currentTarget.style.color = "var(--muted)"; }}>
              SIGN OUT
            </button>
          </div>
        </header>

        {/* Main */}
        <main style={{ flex: 1, maxWidth: 1200, width: "100%", margin: "0 auto", padding: "40px 44px 80px" }}>
          {renderPage()}
        </main>

        <Footer />
      </div>

      <AIChatbot role={auth.role} onNavigate={setPage} />
      <toast.Toaster />
    </>
  );
}