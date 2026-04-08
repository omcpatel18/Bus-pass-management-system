/**
 * ══════════════════════════════════════════════════════════════════════
 *  BUSPASSPRO — PASS RENEWAL
 *  Premium Extension Flow for Passenger Passes
 * ══════════════════════════════════════════════════════════════════════
 */

import React, { useState } from "react";
import { Clock, RefreshCw, ChevronRight, CheckCircle, CreditCard, Shield, Info, ArrowRight, Bookmark } from "lucide-react";

// ── Design Tokens ─────────────────────────────────────────────────────
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
  --green-on-ink: #52B788;
  --red:          #B02020;
  --red-on-ink:   #FF6B6B;
  --rule:         #D4C4A0;
  --font-display: 'Bebas Neue', sans-serif;
  --font-serif:   'DM Serif Display', serif;
  --font-mono:    'JetBrains Mono', monospace;
  --font-sans:    'Instrument Sans', sans-serif;
}

@keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes stampIn  { 0%{transform:scale(2.2) rotate(-8deg);opacity:0} 65%{transform:scale(.92) rotate(3deg);opacity:1} 100%{transform:scale(1) rotate(-3deg);opacity:1} }
@keyframes slideIn  { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
@keyframes rotateCw { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
`;

// ── Atomic Components ─────────────────────────────────────────────────

const Tag = ({ children, color }) => (
  <div style={{
    fontFamily: "var(--font-mono)", fontSize: 8,
    letterSpacing: 4, color: color || "var(--muted)",
    textTransform: "uppercase", marginBottom: 8
  }}>{children}</div>
);

const Btn = ({ children, onClick, variant = "primary", full = false, size = "md", disabled = false, style = {} }) => {
  const [hov, setHov] = useState(false);
  const pad = { sm: "7px 16px", md: "11px 24px", lg: "14px 32px" }[size];
  const fs = { sm: 11, md: 13, lg: 16 }[size];
  const styles = {
    primary: { bg: hov && !disabled ? "var(--ink-mid)" : "var(--ink)", color: "var(--amber-on-ink)" },
    secondary: { bg: hov && !disabled ? "var(--parchment)" : "transparent", color: "var(--ink)", border: "1.5px solid var(--ink)" },
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
        opacity: disabled ? 0.45 : 1, width: full ? "100%" : "auto",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "all .18s ease", ...style
      }}>{children}</button>
  );
};

// ── Renewal Screen ────────────────────────────────────────────────────

export default function Renewal({ currentPass, onDone }) {
  const [duration, setDuration] = useState("monthly");
  const [paying, setPaying] = useState(false);
  const [complete, setComplete] = useState(false);

  const PASS = currentPass || {
    id: "BPP-2024-001234",
    route: "Red Express",
    code: "R1",
    color: "#B02020",
    name: "Aryan Sharma",
    expiry: "31 Mar 2024",
    fare: 380,
    type: "STUDENT"
  };

  const DURS = [
    { id: "weekly", label: "WEEKLY", days: 7, mult: 0.3, disc: 0, desc: "7-day Extension" },
    { id: "monthly", label: "MONTHLY", days: 30, mult: 1, disc: 0, desc: "30-day Extension" },
    { id: "quarterly", label: "QUARTERLY", days: 90, mult: 2.8, disc: 10, desc: "90-day Saver" },
    { id: "annual", label: "ANNUAL", days: 365, mult: 10, disc: 20, desc: "Full Year Membership" }
  ];

  const sel = DURS.find(d => d.id === duration);
  const total = Math.round(PASS.fare * sel.mult * (1 - sel.disc / 100));

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setComplete(true);
    }, 2000);
  };

  if (complete) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <style>{FONTS + CSS_VARS}</style>
        <div style={{ textAlign: "center", animation: "fadeUp .5s ease" }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: 32 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
              <CheckCircle size={40} color="white" />
            </div>
            <div style={{ position: "absolute", top: "50%", right: -60, transform: "translateY(-50%) rotate(-10deg)", border: "3px solid var(--green)", padding: "10px 24px", animation: "stampIn .6s cubic-bezier(.34,1.56,.64,1) both" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, letterSpacing: 4, color: "var(--green)" }}>RENEWED</div>
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 56, color: "var(--ink)", lineHeight: 1 }}>TIME ADDED</div>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--muted)", fontStyle: "italic", margin: "16px 0 40px" }}>
            Your pass validity has been extended by {sel.days} days.
          </p>
          <Btn variant="primary" size="lg" onClick={() => window.location.hash = "#dashboard"}>BACK TO DASHBOARD</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)", padding: "48px 44px" }}>
      <style>{FONTS + CSS_VARS}</style>
      
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48 }}>
          <div>
            <Tag>Pass Extension</Tag>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 64, lineHeight: 0.9 }}>
              RENEW YOUR<br /><span style={{ color: "var(--amber)" }}>TRANSIT PASS</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <Tag>Current ID</Tag>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--ink)" }}>{PASS.id}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 64, alignItems: "start" }}>
          
          {/* Options */}
          <div>
            <Tag>Select Duration</Tag>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
              {DURS.map(d => (
                <div key={d.id} onClick={() => setDuration(d.id)}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: 24, cursor: "pointer", border: `2.5px solid ${duration === d.id ? "var(--ink)" : "var(--rule)"}`,
                    background: duration === d.id ? "var(--parchment)" : "transparent",
                    transition: "all .2s ease", transform: duration === d.id ? "translateX(8px)" : "none"
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: duration === d.id ? "var(--amber)" : "var(--rule)" }} />
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--ink)" }}>{d.label}</div>
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)" }}>{d.desc}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {d.disc > 0 && <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--green)", marginBottom: 4 }}>-{d.disc}% OFF</div>}
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>₹{Math.round(PASS.fare * d.mult * (1 - d.disc / 100))}</div>
                  </div>
                </div>
              ))}
            </div>

            <Tag>Payment Ledger</Tag>
            <div style={{ borderTop: "2px solid var(--ink)", padding: "20px 0", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28 }}>TOTAL DUE</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 44, color: "var(--amber-text)" }}>₹{total}</div>
            </div>
            
            <Btn variant="primary" full size="lg" onClick={handlePay} disabled={paying}>
              {paying ? <><RefreshCw size={18} style={{ animation: "rotateCw 1s linear infinite" }} /> SECURING...</> : `PAY & EXTEND PASS →`}
            </Btn>
          </div>

          {/* Visual Pass Preview */}
          <div style={{ position: "sticky", top: 100 }}>
            <Tag>Preview Final Stub</Tag>
            <div style={{ 
              background: "var(--ink)", color: "white", padding: 0, borderRadius: 0,
              boxShadow: "0 32px 64px rgba(26,18,8,.25)", position: "relative", overflow: "hidden"
            }}>
              {/* Header */}
              <div style={{ padding: "24px 28px", borderBottom: "2px dashed rgba(255,255,255,.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, background: PASS.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 18 }}>{PASS.code}</div>
                  <Tag color="var(--muted-on-ink)">{PASS.type} ACCOUNT</Tag>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 1 }}>{PASS.route.toUpperCase()}</div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 14, fontStyle: "italic", opacity: 0.6 }}>{PASS.name}</div>
              </div>

              {/* Body */}
              <div style={{ padding: "24px 28px", background: "rgba(255,255,255,.03)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <Tag color="var(--muted-on-ink)">NEW EXPIRY</Tag>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{sel.id === "annual" ? "31 MAR 2025" : "30 APR 2024"}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Tag color="var(--muted-on-ink)">CLASS</Tag>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--amber-on-ink)" }}>PREMIUM</div>
                  </div>
                </div>
                <div style={{ marginTop: 24, opacity: 0.2, display: "flex", gap: 1 }}>
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} style={{ width: 4, height: (i % 3 + 2) * 4, background: "white" }} />
                  ))}
                </div>
              </div>

              {/* Decorative side cuts */}
              <div style={{ position: "absolute", left: -12, top: "45%", width: 24, height: 24, borderRadius: "50%", background: "var(--surface)" }} />
              <div style={{ position: "absolute", right: -12, top: "45%", width: 24, height: 24, borderRadius: "50%", background: "var(--surface)" }} />
            </div>

            <div style={{ marginTop: 24, padding: 16, border: "1.5px solid var(--rule)", background: "var(--parchment)", display: "flex", gap: 12 }}>
              <Shield size={20} color="var(--green)" />
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
                <strong>Secure Renewal</strong><br />
                All transactions are encrypted. Your pass QR will automatically update upon payment confirmation.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
