/**
 * ══════════════════════════════════════════════════════════════════════
 *  STUDENT DASHBOARD SCREEN
 *  Main landing page for students after login
 *  Shows pass status, recent activity, quick actions
 * ══════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from "react";

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
  route: "Red Line",
  route_code: "R1",
  route_color: "#B02020",
  source: "Central Station",
  destination: "City Mall",
  boarding_stop: "Library Sq",
  type: "QUARTERLY",
  valid_from: "01 JAN 2024",
  valid_until: "01 APR 2024",
  days_left: 29,
  total_days: 37,  // Quarterly is ~37 days
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

const AnimatedCount = ({ target, suffix = "" }) => {
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
};

const ProgressRing = ({ current, total, label, size = 120, color = "var(--amber)" }) => {
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const percent = (current / total) * 100;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(200,131,42,.15)" strokeWidth="2" />
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          fill="none" 
          stroke={color} 
          strokeWidth="2.5" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .8s ease" }}
        />
      </svg>
      <div style={{ textAlign: "center", position: "absolute", marginTop: size / 2 - 20 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--amber-on-ink)", letterSpacing: 1 }}>
          <AnimatedCount target={current} />
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted-on-ink)", marginTop: 4 }}>
          {label}
        </div>
      </div>
    </div>
  );
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

  const applyArrowHover = (child) => {
    if (!child) return child;
    if (typeof child === "string") return child;
    if (child.type === "span" && child.props.style?.transition?.includes("transform")) {
      return React.cloneElement(child, {
        style: {
          ...child.props.style,
          transform: h && !disabled ? "translateX(4px)" : "translateX(0)"
        }
      });
    }
    if (Array.isArray(child)) {
      return child.map(c => applyArrowHover(c));
    }
    return child;
  };

  const processedChildren = React.Children.map(children, applyArrowHover);

  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ padding: pad, background: s.bg, color: s.color, border: s.border || "none", fontFamily: "var(--font-display)", fontSize: fs, letterSpacing: 2, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1, width: full ? "100%" : "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .18s" }}
    >{processedChildren}</button>
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
    { date: "14 Mar 2024", time: "08:15 AM", action: "Board Red Line", route_code: "R1", route_color: "#B02020", status: "success" },
    { date: "14 Mar 2024", time: "04:30 PM", action: "Board Blue Line", route_code: "R2", route_color: "#1A4A8A", status: "success" },
    { date: "13 Mar 2024", time: "08:10 AM", action: "Board Red Line", route_code: "R1", route_color: "#B02020", status: "success" },
    { date: "12 Mar 2024", time: "08:20 AM", action: "Board Red Line", route_code: "R1", route_color: "#B02020", status: "success" },
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
        {/* Header with route line decoration */}
        <div style={{ marginBottom: 40, position: "relative", paddingLeft: 20 }}>
          {/* Vertical route line on left */}
          <div style={{ position: "absolute", left: 0, top: 0, bottom: -80, width: 4, background: MOCK_PASS.route_color, opacity: 0.3 }} />
          
          <div style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: 4, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>
            GOOD MORNING,
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 64, letterSpacing: 1, color: "var(--ink)", marginBottom: 12, lineHeight: 1 }}>
            {MOCK_USER.name.toUpperCase()}.
          </div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontStyle: "italic", color: "var(--muted)" }}>
            Your pass is active · {MOCK_PASS.days_left} days remaining
          </div>
        </div>

        {/* Active Pass Card */}
        <div style={{ background: "var(--ink)", border: "2px solid var(--amber)", borderLeft: `6px solid ${MOCK_PASS.route_color}`, padding: 32, marginBottom: 40, animation: "fadeUp .4s ease .1s both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <Tag>Active Pass</Tag>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ background: MOCK_PASS.route_color, color: "white", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: 2, padding: "4px 10px", borderRadius: 3 }}>
                  {MOCK_PASS.route_code}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 1, color: "var(--amber-on-ink)" }}>
                  {currentPass.id}
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted-on-ink)", marginBottom: 4 }}>PASS TYPE</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--cream-on-ink)" }}>{currentPass.type}</div>
                </div>
                <Pill s={currentPass.status} />
              </div>
            </div>
            <div style={{ textAlign: "center", position: "relative" }}>
              <ProgressRing current={MOCK_PASS.days_left} total={MOCK_PASS.total_days} label="DAYS LEFT" size={140} color="var(--amber)" />
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
            <Btn variant="success" size="md">RENEW PASS <span style={{ display: "inline-block", transition: "transform .25s" }}>→</span></Btn>
            <Btn variant="secondary" size="md">VIEW DETAILS →</Btn>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 40 }}>
          {[
            { label: "Total Trips", value: stats.totalTrips, borderColor: "var(--amber)" },
            { label: "This Month", value: stats.thisMonth, borderColor: "var(--ink)" },
            { label: "Account Balance", value: stats.balance, borderColor: "var(--green)" },
          ].map((s, i) => (
            <div key={i} style={{ background: "var(--surface)", border: "1.5px solid var(--rule)", borderTop: `3px solid ${s.borderColor}`, padding: 24, animation: `fadeUp .4s ease ${0.15 + i * 0.05}s both` }}>
              <Tag>{s.label}</Tag>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 40, letterSpacing: 1, color: "var(--ink)", marginTop: 12 }}>
                <AnimatedCount target={s.value} />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: 40 }}>
          <Tag>Quick Actions</Tag>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {[
              { label: "GET PASS", icon: "✚", action: "#apply" },
              { label: "RENEW", icon: "↻", action: "#renew" },
              { label: "LIVE MAP", icon: "◆", action: "#busmap" },
              { label: "BOOK TICKET", icon: "⋯", action: "#tickets" },
            ].map((action, i) => {
              const [hover, setHover] = useState(false);
              return (
                <div 
                  key={i}
                  onClick={() => window.location.hash = action.action}
                  onMouseEnter={() => setHover(true)}
                  onMouseLeave={() => setHover(false)}
                  style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    gap: 12,
                    cursor: "pointer",
                    opacity: hover ? 1 : 0.8,
                    transition: "opacity .18s"
                  }}>
                  <div style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 4, 
                    background: hover ? "var(--amber)" : "var(--ink)", 
                    color: hover ? "var(--ink)" : "var(--amber-on-ink)",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    fontFamily: "var(--font-display)",
                    fontSize: 24,
                    transition: "background .18s, color .18s",
                    boxShadow: "0 2px 8px rgba(26,18,8,.12)"
                  }}>
                    {action.icon}
                  </div>
                  <div style={{ 
                    fontFamily: "var(--font-display)", 
                    fontSize: 11, 
                    letterSpacing: 2,
                    color: "var(--ink)",
                    textAlign: "center",
                    fontWeight: 500
                  }}>
                    {action.label}
                  </div>
                </div>
              );
            })}
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
              padding: "14px 0 14px 16px",
              borderLeft: `3px solid ${activity.route_color}`,
              borderBottom: i < recentActivity.length - 1 ? "1px solid var(--rule)" : "none",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ background: activity.route_color, color: "white", fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: "2px 8px", borderRadius: 2 }}>
                    {activity.route_code}
                  </div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>
                    {activity.action}
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", display: "flex", gap: 16 }}>
                  <span>{activity.date}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>{activity.time}</span>
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: activity.status === "success" ? "var(--green)" : "var(--red)", fontWeight: 700, background: activity.status === "success" ? "rgba(82,183,136,.1)" : "rgba(176,32,32,.1)", padding: "4px 10px", borderRadius: 3 }}>
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
