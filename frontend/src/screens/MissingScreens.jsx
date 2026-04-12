/**
 * ══════════════════════════════════════════════════════════════════════
 *  BUSPASSPRO — ALL MISSING FRONTEND SCREENS
 *  Design System v2.0 compliant · WCAG AA throughout
 *
 *  SCREENS INSIDE THIS FILE:
 *  ─────────────────────────────────────────────────
 *  PRIORITY 1 — Blockers
 *    1. RegisterScreen       — Student sign-up (4-step)
 *    2. ForgotPasswordScreen — OTP-based reset
 *    3. NotificationsScreen  — Bell + notification list
 *
 *  PRIORITY 2 — Admin
 *    4. RouteManager         — Add / edit / delete routes
 *    5. UserManager          — Student list + profile view
 *    6. AnalyticsDashboard   — Charts, trends, revenue
 *    7. AnnouncementSender   — Broadcast messages
 *
 *  PRIORITY 3 — Student
 *    8. RenewalFlow          — Quick 1-click renewal
 *    9. BusRouteMap          — Stop-by-stop route view
 *
 *  PRIORITY 4 — Conductor
 *   10. CameraScanner        — Real jsQR camera scan
 *   11. TripLog              — Daily scan report
 *   12. ManualLookup         — Search by student ID
 *
 *  HOW TO ADD TO APP (BusPassPro.jsx):
 *  ────────────────────────────────────
 *  import { RegisterScreen, ForgotPasswordScreen, NotificationsScreen,
 *           RouteManager, UserManager, AnalyticsDashboard,
 *           AnnouncementSender, RenewalFlow, BusRouteMap,
 *           CameraScanner, TripLog, ManualLookup } from './MissingScreens'
 *
 *  NAV update:
 *    student:   [..., ["NOTIFICATIONS","notifications"], ["RENEW","renew"]]
 *    admin:     [..., ["ROUTES","routes"], ["USERS","users"],
 *                     ["ANALYTICS","analytics"], ["ANNOUNCE","announce"]]
 *    conductor: [..., ["CAMERA","camera"], ["TRIP LOG","triplog"],
 *                     ["LOOKUP","lookup"]]
 *
 *  Routing (inside App function):
 *    if(page==="register")       return <RegisterScreen onDone={...} />
 *    if(page==="forgot")         return <ForgotPasswordScreen onDone={...} />
 *    if(page==="notifications")  return <NotificationsScreen />
 *    if(page==="routes")         return <RouteManager />
 *    if(page==="users")          return <UserManager />
 *    if(page==="analytics")      return <AnalyticsDashboard />
 *    if(page==="announce")       return <AnnouncementSender />
 *    if(page==="renew")          return <RenewalFlow pass={currentPass} />
 *    if(page==="busmap")         return <BusRouteMap />
 *    if(page==="camera")         return <CameraScanner />
 *    if(page==="triplog")        return <TripLog />
 *    if(page==="lookup")         return <ManualLookup />
 * ══════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ── Global styles + CSS variables (matches DesignSystem.jsx) ─────────
const G = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;700&family=Instrument+Sans:wght@400;500;600&display=swap');
:root {
  --cream:#F6F0E4; --surface:#FDFAF3; --parchment:#EDE4CC;
  --ink:#1A1208; --ink-mid:#3D2410;
  --amber-text:#8B520A; --muted:#6B5535;
  --green:#1E6641; --red:#B02020;
  --amber-on-ink:#F0A830; --cream-on-ink:#F6F0E4;
  --green-on-ink:#52B788; --red-on-ink:#FF6B6B; --muted-on-ink:#B09878;
  --amber:#C8832A; --rule:#D4C4A0; --amber-light:#F5D49A;
  --success-bg:#EBF7F0; --error-bg:#FDEAEA; --warn-bg:#FEF7E6; --info-bg:#EDF4FD;
  --font-display:'Bebas Neue',sans-serif; --font-serif:'DM Serif Display',serif;
  --font-mono:'JetBrains Mono',monospace; --font-sans:'Instrument Sans',sans-serif;
}
@keyframes fadeUp  {from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn  {from{opacity:0}to{opacity:1}}
@keyframes spin    {to{transform:rotate(360deg)}}
@keyframes shimmer {0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes stampIn {0%{transform:scale(2.2)rotate(-8deg);opacity:0}65%{transform:scale(.95)rotate(2deg);opacity:1}100%{transform:scale(1)rotate(-3deg);opacity:1}}
@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@keyframes scanPulse{0%,100%{box-shadow:0 0 0 0 rgba(200,131,42,.4)}70%{box-shadow:0 0 0 12px rgba(200,131,42,0)}}
`;

// ── Shared atoms ──────────────────────────────────────────────────────
const Tag = ({ children }) => (
  <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 4, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>{children}</div>
);
const Rule = ({ my = 20 }) => <div style={{ height: 1, background: "var(--rule)", margin: `${my}px 0` }} />;
const DoubleRule = ({ my = 28 }) => <div style={{ borderTop: "3px double var(--ink)", margin: `${my}px 0` }} />;

const Pill = ({ s }) => {
  const STATUS = (s || "").toUpperCase();
  const map = { ACTIVE: { bg: "#1E6641", c: "#F6F0E4" }, VALID: { bg: "#1E6641", c: "#F6F0E4" }, APPROVED: { bg: "#1E6641", c: "#F6F0E4" }, PENDING: { bg: "#C8832A", c: "#1A1208" }, REJECTED: { bg: "#B02020", c: "#F6F0E4" }, EXPIRED: { bg: "#6B5535", c: "#F6F0E4" }, INACTIVE: { bg: "#6B5535", c: "#F6F0E4" }, PAID: { bg: "#1E6641", c: "#F6F0E4" } };
  const p = map[STATUS] || map.PENDING;
  return <span style={{ background: p.bg, color: p.c, fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: 2, padding: "3px 10px", clipPath: "polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)", display: "inline-block", lineHeight: 1.7 }}>{STATUS}</span>;
};

const Btn = ({ children, onClick, variant = "primary", full = false, size = "md", disabled = false }) => {
  const [h, setH] = useState(false);
  const pad = { sm: "7px 16px", md: "11px 24px", lg: "14px 32px" }[size] || "11px 24px";
  const fs  = { sm: 11, md: 13, lg: 15 }[size] || 13;
  const s = {
    primary:   { bg: h && !disabled ? "#2C1E0A" : "var(--ink)",    color: "var(--amber-on-ink)", border: "none" },
    secondary: { bg: h && !disabled ? "var(--parchment)" : "transparent", color: "var(--ink)", border: "1.5px solid var(--ink)" },
    danger:    { bg: h && !disabled ? "#8A1818" : "var(--red)",     color: "var(--cream-on-ink)", border: "none" },
    success:   { bg: h && !disabled ? "#155230" : "var(--green)",   color: "var(--cream-on-ink)", border: "none" },
    ghost:     { bg: h && !disabled ? "var(--parchment)" : "transparent", color: "var(--amber-text)", border: "1.5px solid var(--rule)" },
    amber:     { bg: h && !disabled ? "#7A4206" : "var(--amber-text)", color: "var(--cream-on-ink)", border: "none" },
  }[variant] || {};
  return (
    <button onClick={onClick} disabled={disabled} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ padding: pad, background: s.bg, color: s.color, border: s.border || "none", fontFamily: "var(--font-display)", fontSize: fs, letterSpacing: 2, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1, width: full ? "100%" : "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .18s" }}
    >{children}</button>
  );
};

const Field = ({ label, type = "text", value, onChange, placeholder, readOnly, error, hint, required }) => {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 3, color: "var(--muted)", textTransform: "uppercase", marginBottom: 7 }}>{label}{required && <span style={{ color: "var(--red)", marginLeft: 4 }}>*</span>}</div>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
        onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
        style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${error ? "var(--red)" : foc ? "var(--amber)" : "var(--rule)"}`, background: readOnly ? "var(--parchment)" : foc ? "var(--surface)" : "var(--cream)", fontFamily: "var(--font-sans)", fontSize: 14, color: readOnly ? "var(--muted)" : "var(--ink)", outline: "none", borderRadius: 0, transition: "border-color .18s, background .18s" }}
      />
      {error && <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--red)", marginTop: 4 }}>{error}</div>}
      {hint && !error && <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
};

const Sel = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 3, color: "var(--muted)", textTransform: "uppercase", marginBottom: 7 }}>{label}</div>}
    <select value={value} onChange={onChange} style={{ width: "100%", padding: "11px 14px", border: "1.5px solid var(--rule)", background: "var(--cream)", fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--ink)", outline: "none", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%231A1208' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 36 }}>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  </div>
);

const Skeleton = ({ h = 20, w = "100%", mb = 8 }) => (
  <div style={{ height: h, width: w, marginBottom: mb, background: `linear-gradient(90deg,var(--parchment) 0%,var(--rule) 50%,var(--parchment) 100%)`, backgroundSize: "200% 100%", animation: "shimmer 1.6s ease infinite" }} />
);

const Spinner = ({ size = 18 }) => (
  <div style={{ width: size, height: size, border: "2px solid rgba(200,131,42,.25)", borderTop: "2px solid var(--amber)", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} />
);

// ── Page wrapper (keeps consistent padding / background) ─────────────
const Page = ({ children, style = {} }) => (
  <div style={{ minHeight: "calc(100vh - 62px)", background: "var(--cream)", padding: "36px 44px", ...style }}>
    {children}
  </div>
);

// ── Page header ───────────────────────────────────────────────────────
const PageHeader = ({ tag, title, subtitle, actions }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
    <div>
      <Tag>{tag}</Tag>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: 1, color: "var(--ink)", lineHeight: 1 }}>{title}</div>
      {subtitle && <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", marginTop: 6 }}>{subtitle}</div>}
    </div>
    {actions && <div style={{ display: "flex", gap: 10 }}>{actions}</div>}
  </div>
);

// ── Local toast ───────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), type === "error" ? 6000 : 3500);
  }, []);
  const STYLES = {
    success: { bg: "var(--success-bg)", border: "var(--green)",      text: "var(--green)",      icon: "✓" },
    error:   { bg: "var(--error-bg)",   border: "var(--red)",        text: "var(--red)",        icon: "✕" },
    info:    { bg: "var(--surface)",    border: "var(--ink)",        text: "var(--ink)",        icon: "◆" },
    warn:    { bg: "var(--warn-bg)",    border: "var(--amber-text)", text: "var(--amber-text)", icon: "⚠" },
  };
  return {
    success: m => add(m, "success"), error: m => add(m, "error"),
    info: m => add(m, "info"),       warn:  m => add(m, "warn"),
    Toaster: () => (
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map(t => {
          const s = STYLES[t.type] || STYLES.info;
          return <div key={t.id} style={{ background: s.bg, border: `2px solid ${s.border}`, padding: "11px 16px", minWidth: 280, display: "flex", gap: 10, alignItems: "center", animation: "slideDown .3s ease", boxShadow: "0 4px 20px rgba(26,18,8,.1)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 18, color: s.text }}>{s.icon}</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: s.text }}>{t.msg}</span>
          </div>;
        })}
      </div>
    ),
  };
}

// ══════════════════════════════════════════════════════════════════════
//  SCREEN 1 — REGISTER
//  4 steps: Role → Personal Info → College Details → Set Password
// ══════════════════════════════════════════════════════════════════════
export function RegisterScreen({ onDone, onBackToLogin }) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ name: "", email: "", phone: "", student_id: "", department: "", year: "I Year", college: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const toast = useToast();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const STEPS = ["ROLE", "PERSONAL", "COLLEGE", "PASSWORD"];
  const DEPTS = [["cs", "Computer Science & Engineering"], ["it", "Information Technology"], ["ec", "Electronics & Communication"], ["me", "Mechanical Engineering"], ["ce", "Civil Engineering"], ["other", "Other"]];
  const YEARS = [["I Year", "I Year"], ["II Year", "II Year"], ["III Year", "III Year"], ["IV Year", "IV Year"]];

  const validate = () => {
    const e = {};
    if (step === 2) {
      if (!form.name.trim())  e.name  = "Full name is required";
      if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Enter a valid email";
      if (!form.phone.match(/^[6-9]\d{9}$/)) e.phone = "Enter valid 10-digit mobile number";
    }
    if (step === 3) {
      if (!form.student_id.trim()) e.student_id = "Student ID is required";
      if (!form.college.trim())    e.college    = "College name is required";
    }
    if (step === 4) {
      if (form.password.length < 8) e.password = "Minimum 8 characters";
      if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = async () => {
    if (!validate()) return;
    if (step < 4) { setStep(s => s + 1); return; }
    // Submit
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200)); // replace: authService.register(form)
    setLoading(false);
    setDone(true);
  };

  if (done) return (
    <>
      <style>{G}</style>
      <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 48, animation: "fadeUp .5s ease" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--success-bg)", border: "3px solid var(--green)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", animation: "stampIn .5s ease" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "var(--green)" }}>✓</span>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 48, letterSpacing: 1, color: "var(--ink)", lineHeight: 1, marginBottom: 8 }}>WELCOME ABOARD!</div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--muted)", fontStyle: "italic", marginBottom: 8 }}>Account created successfully</div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", marginBottom: 32 }}>
            Check your college email for a verification link.<br />You can log in once verified.
          </div>
          <Btn variant="primary" size="lg" onClick={onDone || onBackToLogin}>GO TO LOGIN →</Btn>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{G}</style>
      <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex" }}>

        {/* Left dark panel — same as Login */}
        <div style={{ width: "42%", background: "var(--ink)", position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 52, overflow: "hidden" }}>
          {/* Ghost watermark */}
          <div style={{ position: "absolute", top: -20, left: -10, fontFamily: "var(--font-display)", fontSize: 200, color: "rgba(240,168,48,0.05)", lineHeight: .85, userSelect: "none", letterSpacing: -6 }}>NEW<br/>RIDE</div>
          {/* Dot grid */}
          <div style={{ position: "absolute", top: 40, right: 40, width: 100, height: 140, backgroundImage: "radial-gradient(circle,rgba(240,168,48,.25) 1px,transparent 1px)", backgroundSize: "12px 12px" }} />

          <div style={{ position: "relative" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 4, color: "var(--amber)", marginBottom: 14 }}>◆ BUSPASSPRO</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 56, color: "var(--cream-on-ink)", lineHeight: .9, letterSpacing: 1, marginBottom: 20 }}>
              JOIN THE<br />CAMPUS<br /><span style={{ color: "var(--amber-on-ink)" }}>NETWORK.</span>
            </div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 15, color: "var(--muted-on-ink)", fontStyle: "italic", lineHeight: 1.7, marginBottom: 32 }}>
              Get your digital bus pass in minutes. No paperwork, no queues.
            </div>
            {/* Step indicators on left */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {STEPS.map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 12, opacity: step >= i + 1 ? 1 : 0.35 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: step > i + 1 ? "var(--green-on-ink)" : step === i + 1 ? "var(--amber-on-ink)" : "transparent", border: `2px solid ${step > i + 1 ? "var(--green-on-ink)" : step === i + 1 ? "var(--amber-on-ink)" : "rgba(255,255,255,.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {step > i + 1
                      ? <span style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--ink)" }}>✓</span>
                      : <span style={{ fontFamily: "var(--font-display)", fontSize: 13, color: step === i + 1 ? "var(--ink)" : "rgba(255,255,255,.4)" }}>{i + 1}</span>
                    }
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 3, color: step >= i + 1 ? "var(--cream-on-ink)" : "rgba(255,255,255,.3)" }}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: "relative", fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted-on-ink)" }}>
            STEP {step} OF {STEPS.length}
          </div>
        </div>

        {/* Right form */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "52px 56px", animation: "fadeUp .4s ease" }}>
          <div style={{ maxWidth: 400 }}>

            {/* Step 1 — Role */}
            {step === 1 && (
              <>
                <Tag>Step 1 — Select Role</Tag>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "var(--ink)", marginBottom: 24 }}>Who are you?</div>
                {[
                  ["student",   "🎓 STUDENT",   "Apply for bus passes, track buses, manage your commute"],
                  ["admin",     "⚙ ADMIN",       "Manage routes, applications, and students"],
                  ["conductor", "🔍 CONDUCTOR",  "Scan QR passes and track bus journeys"],
                ].map(([r, label, desc]) => (
                  <div key={r} onClick={() => setRole(r)} style={{ border: `2px solid ${role === r ? "var(--ink)" : "var(--rule)"}`, padding: "16px 20px", marginBottom: 10, cursor: "pointer", background: role === r ? "var(--ink)" : "var(--surface)", transition: "all .18s", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: role === r ? "var(--amber-on-ink)" : "var(--parchment)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "var(--font-display)", fontSize: 16, color: role === r ? "var(--ink)" : "var(--muted)" }}>
                      {r === "student" ? "S" : r === "admin" ? "A" : "C"}
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: 2, color: role === r ? "var(--amber-on-ink)" : "var(--ink)" }}>{label}</div>
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: role === r ? "var(--muted-on-ink)" : "var(--muted)", marginTop: 2 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Step 2 — Personal Info */}
            {step === 2 && (
              <>
                <Tag>Step 2 — Personal Info</Tag>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "var(--ink)", marginBottom: 24 }}>About you</div>
                <Field label="Full Name" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Aryan Sharma" error={errors.name} required />
                <Field label="Email Address" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="aryan@college.edu" error={errors.email} hint="Use your college email for quicker verification" required />
                <Field label="Mobile Number" type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="9876543210" error={errors.phone} required />
              </>
            )}

            {/* Step 3 — College Details */}
            {step === 3 && (
              <>
                <Tag>Step 3 — College Details</Tag>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "var(--ink)", marginBottom: 24 }}>Your institution</div>
                <Field label="Student / Employee ID" value={form.student_id} onChange={e => set("student_id", e.target.value)} placeholder="CS21B042" error={errors.student_id} required />
                <Field label="College / Institute Name" value={form.college} onChange={e => set("college", e.target.value)} placeholder="National College of Engineering" error={errors.college} required />
                {role === "student" && (
                  <>
                    <Sel label="Department" value={form.department} onChange={e => set("department", e.target.value)} options={DEPTS} />
                    <Sel label="Year of Study" value={form.year} onChange={e => set("year", e.target.value)} options={YEARS} />
                  </>
                )}
              </>
            )}

            {/* Step 4 — Password */}
            {step === 4 && (
              <>
                <Tag>Step 4 — Set Password</Tag>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "var(--ink)", marginBottom: 24 }}>Secure your account</div>
                <Field label="Password" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Minimum 8 characters" error={errors.password} required hint="Use letters, numbers, and symbols" />
                <Field label="Confirm Password" type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)} placeholder="Repeat password" error={errors.confirm} required />
                {/* Strength bar */}
                {form.password.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)", marginBottom: 6 }}>PASSWORD STRENGTH</div>
                    <div style={{ height: 4, background: "var(--rule)", position: "relative" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${Math.min(100, form.password.length * 8)}%`, background: form.password.length < 8 ? "var(--red)" : form.password.length < 12 ? "var(--amber)" : "var(--green)", transition: "width .3s, background .3s" }} />
                    </div>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: form.password.length < 8 ? "var(--red)" : form.password.length < 12 ? "var(--amber-text)" : "var(--green)", marginTop: 4 }}>
                      {form.password.length < 8 ? "Too short" : form.password.length < 12 ? "Fair — could be stronger" : "Strong password ✓"}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Nav buttons */}
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              {step > 1 && <Btn variant="secondary" size="md" onClick={() => setStep(s => s - 1)}>← BACK</Btn>}
              <Btn variant="primary" size="md" full onClick={next} disabled={loading}>
                {loading ? <><Spinner size={16} /> CREATING ACCOUNT…</> : step < 4 ? "CONTINUE →" : "CREATE ACCOUNT →"}
              </Btn>
            </div>

            <Rule my={20} />
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
              Already have an account?{" "}
              <span onClick={onBackToLogin} style={{ color: "var(--amber-text)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>Sign in →</span>
            </div>
          </div>
        </div>
      </div>
      <toast.Toaster />
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  SCREEN 2 — FORGOT PASSWORD
//  3 steps: Enter Email → OTP Verify → New Password
// ══════════════════════════════════════════════════════════════════════
export function ForgotPasswordScreen({ onDone, onBackToLogin }) {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new-pw, 4=done
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [pw, setPw] = useState(""); const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState({});
  const otpRefs = useRef([]);

  useEffect(() => {
    if (countdown > 0) { const t = setTimeout(() => setCountdown(c => c - 1), 1000); return () => clearTimeout(t); }
  }, [countdown]);

  const sendOTP = async () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { setErrors({ email: "Enter a valid email address" }); return; }
    setErrors({}); setLoading(true);
    await new Promise(r => setTimeout(r, 900)); // authService.sendOTP(email)
    setLoading(false); setStep(2); setCountdown(60);
  };

  const verifyOTP = async () => {
    const code = otp.join("");
    if (code.length < 6) { setErrors({ otp: "Enter the complete 6-digit code" }); return; }
    setErrors({}); setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // authService.verifyOTP(email, code)
    setLoading(false); setStep(3);
  };

  const resetPw = async () => {
    if (pw.length < 8) { setErrors({ pw: "Minimum 8 characters" }); return; }
    if (pw !== confirm) { setErrors({ confirm: "Passwords do not match" }); return; }
    setErrors({}); setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false); setStep(4);
  };

  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };
  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const n = [...otp]; n[i] = val.slice(-1); setOtp(n);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  if (step === 4) return (
    <>
      <style>{G}</style>
      <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 48, animation: "fadeUp .5s ease" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 54, color: "var(--ink)", letterSpacing: 1, lineHeight: 1, marginBottom: 12 }}>PASSWORD RESET!</div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 16, color: "var(--muted)", fontStyle: "italic", marginBottom: 28 }}>Your password has been updated successfully.</div>
          <Btn variant="primary" size="lg" onClick={onDone || onBackToLogin}>SIGN IN NOW →</Btn>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{G}</style>
      <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 420, padding: "48px 44px", border: "1.5px solid var(--rule)", background: "var(--surface)", animation: "fadeUp .4s ease" }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <Tag>Password Recovery</Tag>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "var(--ink)", lineHeight: 1.1 }}>
              {step === 1 ? "Forgot your\npassword?" : step === 2 ? "Enter your OTP" : "Set new password"}
            </div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", marginTop: 8 }}>
              {step === 1 && "Enter your registered email. We'll send a 6-digit OTP."}
              {step === 2 && `OTP sent to ${email}. Check your inbox.`}
              {step === 3 && "Create a new strong password for your account."}
            </div>
          </div>

          {/* Step 1 — Email */}
          {step === 1 && (
            <>
              <Field label="Registered Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="student@college.edu" error={errors.email} />
              <Btn variant="primary" full size="md" onClick={sendOTP} disabled={loading}>
                {loading ? <><Spinner size={16} /> SENDING OTP…</> : "SEND OTP →"}
              </Btn>
            </>
          )}

          {/* Step 2 — OTP boxes */}
          {step === 2 && (
            <>
              <Tag>6-Digit OTP</Tag>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                {otp.map((d, i) => (
                  <input key={i} ref={el => otpRefs.current[i] = el}
                    value={d} onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKey(i, e)}
                    maxLength={1} inputMode="numeric"
                    style={{ width: 48, height: 56, textAlign: "center", border: `2px solid ${d ? "var(--amber)" : "var(--rule)"}`, background: d ? "var(--amber-light)" : "var(--cream)", fontFamily: "var(--font-display)", fontSize: 24, color: "var(--ink)", outline: "none", transition: "border-color .18s" }}
                  />
                ))}
              </div>
              {errors.otp && <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--red)", marginBottom: 12 }}>{errors.otp}</div>}
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", marginBottom: 16 }}>
                {countdown > 0 ? `Resend in ${countdown}s` : <span onClick={sendOTP} style={{ color: "var(--amber-text)", cursor: "pointer", textDecoration: "underline" }}>Resend OTP</span>}
              </div>
              <Btn variant="primary" full size="md" onClick={verifyOTP} disabled={loading || otp.join("").length < 6}>
                {loading ? <><Spinner size={16} /> VERIFYING…</> : "VERIFY OTP →"}
              </Btn>
            </>
          )}

          {/* Step 3 — New password */}
          {step === 3 && (
            <>
              <Field label="New Password" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Minimum 8 characters" error={errors.pw} />
              <Field label="Confirm Password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat new password" error={errors.confirm} />
              <Btn variant="primary" full size="md" onClick={resetPw} disabled={loading}>
                {loading ? <><Spinner size={16} /> UPDATING…</> : "RESET PASSWORD →"}
              </Btn>
            </>
          )}

          <Rule my={20} />
          <div style={{ textAlign: "center" }}>
            <span onClick={onBackToLogin} style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--amber-text)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>← Back to Sign In</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  SCREEN 3 — NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════
const MOCK_NOTIFS = [
  { id: 1, type: "success", title: "Pass Approved!", body: "Your quarterly pass BPP·2024·001234 for Route Alpha has been approved. QR code is ready.", time: "2 min ago", read: false },
  { id: 2, type: "warn",    title: "Pass Expiring Soon",  body: "Your current pass expires in 7 days (01 Apr 2024). Apply for renewal to avoid disruption.", time: "1 hour ago", read: false },
  { id: 3, type: "info",   title: "Route B Delay",        body: "Route Beta is running 12 minutes late today due to traffic on Ring Road. Plan accordingly.", time: "3 hours ago", read: true },
  { id: 4, type: "info",   title: "New Stop Added",       body: "Tech Park Gate 2 has been added to Route Alpha from 01 March 2024.", time: "Yesterday", read: true },
  { id: 5, type: "success", title: "Payment Confirmed",   body: "₹1,215 received for pass BPP·2024·001234. Receipt sent to your email.", time: "2 days ago", read: true },
  { id: 6, type: "info",   title: "Holiday Notice",       body: "No bus service on 26 Jan (Republic Day). Regular service resumes 27 Jan.", time: "1 week ago", read: true },
];

export function NotificationsScreen() {
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const [filter, setFilter] = useState("ALL");
  const unread = notifs.filter(n => !n.read).length;

  const markRead = id => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  const markAll  = ()  => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const del      = id  => setNotifs(n => n.filter(x => x.id !== id));

  const TYPE_STYLE = {
    success: { border: "var(--green)",      bg: "var(--success-bg)", icon: "✓", color: "var(--green)"      },
    warn:    { border: "var(--amber-text)", bg: "var(--warn-bg)",    icon: "⚠", color: "var(--amber-text)" },
    info:    { border: "var(--ink)",        bg: "var(--info-bg)",    icon: "◆", color: "var(--ink)"        },
  };

  const visible = filter === "ALL" ? notifs : filter === "UNREAD" ? notifs.filter(n => !n.read) : notifs.filter(n => n.type === filter.toLowerCase());

  return (
    <>
      <style>{G}</style>
      <Page>
        <PageHeader
          tag="Inbox"
          title={`NOTIFICATIONS${unread > 0 ? ` · ${unread}` : ""}`}
          subtitle={unread > 0 ? `${unread} unread notification${unread > 1 ? "s" : ""}` : "All caught up!"}
          actions={unread > 0 ? [<Btn key="mark" variant="ghost" size="sm" onClick={markAll}>MARK ALL READ</Btn>] : []}
        />

        {/* Filter row */}
        <div style={{ display: "flex", gap: 2, marginBottom: 24, borderBottom: "2px solid var(--rule)" }}>
          {["ALL", "UNREAD", "SUCCESS", "WARN", "INFO"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "10px 16px", background: "none", border: "none", fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 3, color: filter === f ? "var(--ink)" : "var(--muted)", borderBottom: `2px solid ${filter === f ? "var(--amber)" : "transparent"}`, cursor: "pointer", marginBottom: -2, transition: "color .18s" }}>{f}</button>
          ))}
        </div>

        {/* Notification list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 680 }}>
          {visible.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)", fontFamily: "var(--font-serif)", fontSize: 18, fontStyle: "italic" }}>No notifications here.</div>
          )}
          {visible.map((n, i) => {
            const s = TYPE_STYLE[n.type] || TYPE_STYLE.info;
            return (
              <div key={n.id} style={{ display: "flex", gap: 0, border: `1.5px solid ${n.read ? "var(--rule)" : s.border}`, background: n.read ? "var(--surface)" : s.bg, animation: `fadeUp .3s ease ${i * 0.05}s both`, position: "relative" }}>
                {/* Unread dot */}
                {!n.read && <div style={{ position: "absolute", top: 16, left: -5, width: 8, height: 8, borderRadius: "50%", background: s.border }} />}
                {/* Type icon strip */}
                <div style={{ width: 48, background: n.read ? "var(--parchment)" : s.border, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 18, flexShrink: 0 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 18, color: n.read ? "var(--muted)" : "white" }}>{s.icon}</span>
                </div>
                {/* Content */}
                <div style={{ flex: 1, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--ink)", fontWeight: 600 }}>{n.title}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)", flexShrink: 0, marginLeft: 16 }}>{n.time}</div>
                  </div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{n.body}</div>
                </div>
                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", borderLeft: "1px solid var(--rule)" }}>
                  {!n.read && <button onClick={() => markRead(n.id)} style={{ flex: 1, background: "none", border: "none", borderBottom: "1px solid var(--rule)", padding: "0 14px", fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)", cursor: "pointer", whiteSpace: "nowrap" }}>MARK READ</button>}
                  <button onClick={() => del(n.id)} style={{ flex: 1, background: "none", border: "none", padding: "0 14px", fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--red)", cursor: "pointer" }}>DELETE</button>
                </div>
              </div>
            );
          })}
        </div>
      </Page>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  SCREEN 4 — ADMIN: ROUTE MANAGER
// ══════════════════════════════════════════════════════════════════════
const MOCK_ROUTES = [
  { id: 1, name: "Route Alpha", source: "College Gate", destination: "City Centre", stops: ["North Campus", "Library Sq", "Main Market"], km: 12.5, fare: 450, buses: 2, active: true },
  { id: 2, name: "Route Beta",  source: "East Campus",  destination: "Railway Station", stops: ["IT Hub", "Ring Road", "Sector 4"], km: 18.2, fare: 520, buses: 1, active: true },
  { id: 3, name: "Route Gamma", source: "Tech Park",    destination: "Airport Road", stops: ["IT Hub", "Outer Ring"], km: 24.0, fare: 680, buses: 1, active: false },
];

export function RouteManager() {
  const [routes, setRoutes] = useState(MOCK_ROUTES);
  const [modal, setModal] = useState(null); // null | "add" | route-obj
  const [form, setForm] = useState({ name: "", source: "", destination: "", fare: "", km: "", stops: "" });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const openAdd  = () => { setForm({ name: "", source: "", destination: "", fare: "", km: "", stops: "" }); setModal("add"); };
  const openEdit = r  => { setForm({ name: r.name, source: r.source, destination: r.destination, fare: r.fare, km: r.km, stops: r.stops.join(", ") }); setModal(r); };

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    const stops = form.stops.split(",").map(s => s.trim()).filter(Boolean);
    if (modal === "add") {
      setRoutes(r => [...r, { id: Date.now(), ...form, fare: +form.fare, km: +form.km, stops, buses: 0, active: true }]);
      toast.success("Route added successfully!");
    } else {
      setRoutes(r => r.map(x => x.id === modal.id ? { ...x, ...form, fare: +form.fare, km: +form.km, stops } : x));
      toast.success("Route updated!");
    }
    setSaving(false); setModal(null);
  };

  const toggle = id => { setRoutes(r => r.map(x => x.id === id ? { ...x, active: !x.active } : x)); toast.info("Route status updated."); };
  const del    = id => { setRoutes(r => r.filter(x => x.id !== id)); toast.success("Route removed."); };

  return (
    <>
      <style>{G}</style>
      <Page>
        <PageHeader tag="Admin · Routes" title="ROUTE MANAGER" subtitle={`${routes.length} routes · ${routes.filter(r => r.active).length} active`}
          actions={[<Btn key="add" variant="primary" size="sm" onClick={openAdd}>+ ADD ROUTE</Btn>]} />
        <DoubleRule my={0} />

        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 2 }}>
          {routes.map((r, i) => (
            <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px 80px 120px", gap: 16, padding: "18px 20px", background: i % 2 === 0 ? "var(--surface)" : "var(--cream)", border: "1px solid var(--rule)", alignItems: "center", animation: `fadeUp .3s ease ${i * 0.06}s both` }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: 1, color: "var(--ink)" }}>{r.name}</div>
                  <Pill s={r.active ? "ACTIVE" : "INACTIVE"} />
                </div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)" }}>
                  {r.source} → {r.destination} · {r.stops.length} stops · {r.km}km
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  {r.stops.map(s => (
                    <span key={s} style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 1, color: "var(--amber-text)", background: "var(--parchment)", padding: "2px 8px", border: "1px solid var(--rule)" }}>{s}</span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: 1, color: "var(--ink)" }}>₹{r.fare}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)" }}>PER MONTH</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink)" }}>{r.buses}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)" }}>BUSES</div>
              </div>
              <Btn variant={r.active ? "ghost" : "success"} size="sm" onClick={() => toggle(r.id)}>
                {r.active ? "DISABLE" : "ENABLE"}
              </Btn>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn variant="secondary" size="sm" onClick={() => openEdit(r)}>EDIT</Btn>
                <Btn variant="danger"    size="sm" onClick={() => del(r.id)}>DEL</Btn>
              </div>
            </div>
          ))}
        </div>

        {/* Add / Edit Modal */}
        {modal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(26,18,8,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setModal(null)}>
            <div style={{ background: "var(--cream)", border: "2px solid var(--ink)", padding: 36, width: 480, animation: "fadeUp .3s ease" }} onClick={e => e.stopPropagation()}>
              <Tag>{modal === "add" ? "Add New Route" : "Edit Route"}</Tag>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--ink)", marginBottom: 20 }}>{modal === "add" ? "New Route" : form.name}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                <Field label="Route Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Route Alpha" />
                <Field label="Fare (₹/month)" type="number" value={form.fare} onChange={e => setForm(f => ({ ...f, fare: e.target.value }))} placeholder="450" />
                <Field label="Source" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="College Gate" />
                <Field label="Destination" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="City Centre" />
                <Field label="Distance (km)" type="number" value={form.km} onChange={e => setForm(f => ({ ...f, km: e.target.value }))} placeholder="12.5" />
              </div>
              <Field label="Intermediate Stops (comma separated)" value={form.stops} onChange={e => setForm(f => ({ ...f, stops: e.target.value }))} placeholder="North Campus, Library Sq, Main Market" hint="Enter stop names separated by commas" />
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <Btn variant="primary" size="md" onClick={save} disabled={saving}>{saving ? "SAVING…" : "SAVE ROUTE"}</Btn>
                <Btn variant="ghost"   size="md" onClick={() => setModal(null)}>CANCEL</Btn>
              </div>
            </div>
          </div>
        )}
      </Page>
      <toast.Toaster />
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  SCREEN 5 — ADMIN: USER MANAGER
// ══════════════════════════════════════════════════════════════════════
const MOCK_USERS = [
  { id: "CS21B042", name: "Aryan Sharma",  email: "aryan@college.edu",  dept: "CS", year: "IV", role: "student",   passStatus: "ACTIVE",   joined: "Aug 2021" },
  { id: "ME20B018", name: "Priya Patel",   email: "priya@college.edu",  dept: "ME", year: "IV", role: "student",   passStatus: "PENDING",  joined: "Aug 2020" },
  { id: "EC22B091", name: "Rahul Kumar",   email: "rahul@college.edu",  dept: "EC", year: "III",role: "student",   passStatus: "EXPIRED",  joined: "Aug 2022" },
  { id: "IT21B055", name: "Sneha Menon",   email: "sneha@college.edu",  dept: "IT", year: "IV", role: "student",   passStatus: "ACTIVE",   joined: "Aug 2021" },
  { id: "COND001",  name: "Ramesh Kumar",  email: "ramesh@college.edu", dept: "—",  year: "—",  role: "conductor", passStatus: "—",         joined: "Jan 2022" },
];

export function UserManager() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState(null);
  const toast = useToast();

  const visible = users.filter(u =>
    (roleFilter === "ALL" || u.role.toUpperCase() === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <style>{G}</style>
      <div style={{ display: "flex", minHeight: "calc(100vh - 62px)", background: "var(--cream)" }}>

        {/* Left — user list */}
        <div style={{ flex: 1, padding: "36px 32px", borderRight: "1px solid var(--rule)" }}>
          <PageHeader tag="Admin · Users" title="USER MANAGER" subtitle={`${users.length} total users`} />

          {/* Search + filter */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, ID…"
              style={{ flex: 1, padding: "10px 14px", border: "1.5px solid var(--rule)", background: "var(--surface)", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", outline: "none" }} />
            {["ALL", "STUDENT", "CONDUCTOR", "ADMIN"].map(f => (
              <button key={f} onClick={() => setRoleFilter(f)} style={{ padding: "8px 14px", background: roleFilter === f ? "var(--ink)" : "transparent", color: roleFilter === f ? "var(--amber-on-ink)" : "var(--muted)", border: "1.5px solid var(--ink)", fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, cursor: "pointer", transition: "all .18s" }}>{f}</button>
            ))}
          </div>

          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 60px 80px", gap: 12, padding: "6px 12px", borderBottom: "2px solid var(--ink)" }}>
            {["ID", "NAME / EMAIL", "ROLE", "PASS"].map(h => <div key={h} style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)" }}>{h}</div>)}
          </div>

          {visible.map((u, i) => (
            <div key={u.id} onClick={() => setSelectedUser(u)} style={{ display: "grid", gridTemplateColumns: "80px 1fr 60px 80px", gap: 12, padding: "13px 12px", alignItems: "center", cursor: "pointer", background: selectedUser?.id === u.id ? "var(--parchment)" : i % 2 === 0 ? "var(--surface)" : "var(--cream)", borderBottom: "1px solid var(--rule)", borderLeft: selectedUser?.id === u.id ? "3px solid var(--amber)" : "3px solid transparent", transition: "all .15s" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1, color: "var(--amber-text)" }}>{u.id}</div>
              <div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{u.name}</div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)" }}>{u.email}</div>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 1, color: "var(--muted)", textTransform: "uppercase" }}>{u.role}</div>
              {u.passStatus !== "—" ? <Pill s={u.passStatus} /> : <span style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 8 }}>—</span>}
            </div>
          ))}
        </div>

        {/* Right — user detail */}
        <div style={{ width: 340, padding: "36px 28px", background: "var(--surface)" }}>
          {!selectedUser ? (
            <div style={{ textAlign: "center", paddingTop: 80, color: "var(--muted)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 1, marginBottom: 8 }}>SELECT</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontStyle: "italic" }}>Click a user to view details</div>
            </div>
          ) : (
            <div style={{ animation: "fadeUp .3s ease" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink)" }}>{selectedUser.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</span>
              </div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--ink)", marginBottom: 4 }}>{selectedUser.name}</div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>{selectedUser.email}</div>
              <Rule my={16} />
              {[["Student ID", selectedUser.id], ["Department", selectedUser.dept], ["Year", selectedUser.year], ["Role", selectedUser.role], ["Pass Status", selectedUser.passStatus], ["Member Since", selectedUser.joined]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--rule)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2, color: "var(--muted)" }}>{l}</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink)", fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
                <Btn variant="secondary" size="sm" full onClick={() => toast.info("Pass history opened.")}>VIEW PASS HISTORY</Btn>
                <Btn variant="danger"    size="sm" full onClick={() => toast.warn("User suspended.")}>SUSPEND USER</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
      <toast.Toaster />
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  SCREEN 6 — ADMIN: ANALYTICS DASHBOARD
// ══════════════════════════════════════════════════════════════════════
function MiniBar({ data, maxVal, color = "var(--amber)", height = 80 }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ width: "100%", height: `${(d.v / maxVal) * (height - 20)}px`, background: color, transition: "height .4s ease", minHeight: 2 }} />
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 6, letterSpacing: 1, color: "var(--muted)" }}>{d.h}</div>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState("week");

  const DEMAND = [
    { h: "MON", v: 182 }, { h: "TUE", v: 210 }, { h: "WED", v: 195 },
    { h: "THU", v: 220 }, { h: "FRI", v: 198 }, { h: "SAT", v: 88 }, { h: "SUN", v: 42 },
  ];
  const REVENUE = [
    { h: "JAN", v: 48000 }, { h: "FEB", v: 52000 }, { h: "MAR", v: 61000 },
    { h: "APR", v: 58000 }, { h: "MAY", v: 43000 }, { h: "JUN", v: 39000 },
  ];
  const ROUTE_SPLIT = [
    { name: "Route Alpha", pct: 52, color: "#C8832A" },
    { name: "Route Beta",  pct: 31, color: "#1E6641" },
    { name: "Route Gamma", pct: 17, color: "#6B5535" },
  ];

  const BIG_STATS = [
    { num: "243",    lbl: "ACTIVE PASSES",   delta: "+12 this month", up: true  },
    { num: "₹1.8L",  lbl: "MONTHLY REVENUE", delta: "+8% vs last",    up: true  },
    { num: "4,820",  lbl: "SCANS THIS WEEK",  delta: "-3% vs last",    up: false },
    { num: "97.2%",  lbl: "SCAN SUCCESS",     delta: "stable",         up: true  },
  ];

  return (
    <>
      <style>{G}</style>
      <Page>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
          <div>
            <Tag>Admin · Analytics</Tag>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: 1, color: "var(--ink)" }}>ANALYTICS</div>
          </div>
          <div style={{ display: "flex", border: "1.5px solid var(--ink)" }}>
            {["week", "month", "year"].map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{ padding: "8px 18px", background: period === p ? "var(--ink)" : "transparent", color: period === p ? "var(--amber-on-ink)" : "var(--muted)", border: "none", borderRight: p !== "year" ? "1px solid var(--ink)" : "none", fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2, cursor: "pointer", transition: "all .18s", textTransform: "uppercase" }}>{p}</button>
            ))}
          </div>
        </div>

        {/* Big stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "3px solid var(--ink)", borderBottom: "1px solid var(--rule)", marginBottom: 32 }}>
          {BIG_STATS.map((s, i) => (
            <div key={s.lbl} style={{ padding: "22px 24px", borderRight: i < 3 ? "1px solid var(--rule)" : "none" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 40, letterSpacing: 1, color: "var(--ink)", lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)", margin: "6px 0 4px" }}>{s.lbl}</div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: s.up ? "var(--green)" : "var(--red)" }}>
                {s.up ? "↑" : "↓"} {s.delta}
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 300px", gap: 24 }}>

          {/* Daily ridership */}
          <div style={{ border: "1px solid var(--rule)", padding: "20px 22px", background: "var(--surface)" }}>
            <Tag>Daily Ridership — This Week</Tag>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--ink)", marginBottom: 16 }}>Passenger Trips</div>
            <MiniBar data={DEMAND} maxVal={250} color="var(--amber)" height={120} />
          </div>

          {/* Monthly revenue */}
          <div style={{ border: "1px solid var(--rule)", padding: "20px 22px", background: "var(--surface)" }}>
            <Tag>Monthly Revenue — 2024</Tag>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--ink)", marginBottom: 16 }}>Revenue (₹)</div>
            <MiniBar data={REVENUE} maxVal={65000} color="var(--green)" height={120} />
          </div>

          {/* Route split */}
          <div style={{ border: "1px solid var(--rule)", padding: "20px 22px", background: "var(--surface)" }}>
            <Tag>Pass Distribution</Tag>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--ink)", marginBottom: 16 }}>By Route</div>
            {ROUTE_SPLIT.map(r => (
              <div key={r.name} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink)" }}>{r.name}</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--ink)", letterSpacing: 1 }}>{r.pct}%</span>
                </div>
                <div style={{ height: 6, background: "var(--parchment)", position: "relative" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${r.pct}%`, background: r.color, transition: "width .6s ease" }} />
                </div>
              </div>
            ))}

            <Rule my={16} />
            <Tag>Pass Types</Tag>
            {[["Annual", 38], ["Quarterly", 45], ["Monthly", 17]].map(([t, p]) => (
              <div key={t} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)" }}>{t}</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--ink)", letterSpacing: 1 }}>{p}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent applications table */}
        <div style={{ marginTop: 28, border: "1px solid var(--rule)", background: "var(--surface)", padding: "20px 22px" }}>
          <Tag>Recent Applications</Tag>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--ink)", marginBottom: 16 }}>Last 5 Applications</div>
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 120px 80px 80px", gap: 12, padding: "6px 0", borderBottom: "2px solid var(--ink)" }}>
            {["DATE", "STUDENT", "ROUTE", "TYPE", "STATUS"].map(h => <div key={h} style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)" }}>{h}</div>)}
          </div>
          {[
            ["03 Mar", "Aryan Sharma",  "Alpha", "Quarterly", "APPROVED"],
            ["02 Mar", "Priya Patel",   "Beta",  "Monthly",   "PENDING" ],
            ["01 Mar", "Rahul Kumar",   "Alpha", "Annual",    "APPROVED"],
            ["28 Feb", "Sneha Menon",   "Gamma", "Quarterly", "REJECTED"],
            ["27 Feb", "Vikram Singh",  "Beta",  "Monthly",   "APPROVED"],
          ].map(([date, name, route, type, status], i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr 120px 80px 80px", gap: 12, padding: "11px 0", borderBottom: "1px solid var(--rule)", alignItems: "center", background: i % 2 === 0 ? "transparent" : "var(--cream)" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>{date}</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)" }}>{name}</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)" }}>Route {route}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted)", letterSpacing: 1 }}>{type}</span>
              <Pill s={status} />
            </div>
          ))}
        </div>
      </Page>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  SCREEN 7 — ADMIN: ANNOUNCEMENT SENDER
// ══════════════════════════════════════════════════════════════════════
export function AnnouncementSender() {
  const [form, setForm] = useState({ title: "", body: "", audience: "all", route: "all", type: "info" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState([]);
  const toast = useToast();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const send = async () => {
    if (!form.title.trim() || !form.body.trim()) { toast.error("Title and message are required."); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 900));
    setSent(s => [{ ...form, time: "Just now", id: Date.now() }, ...s]);
    setForm({ title: "", body: "", audience: "all", route: "all", type: "info" });
    setSending(false);
    toast.success("Announcement sent to all recipients!");
  };

  const AUDIENCES = [["all", "All Users"], ["students", "Students Only"], ["conductors", "Conductors Only"]];
  const ROUTES    = [["all", "All Routes"], ["route-alpha", "Route Alpha"], ["route-beta", "Route Beta"], ["route-gamma", "Route Gamma"]];
  const TYPES     = [["info", "ℹ General Info"], ["warn", "⚠ Warning"], ["success", "✓ Good News"]];

  return (
    <>
      <style>{G}</style>
      <Page>
        <PageHeader tag="Admin · Announcements" title="ANNOUNCEMENTS" subtitle="Broadcast messages to students and conductors" />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>
          {/* Compose form */}
          <div style={{ border: "1px solid var(--rule)", padding: "24px 28px", background: "var(--surface)" }}>
            <Tag>Compose Announcement</Tag>
            <Field label="Title" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Route Beta Delay Notice" required />
            <div style={{ marginBottom: 16 }}>
              <Tag>Message Body</Tag>
              <textarea value={form.body} onChange={e => set("body", e.target.value)} placeholder="Route Beta is running approximately 15 minutes late today due to heavy traffic near Ring Road. We apologise for the inconvenience." rows={5}
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid var(--rule)", background: "var(--cream)", fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--ink)", outline: "none", resize: "vertical", lineHeight: 1.6 }} />
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)", marginTop: 4 }}>{form.body.length} CHARACTERS</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Sel label="Audience" value={form.audience} onChange={e => set("audience", e.target.value)} options={AUDIENCES} />
              <Sel label="Route Filter" value={form.route}    onChange={e => set("route",    e.target.value)} options={ROUTES} />
              <Sel label="Type"         value={form.type}     onChange={e => set("type",     e.target.value)} options={TYPES} />
            </div>

            {/* Preview */}
            {form.title && (
              <div style={{ border: "1.5px solid var(--rule)", padding: "14px 16px", background: "var(--parchment)", marginBottom: 16 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)", marginBottom: 6 }}>PREVIEW</div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--ink)", fontWeight: 600 }}>{form.title}</div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", marginTop: 4, lineHeight: 1.5 }}>{form.body || "—"}</div>
              </div>
            )}
            <Btn variant="primary" size="md" onClick={send} disabled={sending} full>
              {sending ? <><Spinner size={16} /> SENDING…</> : "📢 SEND ANNOUNCEMENT"}
            </Btn>
          </div>

          {/* Sent history */}
          <div>
            <Tag>Previously Sent</Tag>
            {sent.length === 0 && (
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 15, color: "var(--muted)", fontStyle: "italic", padding: "20px 0" }}>No announcements sent yet.</div>
            )}
            {sent.map((a, i) => (
              <div key={a.id} style={{ border: "1px solid var(--rule)", padding: "14px 16px", marginBottom: 8, background: "var(--surface)", animation: "slideDown .3s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>{a.title}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)" }}>{a.time}</div>
                </div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{a.body.slice(0, 80)}…</div>
                <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                  <Pill s={a.audience === "all" ? "ACTIVE" : "PENDING"} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)", alignSelf: "center" }}>{a.route === "all" ? "ALL ROUTES" : a.route.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Page>
      <toast.Toaster />
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  SCREEN 8 — STUDENT: PASS RENEWAL FLOW
// ══════════════════════════════════════════════════════════════════════
export function RenewalFlow({ currentPass, onDone }) {
  const PASS = currentPass || { pass_number: "BPP·2024·001234", route: "Route Alpha", boarding_stop: "Library Sq", fare: 450 };
  const [duration, setDuration] = useState("quarterly");
  const [done, setDone] = useState(false);
  const [paying, setPaying] = useState(false);
  const toast = useToast();

  const DURS = [
    { id: "monthly",   label: "Monthly",   months: 1,  disc: 0  },
    { id: "quarterly", label: "Quarterly", months: 3,  disc: 10 },
    { id: "annual",    label: "Annual",    months: 12, disc: 20 },
  ];
  const sel = DURS.find(d => d.id === duration);
  const total = Math.round(PASS.fare * sel.months * (1 - sel.disc / 100));

  const pay = async () => {
    setPaying(true);
    await new Promise(r => setTimeout(r, 1200));
    setPaying(false);
    setDone(true);
  };

  if (done) return (
    <>
      <style>{G}</style>
      <Page style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", animation: "fadeUp .5s ease" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 54, color: "var(--ink)", letterSpacing: 1, lineHeight: 1 }}>RENEWED!</div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--muted)", fontStyle: "italic", margin: "12px 0 28px" }}>Your pass has been renewed for {sel.months} month{sel.months > 1 ? "s" : ""}.</div>
          <Btn variant="primary" size="lg" onClick={onDone || (() => {})}>VIEW NEW PASS →</Btn>
        </div>
      </Page>
    </>
  );

  return (
    <>
      <style>{G}</style>
      <Page style={{ maxWidth: 700, margin: "0 auto" }}>
        <PageHeader tag="Student · Pass" title="RENEW PASS" subtitle={`Renewing: ${PASS.pass_number} — ${PASS.route}`} />

        {/* Current pass summary */}
        <div style={{ background: "var(--ink)", padding: "18px 22px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted-on-ink)", marginBottom: 4 }}>CURRENT PASS</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: 1, color: "var(--amber-on-ink)" }}>{PASS.route}</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted-on-ink)", marginTop: 2 }}>Boarding at {PASS.boarding_stop}</div>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: 2, color: "var(--amber-on-ink)", border: "1.5px solid rgba(240,168,48,.3)", padding: "6px 14px" }}>SAME ROUTE</div>
        </div>

        {/* Duration selection */}
        <Tag>Select Renewal Duration</Tag>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 28 }}>
          {DURS.map(d => {
            const amt = Math.round(PASS.fare * d.months * (1 - d.disc / 100));
            return (
              <div key={d.id} onClick={() => setDuration(d.id)} style={{ border: `2px solid ${duration === d.id ? "var(--ink)" : "var(--rule)"}`, padding: "18px 16px", cursor: "pointer", background: duration === d.id ? "var(--ink)" : "var(--surface)", transition: "all .18s", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: 2, color: duration === d.id ? "var(--amber-on-ink)" : "var(--ink)" }}>{d.label.toUpperCase()}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 30, letterSpacing: 1, color: duration === d.id ? "var(--cream-on-ink)" : "var(--ink)", margin: "8px 0 4px" }}>₹{amt}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: duration === d.id ? "var(--muted-on-ink)" : "var(--muted)" }}>{d.months} MONTH{d.months > 1 ? "S" : ""}</div>
                {d.disc > 0 && <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1, color: "var(--green-on-ink)", marginTop: 4, background: "rgba(82,183,136,.15)", padding: "2px 8px" }}>{d.disc}% SAVED</div>}
              </div>
            );
          })}
        </div>

        {/* Payment summary */}
        <div style={{ border: "1.5px solid var(--rule)", padding: "20px 24px", marginBottom: 20, background: "var(--surface)" }}>
          <Tag>Payment Summary</Tag>
          {[["Route", PASS.route], ["Duration", `${sel.label} (${sel.months} month${sel.months > 1 ? "s" : ""})`], ["Base Fare", `₹${PASS.fare} × ${sel.months}`], sel.disc > 0 && ["Discount", `${sel.disc}% off`]].filter(Boolean).map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--rule)" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2, color: "var(--muted)" }}>{k}</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)" }}>{v}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 2, color: "var(--ink)" }}>TOTAL</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 1, color: "var(--ink)" }}>₹{total.toLocaleString()}</span>
          </div>
        </div>

        <Btn variant="primary" size="lg" full onClick={pay} disabled={paying}>
          {paying ? <><Spinner size={18} /> PROCESSING PAYMENT…</> : `PAY ₹${total.toLocaleString()} & RENEW →`}
        </Btn>
      </Page>
      <toast.Toaster />
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  SCREEN 9 — STUDENT: BUS ROUTE MAP (SVG visual)
// ══════════════════════════════════════════════════════════════════════
export function BusRouteMap() {
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [activeBus, setActiveBus] = useState(2); // which stop index bus is at
  const [busPos, setBusPos] = useState(2);

  const ROUTES_DATA = [
    { name: "Route Alpha", color: "#C8832A", stops: ["College Gate", "North Campus", "Library Sq", "Main Market", "City Centre"], time: ["07:00", "07:12", "07:25", "07:38", "07:50"], busAt: 2 },
    { name: "Route Beta",  color: "#1E6641", stops: ["East Campus", "IT Hub", "Ring Road", "Sector 4", "Railway Station"], time: ["07:30", "07:45", "08:00", "08:15", "08:30"], busAt: 1 },
  ];

  const route = ROUTES_DATA[selectedRoute];

  // Animate bus position
  useEffect(() => {
    const t = setInterval(() => setBusPos(p => (p + 1) % route.stops.length), 3000);
    return () => clearInterval(t);
  }, [selectedRoute, route.stops.length]);

  return (
    <>
      <style>{G}</style>
      <Page>
        <PageHeader tag="Live Route Map" title="BUS ROUTES" subtitle="Real-time stop-by-stop view" />

        {/* Route tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 28 }}>
          {ROUTES_DATA.map((r, i) => (
            <button key={r.name} onClick={() => { setSelectedRoute(i); setBusPos(r.busAt); }} style={{ padding: "10px 22px", background: selectedRoute === i ? "var(--ink)" : "transparent", color: selectedRoute === i ? "var(--amber-on-ink)" : "var(--muted)", border: `1.5px solid ${selectedRoute === i ? "var(--ink)" : "var(--rule)"}`, fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: 2, cursor: "pointer", transition: "all .18s" }}>{r.name.toUpperCase()}</button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 32, alignItems: "start" }}>
          {/* SVG Route Visualization */}
          <div style={{ border: "1.5px solid var(--rule)", background: "var(--surface)", padding: "28px 24px" }}>
            <Tag>Stop-by-Stop Route</Tag>
            <div style={{ position: "relative", paddingLeft: 60 }}>
              {route.stops.map((stop, i) => (
                <div key={stop} style={{ display: "flex", alignItems: "center", marginBottom: i < route.stops.length - 1 ? 0 : 0, position: "relative" }}>
                  {/* Vertical line */}
                  {i < route.stops.length - 1 && (
                    <div style={{ position: "absolute", left: -32, top: 24, width: 4, height: 56, background: i < busPos ? route.color : "var(--rule)", transition: "background .5s" }} />
                  )}
                  {/* Stop circle */}
                  <div style={{ position: "absolute", left: -40, top: 8, width: 20, height: 20, borderRadius: "50%", background: i <= busPos ? route.color : "var(--cream)", border: `3px solid ${route.color}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "background .5s", zIndex: 2 }}>
                    {i === busPos && <span style={{ fontSize: 9 }}>🚌</span>}
                  </div>
                  {/* Stop info */}
                  <div style={{ padding: "10px 0 46px", borderBottom: i < route.stops.length - 1 ? "none" : "none" }}>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: i === busPos ? "var(--ink)" : i < busPos ? "var(--muted)" : "var(--ink)", fontWeight: i === busPos ? 600 : 400, display: "flex", alignItems: "center", gap: 10 }}>
                      {stop}
                      {i === busPos && <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--amber-text)", background: "var(--warn-bg)", padding: "2px 8px", border: "1px solid var(--amber)" }}>BUS HERE</span>}
                      {i < busPos && <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--green)" }}>✓ PASSED</span>}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: "var(--muted)", marginTop: 2 }}>Scheduled: {route.time[i]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Route stats */}
            <div style={{ border: "1.5px solid var(--rule)", padding: "20px", background: "var(--surface)" }}>
              <Tag>Route Info</Tag>
              {[
                ["TOTAL STOPS", route.stops.length],
                ["FIRST BUS",   route.time[0]],
                ["LAST STOP",   route.time[route.time.length - 1]],
                ["BUS CURRENTLY AT", route.stops[busPos]],
              ].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--rule)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)" }}>{l}</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink)", fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Live status */}
            <div style={{ border: `2px solid ${route.color}`, padding: "16px 18px", background: "var(--warn-bg)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: route.color, animation: "scanPulse 2s infinite" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 3, color: "var(--amber-text)" }}>LIVE TRACKING</span>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 1, color: "var(--ink)", marginBottom: 4 }}>BUS-0{selectedRoute + 1}</div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)" }}>
                Currently at <strong style={{ color: "var(--ink)" }}>{route.stops[busPos]}</strong>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1, color: "var(--muted)", marginTop: 6 }}>
                Next: {route.stops[Math.min(busPos + 1, route.stops.length - 1)]} · {busPos < route.stops.length - 1 ? "~8 min" : "End of route"}
              </div>
            </div>

            {/* Stop finder */}
            <div style={{ border: "1px solid var(--rule)", padding: "16px 18px", background: "var(--surface)" }}>
              <Tag>My Boarding Stop</Tag>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 16, color: "var(--ink)", marginBottom: 10, fontStyle: "italic" }}>Library Sq</div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                Bus arrives at your stop in approx. <strong style={{ color: "var(--ink)" }}>12 minutes</strong>.
              </div>
            </div>
          </div>
        </div>
      </Page>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  SCREEN 10 — CONDUCTOR: CAMERA QR SCANNER
//  Uses jsQR library (loaded via CDN script tag)
// ══════════════════════════════════════════════════════════════════════
export function CameraScanner() {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const [active, setActive] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError]   = useState("");
  const [history, setHistory] = useState([
    { pass: "BPP·2024·001234", student: "Aryan Sharma",  result: "VALID",   time: "08:42" },
    { pass: "BPP·2024·000891", student: "Priya Patel",   result: "EXPIRED", time: "08:40" },
  ]);
  const scanLoop = useRef(null);

  const startCamera = async () => {
    setError(""); setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setActive(true);
      // Scan loop using jsQR (must be loaded via <script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js"> in HTML)
      scanLoop.current = setInterval(() => {
        if (!videoRef.current || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        canvasRef.current.width  = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        if (window.jsQR) {
          const code = window.jsQR(imageData.data, imageData.width, imageData.height);
          if (code) { handleScan(code.data); }
        }
      }, 300);
    } catch (e) {
      setError("Camera access denied or not available. Use Manual Lookup instead.");
    }
  };

  const stopCamera = () => {
    clearInterval(scanLoop.current);
    if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    setActive(false);
  };

  const handleScan = (data) => {
    stopCamera();
    // Replace with: passService.scanQR(data)
    const mock = { pass: data || "BPP·2024·001234", student: "Aryan Sharma", result: "VALID", route: "Route Alpha", until: "01 APR 2024" };
    setResult(mock);
    setHistory(h => [{ ...mock, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, ...h.slice(0, 9)]);
  };

  useEffect(() => () => stopCamera(), []);

  const RC = { VALID: "var(--green)", EXPIRED: "var(--amber-text)", INVALID: "var(--red)" };

  return (
    <>
      <style>{G}</style>
      <Page>
        <PageHeader tag="Conductor · Scanner" title="CAMERA SCAN" subtitle="Point camera at student's QR code" />
        <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 32, alignItems: "start" }}>

          {/* Camera view */}
          <div>
            <div style={{ width: "100%", aspectRatio: "1/1", border: `3px solid ${active ? "var(--amber)" : "var(--ink)"}`, background: "var(--ink)", position: "relative", overflow: "hidden", marginBottom: 12 }}>
              <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover", display: active ? "block" : "none" }} playsInline muted />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              {!active && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 48, color: "rgba(240,168,48,.3)" }}>◈</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 3, color: "var(--muted-on-ink)" }}>CAMERA OFF</div>
                </div>
              )}
              {/* Scan animation bar */}
              {active && <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: "var(--amber)", animation: "scanBar 1.5s linear infinite", boxShadow: "0 0 12px var(--amber)" }} />}
              {/* Corner brackets */}
              {["top:8px;left:8px;border-top:3px solid;border-left:3px solid", "top:8px;right:8px;border-top:3px solid;border-right:3px solid", "bottom:8px;left:8px;border-bottom:3px solid;border-left:3px solid", "bottom:8px;right:8px;border-bottom:3px solid;border-right:3px solid"].map((s, i) => (
                <div key={i} style={Object.fromEntries([...s.split(";").map(p => { const [k, v] = p.split(":"); return [k.trim(), v?.trim()]; }), ["position", "absolute"], ["width", "24px"], ["height", "24px"], ["borderColor", active ? "var(--amber)" : "rgba(255,255,255,.2)"], ["transition", "border-color .3s"]])} />
              ))}
            </div>

            {error && <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--red)", marginBottom: 10, padding: "10px 12px", background: "var(--error-bg)", border: "1px solid var(--red)" }}>{error}</div>}

            {!active
              ? <Btn variant="primary" full size="md" onClick={startCamera}>▶ START CAMERA</Btn>
              : <Btn variant="danger"  full size="md" onClick={stopCamera}>■ STOP CAMERA</Btn>
            }

            {/* Scan result */}
            {result && !active && (
              <div style={{ marginTop: 16, padding: 20, border: `3px solid ${RC[result.result]}`, background: result.result === "VALID" ? "var(--success-bg)" : result.result === "EXPIRED" ? "var(--warn-bg)" : "var(--error-bg)", animation: "stampIn .4s ease" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 3, color: RC[result.result], marginBottom: 8 }}>
                  {result.result === "VALID" ? "✓ PASS VALID" : result.result === "EXPIRED" ? "⚠ EXPIRED" : "✕ INVALID"}
                </div>
                {result.student && <>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--ink)" }}>{result.student}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2, color: "var(--muted)", marginTop: 4 }}>{result.route} · UNTIL {result.until}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1, color: "var(--muted)", marginTop: 2 }}>{result.pass}</div>
                </>}
              </div>
            )}
          </div>

          {/* Scan log */}
          <div>
            <Tag>Today's Scan Log — {history.length} scans</Tag>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {history.map((h, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "50px 1fr 80px 1fr", gap: 12, padding: "12px 14px", background: i % 2 === 0 ? "var(--surface)" : "var(--cream)", borderLeft: `3px solid ${RC[h.result] || "var(--rule)"}`, animation: `fadeUp .3s ease ${i * 0.04}s both` }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1, color: "var(--muted)" }}>{h.time}</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)" }}>{h.student || "—"}</div>
                  <Pill s={h.result} />
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1, color: "var(--muted)" }}>{h.pass}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Page>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  SCREEN 11 — CONDUCTOR: TRIP LOG
// ══════════════════════════════════════════════════════════════════════
export function TripLog() {
  const [date] = useState("03 Mar 2024");
  const SCANS = [
    { time: "08:42", pass: "BPP·2024·001234", student: "Aryan Sharma",  stop: "Library Sq",  result: "VALID"   },
    { time: "08:40", pass: "BPP·2024·000891", student: "Priya Patel",   stop: "Library Sq",  result: "EXPIRED" },
    { time: "08:38", pass: "BPP·2024·001102", student: "Rahul Kumar",   stop: "North Campus",result: "VALID"   },
    { time: "08:35", pass: "BPP·2024·001087", student: "Sneha Menon",   stop: "College Gate",result: "VALID"   },
    { time: "08:32", pass: "BPP·2024·001031", student: "Vikram Singh",  stop: "College Gate",result: "VALID"   },
    { time: "08:30", pass: "BPP·2023·000042", student: "Kiran Rao",     stop: "College Gate",result: "INVALID" },
  ];
  const valid   = SCANS.filter(s => s.result === "VALID").length;
  const expired = SCANS.filter(s => s.result === "EXPIRED").length;
  const invalid = SCANS.filter(s => s.result === "INVALID").length;

  return (
    <>
      <style>{G}</style>
      <Page>
        <PageHeader tag="Conductor · Report" title="TRIP LOG" subtitle={`Date: ${date} · Route Alpha · BUS-02`} actions={[<Btn key="exp" variant="ghost" size="sm">⬇ EXPORT PDF</Btn>]} />

        {/* Summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "3px solid var(--ink)", borderBottom: "1px solid var(--rule)", marginBottom: 28 }}>
          {[
            { num: SCANS.length, lbl: "TOTAL SCANS",    color: "var(--ink)"        },
            { num: valid,        lbl: "VALID",           color: "var(--green)"      },
            { num: expired,      lbl: "EXPIRED",         color: "var(--amber-text)" },
            { num: invalid,      lbl: "INVALID / FRAUD", color: "var(--red)"        },
          ].map((s, i) => (
            <div key={s.lbl} style={{ padding: "20px 22px", textAlign: "center", borderRight: i < 3 ? "1px solid var(--rule)" : "none" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 40, letterSpacing: 1, color: s.color, lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)", marginTop: 6 }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Full scan log */}
        <div style={{ display: "grid", gridTemplateColumns: "60px 80px 1fr 120px 80px", gap: 12, padding: "6px 0", borderBottom: "2px solid var(--ink)" }}>
          {["#", "TIME", "STUDENT", "STOP", "STATUS"].map(h => <div key={h} style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)" }}>{h}</div>)}
        </div>
        {SCANS.map((s, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 80px 1fr 120px 80px", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--rule)", alignItems: "center", background: i % 2 === 0 ? "transparent" : "var(--parchment)", borderLeft: `3px solid ${s.result === "VALID" ? "var(--green)" : s.result === "EXPIRED" ? "var(--amber)" : "var(--red)"}`, paddingLeft: 10 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>#{i + 1}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>{s.time}</span>
            <div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)" }}>{s.student}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 1, color: "var(--muted)" }}>{s.pass}</div>
            </div>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)" }}>{s.stop}</span>
            <Pill s={s.result} />
          </div>
        ))}

        {/* Footer */}
        <div style={{ marginTop: 24, padding: "16px 20px", border: "1px solid var(--rule)", background: "var(--surface)", display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 3, color: "var(--muted)" }}>CONDUCTOR: RAMESH KUMAR · BUS-02</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 3, color: "var(--muted)" }}>REPORT GENERATED: {new Date().toLocaleString()}</div>
        </div>
      </Page>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  SCREEN 12 — CONDUCTOR: MANUAL LOOKUP
// ══════════════════════════════════════════════════════════════════════
export function ManualLookup() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const toast = useToast();

  const MOCK_DB = {
    "CS21B042": { name: "Aryan Sharma",  pass: "BPP·2024·001234", route: "Route Alpha", status: "VALID",   until: "01 Apr 2024", boarding: "Library Sq" },
    "ME20B018": { name: "Priya Patel",   pass: "BPP·2023·000891", route: "Route Alpha", status: "EXPIRED", until: "31 Dec 2023", boarding: "Library Sq" },
    "BPP·2024·001234": { name: "Aryan Sharma", pass: "BPP·2024·001234", route: "Route Alpha", status: "VALID", until: "01 Apr 2024", boarding: "Library Sq" },
  };

  const search = async () => {
    if (!query.trim()) { toast.error("Enter a student ID or pass number."); return; }
    setSearching(true); setResult(null); setNotFound(false);
    await new Promise(r => setTimeout(r, 700));
    const found = MOCK_DB[query.trim().toUpperCase()] || MOCK_DB[query.trim()];
    setSearching(false);
    if (found) { setResult(found); }
    else { setNotFound(true); }
  };

  const RC = { VALID: "var(--green)", EXPIRED: "var(--amber-text)", INVALID: "var(--red)" };

  return (
    <>
      <style>{G}</style>
      <Page style={{ maxWidth: 600, margin: "0 auto" }}>
        <PageHeader tag="Conductor · Lookup" title="MANUAL LOOKUP" subtitle="Search by student ID or pass number" />

        {/* Search box */}
        <div style={{ display: "flex", gap: 0, marginBottom: 24 }}>
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()}
            placeholder="CS21B042  or  BPP·2024·001234"
            style={{ flex: 1, padding: "14px 16px", border: "2px solid var(--ink)", borderRight: "none", background: "var(--surface)", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink)", outline: "none", letterSpacing: 1 }} />
          <button onClick={search} style={{ padding: "14px 24px", background: "var(--ink)", color: "var(--amber-on-ink)", border: "none", fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: 2, cursor: "pointer" }}>
            {searching ? "…" : "SEARCH"}
          </button>
        </div>

        {/* Result */}
        {searching && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 0" }}>
            <Spinner size={20} />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)" }}>Looking up records…</span>
          </div>
        )}

        {notFound && (
          <div style={{ padding: "24px", border: "2px solid var(--red)", background: "var(--error-bg)", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 2, color: "var(--red)", marginBottom: 8 }}>NOT FOUND</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--red)" }}>No student or pass found for "{query}". Check the ID and try again.</div>
          </div>
        )}

        {result && (
          <div style={{ border: `3px solid ${RC[result.status]}`, background: result.status === "VALID" ? "var(--success-bg)" : result.status === "EXPIRED" ? "var(--warn-bg)" : "var(--error-bg)", padding: 28, animation: "stampIn .4s ease" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 3, color: RC[result.status], marginBottom: 12 }}>
              {result.status === "VALID" ? "✓ PASS VALID" : result.status === "EXPIRED" ? "⚠ PASS EXPIRED" : "✕ INVALID"}
            </div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--ink)", marginBottom: 16 }}>{result.name}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px" }}>
              {[["Pass Number", result.pass], ["Route", result.route], ["Valid Until", result.until], ["Boarding Stop", result.boarding]].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)" }}>{l}</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <Btn variant="success"   size="sm" onClick={() => toast.success("Scan logged.")}>LOG BOARDING</Btn>
              <Btn variant="secondary" size="sm" onClick={() => { setResult(null); setQuery(""); }}>CLEAR</Btn>
            </div>
          </div>
        )}

        {/* Recent lookups */}
        <Rule my={32} />
        <Tag>Recent Lookups Today</Tag>
        {["CS21B042 — Aryan Sharma — VALID", "ME20B018 — Priya Patel — EXPIRED", "EC22B091 — Rahul Kumar — VALID"].map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--rule)" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)" }}>{r.split(" — ")[1]}</span>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Pill s={r.split(" — ")[2]} />
              <button onClick={() => setQuery(r.split(" — ")[0])} style={{ background: "none", border: "none", fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--amber-text)", cursor: "pointer" }}>SEARCH AGAIN</button>
            </div>
          </div>
        ))}
      </Page>
      <toast.Toaster />
    </>
  );
}
