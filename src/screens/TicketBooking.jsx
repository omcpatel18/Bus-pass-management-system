/**
 * ══════════════════════════════════════════════════════════════════════
 *  BUSPASSPRO — SINGLE TRIP TICKET BOOKING
 *  File: src/screens/TicketBooking.jsx
 *
 *  FLOW:
 *  ─────────────────────────────────────────────────────────────────
 *  BOOK tab
 *    1. SEARCH  — from/to typeahead + bus type + schedule
 *    2. CONFIRM — fare breakdown + payment selection
 *    3. TICKET  — physical ticket with scannable QR code
 *
 *  MY TICKETS tab — history; click any → full QR ticket modal
 *  NEARBY tab     — schematic live transit map
 *
 *  QR TICKET:
 *  ─────────────────────────────────────────────────────────────────
 *  ◆ QR encodes JSON: ticket_id, passenger, from/to, type, date, fare
 *  ◆ Generated via qrserver.com API — zero npm dependency
 *  ◆ "SIMULATE SCAN" shows conductor validation modal
 *  ◆ Physical ticket: perforated edge, route badge, status stamp
 *
 *  ADD TO App.jsx:
 *  ─────────────────────────────────────────────────────────────────
 *  import TicketBooking from "./screens/TicketBooking";
 *  In NAV_CONFIG.passenger: { label: "TICKETS", page: "tickets" }
 *  In SCREENS: tickets: () => <TicketBooking />
 * ══════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ── Design tokens ─────────────────────────────────────────────────────
const G = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;700&family=Instrument+Sans:wght@400;500;600&display=swap');
:root {
  --cream:#F6F0E4; --surface:#FDFAF3; --parchment:#EDE4CC;
  --ink:#1A1208;   --ink-mid:#3D2410;
  --amber:#C8832A; --amber-text:#8B520A; --amber-on-ink:#F0A830;
  --amber-light:#F5D49A; --muted:#6B5535; --rule:#D4C4A0;
  --green:#1E6641; --green-on-ink:#52B788;
  --red:#B02020;   --cream-on-ink:#F6F0E4; --muted-on-ink:#B09878;
  --success-bg:#EBF7F0; --error-bg:#FDEAEA; --warn-bg:#FEF7E6;
  --font-display:'Bebas Neue',sans-serif;
  --font-serif:'DM Serif Display',serif;
  --font-mono:'JetBrains Mono',monospace;
  --font-sans:'Instrument Sans',sans-serif;
  --ease-spring:cubic-bezier(.34,1.28,.64,1);
  --r-xs:4px; --r-sm:8px; --r-md:14px; --r-lg:20px; --r-xl:28px; --r-full:999px;
  --shadow-sm:0 2px 8px rgba(26,18,8,.08);
  --shadow-md:0 6px 24px rgba(26,18,8,.12);
  --shadow-lg:0 16px 48px rgba(26,18,8,.18);
}
@keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn    { from{opacity:0} to{opacity:1} }
@keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideUp   { from{opacity:0;transform:translateY(10px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes spin      { to{transform:rotate(360deg)} }
@keyframes pulse     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.65)} }
@keyframes stampDrop { 0%{transform:scale(2.2)rotate(-8deg);opacity:0} 65%{transform:scale(.92)rotate(3deg);opacity:1} 100%{transform:scale(1)rotate(-3deg);opacity:1} }
@keyframes qrReveal  { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
@keyframes lineGrow  { from{transform:scaleX(0)} to{transform:scaleX(1)} }
@keyframes drivePing { 0%{transform:scale(1);opacity:.8} 70%{transform:scale(2.4);opacity:0} 100%{opacity:0} }
@keyframes carMove   { 0%{transform:translateX(0)rotate(0deg)} 25%{transform:translateX(6px)rotate(2deg)} 75%{transform:translateX(-3px)rotate(-1deg)} 100%{transform:translateX(0)rotate(0deg)} }
`;

// ══════════════════════════════════════════════════════════════════════
//  DATA
// ══════════════════════════════════════════════════════════════════════

const CITY_STOPS = [
  "Central Station","Old Market","Hospital Gate","Library Square",
  "IT Park","Tech Hub","City Mall","Railway Station",
  "Bus Terminal","Ring Road","Outer Ring","Airport Road",
  "North Zone","University Gate","Sector 4","Main Market",
  "City Square","South End",
];

const QUICK_DEST = ["Railway Station","City Mall","Airport Road","Main Market","Tech Hub","IT Park"];

const BUS_TYPES = [
  { id:"regular", label:"REGULAR",    desc:"Non-AC City Bus",        icon:"🚌", rate:5,  base:10, color:"#C8832A", lineColor:"#B02020", bg:"#FEF7E6", features:["Non-AC","Standard Seats","All Stops"],          cap:40 },
  { id:"luxury",  label:"LUXURY AC",  desc:"Volvo / Scania Express", icon:"🚐", rate:12, base:30, color:"#1E6641", lineColor:"#1E6641", bg:"#EBF7F0", features:["Full AC","Reclining Seats","Charging Ports"], cap:35 },
  { id:"express", label:"EXPRESS",    desc:"Point-to-Point Shuttle", icon:"⚡", rate:8,  base:20, color:"#1A1208", lineColor:"#1A4A8A", bg:"#F6F0E4", features:["AC","Direct Route","WiFi","Few Stops"],          cap:25 },
];

const PAYMENT_METHODS = [
  { id:"upi",    label:"UPI",        icon:"⚡", sub:"Google Pay / PhonePe / BHIM" },
  { id:"card",   label:"CARD",       icon:"💳", sub:"Debit or Credit card"          },
  { id:"wallet", label:"BPP WALLET", icon:"👝", sub:"Balance: ₹320"                  },
  { id:"cash",   label:"CASH",       icon:"💵", sub:"Pay conductor on board"         },
];

const MOCK_HISTORY = [
  { id:"TKT-8821", date:"02 Mar 2024", time:"08:12", from:"Central Station", to:"Railway Station", type:"luxury",  fare:97,  km:8.2,  status:"VALID",     rating:5, passenger:"Aryan Sharma", pid:"STU-10042", bus:"BUS-201" },
  { id:"TKT-8810", date:"01 Mar 2024", time:"17:45", from:"Library Square",  to:"City Mall",       type:"regular", fare:34,  km:4.7,  status:"USED",      rating:4, passenger:"Aryan Sharma", pid:"STU-10042", bus:"BUS-105" },
  { id:"TKT-8795", date:"28 Feb 2024", time:"09:00", from:"University Gate", to:"Airport Road",    type:"express", fare:112, km:11.5, status:"USED",      rating:5, passenger:"Aryan Sharma", pid:"STU-10042", bus:"SHUTTLE-42" },
  { id:"TKT-8781", date:"26 Feb 2024", time:"11:30", from:"IT Park",         to:"Main Market",     type:"regular", fare:29,  km:3.8,  status:"USED",      rating:3, passenger:"Aryan Sharma", pid:"STU-10042", bus:"BUS-302" },
  { id:"TKT-8762", date:"24 Feb 2024", time:"18:22", from:"Tech Hub",        to:"Ring Road",       type:"regular", fare:25,  km:2.9,  status:"CANCELLED", rating:0, passenger:"Aryan Sharma", pid:"STU-10042", bus:"—" },
];

const NEARBY_BUSES = [
  { id:1, route:"Route 201",   type:"luxury",  x:32, y:28, eta:3, rating:4.9 },
  { id:2, route:"Route 105",   type:"regular", x:58, y:45, eta:5, rating:4.7 },
  { id:3, route:"Shuttle 42",  type:"express", x:18, y:62, eta:7, rating:5.0 },
  { id:4, route:"Route 302",   type:"regular", x:72, y:30, eta:6, rating:4.5 },
  { id:5, route:"Route 112",   type:"regular", x:44, y:72, eta:4, rating:4.8 },
  { id:6, route:"Route 500",   type:"luxury",  x:82, y:58, eta:9, rating:4.6 },
];

// ══════════════════════════════════════════════════════════════════════
//  QR CODE UTILITY  (zero npm deps — uses qrserver.com free API)
// ══════════════════════════════════════════════════════════════════════
function buildQRUrl(tkt) {
  const payload = JSON.stringify({
    tid:  tkt.id,
    pid:  tkt.pid,
    name: tkt.passenger,
    from: tkt.from,
    to:   tkt.to,
    type: tkt.type,
    fare: tkt.fare,
    date: tkt.date,
    time: tkt.time,
    bus:  tkt.bus,
    stat: tkt.status,
  });
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payload)}&color=1A1208&bgcolor=F6F0E4&margin=10&qzone=1`;
}

// ══════════════════════════════════════════════════════════════════════
//  PHYSICAL QR TICKET  — the hero component
// ══════════════════════════════════════════════════════════════════════
function QRTicket({ ticket, onClose, showClose = true }) {
  const bus        = BUS_TYPES.find(b => b.id === ticket.type) || BUS_TYPES[0];
  const qrUrl      = buildQRUrl(ticket);
  const isValid    = ticket.status === "VALID";
  const isCancelled= ticket.status === "CANCELLED";

  return (
    <div style={{ width:"100%", maxWidth:540, margin:"0 auto",
      background:"var(--cream)", border:"2px solid var(--ink)",
      boxShadow:"8px 8px 0 var(--ink)", animation:"qrReveal .4s var(--ease-spring)",
      position:"relative", overflow:"hidden" }}>

      {/* ── Colour band ── */}
      <div style={{ background:bus.lineColor, padding:"10px 22px",
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:18 }}>{bus.icon}</span>
          <div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:14, letterSpacing:3,
              color:"white" }}>{bus.label}</div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:2,
              color:"rgba(255,255,255,.6)" }}>{bus.desc}</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ fontFamily:"var(--font-display)", fontSize:12, letterSpacing:2,
            color:"white", background:"rgba(0,0,0,.2)", padding:"3px 10px" }}>BUSPASSPRO</div>
          {showClose && (
            <button onClick={onClose} style={{ background:"rgba(0,0,0,.2)", border:"none",
              color:"white", width:26, height:26, cursor:"pointer",
              fontFamily:"var(--font-display)", fontSize:14, lineHeight:1 }}>✕</button>
          )}
        </div>
      </div>

      {/* ── Ticket header info ── */}
      <div style={{ padding:"18px 22px 0" }}>

        {/* Ticket ID + issue date */}
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"flex-start", marginBottom:14 }}>
          <div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:4,
              color:"var(--muted)", marginBottom:2 }}>TICKET NO.</div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:24, letterSpacing:2,
              color:"var(--ink)", lineHeight:1 }}>{ticket.id}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:4,
              color:"var(--muted)", marginBottom:2 }}>ISSUED</div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:2,
              color:"var(--ink)" }}>{ticket.date} · {ticket.time}</div>
          </div>
        </div>

        {/* Route banner — dark ink block */}
        <div style={{ background:"var(--ink)", margin:"0 -22px",
          padding:"16px 22px",
          display:"grid", gridTemplateColumns:"1fr 32px 1fr",
          alignItems:"center", gap:8 }}>
          <div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:6, letterSpacing:4,
              color:"var(--muted-on-ink)", marginBottom:4 }}>◉ FROM</div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:20, letterSpacing:1,
              color:"var(--cream-on-ink)", lineHeight:1.1 }}>{ticket.from}</div>
          </div>
          <div style={{ textAlign:"center", color:"var(--amber-on-ink)",
            fontFamily:"var(--font-display)", fontSize:20, lineHeight:1 }}>→</div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:6, letterSpacing:4,
              color:"var(--muted-on-ink)", marginBottom:4 }}>◎ TO</div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:20, letterSpacing:1,
              color:"var(--cream-on-ink)", lineHeight:1.1 }}>{ticket.to}</div>
          </div>
        </div>

        {/* Passenger info row */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
          padding:"14px 0", borderBottom:"1px solid var(--rule)", gap:8 }}>
          {[["PASSENGER",ticket.passenger],["PASS / ID",ticket.pid],["BUS",ticket.bus]].map(([l,v])=>(
            <div key={l}>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:6, letterSpacing:3,
                color:"var(--muted)", marginBottom:3 }}>{l}</div>
              <div style={{ fontFamily:"var(--font-sans)", fontSize:12, color:"var(--ink)",
                fontWeight:500 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Fare + features */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"12px 0", borderBottom:"1px solid var(--rule)" }}>
          <div style={{ display:"flex", gap:20 }}>
            {[["FARE",`₹${ticket.fare}`],["DISTANCE",`~${ticket.km} km`]].map(([l,v])=>(
              <div key={l}>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:6, letterSpacing:3,
                  color:"var(--muted)" }}>{l}</div>
                <div style={{ fontFamily:"var(--font-display)", fontSize:22, letterSpacing:1,
                  color:"var(--ink)", lineHeight:1 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap", justifyContent:"flex-end" }}>
            {bus.features.map(f=>(
              <span key={f} style={{ fontFamily:"var(--font-mono)", fontSize:6, letterSpacing:1,
                color:"var(--amber-text)", background:"var(--amber-light)",
                padding:"2px 7px" }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Perforated divider ── */}
      <div style={{ position:"relative", height:28, display:"flex", alignItems:"center",
        overflow:"hidden" }}>
        <div style={{ position:"absolute", left:-12, width:24, height:24, borderRadius:"50%",
          background:"var(--cream)", border:"2px solid var(--ink)", zIndex:2 }}/>
        <div style={{ flex:1, height:0, margin:"0 12px",
          borderTop:"2px dashed var(--rule)" }}/>
        <div style={{ position:"absolute", right:-12, width:24, height:24, borderRadius:"50%",
          background:"var(--cream)", border:"2px solid var(--ink)", zIndex:2 }}/>
      </div>

      {/* ── QR section ── */}
      <div style={{ padding:"16px 22px 22px", display:"flex", gap:20, alignItems:"flex-start" }}>

        {/* QR code */}
        <div style={{ flexShrink:0, textAlign:"center" }}>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:6, letterSpacing:4,
            color:"var(--muted)", marginBottom:8 }}>SCAN TO VERIFY</div>
          <div style={{ width:120, height:120, border:"2px solid var(--ink)",
            background:"var(--cream)", overflow:"hidden", position:"relative" }}>
            <img src={qrUrl} alt={`QR for ${ticket.id}`} width={116} height={116}
              style={{ display:"block",
                filter:isCancelled?"grayscale(1) opacity(.3)":"none" }}/>
            {/* offline fallback */}
            <div style={{ position:"absolute", inset:0, display:"none",
              flexDirection:"column", alignItems:"center", justifyContent:"center",
              background:"var(--parchment)",
              fontFamily:"var(--font-mono)", fontSize:7, color:"var(--muted)",
              textAlign:"center", gap:4 }} id={`qr-fallback-${ticket.id}`}>
              <span style={{ fontSize:24 }}>⬛</span>QR OFFLINE
            </div>
          </div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:6, letterSpacing:2,
            color:"var(--muted)", marginTop:6 }}>{ticket.id}</div>
        </div>

        {/* Instructions + status */}
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:6, letterSpacing:4,
            color:"var(--muted)", marginBottom:8 }}>BOARDING INSTRUCTIONS</div>
          {[
            "Show this QR to conductor before boarding.",
            "Valid for one single trip only.",
            "Valid only for the route shown above.",
            "Non-transferable. ID may be checked.",
          ].map((t,i)=>(
            <div key={i} style={{ display:"flex", gap:6, marginBottom:5 }}>
              <span style={{ fontFamily:"var(--font-display)", fontSize:11,
                color:"var(--amber-text)", flexShrink:0, lineHeight:1.4 }}>{i+1}.</span>
              <span style={{ fontFamily:"var(--font-sans)", fontSize:10,
                color:"var(--muted)", lineHeight:1.55 }}>{t}</span>
            </div>
          ))}

          {/* Status badge */}
          <div style={{ marginTop:12, display:"inline-flex", alignItems:"center", gap:8,
            padding:"5px 12px",
            background:isValid?"var(--success-bg)":isCancelled?"var(--error-bg)":"var(--warn-bg)",
            border:`1.5px solid ${isValid?"var(--green)":isCancelled?"var(--red)":"var(--amber)"}` }}>
            <div style={{ width:7, height:7, borderRadius:"50%",
              background:isValid?"var(--green)":isCancelled?"var(--red)":"var(--amber)",
              animation:"pulse 2s ease-in-out infinite" }}/>
            <span style={{ fontFamily:"var(--font-display)", fontSize:12, letterSpacing:3,
              color:isValid?"var(--green)":isCancelled?"var(--red)":"var(--amber-text)" }}>
              {ticket.status}
            </span>
          </div>
        </div>
      </div>

      {/* Status stamp (rotated) */}
      {isValid&&(
        <div style={{ position:"absolute", top:90, right:18,
          border:"3px solid var(--green)", padding:"4px 14px",
          transform:"rotate(8deg)",
          animation:"stampDrop .5s var(--ease-spring) .3s both",
          pointerEvents:"none" }}>
          <div style={{ fontFamily:"var(--font-display)", fontSize:18,
            letterSpacing:4, color:"var(--green)", opacity:.5 }}>VALID</div>
        </div>
      )}
      {isCancelled&&(
        <div style={{ position:"absolute", top:90, right:18,
          border:"3px solid var(--red)", padding:"4px 14px",
          transform:"rotate(8deg)",
          animation:"stampDrop .5s var(--ease-spring) .3s both",
          pointerEvents:"none" }}>
          <div style={{ fontFamily:"var(--font-display)", fontSize:18,
            letterSpacing:4, color:"var(--red)", opacity:.5 }}>VOID</div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  CONDUCTOR SCAN MODAL
// ══════════════════════════════════════════════════════════════════════
function ScanModal({ ticket, onClose }) {
  const [scanning, setScanning] = useState(true);
  const [result,   setResult]   = useState(null);
  const bus = BUS_TYPES.find(b => b.id === ticket.type) || BUS_TYPES[0];

  useEffect(() => {
    const t = setTimeout(() => {
      setScanning(false);
      setResult(ticket.status === "CANCELLED" ? "INVALID" : "VALID");
    }, 1400);
    return () => clearTimeout(t);
  }, [ticket]);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(26,18,8,.78)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:3000, animation:"fadeIn .2s ease" }} onClick={onClose}>
      <div style={{ width:380, background:"var(--ink)", border:"2px solid var(--amber)",
        borderRadius:"var(--r-xl)",overflow:"hidden",
        animation:"slideUp .3s var(--ease-spring)",
        boxShadow:"0 24px 80px rgba(26,18,8,.5)" }}
        onClick={e => e.stopPropagation()}>

        <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,.08)",
          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:4,
              color:"var(--muted-on-ink)", marginBottom:2 }}>CONDUCTOR TERMINAL</div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:18, letterSpacing:2,
              color:"var(--amber-on-ink)" }}>QR SCAN RESULT</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none",
            color:"var(--muted-on-ink)", fontFamily:"var(--font-display)",
            fontSize:18, cursor:"pointer", lineHeight:1 }}>✕</button>
        </div>

        <div style={{ padding:"24px 20px" }}>
          {scanning ? (
            <div style={{ textAlign:"center", padding:"32px 0" }}>
              <div style={{ width:48, height:48, border:"3px solid rgba(240,168,48,.2)",
                borderTop:"3px solid var(--amber-on-ink)", borderRadius:"50%",
                animation:"spin .7s linear infinite", margin:"0 auto 16px" }}/>
              <div style={{ fontFamily:"var(--font-display)", fontSize:18, letterSpacing:3,
                color:"var(--amber-on-ink)" }}>SCANNING…</div>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:2,
                color:"var(--muted-on-ink)", marginTop:6 }}>VERIFYING TICKET DATA</div>
            </div>
          ) : (
            <div style={{ animation:"fadeUp .3s ease" }}>

              {/* Result banner */}
              <div style={{ padding:"14px 18px", marginBottom:20,
                background:result==="VALID"?"rgba(82,183,136,.12)":"rgba(176,32,32,.12)",
                border:`2px solid ${result==="VALID"?"var(--green-on-ink)":"var(--red)"}`,
                display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ fontFamily:"var(--font-display)", fontSize:44,
                  color:result==="VALID"?"var(--green-on-ink)":"var(--red)",
                  lineHeight:1 }}>{result==="VALID"?"✓":"✕"}</div>
                <div>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:22, letterSpacing:3,
                    color:result==="VALID"?"var(--green-on-ink)":"var(--red)" }}>
                    {result==="VALID"?"VALID TICKET":"INVALID TICKET"}
                  </div>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:2,
                    color:"var(--muted-on-ink)", marginTop:2 }}>
                    {result==="VALID"?"ALLOW BOARDING":"DO NOT ALLOW BOARDING"}
                  </div>
                </div>
              </div>

              {/* Ticket data */}
              {[
                ["TICKET ID",  ticket.id],
                ["PASSENGER",  ticket.passenger],
                ["PASS / ID",  ticket.pid],
                ["FROM → TO",  `${ticket.from} → ${ticket.to}`],
                ["BUS TYPE",   `${bus.icon} ${bus.label}`],
                ["FARE PAID",  `₹${ticket.fare}`],
                ["ISSUED",     `${ticket.date} · ${ticket.time}`],
                ["BUS",        ticket.bus],
              ].map(([l,v],i)=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between",
                  padding:"8px 0",
                  borderBottom:i<7?"1px solid rgba(255,255,255,.06)":"none" }}>
                  <span style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:2,
                    color:"var(--muted-on-ink)" }}>{l}</span>
                  <span style={{ fontFamily:"var(--font-sans)", fontSize:12,
                    color:"var(--cream-on-ink)", fontWeight:500,
                    textAlign:"right", maxWidth:200 }}>{v}</span>
                </div>
              ))}

              <button onClick={onClose} style={{ width:"100%", padding:"12px 0",
                background:"var(--amber)", border:"none", marginTop:20,
                fontFamily:"var(--font-display)", fontSize:14, letterSpacing:3,
                color:"var(--ink)", cursor:"pointer" }}>
                CLOSE TERMINAL
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  SHARED ATOMS
// ══════════════════════════════════════════════════════════════════════

const Tag = ({ children, color }) => (
  <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:4,
    color:color||"var(--muted)", textTransform:"uppercase", marginBottom:8 }}>{children}</div>
);
const Rule = ({ my=20 }) => <div style={{ height:1, background:"var(--rule)", margin:`${my}px 0` }}/>;

const Btn = ({ children, onClick, variant="primary", size="md", full=false, disabled=false }) => {
  const [h,setH] = useState(false);
  const pad = {sm:"7px 16px",md:"11px 26px",lg:"14px 36px"}[size]||"11px 26px";
  const fs  = {sm:11,md:13,lg:16}[size]||13;
  const s = {
    primary:  {bg:h&&!disabled?"#2C1E0A":"var(--ink)",          c:"var(--amber-on-ink)", b:"none"},
    secondary:{bg:h&&!disabled?"var(--parchment)":"transparent", c:"var(--ink)",          b:"1.5px solid var(--ink)"},
    danger:   {bg:h&&!disabled?"#8A1818":"var(--red)",           c:"var(--cream-on-ink)", b:"none"},
    success:  {bg:h&&!disabled?"#155230":"var(--green)",         c:"var(--cream-on-ink)", b:"none"},
    ghost:    {bg:h&&!disabled?"var(--parchment)":"transparent", c:"var(--amber-text)",   b:"1.5px solid var(--rule)"},
  }[variant]||{};
  return <button onClick={onClick} disabled={disabled}
    onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{ padding:pad, background:s.bg, color:s.c, border:s.b||"none",
      fontFamily:"var(--font-display)", fontSize:fs, letterSpacing:2,
      cursor:disabled?"not-allowed":"pointer", opacity:disabled?.45:1,
      width:full?"100%":"auto", display:"inline-flex", alignItems:"center",
      justifyContent:"center", gap:8, borderRadius:"var(--r-sm)",
      transition:"background .18s, transform .1s",
      transform:h&&!disabled?"translateY(-1px)":"none" }}>{children}</button>;
};

const Spinner = ({size=18,color="var(--amber)"}) => (
  <div style={{ width:size, height:size, border:`2px solid rgba(200,131,42,.25)`,
    borderTop:`2px solid ${color}`, borderRadius:"50%",
    animation:"spin .7s linear infinite", display:"inline-block", flexShrink:0 }}/>
);

function useToast() {
  const [ts,setTs] = useState([]);
  const add = useCallback((msg,type="info")=>{
    const id=Date.now(); setTs(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setTs(t=>t.filter(x=>x.id!==id)),type==="error"?6000:3500);
  },[]);
  const C = { success:{bg:"var(--success-bg)",b:"var(--green)",t:"var(--green)",i:"✓"}, error:{bg:"var(--error-bg)",b:"var(--red)",t:"var(--red)",i:"✕"}, info:{bg:"var(--surface)",b:"var(--ink)",t:"var(--ink)",i:"◆"}, warn:{bg:"var(--warn-bg)",b:"var(--amber-text)",t:"var(--amber-text)",i:"⚠"} };
  const Toaster = () => (
    <div style={{ position:"fixed",bottom:24,right:24,zIndex:9999,display:"flex",flexDirection:"column",gap:8 }}>
      {ts.map(t=>{ const c=C[t.type]||C.info; return(
        <div key={t.id} style={{ background:c.bg,border:`2px solid ${c.b}`,padding:"11px 16px",minWidth:280,display:"flex",gap:10,alignItems:"center",borderRadius:"var(--r-md)",animation:"slideDown .3s ease",boxShadow:"0 4px 20px rgba(26,18,8,.12)" }}>
          <span style={{ fontFamily:"var(--font-display)",fontSize:18,color:c.t }}>{c.i}</span>
          <span style={{ fontFamily:"var(--font-sans)",fontSize:13,color:c.t }}>{t.msg}</span>
        </div>
      );})}
    </div>
  );
  return { success:m=>add(m,"success"), error:m=>add(m,"error"), info:m=>add(m,"info"), warn:m=>add(m,"warn"), Toaster };
}

// ══════════════════════════════════════════════════════════════════════
//  STOP SEARCH TYPEAHEAD
// ══════════════════════════════════════════════════════════════════════
function StopSearch({ value, onChange, placeholder, exclude=[], label, labelColor="var(--muted)" }) {
  const [query,  setQuery]  = useState(value||"");
  const [open,   setOpen]   = useState(false);
  const [cursor, setCursor] = useState(-1);
  const wrapRef  = useRef(null);
  const inputRef = useRef(null);

  useEffect(()=>{ setQuery(value||""); },[value]);

  const pool     = CITY_STOPS.filter(s=>!exclude.includes(s));
  const filtered = query.trim().length===0 ? pool
    : pool.filter(s=>s.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(()=>{
    const h=e=>{ if(wrapRef.current&&!wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[]);

  const select = stop => { setQuery(stop); setOpen(false); setCursor(-1); onChange(stop); };
  const handleKey = e => {
    if(e.key==="ArrowDown"){ e.preventDefault(); setOpen(true); setCursor(c=>Math.min(c+1,filtered.length-1)); }
    else if(e.key==="ArrowUp"){ e.preventDefault(); setCursor(c=>Math.max(c-1,0)); }
    else if(e.key==="Enter"&&cursor>=0&&filtered[cursor]){ select(filtered[cursor]); }
    else if(e.key==="Escape"){ setOpen(false); }
  };
  const highlight = text => {
    const q=query.trim();
    if(!q) return <span style={{ color:"var(--ink)" }}>{text}</span>;
    const idx=text.toLowerCase().indexOf(q.toLowerCase());
    if(idx<0) return <span style={{ color:"var(--muted)" }}>{text}</span>;
    return <span style={{ color:"var(--muted)" }}>{text.slice(0,idx)}<span style={{ color:"var(--ink)",fontWeight:700,background:"var(--amber-light)",padding:"0 1px" }}>{text.slice(idx,idx+q.length)}</span>{text.slice(idx+q.length)}</span>;
  };

  return (
    <div ref={wrapRef} style={{ position:"relative", width:"100%" }}>
      {label&&<div style={{ fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:3,
        color:labelColor,textTransform:"uppercase",marginBottom:6 }}>{label}</div>}
      <div style={{ display:"flex",alignItems:"center",gap:8,
        border:`1.5px solid ${open?"var(--amber)":"var(--rule)"}`,
        background:open?"var(--surface)":"var(--cream)",
        padding:"10px 14px",transition:"border-color .18s,background .18s",
        borderRadius:"var(--r-sm)",boxShadow:open?"0 0 0 3px rgba(200,131,42,.08)":"none" }}>
        <span style={{ fontSize:11,flexShrink:0,color:"var(--muted)" }}>◉</span>
        <input ref={inputRef} value={query} placeholder={placeholder}
          onChange={e=>{ setQuery(e.target.value); setOpen(true); setCursor(-1); if(!e.target.value) onChange(""); }}
          onFocus={()=>setOpen(true)} onKeyDown={handleKey}
          style={{ flex:1,border:"none",outline:"none",background:"transparent",
            fontFamily:"var(--font-sans)",fontSize:14,color:"var(--ink)" }}/>
        {query
          ? <button onClick={()=>{ setQuery(""); onChange(""); inputRef.current?.focus(); setOpen(true); }}
              style={{ background:"none",border:"none",color:"var(--muted)",fontSize:16,
                lineHeight:1,cursor:"pointer",flexShrink:0,padding:0 }}>×</button>
          : <span style={{ color:"var(--muted)",fontSize:10,flexShrink:0,pointerEvents:"none" }}>▾</span>
        }
      </div>
      {open&&(
        <div style={{ position:"absolute",top:"calc(100% + 6px)",left:0,right:0,
          background:"var(--surface)",border:"2px solid var(--ink)",borderRadius:"var(--r-lg)",zIndex:600,
          maxHeight:240,overflowY:"auto",animation:"slideDown .15s ease",overflow:"hidden",
          boxShadow:"0 10px 32px rgba(26,18,8,.14)" }}>
          <div style={{ padding:"7px 14px 5px",borderBottom:"1px solid var(--rule)",
            display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <span style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:3,color:"var(--muted)" }}>
              {query.trim()?`${filtered.length} RESULT${filtered.length!==1?"S":""}` : "ALL STOPS"}
            </span>
            <button onClick={()=>setOpen(false)} style={{ background:"none",border:"none",
              color:"var(--muted)",fontSize:12,cursor:"pointer",padding:0 }}>✕</button>
          </div>
          {filtered.length===0&&(
            <div style={{ padding:"16px 14px",fontFamily:"var(--font-serif)",
              fontSize:13,color:"var(--muted)",fontStyle:"italic" }}>No stops match "{query}"</div>
          )}
          {filtered.map((stop,i)=>(
            <div key={stop}
              onMouseDown={e=>{e.preventDefault();select(stop);}} onMouseEnter={()=>setCursor(i)}
              style={{ padding:"10px 14px",cursor:"pointer",
                background:i===cursor?"var(--parchment)":"transparent",
                borderBottom:"1px solid var(--rule)",
                display:"flex",alignItems:"center",gap:10,transition:"background .1s" }}>
              <span style={{ fontSize:8,color:stop===value?"var(--green)":"var(--amber)",flexShrink:0 }}>◉</span>
              <span style={{ fontFamily:"var(--font-sans)",fontSize:13,flex:1 }}>{highlight(stop)}</span>
              {stop===value&&<span style={{ fontFamily:"var(--font-mono)",fontSize:8,color:"var(--green)",flexShrink:0 }}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  MAIN SCREEN
// ══════════════════════════════════════════════════════════════════════
export default function TicketBooking() {
  const toast    = useToast();
  const [tab,    setTab]    = useState("book");
  const [step,   setStep]   = useState(1);
  const [loading,setLoading]= useState(false);

  const [pickup,  setPickup]  = useState("");
  const [dest,    setDest]    = useState("");
  const [busType, setBusType] = useState("regular");
  const [payment, setPayment] = useState("upi");
  const [sched,   setSched]   = useState("now");

  const [ticket,     setTicket]     = useState(null);
  const [viewTicket, setViewTicket] = useState(null);
  const [scanTicket, setScanTicket] = useState(null);

  const bus  = BUS_TYPES.find(b=>b.id===busType)||BUS_TYPES[0];
  const dist = pickup&&dest
    ? (Math.abs(CITY_STOPS.indexOf(pickup)-CITY_STOPS.indexOf(dest))*2.4+3.1).toFixed(1)
    : 0;
  const fare = pickup&&dest ? bus.base + Math.round(parseFloat(dist)*bus.rate) : 0;
  const now  = new Date();
  const dateStr = now.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
  const timeStr = now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:false});

  const handleSearch = () => {
    if(!pickup){ toast.error("Please select a pickup stop."); return; }
    if(!dest)  { toast.error("Please select a destination."); return; }
    if(pickup===dest){ toast.error("Pickup and destination can't be the same."); return; }
    setLoading(true);
    setTimeout(()=>{ setLoading(false); setStep(2); }, 800);
  };

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(()=>{
      const t = {
        id:        `TKT-${Math.floor(Math.random()*9000)+1000}`,
        passenger: "Aryan Sharma",
        pid:       "STU-10042",
        from:      pickup,
        to:        dest,
        type:      busType,
        fare,
        km:        parseFloat(dist),
        date:      dateStr,
        time:      timeStr,
        bus:       `BUS-${Math.floor(Math.random()*400)+100}`,
        status:    "VALID",
        rating:    0,
      };
      setTicket(t);
      setLoading(false);
      setStep(3);
      toast.success("Ticket issued! Show the QR to your conductor.");
    }, 1800);
  };

  const reset = () => {
    setStep(1); setPickup(""); setDest("");
    setBusType("regular"); setTicket(null);
  };

  return (
    <>
      <style>{G}</style>
      <toast.Toaster/>

      {/* ── Page header ── */}
      <div style={{ borderBottom:"3px solid var(--ink)", paddingBottom:20, marginBottom:28,
        animation:"fadeUp .4s ease" }}>
        <Tag>Transportation Hub</Tag>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
          <div style={{ fontFamily:"var(--font-display)", fontSize:48, letterSpacing:1,
            color:"var(--ink)", lineHeight:.9 }}>
            BUS TICKET<br/><span style={{ color:"var(--amber-text)" }}>BOOKING</span>
          </div>
          <div style={{ display:"flex", gap:0, border:"1.5px solid var(--ink)" }}>
            {[["book","BOOK"],["mytickets","MY TICKETS"],["nearby","NEARBY"]].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)}
                style={{ padding:"9px 18px",
                  background:tab===id?"var(--ink)":"transparent",
                  color:tab===id?"var(--amber-on-ink)":"var(--muted)",
                  border:"none", borderRight:id!=="nearby"?"1px solid var(--ink)":"none",
                  fontFamily:"var(--font-display)", fontSize:12, letterSpacing:2,
                  cursor:"pointer", transition:"all .18s" }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════ TAB: BOOK ════════════════════ */}
      {tab==="book"&&(
        <div style={{ animation:"fadeIn .3s ease" }}>

          {/* Step indicator */}
          <div style={{ display:"flex", alignItems:"center", marginBottom:28 }}>
            {[["01","SEARCH"],["02","CONFIRM"],["03","YOUR TICKET"]].map(([n,l],i)=>{
              const done=step>i+1, active=step===i+1;
              return (
                <div key={n} style={{ display:"flex", alignItems:"center", flex:i<2?1:"auto" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:28, height:28,
                      background:done?"var(--green)":active?"var(--ink)":"transparent",
                      border:`2px solid ${done?"var(--green)":active?"var(--ink)":"var(--rule)"}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontFamily:"var(--font-display)", fontSize:12,
                      color:done||active?"var(--cream-on-ink)":"var(--muted)",
                      transition:"all .3s" }}>{done?"✓":n}</div>
                    <span style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:3,
                      color:active?"var(--ink)":"var(--muted)" }}>{l}</span>
                  </div>
                  {i<2&&<div style={{ flex:1, height:1,
                    background:done?"var(--green)":"var(--rule)", margin:"0 12px" }}/>}
                </div>
              );
            })}
          </div>

          {/* ── STEP 1: SEARCH ── */}
          {step===1&&(
            <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:28,
              alignItems:"start", animation:"fadeUp .35s ease" }}>

              <div>
                <div style={{ border:"1.5px solid var(--ink)", borderRadius:"var(--r-xl)",overflow:"hidden", background:"var(--surface)",
                  marginBottom:14 }}>

                  {/* From / Swap / To row */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 48px 1fr",
                    borderBottom:"1px solid var(--rule)" }}>
                    <div style={{ padding:"18px 20px" }}>
                      <StopSearch value={pickup} onChange={setPickup}
                        placeholder="From stop…" exclude={dest?[dest]:[]}
                        label="◉ FROM" labelColor="var(--green)"/>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
                      borderLeft:"1px solid var(--rule)", borderRight:"1px solid var(--rule)" }}>
                      <button onClick={()=>{const t=pickup;setPickup(dest);setDest(t);}}
                        style={{ width:32, height:32, borderRadius:"50%",
                          background:"var(--ink)", border:"none",
                          color:"var(--amber-on-ink)", fontSize:14,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          cursor:"pointer" }}>⇄</button>
                    </div>
                    <div style={{ padding:"18px 20px" }}>
                      <StopSearch value={dest} onChange={setDest}
                        placeholder="Where to?" exclude={pickup?[pickup]:[]}
                        label="◎ TO" labelColor="var(--red)"/>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
                    borderBottom:"1px solid var(--rule)" }}>
                    {[["now","🚀 DEPART NOW"],["later","🕐 SCHEDULE LATER"]].map(([id,lbl])=>(
                      <button key={id} onClick={()=>setSched(id)}
                        style={{ padding:"11px 16px",
                          background:sched===id?"var(--parchment)":"transparent",
                          border:"none",borderRight:id==="now"?"1px solid var(--rule)":"none",
                          fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:2,
                          color:sched===id?"var(--ink)":"var(--muted)",cursor:"pointer",
                          transition:"all .18s" }}>{lbl}</button>
                    ))}
                  </div>

                  {/* Quick picks */}
                  <div style={{ padding:"14px 20px" }}>
                    <Tag>QUICK DESTINATIONS</Tag>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {QUICK_DEST.map(q=>(
                        <button key={q} onClick={()=>setDest(q)}
                          style={{ padding:"5px 12px",
                            background:dest===q?"var(--ink)":"var(--cream)",
                            color:dest===q?"var(--amber-on-ink)":"var(--ink)",
                            border:`1.5px solid ${dest===q?"var(--ink)":"var(--rule)"}`,
                            fontFamily:"var(--font-sans)",fontSize:11,
                            cursor:"pointer",transition:"all .15s" }}>{q}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fare preview */}
                {pickup&&dest&&(
                  <div style={{ border:"1.5px solid var(--amber)", borderRadius:"var(--r-lg)", background:"var(--warn-bg)",
                    padding:"14px 20px", marginBottom:14,
                    display:"flex", justifyContent:"space-between", alignItems:"center",
                    animation:"fadeUp .3s ease" }}>
                    <div>
                      <div style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:4,
                        color:"var(--amber-text)",marginBottom:2 }}>ESTIMATED FARE</div>
                      <div style={{ fontFamily:"var(--font-display)",fontSize:36,
                        color:"var(--ink)",letterSpacing:1,lineHeight:1 }}>₹{fare}</div>
                      <div style={{ fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:2,
                        color:"var(--muted)",marginTop:3 }}>~{dist} km · {bus.label}</div>
                    </div>
                    <div style={{ fontFamily:"var(--font-serif)",fontSize:14,
                      color:"var(--ink)",fontStyle:"italic",textAlign:"right",lineHeight:1.7 }}>
                      {pickup}<br/>↓<br/>{dest}
                    </div>
                  </div>
                )}

                <Btn variant="primary" full size="lg" onClick={handleSearch} disabled={loading}>
                  {loading?<><Spinner size={16} color="var(--amber-on-ink)"/> SEARCHING…</>:"SEARCH BUSES →"}
                </Btn>
              </div>

              {/* Bus type cards */}
              <div>
                <Tag>SELECT BUS TYPE</Tag>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {BUS_TYPES.map((bt,i)=>(
                    <div key={bt.id} onClick={()=>setBusType(bt.id)}
                      style={{ border:`2px solid ${busType===bt.id?"var(--ink)":"var(--rule)"}`,
                        background:busType===bt.id?bt.bg:"var(--surface)",
                        padding:"14px 16px", cursor:"pointer",
                        transform:busType===bt.id?"translateX(4px)":"none",
                        transition:"all .18s",
                        animation:`fadeUp .3s ease ${i*.07}s both` }}>
                      <div style={{ display:"flex",justifyContent:"space-between",
                        alignItems:"flex-start",marginBottom:6 }}>
                        <div style={{ display:"flex",gap:10,alignItems:"center" }}>
                          <span style={{ fontSize:22,opacity:busType===bt.id?1:.5 }}>{bt.icon}</span>
                          <div>
                            <div style={{ fontFamily:"var(--font-display)",fontSize:16,
                              letterSpacing:2,color:"var(--ink)" }}>{bt.label}</div>
                            <div style={{ fontFamily:"var(--font-sans)",fontSize:11,
                              color:"var(--muted)" }}>{bt.desc}</div>
                          </div>
                        </div>
                        {busType===bt.id&&<span style={{ color:"var(--green)",
                          fontFamily:"var(--font-display)",fontSize:14 }}>✓</span>}
                      </div>
                      <div style={{ fontFamily:"var(--font-display)",fontSize:13,
                        letterSpacing:1,color:bt.color,marginBottom:6 }}>
                        ₹{bt.base} BASE + ₹{bt.rate}/KM
                      </div>
                      <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>
                        {bt.features.map(f=>(
                          <span key={f} style={{ fontFamily:"var(--font-mono)",fontSize:6,
                            letterSpacing:1,color:bt.color,
                            background:bt.bg,border:`1px solid ${bt.color}40`,
                            padding:"1px 6px" }}>{f}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: CONFIRM ── */}
          {step===2&&(
            <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:28,
              alignItems:"start", animation:"fadeUp .35s ease" }}>

              {/* Receipt */}
              <div style={{ border:"2px solid var(--ink)", borderRadius:"var(--r-xl)",overflow:"hidden", background:"var(--surface)",
                boxShadow:"6px 6px 0 var(--rule)" }}>
                <div style={{ background:"var(--ink)", padding:"16px 22px" }}>
                  <div style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:4,
                    color:"var(--muted-on-ink)",marginBottom:3 }}>BOOKING SUMMARY</div>
                  <div style={{ fontFamily:"var(--font-display)",fontSize:22,letterSpacing:2,
                    color:"var(--amber-on-ink)" }}>CONFIRM YOUR TRIP</div>
                </div>

                <div style={{ padding:"20px 22px",borderBottom:"1px solid var(--rule)" }}>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 24px 1fr",
                    gap:8,alignItems:"center",marginBottom:16 }}>
                    <div style={{ background:"var(--success-bg)",border:"1px solid var(--green)",
                      padding:"10px 14px" }}>
                      <div style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:3,
                        color:"var(--green)",marginBottom:3 }}>◉ FROM</div>
                      <div style={{ fontFamily:"var(--font-serif)",fontSize:16,
                        color:"var(--ink)" }}>{pickup}</div>
                    </div>
                    <div style={{ textAlign:"center",fontFamily:"var(--font-display)",
                      fontSize:18,color:"var(--muted)" }}>→</div>
                    <div style={{ background:"var(--error-bg)",border:"1px solid var(--red)",
                      padding:"10px 14px" }}>
                      <div style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:3,
                        color:"var(--red)",marginBottom:3 }}>◎ TO</div>
                      <div style={{ fontFamily:"var(--font-serif)",fontSize:16,
                        color:"var(--ink)" }}>{dest}</div>
                    </div>
                  </div>

                  <div style={{ display:"flex",alignItems:"center",gap:12,
                    padding:"10px 14px",background:bus.bg,
                    border:`1.5px solid ${bus.color}60` }}>
                    <span style={{ fontSize:22 }}>{bus.icon}</span>
                    <div>
                      <div style={{ fontFamily:"var(--font-display)",fontSize:16,
                        letterSpacing:2,color:"var(--ink)" }}>{bus.label}</div>
                      <div style={{ fontFamily:"var(--font-sans)",fontSize:11,
                        color:"var(--muted)" }}>{bus.desc} · ~{dist} km · {bus.cap} seats</div>
                    </div>
                  </div>
                </div>

                <div style={{ padding:"20px 22px",borderBottom:"1px solid var(--rule)" }}>
                  <Tag>FARE BREAKDOWN</Tag>
                  {[
                    ["Base Fare", `₹${bus.base}.00`],
                    [`Distance (${dist} km)`, `₹${Math.round(parseFloat(dist)*bus.rate)}.00`],
                    ["Service Tax","₹4.50"],
                  ].map(([l,v])=>(
                    <div key={l} style={{ display:"flex",justifyContent:"space-between",
                      padding:"8px 0",borderBottom:"1px solid var(--rule)" }}>
                      <span style={{ fontFamily:"var(--font-sans)",fontSize:13,
                        color:"var(--muted)" }}>{l}</span>
                      <span style={{ fontFamily:"var(--font-mono)",fontSize:12,
                        color:"var(--ink)" }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display:"flex",justifyContent:"space-between",
                    alignItems:"center",paddingTop:12 }}>
                    <span style={{ fontFamily:"var(--font-display)",fontSize:22,
                      letterSpacing:2,color:"var(--ink)" }}>TOTAL</span>
                    <span style={{ fontFamily:"var(--font-display)",fontSize:32,
                      letterSpacing:1,color:"var(--amber-text)" }}>₹{fare+4.5}</span>
                  </div>
                </div>

                <div style={{ padding:"14px 22px" }}>
                  <button onClick={()=>setStep(1)}
                    style={{ background:"none",border:"none",
                      fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:3,
                      color:"var(--muted)",cursor:"pointer" }}>← CHANGE TRIP DETAILS</button>
                </div>
              </div>

              {/* Payment + CTA */}
              <div>
                <Tag>PAYMENT METHOD</Tag>
                <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:20 }}>
                  {PAYMENT_METHODS.map(p=>(
                    <div key={p.id} onClick={()=>setPayment(p.id)}
                      style={{ border:`1.5px solid ${payment===p.id?"var(--ink)":"var(--rule)"}`,
                        background:payment===p.id?"var(--parchment)":"var(--surface)",
                        padding:"12px 16px",cursor:"pointer",
                        display:"flex",gap:12,alignItems:"center",
                        transition:"all .18s" }}>
                      <span style={{ fontSize:18 }}>{p.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:"var(--font-display)",fontSize:15,
                          letterSpacing:2,color:"var(--ink)" }}>{p.label}</div>
                        <div style={{ fontFamily:"var(--font-mono)",fontSize:8,
                          letterSpacing:1,color:"var(--muted)" }}>{p.sub}</div>
                      </div>
                      {payment===p.id&&<span style={{ color:"var(--green)",
                        fontFamily:"var(--font-display)",fontSize:14 }}>✓</span>}
                    </div>
                  ))}
                </div>

                <div style={{ border:"1.5px solid var(--rule)",padding:"16px",
                  background:"var(--parchment)",marginBottom:12 }}>
                  <div style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:3,
                    color:"var(--muted)",marginBottom:3 }}>YOU WILL PAY</div>
                  <div style={{ fontFamily:"var(--font-display)",fontSize:38,
                    color:"var(--ink)",letterSpacing:1,lineHeight:1 }}>₹{fare+4.5}</div>
                  <div style={{ fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:2,
                    color:"var(--muted)",marginTop:4 }}>
                    VIA {PAYMENT_METHODS.find(p=>p.id===payment)?.label}
                  </div>
                </div>

                <Btn variant="primary" full size="lg" onClick={handleConfirm} disabled={loading}>
                  {loading?<><Spinner size={16} color="var(--amber-on-ink)"/> ISSUING TICKET…</>:"CONFIRM & PAY →"}
                </Btn>
                <div style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:2,
                  color:"var(--muted)",textAlign:"center",marginTop:8 }}>
                  SECURED · RAZORPAY PAYMENT GATEWAY
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: TICKET ── */}
          {step===3&&ticket&&(
            <div style={{ animation:"fadeUp .4s ease" }}>
              {/* Success bar */}
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
                marginBottom:24,padding:"14px 18px",
                background:"var(--success-bg)",border:"1.5px solid var(--green)",borderRadius:"var(--r-md)" }}>
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <div style={{ width:36,height:36,borderRadius:"50%",
                    background:"var(--green)",display:"flex",alignItems:"center",
                    justifyContent:"center",fontFamily:"var(--font-display)",
                    fontSize:18,color:"white" }}>✓</div>
                  <div>
                    <div style={{ fontFamily:"var(--font-display)",fontSize:18,
                      letterSpacing:2,color:"var(--green)" }}>TICKET ISSUED SUCCESSFULLY</div>
                    <div style={{ fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:2,
                      color:"var(--muted)",marginTop:2 }}>
                      Show the QR code below to the conductor before boarding.
                    </div>
                  </div>
                </div>
                <button onClick={reset}
                  style={{ background:"none",border:"1px solid var(--rule)",
                    fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:3,
                    color:"var(--muted)",cursor:"pointer",padding:"6px 14px" }}>
                  + BOOK ANOTHER
                </button>
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"1fr 320px",gap:24,
                alignItems:"start" }}>

                {/* The ticket */}
                <QRTicket ticket={ticket} showClose={false}/>

                {/* Actions panel */}
                <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                  <div style={{ border:"1.5px solid var(--rule)",borderRadius:"var(--r-lg)",background:"var(--surface)",
                    padding:"16px" }}>
                    <Tag>QUICK ACTIONS</Tag>
                    <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                      <Btn variant="primary" full size="sm"
                        onClick={()=>setScanTicket(ticket)}>
                        🔍 SIMULATE CONDUCTOR SCAN
                      </Btn>
                      <Btn variant="secondary" full size="sm" onClick={()=>window.print()}>
                        🖨 PRINT TICKET
                      </Btn>
                      <Btn variant="ghost" full size="sm"
                        onClick={()=>{ toast.info("Ticket ID: "+ticket.id); }}>
                        ↗ SHARE / COPY TICKET ID
                      </Btn>
                    </div>
                  </div>

                  <div style={{ border:"1.5px solid var(--rule)",borderRadius:"var(--r-lg)",background:"var(--surface)",
                    padding:"16px" }}>
                    <Tag>JOURNEY DETAILS</Tag>
                    {[
                      ["Distance",  `~${ticket.km} km`],
                      ["Bus Type",  `${bus.icon} ${bus.label}`],
                      ["Fare Paid", `₹${ticket.fare+4.5}`],
                      ["Valid For", "Single trip only"],
                      ["Boarding",  "Show QR to conductor"],
                    ].map(([l,v])=>(
                      <div key={l} style={{ display:"flex",justifyContent:"space-between",
                        padding:"7px 0",borderBottom:"1px solid var(--rule)" }}>
                        <span style={{ fontFamily:"var(--font-mono)",fontSize:8,
                          letterSpacing:2,color:"var(--muted)" }}>{l}</span>
                        <span style={{ fontFamily:"var(--font-sans)",fontSize:12,
                          color:"var(--ink)",fontWeight:500 }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding:"12px 14px",borderRadius:"var(--r-md)",background:"var(--warn-bg)",
                    border:"1.5px solid var(--amber-text)" }}>
                    <div style={{ fontFamily:"var(--font-sans)",fontSize:11,
                      color:"var(--amber-text)",lineHeight:1.6 }}>
                      ⚠ One trip only. Non-transferable. Non-refundable after boarding.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════ TAB: MY TICKETS ════════════════════ */}
      {tab==="mytickets"&&(
        <div style={{ animation:"fadeIn .3s ease" }}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",
            borderTop:"3px solid var(--ink)",borderBottom:"1px solid var(--rule)",
            marginBottom:24 }}>
            {[["TOTAL",MOCK_HISTORY.length,"var(--ink)"],
              ["VALID",MOCK_HISTORY.filter(t=>t.status==="VALID").length,"var(--green)"],
              ["USED",MOCK_HISTORY.filter(t=>t.status==="USED").length,"var(--muted)"],
              ["CANCELLED",MOCK_HISTORY.filter(t=>t.status==="CANCELLED").length,"var(--red)"]
            ].map(([l,n,c],i)=>(
              <div key={l} style={{ padding:"16px 20px",textAlign:"center",
                borderRight:i<3?"1px solid var(--rule)":"none" }}>
                <div style={{ fontFamily:"var(--font-display)",fontSize:32,
                  color:c,letterSpacing:1,lineHeight:1 }}>{n}</div>
                <div style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:3,
                  color:"var(--muted)",marginTop:6 }}>TICKETS — {l}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex",flexDirection:"column",gap:2 }}>
            {MOCK_HISTORY.map((tkt,i)=>{
              const b=BUS_TYPES.find(x=>x.id===tkt.type)||BUS_TYPES[0];
              const isV=tkt.status==="VALID", isC=tkt.status==="CANCELLED";
              return (
                <div key={tkt.id} style={{ border:`1.5px solid ${isV?"var(--green)":isC?"var(--red)":"var(--rule)"}`,
                  background:isV?"var(--success-bg)":"var(--surface)",
                  display:"grid",gridTemplateColumns:"auto 1fr auto",
                  gap:16,padding:"16px 20px",alignItems:"center",
                  animation:`fadeUp .3s ease ${i*.06}s both` }}>
                  <div style={{ width:48,height:48,background:b.lineColor,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:22,flexShrink:0 }}>{b.icon}</div>
                  <div>
                    <div style={{ display:"flex",gap:10,alignItems:"center",marginBottom:4 }}>
                      <div style={{ fontFamily:"var(--font-display)",fontSize:16,
                        letterSpacing:1,color:"var(--ink)" }}>{tkt.from} → {tkt.to}</div>
                      <span style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:2,
                        color:"white",
                        background:isV?"var(--green)":isC?"var(--red)":"var(--muted)",
                        padding:"2px 8px" }}>{tkt.status}</span>
                    </div>
                    <div style={{ fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:1,
                      color:"var(--muted)" }}>
                      {tkt.id} · {tkt.date} {tkt.time} · {b.label} · {tkt.km}km · {tkt.bus}
                    </div>
                    {tkt.rating>0&&(
                      <div style={{ marginTop:5,color:"var(--amber)",fontSize:11 }}>
                        {"★".repeat(tkt.rating)}{"☆".repeat(5-tkt.rating)}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign:"right",display:"flex",
                    flexDirection:"column",gap:6,alignItems:"flex-end" }}>
                    <div style={{ fontFamily:"var(--font-display)",fontSize:22,
                      letterSpacing:1,color:"var(--ink)" }}>₹{tkt.fare}</div>
                    <div style={{ display:"flex",gap:6 }}>
                      <button onClick={()=>setViewTicket(tkt)}
                        style={{ padding:"5px 12px",background:"var(--ink)",border:"none",
                          fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:2,
                          color:"var(--amber-on-ink)",cursor:"pointer" }}>VIEW QR</button>
                      {!isC&&(
                        <button onClick={()=>setScanTicket(tkt)}
                          style={{ padding:"5px 12px",background:"none",
                            border:"1px solid var(--rule)",
                            fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:2,
                            color:"var(--muted)",cursor:"pointer" }}>SCAN</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════ TAB: NEARBY ════════════════════ */}
      {tab==="nearby"&&(
        <div style={{ animation:"fadeIn .3s ease" }}>
          <div style={{ border:"2px solid var(--ink)",background:"var(--surface)" }}>
            <div style={{ background:"var(--ink)",padding:"14px 20px",
              display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <div style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:4,
                  color:"var(--muted-on-ink)",marginBottom:3 }}>LIVE SCHEMATIC</div>
                <div style={{ fontFamily:"var(--font-display)",fontSize:18,letterSpacing:2,
                  color:"var(--amber-on-ink)" }}>TRANSIT MAP</div>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <div style={{ width:7,height:7,borderRadius:"50%",
                  background:"var(--green-on-ink)",animation:"pulse 2s ease-in-out infinite" }}/>
                <span style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:3,
                  color:"var(--muted-on-ink)" }}>LIVE</span>
              </div>
            </div>

            <div style={{ height:380,background:"var(--parchment)",position:"relative",
              overflow:"hidden",borderBottom:"1px solid var(--rule)" }}>
              {[...Array(10)].map((_,i)=>(
                <div key={`v${i}`} style={{ position:"absolute",left:`${(i+1)*10}%`,
                  top:0,bottom:0,width:1,background:"rgba(26,18,8,.04)" }}/>
              ))}
              {[...Array(8)].map((_,i)=>(
                <div key={`h${i}`} style={{ position:"absolute",top:`${(i+1)*12}%`,
                  left:0,right:0,height:1,background:"rgba(26,18,8,.04)" }}/>
              ))}
              {/* Route lines */}
              <div style={{ position:"absolute",top:"35%",left:"5%",right:"5%",
                height:3,background:"#B02020",opacity:.35,borderRadius:2 }}/>
              <div style={{ position:"absolute",top:"58%",left:"5%",right:"5%",
                height:3,background:"#1A4A8A",opacity:.35,borderRadius:2 }}/>
              <div style={{ position:"absolute",top:"46%",left:"5%",right:"5%",
                height:3,background:"#1E6641",opacity:.35,borderRadius:2,
                transform:"rotate(-1.5deg)" }}/>
              {NEARBY_BUSES.map(b=>{
                const bt=BUS_TYPES.find(x=>x.id===b.type)||BUS_TYPES[0];
                return (
                  <div key={b.id} style={{ position:"absolute",left:`${b.x}%`,top:`${b.y}%`,
                    transform:"translate(-50%,-50%)",cursor:"pointer",zIndex:10 }}>
                    <div style={{ position:"absolute",inset:-6,background:bt.lineColor,
                      borderRadius:"50%",opacity:.15,animation:"drivePing 2.5s infinite",
                      animationDelay:`${b.id*.3}s` }}/>
                    <div style={{ fontSize:20,position:"relative" }}>{bt.icon}</div>
                    <div style={{ position:"absolute",top:"100%",left:"50%",
                      transform:"translateX(-50%)",marginTop:4,whiteSpace:"nowrap",
                      background:"var(--ink)",color:"white",
                      fontFamily:"var(--font-mono)",fontSize:7,padding:"2px 6px",
                      letterSpacing:1 }}>{b.route} · {b.eta}m</div>
                  </div>
                );
              })}
              <div style={{ position:"absolute",left:"50%",top:"50%",
                transform:"translate(-50%,-50%)",zIndex:20 }}>
                <div style={{ fontSize:20 }}>📍</div>
                <div style={{ position:"absolute",top:"100%",left:"50%",
                  transform:"translateX(-50%)",marginTop:3,whiteSpace:"nowrap",
                  background:"var(--amber-text)",color:"white",
                  fontFamily:"var(--font-mono)",fontSize:7,padding:"2px 6px",
                  letterSpacing:1 }}>YOU</div>
              </div>
              <div style={{ position:"absolute",bottom:14,right:14,
                background:"var(--cream)",border:"1.5px solid var(--ink)",
                padding:"10px 12px" }}>
                <div style={{ fontFamily:"var(--font-mono)",fontSize:6,letterSpacing:3,
                  color:"var(--muted)",marginBottom:6 }}>LEGEND</div>
                {BUS_TYPES.map(bt=>(
                  <div key={bt.id} style={{ display:"flex",alignItems:"center",
                    gap:6,marginBottom:4 }}>
                    <span style={{ fontSize:10 }}>{bt.icon}</span>
                    <span style={{ fontFamily:"var(--font-mono)",fontSize:6,
                      letterSpacing:1,color:"var(--muted)" }}>{bt.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",
              borderTop:"1px solid var(--rule)" }}>
              {[
                ["ACTIVE BUSES","14","var(--ink)"],
                ["AVG. WAIT","6 MINS","var(--amber-text)"],
                ["NEAREST BUS","3 MINS","var(--green)"],
                ["BUSY STOP","CENTRAL STN","var(--muted)"],
              ].map(([l,v,c],i)=>(
                <div key={l} style={{ padding:"16px 20px",
                  borderRight:i<3?"1px solid var(--rule)":"none" }}>
                  <div style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:3,
                    color:"var(--muted)",marginBottom:4 }}>{l}</div>
                  <div style={{ fontFamily:"var(--font-display)",fontSize:22,
                    letterSpacing:1,color:c,lineHeight:1 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ MODALS ════════════════════ */}
      {viewTicket&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(26,18,8,.72)",
          display:"flex",alignItems:"center",justifyContent:"center",
          zIndex:2000,padding:"20px",animation:"fadeIn .2s ease" }}
          onClick={()=>setViewTicket(null)}>
          <div style={{ width:"100%",maxWidth:560,display:"flex",
            flexDirection:"column",gap:12 }}
            onClick={e=>e.stopPropagation()}>
            <QRTicket ticket={viewTicket} onClose={()=>setViewTicket(null)}/>
            {viewTicket.status!=="CANCELLED"&&(
              <button onClick={()=>{ setViewTicket(null); setScanTicket(viewTicket); }}
                style={{ width:"100%",padding:"12px 0",background:"var(--amber)",border:"none",
                  fontFamily:"var(--font-display)",fontSize:14,letterSpacing:3,
                  color:"var(--ink)",cursor:"pointer" }}>
                🔍 SIMULATE CONDUCTOR SCAN
              </button>
            )}
          </div>
        </div>
      )}

      {scanTicket&&(
        <ScanModal ticket={scanTicket} onClose={()=>setScanTicket(null)}/>
      )}
    </>
  );
}