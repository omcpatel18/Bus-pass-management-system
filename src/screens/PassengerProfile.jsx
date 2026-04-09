/**
 * ═══════════════════════════════════════════════════════════════════
 *  BUSPASSPRO — PASSENGER PROFILE PAGE
 *  Modernized City Transit Aesthetic
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Navigation, Mail, Phone, Shield, Bell, LogOut, Download, Clock, CreditCard, History } from "lucide-react";

// ─── Google Fonts ──────────────────────────────────────────────────
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;700&family=Instrument+Sans:wght@400;500;600&display=swap');
`;

const CSS_VARS = `
:root {
  --cream:        #F6F0E4;
  --surface:      #FDFAF3;
  --parchment:    #EDE4CC;
  --ink:          #1A1208;
  --ink-mid:      #3D2410;
  --amber:        #C8832A;
  --amber-text:   #8B520A;
  --amber-on-ink: #F0A830;
  --cream-on-ink: #F6F0E4;
  --muted:        #6B5535;
  --muted-on-ink: #B09878;
  --green:        #1E6641;
  --red:          #B02020;
  --rule:         #D4C4A0;
  --font-display: 'Bebas Neue', sans-serif;
  --font-serif:   'DM Serif Display', serif;
  --font-mono:    'JetBrains Mono', monospace;
  --font-sans:    'Instrument Sans', sans-serif;
}

@keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn   { from{opacity:0} to{opacity:1} }
@keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.65)} }
@keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position: 200% 0} }
`;

// ─── Atomic Components ─────────────────────────────────────────────

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

const Pill = ({ s }) => {
  const STATUS = (s || "").toUpperCase();
  const map = {
    ACTIVE:   { bg: "var(--green)", color: "var(--cream-on-ink)" },
    APPROVED: { bg: "var(--green)", color: "var(--cream-on-ink)" },
    VALID:    { bg: "var(--green)", color: "var(--cream-on-ink)" },
    PENDING:  { bg: "var(--amber)", color: "var(--ink)" },
    EXPIRED:  { bg: "var(--muted)", color: "var(--cream-on-ink)" },
    PAID:     { bg: "var(--green)", color: "var(--cream-on-ink)" },
    FAILED:   { bg: "var(--red)",   color: "var(--cream-on-ink)" },
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

const Btn = ({ children, onClick, variant = "primary", full = false, size = "md", disabled = false, style = {} }) => {
  const [hov, setHov] = useState(false);
  const pad = { sm: "6px 16px", md: "11px 22px", lg: "14px 28px" }[size];
  const fs  = { sm: 11, md: 13, lg: 15 }[size];
  const styles = {
    primary:   { bg: hov && !disabled ? "var(--ink-mid)" : "var(--ink)",    color: "var(--amber-on-ink)", border: "none" },
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
        transition: "all .18s ease",
        ...style
      }}>{children}</button>
  );
};

const InpField = ({ label, value, onChange, type = "text", readOnly = false, multiline = false, rows = 3 }) => {
  const [foc, setFoc] = useState(false);
  const commonStyle = {
    width: "100%", padding: "12px 14px",
    border: `1.5px solid ${foc ? "var(--amber)" : "var(--rule)"}`,
    background: readOnly ? "rgba(0,0,0,.03)" : foc ? "var(--surface)" : "var(--cream)",
    fontFamily: "var(--font-sans)", fontSize: 14,
    color: "var(--ink)", outline: "none", transition: "all .2s",
    cursor: readOnly ? "not-allowed" : "text",
    resize: "none"
  };
  return (
    <div style={{ marginBottom: 20 }}>
      <Tag>{label}</Tag>
      {multiline ? (
        <textarea
          value={value} onChange={onChange} readOnly={readOnly} rows={rows}
          onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
          style={commonStyle}
        />
      ) : (
        <input
          type={type} value={value} onChange={onChange} readOnly={readOnly}
          onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
          style={commonStyle}
        />
      )}
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

// ─── Logic Components ──────────────────────────────────────────────

function useLocalToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return {
    toasts,
    success: m => add(m, "success"),
    info:    m => add(m, "info"),
    Toaster: () => (
      <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 8, zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: "var(--ink)", color: "var(--amber-on-ink)",
            padding: "12px 20px", borderRadius: 4, minWidth: 240,
            animation: "fadeUp .3s ease", display: "flex", gap: 12, alignItems: "center"
          }}>
            <Bell size={16} />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 13 }}>{t.msg}</span>
          </div>
        ))}
      </div>
    ),
  };
}

function QRCanvas({ seed = 42, size = 110 }) {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"), m = 17, cell = size / m;
    ctx.fillStyle = "#1A1208"; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#F6F0E4"; ctx.fillRect(2, 2, size - 4, size - 4);
    for (let r = 0; r < m; r++) {
      for (let col = 0; col < m; col++) {
        const corner = (r < 4 && col < 4) || (r < 4 && col > m - 5) || (r > m - 5 && col < 4);
        const filled = corner ? 1 : (((seed * 2654435761 + r * 1234567 + col * 7654321) >>> 0) % 3 === 0 ? 1 : 0);
        if (filled) { ctx.fillStyle = "#1A1208"; ctx.fillRect(col * cell + 2, r * cell + 2, cell - 1, cell - 1); }
      }
    }
  }, [seed, size]);
  return <canvas ref={ref} width={size} height={size} style={{ display: "block", borderRadius: 4 }} />;
}

function CountdownRing({ daysLeft, totalDays }) {
  const r = 36, circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, daysLeft / totalDays));
  const offset = circ * (1 - pct);
  const color = daysLeft > 14 ? "var(--green)" : "var(--amber)";
  return (
    <div style={{ position: "relative", width: 88, height: 88 }}>
      <svg width={88} height={88} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={44} cy={44} r={r} fill="none" stroke="rgba(0,0,0,.05)" strokeWidth={6} />
        <circle cx={44} cy={44} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--ink)", lineHeight: 1 }}>{daysLeft}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 6, letterSpacing: 2, color: "var(--muted)" }}>DAYS</div>
      </div>
    </div>
  );
}

// ─── Sections ──────────────────────────────────────────────────────

function IdentityHeader({ user, pass }) {
  return (
    <div style={{
      background: "var(--ink)", padding: "48px 44px",
      display: "flex", alignItems: "center", gap: 32,
      animation: "fadeUp .4s ease both", position: "relative", overflow: "hidden"
    }}>
      <div style={{ position: "absolute", right: -20, top: -20, fontFamily: "var(--font-display)", fontSize: 180, color: "rgba(255,255,255,.03)", userSelect: "none" }}>{user.avatar_initials}</div>
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ width: 96, height: 96, borderRadius: "50%", background: "var(--surface)", border: "2px solid var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(0,0,0,.4)" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "var(--ink)" }}>{user.avatar_initials}</span>
        </div>
        <div style={{ position: "absolute", bottom: 6, right: 6, width: 16, height: 16, borderRadius: "50%", background: "#52B788", border: "3px solid var(--ink)", animation: "pulseDot 2s infinite" }} />
      </div>
      <div style={{ flex: 1, zIndex: 2 }}>
        <Tag color="var(--muted-on-ink)">OFFICIAL TRAVELER CREDENTIAL — METROPOLIS TRANSIT</Tag>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 56, color: "var(--cream-on-ink)", lineHeight: 0.9, marginBottom: 16 }}>{user.name.toUpperCase()}</div>
        <div style={{ display: "flex", gap: 32 }}>
          {[ [user.id, "PASSENGER ID"], [user.department, "CATEGORY"], [user.year, "FARE TYPE"] ].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, color: "var(--muted-on-ink)" }}>{l}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--amber-on-ink)", fontWeight: 700 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", padding: "20px 24px", textAlign: "right", borderRadius: 12, zIndex: 2 }}>
        <Tag color="var(--muted-on-ink)">PASS STATUS</Tag>
        <div style={{ marginBottom: 8 }}><Pill s={pass.status} /></div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--cream-on-ink)" }}>{pass.days_left} DAYS LEFT</div>
      </div>
    </div>
  );
}

function ActivePassCard({ pass, user }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div style={{ perspective: 1000 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <Tag>Master Identification Card</Tag>
        <Btn variant="ghost" size="sm" onClick={() => setFlipped(!flipped)}>{flipped ? "VIEW FRONT" : "VIEW TERMS ↑"}</Btn>
      </div>
      <div style={{ position: "relative", height: 240, transition: "transform 0.6s", transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
        <div style={{ position: "absolute", inset: 0, background: "var(--ink)", borderRadius: 16, backfaceVisibility: "hidden", display: "flex", overflow: "hidden", border: "1px solid rgba(255,255,255,.05)" }}>
          <div style={{ width: 140, borderRight: "2px dashed rgba(255,255,255,.1)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(255,255,255,.02)" }}>
            <QRCanvas seed={pass.qr_seed} size={100} />
            <div style={{ marginTop: 12, fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted-on-ink)" }}>{pass.pass_number}</div>
          </div>
          <div style={{ flex: 1, padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "var(--amber-on-ink)", lineHeight: 1 }}>{pass.route.toUpperCase()}</div>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--green)" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[ ["ISSUED TO", user.name], ["ID NUMBER", user.id], ["VALID UNTIL", pass.valid_until], ["TIER", pass.type] ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 6, color: "var(--muted-on-ink)" }}>{l}</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--cream-on-ink)", fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "var(--surface)", borderRadius: 16, backfaceVisibility: "hidden", transform: "rotateY(180deg)", padding: 32, border: "1px solid var(--rule)" }}>
          <Tag>Security & Terms</Tag>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 14, color: "var(--ink)", fontStyle: "italic", marginTop: 16 }}>
            This card is an official instrument of Metropolis Transit. It is non-transferable and must be presented upon request. Misuse is subject to local ordinance fines.
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsStrip({ pass, payments }) {
  const totalPaid = payments.filter(p => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const stats = [
    { n: pass.days_left, l: "DAYS REMAINING", c: pass.days_left > 14 ? "var(--green)" : "var(--red)" },
    { n: payments.length, l: "PASS CYCLES", c: "var(--ink)" },
    { n: `₹${totalPaid}`, l: "TOTAL INVESTMENT", c: "var(--ink)" },
    { n: "TOP TIER", l: "LOYALTY RANK", c: "var(--amber-text)" }
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: "var(--parchment)", borderBottom: "1px solid var(--rule)" }}>
      {stats.map((s, i) => (
        <div key={i} style={{ padding: "24px 32px", borderRight: i < 3 ? "1px solid var(--rule)" : "none", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 40, color: s.c, lineHeight: 1 }}>{s.n}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)", marginTop: 8 }}>{s.l}</div>
        </div>
      ))}
    </div>
  );
}

function PersonalInfo({ user, toast }) {
  const [form, setForm] = useState({ 
    name: user.name, 
    phone: user.phone,
    address: user.address || "",
    dob: user.dob || "",
    emergencyContact: user.emergencyContact || "",
    aadhar: user.aadhar || "",
    bloodGroup: user.bloodGroup || ""
  });
  const [dirty, setDirty] = useState(false);

  const updateField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setDirty(true);
  };

  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div><Tag>Id Card Registry</Tag><div style={{ fontFamily: "var(--font-serif)", fontSize: 32 }}>Primary Details</div></div>
        {dirty && <Btn size="sm" onClick={() => { setDirty(false); toast.success("Registry Updated Successfully"); }}>SAVE CHANGES ✓</Btn>}
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
        <InpField label="FULL NAME" value={form.name} onChange={e => updateField("name", e.target.value)} />
        <InpField label="CONTACT EMAIL" value={user.email} readOnly />
        <InpField label="PHONE NUMBER" value={form.phone} onChange={e => updateField("phone", e.target.value)} />
        <InpField label="REGISTRY ID" value={user.id} readOnly />
        <InpField label="DATE OF BIRTH" value={form.dob} onChange={e => updateField("dob", e.target.value)} placeholder="DD MMM YYYY" />
        <InpField label="BLOOD GROUP" value={form.bloodGroup} onChange={e => updateField("bloodGroup", e.target.value)} placeholder="e.g. O+ Positive" />
        
        <div style={{ gridColumn: "1 / -1" }}>
          <InpField label="HOME ADDRESS (MANDATORY)" value={form.address} onChange={e => updateField("address", e.target.value)} multiline rows={3} placeholder="Full residential address" />
        </div>

        <InpField label="EMERGENCY CONTACT" value={form.emergencyContact} onChange={e => updateField("emergencyContact", e.target.value)} placeholder="Name & Number" />
        <InpField label="AADHAR / GOVT ID" value={form.aadhar} onChange={e => updateField("aadhar", e.target.value)} placeholder="XXXX XXXX XXXX" />
      </div>
    </div>
  );
}

function PassHistory({ history, currentPass }) {
  const all = [{ ...currentPass, id: currentPass.pass_number, amount: currentPass.fare_total, from: currentPass.valid_from, until: currentPass.valid_until }, ...history];
  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <Tag>Historical Archive</Tag><div style={{ fontFamily: "var(--font-serif)", fontSize: 32, marginBottom: 24 }}>Transit Ledger</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {all.map((p, i) => (
          <div key={i} style={{ border: "1.5px solid var(--rule)", borderRadius: 12, padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: i===0?"var(--surface)":"transparent" }}>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>{p.route?.toUpperCase()}</div>
              <div><div style={{ fontFamily: "var(--font-mono)", fontSize: 8 }}>{p.id}</div><div style={{ fontFamily: "var(--font-sans)", fontSize: 13 }}>{p.from} – {p.until}</div></div>
            </div>
            <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>₹{p.amount}</div>
              <Pill s={p.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Preferences({ toast }) {
  const [p, setP] = useState({ e: true, p: true, s: false });
  const rows = [
    { k: 'e', l: "Email on Expiry", s: "7 days alert" },
    { k: 'p', l: "Push Notifications", s: "In-app alerts" },
    { k: 's', l: "SMS Validation", s: "Security codes" }
  ];
  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <Tag>Digital Preferences</Tag><div style={{ fontFamily: "var(--font-serif)", fontSize: 32, marginBottom: 24 }}>Notifications</div>
      {rows.map(r => (
        <div key={r.k} style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid var(--rule)" }}>
          <div><div style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>{r.l}</div><div style={{ fontSize: 12, color: "var(--muted)" }}>{r.s}</div></div>
          <Toggle on={p[r.k]} onChange={() => { setP({...p, [r.k]: !p[r.k]}); toast.info("Preference Saved"); }} />
        </div>
      ))}
    </div>
  );
}

function AccountActions({ onLogout, toast, user }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleExport = () => {
    toast.info("Preparing transit archive...");
    const data = {
      profile: user,
      timestamp: new Date().toISOString(),
      export_version: "2.44"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BusPassPro_Export_${user.id}.json`;
    link.click();
    toast.success("Transit data exported successfully.");
  };

  const handleChangePassword = () => {
    toast.info("Verification email sent to " + user.email);
    toast.success("Password reset link is active for 15 mins.");
  };

  const handleDeactivate = () => {
    if (!showConfirm) {
      setShowConfirm(true);
      toast.warn("Are you sure? This cannot be undone.");
      return;
    }
    toast.error("Account Deactivated. Local session terminated.");
    setTimeout(onLogout, 2000);
  };

  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <Tag>Security & Privacy</Tag><div style={{ fontFamily: "var(--font-serif)", fontSize: 32, marginBottom: 32 }}>Account Management</div>
      <div style={{ display: "flex", gap: 16, marginBottom: 48 }}>
        <Btn variant="secondary" size="sm" onClick={handleChangePassword}>CHANGE PASSWORD</Btn>
        <Btn variant="secondary" size="sm" onClick={handleExport}>EXPORT DATA</Btn>
        <Btn variant="ghost" size="sm" onClick={onLogout}>SIGN OUT <LogOut size={14}/></Btn>
      </div>
      
      <div style={{ 
        border: "2px solid var(--red)", 
        padding: 32, 
        borderRadius: 12,
        background: showConfirm ? "rgba(176,32,32,0.03)" : "transparent",
        transition: "all .3s ease"
      }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--red)", display: "flex", alignItems: "center", gap: 10 }}>
          <Shield size={20} /> DANGER ZONE
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", margin: "12px 0 20px", lineHeight: 1.6 }}>
          Deleting your account is a permanent action. All active passes will be revoked without refund. 
          {showConfirm && <strong style={{ color: "var(--red)", display: "block", marginTop: 8 }}>THIS IS YOUR FINAL WARNING.</strong>}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Btn variant="danger" size="sm" onClick={handleDeactivate}>
            {showConfirm ? "CONFIRM DELETION" : "DEACTIVATE ACCOUNT"}
          </Btn>
          {showConfirm && <Btn variant="secondary" size="sm" onClick={() => setShowConfirm(false)}>CANCEL</Btn>}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────

const TABS = [ { id: "pass", l: "MY PASS" }, { id: "info", l: "PROFILE" }, { id: "history", l: "HISTORY" }, { id: "prefs", l: "PREFS" }, { id: "security", l: "SECURITY" } ];

const MOCK_USER = { 
  id: "PID-24-001", 
  name: "Aryan Sharma", 
  email: "aryan@transit.net", 
  phone: "+91 98765 43210", 
  address: "Flat 402, Heritage Residency, Opposite Central Park, Metropolis East, 400101",
  dob: "15 May 2002",
  emergencyContact: "+91 99988 77766 (Mother)",
  aadhar: "4455 6677 8899",
  bloodGroup: "O+ Positive",
  department: "General", 
  year: "Adult", 
  avatar_initials: "AS" 
};
const MOCK_PASS = { pass_number: "BP-00123", route: "Red Line Express", source: "Station A", destination: "Station B", type: "QUARTERLY", valid_from: "01 JAN", valid_until: "01 APR", days_left: 28, total_days: 90, fare_total: 1200, status: "ACTIVE", qr_seed: 42 };

export default function PassengerProfile({ onNavigate, user = MOCK_USER, pass = MOCK_PASS, onLogout }) {
  const [tab, setTab] = useState("pass");
  const [loading, setLoading] = useState(true);
  const toast = useLocalToast();

  useEffect(() => { setTimeout(() => setLoading(false), 800); }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <style>{FONTS + CSS_VARS}</style>
      {loading ? (
        <div style={{ padding: 44 }}><Skeleton h={120} mb={32} /><Skeleton h={400} /></div>
      ) : (
        <>
          <IdentityHeader user={user} pass={pass} />
          <StatsStrip pass={pass} payments={[]} />
          <div style={{ display: "flex", padding: "0 44px", borderBottom: "1.5px solid var(--rule)", background: "var(--cream)", position: "sticky", top: 0, zIndex: 10 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ background: "none", border: "none", padding: "20px 24px", fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2, color: tab === t.id ? "var(--ink)" : "var(--muted)", borderBottom: `2.5px solid ${tab === t.id ? "var(--amber)" : "transparent"}`, cursor: "pointer" }}>{t.l}</button>
            ))}
          </div>
          <div style={{ padding: "48px 44px", maxWidth: 1200 }}>
            {tab === "pass" && (
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 56, alignItems: "start" }}>
                <ActivePassCard pass={pass} user={user} />
                <div style={{ animation: "fadeUp .4s ease .1s both", background: "var(--surface)", padding: 32, borderRadius: 16, border: "1px solid var(--rule)" }}>
                  <Tag>Usage Analytics</Tag><div style={{ fontFamily: "var(--font-serif)", fontSize: 24, marginBottom: 24 }}>Time Allocation</div>
                  <div style={{ display: "flex", gap: 24, alignItems: "center" }}><CountdownRing daysLeft={pass.days_left} totalDays={pass.total_days} /><div><div style={{ fontFamily: "var(--font-display)", fontSize: 28 }}>{pass.days_left} DAYS ACTIVE</div><div style={{ fontSize: 13, color: "var(--muted)" }}>Expires on {pass.valid_until}</div></div></div>
                  <Btn variant="primary" full style={{ marginTop: 24 }} onClick={() => onNavigate("renew")}>RENEW PASS →</Btn>
                </div>
              </div>
            )}
            {tab === "info" && <PersonalInfo user={user} toast={toast} />}
            {tab === "history" && <PassHistory history={[]} currentPass={pass} />}
            {tab === "prefs" && <Preferences toast={toast} />}
            {tab === "security" && <AccountActions onLogout={onLogout} toast={toast} user={user} />}
          </div>
          <div style={{ padding: 44, borderTop: "3px double var(--ink)", background: "var(--parchment)", display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 8 }}>v2.44 · {user.id}</div><div style={{ fontFamily: "var(--font-mono)", fontSize: 8 }}>SESSION 2024–2025</div>
          </div>
          <toast.Toaster />
        </>
      )}
    </div>
  );
}
