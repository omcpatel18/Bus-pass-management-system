/**
 * ══════════════════════════════════════════════════════════════════════
 *  BUSPASSPRO — CONDUCTOR HUB
 *  High-Contrast "Field Ops" Terminal for On-Board Verification
 * ══════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from "react";
import { 
  Scan, Camera, History, Search, QrCode, ShieldCheck, 
  MapPin, Clock, LogOut, CheckCircle2, XCircle, AlertCircle,
  MoreVertical, Download, ChevronRight, Zap
} from "lucide-react";

// ── Design Tokens ─────────────────────────────────────────────────────
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;700&family=Instrument+Sans:wght@400;500;600&display=swap');
`;

const CSS_VARS = `
:root {
  --midnight:     #050505;
  --panel:        #0F0F0E;
  --ink:          #FAFAFA;
  --amber:        #FFD700;
  --neon-green:   #39FF14;
  --neon-red:     #FF3131;
  --terminal:     #1A1A1A;
  --muted:        #666666;
  --font-display: 'Bebas Neue', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;
  --font-sans:    'Instrument Sans', sans-serif;
}

@keyframes scanLine {
  0% { top: 0% }
  100% { top: 100% }
}

@keyframes pulseBorder {
  0%, 100% { border-color: var(--amber); box-shadow: 0 0 5px var(--amber); }
  50% { border-color: transparent; box-shadow: 0 0 20px var(--amber); }
}

@keyframes textReveal {
  from { clip-path: inset(0 100% 0 0); }
  to { clip-path: inset(0 0 0 0); }
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

const TerminalRow = ({ label, value, type = "normal" }) => (
  <div style={{ 
    display: "flex", justifyContent: "space-between", padding: "12px 0", 
    borderBottom: "1px solid rgba(255,255,255,0.05)" 
  }}>
    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>{label.toUpperCase()}</span>
    <span style={{ 
      fontFamily: "var(--font-display)", fontSize: 18, 
      color: type === "danger" ? "var(--neon-red)" : type === "success" ? "var(--neon-green)" : "var(--ink)" 
    }}>{value.toUpperCase()}</span>
  </div>
);

// ── Conductor Hub ─────────────────────────────────────────────────────

export default function ConductorHub() {
  const [activeTab, setActiveTab] = useState("scanner");
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  // Mock Scanning Action
  const handleScan = () => {
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setScanning(false);
      setScanResult({
        status: "valid",
        id: "BPP-2024-001234",
        name: "Aryan Sharma",
        route: "Red Line",
        expiry: "31 Mar 2024"
      });
    }, 1500);
  };

  const TABS = [
    { id: "scanner", label: "SCANNER", icon: <Scan size={18} /> },
    { id: "lookup", label: "LOOKUP", icon: <Search size={18} /> },
    { id: "triplog", label: "TRIP LOG", icon: <History size={18} /> }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--midnight)", color: "var(--ink)", padding: "20px" }}>
      <style>{FONTS + CSS_VARS}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, padding: "0 10px" }}>
        <div>
          <Tag color="var(--amber)">FIELD OPERATIONS</Tag>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 44, lineHeight: 0.9 }}>CONDUCTOR<br /><span style={{ color: "var(--amber)" }}>HUB_V2</span></div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted)", marginBottom: 4 }}>NODE: BUS_882</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", gap: 2, background: "var(--panel)", padding: 4, marginBottom: 32 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, padding: "16px 0", background: activeTab === t.id ? "var(--terminal)" : "transparent",
              border: "none", color: activeTab === t.id ? "var(--amber)" : "var(--muted)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              cursor: "pointer", transition: "all .2s ease"
            }}>
            {t.icon}
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2 }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Main Area */}
      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        
        {activeTab === "scanner" && (
          <div style={{ animation: "textReveal .5s ease" }}>
            <div style={{ 
              width: "100%", aspectRatio: "1/1", 
              background: "#000", border: `2px solid ${scanResult ? (scanResult.status === "valid" ? "var(--neon-green)" : "var(--neon-red)") : "var(--amber)"}`,
              position: "relative", overflow: "hidden", marginBottom: 32,
              animation: !scanResult && !scanning ? "pulseBorder 2s infinite" : "none"
            }}>
              {/* Scan Line Overlay */}
              {scanning && <div style={{ position: "absolute", left: 0, right: 0, height: 4, background: "var(--amber)", boxShadow: "0 0 15px var(--amber)", zIndex: 10, animation: "scanLine 2s linear infinite" }} />}
              
              {!scanResult ? (
                <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
                  <QrCode size={80} color="rgba(255,255,255,0.1)" />
                  <button onClick={handleScan} disabled={scanning} style={{ background: "transparent", border: "1.5px solid var(--amber)", color: "var(--amber)", padding: "12px 32px", fontFamily: "var(--font-display)", fontSize: 20, cursor: "pointer", transition: "all .2s" }}>
                    {scanning ? "STABILIZING..." : "INITIATE SCAN"}
                  </button>
                  <Tag color="var(--muted)">ALIGN QR WITHIN VIEWFINDER</Tag>
                </div>
              ) : (
                <div style={{ height: "100%", padding: 40, display: "flex", flexDirection: "column", justifyContent: "center", background: scanResult.status === "valid" ? "rgba(57,255,20,0.05)" : "rgba(255,49,49,0.05)" }}>
                  <div style={{ textAlign: "center", marginBottom: 32 }}>
                    {scanResult.status === "valid" ? <CheckCircle2 size={64} color="var(--neon-green)" /> : <XCircle size={64} color="var(--neon-red)" />}
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 48, color: scanResult.status === "valid" ? "var(--neon-green)" : "var(--neon-red)", letterSpacing: 2 }}>{scanResult.status.toUpperCase()}</div>
                  </div>
                  <TerminalRow label="IDENT" value={scanResult.id} />
                  <TerminalRow label="NAME" value={scanResult.name} />
                  <TerminalRow label="LINE" value={scanResult.route} />
                  <TerminalRow label="EXPIRY" value={scanResult.expiry} />
                  
                  <button onClick={() => setScanResult(null)} style={{ marginTop: 32, padding: 16, border: "1px solid var(--muted)", background: "transparent", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 9, cursor: "pointer" }}>CLEAR RESULT</button>
                </div>
              )}
            </div>
            
            <div style={{ background: "var(--panel)", padding: 24 }}>
              <Tag>Quick Stats</Tag>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ border: "1px solid var(--terminal)", padding: 16 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>142</div>
                  <Tag color="var(--muted)">VALID SCANS</Tag>
                </div>
                <div style={{ border: "1px solid var(--terminal)", padding: 16 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--neon-red)" }}>03</div>
                  <Tag color="var(--muted)">DISCREPANCIES</Tag>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "lookup" && (
          <div style={{ animation: "textReveal .5s ease" }}>
            <div style={{ border: "1px solid var(--terminal)", background: "var(--panel)", padding: 24, marginBottom: 24 }}>
              <Tag>Search System</Tag>
              <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <input placeholder="ENTER PASS ID OR NAME..." style={{ flex: 1, background: "#000", border: "1px solid var(--terminal)", color: "var(--ink)", padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 12, outline: "none" }} />
                <button style={{ padding: "0 20px", background: "var(--amber)", border: "none", color: "var(--midnight)", display: "flex", alignItems: "center" }}><Search size={18} /></button>
              </div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted)", margin: 0 }}>QUERY COMMAND: SELECT_USER FROM CORE_PASS_DB WHERE IDENT=?...</p>
            </div>
            
            <div style={{ padding: 24, textAlign: "center", border: "1px dashed var(--terminal)" }}>
              <Tag>Query Results</Tag>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--muted)" }}>READY_FOR_INPUT</div>
            </div>
          </div>
        )}

        {activeTab === "triplog" && (
          <div style={{ animation: "textReveal .5s ease" }}>
            <Tag>Session Log / BUS_882</Tag>
            <div style={{ border: "1px solid var(--terminal)", background: "var(--terminal)", padding: 20, marginBottom: 20 }}>
              {["09:42 · VALID · BPP-2024-001234", "10:05 · VALID · BPP-2024-002291", "10:14 · EXPIRED · BPP-2024-000822", "10:30 · VALID · BPP-2024-004419"].map((log, i) => (
                <div key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 10, padding: "8px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none", color: log.includes("EXPIRED") ? "var(--neon-red)" : "var(--muted)" }}>
                  <span style={{ color: "var(--ink)" }}>{log.split(" · ")[0]}</span> · {log.split(" · ").slice(1).join(" · ")}
                </div>
              ))}
            </div>
            <button style={{ width: "100%", padding: 16, background: "var(--ink)", color: "var(--midnight)", border: "none", fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: 2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <Download size={18} /> EXPORT DAILY REPORT
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
