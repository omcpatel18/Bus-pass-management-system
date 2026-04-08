/**
 * ══════════════════════════════════════════════════════════════════════
 *  BUSPASSPRO — LIVE TRANSIT MAP
 *  Real-Time Route Tracking & Radar Visualization
 * ══════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from "react";
import { Locate, Navigation, MapPin, Clock, Info, ArrowUpRight, Search, Zap, Compass, Car } from "lucide-react";

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
  --amber-on-ink: #F0A830;
  --muted-on-ink: #B09878;
  --green:        #1E6641;
  --green-on-ink: #52B788;
  --rule:         #D4C4A0;
  --font-display: 'Bebas Neue', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;
  --font-sans:    'Instrument Sans', sans-serif;
}

@keyframes radar {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulseDot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(3); opacity: 0; }
}

@keyframes mapReveal {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
`;

// ── Atomic Components ─────────────────────────────────────────────────

const Tag = ({ children, color }) => (
  <div style={{
    fontFamily: "var(--font-mono)", fontSize: 8,
    letterSpacing: 4, color: color || "var(--muted)",
    textTransform: "uppercase", marginBottom: 8
  }}>{children}</div>
);

// ── Live Map Component ────────────────────────────────────────────────

const ROUTES_DATA = [
  { 
    id: 1, name: "Red Express", color: "#B02020", 
    stops: ["Central Hub", "Old Market", "IT Park", "Main Hospital", "North Gate"],
    busIdx: 1 
  },
  { 
    id: 2, name: "Blue Line", color: "#1A4A8A", 
    stops: ["City Square", "Terminal 1", "Tech Zone", "Airport Road", "East End"],
    busIdx: 2
  }
];

export default function LiveMap() {
  const [activeRoute, setActiveRoute] = useState(0);
  const [busProgress, setBusProgress] = useState(1);
  const [showTraffic, setShowTraffic] = useState(true);

  const route = ROUTES_DATA[activeRoute];

  useEffect(() => {
    const t = setInterval(() => {
      setBusProgress(p => (p + 1) % route.stops.length);
    }, 4500);
    return () => clearInterval(t);
  }, [activeRoute, route.stops.length]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", padding: "48px 44px" }}>
      <style>{FONTS + CSS_VARS}</style>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48 }}>
        <div>
          <Tag>Real-Time Tracking</Tag>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 64, lineHeight: 0.9 }}>
            TRANSIT<br /><span style={{ color: "var(--amber)" }}>RADAR</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {ROUTES_DATA.map((r, i) => (
            <button key={r.id} onClick={() => setActiveRoute(i)}
              style={{
                padding: "12px 24px", background: activeRoute === i ? "var(--ink)" : "var(--surface)",
                color: activeRoute === i ? "var(--amber-on-ink)" : "var(--ink)",
                border: `1.5px solid ${activeRoute === i ? "var(--ink)" : "var(--rule)"}`,
                fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2,
                cursor: "pointer", transition: "all .2s ease"
              }}>{r.name.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 48, alignItems: "start" }}>
        
        {/* Map Visualization */}
        <div style={{ 
          background: "var(--ink)", height: 600, borderRadius: 0, 
          position: "relative", overflow: "hidden", 
          boxShadow: "0 40px 100px rgba(26,18,8,.3)",
          animation: "mapReveal .6s ease"
        }}>
          {/* Radar background grid */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.1, backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          
          {/* Radar Sweeper */}
          <div style={{ position: "absolute", top: "50%", left: "50%", width: 800, height: 800, marginTop: -400, marginLeft: -400, background: "conic-gradient(from 0deg, transparent 60%, rgba(245,158,11,0.05) 100%)", borderRadius: "50%", animation: "radar 5s linear infinite" }} />
          
          <div style={{ position: "absolute", inset: 40, display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
            {route.stops.map((stop, i) => (
              <div key={stop} style={{ display: "flex", alignItems: "center", gap: 24, position: "relative" }}>
                {/* Vertical Connector */}
                {i < route.stops.length - 1 && (
                  <div style={{ position: "absolute", top: 16, left: 10, width: 2, height: "100%", background: i < busProgress ? route.color : "rgba(255,255,255,0.1)", transition: "background .4s" }} />
                )}
                
                {/* Stop Dot */}
                <div style={{ 
                  width: 22, height: 22, borderRadius: "50%", background: i === busProgress ? route.color : "transparent",
                  border: `2.5px solid ${i <= busProgress ? route.color : "rgba(255,255,255,0.2)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, transition: "all .4s"
                }}>
                  {i === busProgress && (
                    <div style={{ position: "absolute", inset: -8, border: `2px solid ${route.color}`, borderRadius: "50%", animation: "pulseDot 1.5s infinite" }} />
                  )}
                  {i < busProgress && <div style={{ width: 6, height: 6, background: route.color, borderRadius: "50%" }} />}
                </div>

                {/* Stop Info */}
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: i === busProgress ? "var(--amber-on-ink)" : "var(--muted-on-ink)", letterSpacing: 2, marginBottom: 4 }}>STOP 0{i + 1}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: i === busProgress ? "white" : "rgba(255,255,255,0.6)", letterSpacing: 1 }}>{stop.toUpperCase()}</div>
                </div>

                {/* Bus Marker */}
                {i === busProgress && (
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", background: "var(--amber-on-ink)", color: "var(--ink)", borderRadius: 0 }}>
                    <Car size={16} />
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700 }}>BUS_{route.id}82 LINE</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legend / Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ padding: 24, background: "var(--ink)", color: "white", borderRadius: 0 }}>
            <Tag color="var(--muted-on-ink)">CURRENT STATUS</Tag>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, lineHeight: 1, marginBottom: 8 }}>NEXT ARRIVAL</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--amber-on-ink)", marginBottom: 24 }}>{route.stops[busProgress]}</div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: 12, background: "rgba(255,255,255,0.05)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "var(--muted-on-ink)", marginBottom: 4 }}>ETA</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>4 MIN</div>
              </div>
              <div style={{ padding: 12, background: "rgba(255,255,255,0.05)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "var(--muted-on-ink)", marginBottom: 4 }}>LOAD</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--green-on-ink)" }}>LOW</div>
              </div>
            </div>
          </div>

          <div style={{ padding: 24, border: "2px solid var(--rule)", background: "var(--parchment)" }}>
            <Tag>Boarding Information</Tag>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
              Live tracking uses real-time GPS from onboard terminal nodes. Timings may vary slightly based on traffic density.
            </p>
            <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2 }}>TRAFFIC OVERLAY</span>
              <button 
                onClick={() => setShowTraffic(!showTraffic)}
                style={{ width: 44, height: 24, background: showTraffic ? "var(--green)" : "var(--rule)", border: "none", cursor: "pointer", position: "relative", transition: "all .2s" }}
              >
                <div style={{ width: 14, height: 14, background: "white", position: "absolute", top: 5, left: showTraffic ? 25 : 5, transition: "all .2s" }} />
              </button>
            </div>
          </div>

          <div style={{ padding: 24, border: "2px solid var(--ink)", background: "var(--surface)" }}>
            <Tag>Help & Support</Tag>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: 10, cursor: "pointer", color: "var(--ink)" }}>
              <span>REPORT MAP ISSUE</span>
              <ArrowUpRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
