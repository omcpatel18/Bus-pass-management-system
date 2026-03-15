/**
 * ══════════════════════════════════════════════════════════════════════
 *  BUSPASSPRO — UNIFIED App.jsx
 *  The single entry point that connects ALL screens.
 *
 *  WHAT THIS FILE DOES:
 *  ─────────────────────────────────────────────────────────────────
 *  ① Pre-auth routing  — Login, Register, Forgot Password
 *  ② Post-auth routing — All 18 screens for 3 roles
 *  ③ Fixed NAV         — Correct links for Student / Admin / Conductor
 *  ④ Notification bell — Live unread badge in header
 *  ⑤ App Detail Modal  — Admin can open full application detail
 *  ⑥ 404 screen        — Fallback for unknown routes
 *
 *  INSTALL:
 *  ─────────────────────────────────────────────────────────────────
 *  1. Place this file at  src/App.jsx
 *  2. Make sure these files exist alongside it:
 *       src/screens/StudentProfile.jsx     (export default StudentProfile)
 *       src/screens/MissingScreens.jsx     (named exports)
 *  3. npm run dev  →  open http://localhost:5173
 *
 *  FOR FYP DEMO (no backend):
 *  All mock data is embedded. Every credential works in demo mode.
 * ══════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, useRef } from "react";
import StudentProfile from "./screens/StudentProfile";
import StudentDashboard from "./screens/StudentDashboard";
import ApplyPass from "./screens/ApplyPass";
import AdminHub from "./screens/AdminHub";
import NearbyTaxis from "./screens/NearbyTaxis";
import TicketBooking from "./screens/TicketBooking";
import { ToastProvider } from "./hooks/useToast";
import {
  RegisterScreen, ForgotPasswordScreen, NotificationsScreen,
  RouteManager, UserManager, AnalyticsDashboard, AnnouncementSender,
  RenewalFlow, BusRouteMap, CameraScanner, TripLog, ManualLookup,
} from "./screens/MissingScreens";

// ══════════════════════════════════════════════════════════════════════
//  DESIGN TOKENS  (identical to DesignSystem.jsx — do NOT change)
// ══════════════════════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;700&family=Instrument+Sans:wght@400;500;600&display=swap');

*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --cream:#F6F0E4;  --surface:#FDFAF3;  --parchment:#EDE4CC;
  --ink:#1A1208;    --ink-mid:#3D2410;
  --amber:#C8832A;  --amber-text:#8B520A; --amber-on-ink:#F0A830;
  --amber-light:#F5D49A;
  --muted:#6B5535;  --rule:#D4C4A0;
  --green:#1E6641;  --green-on-ink:#52B788;
  --red:#B02020;    --cream-on-ink:#F6F0E4; --muted-on-ink:#B09878;
  --success-bg:#EBF7F0; --error-bg:#FDEAEA;
  --warn-bg:#FEF7E6;    --info-bg:#EDF4FD;
  --font-display:'Bebas Neue',sans-serif;
  --font-serif:'DM Serif Display',serif;
  --font-mono:'JetBrains Mono',monospace;
  --font-sans:'Instrument Sans',sans-serif;
}

body { background:var(--cream); color:var(--ink); font-family:var(--font-sans); -webkit-font-smoothing:antialiased; }
button { cursor:pointer; }
input,select,textarea { font-family:var(--font-sans); }

@keyframes tickerScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
@keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn    { from{opacity:0} to{opacity:1} }
@keyframes stampDrop { 0%{transform:scale(2.2)rotate(-8deg);opacity:0} 65%{transform:scale(.92)rotate(3deg);opacity:1} 100%{transform:scale(1)rotate(-3deg);opacity:1} }
@keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
@keyframes shimmer   { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes spin      { to{transform:rotate(360deg)} }
@keyframes scanBar   { 0%{top:0} 100%{top:100%} }
@keyframes pulseDot  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.65)} }
@keyframes bellWiggle{ 0%,100%{transform:rotate(0)} 20%{transform:rotate(-12deg)} 40%{transform:rotate(10deg)} 60%{transform:rotate(-8deg)} 80%{transform:rotate(6deg)} }
`;

// ══════════════════════════════════════════════════════════════════════
//  ROUTE / NAV CONFIGURATION
//  Single source of truth for all nav links per role.
// ══════════════════════════════════════════════════════════════════════
const NAV_CONFIG = {
  student: [
    { label: "DASHBOARD",  page: "dashboard"     },
    { label: "APPLY PASS", page: "apply"         },
    { label: "RENEW",      page: "renew"         },
    { label: "BUS MAP",    page: "busmap"        },
    { label: "TICKETS",    page: "tickets"       },
    { label: "TAXIS",      page: "taxis"         },
    { label: "PROFILE",    page: "profile"       },
  ],
  admin: [
    { label: "HUB",          page: "hub"          },
    { label: "APPLICATIONS", page: "admin"       },
    { label: "ROUTES",       page: "routes"      },
    { label: "STUDENTS",     page: "users"       },
    { label: "ANALYTICS",    page: "analytics"   },
    { label: "ANNOUNCE",     page: "announce"    },
  ],
  conductor: [
    { label: "SCANNER",   page: "conductor"      },
    { label: "CAMERA",    page: "camera"         },
    { label: "TRIP LOG",  page: "triplog"        },
    { label: "LOOKUP",    page: "lookup"         },
  ],
};

// Default landing page after login per role
const DEFAULT_PAGE = { student: "dashboard", admin: "hub", conductor: "conductor" };

// ══════════════════════════════════════════════════════════════════════
//  MOCK NOTIFICATION DATA
// ══════════════════════════════════════════════════════════════════════
const INITIAL_NOTIFS = [
  { id: 1, title: "Pass Approved!",          body: "Your quarterly pass BPP·2024·001234 has been approved.", time: "2 min ago",  read: false, type: "success" },
  { id: 2, title: "Pass Expiring Soon",       body: "Your pass expires in 7 days. Renew to avoid disruption.", time: "1 hr ago",   read: false, type: "warn"    },
  { id: 3, title: "Route B: 12 min delay",   body: "Route Beta is running late due to Ring Road traffic.",    time: "3 hrs ago",  read: true,  type: "info"    },
  { id: 4, title: "Payment Confirmed",        body: "₹1,215 received for pass BPP·2024·001234.",              time: "2 days ago", read: true,  type: "success" },
];

// ══════════════════════════════════════════════════════════════════════
//  MOCK APPLICATION DATA (for Admin detail modal)
// ══════════════════════════════════════════════════════════════════════
const MOCK_APPS = [
  { id: "A-001", student: "Priya Patel",   sid: "ME20B018", email: "priya@college.edu",  dept: "Mechanical Engg", year: "IV Year", route: "Route Alpha", stop: "Library Sq",   type: "Quarterly", status: "PENDING",  date: "01 Mar 2024", amt: 1215, phone: "+91 98765 11111", reason: "Daily commute from home to college." },
  { id: "A-002", student: "Rahul Kumar",   sid: "EC22B091", email: "rahul@college.edu",  dept: "Electronics",     year: "III Year",route: "Route Beta",  stop: "IT Hub",       type: "Monthly",   status: "APPROVED", date: "28 Feb 2024", amt: 650,  phone: "+91 98765 22222", reason: "Part-time job nearby, need evening service." },
  { id: "A-003", student: "Sneha Iyer",    sid: "IT21B055", email: "sneha@college.edu",  dept: "IT",              year: "IV Year", route: "Route Gamma", stop: "Ring Road",    type: "Annual",    status: "PENDING",  date: "02 Mar 2024", amt: 6500, phone: "+91 98765 33333", reason: "Relocating near Airport Road, need full-year pass." },
  { id: "A-004", student: "Amit Singh",    sid: "CS20B031", email: "amit@college.edu",   dept: "CS",              year: "IV Year", route: "Route Alpha", stop: "Main Market",  type: "Quarterly", status: "REJECTED", date: "25 Feb 2024", amt: 1215, phone: "+91 98765 44444", reason: "Regular daily commute." },
  { id: "A-005", student: "Divya Menon",   sid: "CE21B072", email: "divya@college.edu",  dept: "Civil Engg",      year: "III Year",route: "Route Beta",  stop: "Tech Park",    type: "Monthly",   status: "APPROVED", date: "01 Mar 2024", amt: 650,  phone: "+91 98765 55555", reason: "Internship in tech park area." },
];

// ══════════════════════════════════════════════════════════════════════
//  SHARED ATOMS
// ══════════════════════════════════════════════════════════════════════
const Tag = ({ children, color }) => (
  <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 4, color: color || "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>{children}</div>
);

const Rule = ({ my = 20 }) => <div style={{ height: 1, background: "var(--rule)", margin: `${my}px 0` }} />;

const Pill = ({ s }) => {
  const m = { ACTIVE: { bg: "#1E6641", c: "#F6F0E4" }, APPROVED: { bg: "#1E6641", c: "#F6F0E4" }, VALID: { bg: "#1E6641", c: "#F6F0E4" }, PENDING: { bg: "#C8832A", c: "#1A1208" }, REJECTED: { bg: "#B02020", c: "#F6F0E4" }, EXPIRED: { bg: "#6B5535", c: "#F6F0E4" } };
  const p = m[(s || "").toUpperCase()] || m.PENDING;
  return <span style={{ background: p.bg, color: p.c, fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: 2, padding: "3px 10px", clipPath: "polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)", display: "inline-block", lineHeight: 1.7 }}>{(s || "").toUpperCase()}</span>;
};

const Btn = ({ children, onClick, variant = "primary", size = "md", full = false, disabled = false }) => {
  const [h, setH] = useState(false);
  const pad = { sm: "7px 16px", md: "11px 24px", lg: "14px 32px" }[size] || "11px 24px";
  const fs  = { sm: 11, md: 13, lg: 15 }[size] || 13;
  const s = {
    primary:   { bg: h && !disabled ? "#2C1E0A" : "var(--ink)",         color: "var(--amber-on-ink)", border: "none" },
    secondary: { bg: h && !disabled ? "var(--parchment)" : "transparent", color: "var(--ink)",        border: "1.5px solid var(--ink)" },
    danger:    { bg: h && !disabled ? "#8A1818" : "var(--red)",          color: "var(--cream-on-ink)", border: "none" },
    success:   { bg: h && !disabled ? "#155230" : "var(--green)",        color: "var(--cream-on-ink)", border: "none" },
    ghost:     { bg: h && !disabled ? "var(--parchment)" : "transparent", color: "var(--amber-text)", border: "1.5px solid var(--rule)" },
  }[variant] || {};
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ padding: pad, background: s.bg, color: s.color, border: s.border || "none", fontFamily: "var(--font-display)", fontSize: fs, letterSpacing: 2, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1, width: full ? "100%" : "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .18s" }}
    >{children}</button>
  );
};

const Field = ({ label, type = "text", value, onChange, placeholder, error, readOnly }) => {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 3, color: "var(--muted)", textTransform: "uppercase", marginBottom: 7 }}>{label}</div>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
        onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
        style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${error ? "var(--red)" : foc ? "var(--amber)" : "var(--rule)"}`, background: readOnly ? "var(--parchment)" : foc ? "var(--surface)" : "var(--cream)", fontFamily: "var(--font-sans)", fontSize: 14, color: readOnly ? "var(--muted)" : "var(--ink)", outline: "none", transition: "border-color .18s" }} />
      {error && <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--red)", marginTop: 4 }}>{error}</div>}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════
//  TOAST SYSTEM
// ══════════════════════════════════════════════════════════════════════
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), type === "error" ? 6000 : 3500);
  }, []);
  const ICONS = { success: "✓", error: "✕", info: "◆", warn: "⚠" };
  const COLS  = {
    success: { bg: "var(--success-bg)", border: "var(--green)",      text: "var(--green)"      },
    error:   { bg: "var(--error-bg)",   border: "var(--red)",        text: "var(--red)"        },
    info:    { bg: "var(--surface)",    border: "var(--ink)",        text: "var(--ink)"        },
    warn:    { bg: "var(--warn-bg)",    border: "var(--amber-text)", text: "var(--amber-text)" },
  };
  const Toaster = () => (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => {
        const c = COLS[t.type] || COLS.info;
        return <div key={t.id} style={{ background: c.bg, border: `2px solid ${c.border}`, padding: "11px 16px", minWidth: 280, display: "flex", gap: 10, alignItems: "center", animation: "slideDown .3s ease", boxShadow: "0 4px 20px rgba(26,18,8,.12)" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 18, color: c.text }}>{ICONS[t.type]}</span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: c.text }}>{t.msg}</span>
        </div>;
      })}
    </div>
  );
  return { success: m => add(m, "success"), error: m => add(m, "error"), info: m => add(m, "info"), warn: m => add(m, "warn"), Toaster };
}

// ══════════════════════════════════════════════════════════════════════
//  ① PRE-AUTH SCREENS  (Login already exists, now using Register & Forgot)
// ══════════════════════════════════════════════════════════════════════

// ── Login ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, onRegister, onForgot }) {
  const [role, setRole]   = useState("student");
  const [email, setEmail] = useState("");
  const [pw, setPw]       = useState("");
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr("");
    if (!email.trim()) { setErr("Email is required."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700)); // authService.login(email, pw, role)
    setLoading(false);
    onLogin(role);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex" }}>
      {/* Left — dark editorial panel */}
      <div style={{ width: "52%", background: "var(--ink)", position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 56, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, left: -10, fontFamily: "var(--font-display)", fontSize: 220, color: "rgba(200,131,42,0.055)", lineHeight: .85, userSelect: "none", letterSpacing: -8 }}>BUS<br />PASS<br />PRO</div>
        {[70, 140, 210, 280, 350].map((y, i) => <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y, height: 1, background: i % 2 === 0 ? "rgba(200,131,42,0.07)" : "rgba(255,255,255,0.025)" }} />)}
        <div style={{ position: "absolute", top: 40, right: 44, width: 110, height: 150, backgroundImage: "radial-gradient(circle,rgba(240,168,48,.25) 1px,transparent 1px)", backgroundSize: "12px 12px" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 4, color: "var(--amber)", marginBottom: 14 }}>◆ COLLEGE BUS PASS MANAGEMENT SYSTEM</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 68, color: "var(--cream-on-ink)", lineHeight: .9, letterSpacing: 1, marginBottom: 22 }}>YOUR<br />CAMPUS.<br /><span style={{ color: "var(--amber-on-ink)" }}>YOUR RIDE.</span></div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 15, color: "var(--muted-on-ink)", fontStyle: "italic", maxWidth: 320, lineHeight: 1.65, marginBottom: 36 }}>Digital passes, real-time tracking, AI-powered routing — all in one platform.</div>
          <div style={{ display: "flex", gap: 24 }}>
            {[["3", "ROUTES"], ["200+", "STUDENTS"], ["99%", "UPTIME"]].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 30, color: "var(--amber-on-ink)", letterSpacing: 1 }}>{n}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "var(--muted-on-ink)", letterSpacing: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "56px 52px" }}>
        <div style={{ maxWidth: 360, animation: "fadeUp .4s ease" }}>
          <Tag>Sign In</Tag>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "var(--ink)", marginBottom: 28, lineHeight: 1.1 }}>Welcome<br />back.</div>

          {/* Role selector */}
          <div style={{ marginBottom: 22 }}>
            <Tag>Portal Type</Tag>
            <div style={{ display: "flex", border: "1.5px solid var(--ink)" }}>
              {[["student", "🎓 STUDENT"], ["admin", "⚙ ADMIN"], ["conductor", "🔍 CONDUCTOR"]].map(([r, l]) => (
                <button key={r} onClick={() => setRole(r)} style={{ flex: 1, padding: "9px 0", background: role === r ? "var(--ink)" : "transparent", color: role === r ? "var(--amber-on-ink)" : "var(--muted)", border: "none", borderRight: r !== "conductor" ? "1px solid var(--ink)" : "none", fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 1, transition: "all .18s" }}>{l}</button>
              ))}
            </div>
          </div>

          <Field label="Email Address" type="email"    value={email} onChange={e => setEmail(e.target.value)} placeholder="student@college.edu" />
          <Field label="Password"      type="password" value={pw}    onChange={e => setPw(e.target.value)}    placeholder="••••••••" />

          {err && <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--red)", marginBottom: 10 }}>{err}</div>}

          <Btn variant="primary" full size="md" onClick={submit} disabled={loading}>
            {loading ? "SIGNING IN…" : "ENTER PORTAL →"}
          </Btn>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <span onClick={onRegister} style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--amber-text)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>Create account →</span>
            <span onClick={onForgot}   style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)",      cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>Forgot password?</span>
          </div>
          <div style={{ marginTop: 18, fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2, color: "var(--muted)", textAlign: "center" }}>DEMO MODE · ANY CREDENTIALS WORK</div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  ② APPLICATION DETAIL MODAL  (Admin)
// ══════════════════════════════════════════════════════════════════════
function AppDetailModal({ app, onClose, onApprove, onReject }) {
  if (!app) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(26,18,8,.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, animation: "fadeIn .2s ease" }} onClick={onClose}>
      <div style={{ background: "var(--cream)", border: "2px solid var(--ink)", width: 560, maxHeight: "85vh", overflow: "auto", animation: "fadeUp .3s ease" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background: "var(--ink)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 4, color: "var(--muted-on-ink)", marginBottom: 4 }}>APPLICATION DETAIL</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: 1, color: "var(--amber-on-ink)" }}>{app.id}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Pill s={app.status} />
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted-on-ink)", fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1, cursor: "pointer" }}>✕</button>
          </div>
        </div>

        <div style={{ padding: "24px 28px" }}>
          {/* Student info */}
          <Tag>Student Information</Tag>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            {[["Full Name", app.student], ["Student ID", app.sid], ["Email", app.email], ["Phone", app.phone], ["Department", app.dept], ["Year", app.year]].map(([l, v]) => (
              <div key={l} style={{ padding: "9px 0", borderBottom: "1px solid var(--rule)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)" }}>{l}</div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", fontWeight: 500, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>

          <Rule my={20} />

          {/* Pass details */}
          <Tag>Pass Details</Tag>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            {[["Route", app.route], ["Boarding Stop", app.stop], ["Pass Type", app.type], ["Amount", `₹${app.amt.toLocaleString()}`], ["Applied On", app.date]].map(([l, v]) => (
              <div key={l} style={{ padding: "9px 0", borderBottom: "1px solid var(--rule)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)" }}>{l}</div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", fontWeight: 500, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>

          <Rule my={20} />

          {/* Reason */}
          <Tag>Reason for Application</Tag>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", lineHeight: 1.65, background: "var(--surface)", padding: "12px 14px", border: "1px solid var(--rule)", marginBottom: 24 }}>{app.reason}</div>

          {/* Actions */}
          {app.status === "PENDING" && (
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="success" size="md" onClick={() => { onApprove(app.id); onClose(); }}>✓ APPROVE APPLICATION</Btn>
              <Btn variant="danger"  size="md" onClick={() => { onReject(app.id);  onClose(); }}>✕ REJECT</Btn>
              <Btn variant="ghost"   size="md" onClick={onClose}>CANCEL</Btn>
            </div>
          )}
          {app.status !== "PENDING" && (
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="secondary" size="sm" onClick={onClose}>CLOSE</Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  ③ NOTIFICATION BELL  (header widget)
// ══════════════════════════════════════════════════════════════════════
function NotificationBell({ notifs, setNotifs, onOpenNotifications }) {
  const [open, setOpen] = useState(false);
  const unread = notifs.filter(n => !n.read).length;
  const [wiggle, setWiggle] = useState(false);
  const ref = useRef(null);

  // Wiggle when new unread arrives
  useEffect(() => { if (unread > 0) { setWiggle(true); setTimeout(() => setWiggle(false), 600); } }, [unread]);

  // Click outside to close
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  const markRead = id => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  const preview  = notifs.slice(0, 4);

  const TYPE_COLOR = { success: "var(--green)", warn: "var(--amber-text)", info: "var(--ink)" };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ position: "relative", background: "none", border: "none", padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Bell SVG */}
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
          style={{ animation: wiggle ? "bellWiggle .6s ease" : "none" }}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {/* Unread badge */}
        {unread > 0 && (
          <div style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "var(--red)", border: "1.5px solid var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 700, color: "white", lineHeight: 1 }}>
            {unread > 9 ? "9+" : unread}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 340, background: "var(--surface)", border: "1.5px solid var(--ink)", boxShadow: "0 8px 32px rgba(26,18,8,.14)", zIndex: 500, animation: "slideDown .2s ease" }}>
          {/* Header */}
          <div style={{ padding: "12px 16px", borderBottom: "2px solid var(--ink)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: 2, color: "var(--ink)" }}>NOTIFICATIONS {unread > 0 && <span style={{ color: "var(--red)" }}>· {unread}</span>}</div>
            {unread > 0 && <button onClick={() => setNotifs(n => n.map(x => ({ ...x, read: true })))} style={{ background: "none", border: "none", fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)", cursor: "pointer" }}>MARK ALL READ</button>}
          </div>
          {/* Items */}
          {preview.length === 0 && <div style={{ padding: "24px 16px", fontFamily: "var(--font-serif)", fontSize: 14, color: "var(--muted)", fontStyle: "italic", textAlign: "center" }}>All caught up!</div>}
          {preview.map(n => (
            <div key={n.id} onClick={() => markRead(n.id)} style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--rule)", cursor: "pointer", background: n.read ? "transparent" : "var(--warn-bg)", transition: "background .15s" }}>
              <div style={{ width: 4, background: n.read ? "transparent" : TYPE_COLOR[n.type] || "var(--ink)", flexShrink: 0 }} />
              <div style={{ flex: 1, padding: "11px 14px" }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink)", fontWeight: n.read ? 400 : 600 }}>{n.title}</div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", marginTop: 2, lineHeight: 1.5 }}>{n.body.slice(0, 70)}…</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 1, color: "var(--muted)", marginTop: 4 }}>{n.time}</div>
              </div>
            </div>
          ))}
          {/* Footer */}
          <button onClick={() => { setOpen(false); onOpenNotifications(); }} style={{ width: "100%", padding: "11px 0", background: "var(--ink)", color: "var(--amber-on-ink)", border: "none", fontFamily: "var(--font-display)", fontSize: 12, letterSpacing: 3, cursor: "pointer" }}>VIEW ALL NOTIFICATIONS →</button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  ④ 404 — NOT FOUND SCREEN
// ══════════════════════════════════════════════════════════════════════
function NotFoundScreen({ onGoHome }) {
  return (
    <div style={{ minHeight: "calc(100vh - 62px)", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 44px" }}>
      <div style={{ textAlign: "center", animation: "fadeUp .5s ease" }}>
        {/* Big 404 */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: 24 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 160, color: "var(--ink)", lineHeight: 1, letterSpacing: -4, userSelect: "none" }}>404</div>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: "var(--font-display)", fontSize: 160, color: "transparent", WebkitTextStroke: "2px var(--amber)", lineHeight: 1, letterSpacing: -4, userSelect: "none", opacity: 0.2, marginTop: 4, marginLeft: 4 }}>404</div>
          {/* Stamp overlay */}
          <div style={{ position: "absolute", top: "50%", right: -20, transform: "translateY(-50%) rotate(-12deg)", border: "3px solid var(--red)", padding: "6px 14px", animation: "stampDrop .6s ease .3s both" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 3, color: "var(--red)" }}>LOST</div>
          </div>
        </div>

        <div style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 2, color: "var(--ink)", marginBottom: 10 }}>PAGE NOT FOUND</div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 16, color: "var(--muted)", fontStyle: "italic", marginBottom: 32, lineHeight: 1.6 }}>
          The page you're looking for took the wrong bus.<br />Let's get you back on route.
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Btn variant="primary"   size="md" onClick={onGoHome}>← GO HOME</Btn>
          <Btn variant="secondary" size="md" onClick={() => window.history.back()}>GO BACK</Btn>
        </div>

        {/* Decorative ruled lines */}
        <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 8, opacity: 0.15 }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: 1, background: "var(--ink)", width: 200, margin: "0 auto" }} />)}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 4, color: "var(--muted)", marginTop: 16 }}>BUSPASSPRO · ERROR 404 · PAGE MISSING</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  TICKER BAR
// ══════════════════════════════════════════════════════════════════════
const TICKER_MSGS = ["ROUTE A: ON TIME", "ROUTE B: 4 MIN DELAY", "ROUTE C: ON TIME", "EXAM WEEK: HIGH DEMAND", "NEW STOP: TECH PARK GATE 2", "PASS RENEWAL: MARCH DEADLINE"];
function Ticker() {
  const t = [...TICKER_MSGS, ...TICKER_MSGS].join("   ◆   ");
  return (
    <div style={{ background: "var(--ink)", color: "var(--amber-on-ink)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 2, overflow: "hidden", padding: "5px 0", borderBottom: "2px solid var(--amber)" }}>
      <div style={{ display: "flex", animation: "tickerScroll 28s linear infinite", whiteSpace: "nowrap" }}>
        <span style={{ paddingRight: 80 }}>{t}</span>
        <span style={{ paddingRight: 80 }}>{t}</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  PLACEHOLDER (used while real screen files are not yet imported)
//  Delete each one once you import the real component.
// ══════════════════════════════════════════════════════════════════════
function Placeholder({ name }) {
  return (
    <div style={{ minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, border: "2px dashed var(--rule)", margin: 24, animation: "fadeIn .3s ease" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 2, color: "var(--muted)" }}>{name.toUpperCase()}</div>
      <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)" }}>Import this screen from MissingScreens.jsx or StudentProfile.jsx</div>
    </div>
  );
}

// Screen registry — replace Placeholder with real imports
const SCREENS = {
  // ── Student ──
  dashboard:     () => <StudentDashboard />,
  apply:         () => <ApplyPass />,
  profile:       () => <StudentProfile />,
  renew:         () => <RenewalFlow />,
  tickets:       () => <TicketBooking />,
  taxis:         () => <NearbyTaxis />,
  busmap:        () => <BusRouteMap />,
  notifications: () => <NotificationsScreen />,
  // ── Admin ──
  hub:           () => <AdminHub />,
  admin:         () => <AdminApplications />,
  routes:        () => <RouteManager />,
  users:         () => <UserManager />,
  analytics:     () => <AnalyticsDashboard />,
  announce:      () => <AnnouncementSender />,
  // ── Conductor ──
  conductor:     () => <Placeholder name="Conductor Scanner" />,
  camera:        () => <CameraScanner />,
  triplog:       () => <TripLog />,
  lookup:        () => <ManualLookup />,
};

// ══════════════════════════════════════════════════════════════════════
//  ADMIN DASHBOARD (inline — applications table with detail modal)
// ══════════════════════════════════════════════════════════════════════
function AdminApplications() {
  const [apps, setApps]   = useState(MOCK_APPS);
  const [filter, setFilter] = useState("ALL");
  const [detail, setDetail] = useState(null);
  const toast = useToast();

  const approve = id => { setApps(a => a.map(x => x.id === id ? { ...x, status: "APPROVED" } : x)); toast.success("Application approved!"); };
  const reject  = id => { setApps(a => a.map(x => x.id === id ? { ...x, status: "REJECTED" } : x)); toast.warn("Application rejected."); };

  const visible = filter === "ALL" ? apps : apps.filter(a => a.status === filter);
  const counts  = { ALL: apps.length, PENDING: apps.filter(a => a.status === "PENDING").length, APPROVED: apps.filter(a => a.status === "APPROVED").length, REJECTED: apps.filter(a => a.status === "REJECTED").length };

  return (
    <>
      {/* Stats strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "3px solid var(--ink)", borderBottom: "1px solid var(--rule)", marginBottom: 24 }}>
        {[["TOTAL", apps.length, "var(--ink)"], ["PENDING", counts.PENDING, "var(--amber-text)"], ["APPROVED", counts.APPROVED, "var(--green)"], ["REJECTED", counts.REJECTED, "var(--red)"]].map(([l, n, c], i) => (
          <div key={l} style={{ padding: "18px 22px", textAlign: "center", borderRight: i < 3 ? "1px solid var(--rule)" : "none" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: 1, color: c, lineHeight: 1 }}>{n}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)", marginTop: 6 }}>APPLICATIONS — {l}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 18px", background: filter === f ? "var(--ink)" : "transparent", color: filter === f ? "var(--amber-on-ink)" : "var(--muted)", border: "1.5px solid var(--ink)", fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2, cursor: "pointer", transition: "all .18s" }}>{f} ({counts[f] ?? apps.filter(a => a.status === f).length})</button>
        ))}
      </div>

      {/* Table header */}
      <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 120px 90px 80px 80px 140px", gap: 12, padding: "6px 12px", borderBottom: "2px solid var(--ink)" }}>
        {["ID", "STUDENT", "ROUTE", "TYPE", "DATE", "AMT", "ACTION"].map(h => <span key={h} style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)" }}>{h}</span>)}
      </div>

      {visible.map((app, i) => (
        <div key={app.id} style={{ display: "grid", gridTemplateColumns: "70px 1fr 120px 90px 80px 80px 140px", gap: 12, padding: "13px 12px", borderBottom: "1px solid var(--rule)", alignItems: "center", background: i % 2 === 0 ? "var(--surface)" : "var(--cream)", animation: `fadeUp .3s ease ${i * 0.05}s both` }}>
          <button onClick={() => setDetail(app)} style={{ background: "none", border: "none", fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1, color: "var(--amber-text)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3, textAlign: "left" }}>{app.id}</button>
          <div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{app.student}</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)" }}>{app.sid}</div>
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)" }}>{app.route}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1, color: "var(--muted)" }}>{app.type}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>{app.date.slice(0, 6)}</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--ink)", letterSpacing: 1 }}>₹{app.amt.toLocaleString()}</div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setDetail(app)} style={{ padding: "4px 8px", background: "none", border: "1px solid var(--rule)", fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 1, color: "var(--muted)", cursor: "pointer" }}>DETAIL</button>
            {app.status === "PENDING" && (
              <>
                <button onClick={() => approve(app.id)} style={{ padding: "4px 8px", background: "var(--green)", border: "none", fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 1, color: "var(--cream-on-ink)", cursor: "pointer" }}>✓</button>
                <button onClick={() => reject(app.id)}  style={{ padding: "4px 8px", background: "none", border: "1px solid var(--red)", fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 1, color: "var(--red)", cursor: "pointer" }}>✕</button>
              </>
            )}
            {app.status !== "PENDING" && <Pill s={app.status} />}
          </div>
        </div>
      ))}

      <AppDetailModal app={detail} onClose={() => setDetail(null)} onApprove={approve} onReject={reject} />
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  MAIN APP  —  root component
// ══════════════════════════════════════════════════════════════════════
export default function App() {
  // ── Auth state ──────────────────────────────────────────────────────
  const [auth, setAuth]     = useState({ loggedIn: false, role: "student" });
  const [authView, setAuthView] = useState("login"); // "login" | "register" | "forgot"

  // ── Navigation ──────────────────────────────────────────────────────
  const [page, setPage] = useState("dashboard");

  // ── Notifications ───────────────────────────────────────────────────
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);

  // ── Toast ───────────────────────────────────────────────────────────
  const toast = useToast();

  // ── Handlers ────────────────────────────────────────────────────────
  const handleLogin = (role) => {
    setAuth({ loggedIn: true, role });
    setPage(DEFAULT_PAGE[role] || "dashboard");
    toast.success(`Signed in as ${role}.`);
  };
  const handleLogout = () => {
    setAuth({ loggedIn: false, role: "student" });
    setAuthView("login");
    setPage("dashboard");
    toast.info("Signed out.");
  };
  const navItems = NAV_CONFIG[auth.role] || NAV_CONFIG.student;

  // ── Render page ──────────────────────────────────────────────────────
  const renderPage = () => {
    // Admin applications is the only one with its detail modal inline
    if ((auth.role === "admin" || page === "admin") && page === "admin") return <AdminApplications />;
    const Screen = SCREENS[page];
    if (Screen) return <Screen />;
    return <NotFoundScreen onGoHome={() => setPage(DEFAULT_PAGE[auth.role] || "dashboard")} />;
  };

  // ── Pre-auth views ───────────────────────────────────────────────────
  if (!auth.loggedIn) return (
    <>
      <style>{CSS}</style>
      {authView === "login"    && <LoginScreen      onLogin={handleLogin} onRegister={() => setAuthView("register")} onForgot={() => setAuthView("forgot")} />}
      {authView === "register" && <RegisterScreen   onDone={() => setAuthView("login")} onBackToLogin={() => setAuthView("login")} />}
      {authView === "forgot"   && <ForgotPasswordScreen onDone={() => setAuthView("login")} onBackToLogin={() => setAuthView("login")} />}
    </>
  );

  // ── Post-auth shell ───────────────────────────────────────────────────
  return (
    <ToastProvider>
      <>
        <style>{CSS}</style>
        <div style={{ minHeight: "100vh", background: "var(--cream)" }}>

          {/* Ticker */}
          <Ticker />

        {/* Top nav */}
        <header style={{ borderBottom: "1px solid var(--rule)", padding: "0 44px", display: "flex", alignItems: "center", gap: 32, background: "var(--cream)", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(8px)" }}>
          {/* Logo */}
          <div style={{ padding: "15px 0", display: "flex", alignItems: "baseline", gap: 1, flexShrink: 0 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: 2, color: "var(--ink)" }}>BUSP</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: 2, color: "var(--amber)" }}>ASS</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: 2, color: "var(--ink)" }}>PRO</span>
          </div>
          <div style={{ width: 1, height: 22, background: "var(--rule)", flexShrink: 0 }} />

          {/* Nav links */}
          {navItems.map(({ label, page: pg }) => (
            <button key={label} onClick={() => setPage(pg)} style={{ background: "none", border: "none", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 3, color: page === pg ? "var(--ink)" : "var(--muted)", padding: "20px 0", borderBottom: `2px solid ${page === pg ? "var(--amber)" : "transparent"}`, transition: "color .18s, border-color .18s", whiteSpace: "nowrap" }}>{label}</button>
          ))}

          <div style={{ flex: 1 }} />

          {/* Right side: bell + user + sign out */}
          <NotificationBell notifs={notifs} setNotifs={setNotifs} onOpenNotifications={() => setPage("notifications")} />

          <div style={{ width: 1, height: 22, background: "var(--rule)", flexShrink: 0, margin: "0 4px" }} />

          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>
              {auth.role === "student" ? "Aryan Sharma" : auth.role === "admin" ? "Administrator" : "Ramesh Kumar"}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase" }}>{auth.role}</div>
          </div>

          <button onClick={handleLogout} style={{ padding: "6px 14px", border: "1px solid var(--rule)", background: "none", fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2, color: "var(--muted)", transition: "border-color .18s" }}>SIGN OUT</button>
        </header>

        {/* Page content */}
        <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 44px 80px" }}>
          {renderPage()}
        </main>

        {/* Footer */}
        <footer style={{ borderTop: "3px double var(--ink)", padding: "18px 44px", display: "flex", justifyContent: "space-between", background: "var(--parchment)" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)" }}>BUSPASSPRO · COLLEGE BUS MANAGEMENT SYSTEM · FYP 2024–25</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)" }}>DJANGO + REACT · WEBSOCKET · AI POWERED</div>
        </footer>
      </div>

        <toast.Toaster />
      </>
    </ToastProvider>
  );
}
