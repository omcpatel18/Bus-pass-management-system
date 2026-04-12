/**
 * ═══════════════════════════════════════════════════════════════════
 *  BUSPASSPRO — STUDENT PROFILE PAGE
 *  Consistent with BusPassPro Design System v2.0
 *
 *  HOW TO ADD TO APP:
 *  1. Import this file in BusPassPro.jsx / App.jsx
 *  2. In NAV.student array, add: ["PROFILE", "profile"]
 *  3. In page routing, add: if(page==="profile") return <StudentProfile user={user} />
 *
 *  SECTIONS:
 *  ① Identity header   — Avatar, name, ID, department, college badge
 *  ② Active pass card  — Physical ticket feel, QR, countdown timer
 *  ③ Stats strip       — Days left, trips, savings, route
 *  ④ Personal info     — Editable form, boarding stop
 *  ⑤ Pass history      — Previous passes with status pills
 *  ⑥ Payment history   — Transactions with amounts
 *  ⑦ Preferences       — Notification toggles
 *  ⑧ Account actions   — Change password, danger zone
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Google Fonts (same as rest of app) ────────────────────────────
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;700&family=Instrument+Sans:wght@400;500;600&display=swap');
`;

// ─── CSS Variables (must match DesignSystem.jsx exactly) ────────────
const CSS_VARS = `
:root {
  --cream:        #F6F0E4;
  --surface:      #FDFAF3;
  --parchment:    #EDE4CC;
  --ink-surface:  #1A1208;
  --ink:          #1A1208;
  --ink-mid:      #3D2410;
  --amber-text:   #8B520A;
  --muted:        #6B5535;
  --green:        #1E6641;
  --red:          #B02020;
  --amber-on-ink: #F0A830;
  --cream-on-ink: #F6F0E4;
  --green-on-ink: #52B788;
  --red-on-ink:   #FF6B6B;
  --muted-on-ink: #B09878;
  --amber:        #C8832A;
  --rule:         #D4C4A0;
  --amber-light:  #F5D49A;
  --success-bg:   #EBF7F0;
  --error-bg:     #FDEAEA;
  --warn-bg:      #FEF7E6;
  --font-display: 'Bebas Neue', sans-serif;
  --font-serif:   'DM Serif Display', serif;
  --font-mono:    'JetBrains Mono', monospace;
  --font-sans:    'Instrument Sans', sans-serif;
}

@keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn   { from{opacity:0} to{opacity:1} }
@keyframes spin     { to{transform:rotate(360deg)} }
@keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.65)} }
@keyframes stampDrop{
  0%  {transform:scale(2.5) rotate(-12deg);opacity:0}
  65% {transform:scale(.92) rotate(3deg);opacity:1}
  100%{transform:scale(1) rotate(-3deg);opacity:1}
}
@keyframes tickDown { from{stroke-dashoffset:0} to{stroke-dashoffset:var(--dash)} }
@keyframes shimmer  {
  0%  {background-position:-200% 0}
  100%{background-position: 200% 0}
}
@keyframes slideDown{
  from{opacity:0;transform:translateY(-8px)}
  to  {opacity:1;transform:translateY(0)}
}
`;

// ─── Tiny shared atoms (mirrors DesignSystem.jsx) ──────────────────

const Tag = ({ children, color }) => (
  <div style={{
    fontFamily: "var(--font-mono)", fontSize: 8,
    letterSpacing: 4, color: color || "var(--muted)",
    textTransform: "uppercase", marginBottom: 8, lineHeight: 1.4,
  }}>{children}</div>
);

const Rule = ({ my = 20 }) => (
  <div style={{ height: 1, background: "var(--rule)", margin: `${my}px 0` }} />
);

const DoubleRule = ({ my = 28 }) => (
  <div style={{ borderTop: "3px double var(--ink)", margin: `${my}px 0` }} />
);

// Status pill — AA verified per DesignSystem
const Pill = ({ s }) => {
  const STATUS = (s || "").toUpperCase();
  const map = {
    ACTIVE:   { bg: "#1E6641", color: "#F6F0E4" },
    APPROVED: { bg: "#1E6641", color: "#F6F0E4" },
    VALID:    { bg: "#1E6641", color: "#F6F0E4" },
    PENDING:  { bg: "#C8832A", color: "#1A1208" },
    REJECTED: { bg: "#B02020", color: "#F6F0E4" },
    EXPIRED:  { bg: "#6B5535", color: "#F6F0E4" },
    PAID:     { bg: "#1E6641", color: "#F6F0E4" },
    FAILED:   { bg: "#B02020", color: "#F6F0E4" },
    REFUNDED: { bg: "#6B5535", color: "#F6F0E4" },
  };
  const c = map[STATUS] || map.PENDING;
  return (
    <span style={{
      background: c.bg, color: c.color,
      fontFamily: "var(--font-mono)", fontSize: 9,
      fontWeight: 700, letterSpacing: 2,
      padding: "3px 10px",
      clipPath: "polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)",
      display: "inline-block", lineHeight: 1.7,
    }}>{STATUS}</span>
  );
};

const Btn = ({ children, onClick, variant = "primary", full = false, size = "md", disabled = false }) => {
  const [hov, setHov] = useState(false);
  const pad = { sm: "6px 16px", md: "10px 22px", lg: "13px 28px" }[size];
  const fs  = { sm: 11, md: 13, lg: 15 }[size];
  const styles = {
    primary:   { bg: hov && !disabled ? "#2C1E0A" : "var(--ink)",    color: "var(--amber-on-ink)", border: "none" },
    secondary: { bg: hov && !disabled ? "var(--parchment)" : "transparent", color: "var(--ink)",   border: "1.5px solid var(--ink)" },
    danger:    { bg: hov && !disabled ? "#8A1818" : "var(--red)",     color: "var(--cream-on-ink)", border: "none" },
    ghost:     { bg: hov && !disabled ? "var(--parchment)" : "transparent", color: "var(--amber-text)", border: "1.5px solid var(--rule)" },
  };
  const s = styles[variant];
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: pad, background: s.bg, color: s.color,
        border: s.border || "none",
        fontFamily: "var(--font-display)", fontSize: fs, letterSpacing: 2,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        width: full ? "100%" : "auto",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "background .18s",
      }}>{children}</button>
  );
};

const InpField = ({ label, value, onChange, type = "text", placeholder, readOnly = false, error }) => {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <Tag>{label}</Tag>
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} readOnly={readOnly}
        onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
        style={{
          width: "100%", padding: "10px 14px",
          border: `1.5px solid ${error ? "var(--red)" : foc ? "var(--amber)" : "var(--rule)"}`,
          background: readOnly ? "var(--parchment)" : foc ? "var(--surface)" : "var(--cream)",
          fontFamily: "var(--font-sans)", fontSize: 14,
          color: readOnly ? "var(--muted)" : "var(--ink)",
          outline: "none", borderRadius: 0,
          transition: "border-color .18s, background .18s",
          cursor: readOnly ? "not-allowed" : "text",
        }}
      />
      {error && <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--red)", marginTop: 4 }}>{error}</div>}
    </div>
  );
};

const Skeleton = ({ h = 18, w = "100%", mb = 8 }) => (
  <div style={{
    height: h, width: w, marginBottom: mb,
    background: `linear-gradient(90deg, var(--parchment) 0%, var(--rule) 50%, var(--parchment) 100%)`,
    backgroundSize: "200% 100%",
    animation: "shimmer 1.6s ease infinite",
  }} />
);

// ─── Toast (lightweight local version) ────────────────────────────
function useLocalToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), type === "error" ? 6000 : 3500);
  }, []);
  return {
    toasts,
    success: m => add(m, "success"),
    error:   m => add(m, "error"),
    info:    m => add(m, "info"),
    Toaster: () => (
      <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 8, zIndex: 9999 }}>
        {toasts.map(t => {
          const s = {
            success: { bg: "var(--success-bg)", border: "var(--green)", text: "var(--green)",    icon: "✓" },
            error:   { bg: "var(--error-bg)",   border: "var(--red)",   text: "var(--red)",      icon: "✕" },
            info:    { bg: "var(--surface)",     border: "var(--ink)",   text: "var(--ink)",      icon: "◆" },
          }[t.type] || {};
          return (
            <div key={t.id} style={{
              background: s.bg, border: `2px solid ${s.border}`,
              padding: "11px 16px", minWidth: 280,
              display: "flex", gap: 10, alignItems: "center",
              animation: "slideDown .3s ease",
              boxShadow: "0 4px 20px rgba(26,18,8,.1)",
            }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 18, color: s.text }}>{s.icon}</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: s.text }}>{t.msg}</span>
            </div>
          );
        })}
      </div>
    ),
  };
}

// ─── QR Canvas (same pattern as main app) ──────────────────────────
function QRCanvas({ seed = 42, size = 110 }) {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"), m = 17, cell = size / m;
    ctx.fillStyle = "#1A1208";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#F6F0E4";
    ctx.fillRect(2, 2, size - 4, size - 4);
    for (let r = 0; r < m; r++) {
      for (let col = 0; col < m; col++) {
        const corner = (r < 4 && col < 4) || (r < 4 && col > m - 5) || (r > m - 5 && col < 4);
        const filled = corner ? 1 : (((seed * 2654435761 + r * 1234567 + col * 7654321) >>> 0) % 3 === 0 ? 1 : 0);
        if (filled) { ctx.fillStyle = "#1A1208"; ctx.fillRect(col * cell + 2, r * cell + 2, cell - 1, cell - 1); }
      }
    }
    // Corner squares
    [[1, 1], [1, m - 4], [m - 4, 1]].forEach(([r, cc]) => {
      ctx.strokeStyle = "#1A1208"; ctx.lineWidth = 2;
      ctx.strokeRect(cc * cell + 1, r * cell + 1, 3 * cell, 3 * cell);
      ctx.fillStyle = "#1A1208";
      ctx.fillRect((cc + 1) * cell + 1, (r + 1) * cell + 1, cell, cell);
    });
  }, [seed, size]);
  return <canvas ref={ref} width={size} height={size} style={{ display: "block", imageRendering: "pixelated" }} />;
}

// ─── Countdown Ring ────────────────────────────────────────────────
function CountdownRing({ daysLeft, totalDays }) {
  const r = 36, circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, daysLeft / totalDays));
  const offset = circ * (1 - pct);
  const color = daysLeft > 14 ? "#1E6641" : daysLeft > 7 ? "#C8832A" : "#B02020";
  return (
    <div style={{ position: "relative", width: 88, height: 88 }}>
      <svg width={88} height={88} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={44} cy={44} r={r} fill="none" stroke="var(--parchment)" strokeWidth={6} />
        <circle cx={44} cy={44} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color, lineHeight: 1 }}>{daysLeft}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 6, letterSpacing: 2, color: "var(--muted)" }}>DAYS</div>
      </div>
    </div>
  );
}

// ─── Toggle switch ──────────────────────────────────────────────────
function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 44, height: 24, borderRadius: 12,
      background: on ? "var(--green)" : "var(--rule)",
      border: "none", cursor: "pointer", position: "relative",
      transition: "background .2s", flexShrink: 0,
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%", background: "white",
        position: "absolute", top: 3,
        left: on ? 23 : 3, transition: "left .2s",
        boxShadow: "0 1px 3px rgba(0,0,0,.2)",
      }} />
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════
//  MOCK DATA (replace with real API calls in Wired version)
// ══════════════════════════════════════════════════════════════════
const MOCK_USER = {
  id: "CS21B042",
  name: "Aryan Sharma",
  email: "aryan.sharma@college.edu",
  phone: "+91 98765 43210",
  department: "Computer Science & Engineering",
  year: "IV Year",
  college: "National College of Engineering",
  avatar_initials: "AS",
  joined: "August 2021",
  boarding_stop: "Library Sq",
};

const MOCK_PASS = {
  pass_number: "BPP·2024·001234",
  route: "Route Alpha",
  source: "College Gate",
  destination: "City Center",
  boarding_stop: "Library Sq",
  type: "QUARTERLY",
  valid_from: "01 JAN 2024",
  valid_until: "01 APR 2024",
  days_left: 29,
  total_days: 90,
  fare_total: 1215,
  status: "ACTIVE",
  qr_seed: 42,
};

const MOCK_HISTORY = [
  { id: "BPP·2023·000891", route: "Route Alpha", type: "QUARTERLY", from: "01 OCT 2023", until: "31 DEC 2023", status: "EXPIRED",  amount: 1215 },
  { id: "BPP·2023·000512", route: "Route Alpha", type: "QUARTERLY", from: "01 JUL 2023", until: "30 SEP 2023", status: "EXPIRED",  amount: 1215 },
  { id: "BPP·2023·000201", route: "Route Beta",  type: "MONTHLY",   from: "01 JUN 2023", until: "30 JUN 2023", status: "EXPIRED",  amount: 450  },
];

const MOCK_PAYMENTS = [
  { id: "PAY001", date: "01 Jan 2024", desc: "Pass BPP·2024·001234 — Quarterly",  amount: 1215, status: "PAID" },
  { id: "PAY002", date: "01 Oct 2023", desc: "Pass BPP·2023·000891 — Quarterly",  amount: 1215, status: "PAID" },
  { id: "PAY003", date: "01 Jul 2023", desc: "Pass BPP·2023·000512 — Quarterly",  amount: 1215, status: "PAID" },
  { id: "PAY004", date: "01 Jun 2023", desc: "Pass BPP·2023·000201 — Monthly",    amount: 450,  status: "PAID" },
];

const STOPS = ["College Gate", "North Campus", "Library Sq", "Main Market", "City Centre", "Tech Park", "Ring Road", "IT Hub"];

// ══════════════════════════════════════════════════════════════════
//  SECTION ①  IDENTITY HEADER
// ══════════════════════════════════════════════════════════════════
function IdentityHeader({ user, pass }) {
  return (
    <div style={{
      background: "var(--ink)",
      padding: "36px 44px",
      display: "flex", alignItems: "center", gap: 32,
      animation: "fadeUp .4s ease both",
    }}>
      {/* Avatar circle */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "var(--amber)", border: "3px solid var(--amber-on-ink)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontFamily: "var(--font-display)", fontSize: 28,
            color: "var(--ink)", letterSpacing: 1,
          }}>{user.avatar_initials}</span>
        </div>
        {/* Online dot */}
        <div style={{
          position: "absolute", bottom: 4, right: 4,
          width: 14, height: 14, borderRadius: "50%",
          background: "#52B788", border: "2px solid var(--ink)",
          animation: "pulseDot 2s ease-in-out infinite",
        }} />
      </div>

      {/* Name + meta */}
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 4, color: "var(--muted-on-ink)", marginBottom: 4 }}>
          STUDENT PORTAL — {user.college.toUpperCase()}
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "var(--cream-on-ink)", lineHeight: 1.1, marginBottom: 6 }}>
          {user.name}
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[
            [user.id,         "STUDENT ID"],
            [user.department, "DEPARTMENT"],
            [user.year,       "YEAR"],
          ].map(([val, lbl]) => (
            <div key={lbl}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted-on-ink)" }}>{lbl}</div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--cream-on-ink)", fontWeight: 500 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pass status badge */}
      <div style={{
        background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)",
        padding: "16px 20px", textAlign: "center", flexShrink: 0,
      }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted-on-ink)", marginBottom: 6 }}>PASS STATUS</div>
        <Pill s={pass.status} />
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--amber-on-ink)", marginTop: 6 }}>
          {pass.days_left} DAYS REMAINING
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  SECTION ②  ACTIVE PASS CARD  (physical ticket feel)
// ══════════════════════════════════════════════════════════════════
function ActivePassCard({ pass, user }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Tag>Current Active Pass</Tag>
        <button onClick={() => setFlipped(f => !f)} style={{
          background: "none", border: "none", fontFamily: "var(--font-mono)",
          fontSize: 7, letterSpacing: 3, color: "var(--amber-text)", cursor: "pointer",
        }}>{flipped ? "◀ FRONT" : "BACK ▶"}</button>
      </div>

      {/* Card wrapper — fixed height so it doesn't jump */}
      <div style={{ position: "relative", height: 200 }}>

        {/* FRONT OF CARD */}
        <div style={{
          position: "absolute", inset: 0,
          border: "1.5px solid var(--rule)",
          background: "var(--ink)",
          display: flipped ? "none" : "flex",
          overflow: "hidden",
          animation: "fadeIn .25s ease",
          boxShadow: "0 6px 24px rgba(26,18,8,.18)",
        }}>
          {/* Left: QR + pass number */}
          <div style={{
            width: 160, flexShrink: 0, borderRight: "1.5px dashed rgba(240,168,48,.3)",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "20px 16px", gap: 10,
          }}>
            <QRCanvas seed={pass.qr_seed} size={100} />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 1, color: "var(--amber-on-ink)", textAlign: "center" }}>
              {pass.pass_number}
            </div>
          </div>

          {/* Perforated edge dots */}
          <div style={{
            width: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "space-between",
            padding: "14px 0",
          }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "var(--cream)", marginLeft: -4,
              }} />
            ))}
          </div>

          {/* Right: Pass details */}
          <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {/* Top */}
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted-on-ink)", marginBottom: 2 }}>
                BUSPASSPRO · COLLEGE EXPRESS
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--amber-on-ink)", letterSpacing: 1, lineHeight: 1 }}>
                {pass.route}
              </div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted-on-ink)", marginTop: 4 }}>
                {pass.source}  →  {pass.destination}
              </div>
            </div>

            {/* Middle: details grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px 16px" }}>
              {[
                ["HOLDER",   user.name],
                ["ID",       user.id],
                ["BOARD AT", pass.boarding_stop],
                ["TYPE",     pass.type],
                ["FROM",     pass.valid_from],
                ["UNTIL",    pass.valid_until],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 6, letterSpacing: 2, color: "var(--muted-on-ink)" }}>{l}</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--cream-on-ink)", fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Bottom: stamp */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{
                border: "2px solid var(--green-on-ink)", color: "var(--green-on-ink)",
                fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: 3,
                padding: "3px 10px", transform: "rotate(-3deg)",
                animation: "stampDrop .5s ease .3s both",
              }}>✓ VALID</div>
            </div>
          </div>

          {/* Ghost watermark */}
          <div style={{
            position: "absolute", right: -10, top: "50%", transform: "translateY(-50%)",
            fontFamily: "var(--font-display)", fontSize: 120, color: "rgba(240,168,48,.04)",
            letterSpacing: -4, pointerEvents: "none", userSelect: "none",
          }}>BPP</div>
        </div>

        {/* BACK OF CARD — Terms + barcode */}
        <div style={{
          position: "absolute", inset: 0,
          border: "1.5px solid var(--rule)",
          background: "var(--parchment)",
          display: flipped ? "flex" : "none",
          flexDirection: "column", padding: 24, gap: 16,
          animation: "fadeIn .25s ease",
        }}>
          <Tag>Terms & Conditions</Tag>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", lineHeight: 1.7, flex: 1 }}>
            This pass is non-transferable and valid only for the named holder. Present QR code to conductor for verification.
            Lost passes must be reported immediately to the college transport office. Misuse may result in cancellation without refund.
            This pass covers travel on assigned route only. Valid until the date shown on the front.
          </div>
          {/* Barcode simulation */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
            {Array.from({ length: 60 }).map((_, i) => {
              const h = [3, 4, 2, 5, 3, 2, 4, 3, 5, 2][i % 10];
              return <div key={i} style={{ width: 2, height: h * 6, background: "var(--ink)", opacity: i % 11 === 0 ? 0 : 1 }} />;
            })}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)" }}>
            {pass.pass_number} · ISSUED BY BUSPASSPRO · NOT FOR RESALE
          </div>
        </div>
      </div>

      {/* Download / Share actions */}
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <Btn variant="secondary" size="sm">⬇ DOWNLOAD PASS</Btn>
        <Btn variant="ghost"    size="sm">✉ EMAIL TO SELF</Btn>
        <Btn variant="ghost"    size="sm">🔗 SHARE LINK</Btn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  SECTION ③  STATS STRIP
// ══════════════════════════════════════════════════════════════════
function StatsStrip({ pass, payments }) {
  const totalPaid = payments.filter(p => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const monthlyFull = 450;
  const quarterSaved = (monthlyFull * 3) - 1215;
  const stats = [
    { num: pass.days_left,                   lbl: "DAYS LEFT",        unit: "days",  color: pass.days_left > 14 ? "var(--green)" : "var(--red)" },
    { num: payments.length,                  lbl: "TOTAL PASSES",     unit: "passes",color: "var(--amber-text)" },
    { num: `₹${totalPaid.toLocaleString()}`, lbl: "TOTAL PAID",       unit: "",      color: "var(--ink)" },
    { num: `₹${quarterSaved * payments.filter(p=>p.desc.includes("Quarterly")).length}`, lbl: "SAVED (vs MONTHLY)", unit: "", color: "var(--green)" },
  ];
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(4,1fr)",
      borderTop: "3px solid var(--ink)", borderBottom: "1px solid var(--rule)",
    }}>
      {stats.map((s, i) => (
        <div key={s.lbl} style={{
          padding: "20px 24px", textAlign: "center",
          borderRight: i < 3 ? "1px solid var(--rule)" : "none",
          animation: `fadeUp .4s ease ${i * 0.08}s both`,
        }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 36, color: s.color, letterSpacing: 1, lineHeight: 1 }}>
            {s.num}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)", marginTop: 4 }}>
            {s.lbl}
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  SECTION ④  PERSONAL INFO (editable form)
// ══════════════════════════════════════════════════════════════════
function PersonalInfo({ user, toast }) {
  const [form, setForm] = useState({
    name:     user.name,
    phone:    user.phone,
    boarding: user.boarding_stop,
    dept:     user.department,
    year:     user.year,
  });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setDirty(true); };

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 900)); // replace with API call
    setSaving(false);
    setDirty(false);
    toast.success("Profile updated successfully!");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Tag>Personal Information</Tag>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)" }}>
            Your Details
          </div>
        </div>
        {dirty && (
          <Btn variant="primary" size="sm" onClick={save} disabled={saving}>
            {saving ? "SAVING…" : "SAVE CHANGES"}
          </Btn>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <InpField label="Full Name"      value={form.name}     onChange={e => set("name", e.target.value)} />
        <InpField label="Email Address"  value={user.email}    onChange={() => {}} readOnly placeholder="Read-only" />
        <InpField label="Phone Number"   value={form.phone}    onChange={e => set("phone", e.target.value)} type="tel" />
        <InpField label="Student ID"     value={user.id}       onChange={() => {}} readOnly />
        <InpField label="Department"     value={form.dept}     onChange={e => set("dept", e.target.value)} />
        <InpField label="Year of Study"  value={form.year}     onChange={e => set("year", e.target.value)} />
      </div>

      {/* Boarding stop */}
      <div style={{ marginBottom: 16 }}>
        <Tag>Preferred Boarding Stop</Tag>
        <select
          value={form.boarding}
          onChange={e => set("boarding", e.target.value)}
          style={{
            width: "100%", padding: "10px 14px",
            border: "1.5px solid var(--rule)",
            background: "var(--cream)", fontFamily: "var(--font-sans)",
            fontSize: 14, color: "var(--ink)", outline: "none", appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%231A1208' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 36,
          }}
        >
          {STOPS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", marginTop: 5 }}>
          This stop will be pre-selected when you apply for a new pass.
        </div>
      </div>

      <Rule />
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)" }}>
        MEMBER SINCE {user.joined.toUpperCase()} · {user.email}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  SECTION ⑤  PASS HISTORY
// ══════════════════════════════════════════════════════════════════
function PassHistory({ history, currentPass }) {
  const all = [
    { ...currentPass, from: currentPass.valid_from, until: currentPass.valid_until, amount: currentPass.fare_total },
    ...history,
  ];
  return (
    <div>
      <Tag>Pass History</Tag>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)", marginBottom: 16 }}>
        All Passes
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {all.map((p, i) => (
          <div key={p.id || i} style={{
            display: "grid", gridTemplateColumns: "1fr 80px 100px 80px",
            alignItems: "center", gap: 16,
            padding: "14px 16px",
            background: i % 2 === 0 ? "var(--surface)" : "var(--cream)",
            border: i === 0 ? "1.5px solid var(--amber)" : "1px solid var(--rule)",
            animation: `fadeUp .3s ease ${i * 0.06}s both`,
          }}>
            {/* Pass info */}
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1, color: "var(--amber-text)" }}>
                {p.pass_number || p.id}
              </div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", fontWeight: 500, marginTop: 2 }}>
                {p.route}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)", marginTop: 2 }}>
                {p.from} – {p.until} · {p.type}
              </div>
            </div>
            {/* Status */}
            <Pill s={p.status} />
            {/* Amount */}
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--ink)", letterSpacing: 1 }}>
              ₹{(p.amount || p.fare_total)?.toLocaleString()}
            </div>
            {/* Action */}
            {p.status !== "EXPIRED" ? (
              <Btn variant="ghost" size="sm">VIEW QR</Btn>
            ) : (
              <Btn variant="ghost" size="sm">RENEW →</Btn>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  SECTION ⑥  PAYMENT HISTORY
// ══════════════════════════════════════════════════════════════════
function PaymentHistory({ payments }) {
  const total = payments.filter(p => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
        <div>
          <Tag>Payment History</Tag>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)" }}>Transactions</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)" }}>TOTAL SPENT</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--ink-mid)", letterSpacing: 1 }}>
            ₹{total.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Header row */}
      <div style={{
        display: "grid", gridTemplateColumns: "100px 1fr 100px 80px",
        gap: 16, padding: "6px 16px",
        borderBottom: "2px solid var(--ink)",
      }}>
        {["DATE", "DESCRIPTION", "AMOUNT", "STATUS"].map(h => (
          <div key={h} style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)" }}>{h}</div>
        ))}
      </div>

      {payments.map((p, i) => (
        <div key={p.id} style={{
          display: "grid", gridTemplateColumns: "100px 1fr 100px 80px",
          gap: 16, padding: "13px 16px", alignItems: "center",
          background: i % 2 === 0 ? "var(--surface)" : "var(--cream)",
          borderBottom: "1px solid var(--rule)",
          animation: `fadeUp .3s ease ${i * 0.06}s both`,
        }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1, color: "var(--muted)" }}>{p.date}</div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)" }}>{p.desc}</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--ink)", letterSpacing: 1 }}>₹{p.amount.toLocaleString()}</div>
          <Pill s={p.status} />
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  SECTION ⑦  PREFERENCES
// ══════════════════════════════════════════════════════════════════
function Preferences({ toast }) {
  const [prefs, setPrefs] = useState({
    email_expire:    true,
    email_approval:  true,
    email_delay:     false,
    sms_scan:        false,
    push_all:        true,
  });

  const set = (k) => {
    setPrefs(p => ({ ...p, [k]: !p[k] }));
    toast.info("Preference saved.");
  };

  const rows = [
    { key: "email_expire",   label: "Email when pass is about to expire",    sub: "7 days before expiry" },
    { key: "email_approval", label: "Email when pass application is reviewed", sub: "Approvals and rejections" },
    { key: "email_delay",    label: "Email for bus delays",                   sub: "Delays over 10 minutes" },
    { key: "sms_scan",       label: "SMS on each QR scan",                   sub: "Confirmation of boarding" },
    { key: "push_all",       label: "In-app notifications",                  sub: "All alerts in the notification bell" },
  ];

  return (
    <div>
      <Tag>Notification Preferences</Tag>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)", marginBottom: 16 }}>
        Notifications
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {rows.map((r, i) => (
          <div key={r.key} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 0", gap: 16,
            borderBottom: i < rows.length - 1 ? "1px solid var(--rule)" : "none",
          }}>
            <div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--ink)", fontWeight: 500 }}>{r.label}</div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{r.sub}</div>
            </div>
            <Toggle on={prefs[r.key]} onChange={() => set(r.key)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  SECTION ⑧  ACCOUNT ACTIONS + DANGER ZONE
// ══════════════════════════════════════════════════════════════════
function AccountActions({ toast, onLogout }) {
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwErr, setPwErr] = useState("");
  const [showDanger, setShowDanger] = useState(false);

  const changePassword = async () => {
    if (!pwForm.current) return setPwErr("Enter your current password.");
    if (pwForm.next.length < 8) return setPwErr("New password must be at least 8 characters.");
    if (pwForm.next !== pwForm.confirm) return setPwErr("Passwords do not match.");
    setPwErr(""); setPwSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setPwSaving(false);
    setPwForm({ current: "", next: "", confirm: "" });
    toast.success("Password changed successfully!");
  };

  return (
    <div>
      {/* Change password */}
      <Tag>Security</Tag>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)", marginBottom: 16 }}>
        Change Password
      </div>
      <div style={{ maxWidth: 480 }}>
        <InpField label="Current Password"     type="password" value={pwForm.current}  onChange={e => setPwForm(f => ({ ...f, current:  e.target.value }))} />
        <InpField label="New Password"         type="password" value={pwForm.next}     onChange={e => setPwForm(f => ({ ...f, next:     e.target.value }))} />
        <InpField label="Confirm New Password" type="password" value={pwForm.confirm}  onChange={e => setPwForm(f => ({ ...f, confirm:  e.target.value }))} error={pwErr} />
        <Btn variant="primary" size="md" onClick={changePassword} disabled={pwSaving}>
          {pwSaving ? "UPDATING…" : "UPDATE PASSWORD"}
        </Btn>
      </div>

      <DoubleRule my={32} />

      {/* Quick actions */}
      <Tag>Account</Tag>
      <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
        <Btn variant="secondary" size="sm" onClick={() => toast.info("Support ticket opened.")}>📧 CONTACT SUPPORT</Btn>
        <Btn variant="secondary" size="sm" onClick={() => toast.info("Data export will be emailed to you.")}>⬇ EXPORT MY DATA</Btn>
        <Btn variant="ghost"     size="sm" onClick={onLogout}>↩ SIGN OUT</Btn>
      </div>

      {/* Danger zone */}
      <div style={{ border: "1.5px solid var(--red)", padding: "20px 24px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: 2, color: "var(--red)", marginBottom: 8 }}>
          DANGER ZONE
        </div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", marginBottom: 16, lineHeight: 1.6 }}>
          Deactivating your account will cancel your active pass without refund and remove access to BusPassPro.
          This action cannot be undone.
        </div>
        {!showDanger ? (
          <Btn variant="danger" size="sm" onClick={() => setShowDanger(true)}>DEACTIVATE ACCOUNT</Btn>
        ) : (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: "var(--red)" }}>
              ARE YOU SURE?
            </span>
            <Btn variant="danger"    size="sm" onClick={() => toast.error("Account deactivated.")}>YES, DEACTIVATE</Btn>
            <Btn variant="secondary" size="sm" onClick={() => setShowDanger(false)}>CANCEL</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  TAB NAV — internal tabs within profile
// ══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "pass",     label: "MY PASS"    },
  { id: "info",     label: "PROFILE"    },
  { id: "history",  label: "HISTORY"    },
  { id: "payments", label: "PAYMENTS"   },
  { id: "prefs",    label: "PREFERENCES"},
  { id: "account",  label: "SECURITY"   },
];

// ══════════════════════════════════════════════════════════════════
//  MAIN EXPORT — STUDENT PROFILE PAGE
// ══════════════════════════════════════════════════════════════════
export default function StudentProfile({ user = MOCK_USER, pass = MOCK_PASS, onLogout = () => {} }) {
  const [tab, setTab]       = useState("pass");
  const [loading, setLoading] = useState(true);
  const toast = useLocalToast();

  // Simulate initial data load
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{FONTS + CSS_VARS}</style>

      {/* Identity header */}
      {loading ? (
        <div style={{ background: "var(--ink)", padding: "36px 44px" }}>
          <Skeleton h={80} w={80} mb={0} />
        </div>
      ) : (
        <IdentityHeader user={user} pass={pass} />
      )}

      {/* Stats strip */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
          {[0,1,2,3].map(i => <div key={i} style={{ padding: "20px 24px" }}><Skeleton h={48} /></div>)}
        </div>
      ) : (
        <StatsStrip pass={pass} payments={MOCK_PAYMENTS} />
      )}

      {/* Tab navigation */}
      <div style={{
        display: "flex", borderBottom: "2px solid var(--rule)",
        padding: "0 44px", background: "var(--cream)",
        position: "sticky", top: 0, zIndex: 10,
        boxShadow: "0 2px 8px rgba(26,18,8,.04)",
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none",
            fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 3,
            color: tab === t.id ? "var(--ink)" : "var(--muted)",
            padding: "16px 20px 14px",
            borderBottom: `2px solid ${tab === t.id ? "var(--amber)" : "transparent"}`,
            cursor: "pointer", marginBottom: -2,
            transition: "color .18s, border-color .18s",
            whiteSpace: "nowrap",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{
        padding: "36px 44px",
        background: "var(--cream)", minHeight: 500,
      }}>
        {loading ? (
          <div>
            <Skeleton h={200} mb={16} />
            <Skeleton h={24}  mb={10} w="60%" />
            <Skeleton h={18}  mb={8}  w="80%" />
            <Skeleton h={18}  mb={8}  w="70%" />
          </div>
        ) : (
          <>
            {tab === "pass" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
                <div style={{ animation: "fadeUp .35s ease" }}>
                  <ActivePassCard pass={pass} user={user} />
                </div>
                <div style={{ animation: "fadeUp .35s ease .08s both" }}>
                  {/* Pass meta + countdown */}
                  <Tag>Pass Validity</Tag>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)", marginBottom: 20 }}>
                    Time Remaining
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
                    <CountdownRing daysLeft={pass.days_left} totalDays={pass.total_days} />
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink)", letterSpacing: 1, lineHeight: 1 }}>
                        {pass.days_left} DAYS
                      </div>
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                        Valid until {pass.valid_until}
                      </div>
                      {pass.days_left <= 14 && (
                        <div style={{
                          marginTop: 10, padding: "8px 12px",
                          background: "var(--warn-bg)", border: "1.5px solid var(--amber)",
                          fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--amber-text)",
                        }}>
                          ⚠ Pass expiring soon — renew to avoid disruption.
                        </div>
                      )}
                    </div>
                  </div>

                  <Rule />

                  {/* Route info card */}
                  <Tag>Route Details</Tag>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--rule)", padding: "16px 20px" }}>
                    {[
                      ["ROUTE",       pass.route],
                      ["FROM",        pass.source],
                      ["TO",          pass.destination],
                      ["BOARD AT",    pass.boarding_stop],
                      ["PASS TYPE",   pass.type],
                      ["FARE PAID",   `₹${pass.fare_total?.toLocaleString()}`],
                    ].map(([l, v], i) => (
                      <div key={l} style={{
                        display: "flex", justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: i < 5 ? "1px solid var(--rule)" : "none",
                      }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2, color: "var(--muted)" }}>{l}</div>
                        <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <Btn variant="primary" full>APPLY FOR RENEWAL →</Btn>
                  </div>
                </div>
              </div>
            )}

            {tab === "info" && (
              <div style={{ maxWidth: 720, animation: "fadeUp .35s ease" }}>
                <PersonalInfo user={user} toast={toast} />
              </div>
            )}

            {tab === "history" && (
              <div style={{ animation: "fadeUp .35s ease" }}>
                <PassHistory history={MOCK_HISTORY} currentPass={pass} />
              </div>
            )}

            {tab === "payments" && (
              <div style={{ animation: "fadeUp .35s ease" }}>
                <PaymentHistory payments={MOCK_PAYMENTS} />
              </div>
            )}

            {tab === "prefs" && (
              <div style={{ maxWidth: 600, animation: "fadeUp .35s ease" }}>
                <Preferences toast={toast} />
              </div>
            )}

            {tab === "account" && (
              <div style={{ maxWidth: 640, animation: "fadeUp .35s ease" }}>
                <AccountActions toast={toast} onLogout={onLogout} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer strip */}
      <div style={{
        padding: "16px 44px",
        borderTop: "3px double var(--ink)",
        background: "var(--parchment)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted)" }}>
          BUSPASSPRO v1.0 · STUDENT PORTAL · SESSION 2024–25
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)" }}>
          {user.email}
        </div>
      </div>

      {/* Toast renderer */}
      <toast.Toaster />
    </>
  );
}
