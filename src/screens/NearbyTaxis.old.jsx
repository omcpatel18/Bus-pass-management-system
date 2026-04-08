/**
 * ══════════════════════════════════════════════════════════════════════
 *  BUSPASSPRO — CITY TAXI SERVICE
 *  Premium Ride-Booking Interface for City Transit
 * ══════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Navigation, MapPin, Clock, CreditCard, Star, Phone, X, ChevronRight, CheckCircle, Info, Locate, Car, ArrowRight, History, Map } from "lucide-react";

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
  --ease-spring:  cubic-bezier(.34,1.28,.64,1);
}

@keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn   { from{opacity:0} to{opacity:1} }
@keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.65)} }
@keyframes stampIn  { 0%{transform:scale(2.2) rotate(-8deg);opacity:0} 65%{transform:scale(.92) rotate(3deg);opacity:1} 100%{transform:scale(1) rotate(-3deg);opacity:1} }
@keyframes drivePing { 0%{transform:scale(1);opacity:.8} 70%{transform:scale(2.2);opacity:0} 100%{opacity:0} }
`;

// ── Data Constants ────────────────────────────────────────────────────
const CITY_STOPS = [
  "Central Station", "North Zone", "Library Square", "Main Market", 
  "City Centre", "Tech Hub", "Ring Road", "IT Park", 
  "Railway Station", "South End", "Airport Road", "Bus Terminal"
];

const RIDE_TYPES = [
  { id: "auto", label: "AUTO", desc: "3-Wheeler", icon: "🛺", rate: 12, base: 30, color: "#C8832A", bg: "#FEF7E6" },
  { id: "economy", label: "ECONOMY", desc: "AC Sedan", icon: "🚗", rate: 18, base: 50, color: "#1E6641", bg: "#EBF7F0" },
  { id: "premium", label: "PREMIUM", desc: "Luxury SUV", icon: "🚙", rate: 28, base: 80, color: "#1A1208", bg: "#F6F0E4" }
];

// ── Shared Atoms ──────────────────────────────────────────────────────

const Tag = ({ children, color }) => (
  <div style={{
    fontFamily: "var(--font-mono)", fontSize: 8,
    letterSpacing: 4, color: color || "var(--muted)",
    textTransform: "uppercase", marginBottom: 8
  }}>{children}</div>
);

const Pill = ({ s }) => {
  const map = {
    COMPLETED: { bg: "var(--green)", color: "var(--cream-on-ink)" },
    ACTIVE: { bg: "var(--amber)", color: "var(--ink)" },
    CANCELLED: { bg: "var(--red)", color: "var(--cream-on-ink)" }
  };
  const c = map[(s || "").toUpperCase()] || { bg: "var(--ink)", color: "white" };
  return (
    <span style={{
      background: c.bg, color: c.color, fontFamily: "var(--font-mono)", 
      fontSize: 8, fontWeight: 700, letterSpacing: 2, padding: "3px 10px",
      display: "inline-block", clipPath: "polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
    }}>{s.toUpperCase()}</span>
  );
};

const Btn = ({ children, onClick, variant = "primary", full = false, size = "md", disabled = false, style = {} }) => {
  const [hov, setHov] = useState(false);
  const pad = { sm: "7px 16px", md: "11px 24px", lg: "14px 32px" }[size];
  const fs = { sm: 11, md: 13, lg: 16 }[size];
  const styles = {
    primary: { bg: hov && !disabled ? "var(--ink-mid)" : "var(--ink)", color: "var(--amber-on-ink)" },
    secondary: { bg: hov && !disabled ? "var(--parchment)" : "transparent", color: "var(--ink)", border: "1.5px solid var(--ink)" },
    danger: { bg: hov && !disabled ? "#8A1818" : "var(--red)", color: "var(--cream-on-ink)" }
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

// ── Logic Components ──────────────────────────────────────────────────

function useLocalToast() {
  const [ts, setTs] = useState([]);
  const add = (m) => {
    const id = Date.now(); setTs(l => [...l, { id, m }]);
    setTimeout(() => setTs(l => l.filter(x => x.id !== id)), 3000);
  };
  return {
    ts, notify: m => add(m),
    Toaster: () => (
      <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 8, zIndex: 1000 }}>
        {ts.map(t => (
          <div key={t.id} style={{ background: "var(--ink)", color: "var(--amber-on-ink)", padding: "12px 20px", fontFamily: "var(--font-sans)", fontSize: 13, animation: "fadeUp .3s ease" }}>{t.m}</div>
        ))}
      </div>
    )
  };
}

// ── Phases ────────────────────────────────────────────────────────────

function SearchPhase({ onBook }) {
  const [pickup, setPickup] = useState("Central Station");
  const [dest, setDest] = useState("");
  const [type, setType] = useState("economy");

  const sel = RIDE_TYPES.find(r => r.id === type);
  const dist = (Math.abs(CITY_STOPS.indexOf(pickup) - CITY_STOPS.indexOf(dest)) || 1) * 2.2;
  const fare = Math.round(sel.base + dist * sel.rate);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 48, animation: "fadeUp .4s ease" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <div style={{ border: "2px solid var(--ink)", background: "var(--surface)", padding: 24 }}>
          <Tag>Route Selection</Tag>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--green)" }} />
              <div style={{ flex: 1 }}>
                <Tag>PICKUP</Tag>
                <select value={pickup} onChange={e => setPickup(e.target.value)} style={{ width: "100%", background: "none", border: "none", borderBottom: "1.5px solid var(--rule)", fontFamily: "var(--font-sans)", fontSize: 16, padding: "8px 0", outline: "none" }}>
                  {CITY_STOPS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--red)" }} />
              <div style={{ flex: 1 }}>
                <Tag>DESTINATION</Tag>
                <select value={dest} onChange={e => setDest(e.target.value)} style={{ width: "100%", background: "none", border: "none", borderBottom: "1.5px solid var(--rule)", fontFamily: "var(--font-sans)", fontSize: 16, padding: "8px 0", outline: "none" }}>
                  <option value="">Select destination...</option>
                  {CITY_STOPS.filter(s => s !== pickup).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Tag>Service Types</Tag>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {RIDE_TYPES.map(r => (
              <div key={r.id} onClick={() => setType(r.id)} style={{
                padding: 20, border: `2.5px solid ${type === r.id ? "var(--ink)" : "var(--rule)"}`,
                background: type === r.id ? r.bg : "var(--surface)", cursor: "pointer", transition: "all .2s"
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{r.icon}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>{r.label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted)" }}>₹{r.rate}/KM</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "var(--ink)", padding: 32, position: "sticky", top: 100 }}>
        <Tag color="var(--muted-on-ink)">FARE SUMMARY</Tag>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 56, color: "var(--cream)", lineHeight: 1 }}>₹{dest ? fare : "--"}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--amber-on-ink)" }}>{dist.toFixed(1)} KM ESTIMATE</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted-on-ink)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
            <span>BASE FEE</span><span>₹{sel.base}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted-on-ink)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
            <span>DISTANCE</span><span>₹{Math.round(dist * sel.rate)}</span>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,.1)", margin: "8px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--amber-on-ink)", fontSize: 13, fontFamily: "var(--font-display)" }}>
            <span>TOTAL ESTIMATE</span><span>₹{dest ? fare : "--"}</span>
          </div>
        </div>
        <Btn variant="primary" full size="lg" disabled={!dest} onClick={() => onBook({ pickup, dest, type, fare, dist })}>BOOK TAXI NOW →</Btn>
      </div>
    </div>
  );
}

function TrackingPhase({ booking, onComplete, onCancel }) {
  const [stage, setStage] = useState(0);
  const stages = ["Assigning...", "Driver En Route", "Arrived", "In Trip", "Completed"];

  useEffect(() => {
    const i = setInterval(() => {
      setStage(s => {
        if (s >= 4) { clearInterval(i); onComplete(); return s; }
        return s + 1;
      });
    }, 4000);
    return () => clearInterval(i);
  }, []);

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", animation: "fadeUp .4s ease" }}>
      <div style={{ background: "var(--ink)", padding: 32, marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(240,168,48,0.03) 10px, rgba(240,168,48,0.03) 20px)" }} />
        <Tag color="var(--muted-on-ink)">LIVE RIDE TRACKING</Tag>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "var(--amber-on-ink)", position: "relative" }}>{stages[stage].toUpperCase()}</div>
        <div style={{ marginTop: 24, display: "flex", gap: 6 }}>
          {[0, 1, 2, 3, 4].map(s => (
            <div key={s} style={{ flex: 1, height: 4, background: s <= stage ? "var(--green-on-ink)" : "rgba(255,255,255,.1)" }} />
          ))}
        </div>
      </div>

      <div style={{ background: "var(--surface)", border: "2px solid var(--ink)", padding: 24 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, background: "var(--parchment)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Car size={32} color="var(--ink)" />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 20 }}>Vikram Singh</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>KA-05-MN-2234 · HYUNDAI I20</div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>★ 4.9</div>
          </div>
        </div>

        <div style={{ padding: 16, background: "var(--warn-bg)", border: "1.5px dashed var(--amber)", textAlign: "center", marginBottom: 24 }}>
          <Tag>RIDE OTP</Tag>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 8 }}>4821</div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Btn variant="secondary" full style={{ background: "white" }} onClick={() => window.location.href = "tel:+919876543210"}><Phone size={16} /> CALL DRIVER</Btn>
          <Btn variant="danger" full onClick={onCancel}>CANCEL RIDE</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────

export default function TaxiBooking() {
  const [tab, setTab] = useState("book");
  const [phase, setPhase] = useState("search");
  const [booking, setBooking] = useState(null);
  const toast = useLocalToast();

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <style>{FONTS + CSS_VARS}</style>
      <toast.Toaster />

      <div style={{ padding: "48px 44px" }}>
        <Tag>Transit Services</Tag>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 56, lineHeight: 0.9 }}>
            CITY TAXI<br /><span style={{ color: "var(--amber)" }}>SERVICES</span>
          </div>
          <div style={{ display: "flex", border: "1.5px solid var(--ink)" }}>
            {["book", "history", "nearby"].map(t => (
              <button key={t} onClick={() => { setTab(t); setPhase("search"); }} style={{
                padding: "12px 24px", background: tab === t ? "var(--ink)" : "transparent",
                color: tab === t ? "var(--amber-on-ink)" : "var(--muted)",
                fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2,
                border: "none", borderRight: t !== "nearby" ? "1.5px solid var(--ink)" : "none",
                cursor: "pointer", transition: "all .2s"
              }}>{t.toUpperCase()}</button>
            ))}
          </div>
        </div>

        {tab === "book" && (
          <>
            {phase === "search" && <SearchPhase onBook={b => { setBooking(b); setPhase("tracking"); }} />}
            {phase === "tracking" && <TrackingPhase booking={booking} onComplete={() => { setPhase("completed"); toast.notify("Ride completed successfully"); }} onCancel={() => setPhase("search")} />}
            {phase === "completed" && (
              <div style={{ textAlign: "center", animation: "fadeUp .4s ease" }}>
                <div style={{ display: "inline-block", border: "4px solid var(--green)", padding: "12px 32px", transform: "rotate(-3deg)", marginBottom: 40 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 48, color: "var(--green)" }}>RIDE DONE!</div>
                </div>
                <div style={{ maxWidth: 440, margin: "0 auto", background: "var(--surface)", border: "2px solid var(--ink)", padding: 32 }}>
                  <Tag>FINAL RECEIPT</Tag>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>TXN ID</span>
                    <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>TXN-882142</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>AMOUNT PAID</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>₹{booking?.fare}</span>
                  </div>
                  <Btn variant="primary" full onClick={() => setPhase("search")}>BOOK ANOTHER RIDE</Btn>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "history" && (
          <div style={{ animation: "fadeUp .4s ease" }}>
            <Tag>JOURNEY HISTORY</Tag>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 32, marginBottom: 32 }}>Recent Travels</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: "var(--surface)", border: "1.5px solid var(--rule)", padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                    <Car size={24} color="var(--amber)" />
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>CITY CENTRE → AIRPORT</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted)" }}>MAR 1{i}, 2024 · 8.4 KM · ECONOMY</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>₹145.00</div>
                    <Pill s="COMPLETED" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "nearby" && (
          <div style={{ animation: "fadeUp .4s ease" }}>
            <Tag>LIVE SERVICE MAP</Tag>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 32 }}>Active Vehicles</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--green)" }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "currentColor", animation: "pulseDot 2s infinite" }} /><span style={{ fontFamily: "var(--font-mono)", fontSize: 8 }}>8 DRIVERS NEARBY</span></div>
            </div>
            <div style={{ height: 500, background: "var(--ink)", border: "2px solid var(--amber)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, opacity: 0.1, backgroundImage: "radial-gradient(circle, var(--amber-on-ink) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
              {[
                { x: "25%", y: "30%", id: "T1", t: "AUTO" },
                { x: "70%", y: "45%", id: "T2", t: "SEDAN" },
                { x: "40%", y: "80%", id: "T3", t: "SUV" }
              ].map(t => (
                <div key={t.id} style={{ position: "absolute", left: t.x, top: t.y, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ position: "absolute", inset: -10, borderRadius: "50%", background: "var(--amber-on-ink)", opacity: 0.1, animation: "drivePing 2s infinite" }} />
                  <Car size={24} color="var(--amber-on-ink)" />
                  <div style={{ background: "var(--amber-on-ink)", color: "var(--ink)", padding: "2px 6px", fontFamily: "var(--font-mono)", fontSize: 7, marginTop: 4 }}>{t.t} {t.id}</div>
                </div>
              ))}
              <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
                <Locate size={40} color="var(--green-on-ink)" />
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--green-on-ink)", marginTop: 4, textAlign: "center" }}>YOU</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}