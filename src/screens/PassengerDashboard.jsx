/**
 * ══════════════════════════════════════════════════════════════════════
 *  PASSENGER DASHBOARD SCREEN
 *  Main landing page for passengers after login
 *  Shows pass status, recent activity, quick actions
 * ══════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from "react";
import { PaymentButton, PaymentStatusModal } from "../components/PaymentUI";

// ══════════════════════════════════════════════════════════════════════
//  MOCK DATA — CONSISTENT WITH StudentProfile.jsx
// ══════════════════════════════════════════════════════════════════════
const MOCK_USER = {
  id: "PID-2024-001",
  name: "Aryan Sharma",
  email: "aryan.sharma@example.com",
  phone: "+91 98765 43210",
  department: "General Passenger",
  year: "Adult",
  college: "Metropolis",
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
  --warn-bg:#FEF7E6; --info-bg:#EDE4CC;
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

export default function PassengerDashboard({ onNavigate }) {
  const [paymentStatus, setPaymentStatus] = useState(null); // 'SUCCESS', 'FAILED', null

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
        
        {/* Superior Header */}
        <div style={{ marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ position: "relative", paddingLeft: 24 }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: "var(--amber)", borderRadius: 3 }} />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 4, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
              PASSENGER PORTAL — METROPOLIS TRANSIT
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 72, letterSpacing: 1, color: "var(--ink)", lineHeight: 0.9 }}>
              HELLO, <span style={{ color: "var(--amber)" }}>{MOCK_USER.name.toUpperCase().split(" ")[0]}</span>.
            </div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontStyle: "italic", color: "var(--muted)", marginTop: 12 }}>
              Everything's running on schedule. Have a safe trip today.
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: "var(--muted)", marginBottom: 4 }}>CURRENT STATUS</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", animation: "pulseDot 2s infinite" }} />
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--ink)" }}>NETWORK CLEAR</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 32, alignItems: "start" }}>
          
          {/* LEFT: Pass & Activity */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            
            {/* The "Master Pass" Card */}
            <div style={{ 
              background: "var(--ink)", 
              borderRadius: 20, 
              padding: 32, 
              overflow: "hidden", 
              position: "relative",
              boxShadow: "0 24px 64px rgba(26,18,8,.22)",
              border: "1px solid rgba(255,255,255,.05)"
            }}>
              {/* Internal layout */}
              <div style={{ position: "relative", zIndex: 2 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 40 }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 4, color: "var(--muted-on-ink)", marginBottom: 8 }}>TRANSIT CREDENTIAL</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 40, color: "var(--cream-on-ink)", letterSpacing: 2 }}>{currentPass.id}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Pill s={currentPass.status} />
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2, color: "var(--muted-on-ink)", marginTop: 8 }}>V.{new Date().getFullYear()}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginBottom: 40 }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2, color: "var(--muted-on-ink)", marginBottom: 8 }}>DOMINANT LINE</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: MOCK_PASS.route_color, boxShadow: `0 0 12px ${MOCK_PASS.route_color}` }} />
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--cream-on-ink)" }}>{MOCK_PASS.route_code} · {MOCK_PASS.route.toUpperCase()}</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2, color: "var(--muted-on-ink)", marginBottom: 8 }}>CLASS</div>
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--amber-on-ink)", fontStyle: "italic" }}>{currentPass.type}</div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    {currentPass.status === "ACTIVE" && (
                      <>
                        <Btn variant="primary" size="md" onClick={() => onNavigate("tickets")}>QR TICKET ✚</Btn>
                        <Btn variant="ghost" size="md" onClick={() => onNavigate("renew")}>RENEW <span style={{ transition: "transform .25s", display: "inline-block" }}>→</span></Btn>
                      </>
                    )}
                    {currentPass.status === "APPROVED" && (
                      <PaymentButton 
                        amount={MOCK_PASS.fare_total} 
                        purpose="PASS_PURCHASE"
                        metadata={{ application_id: MOCK_PASS.pass_number }}
                        btnText="PAY INCURRED FARE"
                        onSuccess={() => setPaymentStatus('SUCCESS')}
                        onFailure={() => setPaymentStatus('FAILED')}
                      />
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2, color: "var(--muted-on-ink)", marginBottom: 4 }}>EXPIRES</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--cream-on-ink)" }}>{MOCK_PASS.valid_until.toUpperCase()}</div>
                  </div>
                </div>
              </div>

              {/* Graphical flair: Large faded route letter */}
              <div style={{ 
                position: "absolute", 
                right: -20, 
                bottom: -40, 
                fontFamily: "var(--font-display)", 
                fontSize: 240, 
                color: MOCK_PASS.route_color, 
                opacity: 0.12, 
                zIndex: 1,
                userSelect: "none"
              }}>{MOCK_PASS.route_code.charAt(0)}</div>
            </div>

            {/* History Ledger */}
            <div style={{ background: "var(--surface)", border: "1.5px solid var(--rule)", padding: 24, borderRadius: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
                <Tag>Activity Ledger</Tag>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 13, color: "var(--muted)", fontStyle: "italic" }}>Latest 7 days</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {recentActivity.map((activity, i) => (
                  <div key={i} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "16px 0",
                    borderBottom: i < recentActivity.length - 1 ? "1.5px solid var(--rule)" : "none",
                  }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <div style={{ width: 4, height: 28, background: activity.route_color, borderRadius: 2 }} />
                      <div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--ink)" }}>{activity.action.toUpperCase()}</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", marginTop: 4 }}>{activity.date} · {activity.time}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1, color: "var(--green)", fontWeight: 700 }}>VALIDATED ✓</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted)", marginTop: 4 }}>{activity.route_code} EXPRESS</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: "center", marginTop: 24 }}>
                <Btn variant="ghost" size="sm" full onClick={() => window.location.hash = "#profile"}>VIEW ENTIRE TRIP HISTORY →</Btn>
              </div>
            </div>

          </div>

          {/* RIGHT: Quick Actions & Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            
            {/* Status Monitor (formerly Stats) */}
            <div style={{ background: "var(--surface)", border: "1.5px solid var(--rule)", borderRadius: 12, padding: 32 }}>
              <Tag>Usage Monitor</Tag>
              <div style={{ display: "flex", flexDirection: "column", gap: 32, marginTop: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)", marginBottom: 8 }}>DAYS REMAINING</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 48, color: "var(--amber-text)", lineHeight: 1 }}>
                      <AnimatedCount target={MOCK_PASS.days_left} />
                    </div>
                  </div>
                  <div style={{ width: 1, height: 40, background: "var(--rule)" }} />
                  <div style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted)", marginBottom: 8 }}>MONTHLY TRIPS</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 48, color: "var(--ink)", lineHeight: 1 }}>
                    <AnimatedCount target={stats.thisMonth} />
                    </div>
                  </div>
                </div>
                
                {/* Visual Progress Bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2, color: "var(--muted)" }}>QUARTERLY PROGRESS</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1, color: "var(--ink)" }}>{Math.round((MOCK_PASS.days_left / MOCK_PASS.total_days)*100)}%</div>
                  </div>
                  <div style={{ height: 6, background: "var(--parchment)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ 
                      height: "100%", 
                      width: `${(MOCK_PASS.days_left / MOCK_PASS.total_days) * 100}%`, 
                      background: "var(--amber)", 
                      borderRadius: 3, 
                      transition: "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Navigation Board */}
            <div style={{ background: "var(--ink)", borderRadius: 12, padding: 32, color: "var(--cream-on-ink)" }}>
              <Tag color="var(--muted-on-ink)">Command Board</Tag>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }}>
                {[
                  { label: "GET PASS", icon: "✚", p: "apply", sub: "Apply for new line" },
                  { label: "RENEW",   icon: "↻", p: "renew", sub: "Extend current pass" },
                  { label: "LIVE MAP", icon: "◆", p: "busmap", sub: "Track active buses" },
                  { label: "TICKETS", icon: "⋯", p: "tickets", sub: "Single ride booking" },
                ].map((act, i) => (
                  <div 
                    key={i} 
                    onClick={() => onNavigate(act.p)}
                    style={{ 
                      background: "rgba(255,255,255,.04)", 
                      border: "1px solid rgba(255,255,255,.08)", 
                      padding: 20, 
                      borderRadius: 8, 
                      cursor: "pointer", 
                      transition: "all .2s ease" 
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background="rgba(200,131,42,.15)"; e.currentTarget.style.borderColor="var(--amber)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.04)"; e.currentTarget.style.borderColor="rgba(255,255,255,.08)"; }}
                  >
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--amber-on-ink)", marginBottom: 4 }}>{act.label}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1, color: "var(--muted-on-ink)" }}>{act.sub.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
      <PaymentStatusModal 
        status={paymentStatus}
        onClose={() => { setPaymentStatus(null); if(paymentStatus === 'SUCCESS') setCurrentPass(p => ({...p, status: 'ACTIVE'})); }}
      />
    </div>
  );
}

