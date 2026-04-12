/**
 * ══════════════════════════════════════════════════════════════════════
 *  BUSPASSPRO — ADMIN HUB  (redesigned)
 *  File: src/screens/AdminHub.jsx
 *
 *  Five sections in a left-rail numbered navigation:
 *  01 · OVERVIEW     — live stats strip + recent activity feed
 *  02 · EMAILS       — dispatch ledger + cancellation sender
 *  03 · DISCOUNTS    — voucher board + create form
 *  04 · SUPPORT      — filed query cards + response composer
 *  05 · REPORTS      — newspaper data brief + CSV export
 *
 *  ADD TO App.jsx:
 *    import AdminHub from "./screens/AdminHub";
 *    In NAV_CONFIG.admin: { label: "HUB", page: "hub" }
 *    In SCREENS: hub: () => <AdminHub />
 * ══════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ── Design tokens (identical to DesignSystem.jsx) ─────────────────────
const G = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;700&family=Instrument+Sans:wght@400;500;600&display=swap');

:root {
  --cream:#F6F0E4;  --surface:#FDFAF3; --parchment:#EDE4CC;
  --ink:#1A1208;    --ink-mid:#3D2410;
  --amber:#C8832A;  --amber-text:#8B520A; --amber-on-ink:#F0A830;
  --amber-light:#F5D49A; --muted:#6B5535; --rule:#D4C4A0;
  --green:#1E6641;  --green-on-ink:#52B788;
  --red:#B02020;    --cream-on-ink:#F6F0E4; --muted-on-ink:#B09878;
  --success-bg:#EBF7F0; --error-bg:#FDEAEA;
  --warn-bg:#FEF7E6;    --info-bg:#EDF4FD;
  --font-display:'Bebas Neue',sans-serif;
  --font-serif:'DM Serif Display',serif;
  --font-mono:'JetBrains Mono',monospace;
  --font-sans:'Instrument Sans',sans-serif;
}

@keyframes fadeUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn    { from{opacity:0} to{opacity:1} }
@keyframes slideRight{ from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
@keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin      { to{transform:rotate(360deg)} }
@keyframes stampIn   { 0%{transform:scale(2.2)rotate(-8deg);opacity:0} 65%{transform:scale(.92)rotate(2deg);opacity:1} 100%{transform:scale(1)rotate(-3deg);opacity:1} }
@keyframes inkReveal { from{clip-path:inset(0 100% 0 0)} to{clip-path:inset(0 0% 0 0)} }
@keyframes pulse     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.65)} }
@keyframes shimmer   { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

* { box-sizing: border-box; }
button { cursor: pointer; }
input, select, textarea { font-family: var(--font-sans); }
`;

// ══════════════════════════════════════════════════════════════════════
//  SHARED ATOMS
// ══════════════════════════════════════════════════════════════════════

const Tag = ({ children, color }) => (
  <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:4,
    color:color||"var(--muted)", textTransform:"uppercase", marginBottom:8 }}>{children}</div>
);

const Rule  = ({ my=20 }) => <div style={{ height:1, background:"var(--rule)", margin:`${my}px 0` }}/>;
const DRule = ({ my=28 }) => <div style={{ borderTop:"3px double var(--ink)", margin:`${my}px 0` }}/>;

const Pill = ({ s }) => {
  const m = {
    ACTIVE:   {bg:"#1E6641",c:"#F6F0E4"}, APPROVED: {bg:"#1E6641",c:"#F6F0E4"},
    SENT:     {bg:"#1E6641",c:"#F6F0E4"}, RESOLVED: {bg:"#1E6641",c:"#F6F0E4"},
    PENDING:  {bg:"#C8832A",c:"#1A1208"}, OPEN:     {bg:"#C8832A",c:"#1A1208"},
    HIGH:     {bg:"#B02020",c:"#F6F0E4"}, CANCELLED:{bg:"#B02020",c:"#F6F0E4"},
    INACTIVE: {bg:"#6B5535",c:"#F6F0E4"}, MEDIUM:   {bg:"#C8832A",c:"#1A1208"},
    LOW:      {bg:"#6B5535",c:"#F6F0E4"},
  };
  const p = m[(s||"").toUpperCase()] || {bg:"#6B5535",c:"#F6F0E4"};
  return <span style={{ background:p.bg, color:p.c, fontFamily:"var(--font-mono)",
    fontSize:9, fontWeight:700, letterSpacing:2, padding:"3px 10px",
    clipPath:"polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)",
    display:"inline-block", lineHeight:1.7 }}>{(s||"").toUpperCase()}</span>;
};

const Btn = ({ children, onClick, variant="primary", size="md", full=false, disabled=false }) => {
  const [h,setH] = useState(false);
  const pad = {sm:"7px 16px",md:"11px 24px",lg:"14px 32px"}[size]||"11px 24px";
  const fs  = {sm:11,md:13,lg:15}[size]||13;
  const s   = {
    primary:  {bg:h&&!disabled?"#2C1E0A":"var(--ink)",          c:"var(--amber-on-ink)", b:"none"},
    secondary:{bg:h&&!disabled?"var(--parchment)":"transparent", c:"var(--ink)",          b:"1.5px solid var(--ink)"},
    danger:   {bg:h&&!disabled?"#8A1818":"var(--red)",           c:"var(--cream-on-ink)", b:"none"},
    success:  {bg:h&&!disabled?"#155230":"var(--green)",         c:"var(--cream-on-ink)", b:"none"},
    ghost:    {bg:h&&!disabled?"var(--parchment)":"transparent", c:"var(--amber-text)",   b:"1.5px solid var(--rule)"},
    amber:    {bg:h&&!disabled?"#7A4206":"var(--amber-text)",    c:"var(--cream-on-ink)", b:"none"},
  }[variant]||{};
  return <button onClick={onClick} disabled={disabled}
    onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{ padding:pad, background:s.bg, color:s.c, border:s.b||"none",
      fontFamily:"var(--font-display)", fontSize:fs, letterSpacing:2,
      cursor:disabled?"not-allowed":"pointer", opacity:disabled?.45:1,
      width:full?"100%":"auto", display:"inline-flex", alignItems:"center",
      justifyContent:"center", gap:8, transition:"background .18s" }}>{children}</button>;
};

const Field = ({ label, type="text", value, onChange, placeholder, error, rows=3, hint }) => {
  const [foc,setFoc] = useState(false);
  return (
    <div style={{ marginBottom:16 }}>
      {label&&<div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:3,
        color:"var(--muted)", textTransform:"uppercase", marginBottom:7 }}>{label}</div>}
      {type==="textarea"
        ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
            onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}
            style={{ width:"100%", padding:"11px 14px", border:`1.5px solid ${error?"var(--red)":foc?"var(--amber)":"var(--rule)"}`,
              background:foc?"var(--surface)":"var(--cream)", fontFamily:"var(--font-sans)",
              fontSize:14, color:"var(--ink)", outline:"none", resize:"vertical", lineHeight:1.6 }}/>
        : <input type={type} value={value} onChange={onChange} placeholder={placeholder}
            onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}
            style={{ width:"100%", padding:"11px 14px", border:`1.5px solid ${error?"var(--red)":foc?"var(--amber)":"var(--rule)"}`,
              background:foc?"var(--surface)":"var(--cream)", fontFamily:"var(--font-sans)",
              fontSize:14, color:"var(--ink)", outline:"none" }}/>
      }
      {error&&<div style={{ fontFamily:"var(--font-sans)", fontSize:11, color:"var(--red)", marginTop:4 }}>{error}</div>}
      {hint&&!error&&<div style={{ fontFamily:"var(--font-sans)", fontSize:11, color:"var(--muted)", marginTop:4 }}>{hint}</div>}
    </div>
  );
};

const Spinner = ({size=18}) => (
  <div style={{ width:size, height:size, border:"2px solid rgba(200,131,42,.25)",
    borderTop:"2px solid var(--amber)", borderRadius:"50%",
    animation:"spin .7s linear infinite", display:"inline-block" }}/>
);

const Toggle = ({ on, onChange }) => (
  <button onClick={()=>onChange(!on)} style={{ width:44, height:24, borderRadius:12,
    background:on?"var(--green)":"var(--rule)", border:"none", cursor:"pointer",
    position:"relative", transition:"background .2s", flexShrink:0 }}>
    <div style={{ width:18, height:18, borderRadius:"50%", background:"white",
      position:"absolute", top:3, left:on?23:3, transition:"left .2s",
      boxShadow:"0 1px 3px rgba(0,0,0,.2)" }}/>
  </button>
);

// ── Toast ──────────────────────────────────────────────────────────────
function useToast() {
  const [ts,setTs] = useState([]);
  const add = useCallback((msg,type="info")=>{
    const id=Date.now(); setTs(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setTs(t=>t.filter(x=>x.id!==id)), type==="error"?6000:3500);
  },[]);
  const COLS = {
    success:{bg:"var(--success-bg)",b:"var(--green)",     t:"var(--green)",     i:"✓"},
    error:  {bg:"var(--error-bg)",  b:"var(--red)",       t:"var(--red)",       i:"✕"},
    info:   {bg:"var(--surface)",   b:"var(--ink)",       t:"var(--ink)",       i:"◆"},
    warn:   {bg:"var(--warn-bg)",   b:"var(--amber-text)",t:"var(--amber-text)",i:"⚠"},
  };
  const Toaster = () => (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, display:"flex", flexDirection:"column", gap:8 }}>
      {ts.map(t=>{ const c=COLS[t.type]||COLS.info; return(
        <div key={t.id} style={{ background:c.bg, border:`2px solid ${c.b}`, padding:"11px 16px",
          minWidth:280, display:"flex", gap:10, alignItems:"center", animation:"slideDown .3s ease",
          boxShadow:"0 4px 20px rgba(26,18,8,.12)" }}>
          <span style={{ fontFamily:"var(--font-display)", fontSize:18, color:c.t }}>{c.i}</span>
          <span style={{ fontFamily:"var(--font-sans)", fontSize:13, color:c.t }}>{t.msg}</span>
        </div>
      );})}
    </div>
  );
  return { success:m=>add(m,"success"), error:m=>add(m,"error"),
           info:m=>add(m,"info"), warn:m=>add(m,"warn"), Toaster };
}

// ══════════════════════════════════════════════════════════════════════
//  MOCK DATA
// ══════════════════════════════════════════════════════════════════════

const MOCK_STUDENTS = [
  { id:"CS21B042", name:"Aryan Sharma",  email:"aryan@college.edu",  dept:"CS",  passCount:3, status:"ACTIVE"   },
  { id:"ME20B018", name:"Priya Patel",   email:"priya@college.edu",  dept:"ME",  passCount:1, status:"ACTIVE"   },
  { id:"EC22B091", name:"Rahul Kumar",   email:"rahul@college.edu",  dept:"EC",  passCount:2, status:"ACTIVE"   },
  { id:"IT21B055", name:"Sneha Iyer",    email:"sneha@college.edu",  dept:"IT",  passCount:0, status:"INACTIVE" },
];

const INITIAL_QUERIES = [
  { id:"QRY-001", student:"Aryan Sharma", email:"aryan@college.edu", subject:"Payment deducted but pass not issued",   message:"Made payment via UPI on 13 Mar but pass not reflecting in my account. Razorpay ref: RPY8812.", date:"14 Mar 2024", status:"OPEN",     priority:"HIGH",   response:"" },
  { id:"QRY-002", student:"Priya Patel",  email:"priya@college.edu", subject:"Route change request — Alpha to Beta",   message:"I have moved to new hostel near Railway Station. Need to switch route for remaining 2 months.", date:"13 Mar 2024", status:"RESOLVED", priority:"MEDIUM", response:"Route change processed. New pass issued." },
  { id:"QRY-003", student:"Rahul Kumar",  email:"rahul@college.edu", subject:"Bus BUS-02 consistently late by 20 min", message:"Route Beta bus is late every day by 15–20 minutes. Please check driver assignment.", date:"12 Mar 2024", status:"OPEN",     priority:"HIGH",   response:"" },
  { id:"QRY-004", student:"Sneha Iyer",   email:"sneha@college.edu", subject:"Cannot apply for new pass",              message:"Getting error 500 when clicking Apply Pass. Tried Chrome and Firefox.", date:"10 Mar 2024", status:"OPEN",     priority:"LOW",    response:"" },
];

const INITIAL_DISCOUNTS = [
  { id:1, name:"EARLY BIRD",       code:"EARLY10", pct:10, students:["CS21B042","ME20B018"], validUntil:"31 Mar 2024", active:true,  usageCount:14 },
  { id:2, name:"MERIT SCHOLARSHIP",code:"MERIT15", pct:15, students:["EC22B091"],            validUntil:"30 Jun 2024", active:true,  usageCount:3  },
  { id:3, name:"FIRST SEMESTER",   code:"FIRST20", pct:20, students:["IT21B055","CS21B042"], validUntil:"15 Mar 2024", active:false, usageCount:28 },
];

const STATS = {
  todayPasses:24, weekPasses:168, monthPasses:672,
  revenue:"₹4,20,000", pendingApps:12, activeStudents:243,
  scanSuccessRate:"97.2%", avgOccupancy:"68%",
};

// ══════════════════════════════════════════════════════════════════════
//  SECTION 01 — OVERVIEW
// ══════════════════════════════════════════════════════════════════════
function SectionOverview({ emailLog }) {
  const ACTIVITY = [
    { time:"09:14", action:"Pass approved",   detail:"BPP·2024·001567 — Priya Patel",    type:"success" },
    { time:"09:02", action:"Payment received", detail:"₹1,215 — Aryan Sharma · Quarterly",type:"success" },
    { time:"08:55", action:"Query raised",     detail:"QRY-004 — Sneha Iyer",              type:"warn"    },
    { time:"08:41", action:"Pass rejected",    detail:"BPP·2024·001563 — Amit Singh",      type:"error"   },
    { time:"08:30", action:"New registration", detail:"Vikram Nair — CS22B099",             type:"info"    },
    { time:"08:12", action:"Route B delayed",  detail:"BUS-02 — 14 min late at IT Hub",    type:"warn"    },
    { time:"07:58", action:"Scan anomaly",     detail:"Invalid QR — East Campus stop",     type:"error"   },
  ];

  const DOT = { success:"var(--green)", warn:"var(--amber-text)", error:"var(--red)", info:"var(--muted)" };

  return (
    <div style={{ animation:"fadeUp .4s ease" }}>

      {/* Big stats strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
        borderTop:"3px solid var(--ink)", borderBottom:"1px solid var(--rule)", marginBottom:32 }}>
        {[
          { n:STATS.todayPasses,   l:"PASSES TODAY",    c:"var(--amber-text)" },
          { n:STATS.weekPasses,    l:"THIS WEEK",        c:"var(--ink)"        },
          { n:STATS.monthPasses,   l:"THIS MONTH",       c:"var(--ink)"        },
          { n:STATS.revenue,       l:"TOTAL REVENUE",    c:"var(--green)"      },
        ].map((s,i) => (
          <div key={s.l} style={{ padding:"24px 28px", textAlign:"center",
            borderRight:i<3?"1px solid var(--rule)":"none",
            animation:`fadeUp .4s ease ${i*.08}s both` }}>
            <div style={{ fontFamily:"var(--font-display)", fontSize:44, letterSpacing:1,
              color:s.c, lineHeight:1, animation:"inkReveal .7s ease both",
              animationDelay:`${i*.1+.2}s` }}>{s.n}</div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:4,
              color:"var(--muted)", marginTop:8 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Secondary stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:32 }}>
        {[
          { n:STATS.pendingApps,      l:"PENDING APPS",    bg:"var(--warn-bg)",    border:"var(--amber-text)", c:"var(--amber-text)" },
          { n:STATS.activeStudents,   l:"ACTIVE STUDENTS", bg:"var(--success-bg)", border:"var(--green)",      c:"var(--green)"      },
          { n:STATS.scanSuccessRate,  l:"SCAN SUCCESS",    bg:"var(--surface)",    border:"var(--ink)",        c:"var(--ink)"        },
          { n:STATS.avgOccupancy,     l:"AVG OCCUPANCY",   bg:"var(--surface)",    border:"var(--rule)",       c:"var(--muted)"      },
        ].map((s,i) => (
          <div key={s.l} style={{ padding:"18px 20px", background:s.bg,
            border:`1.5px solid ${s.border}`, animation:`fadeUp .4s ease ${i*.08+.3}s both` }}>
            <div style={{ fontFamily:"var(--font-display)", fontSize:32, letterSpacing:1, color:s.c, lineHeight:1 }}>{s.n}</div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:3, color:"var(--muted)", marginTop:6 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Two-column: Activity feed + Email log */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:24 }}>

        {/* Activity feed */}
        <div style={{ border:"1.5px solid var(--rule)", background:"var(--surface)" }}>
          {/* Header */}
          <div style={{ background:"var(--ink)", padding:"14px 20px", display:"flex",
            justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:4, color:"var(--muted-on-ink)" }}>LIVE FEED</div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:18, letterSpacing:2, color:"var(--amber-on-ink)" }}>ACTIVITY LOG</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--green-on-ink)",
                animation:"pulse 2s ease-in-out infinite" }}/>
              <span style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:3, color:"var(--muted-on-ink)" }}>LIVE</span>
            </div>
          </div>
          {/* Events */}
          {ACTIVITY.map((a,i) => (
            <div key={i} style={{ display:"grid", gridTemplateColumns:"48px 4px 1fr",
              gap:"0 14px", padding:"13px 20px",
              borderBottom:i<ACTIVITY.length-1?"1px solid var(--rule)":"none",
              background:i%2===0?"transparent":"var(--cream)",
              animation:`fadeUp .3s ease ${i*.05}s both` }}>
              {/* Time */}
              <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:1,
                color:"var(--muted)", alignSelf:"flex-start", paddingTop:2 }}>{a.time}</div>
              {/* Colour bar */}
              <div style={{ background:DOT[a.type], alignSelf:"stretch", minHeight:36 }}/>
              {/* Content */}
              <div>
                <div style={{ fontFamily:"var(--font-sans)", fontSize:13, color:"var(--ink)", fontWeight:500 }}>{a.action}</div>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:1, color:"var(--muted)", marginTop:3 }}>{a.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Email dispatch log */}
        <div style={{ border:"1.5px solid var(--rule)", background:"var(--surface)", display:"flex", flexDirection:"column" }}>
          <div style={{ background:"var(--parchment)", padding:"14px 20px", borderBottom:"2px solid var(--ink)" }}>
            <Tag>Dispatch Office</Tag>
            <div style={{ fontFamily:"var(--font-display)", fontSize:18, letterSpacing:2, color:"var(--ink)" }}>EMAIL LOG</div>
          </div>
          <div style={{ flex:1, overflowY:"auto", maxHeight:340 }}>
            {emailLog.length === 0 ? (
              <div style={{ padding:"40px 20px", textAlign:"center" }}>
                <div style={{ fontFamily:"var(--font-serif)", fontSize:15, color:"var(--muted)", fontStyle:"italic" }}>No dispatches yet.</div>
              </div>
            ) : emailLog.map((e,i) => (
              <div key={i} style={{ padding:"12px 20px", borderBottom:"1px solid var(--rule)",
                display:"flex", gap:12, alignItems:"flex-start" }}>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:1,
                  color:"var(--amber-text)", flexShrink:0, paddingTop:2 }}>#{String(i+1).padStart(3,"0")}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"var(--font-sans)", fontSize:12, color:"var(--ink)", fontWeight:500 }}>{e.type}</div>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:1, color:"var(--muted)", marginTop:2 }}>{e.recipient}</div>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:1, color:"var(--muted)", marginTop:2 }}>{e.sentAt}</div>
                </div>
                <Pill s={e.status}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  SECTION 02 — EMAIL NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════
function SectionEmails({ emailLog, setEmailLog, toast }) {
  const [sending, setSending]   = useState(null); // null | "stats" | student-id
  const [schedType, setSchedType] = useState("daily");
  const [customRecip, setCustomRecip] = useState("");

  const STATS_PREVIEW = {
    daily:   { passes:24,  revenue:"₹10,800",  title:"DAILY REPORT" },
    weekly:  { passes:168, revenue:"₹75,600",  title:"WEEKLY REPORT" },
    monthly: { passes:672, revenue:"₹3,02,400",title:"MONTHLY REPORT" },
  };
  const preview = STATS_PREVIEW[schedType];

  const dispatch = async (type, to, subject, body) => {
    setSending(type);
    await new Promise(r=>setTimeout(r,900));
    setEmailLog(e=>[{
      id:e.length+1, type, recipient:to, subject, body,
      sentAt:new Date().toLocaleString("en-IN",{dateStyle:"short",timeStyle:"short"}),
      status:"SENT",
    },...e]);
    setSending(null);
    toast.success(`Email dispatched to ${to}`);
  };

  const sendStats = () => dispatch(
    `${schedType.charAt(0).toUpperCase()+schedType.slice(1)} Stats`,
    customRecip || "admin@college.edu",
    `BusPassPro ${preview.title}: ${preview.passes} passes`,
    `Passes: ${preview.passes} | Revenue: ${preview.revenue}`
  );

  return (
    <div style={{ animation:"fadeUp .4s ease" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:28, alignItems:"start" }}>

        {/* Left — compose */}
        <div>
          {/* Stats notification */}
          <div style={{ border:"1.5px solid var(--rule)", background:"var(--surface)", marginBottom:20 }}>
            {/* Section label */}
            <div style={{ background:"var(--ink)", padding:"12px 20px" }}>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:4, color:"var(--muted-on-ink)" }}>TYPE A</div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:18, letterSpacing:2, color:"var(--amber-on-ink)" }}>STATS NOTIFICATIONS</div>
            </div>

            <div style={{ padding:"22px 24px" }}>
              {/* Period selector */}
              <Tag>Report Period</Tag>
              <div style={{ display:"flex", gap:0, border:"1.5px solid var(--ink)", marginBottom:20, width:"fit-content" }}>
                {["daily","weekly","monthly"].map(p=>(
                  <button key={p} onClick={()=>setSchedType(p)}
                    style={{ padding:"9px 22px", background:schedType===p?"var(--ink)":"transparent",
                      color:schedType===p?"var(--amber-on-ink)":"var(--muted)",
                      border:"none", borderRight:p!=="monthly"?"1px solid var(--ink)":"none",
                      fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:2,
                      cursor:"pointer", transition:"all .18s", textTransform:"uppercase" }}>{p}</button>
                ))}
              </div>

              {/* Preview card — looks like a printed report snippet */}
              <div style={{ border:"2px solid var(--ink)", background:"var(--cream)", marginBottom:20, overflow:"hidden" }}>
                <div style={{ background:"var(--amber)", padding:"8px 16px" }}>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:13, letterSpacing:3, color:"var(--ink)" }}>
                    EMAIL PREVIEW — {preview.title}
                  </div>
                </div>
                <div style={{ padding:"16px 20px" }}>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:2, color:"var(--muted)", marginBottom:10 }}>
                    TO: {customRecip || "admin@college.edu"}
                  </div>
                  {/* Ruled lines like printed paper */}
                  {[
                    ["PASSES ISSUED",    String(preview.passes)],
                    ["REVENUE",          preview.revenue],
                    ["PENDING APPS",     "12"],
                    ["NEW STUDENTS",     "8"],
                    ["SCAN SUCCESS RATE","97.2%"],
                  ].map(([l,v])=>(
                    <div key={l} style={{ display:"flex", justifyContent:"space-between",
                      padding:"6px 0", borderBottom:"1px solid var(--rule)" }}>
                      <span style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:2, color:"var(--muted)" }}>{l}</span>
                      <span style={{ fontFamily:"var(--font-display)", fontSize:16, letterSpacing:1, color:"var(--ink)" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Field label="Recipient Email (optional)" value={customRecip}
                onChange={e=>setCustomRecip(e.target.value)} placeholder="admin@college.edu"
                hint="Leave blank to send to default admin address" />

              <Btn variant="primary" size="md" onClick={sendStats} disabled={sending==="stats"}>
                {sending==="stats" ? <><Spinner size={16}/> DISPATCHING…</> : "DISPATCH STATS EMAIL →"}
              </Btn>
            </div>
          </div>

          {/* Pass cancellation emails */}
          <div style={{ border:"1.5px solid var(--rule)", background:"var(--surface)" }}>
            <div style={{ background:"var(--red)", padding:"12px 20px" }}>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:4, color:"rgba(255,255,255,.6)" }}>TYPE B</div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:18, letterSpacing:2, color:"white" }}>CANCELLATION NOTICES</div>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <div style={{ fontFamily:"var(--font-sans)", fontSize:12, color:"var(--muted)", lineHeight:1.65, marginBottom:18 }}>
                Sends a formal cancellation confirmation email to the student with refund timeline.
              </div>
              {/* Student rows */}
              {MOCK_STUDENTS.map((s,i)=>(
                <div key={s.id} style={{ display:"grid", gridTemplateColumns:"1fr auto auto",
                  gap:14, padding:"13px 0", borderBottom:i<MOCK_STUDENTS.length-1?"1px solid var(--rule)":"none",
                  alignItems:"center" }}>
                  <div>
                    <div style={{ fontFamily:"var(--font-sans)", fontSize:13, color:"var(--ink)", fontWeight:500 }}>{s.name}</div>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:1, color:"var(--muted)", marginTop:2 }}>{s.email}</div>
                  </div>
                  <Pill s={s.status}/>
                  <Btn variant="danger" size="sm"
                    disabled={sending===s.id}
                    onClick={()=>dispatch(
                      "Pass Cancellation", s.email,
                      `Pass Cancelled — ${s.name}`,
                      `Your pass has been cancelled. Refund within 5 business days.`
                    )}>
                    {sending===s.id ? <Spinner size={13}/> : "CANCEL & NOTIFY"}
                  </Btn>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — dispatch ledger */}
        <div style={{ border:"1.5px solid var(--ink)", background:"var(--surface)", position:"sticky", top:80 }}>
          {/* Ledger header */}
          <div style={{ padding:"14px 18px", borderBottom:"3px double var(--ink)", background:"var(--parchment)" }}>
            <Tag>Post Office</Tag>
            <div style={{ fontFamily:"var(--font-display)", fontSize:22, letterSpacing:2, color:"var(--ink)" }}>DISPATCH LEDGER</div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:3, color:"var(--muted)", marginTop:4 }}>
              {emailLog.length} EMAILS SENT THIS SESSION
            </div>
          </div>
          {/* Ledger rows */}
          <div style={{ maxHeight:480, overflowY:"auto" }}>
            {emailLog.length===0 ? (
              <div style={{ padding:"40px 18px", textAlign:"center" }}>
                <div style={{ fontFamily:"var(--font-serif)", fontSize:14, color:"var(--muted)", fontStyle:"italic", lineHeight:1.7 }}>
                  No dispatches yet.<br/>Send an email above.
                </div>
              </div>
            ) : emailLog.map((e,i)=>(
              <div key={i} style={{ padding:"13px 18px",
                borderBottom:i<emailLog.length-1?"1px solid var(--rule)":"none",
                background:i%2===0?"transparent":"var(--cream)",
                animation:"slideDown .3s ease" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:2, color:"var(--amber-text)" }}>
                    {String(emailLog.length-i).padStart(3,"0")}
                  </div>
                  <Pill s={e.status}/>
                </div>
                <div style={{ fontFamily:"var(--font-sans)", fontSize:12, color:"var(--ink)", fontWeight:500, marginBottom:3 }}>{e.type}</div>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:1, color:"var(--muted)" }}>{e.recipient}</div>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:1, color:"var(--muted)", marginTop:2 }}>{e.sentAt}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  SECTION 03 — DISCOUNTS
// ══════════════════════════════════════════════════════════════════════
function SectionDiscounts({ toast }) {
  const [discounts, setDiscounts] = useState(INITIAL_DISCOUNTS);
  const [form, setForm] = useState({ name:"", code:"", pct:"", students:"", validUntil:"" });
  const [errors, setErrors] = useState({});
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Required";
    if (!form.code.trim())    e.code    = "Required";
    if (!form.pct || isNaN(form.pct) || +form.pct<=0 || +form.pct>100) e.pct = "Enter 1–100";
    if (!form.students.trim()) e.students = "Enter at least one student ID";
    setErrors(e); return Object.keys(e).length===0;
  };

  const add = () => {
    if (!validate()) return;
    const ids = form.students.split(",").map(s=>s.trim()).filter(Boolean);
    setDiscounts(d=>[{ id:Date.now(), name:form.name.toUpperCase(), code:form.code.toUpperCase(),
      pct:+form.pct, students:ids, validUntil:form.validUntil||"No expiry",
      active:true, usageCount:0 }, ...d]);
    setForm({ name:"", code:"", pct:"", students:"", validUntil:"" });
    toast.success("Discount voucher created!");
  };

  const toggle = id => { setDiscounts(d=>d.map(x=>x.id===id?{...x,active:!x.active}:x)); toast.info("Status updated."); };
  const del    = id => { setDiscounts(d=>d.filter(x=>x.id!==id)); toast.warn("Voucher deleted."); };

  return (
    <div style={{ animation:"fadeUp .4s ease" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:28, alignItems:"start" }}>

        {/* Voucher board */}
        <div>
          <Tag>Active Vouchers</Tag>
          <div style={{ fontFamily:"var(--font-serif)", fontSize:22, color:"var(--ink)", marginBottom:20 }}>
            Discount Board
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
            {discounts.map((d,i)=>(
              <div key={d.id} style={{ animation:`fadeUp .3s ease ${i*.07}s both` }}>
                {/* Voucher card — perforated feel */}
                <div style={{ display:"flex", border:`2px solid ${d.active?"var(--ink)":"var(--rule)"}`,
                  opacity:d.active?1:.6, transition:"opacity .2s" }}>

                  {/* Left: big discount number */}
                  <div style={{ width:120, flexShrink:0,
                    background:d.active?"var(--ink)":"var(--parchment)",
                    display:"flex", flexDirection:"column", alignItems:"center",
                    justifyContent:"center", padding:"20px 12px", gap:4 }}>
                    <div style={{ fontFamily:"var(--font-display)", fontSize:42, letterSpacing:1, lineHeight:1,
                      color:d.active?"var(--amber-on-ink)":"var(--muted)" }}>{d.pct}%</div>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:3,
                      color:d.active?"var(--muted-on-ink)":"var(--muted)" }}>DISCOUNT</div>
                  </div>

                  {/* Perforation edge */}
                  <div style={{ width:1, display:"flex", flexDirection:"column",
                    justifyContent:"space-between", padding:"10px 0",
                    borderLeft:`2px dashed ${d.active?"var(--rule)":"var(--parchment)"}` }}>
                    {Array.from({length:6}).map((_,j)=>(
                      <div key={j} style={{ width:8, height:8, borderRadius:"50%",
                        background:d.active?"var(--cream)":"var(--parchment)", marginLeft:-4 }}/>
                    ))}
                  </div>

                  {/* Right: details */}
                  <div style={{ flex:1, padding:"18px 20px", background:d.active?"var(--surface)":"var(--parchment)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                      <div>
                        <div style={{ fontFamily:"var(--font-display)", fontSize:20, letterSpacing:2, color:"var(--ink)", marginBottom:2 }}>{d.name}</div>
                        <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:3,
                          color:"var(--amber-text)", background:"var(--amber-light)",
                          padding:"2px 10px", display:"inline-block" }}>{d.code}</div>
                      </div>
                      <Pill s={d.active?"ACTIVE":"INACTIVE"}/>
                    </div>

                    <div style={{ display:"flex", gap:20, marginBottom:12 }}>
                      {[
                        ["STUDENTS", `${d.students.length} assigned`],
                        ["USED",     `${d.usageCount} times`],
                        ["EXPIRES",  d.validUntil],
                      ].map(([l,v])=>(
                        <div key={l}>
                          <div style={{ fontFamily:"var(--font-mono)", fontSize:6, letterSpacing:3, color:"var(--muted)" }}>{l}</div>
                          <div style={{ fontFamily:"var(--font-sans)", fontSize:12, color:"var(--ink)", fontWeight:500 }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Student IDs */}
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
                      {d.students.map(sid=>(
                        <span key={sid} style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:1,
                          color:"var(--amber-text)", background:"var(--parchment)",
                          padding:"2px 8px", border:"1px solid var(--rule)" }}>{sid}</span>
                      ))}
                    </div>

                    <div style={{ display:"flex", gap:8 }}>
                      <Btn variant={d.active?"ghost":"success"} size="sm" onClick={()=>toggle(d.id)}>
                        {d.active?"DEACTIVATE":"REACTIVATE"}
                      </Btn>
                      <Btn variant="danger" size="sm" onClick={()=>del(d.id)}>DELETE</Btn>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create form */}
        <div style={{ border:"1.5px solid var(--ink)", position:"sticky", top:80 }}>
          <div style={{ background:"var(--amber)", padding:"14px 20px" }}>
            <Tag color="var(--ink)">New Voucher</Tag>
            <div style={{ fontFamily:"var(--font-display)", fontSize:22, letterSpacing:2, color:"var(--ink)" }}>CREATE DISCOUNT</div>
          </div>
          <div style={{ padding:"22px 20px", background:"var(--surface)" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
              <Field label="Discount Name" value={form.name} onChange={e=>set("name",e.target.value)}
                placeholder="Early Bird" error={errors.name}/>
              <Field label="Voucher Code" value={form.code} onChange={e=>set("code",e.target.value.toUpperCase())}
                placeholder="EARLY10" error={errors.code}/>
            </div>
            <Field label="Discount %" type="number" value={form.pct} onChange={e=>set("pct",e.target.value)}
              placeholder="10" hint="Enter percentage (1–100)" error={errors.pct}/>
            <Field label="Student IDs (comma-separated)" value={form.students} onChange={e=>set("students",e.target.value)}
              placeholder="CS21B042, ME20B018" error={errors.students}/>
            <Field label="Valid Until (optional)" type="date" value={form.validUntil} onChange={e=>set("validUntil",e.target.value)}/>

            {/* Live preview mini-voucher */}
            {(form.name||form.pct) && (
              <div style={{ border:"2px dashed var(--amber)", padding:"12px 14px", marginBottom:16,
                background:"var(--warn-bg)", display:"flex", gap:16, alignItems:"center" }}>
                <div style={{ fontFamily:"var(--font-display)", fontSize:32, letterSpacing:1,
                  color:"var(--amber-text)", lineHeight:1 }}>{form.pct||"?"}%</div>
                <div>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:14, letterSpacing:2, color:"var(--ink)" }}>
                    {form.name||"UNNAMED"}
                  </div>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:2, color:"var(--muted)" }}>PREVIEW</div>
                </div>
              </div>
            )}

            <Btn variant="primary" full size="md" onClick={add}>CREATE VOUCHER →</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  SECTION 04 — SUPPORT (queries)
// ══════════════════════════════════════════════════════════════════════
function SectionSupport({ toast }) {
  const [queries, setQueries] = useState(INITIAL_QUERIES);
  const [active,  setActive]  = useState(null);
  const [reply,   setReply]   = useState("");
  const [filter,  setFilter]  = useState("ALL");
  const [sending, setSending] = useState(false);

  const visible = filter==="ALL" ? queries : queries.filter(q=>q.status===filter);
  const openCount = queries.filter(q=>q.status==="OPEN").length;

  const resolve = async () => {
    if (!reply.trim()) { toast.warn("Please write a response."); return; }
    setSending(true);
    await new Promise(r=>setTimeout(r,800));
    setQueries(q=>q.map(x=>x.id===active?{...x,status:"RESOLVED",response:reply}:x));
    setSending(false);
    toast.success("Response sent — query resolved.");
    setActive(null); setReply("");
  };

  const PRIORITY_COLOR = { HIGH:"var(--red)", MEDIUM:"var(--amber-text)", LOW:"var(--muted)" };
  const sel = queries.find(q=>q.id===active);

  return (
    <div style={{ animation:"fadeUp .4s ease" }}>
      {/* Stats + filters */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,auto) 1fr", gap:12,
        alignItems:"center", marginBottom:24, borderBottom:"2px solid var(--ink)", paddingBottom:16 }}>
        {[["OPEN",openCount,"var(--red)"],["RESOLVED",queries.filter(q=>q.status==="RESOLVED").length,"var(--green)"],["TOTAL",queries.length,"var(--ink)"]].map(([l,n,c])=>(
          <div key={l} style={{ display:"flex", gap:10, alignItems:"baseline", paddingRight:20, borderRight:"1px solid var(--rule)" }}>
            <div style={{ fontFamily:"var(--font-display)", fontSize:32, letterSpacing:1, color:c, lineHeight:1 }}>{n}</div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:3, color:"var(--muted)" }}>{l}</div>
          </div>
        ))}
        <div style={{ display:"flex", gap:4, justifyContent:"flex-end" }}>
          {["ALL","OPEN","RESOLVED"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{ padding:"7px 14px", background:filter===f?"var(--ink)":"transparent",
                color:filter===f?"var(--amber-on-ink)":"var(--muted)",
                border:"1.5px solid var(--ink)", fontFamily:"var(--font-mono)",
                fontSize:7, letterSpacing:2, cursor:"pointer", transition:"all .18s" }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:24, alignItems:"start" }}>

        {/* Query list — filed complaint forms */}
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {visible.map((q,i)=>{
            const isActive = active===q.id;
            const resolved = q.status==="RESOLVED";
            return(
              <div key={q.id} onClick={()=>{ setActive(isActive?null:q.id); setReply(q.response||""); }}
                style={{ border:`2px solid ${isActive?"var(--amber)":resolved?"var(--green)":PRIORITY_COLOR[q.priority]}`,
                  background:isActive?"var(--parchment)":resolved?"var(--success-bg)":q.priority==="HIGH"?"var(--error-bg)":"var(--surface)",
                  cursor:"pointer", transition:"all .18s",
                  animation:`fadeUp .3s ease ${i*.07}s both`,
                  borderLeft:`6px solid ${resolved?"var(--green)":PRIORITY_COLOR[q.priority]}` }}>

                {/* Form header bar */}
                <div style={{ padding:"10px 16px", background:resolved?"rgba(30,102,65,.08)":"rgba(26,18,8,.04)",
                  borderBottom:"1px solid rgba(26,18,8,.1)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:3,
                    color:resolved?"var(--green)":"var(--amber-text)" }}>{q.id}</div>
                  <div style={{ display:"flex", gap:6 }}>
                    <Pill s={q.priority}/>
                    <Pill s={q.status}/>
                  </div>
                </div>

                <div style={{ padding:"14px 16px" }}>
                  <div style={{ fontFamily:"var(--font-sans)", fontSize:14, color:"var(--ink)",
                    fontWeight:600, marginBottom:4 }}>{q.subject}</div>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:2,
                    color:"var(--muted)", marginBottom:8 }}>
                    {q.student} · {q.email} · {q.date}
                  </div>
                  <div style={{ fontFamily:"var(--font-sans)", fontSize:12, color:"var(--ink-mid)",
                    lineHeight:1.65, background:"var(--cream)", padding:"10px 12px",
                    borderLeft:"3px solid var(--amber)" }}>{q.message}</div>

                  {resolved && q.response && (
                    <div style={{ marginTop:10, padding:"10px 12px",
                      background:"var(--success-bg)", borderLeft:"3px solid var(--green)" }}>
                      <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:3,
                        color:"var(--green)", marginBottom:4 }}>ADMIN RESPONSE</div>
                      <div style={{ fontFamily:"var(--font-sans)", fontSize:12, color:"var(--ink)", lineHeight:1.6 }}>{q.response}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Response composer */}
        <div style={{ position:"sticky", top:80, border:"1.5px solid var(--ink)", background:"var(--surface)" }}>
          {!sel ? (
            <div style={{ padding:"48px 24px", textAlign:"center" }}>
              <div style={{ fontFamily:"var(--font-display)", fontSize:28, letterSpacing:2,
                color:"var(--muted)", marginBottom:10 }}>SELECT A QUERY</div>
              <div style={{ fontFamily:"var(--font-serif)", fontSize:14, color:"var(--muted)", fontStyle:"italic", lineHeight:1.7 }}>
                Click any complaint card on the left to view and respond.
              </div>
              {openCount>0&&(
                <div style={{ marginTop:20, padding:"12px 14px", background:"var(--warn-bg)",
                  border:"1.5px solid var(--amber-text)" }}>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:22, color:"var(--amber-text)", letterSpacing:2 }}>{openCount} OPEN</div>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:3, color:"var(--muted)" }}>QUERIES AWAITING RESPONSE</div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Composer header */}
              <div style={{ background:"var(--ink)", padding:"14px 20px" }}>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:4, color:"var(--muted-on-ink)", marginBottom:3 }}>RESPONDING TO</div>
                <div style={{ fontFamily:"var(--font-display)", fontSize:16, letterSpacing:2, color:"var(--amber-on-ink)", lineHeight:1.2 }}>{sel.id}</div>
                <div style={{ fontFamily:"var(--font-sans)", fontSize:11, color:"var(--muted-on-ink)", marginTop:4 }}>{sel.student}</div>
              </div>

              <div style={{ padding:"20px" }}>
                {/* Context */}
                <div style={{ padding:"10px 12px", background:"var(--parchment)", marginBottom:16,
                  border:"1px solid var(--rule)", fontFamily:"var(--font-sans)",
                  fontSize:12, color:"var(--muted)", lineHeight:1.6, fontStyle:"italic" }}>
                  "{sel.message}"
                </div>

                <Field label="Your Response" type="textarea" rows={6} value={reply}
                  onChange={e=>setReply(e.target.value)}
                  placeholder="Write a clear, helpful response…"/>

                <div style={{ display:"flex", gap:8 }}>
                  {sel.status==="OPEN" ? (
                    <Btn variant="success" full size="md" onClick={resolve} disabled={sending}>
                      {sending ? <><Spinner size={16}/> SENDING…</> : "SEND & RESOLVE →"}
                    </Btn>
                  ) : (
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:3,
                      color:"var(--green)", padding:"11px 0" }}>✓ ALREADY RESOLVED</div>
                  )}
                  <Btn variant="ghost" size="sm" onClick={()=>{setActive(null);setReply("");}}>CLOSE</Btn>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  SECTION 05 — REPORTS
// ══════════════════════════════════════════════════════════════════════
function SectionReports({ toast }) {
  const [period, setPeriod] = useState("monthly");

  const DATA = {
    daily:   { passes:24,  revenue:"₹10,800",   newStudents:3,  topRoute:"Route Alpha", scans:312, pending:4  },
    weekly:  { passes:168, revenue:"₹75,600",   newStudents:18, topRoute:"Route Alpha", scans:2184,pending:12 },
    monthly: { passes:672, revenue:"₹3,02,400", newStudents:67, topRoute:"Route Alpha", scans:8736,pending:12 },
  };
  const d = DATA[period];

  const CHART_DATA = [
    {l:"MON",v:168},{l:"TUE",v:210},{l:"WED",v:195},
    {l:"THU",v:220},{l:"FRI",v:198},{l:"SAT",v:88},{l:"SUN",v:42},
  ];
  const maxV = Math.max(...CHART_DATA.map(c=>c.v));

  const download = () => {
    const rows = [
      ["Metric","Value"],
      ["Period",period],
      ["Passes Issued",d.passes],
      ["Revenue",d.revenue],
      ["New Students",d.newStudents],
      ["Top Route",d.topRoute],
      ["Total Scans",d.scans],
      ["Pending Applications",d.pending],
      ["Generated At",new Date().toLocaleString("en-IN")],
    ];
    const csv = rows.map(r=>r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download = `buspasspro-${period}-report.csv`;
    a.click();
    toast.success(`${period.charAt(0).toUpperCase()+period.slice(1)} report downloaded.`);
  };

  return (
    <div style={{ animation:"fadeUp .4s ease" }}>

      {/* Period selector + download */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div style={{ display:"flex", border:"1.5px solid var(--ink)" }}>
          {["daily","weekly","monthly"].map(p=>(
            <button key={p} onClick={()=>setPeriod(p)}
              style={{ padding:"10px 24px", background:period===p?"var(--ink)":"transparent",
                color:period===p?"var(--amber-on-ink)":"var(--muted)",
                border:"none", borderRight:p!=="monthly"?"1px solid var(--ink)":"none",
                fontFamily:"var(--font-display)", fontSize:14, letterSpacing:2,
                cursor:"pointer", transition:"all .18s", textTransform:"uppercase" }}>{p}</button>
          ))}
        </div>
        <Btn variant="primary" size="md" onClick={download}>⬇ DOWNLOAD CSV →</Btn>
      </div>

      {/* Newspaper brief layout */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:24 }}>

        {/* Left: big print brief */}
        <div>
          {/* Masthead */}
          <div style={{ borderTop:"4px solid var(--ink)", borderBottom:"2px solid var(--ink)",
            padding:"10px 0", marginBottom:0, textAlign:"center" }}>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:6, color:"var(--muted)" }}>
              BUSPASSPRO SYSTEM REPORT · {period.toUpperCase()} EDITION
            </div>
          </div>

          {/* Headline stat */}
          <div style={{ padding:"28px 0 20px", borderBottom:"1px solid var(--rule)", textAlign:"center" }}>
            <div style={{ fontFamily:"var(--font-display)", fontSize:80, letterSpacing:2, color:"var(--ink)", lineHeight:1 }}>
              {d.passes}
            </div>
            <div style={{ fontFamily:"var(--font-serif)", fontSize:20, color:"var(--muted)", fontStyle:"italic", marginTop:6 }}>
              passes issued this {period}
            </div>
          </div>

          {/* Three columns — newspaper layout */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
            borderBottom:"1px solid var(--rule)", gap:0 }}>
            {[
              { n:d.revenue,     l:"Revenue",          sub:"Total collected" },
              { n:d.newStudents, l:"New Students",      sub:"Registered" },
              { n:d.scans,       l:"QR Scans",          sub:"Verified boardings" },
            ].map(({n,l,sub},i)=>(
              <div key={l} style={{ padding:"20px 24px",
                borderRight:i<2?"1px solid var(--rule)":"none" }}>
                <div style={{ fontFamily:"var(--font-display)", fontSize:36, letterSpacing:1,
                  color:"var(--ink)", lineHeight:1 }}>{n}</div>
                <div style={{ fontFamily:"var(--font-serif)", fontSize:14, color:"var(--ink)",
                  fontStyle:"italic", margin:"4px 0 2px" }}>{l}</div>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:2, color:"var(--muted)" }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div style={{ padding:"20px 24px 0", borderBottom:"1px solid var(--rule)" }}>
            <Tag>Daily Ridership — This Week</Tag>
            <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:100, marginBottom:8 }}>
              {CHART_DATA.map((c,i)=>(
                <div key={c.l} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:11, color:"var(--amber-text)", letterSpacing:1 }}>{c.v}</div>
                  <div style={{ width:"100%", background:"var(--amber)", height:`${(c.v/maxV)*72}px`,
                    minHeight:2, transition:"height .5s ease", animationDelay:`${i*.08}s` }}/>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:6, letterSpacing:1, color:"var(--muted)" }}>{c.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pass type breakdown */}
          <div style={{ padding:"16px 24px" }}>
            <Tag>Pass Type Distribution</Tag>
            {[["Annual",38,"var(--ink)"],["Quarterly",45,"var(--amber-text)"],["Monthly",17,"var(--muted)"]].map(([l,pct,c])=>(
              <div key={l} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontFamily:"var(--font-sans)", fontSize:12, color:"var(--ink)" }}>{l}</span>
                  <span style={{ fontFamily:"var(--font-display)", fontSize:16, color:c, letterSpacing:1 }}>{pct}%</span>
                </div>
                <div style={{ height:5, background:"var(--parchment)", position:"relative" }}>
                  <div style={{ position:"absolute", left:0, top:0, height:"100%",
                    width:`${pct}%`, background:c, transition:"width .6s ease" }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: data table + top routes */}
        <div>
          {/* Full data table */}
          <div style={{ border:"1.5px solid var(--ink)", marginBottom:16 }}>
            <div style={{ background:"var(--ink)", padding:"12px 16px" }}>
              <div style={{ fontFamily:"var(--font-display)", fontSize:16, letterSpacing:2, color:"var(--amber-on-ink)" }}>
                DATA TABLE
              </div>
            </div>
            {[
              ["Passes Issued",  d.passes],
              ["Revenue",        d.revenue],
              ["New Students",   d.newStudents],
              ["Total Scans",    d.scans],
              ["Top Route",      d.topRoute],
              ["Pending Apps",   d.pending],
              ["Active Students","243"],
              ["Pass Hold Rate", "97.2%"],
            ].map(([l,v],i)=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"10px 16px",
                borderBottom:i<7?"1px solid var(--rule)":"none",
                background:i%2===0?"var(--surface)":"var(--cream)" }}>
                <span style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:2, color:"var(--muted)" }}>{l}</span>
                <span style={{ fontFamily:"var(--font-display)", fontSize:16, letterSpacing:1, color:"var(--ink)" }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Route breakdown */}
          <div style={{ border:"1.5px solid var(--rule)", padding:"16px" }}>
            <Tag>Passes Per Route</Tag>
            {[["Route Alpha","#C8832A",52],["Route Beta","#1E6641",31],["Route Gamma","#3D2410",17]].map(([r,c,pct])=>(
              <div key={r} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:c }}/>
                    <span style={{ fontFamily:"var(--font-sans)", fontSize:12, color:"var(--ink)" }}>{r}</span>
                  </div>
                  <span style={{ fontFamily:"var(--font-display)", fontSize:18, color:"var(--ink)", letterSpacing:1 }}>{pct}%</span>
                </div>
                <div style={{ height:6, background:"var(--parchment)", position:"relative" }}>
                  <div style={{ position:"absolute", left:0, top:0, height:"100%",
                    width:`${pct}%`, background:c, transition:"width .6s ease" }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  MAIN EXPORT — ADMIN HUB
// ══════════════════════════════════════════════════════════════════════
const SECTIONS = [
  { id:"overview",  num:"01", label:"OVERVIEW",  sub:"Live stats & activity"    },
  { id:"emails",    num:"02", label:"EMAILS",     sub:"Dispatch notifications"   },
  { id:"discounts", num:"03", label:"DISCOUNTS",  sub:"Vouchers & offers"        },
  { id:"support",   num:"04", label:"SUPPORT",    sub:"Student queries"          },
  { id:"reports",   num:"05", label:"REPORTS",    sub:"Analytics & CSV export"   },
];

export default function AdminHub() {
  const [section,   setSection]  = useState("overview");
  const [emailLog,  setEmailLog] = useState([]);
  const toast = useToast();

  const sel = SECTIONS.find(s=>s.id===section);

  return (
    <>
      <style>{G}</style>
      <div style={{ display:"flex", minHeight:"calc(100vh - 62px)", background:"var(--cream)" }}>

        {/* ── Left rail navigation ── */}
        <nav style={{ width:240, flexShrink:0, borderRight:"2px solid var(--ink)",
          background:"var(--ink)", display:"flex", flexDirection:"column", position:"sticky",
          top:62, height:"calc(100vh - 62px)", overflowY:"auto" }}>

          {/* Rail header */}
          <div style={{ padding:"28px 24px", borderBottom:"1px solid rgba(255,255,255,.08)" }}>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:4,
              color:"var(--muted-on-ink)", marginBottom:6 }}>ADMIN PANEL</div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:28, letterSpacing:2,
              color:"var(--amber-on-ink)", lineHeight:1 }}>HUB</div>
            <div style={{ fontFamily:"var(--font-serif)", fontSize:13, color:"var(--muted-on-ink)",
              fontStyle:"italic", marginTop:6 }}>Command & control.</div>
          </div>

          {/* Section links */}
          <div style={{ flex:1, padding:"16px 0" }}>
            {SECTIONS.map(s=>{
              const active = section===s.id;
              return(
                <button key={s.id} onClick={()=>setSection(s.id)}
                  style={{ width:"100%", padding:"14px 24px", background:"none",
                    border:"none", borderLeft:`3px solid ${active?"var(--amber-on-ink)":"transparent"}`,
                    textAlign:"left", cursor:"pointer", transition:"all .18s",
                    background:active?"rgba(240,168,48,.07)":"transparent" }}>
                  <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
                    <span style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:2,
                      color:active?"var(--amber-on-ink)":"rgba(240,168,48,.3)" }}>{s.num}</span>
                    <div>
                      <div style={{ fontFamily:"var(--font-display)", fontSize:15, letterSpacing:2,
                        color:active?"var(--cream-on-ink)":"var(--muted-on-ink)",
                        lineHeight:1 }}>{s.label}</div>
                      <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:2,
                        color:"rgba(176,152,120,.5)", marginTop:3 }}>{s.sub}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Rail footer */}
          <div style={{ padding:"20px 24px", borderTop:"1px solid rgba(255,255,255,.08)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%",
                background:"var(--green-on-ink)", animation:"pulse 2s ease-in-out infinite" }}/>
              <span style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:3,
                color:"var(--green-on-ink)" }}>SYSTEM ONLINE</span>
            </div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:2,
              color:"rgba(176,152,120,.5)" }}>
              {emailLog.length} EMAIL{emailLog.length!==1?"S":""} DISPATCHED
            </div>
          </div>
        </nav>

        {/* ── Main content ── */}
        <main style={{ flex:1, overflowY:"auto" }}>
          {/* Content header */}
          <div style={{ padding:"32px 40px 0", borderBottom:"1px solid var(--rule)",
            background:"var(--cream)", position:"sticky", top:0, zIndex:10,
            backdropFilter:"blur(8px)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end",
              paddingBottom:20 }}>
              <div>
                <div style={{ display:"flex", alignItems:"baseline", gap:14 }}>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:11, letterSpacing:4,
                    color:"var(--amber-text)" }}>{sel?.num}</div>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:40, letterSpacing:1,
                    color:"var(--ink)", lineHeight:1 }}>{sel?.label}</div>
                </div>
                <div style={{ fontFamily:"var(--font-serif)", fontSize:15, color:"var(--muted)",
                  fontStyle:"italic", marginTop:6 }}>{sel?.sub}</div>
              </div>
              {/* Breadcrumb trail */}
              <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:3, color:"var(--muted)" }}>
                ADMIN HUB › {sel?.label}
              </div>
            </div>
          </div>

          {/* Section content */}
          <div style={{ padding:"32px 40px 80px" }}>
            {section==="overview"  && <SectionOverview  emailLog={emailLog}/>}
            {section==="emails"    && <SectionEmails    emailLog={emailLog} setEmailLog={setEmailLog} toast={toast}/>}
            {section==="discounts" && <SectionDiscounts toast={toast}/>}
            {section==="support"   && <SectionSupport   toast={toast}/>}
            {section==="reports"   && <SectionReports   toast={toast}/>}
          </div>
        </main>
      </div>

      <toast.Toaster/>
    </>
  );
}