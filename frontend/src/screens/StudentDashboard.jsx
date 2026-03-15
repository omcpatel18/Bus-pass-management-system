/**
 * ══════════════════════════════════════════════════════════════════════
 *  STUDENT DASHBOARD SCREEN
 *  Main landing page for students after login
 *  Shows pass status, recent activity, quick actions
 * ══════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from "react";

// ══════════════════════════════════════════════════════════════════════
//  MOCK DATA — CONSISTENT WITH StudentProfile.jsx
// ══════════════════════════════════════════════════════════════════════
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

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;700&family=Instrument+Sans:wght@400;500;600&display=swap');

:root {
  --cream:#F6F0E4; --surface:#FDFAF3; --parchment:#EDE4CC;
  --ink:#1A1208; --ink-mid:#3D2410;
  --amber:#C8832A; --amber-text:#8B520A; --amber-on-ink:#F0A830;
  --amber-light:#F5D49A;
  --muted:#6B5535; --rule:#D4C4A0;
  --green:#1E6641; --green-on-ink:#52B788;
  --red:#B02020; --cream-on-ink:#F6F0E4; --muted-on-ink:#B09878;
  --success-bg:#EBF7F0; --error-bg:#FDEAEA;
  --warn-bg:#FEF7E6; --info-bg:#EDF4FD;
  --font-display:'Bebas Neue',sans-serif;
  --font-serif:'DM Serif Display',serif;
  --font-mono:'JetBrains Mono',monospace;
  --font-sans:'Instrument Sans',sans-serif;
}

@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
@keyframes stampDrop { 0%{transform:scale(2.2)rotate(-8deg);opacity:0} 65%{transform:scale(.92)rotate(3deg);opacity:1} 100%{transform:scale(1)rotate(-3deg);opacity:1} }
`;

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
  const fs = { sm: 11, md: 13, lg: 15 }[size] || 13;
  const s = {
    primary: { bg: h && !disabled ? "#2C1E0A" : "var(--ink)", color: "var(--amber-on-ink)", border: "none" },
    secondary: { bg: h && !disabled ? "var(--parchment)" : "transparent", color: "var(--ink)", border: "1.5px solid var(--ink)" },
    danger: { bg: h && !disabled ? "#8A1818" : "var(--red)", color: "var(--cream-on-ink)", border: "none" },
    success: { bg: h && !disabled ? "#155230" : "var(--green)", color: "var(--cream-on-ink)", border: "none" },
    ghost: { bg: h && !disabled ? "var(--parchment)" : "transparent", color: "var(--amber-text)", border: "1.5px solid var(--rule)" },
  }[variant] || {};
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ padding: pad, background: s.bg, color: s.color, border: s.border || "none", fontFamily: "var(--font-display)", fontSize: fs, letterSpacing: 2, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1, width: full ? "100%" : "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .18s" }}
    >{children}</button>
  );
};

export default function StudentDashboard() {
  const [currentPass, setCurrentPass] = useState({
    id: MOCK_PASS.pass_number,
    type: MOCK_PASS.type.charAt(0).toUpperCase() + MOCK_PASS.type.slice(1).toLowerCase(),
    status: MOCK_PASS.status,
    routeFrom: MOCK_PASS.route,
    routeTo: MOCK_PASS.destination,
    validFrom: MOCK_PASS.valid_from,
    validUntil: MOCK_PASS.valid_until,
    daysLeft: MOCK_PASS.days_left,
  });

  const [recentActivity] = useState([
    { date: "14 Mar 2024", time: "08:15 AM", action: "Board Route Alpha", status: "success" },
    { date: "14 Mar 2024", time: "04:30 PM", action: "Board Route Beta", status: "success" },
    { date: "13 Mar 2024", time: "08:10 AM", action: "Board Route Alpha", status: "success" },
    { date: "12 Mar 2024", time: "08:20 AM", action: "Board Route Alpha", status: "success" },
  ]);

  const [stats] = useState({
    totalTrips: 42,
    thisMonth: 18,
    balance: "₹0",
  });

  return (
    <div style={{ minHeight: "calc(100vh - 62px)", background: "var(--cream)", padding: "40px 44px" }}>
      <style>{CSS}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", animation: "fadeUp .4s ease" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <Tag>Welcome Back</Tag>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 36, color: "var(--ink)", marginBottom: 12, lineHeight: 1.1 }}>
            Hey, {MOCK_USER.name}
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--muted)" }}>
            Your bus pass is active and ready to go.
          </div>
        </div>

        {/* Active Pass Card */}
        <div style={{ background: "var(--ink)", border: "2px solid var(--amber)", padding: 32, marginBottom: 40, animation: "fadeUp .4s ease .1s both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <Tag>Active Pass</Tag>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 1, color: "var(--amber-on-ink)", marginBottom: 8 }}>
                {currentPass.id}
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted-on-ink)", marginBottom: 4 }}>PASS TYPE</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--cream-on-ink)" }}>{currentPass.type}</div>
                </div>
                <Pill s={currentPass.status} />
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted-on-ink)", marginBottom: 4 }}>DAYS REMAINING</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 48, letterSpacing: 1, color: "var(--green-on-ink)" }}>
                {currentPass.daysLeft}
              </div>
            </div>
          </div>

          <Rule my={16} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted-on-ink)", marginBottom: 8 }}>ROUTE</div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--cream-on-ink)" }}>
                {MOCK_PASS.source} → {MOCK_PASS.destination}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted-on-ink)", marginBottom: 8 }}>VALIDITY PERIOD</div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--cream-on-ink)" }}>
                {MOCK_PASS.valid_from} to {MOCK_PASS.valid_until}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Btn variant="success" size="md">RENEW PASS →</Btn>
            <Btn variant="secondary" size="md">VIEW DETAILS →</Btn>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 40 }}>
          {[
            { label: "Total Trips", value: stats.totalTrips, icon: "📍" },
            { label: "This Month", value: stats.thisMonth, icon: "📅" },
            { label: "Account Balance", value: stats.balance, icon: "₹" },
          ].map((s, i) => (
            <div key={i} style={{ background: "var(--surface)", border: "1.5px solid var(--rule)", padding: 24, animation: `fadeUp .4s ease ${0.15 + i * 0.05}s both` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <Tag>{s.label}</Tag>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--amber)" }}>{s.icon}</div>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 1, color: "var(--ink)" }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: 40 }}>
          <Tag>Quick Actions</Tag>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 20 }}>
            <Btn variant="primary" full size="md" onClick={() => window.location.hash = "#apply"}>
              ✓ APPLY FOR NEW PASS
            </Btn>
            <Btn variant="secondary" full size="md" onClick={() => window.location.hash = "#busmap"}>
              ◆ VIEW ROUTE MAP
            </Btn>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ background: "var(--surface)", border: "1.5px solid var(--rule)", padding: 24 }}>
          <Tag>Activity This Week</Tag>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)", marginBottom: 20 }}>
            Recent Trips
          </div>

          {recentActivity.map((activity, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: i < recentActivity.length - 1 ? "1px solid var(--rule)" : "none",
            }}>
              <div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>
                  {activity.action}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", marginTop: 4 }}>
                  {activity.date} at {activity.time}
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: activity.status === "success" ? "var(--green)" : "var(--red)", fontWeight: 600 }}>
                ✓ {activity.status.toUpperCase()}
              </div>
            </div>
          ))}

          <Rule my={16} />

          <div style={{ textAlign: "center" }}>
            <Btn variant="ghost" size="md" onClick={() => window.location.hash = "#profile"}>
              VIEW FULL TRIP HISTORY →
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
