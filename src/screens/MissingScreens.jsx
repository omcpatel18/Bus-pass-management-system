/**
 * ══════════════════════════════════════════════════════════════════════
 *  BUSPASSPRO — ALL MISSING FRONTEND SCREENS  (v3 — Improved UI)
 *  Design System v2 compliant · WCAG AA throughout
 *
 *  SCREENS:
 *  ─────────────────────────────────────────────────
 *  PRIORITY 1 — Auth
 *    1. RegisterScreen       — 4-step sign-up (passenger-type aware)
 *    2. ForgotPasswordScreen — OTP-based reset
 *    3. NotificationsScreen  — Filter + read/delete
 *
 *  PRIORITY 2 — Admin
 *    4. RouteManager         — Stats strip + table (like AdminApplications)
 *    5. UserManager          — Split panel: table + detail card
 *    6. AnalyticsDashboard   — Newspaper-style stats + bar charts
 *    7. AnnouncementSender   — Compose + sent history
 *
 *  PRIORITY 3 — Passenger
 *    8. RenewalFlow          — Pass preview + duration selector
 *    9. BusRouteMap          — Animated stop-by-stop route
 *
 *  PRIORITY 4 — Conductor
 *   10. CameraScanner        — jsQR camera + scan log
 *   11. TripLog              — Stats strip + full scan table
 *   12. ManualLookup         — ID/pass search + recent lookups
 *
 *  IMPORT:
 *  import { RegisterScreen, ForgotPasswordScreen, NotificationsScreen,
 *           RouteManager, UserManager, AnalyticsDashboard,
 *           AnnouncementSender, RenewalFlow, BusRouteMap,
 *           CameraScanner, TripLog, ManualLookup } from "./MissingScreens";
 * ══════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { User, GraduationCap, Leaf, Accessibility, Briefcase } from "lucide-react";

// ══════════════════════════════════════════════════════════════════════
//  DESIGN TOKENS  (identical to DesignSystem.jsx)
// ══════════════════════════════════════════════════════════════════════
const G = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;700&family=Instrument+Sans:wght@400;500;600&display=swap');
:root {
  --cream:#F6F0E4; --surface:#FDFAF3; --parchment:#EDE4CC;
  --ink:#1A1208;   --ink-mid:#3D2410;
  --amber:#C8832A; --amber-text:#8B520A; --amber-on-ink:#F0A830;
  --amber-light:#F5D49A; --muted:#6B5535; --rule:#D4C4A0;
  --green:#1E6641; --green-on-ink:#52B788;
  --red:#B02020;   --cream-on-ink:#F6F0E4; --muted-on-ink:#B09878;
  --success-bg:#EBF7F0; --error-bg:#FDEAEA; --warn-bg:#FEF7E6; --info-bg:#EDE4CC;
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
.admin-hub {
  --cream:#0A0A0A;  --surface:#121212; --parchment:#1A1A1A;
  --ink:#FAFAFA;    --ink-mid:#A3A3A3;
  --amber:#F59E0B;  --amber-text:#FBBF24; --amber-on-ink:#F59E0B;
  --amber-light:#452202; --muted:#737373; --rule:#262626;
  --green:#10B981;  --green-on-ink:#34D399;
  --red:#EF4444;    --cream-on-ink:#1A1A1A; --muted-on-ink:#737373;
  --success-bg:rgba(16,185,129,0.1); --error-bg:rgba(239,68,68,0.1);
  --warn-bg:rgba(245,158,11,0.1);    --info-bg:rgba(250,250,250,0.05);
  --shadow-sm:0 2px 8px rgba(0,0,0,.4);
  --shadow-md:0 6px 24px rgba(0,0,0,.6);
  --shadow-lg:0 16px 48px rgba(0,0,0,.8);
}
.admin-hub * { border-color: var(--rule) !important; }
.admin-hub [style*="color: var(--amber)"] { color: var(--amber) !important; }
.admin-hub [style*="color: var(--amber-text)"] { color: var(--amber-text) !important; }
.admin-hub [style*="color:var(--amber-text)"] { color: var(--amber-text) !important; }
.admin-hub [style*="color: var(--muted)"] { color: var(--muted) !important; }
.admin-hub [style*="color:var(--muted)"] { color: var(--muted) !important; }
.admin-hub [style*="color: var(--green)"] { color: var(--green) !important; }
.admin-hub [style*="color:var(--green)"] { color: var(--green) !important; }
@keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn    { from{opacity:0} to{opacity:1} }
@keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideUp   { from{opacity:0;transform:translateY(10px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes slideInRight { from{opacity:0;transform:translateX(14px)} to{opacity:1;transform:translateX(0)} }
@keyframes spin      { to{transform:rotate(360deg)} }
@keyframes shimmer   { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes stampIn   { 0%{transform:scale(2.2)rotate(-8deg);opacity:0} 65%{transform:scale(.95)rotate(2deg);opacity:1} 100%{transform:scale(1)rotate(-3deg);opacity:1} }
@keyframes pulse     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.65)} }
@keyframes lineGrow  { from{transform:scaleX(0)} to{transform:scaleX(1)} }
@keyframes inkReveal { from{clip-path:inset(0 100% 0 0)} to{clip-path:inset(0 0% 0 0)} }
@keyframes scanLine  { 0%{top:0} 50%{top:calc(100% - 3px)} 100%{top:0} }
@keyframes barGrow   { from{transform:scaleY(0);transform-origin:bottom} to{transform:scaleY(1);transform-origin:bottom} }
`;

// ── Route line colours ────────────────────────────────────────────────
const LINE_COLORS = { "Route Alpha":"#B02020", "Route Beta":"#1A4A8A", "Route Gamma":"#1E6641",
  "Red Line":"#B02020", "Blue Line":"#1A4A8A", "Green Line":"#1E6641" };
const LINE_CODES  = { "Route Alpha":"Rα","Route Beta":"Rβ","Route Gamma":"Rγ",
  "Red Line":"R1","Blue Line":"R2","Green Line":"R3" };

// ══════════════════════════════════════════════════════════════════════
//  SHARED ATOMS
// ══════════════════════════════════════════════════════════════════════

const Tag = ({ children, color }) => (
  <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:4,
    color:color||"var(--muted)", textTransform:"uppercase", marginBottom:8 }}>{children}</div>
);
const Rule     = ({ my=20 }) => <div style={{ height:1, background:"var(--rule)", margin:`${my}px 0` }}/>;
const DblRule  = ({ my=28 }) => <div style={{ borderTop:"3px double var(--ink)", margin:`${my}px 0` }}/>;

const LineBadge = ({ name, small }) => {
  const color = LINE_COLORS[name]||"var(--muted)";
  const code  = LINE_CODES[name]||"?";
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4,
      background:color, color:"white",
      fontFamily:"var(--font-mono)", fontSize:small?7:9, fontWeight:700, letterSpacing:2,
      padding:small?"2px 7px":"3px 10px" }}>{code}</span>
  );
};

const AnimatedCount = ({ target, suffix="" }) => {
  const [count,setCount] = useState(0);
  const isNum = !isNaN(parseInt(target,10));
  const num = parseInt(target,10) || 0;

  useEffect(() => {
    if (!isNum) return;
    let start = 0;
    const steps = 36;
    const inc = num / steps;
    const t = setInterval(() => {
      start += inc;
      if (start >= num) {
        setCount(num);
        clearInterval(t);
      } else {
        setCount(Math.floor(start));
      }
    }, 24);
    return () => clearInterval(t);
  }, [num, isNum]);

  if (!isNum) return <>{target}</>;
  return <>{count.toLocaleString()}{suffix}</>;
};

const Pill = ({ s }) => {
  const m = { ACTIVE:{bg:"#1E6641",c:"#F6F0E4"}, VALID:{bg:"#1E6641",c:"#F6F0E4"},
    APPROVED:{bg:"#1E6641",c:"#F6F0E4"}, PAID:{bg:"#1E6641",c:"#F6F0E4"},
    PENDING:{bg:"#C8832A",c:"#1A1208"}, EXPIRED:{bg:"#6B5535",c:"#F6F0E4"},
    INACTIVE:{bg:"#6B5535",c:"#F6F0E4"}, REJECTED:{bg:"#B02020",c:"#F6F0E4"},
    INVALID:{bg:"#B02020",c:"#F6F0E4"}, CANCELLED:{bg:"#B02020",c:"#F6F0E4"},
    USED:{bg:"#6B5535",c:"#F6F0E4"} };
  const p = m[(s||"").toUpperCase()]||{bg:"#6B5535",c:"#F6F0E4"};
  return <span style={{ background:p.bg, color:p.c, fontFamily:"var(--font-mono)",
    fontSize:9, fontWeight:700, letterSpacing:2, padding:"4px 12px",
    borderRadius:"var(--r-full)", display:"inline-block", lineHeight:1.7,
    boxShadow:"0 2px 8px rgba(0,0,0,0.06)", transition:"all .2s ease",
    border:`1px solid ${p.bg}` }}>{(s||"").toUpperCase()}</span>;
};

const Btn = ({ children, onClick, variant="primary", full=false, size="md", disabled=false, style={} }) => {
  const [h,setH]=useState(false);
  const pad={sm:"8px 18px",md:"12px 28px",lg:"16px 40px"}[size]||"12px 28px";
  const fs={sm:12,md:14,lg:17}[size]||14;
  const s={
    primary:  {bg:h&&!disabled?"#2C1E0A":"var(--ink)",          c:"var(--amber-on-ink)", b:"transparent", s:h?"0 6px 16px rgba(26,18,8,0.2)":"0 2px 6px rgba(26,18,8,0.15)"},
    secondary:{bg:h&&!disabled?"var(--parchment)":"transparent", c:"var(--ink)",          b:"1.5px solid var(--ink)", s:"none"},
    danger:   {bg:h&&!disabled?"#8A1818":"var(--red)",           c:"var(--cream-on-ink)", b:"transparent", s:h?"0 6px 16px rgba(176,32,32,0.25)":"0 2px 6px rgba(176,32,32,0.15)"},
    success:  {bg:h&&!disabled?"#155230":"var(--green)",         c:"var(--cream-on-ink)", b:"transparent", s:h?"0 6px 16px rgba(30,102,65,0.25)":"0 2px 6px rgba(30,102,65,0.15)"},
    ghost:    {bg:h&&!disabled?"var(--parchment)":"transparent", c:"var(--ink)",          b:"1.5px solid var(--rule)", s:"none"},
    amber:    {bg:h&&!disabled?"#7A4206":"var(--amber-text)",    c:"var(--cream-on-ink)", b:"transparent", s:h?"0 6px 16px rgba(200,131,42,0.3)":"0 4px 10px rgba(200,131,42,0.2)"},
  }[variant]||{};
  return <button onClick={onClick} disabled={disabled}
    onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{ ...style, padding:pad, background:s.bg, color:s.c, border:s.b||"none",
      fontFamily:"var(--font-display)", fontSize:fs, letterSpacing:2,
      cursor:disabled?"not-allowed":"pointer", opacity:disabled?.5:1,
      width:full?"100%":"auto", display:"inline-flex", alignItems:"center",
      justifyContent:"center", gap:8, borderRadius:"8px",
      boxShadow: disabled?"none":s.s,
      transition:"all .2s cubic-bezier(0.34, 1.56, 0.64, 1)",
      transform:h&&!disabled?"translateY(-2px) scale(1.01)":"none" }}>{children}</button>;
};

const Field = ({ label, type="text", value, onChange, placeholder, readOnly, error, hint, required, rows, style={} }) => {
  const [foc,setFoc]=useState(false);
  const inputStyle = {
    ...style, width:"100%", padding:"12px 16px",
    border:`1.5px solid ${error?"var(--red)":foc?"var(--amber)":"var(--rule)"}`,
    background:readOnly?"var(--parchment)":foc?"var(--surface)":"var(--cream)",
    fontFamily:"var(--font-sans)", fontSize:15,
    color:readOnly?"var(--muted)":"var(--ink)", outline:"none",
    transition:"all .2s ease",
    borderRadius:"8px",
    boxShadow:foc&&!error?"0 0 0 4px rgba(200,131,42,.12)":error?"0 0 0 4px rgba(176,32,32,.12)":"0 2px 4px rgba(26,18,8,.02)",
    resize:"vertical",
  };
  return (
    <div style={{ marginBottom:18 }}>
      {label&&<div style={{ fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:2,
        color:"var(--ink-mid)",textTransform:"uppercase",marginBottom:8, fontWeight:700 }}>
        {label}{required&&<span style={{ color:"var(--red)",marginLeft:4 }}>*</span>}
      </div>}
      {rows
        ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} readOnly={readOnly}
            onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)} style={inputStyle}/>
        : <input type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
            onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)} style={inputStyle}/>
      }
      {error&&<div style={{ fontFamily:"var(--font-sans)",fontSize:12,color:"var(--red)",marginTop:6,display:"flex",alignItems:"center",gap:4 }}><span style={{fontSize:10}}>✕</span> {error}</div>}
      {hint&&!error&&<div style={{ fontFamily:"var(--font-sans)",fontSize:12,color:"var(--muted)",marginTop:6 }}>{hint}</div>}
    </div>
  );
};

const Sel = ({ label, value, onChange, options, style={} }) => {
  const [foc,setFoc]=useState(false);
  return (
  <div style={{ marginBottom:18 }}>
    {label&&<div style={{ fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:2,
      color:"var(--ink-mid)",textTransform:"uppercase",marginBottom:8, fontWeight:700 }}>{label}</div>}
    <select value={value} onChange={onChange}
      onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}
      style={{ ...style, width:"100%",padding:"12px 16px",
        border:`1.5px solid ${foc?"var(--amber)":"var(--rule)"}`,
        background:foc?"var(--surface)":"var(--cream)",
        fontFamily:"var(--font-sans)",fontSize:15,
        color:"var(--ink)",outline:"none",appearance:"none",cursor:"pointer",
        borderRadius:"8px", transition:"all .2s ease",
        boxShadow:foc?"0 0 0 4px rgba(200,131,42,.12)":"0 2px 4px rgba(26,18,8,.02)",
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%231A1208' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
        backgroundRepeat:"no-repeat",backgroundPosition:"right 16px center",paddingRight:40 }}>
      {options.map(([v,l])=><option key={v} value={v}>{l}</option>)}
    </select>
  </div>
)};

const Spinner = ({size=18,color="var(--amber)"}) => (
  <div style={{ width:size,height:size,border:`2px solid rgba(200,131,42,.25)`,
    borderTop:`2px solid ${color}`,borderRadius:"50%",
    animation:"spin .7s linear infinite",display:"inline-block",flexShrink:0 }}/>
);

const Skeleton = ({h=20,w="100%",mb=8}) => (
  <div style={{ height:h,width:w,marginBottom:mb,
    background:"linear-gradient(90deg,var(--parchment) 0%,var(--rule) 50%,var(--parchment) 100%)",
    backgroundSize:"200% 100%",animation:"shimmer 1.6s ease infinite" }}/>
);

// ── Page wrapper ──────────────────────────────────────────────────────
const Page = ({ children, style={} }) => (
  <div style={{ minHeight:"calc(100vh - 62px)", background:"var(--cream)",
    padding:"36px 44px", ...style }}>{children}</div>
);

// ── Page header ───────────────────────────────────────────────────────
const PageHeader = ({ tag, title, subtitle, actions }) => (
  <div style={{ display:"flex", justifyContent:"space-between",
    alignItems:"flex-end", marginBottom:28 }}>
    <div>
      <Tag>{tag}</Tag>
      <div style={{ fontFamily:"var(--font-display)", fontSize:40,
        letterSpacing:1, color:"var(--ink)", lineHeight:1,
        animation:"inkReveal .7s ease both" }}>{title}</div>
      {subtitle&&<div style={{ fontFamily:"var(--font-sans)",fontSize:13,
        color:"var(--muted)",marginTop:6 }}>{subtitle}</div>}
    </div>
    {actions&&<div style={{ display:"flex",gap:10 }}>{actions}</div>}
  </div>
);

// ── Toast ─────────────────────────────────────────────────────────────
function useToast() {
  const [ts,setTs]=useState([]);
  const add=useCallback((msg,type="info")=>{
    const id=Date.now(); setTs(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setTs(t=>t.filter(x=>x.id!==id)),type==="error"?6000:3500);
  },[]);
  const C={
    success:{bg:"var(--success-bg)",b:"var(--green)",     t:"var(--green)",     i:"✓"},
    error:  {bg:"var(--error-bg)",  b:"var(--red)",       t:"var(--red)",       i:"✕"},
    info:   {bg:"var(--surface)",   b:"var(--ink)",       t:"var(--ink)",       i:"◆"},
    warn:   {bg:"var(--warn-bg)",   b:"var(--amber-text)",t:"var(--amber-text)",i:"⚠"},
  };
  const Toaster=()=>(
    <div style={{ position:"fixed",bottom:24,right:24,zIndex:9999,
      display:"flex",flexDirection:"column",gap:8 }}>
      {ts.map(t=>{ const c=C[t.type]||C.info; return(
        <div key={t.id} style={{ background:c.bg,border:`2px solid ${c.b}`,
          padding:"11px 16px",minWidth:280,display:"flex",gap:10,alignItems:"center",
          borderRadius:"var(--r-md)",animation:"slideDown .3s ease",
          boxShadow:"0 4px 20px rgba(26,18,8,.1)" }}>
          <span style={{ fontFamily:"var(--font-display)",fontSize:18,color:c.t }}>{c.i}</span>
          <span style={{ fontFamily:"var(--font-sans)",fontSize:13,color:c.t }}>{t.msg}</span>
        </div>
      );})}
    </div>
  );
  return { success:m=>add(m,"success"),error:m=>add(m,"error"),
           info:m=>add(m,"info"),warn:m=>add(m,"warn"),Toaster };
}

// ══════════════════════════════════════════════════════════════════════
//  1. REGISTER SCREEN
// ══════════════════════════════════════════════════════════════════════
export function RegisterScreen({ onDone, onBackToLogin }) {
  const [step,  setStep]  = useState(1);
  const [role,  setRole]  = useState("passenger");
  const [ptype, setPtype] = useState("general");
  const [form,  setForm]  = useState({ name:"",email:"",phone:"",pid:"",org:"",dept:"CS",year:"I Year",password:"",confirm:"" });
  const [errors,setErrors]= useState({});
  const [loading,setLoading]=useState(false);
  const [done,  setDone]  = useState(false);
  const toast=useToast();
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));

  const PASSENGER_TYPES=[
    {id:"general",label:"GENERAL",sub:"Standard full fare",disc:0,icon: <User size={20} color="#1A1208" />},
    {id:"student",label:"STUDENT",sub:"30% off — student ID req.",disc:30,icon: <GraduationCap size={20} color="#1A1208" />},
    {id:"senior",label:"SENIOR CITIZEN",sub:"50% off — age 60+",disc:50,icon: <Leaf size={20} color="#1A1208" />},
    {id:"differently_abled",label:"DIFFERENTLY ABLED",sub:"75% off — cert. req.",disc:75,icon: <Accessibility size={20} color="#1A1208" />},
    {id:"corporate",label:"CORPORATE",sub:"15% off — employer code",disc:15,icon: <Briefcase size={20} color="#1A1208" />},
  ];
  const STEPS=["PORTAL","PERSONAL","IDENTITY","SECURE"];
  const DEPTS=[["cs","Computer Science"],["it","Information Technology"],["ec","Electronics"],["me","Mechanical"],["ce","Civil"],["other","Other"]];
  const YEARS=[["I Year","I Year"],["II Year","II Year"],["III Year","III Year"],["IV Year","IV Year"]];

  const validate=()=>{
    const e={};
    if(step===2){if(!form.name.trim())e.name="Required";if(!form.email.includes("@"))e.email="Invalid email";if(form.phone.length<10)e.phone="10-digit number required";}
    if(step===3){if(!form.pid.trim())e.pid="ID required";}
    if(step===4){if(form.password.length<8)e.password="Min 8 characters";if(form.password!==form.confirm)e.confirm="Passwords don't match";}
    setErrors(e); return Object.keys(e).length===0;
  };

  const next=async()=>{
    if(!validate()) return;
    if(step<4){setStep(s=>s+1);return;}
    setLoading(true); await new Promise(r=>setTimeout(r,1200)); setLoading(false); setDone(true);
  };

  if(done) return (
    <>
      
      <div style={{ minHeight:"100vh",background:"var(--cream)",display:"flex",alignItems:"center",justifyContent:"center" }}>
        <div style={{ textAlign:"center",padding:48,animation:"fadeUp .5s ease" }}>
          <div style={{ width:72,height:72,background:"var(--success-bg)",border:"3px solid var(--green)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",animation:"stampIn .5s ease" }}>
            <span style={{ fontFamily:"var(--font-display)",fontSize:36,color:"var(--green)" }}>✓</span>
          </div>
          <div style={{ fontFamily:"var(--font-display)",fontSize:48,letterSpacing:1,color:"var(--ink)",lineHeight:1,marginBottom:8 }}>WELCOME ABOARD!</div>
          <div style={{ fontFamily:"var(--font-serif)",fontSize:16,color:"var(--muted)",fontStyle:"italic",marginBottom:28 }}>Account created. Check your email to verify.</div>
          <Btn variant="primary" size="lg" onClick={onDone||onBackToLogin}>GO TO LOGIN →</Btn>
        </div>
      </div>
    </>
  );

  return (
    <>
      
      <div style={{ minHeight:"100vh",background:"var(--cream)",display:"flex" }}>
        {/* Left dark panel */}
        <div style={{ width:"40%",background:"var(--ink)",position:"relative",
          display:"flex",flexDirection:"column",justifyContent:"space-between",
          padding:52,overflow:"hidden" }}>
          <div style={{ position:"absolute",top:-20,left:-10,fontFamily:"var(--font-display)",
            fontSize:190,color:"rgba(240,168,48,.05)",lineHeight:.85,userSelect:"none",
            letterSpacing:-6 }}>NEW<br/>RIDE</div>
          <div style={{ position:"relative" }}>
            <div style={{ fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:4,
              color:"var(--amber)",marginBottom:14 }}>◆ BUSPASSPRO</div>
            <div style={{ fontFamily:"var(--font-display)",fontSize:52,
              color:"var(--cream-on-ink)",lineHeight:.9,letterSpacing:1,marginBottom:20 }}>
              JOIN THE<br/>TRANSIT<br/><span style={{ color:"var(--amber-on-ink)" }}>NETWORK.</span>
            </div>
            <div style={{ fontFamily:"var(--font-serif)",fontSize:13,color:"var(--muted-on-ink)",
              fontStyle:"italic",lineHeight:1.7,marginBottom:32 }}>
              Get your digital pass in minutes.<br/>No paperwork, no queues.
            </div>
            {STEPS.map((s,i)=>(
              <div key={s} style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12,
                opacity:step>=i+1?1:0.3,transition:"opacity .3s" }}>
                <div style={{ width:24,height:24,
                  background:step>i+1?"var(--green-on-ink)":step===i+1?"var(--amber-on-ink)":"transparent",
                  border:`2px solid ${step>i+1?"var(--green-on-ink)":step===i+1?"var(--amber-on-ink)":"rgba(255,255,255,.2)"}`,
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                  transition:"all .3s" }}>
                  <span style={{ fontFamily:"var(--font-display)",fontSize:12,
                    color:step>=i+1?"var(--ink)":"rgba(255,255,255,.3)" }}>
                    {step>i+1?"✓":i+1}
                  </span>
                </div>
                <span style={{ fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:3,
                  color:step>=i+1?"var(--cream-on-ink)":"rgba(255,255,255,.25)" }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:3,
            color:"var(--muted-on-ink)" }}>STEP {step} OF {STEPS.length}</div>
        </div>

        {/* Right form */}
        <div style={{ flex:1,display:"flex",flexDirection:"column",justifyContent:"center",
          padding:"52px 56px" }}>
          <div style={{ maxWidth:440,animation:"fadeUp .4s ease" }}>

            {/* Step 1 — Portal + Passenger type */}
            {step===1&&(
              <>
                <Tag>Step 1 — Portal</Tag>
                <div style={{ fontFamily:"var(--font-serif)",fontSize:28,color:"var(--ink)",marginBottom:22 }}>Who are you?</div>
                <Tag color="var(--muted)">Portal Type</Tag>
                <div style={{ display:"flex",gap:8,marginBottom:20 }}>
                  {[["passenger","🚌 PASSENGER","Book passes & tickets"],
                    ["admin","⚙ ADMIN","Manage system"],
                    ["conductor","🔍 CONDUCTOR","Scan & verify"]].map(([r,l,sub])=>(
                    <div key={r} onClick={()=>setRole(r)}
                      style={{ flex:1,border:`2px solid ${role===r?"var(--ink)":"var(--rule)"}`,
                        padding:"12px 10px",cursor:"pointer",
                        background:role===r?"var(--ink)":"var(--surface)",
                        textAlign:"center",transition:"all .18s" }}>
                      <div style={{ fontFamily:"var(--font-display)",fontSize:12,letterSpacing:2,
                        color:role===r?"var(--amber-on-ink)":"var(--ink)" }}>{l}</div>
                      <div style={{ fontFamily:"var(--font-sans)",fontSize:10,
                        color:role===r?"var(--muted-on-ink)":"var(--muted)",marginTop:3 }}>{sub}</div>
                    </div>
                  ))}
                </div>
                {role==="passenger"&&(
                  <>
                    <Tag color="var(--muted)">Passenger Category</Tag>
                    <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
                      {PASSENGER_TYPES.map(p=>(
                        <div key={p.id} onClick={()=>setPtype(p.id)}
                          style={{ border:`2px solid ${ptype===p.id?"var(--ink)":"var(--rule)"}`,
                            padding:"10px 14px",cursor:"pointer",
                            background:ptype===p.id?"var(--parchment)":"var(--surface)",
                            display:"flex",justifyContent:"space-between",alignItems:"center",
                            transition:"all .18s" }}>
                          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                            <span style={{ fontSize:16 }}>{p.icon}</span>
                            <div>
                              <div style={{ fontFamily:"var(--font-display)",fontSize:13,
                                letterSpacing:2,color:"var(--ink)" }}>{p.label}</div>
                              <div style={{ fontFamily:"var(--font-sans)",fontSize:10,
                                color:"var(--muted)" }}>{p.sub}</div>
                            </div>
                          </div>
                          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                            {p.disc>0&&<div style={{ fontFamily:"var(--font-display)",fontSize:16,
                              color:"var(--green)" }}>{p.disc}%</div>}
                            {ptype===p.id&&<span style={{ color:"var(--green)",
                              fontFamily:"var(--font-display)",fontSize:14 }}>✓</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Step 2 — Personal */}
            {step===2&&(
              <>
                <Tag>Step 2 — Personal Info</Tag>
                <div style={{ fontFamily:"var(--font-serif)",fontSize:28,color:"var(--ink)",marginBottom:22 }}>About you</div>
                <Field label="Full Name" value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Your full name" error={errors.name} required/>
                <Field label="Email" type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="you@example.com" error={errors.email} required/>
                <Field label="Mobile" type="tel" value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="10-digit number" error={errors.phone} required/>
              </>
            )}

            {/* Step 3 — Identity */}
            {step===3&&(
              <>
                <Tag>Step 3 — Identity</Tag>
                <div style={{ fontFamily:"var(--font-serif)",fontSize:28,color:"var(--ink)",marginBottom:16 }}>Verify your category</div>
                <Field
                  label={role==="passenger"&&ptype==="student"?"Student ID":
                         ptype==="corporate"?"Employee ID":"Govt / Pass ID"}
                  value={form.pid} onChange={e=>set("pid",e.target.value)}
                  placeholder="e.g. STU-10042" error={errors.pid} required
                  hint={ptype==="student"?"Institution-issued student ID":
                        ptype==="senior"?"Verified at first scan":
                        ptype==="differently_abled"?"Disability certificate no.":
                        "Any valid government photo ID"}/>
                {ptype==="corporate"&&
                  <Field label="Organisation" value={form.org} onChange={e=>set("org",e.target.value)} placeholder="TechCorp India Pvt Ltd"/>}
                {role==="passenger"&&ptype==="student"&&(
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px" }}>
                    <Sel label="Department" value={form.dept} onChange={e=>set("dept",e.target.value)} options={DEPTS}/>
                    <Sel label="Year" value={form.year} onChange={e=>set("year",e.target.value)} options={YEARS}/>
                  </div>
                )}
              </>
            )}

            {/* Step 4 — Password */}
            {step===4&&(
              <>
                <Tag>Step 4 — Secure Account</Tag>
                <div style={{ fontFamily:"var(--font-serif)",fontSize:28,color:"var(--ink)",marginBottom:22 }}>Set your password</div>
                <Field label="Password" type="password" value={form.password} onChange={e=>set("password",e.target.value)} placeholder="Min 8 characters" error={errors.password} required/>
                <Field label="Confirm Password" type="password" value={form.confirm} onChange={e=>set("confirm",e.target.value)} placeholder="Repeat password" error={errors.confirm} required/>
                {form.password.length>0&&(
                  <div style={{ marginBottom:16 }}>
                    <div style={{ height:4,background:"var(--rule)",position:"relative",marginBottom:5 }}>
                      <div style={{ position:"absolute",left:0,top:0,height:"100%",
                        width:`${Math.min(100,form.password.length*8)}%`,
                        background:form.password.length<8?"var(--red)":form.password.length<12?"var(--amber)":"var(--green)",
                        transition:"width .3s, background .3s" }}/>
                    </div>
                    <div style={{ fontFamily:"var(--font-sans)",fontSize:11,
                      color:form.password.length<8?"var(--red)":form.password.length<12?"var(--amber-text)":"var(--green)" }}>
                      {form.password.length<8?"Too short":form.password.length<12?"Fair":"Strong ✓"}
                    </div>
                  </div>
                )}
              </>
            )}

            <div style={{ display:"flex",gap:10,marginTop:22 }}>
              {step>1&&<Btn variant="secondary" size="md" onClick={()=>setStep(s=>s-1)}>← BACK</Btn>}
              <Btn variant="primary" full size="md" onClick={next} disabled={loading}>
                {loading?<><Spinner size={16}/> CREATING…</>:step<4?"CONTINUE →":"CREATE ACCOUNT →"}
              </Btn>
            </div>
            <Rule my={20}/>
            <div style={{ textAlign:"center" }}>
              <span onClick={onBackToLogin} style={{ fontFamily:"var(--font-sans)",fontSize:12,
                color:"var(--amber-text)",cursor:"pointer",
                textDecoration:"underline",textUnderlineOffset:3 }}>
                Already registered? Sign in →
              </span>
            </div>
          </div>
        </div>
      </div>
      <toast.Toaster/>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  2. FORGOT PASSWORD
// ══════════════════════════════════════════════════════════════════════
export function ForgotPasswordScreen({ onDone, onBackToLogin }) {
  const [step,setStep]=useState(1);
  const [email,setEmail]=useState("");
  const [otp,setOtp]=useState(["","","","","",""]);
  const [pw,setPw]=useState(""); const [confirm,setConfirm]=useState("");
  const [loading,setLoading]=useState(false);
  const [cd,setCd]=useState(0);
  const [errors,setErrors]=useState({});
  const refs=useRef([]);

  useEffect(()=>{ if(cd>0){const t=setTimeout(()=>setCd(c=>c-1),1000);return()=>clearTimeout(t);} },[cd]);

  const sendOTP=async()=>{
    if(!email.includes("@")){setErrors({email:"Enter a valid email"});return;}
    setErrors({}); setLoading(true);
    await new Promise(r=>setTimeout(r,900)); setLoading(false); setStep(2); setCd(60);
  };
  const verifyOTP=async()=>{
    if(otp.join("").length<6){setErrors({otp:"Enter complete 6-digit code"});return;}
    setErrors({}); setLoading(true);
    await new Promise(r=>setTimeout(r,800)); setLoading(false); setStep(3);
  };
  const resetPw=async()=>{
    if(pw.length<8){setErrors({pw:"Min 8 characters"});return;}
    if(pw!==confirm){setErrors({confirm:"Passwords don't match"});return;}
    setErrors({}); setLoading(true);
    await new Promise(r=>setTimeout(r,900)); setLoading(false); setStep(4);
  };
  const handleOtp=(i,val)=>{
    if(!/^\d*$/.test(val)) return;
    const n=[...otp]; n[i]=val.slice(-1); setOtp(n);
    if(val&&i<5) refs.current[i+1]?.focus();
  };

  if(step===4) return (
    <>
      
      <div style={{ minHeight:"100vh",background:"var(--cream)",display:"flex",alignItems:"center",justifyContent:"center" }}>
        <div style={{ textAlign:"center",padding:48,animation:"fadeUp .5s ease" }}>
          <div style={{ fontFamily:"var(--font-display)",fontSize:54,color:"var(--ink)",letterSpacing:1,lineHeight:1,marginBottom:12 }}>PASSWORD RESET!</div>
          <div style={{ fontFamily:"var(--font-serif)",fontSize:16,color:"var(--muted)",fontStyle:"italic",marginBottom:28 }}>Your password has been updated.</div>
          <Btn variant="primary" size="lg" onClick={onDone||onBackToLogin}>SIGN IN NOW →</Btn>
        </div>
      </div>
    </>
  );

  return (
    <>
      
      <div style={{ minHeight:"100vh",background:"var(--cream)",display:"flex",alignItems:"center",justifyContent:"center" }}>
        <div style={{ width:"100%",maxWidth:420,padding:"44px 40px",
          border:"1.5px solid var(--rule)",borderRadius:"var(--r-sm)",background:"var(--surface)",
          animation:"fadeUp .4s ease",
          boxShadow:"0 20px 60px rgba(26,18,8,.08)" }}>
          <Tag>Password Recovery</Tag>
          <div style={{ fontFamily:"var(--font-serif)",fontSize:28,color:"var(--ink)",lineHeight:1.1,marginBottom:8 }}>
            {step===1?"Reset password":step===2?"Enter OTP":"New password"}
          </div>
          <div style={{ fontFamily:"var(--font-sans)",fontSize:13,color:"var(--muted)",marginBottom:22 }}>
            {step===1&&"Enter your registered email. We'll send a 6-digit OTP."}
            {step===2&&`OTP sent to ${email}. Check your inbox.`}
            {step===3&&"Create a strong new password for your account."}
          </div>

          {step===1&&(
            <><Field label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" error={errors.email}/>
            <Btn variant="primary" full onClick={sendOTP} disabled={loading}>{loading?<><Spinner size={16}/> SENDING…</>:"SEND OTP →"}</Btn></>
          )}

          {step===2&&(
            <>
              <Tag>6-Digit OTP</Tag>
              <div style={{ display:"flex",gap:8,marginBottom:8 }}>
                {otp.map((d,i)=>(
                  <input key={i} ref={el=>refs.current[i]=el} value={d}
                    onChange={e=>handleOtp(i,e.target.value)}
                    onKeyDown={e=>e.key==="Backspace"&&!d&&i>0&&refs.current[i-1]?.focus()}
                    maxLength={1} inputMode="numeric"
                    style={{ width:48,height:56,textAlign:"center",
                      border:`2px solid ${d?"var(--amber)":"var(--rule)"}`,
                      background:d?"var(--amber-light)":"var(--cream)",
                      fontFamily:"var(--font-display)",fontSize:24,
                      color:"var(--ink)",outline:"none",
                      transition:"border-color .15s, background .15s" }}/>
                ))}
              </div>
              {errors.otp&&<div style={{ fontFamily:"var(--font-sans)",fontSize:11,color:"var(--red)",marginBottom:10 }}>{errors.otp}</div>}
              <div style={{ fontFamily:"var(--font-sans)",fontSize:11,color:"var(--muted)",marginBottom:14 }}>
                {cd>0?`Resend in ${cd}s`:
                  <span onClick={sendOTP} style={{ color:"var(--amber-text)",cursor:"pointer" }}>Resend OTP</span>}
              </div>
              <Btn variant="primary" full onClick={verifyOTP} disabled={loading||otp.join("").length<6}>
                {loading?<><Spinner size={16}/> VERIFYING…</>:"VERIFY →"}
              </Btn>
            </>
          )}

          {step===3&&(
            <><Field label="New Password" type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Min 8 characters" error={errors.pw}/>
            <Field label="Confirm Password" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repeat" error={errors.confirm}/>
            <Btn variant="primary" full onClick={resetPw} disabled={loading}>{loading?<><Spinner size={16}/> UPDATING…</>:"RESET PASSWORD →"}</Btn></>
          )}

          <Rule my={20}/>
          <div style={{ textAlign:"center" }}>
            <span onClick={onBackToLogin} style={{ fontFamily:"var(--font-sans)",fontSize:12,
              color:"var(--amber-text)",cursor:"pointer",
              textDecoration:"underline",textUnderlineOffset:3 }}>← Back to Sign In</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  3. NOTIFICATIONS SCREEN
// ══════════════════════════════════════════════════════════════════════
const MOCK_NOTIFS = [
  { id:1, type:"success", title:"Pass Approved!",      body:"Your quarterly pass BPP·2024·001234 for Red Line has been approved. QR code is ready.",       time:"2 min ago",  read:false },
  { id:2, type:"warn",    title:"Pass Expiring Soon",  body:"Your current pass expires in 7 days. Apply for renewal to avoid disruption.",                  time:"1 hr ago",   read:false },
  { id:3, type:"info",    title:"Blue Line Delay",     body:"Blue Line (R2) running 14 minutes late today due to Ring Road congestion.",                   time:"3 hrs ago",  read:true  },
  { id:4, type:"info",    title:"New Stop Added",      body:"Tech Hub Gate 2 has been added to Red Line from 01 March 2024.",                               time:"Yesterday",  read:true  },
  { id:5, type:"success", title:"Payment Confirmed",   body:"₹1,215 received for pass BPP·2024·001234. Receipt sent to your email.",                       time:"2 days ago", read:true  },
  { id:6, type:"info",    title:"Holiday Notice",      body:"No bus service on 26 Jan (Republic Day). Regular service resumes 27 Jan.",                    time:"1 week ago", read:true  },
];

export function NotificationsScreen() {
  const [notifs,setNotifs]=useState(MOCK_NOTIFS);
  const [filter,setFilter]=useState("ALL");
  const unread=notifs.filter(n=>!n.read).length;

  const markRead=id=>setNotifs(n=>n.map(x=>x.id===id?{...x,read:true}:x));
  const markAll=()=>setNotifs(n=>n.map(x=>({...x,read:true})));
  const del=id=>setNotifs(n=>n.filter(x=>x.id!==id));

  const TYPE_STYLE={
    success:{border:"var(--green)",  bg:"var(--success-bg)",icon:"✓",color:"var(--green)"},
    warn:   {border:"var(--amber-text)",bg:"var(--warn-bg)", icon:"⚠",color:"var(--amber-text)"},
    info:   {border:"var(--ink)",    bg:"var(--surface)",   icon:"◆",color:"var(--ink)"},
  };

  const visible=filter==="ALL"?notifs:
    filter==="UNREAD"?notifs.filter(n=>!n.read):
    notifs.filter(n=>n.type===filter.toLowerCase());

  return (
    <>
      
      <Page>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:28 }}>
          <div>
            <Tag>Inbox</Tag>
            <div style={{ fontFamily:"var(--font-display)",fontSize:40,letterSpacing:1,
              color:"var(--ink)",lineHeight:1 }}>
              NOTIFICATIONS {unread>0&&<span style={{ color:"var(--red)" }}>· {unread}</span>}
            </div>
            <div style={{ fontFamily:"var(--font-sans)",fontSize:13,color:"var(--muted)",marginTop:6 }}>
              {unread>0?`${unread} unread`:"All caught up!"}
            </div>
          </div>
          {unread>0&&<Btn variant="ghost" size="sm" onClick={markAll}>MARK ALL READ</Btn>}
        </div>

        {/* Filter strip */}
        <div style={{ display:"flex",gap:2,marginBottom:24,
          borderBottom:"2px solid var(--rule)" }}>
          {["ALL","UNREAD","SUCCESS","WARN","INFO"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{ padding:"10px 16px",background:"none",border:"none",
                fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:3,
                color:filter===f?"var(--ink)":"var(--muted)",
                borderBottom:`2px solid ${filter===f?"var(--amber)":"transparent"}`,
                cursor:"pointer",marginBottom:-2,transition:"color .18s" }}>{f}</button>
          ))}
        </div>

        <div style={{ display:"flex",flexDirection:"column",gap:6,maxWidth:680 }}>
          {visible.length===0&&(
            <div style={{ textAlign:"center",padding:"60px 0",color:"var(--muted)",
              fontFamily:"var(--font-serif)",fontSize:18,fontStyle:"italic" }}>No notifications here.</div>
          )}
          {visible.map((n,i)=>{
            const s=TYPE_STYLE[n.type]||TYPE_STYLE.info;
            return (
              <div key={n.id} style={{ display:"flex",gap:0,
                border:n.read?"1.5px solid var(--rule)":`1.5px solid ${s.border}`,
                borderRadius:"var(--r-md)",
                background:n.read?"var(--surface)":s.bg,
                animation:`fadeUp .3s ease ${i*.05}s both`,
                position:"relative",overflow:"hidden",
                transition:"background .2s" }}>
                {/* Unread left bar */}
                <div style={{ width:4,background:n.read?"transparent":s.border,flexShrink:0 }}/>
                {/* Type icon strip */}
                <div style={{ width:46,background:n.read?"var(--parchment)":s.border,
                  display:"flex",alignItems:"flex-start",justifyContent:"center",
                  paddingTop:16,flexShrink:0 }}>
                  <span style={{ fontFamily:"var(--font-display)",fontSize:18,
                    color:n.read?"var(--muted)":"white" }}>{s.icon}</span>
                </div>
                {/* Content */}
                <div style={{ flex:1,padding:"14px 16px" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",
                    alignItems:"flex-start",marginBottom:4 }}>
                    <div style={{ fontFamily:"var(--font-sans)",fontSize:14,
                      color:"var(--ink)",fontWeight:n.read?400:600 }}>{n.title}</div>
                    <div style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:2,
                      color:"var(--muted)",flexShrink:0,marginLeft:16 }}>{n.time}</div>
                  </div>
                  <div style={{ fontFamily:"var(--font-sans)",fontSize:13,
                    color:"var(--muted)",lineHeight:1.6 }}>{n.body}</div>
                </div>
                {/* Actions */}
                <div style={{ display:"flex",flexDirection:"column",
                  borderLeft:"1px solid var(--rule)",flexShrink:0 }}>
                  {!n.read&&(
                    <button onClick={()=>markRead(n.id)}
                      style={{ flex:1,background:"none",border:"none",
                        borderBottom:"1px solid var(--rule)",padding:"0 14px",
                        fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:2,
                        color:"var(--muted)",cursor:"pointer",whiteSpace:"nowrap" }}>READ</button>
                  )}
                  <button onClick={()=>del(n.id)}
                    style={{ flex:1,background:"none",border:"none",padding:"0 14px",
                      fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:2,
                      color:"var(--red)",cursor:"pointer" }}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      </Page>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  4. ROUTE MANAGER  (AdminApplications pattern: stats strip + table)
// ══════════════════════════════════════════════════════════════════════
const MOCK_ROUTES = [
  { id:1, name:"Red Line",   code:"R1", color:"#B02020", src:"Central Station", dst:"City Mall",      stops:["Old Market","Hospital Gate","Library Square","IT Park"], km:14.2, fare:380, buses:2, active:true  },
  { id:2, name:"Blue Line",  code:"R2", color:"#1A4A8A", src:"Central Station", dst:"Airport Road",   stops:["Railway Station","Bus Terminal","Ring Road","Outer Ring"], km:22.6, fare:520, buses:1, active:true  },
  { id:3, name:"Green Line", code:"R3", color:"#1E6641", src:"North Zone",      dst:"South End",      stops:["University Gate","Sector 4","Main Market","City Square"], km:16.8, fare:440, buses:1, active:false },
];

export function RouteManager() {
  const [routes,   setRoutes]  = useState(MOCK_ROUTES);
  const [filter,   setFilter]  = useState("ALL");
  const [editRoute,setEditRoute]= useState(null); // null | "new" | route obj
  const [form,     setForm]    = useState({ name:"",code:"",color:"#B02020",src:"",dst:"",fare:"",km:"",stops:"" });
  const [saving,   setSaving]  = useState(false);
  const [compactActions,setCompactActions] = useState(typeof window !== "undefined" ? window.innerWidth < 980 : false);
  const [deleteHover,setDeleteHover] = useState({});
  const toast = useToast();

  useEffect(() => {
    const onResize = () => setCompactActions(window.innerWidth < 980);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const visible = filter==="ALL" ? routes
    : filter==="ACTIVE"   ? routes.filter(r=>r.active)
    : routes.filter(r=>!r.active);

  const counts = {
    ALL:routes.length,
    ACTIVE:routes.filter(r=>r.active).length,
    INACTIVE:routes.filter(r=>!r.active).length,
    BUSES:routes.reduce((s,r)=>s+r.buses,0),
  };

  const openNew  = () => {
    setForm({ name:"",code:"",color:"#B02020",src:"",dst:"",fare:"",km:"",stops:"" });
    setEditRoute("new");
  };
  const openEdit = r => {
    setForm({ name:r.name,code:r.code,color:r.color,src:r.src,dst:r.dst,
      fare:r.fare,km:r.km,stops:r.stops.join(", ") });
    setEditRoute(r);
  };

  const save = async () => {
    if(!form.name.trim()||!form.src.trim()||!form.dst.trim()||!form.fare){ toast.error("Fill all required fields."); return; }
    setSaving(true);
    await new Promise(r=>setTimeout(r,700));
    const stops=form.stops.split(",").map(s=>s.trim()).filter(Boolean);
    if(editRoute==="new"){
      setRoutes(r=>[...r,{ id:Date.now(), ...form, fare:+form.fare, km:+form.km, stops, buses:0, active:true }]);
      toast.success("Route added!");
    } else {
      setRoutes(r=>r.map(x=>x.id===editRoute.id?{...x,...form,fare:+form.fare,km:+form.km,stops}:x));
      toast.success("Route updated!");
    }
    setSaving(false); setEditRoute(null);
  };

  const toggle = id=>{ setRoutes(r=>r.map(x=>x.id===id?{...x,active:!x.active}:x)); toast.info("Route status updated."); };
  const del    = id=>{ if(!window.confirm("Remove this route?")) return; setRoutes(r=>r.filter(x=>x.id!==id)); toast.success("Route removed."); };

  return (
    <>
      
      <Page>
        <PageHeader tag="Admin · Routes" title="ROUTE MANAGER"
          subtitle={`${routes.length} routes configured · ${counts.BUSES} buses deployed`}
          actions={[<Btn key="add" variant="primary" size="sm" onClick={openNew}>+ ADD ROUTE</Btn>]}/>

        {/* ── Stats strip (matches AdminApplications) ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
          borderTop:"3px solid var(--ink)", borderBottom:"1px solid var(--rule)",
          marginBottom:24 }}>
          {[["TOTAL ROUTES",counts.ALL,"var(--ink)"],
            ["ACTIVE",counts.ACTIVE,"var(--green)"],
            ["INACTIVE",counts.INACTIVE,"var(--muted)"],
            ["TOTAL BUSES",counts.BUSES,"var(--amber-text)"]].map(([l,n,c],i)=>(
            <div key={l} style={{ padding:"18px 22px",textAlign:"center",
              borderRight:i<3?"1px solid var(--rule)":"none" }}>
              <div style={{ fontFamily:"var(--font-display)",fontSize:36,letterSpacing:1,
                color:c,lineHeight:1 }}><AnimatedCount target={n}/></div>
              <div style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:3,
                color:"var(--muted)",marginTop:6 }}>ROUTES — {l}</div>
              {l==="TOTAL BUSES"&&(
                <div style={{ marginTop:8,fontSize:14,letterSpacing:2 }}>
                  {"🚌".repeat(counts.BUSES||0)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Filter tabs ── */}
        <div style={{ display:"flex",gap:2,marginBottom:16 }}>
          {["ALL","ACTIVE","INACTIVE"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{ padding:"8px 18px",
                background:filter===f?"var(--ink)":"transparent",
                color:filter===f?"var(--amber-on-ink)":"var(--muted)",
                border:"1.5px solid var(--ink)",fontFamily:"var(--font-mono)",
                fontSize:8,letterSpacing:2,cursor:"pointer",transition:"all .18s" }}>
              {f} ({counts[f]})
            </button>
          ))}
        </div>

        {/* ── Table header ── */}
        <div style={{ display:"grid",
          gridTemplateColumns:"56px 36px 1fr 140px 80px 60px 60px 160px",
          gap:12,padding:"10px 16px",marginBottom:8,
          background:"var(--surface)", borderRadius:"8px",
          border:"1px solid var(--rule)",
          boxShadow:"0 2px 4px rgba(26,18,8,.02)" }}>
          {["LINE","CODE","ROUTE / STOPS","FARE","DIST","STOPS","BUSES","ACTION"].map(h=>(
            <span key={h} style={{ fontFamily:"var(--font-mono)",fontSize:10,
              letterSpacing:3,color:"var(--ink-mid)", fontWeight:700 }}>{h}</span>
          ))}
        </div>

        {/* ── Route rows ── */}
        {visible.length===0&&(
          <div style={{ padding:"48px 24px",textAlign:"center",background:"var(--surface)",
            border:"1.5px solid var(--rule)", borderRadius:"8px" }}>
            <div style={{ fontSize:42, marginBottom:8 }}>🚌</div>
            <div style={{ fontFamily:"var(--font-serif)",fontSize:22,color:"var(--ink)",marginBottom:6 }}>
              No routes yet.
            </div>
            <button onClick={openNew} style={{ background:"none",border:"none",
              fontFamily:"var(--font-display)",fontSize:18,letterSpacing:1,
              color:"var(--amber-text)",cursor:"pointer",textDecoration:"underline",
              textUnderlineOffset:4 }}>
              Add your first route →
            </button>
          </div>
        )}

        {visible.map((r,i)=>{
          const glow = r.color==="#B02020" ? "rgba(176,32,32,0.4)"
            : r.color==="#1A4A8A" ? "rgba(26,74,138,0.4)"
            : r.color==="#1E6641" ? "rgba(30,102,65,0.4)"
            : "rgba(26,18,8,0.25)";
          return (
          <div key={r.id}
            onMouseEnter={e=>{
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,18,8,0.06)";
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(26,18,8,0.04)";
            }}
            style={{ display:"grid",
            gridTemplateColumns:"56px 36px 1fr 140px 80px 60px 60px 160px",
            gap:12,padding:"14px 16px",
            alignItems:"center", marginBottom:8,
            borderRadius:"8px", border:"1px solid var(--rule)",
            borderLeft:`4px solid ${r.color}`,
            background:"var(--surface)",
            boxShadow:"0 2px 8px rgba(26,18,8,0.04)",
            backgroundImage:!r.active
              ? "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(26,18,8,.02) 8px, rgba(26,18,8,.02) 9px)"
              : "none",
            transition:"all .22s cubic-bezier(0.16, 1, 0.3, 1)",
            animation:`fadeUp .4s cubic-bezier(0.16, 1, 0.3, 1) ${i*.06}s both` }}>

            {/* Line colour badge */}
            <div style={{ background:r.color,padding:"6px 8px", borderRadius:"6px",
              display:"flex",flexDirection:"column",alignItems:"center",gap:2,
              boxShadow:`0 0 8px ${glow}` }}>
              <div style={{ fontFamily:"var(--font-display)",fontSize:15,letterSpacing:1,
                color:"white",lineHeight:1 }}>{r.code}</div>
            </div>

            {/* Status dot */}
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center" }}>
              <div style={{ width:10,height:10,borderRadius:"50%",
                background:r.active?"var(--green)":"var(--muted)",
                animation:r.active?"pulse 2s ease-in-out infinite":"none" }}/>
            </div>

            {/* Route name + stops */}
            <div>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                <div style={{ fontFamily:"var(--font-display)",fontSize:18,
                  letterSpacing:1,color:"var(--ink)" }}>{r.name}</div>
                <Pill s={r.active?"ACTIVE":"INACTIVE"}/>
              </div>
              <div style={{ fontFamily:"var(--font-sans)",fontSize:11,color:"var(--muted)",marginBottom:5 }}>
                {r.src} → {r.dst}
              </div>
              <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
                {r.stops.map(s=>(
                  <span key={s} style={{ fontFamily:"var(--font-mono)",fontSize:6,letterSpacing:1,
                    color:"var(--amber-text)",background:"var(--parchment)",
                    padding:"1px 7px",border:"1px solid var(--rule)" }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Fare */}
            <div>
              <div style={{ fontFamily:"var(--font-display)",fontSize:22,letterSpacing:1,
                color:"var(--ink)",lineHeight:1 }}>₹{r.fare}</div>
              <div style={{ fontFamily:"var(--font-mono)",fontSize:6,letterSpacing:2,
                color:"var(--muted)",marginTop:3 }}>PER MONTH</div>
            </div>

            {/* Distance */}
            <div style={{ fontFamily:"var(--font-mono)",fontSize:11,color:"var(--muted)" }}>{r.km}km</div>

            {/* Stops count */}
            <div style={{ fontFamily:"var(--font-display)",fontSize:20,color:"var(--ink)",textAlign:"center" }}>{r.stops.length+2}</div>

            {/* Buses */}
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"var(--font-display)",fontSize:22,color:"var(--ink)" }}>{r.buses}</div>
              <div style={{ fontFamily:"var(--font-mono)",fontSize:6,letterSpacing:2,color:"var(--muted)" }}>BUSES</div>
            </div>

            {/* Actions */}
            <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
              <button onClick={()=>openEdit(r)} style={{ padding:"4px 10px",background:"none",
                border:"1px solid var(--rule)",fontFamily:"var(--font-mono)",fontSize:7,
                letterSpacing:1,color:"var(--muted)",cursor:"pointer" }}>
                {compactActions?"✎":"EDIT"}
              </button>
              <button onClick={()=>toggle(r.id)}
                style={{ padding:"4px 10px",
                  background:r.active?"none":"var(--green)",
                  border:`1px solid ${r.active?"var(--amber-text)":"var(--green)"}`,
                  fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:1,
                  color:r.active?"var(--amber-text)":"white",cursor:"pointer" }}>
                {compactActions?(r.active?"⏻":"▶"):(r.active?"DISABLE":"ENABLE")}
              </button>
              <button onClick={()=>del(r.id)}
                onMouseEnter={()=>setDeleteHover(h=>({...h,[r.id]:true}))}
                onMouseLeave={()=>setDeleteHover(h=>({...h,[r.id]:false}))}
                style={{ padding:"4px 10px",background:deleteHover[r.id]?"var(--red)":"none",
                border:"1px solid var(--red)",fontFamily:"var(--font-mono)",fontSize:7,
                letterSpacing:1,color:deleteHover[r.id]?"var(--cream-on-ink)":"var(--red)",
                cursor:"pointer",transition:"background .18s, color .18s" }}>
                {deleteHover[r.id]?"DELETE?":(compactActions?"🗑":"DEL")}
              </button>
            </div>
          </div>
        );})}

        {visible.length < 4 && (
          <div style={{ position:"sticky", bottom:16, marginTop:18, padding:"14px 18px", background:"var(--ink)", color:"var(--cream-on-ink)", border:"1.5px solid var(--ink)", display:"flex", justifyContent:"space-between", alignItems:"center", gap:16 }}>
            <div>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:3, color:"var(--muted-on-ink)", marginBottom:4 }}>SPARSE ROUTE VIEW</div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:18, letterSpacing:2, color:"var(--amber-on-ink)" }}>ADD ONE MORE ROUTE OR OPEN THE EDITOR</div>
            </div>
            <Btn variant="ghost" size="sm" onClick={openNew}>+ ADD ROUTE</Btn>
          </div>
        )}

        {/* ── Add / Edit side panel ── */}
        {editRoute&&(
          <div style={{ position:"fixed",inset:0,background:"rgba(26,18,8,.6)",
            display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,
            animation:"fadeIn .2s ease" }} onClick={()=>setEditRoute(null)}>
            <div style={{ background:"var(--cream)",border:"2px solid var(--ink)",
              borderRadius:"var(--r-xl)",overflow:"hidden",
              width:520,maxHeight:"85vh",overflowY:"auto",
              animation:"slideUp .3s var(--ease-spring)",
              boxShadow:"0 24px 80px rgba(26,18,8,.22)" }}
              onClick={e=>e.stopPropagation()}>

              {/* Panel header */}
              <div style={{ background:"var(--ink)",padding:"16px 24px",
                display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div>
                  <div style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:4,
                    color:"var(--muted-on-ink)",marginBottom:3 }}>
                    {editRoute==="new"?"NEW ROUTE":"EDIT ROUTE"}</div>
                  <div style={{ fontFamily:"var(--font-display)",fontSize:20,letterSpacing:2,
                    color:"var(--amber-on-ink)" }}>
                    {editRoute==="new"?"ADD ROUTE":form.name||"EDIT"}
                  </div>
                </div>
                <button onClick={()=>setEditRoute(null)} style={{ background:"none",border:"none",
                  color:"var(--muted-on-ink)",fontFamily:"var(--font-display)",
                  fontSize:20,cursor:"pointer",lineHeight:1 }}>✕</button>
              </div>

              <div style={{ padding:"24px" }}>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px" }}>
                  <Field label="Route Name *" value={form.name}
                    onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Red Line"/>
                  <Field label="Code" value={form.code}
                    onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))} placeholder="R1"/>
                  <Field label="Source *" value={form.src}
                    onChange={e=>setForm(f=>({...f,src:e.target.value}))} placeholder="Central Station"/>
                  <Field label="Destination *" value={form.dst}
                    onChange={e=>setForm(f=>({...f,dst:e.target.value}))} placeholder="City Mall"/>
                  <Field label="Fare ₹/month *" type="number" value={form.fare}
                    onChange={e=>setForm(f=>({...f,fare:e.target.value}))} placeholder="380"/>
                  <Field label="Distance km" type="number" value={form.km}
                    onChange={e=>setForm(f=>({...f,km:e.target.value}))} placeholder="14.2"/>
                </div>

                {/* Line colour picker */}
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:3,
                    color:"var(--muted)",textTransform:"uppercase",marginBottom:7 }}>LINE COLOUR</div>
                  <div style={{ display:"flex",gap:8 }}>
                    {["#B02020","#1A4A8A","#1E6641","#C8832A","#6B5535"].map(c=>(
                      <button key={c} onClick={()=>setForm(f=>({...f,color:c}))}
                        style={{ width:32,height:32,background:c,border:
                          form.color===c?"3px solid var(--ink)":"2px solid transparent",
                          cursor:"pointer",transition:"border .15s" }}/>
                    ))}
                  </div>
                </div>

                <Field label="Intermediate Stops (comma-separated)"
                  value={form.stops}
                  onChange={e=>setForm(f=>({...f,stops:e.target.value}))}
                  placeholder="Old Market, Hospital Gate, Library Square"
                  hint="Source and destination are added automatically"/>

                <div style={{ display:"flex",gap:10,marginTop:8 }}>
                  <Btn variant="primary" size="md" onClick={save} disabled={saving}>
                    {saving?<><Spinner size={16}/> SAVING…</>:editRoute==="new"?"ADD ROUTE →":"SAVE CHANGES →"}
                  </Btn>
                  <Btn variant="ghost" size="md" onClick={()=>setEditRoute(null)}>CANCEL</Btn>
                </div>
              </div>
            </div>
          </div>
        )}
      </Page>
      <toast.Toaster/>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  5. USER MANAGER
// ══════════════════════════════════════════════════════════════════════
const MOCK_USERS = [
  { id:"STU-10042", name:"Aryan Sharma",  email:"aryan@mail.com",  type:"student",   passStatus:"ACTIVE",   joined:"Aug 2021",  dept:"CS",   year:"IV" },
  { id:"STU-10018", name:"Priya Patel",   email:"priya@mail.com",  type:"student",   passStatus:"PENDING",  joined:"Aug 2020",  dept:"ME",   year:"IV" },
  { id:"GEN-10031", name:"Rahul Kumar",   email:"rahul@mail.com",  type:"general",   passStatus:"EXPIRED",  joined:"Jan 2023",  dept:"—",    year:"—"  },
  { id:"SEN-10027", name:"Ramesh Sharma", email:"ramesh@mail.com", type:"senior",    passStatus:"ACTIVE",   joined:"Mar 2023",  dept:"—",    year:"—"  },
  { id:"COR-10045", name:"Sneha Iyer",    email:"sneha@corp.com",  type:"corporate", passStatus:"ACTIVE",   joined:"Feb 2024",  dept:"—",    year:"—"  },
  { id:"COND-001",  name:"Mohan Kumar",   email:"mohan@mail.com",  type:"conductor", passStatus:"—",        joined:"Jan 2022",  dept:"—",    year:"—"  },
];

const PTYPE_COLOR = { student:"#1E6641",general:"#1A1208",senior:"#C8832A",
  differently_abled:"#3D2410",corporate:"#6B5535",conductor:"#1A4A8A",admin:"#B02020" };
const PTYPE_ICON  = { student:"🎓",general:"👤",senior:"🪴",differently_abled:"♿",corporate:"💼",conductor:"🔍",admin:"⚙" };

export function UserManager() {
  const [users,setUsers]=useState(MOCK_USERS);
  const [search,setSearch]=useState("");
  const [typeFilter,setTypeFilter]=useState("ALL");
  const [selected,setSelected]=useState(null);
  const toast=useToast();

  const visible=users.filter(u=>
    (typeFilter==="ALL"||u.type===typeFilter.toLowerCase())&&
    (u.name.toLowerCase().includes(search.toLowerCase())||
     u.email.toLowerCase().includes(search.toLowerCase())||
     u.id.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = {
    ALL:users.length,
    ACTIVE:users.filter(u=>u.passStatus==="ACTIVE").length,
    student:users.filter(u=>u.type==="student").length,
    general:users.filter(u=>u.type==="general").length,
  };

  return (
    <>
      
      <div style={{ display:"flex",minHeight:"calc(100vh - 62px)",background:"var(--cream)" }}>

        {/* Left — list */}
        <div style={{ flex:1,padding:"36px 32px",borderRight:"1px solid var(--rule)" }}>
          <PageHeader tag="Admin · Passengers" title="PASSENGER MANAGER"
            subtitle={`${users.length} registered · ${counts.ACTIVE} with active pass`}/>

          {/* Search + filter */}
          <div style={{ display:"flex",gap:8,marginBottom:14 }}>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search name, email, ID…"
              style={{ flex:1,padding:"10px 14px",border:"1.5px solid var(--rule)",
                borderRadius:"var(--r-sm)",
                background:"var(--surface)",fontFamily:"var(--font-sans)",
                fontSize:13,color:"var(--ink)",outline:"none" }}/>
          </div>
          <div style={{ display:"flex",gap:4,marginBottom:16 }}>
            {["ALL","STUDENT","GENERAL","SENIOR","CORPORATE","CONDUCTOR"].map(f=>(
              <button key={f} onClick={()=>setTypeFilter(f)}
                style={{ padding:"6px 12px",
                  background:typeFilter===f?"var(--ink)":"transparent",
                  color:typeFilter===f?"var(--amber-on-ink)":"var(--muted)",
                  border:"1.5px solid var(--ink)",fontFamily:"var(--font-mono)",
                  fontSize:7,letterSpacing:2,cursor:"pointer",transition:"all .18s" }}>
                {f}
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ display:"grid",gridTemplateColumns:"90px 1fr 90px 80px",
            gap:12,padding:"10px 16px",marginBottom:8,
            background:"var(--surface)", borderRadius:"8px",
            border:"1px solid var(--rule)",
            boxShadow:"0 2px 4px rgba(26,18,8,.02)" }}>
            {["ID","NAME / EMAIL","TYPE","PASS"].map(h=>(
              <div key={h} style={{ fontFamily:"var(--font-mono)",fontSize:10,
                letterSpacing:3,color:"var(--ink-mid)", fontWeight:700 }}>{h}</div>
            ))}
          </div>
          {visible.map((u,i)=>(
            <div key={u.id} onClick={()=>setSelected(u)}
              style={{ display:"grid",gridTemplateColumns:"90px 1fr 90px 80px",
                gap:12,padding:"14px 16px",alignItems:"center",cursor:"pointer",
                background:selected?.id===u.id?"var(--parchment)":"var(--surface)",
                marginBottom:8,
                borderRadius:"8px", border:"1px solid var(--rule)",
                borderLeft:`4px solid ${selected?.id===u.id?"var(--amber)":"transparent"}`,
                boxShadow:"0 2px 8px rgba(26,18,8,0.04)",
                transition:"all .2s ease",
                onMouseEnter:e=>e.currentTarget.style.transform="translateY(-2px)",
                onMouseLeave:e=>e.currentTarget.style.transform="none",
                animation:`fadeUp .4s cubic-bezier(0.16, 1, 0.3, 1) ${i*.05}s both` }}>
              <div style={{ fontFamily:"var(--font-mono)",fontSize:11,letterSpacing:1,
                color:"var(--amber-text)", fontWeight:600 }}>{u.id}</div>
              <div>
                <div style={{ fontFamily:"var(--font-sans)",fontSize:14,
                  color:"var(--ink)",fontWeight:600 }}>{u.name}</div>
                <div style={{ fontFamily:"var(--font-sans)",fontSize:12,
                  color:"var(--muted)" }}>{u.email}</div>
              </div>
              <div style={{ display:"inline-flex",alignItems:"center",gap:6 }}>
                <span style={{ fontSize:14 }}>{PTYPE_ICON[u.type]||"👤"}</span>
                <span style={{ fontFamily:"var(--font-mono)",fontSize:9,letterSpacing:1,
                  color:"var(--ink-mid)",textTransform:"uppercase",fontWeight:600 }}>{u.type}</span>
              </div>
              {u.passStatus!=="—"?<Pill s={u.passStatus}/>:
                <span style={{ fontFamily:"var(--font-mono)",fontSize:10,color:"var(--muted)", fontWeight:600 }}>—</span>}
            </div>
          ))}
        </div>

        {/* Right — detail */}
        <div style={{ width:320,padding:"36px 24px",background:"var(--surface)",
          borderLeft:"1px solid var(--rule)",position:"sticky",top:62,
          alignSelf:"flex-start",maxHeight:"calc(100vh - 62px)",overflowY:"auto" }}>
          {!selected?(
            <div style={{ textAlign:"center",paddingTop:80,color:"var(--muted)" }}>
              <div style={{ fontFamily:"var(--font-display)",fontSize:32,
                letterSpacing:1,marginBottom:8 }}>SELECT</div>
              <div style={{ fontFamily:"var(--font-serif)",fontSize:14,
                fontStyle:"italic" }}>Click a passenger to view details</div>
            </div>
          ):(
            <div style={{ animation:"slideInRight .3s ease" }}>
              {/* Avatar */}
              <div style={{ width:56,height:56,
                background:PTYPE_COLOR[selected.type]||"var(--muted)",
                display:"flex",alignItems:"center",justifyContent:"center",
                marginBottom:14,fontSize:24 }}>
                {PTYPE_ICON[selected.type]||"👤"}
              </div>
              <div style={{ fontFamily:"var(--font-serif)",fontSize:20,
                color:"var(--ink)",marginBottom:4 }}>{selected.name}</div>
              <div style={{ fontFamily:"var(--font-sans)",fontSize:12,
                color:"var(--muted)",marginBottom:4 }}>{selected.email}</div>
              <div style={{ display:"inline-flex",alignItems:"center",gap:6,
                padding:"3px 10px",marginBottom:16,
                background:PTYPE_COLOR[selected.type]||"var(--muted)" }}>
                <span style={{ fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:2,
                  color:"white",fontWeight:700 }}>{selected.type.toUpperCase()}</span>
              </div>
              <Rule my={14}/>
              {[["ID",selected.id],["Dept",selected.dept],["Year",selected.year],
                ["Pass Status",selected.passStatus],["Member Since",selected.joined]].map(([l,v])=>(
                <div key={l} style={{ display:"flex",justifyContent:"space-between",
                  padding:"8px 0",borderBottom:"1px solid var(--rule)" }}>
                  <span style={{ fontFamily:"var(--font-mono)",fontSize:8,
                    letterSpacing:2,color:"var(--muted)" }}>{l}</span>
                  <span style={{ fontFamily:"var(--font-sans)",fontSize:12,
                    color:"var(--ink)",fontWeight:500 }}>{v}</span>
                </div>
              ))}
              <div style={{ display:"flex",flexDirection:"column",gap:8,marginTop:18 }}>
                <Btn variant="secondary" size="sm" full
                  onClick={()=>toast.info("Pass history opened.")}>VIEW PASSES</Btn>
                <Btn variant="danger" size="sm" full
                  onClick={()=>toast.warn("User suspended.")}>SUSPEND USER</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
      <toast.Toaster/>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  6. ANALYTICS DASHBOARD
// ══════════════════════════════════════════════════════════════════════
function MiniBar({ data, maxVal, color="var(--amber)", height=90 }) {
  const [hoverIdx,setHoverIdx] = useState(null);

  return (
    <div style={{ position:"relative",display:"flex",alignItems:"flex-end",gap:4,height,paddingTop:8 }}>
      {[25,50,75,100].map((pct, idx) => (
        <div key={idx} style={{ position:"absolute",left:0,right:0,bottom:`${pct}%`,
          borderTop:"1px solid rgba(26,18,8,0.06)",pointerEvents:"none" }}/>
      ))}
      {data.map((d,i)=>(
        <div key={i} onMouseEnter={()=>setHoverIdx(i)} onMouseLeave={()=>setHoverIdx(null)}
          style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,position:"relative" }}>
          {hoverIdx===i && (
            <div style={{ position:"absolute",top:-6,left:"50%",transform:"translate(-50%,-100%)",
              background:"var(--ink)",color:"var(--amber-on-ink)",padding:"4px 8px",
              fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:1,whiteSpace:"nowrap",
              border:"1px solid var(--amber-text)",zIndex:3 }}>
              {d.h}: {d.v}
            </div>
          )}
          <div style={{ fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:1,
            color:"var(--amber-text)" }}>{d.v}</div>
          <div style={{ width:"100%",background:color,
            height:`${(d.v/maxVal)*(height-20)}px`,minHeight:2,
            animation:`barGrow 0.6s var(--ease-spring) ${i*0.06}s both` }}/>
          <div style={{ fontFamily:"var(--font-mono)",fontSize:6,letterSpacing:1,
            color:"var(--muted)" }}>{d.h}</div>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsDashboard() {
  const [period,setPeriod]=useState("week");

  const DEMAND=[{h:"MON",v:182},{h:"TUE",v:210},{h:"WED",v:195},
    {h:"THU",v:220},{h:"FRI",v:198},{h:"SAT",v:88},{h:"SUN",v:42}];
  const REVENUE=[{h:"JAN",v:48},{h:"FEB",v:52},{h:"MAR",v:61},
    {h:"APR",v:58},{h:"MAY",v:43},{h:"JUN",v:39}];
  const ROUTE_SPLIT=[
    {name:"Red Line",  pct:52,color:"#B02020"},
    {name:"Blue Line", pct:31,color:"#1A4A8A"},
    {name:"Green Line",pct:17,color:"#1E6641"},
  ];

  const BIG=[
    {num:"243",   lbl:"ACTIVE PASSES",  delta:"+12",   up:true,  c:"var(--amber-text)", val:243},
    {num:"₹1.8L", lbl:"MONTHLY REVENUE",delta:"+8%",   up:true,  c:"var(--green)",      val:0},
    {num:"4,820", lbl:"WEEKLY SCANS",   delta:"-3%",   up:false, c:"var(--ink)",        val:4820},
    {num:"97.2%", lbl:"SCAN SUCCESS",   delta:"stable",up:true,  c:"var(--ink)",        val:0},
  ];

  return (
    <Page>
      <div style={{ display:"flex",justifyContent:"space-between",
        alignItems:"flex-end",marginBottom:32 }}>
        <div>
          <Tag>Admin · Analytics</Tag>
          <div style={{ fontFamily:"var(--font-display)",fontSize:48,
            letterSpacing:1,color:"var(--ink)",lineHeight:1, textShadow:"0 2px 4px rgba(26,18,8,0.05)" }}>ANALYTICS ENGINE</div>
          <div style={{ fontFamily:"var(--font-sans)",fontSize:15,
            color:"var(--muted)",marginTop:8, fontWeight:500 }}>Real-time transit metrics.</div>
        </div>
        {/* Period selector */}
        <div style={{ display:"flex", background:"var(--surface)", 
          border:"1.5px solid var(--rule)", borderRadius:"8px", overflow:"hidden", 
          boxShadow:"0 2px 8px rgba(26,18,8,0.04)" }}>
          {["week","month","year"].map(p=>(
            <button key={p} onClick={()=>setPeriod(p)}
              style={{ padding:"10px 24px",
                background:period===p?"var(--ink)":"transparent",
                color:period===p?"var(--amber-on-ink)":"var(--muted)",
                border:"none",borderRight:p!=="year"?"1px solid var(--rule)":"none",
                fontFamily:"var(--font-mono)",fontSize:11,letterSpacing:2, fontWeight:700,
                cursor:"pointer",transition:"all .2s ease",textTransform:"uppercase" }}>{p}</button>
          ))}
        </div>
      </div>

      {/* ── Big stats strip ── */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:32 }}>
        {BIG.map((s,i)=>(
          <div key={s.lbl} style={{ padding:"24px 28px", background:"var(--surface)",
            borderRadius:"12px", border:"1px solid var(--rule)",
            boxShadow:"0 4px 12px rgba(26,18,8,0.04), 0 1px 3px rgba(26,18,8,0.02)",
            animation:`fadeUp .5s cubic-bezier(0.16, 1, 0.3, 1) ${i*.08}s both`,
            transition:"transform .2s ease, box-shadow .2s ease",
            onMouseEnter:e=>{
              e.currentTarget.style.transform="translateY(-3px)";
              e.currentTarget.style.boxShadow="0 8px 24px rgba(26,18,8,0.08)";
            },
            onMouseLeave:e=>{
              e.currentTarget.style.transform="none";
              e.currentTarget.style.boxShadow="0 4px 12px rgba(26,18,8,0.04), 0 1px 3px rgba(26,18,8,0.02)";
            } }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:2,
                  color:"var(--ink-mid)",marginBottom:12,fontWeight:700 }}>{s.lbl}</div>
                <div style={{ fontFamily:"var(--font-display)",fontSize:48,letterSpacing:1,
                  color:s.c,lineHeight:1,animation:"inkReveal .7s ease both",
                  animationDelay:`${i*.1+.2}s` }}>
                  {s.val ? <AnimatedCount target={s.val}/> : s.num}
                </div>
              </div>
              <div style={{ fontFamily:"var(--font-sans)",fontSize:13, fontWeight:600,
                color:s.up?"var(--green)":"var(--red)",
                display:"flex",alignItems:"center",gap:4,
                background:s.up?"var(--success-bg)":"var(--error-bg)",
                padding:"6px 10px", borderRadius:"6px", opacity:0,
                animation:`slideDown .4s cubic-bezier(0.16, 1, 0.3, 1) ${0.55 + i*0.08}s both` }}>
                <span style={{fontSize:16, lineHeight:1}}>{s.up?"↗":"↘"}</span><span>{s.delta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 320px",gap:20,marginBottom:32 }}>

        {/* Ridership bar chart */}
        <div style={{ border:"1px solid var(--rule)",borderRadius:"12px",background:"var(--surface)",padding:"28px", boxShadow:"0 4px 12px rgba(26,18,8,0.03)" }}>
          <Tag>Daily Ridership</Tag>
          <div style={{ fontFamily:"var(--font-serif)",fontSize:24,color:"var(--ink)",marginBottom:24 }}>Passenger Trips</div>
          <MiniBar data={DEMAND} maxVal={250} color="var(--amber)" height={160}/>
        </div>

        {/* Revenue bar chart */}
        <div style={{ border:"1px solid var(--rule)",borderRadius:"12px",background:"var(--surface)",padding:"28px", boxShadow:"0 4px 12px rgba(26,18,8,0.03)" }}>
          <Tag>Financials</Tag>
          <div style={{ fontFamily:"var(--font-serif)",fontSize:24,color:"var(--ink)",marginBottom:24 }}>Revenue (₹K)</div>
          <MiniBar data={REVENUE} maxVal={65} color="var(--green)" height={160}/>
        </div>

        {/* Route distribution */}
        <div style={{ border:"1px solid var(--rule)",borderRadius:"12px",background:"var(--surface)",padding:"28px", boxShadow:"0 4px 12px rgba(26,18,8,0.03)" }}>
          <Tag>Distribution</Tag>
          <div style={{ fontFamily:"var(--font-serif)",fontSize:24,color:"var(--ink)",marginBottom:24 }}>By Route</div>
          {ROUTE_SPLIT.map((r,i)=>(
            <div key={r.name} style={{ marginBottom:18,
              animation:`slideInRight .4s ease ${i*.1}s both` }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8,
                alignItems:"center" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:12,height:12,background:r.color, borderRadius:"3px" }}/>
                  <span style={{ fontFamily:"var(--font-sans)",fontSize:14, fontWeight:600,
                    color:"var(--ink)" }}>{r.name}</span>
                </div>
                <span style={{ fontFamily:"var(--font-display)",fontSize:20,
                  color:"var(--ink)",letterSpacing:1 }}>{r.pct}%</span>
              </div>
              <div style={{ height:8,background:"var(--parchment)",position:"relative", borderRadius:"4px", overflow:"hidden" }}>
                <div style={{ position:"absolute",left:0,top:0,height:"100%",
                  width:`${r.pct}%`,background:r.color, borderRadius:"4px",
                  transition:"width .8s var(--ease-spring)" }}/>
              </div>
            </div>
          ))}
          <div style={{ borderTop:"1px solid var(--rule)", margin:"24px 0 20px" }}/>
          <div style={{ fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:3, fontWeight:700,
            color:"var(--ink-mid)",marginBottom:14,textTransform:"uppercase" }}>BY PASS DURATION</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10 }}>
            {[["ANNUAL",38,"var(--ink)"],["QUARTERLY",45,"var(--amber-text)"],["MONTHLY",17,"var(--muted)"]].map(([t,p,c])=>(
              <div key={t} style={{ background:"var(--cream)",padding:"14px 10px", borderRadius:"8px",
                textAlign:"center",border:"1px solid var(--rule)" }}>
                <div style={{ fontFamily:"var(--font-display)",fontSize:26,
                  color:c,lineHeight:1,marginBottom:4 }}>{p}%</div>
                <div style={{ fontFamily:"var(--font-mono)",fontSize:8, fontWeight:700,
                  letterSpacing:1,color:"var(--muted)" }}>{t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent applications log ── */}
      <div style={{ border:"1px solid var(--rule)",borderRadius:"12px",background:"var(--surface)", boxShadow:"0 4px 16px rgba(26,18,8,0.04)", overflow:"hidden" }}>
        <div style={{ padding:"20px 28px",borderBottom:"1px solid var(--rule)",
          display:"flex",justifyContent:"space-between",alignItems:"center",
          background:"var(--surface)" }}>
          <div>
            <Tag>Live Feed</Tag>
            <div style={{ fontFamily:"var(--font-display)",fontSize:24,
              letterSpacing:2,color:"var(--ink)", textShadow:"0 1px 2px rgba(26,18,8,0.05)" }}>RECENT APPLICATIONS</div>
          </div>
          <Btn variant="secondary" size="sm">VIEW ALL LOGS →</Btn>
        </div>

          <div style={{ display:"grid",
            gridTemplateColumns:"110px 1.5fr 1fr 100px 80px",
            gap:16,padding:"10px 24px",borderBottom:"1.5px solid var(--rule)" }}>
            {["TIMESTAMP","PASSENGER","ROUTE","PLAN","STATUS"].map(h=>(
              <div key={h} style={{ fontFamily:"var(--font-mono)",fontSize:7,
                letterSpacing:3,color:"var(--muted)" }}>{h}</div>
            ))}
          </div>

          {[["03 Mar · 09:12","Aryan Sharma",  "Red Line",  "Quarterly","APPROVED"],
            ["02 Mar · 14:45","Priya Patel",   "Blue Line", "Monthly",  "PENDING"],
            ["01 Mar · 11:20","Rahul Kumar",   "Red Line",  "Annual",   "APPROVED"],
            ["28 Feb · 16:05","Sneha Iyer",    "Green Line","Quarterly","REJECTED"],
            ["27 Feb · 08:30","Vikram Singh",  "Blue Line", "Monthly",  "APPROVED"],
          ].map(([date,name,route,type,status],i)=>(
            <div key={i} style={{ display:"grid",
              gridTemplateColumns:"110px 1.5fr 1fr 100px 80px",
              gap:16,padding:"14px 24px",alignItems:"center",
              borderLeft:`4px solid ${LINE_COLORS[route]||"var(--rule)"}`,
              borderBottom:i<4?"1px solid var(--rule)":"none",
              background:i%2===0?"transparent":"var(--cream)",
              transition:"background .18s",cursor:"pointer" }}
              onMouseEnter={e=>e.currentTarget.style.background="var(--parchment)"}
              onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"transparent":"var(--cream)"}>
              <span style={{ fontFamily:"var(--font-mono)",fontSize:9,color:"var(--muted)" }}>{date}</span>
              <span style={{ fontFamily:"var(--font-sans)",fontSize:13,color:"var(--ink)",fontWeight:500 }}>{name}</span>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <LineBadge name={route} small/>
              </div>
              <span style={{ fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:1,
                color:"var(--ink)",background:"var(--parchment)",
                padding:"3px 8px",textAlign:"center",display:"inline-block" }}>
                {type.toUpperCase()}
              </span>
              <Pill s={status}/>
            </div>
          ))}
        </div>
      </Page>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  7. ANNOUNCEMENT SENDER
// ══════════════════════════════════════════════════════════════════════
export function AnnouncementSender() {
  const [form,setForm]=useState({ title:"",body:"",audience:"all",route:"all",type:"info" });
  const [sending,setSending]=useState(false);
  const [sent,setSent]=useState([]);
  const toast=useToast();
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));

  const send=async()=>{
    if(!form.title.trim()||!form.body.trim()){toast.error("Title and message are required.");return;}
    setSending(true); await new Promise(r=>setTimeout(r,900));
    setSent(s=>[{...form,time:"Just now",id:Date.now()},...s]);
    setForm({title:"",body:"",audience:"all",route:"all",type:"info"});
    setSending(false); toast.success("Announcement sent!");
  };

  const AUDIENCES=[["all","All Users"],["passengers","Passengers Only"],["conductors","Conductors Only"]];
  const ROUTES=[["all","All Routes"],["r1","Red Line"],["r2","Blue Line"],["r3","Green Line"]];
  const TYPES=[
    {id:"info",    label:"◆ General Info", color:"var(--ink)"},
    {id:"warn",    label:"⚠ Warning",      color:"var(--amber-text)"},
    {id:"success", label:"✓ Good News",    color:"var(--green)"},
  ];

  return (
    <>
      <Page>
        <PageHeader tag="Admin · Announcements" title="ANNOUNCEMENTS"
          subtitle="Broadcast messages to passengers and conductors"/>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 360px",gap:28,alignItems:"start" }}>

          {/* Compose */}
          <div style={{ border:"1.5px solid var(--rule)",borderRadius:"var(--r-sm)",background:"var(--surface)" }}>
            <div style={{ background:"var(--ink)",padding:"14px 22px" }}>
              <Tag color="var(--muted-on-ink)">Compose</Tag>
              <div style={{ fontFamily:"var(--font-display)",fontSize:20,letterSpacing:2,
                color:"var(--amber-on-ink)" }}>NEW ANNOUNCEMENT</div>
            </div>
            <div style={{ padding:"22px" }}>
              <Field label="Title *" value={form.title}
                onChange={e=>set("title",e.target.value)} placeholder="Route B Delay Notice"/>
              <Field label="Message Body *" value={form.body}
                onChange={e=>set("body",e.target.value)} rows={5}
                placeholder="Route Beta is running ~15 minutes late today due to heavy traffic near Ring Road."/>
              <div style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:2,
                color:"var(--muted)",marginBottom:16 }}>{form.body.length} CHARACTERS</div>

              {/* Type selection — visual buttons, not select */}
              <Tag>TYPE</Tag>
              <div style={{ display:"flex",gap:8,marginBottom:16 }}>
                {TYPES.map(t=>(
                  <button key={t.id} onClick={()=>set("type",t.id)}
                    style={{ flex:1,padding:"9px 12px",
                      background:form.type===t.id?"var(--parchment)":"transparent",
                      border:`1.5px solid ${form.type===t.id?"var(--ink)":"var(--rule)"}`,
                      fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:1,
                      color:form.type===t.id?"var(--ink)":"var(--muted)",
                      cursor:"pointer",transition:"all .18s" }}>{t.label}</button>
                ))}
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px" }}>
                <Sel label="Audience" value={form.audience}
                  onChange={e=>set("audience",e.target.value)} options={AUDIENCES}/>
                <Sel label="Route Filter" value={form.route}
                  onChange={e=>set("route",e.target.value)} options={ROUTES}/>
              </div>

              {/* Preview */}
              {form.title&&(
                <div style={{ border:"1.5px solid var(--rule)",borderRadius:"var(--r-md)",padding:"14px 16px",
                  background:"var(--parchment)",marginBottom:16 }}>
                  <div style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:3,
                    color:"var(--muted)",marginBottom:6 }}>PREVIEW</div>
                  <div style={{ fontFamily:"var(--font-sans)",fontSize:14,
                    color:"var(--ink)",fontWeight:600 }}>{form.title}</div>
                  <div style={{ fontFamily:"var(--font-sans)",fontSize:13,
                    color:"var(--muted)",marginTop:4,lineHeight:1.5 }}>{form.body||"—"}</div>
                </div>
              )}

              <Btn variant="primary" full size="md" onClick={send} disabled={sending}>
                {sending?<><Spinner size={16}/> SENDING…</>:"📢 SEND ANNOUNCEMENT →"}
              </Btn>
            </div>
          </div>

          {/* Sent history */}
          <div>
            <Tag>Previously Sent</Tag>
            {sent.length===0&&(
              <div style={{ fontFamily:"var(--font-serif)",fontSize:15,color:"var(--muted)",
                fontStyle:"italic",padding:"20px 0" }}>No announcements sent yet.</div>
            )}
            {sent.map((a,i)=>(
              <div key={a.id} style={{ border:"1.5px solid var(--rule)",borderRadius:"var(--r-sm)",
                background:"var(--surface)",padding:"14px 18px",marginBottom:10,
                animation:"slideDown .3s ease" }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                  <div style={{ fontFamily:"var(--font-sans)",fontSize:13,
                    color:"var(--ink)",fontWeight:600 }}>{a.title}</div>
                  <div style={{ fontFamily:"var(--font-mono)",fontSize:7,
                    letterSpacing:2,color:"var(--muted)" }}>{a.time}</div>
                </div>
                <div style={{ fontFamily:"var(--font-sans)",fontSize:12,
                  color:"var(--muted)",lineHeight:1.5,marginBottom:8 }}>
                  {a.body.slice(0,80)}…
                </div>
                <div style={{ display:"flex",gap:6,alignItems:"center" }}>
                  <span style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:2,
                    color:"white",padding:"2px 8px",
                    background:TYPES.find(t=>t.id===a.type)?.color||"var(--muted)" }}>
                    {a.type.toUpperCase()}
                  </span>
                  <span style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:2,
                    color:"var(--muted)" }}>{a.audience.toUpperCase()} · {a.route==="all"?"ALL ROUTES":a.route.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Page>
      <toast.Toaster/>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  8. RENEWAL FLOW
// ══════════════════════════════════════════════════════════════════════
export function RenewalFlow({ currentPass, onDone }) {
  const PASS=currentPass||{ pass_number:"BPP·2024·001234",route:"Red Line",boarding_stop:"Library Square",fare:380,type:"R1",color:"#B02020", name:"Aryan Sharma", validity:"01 APR 2024" };
  const [duration,setDuration]=useState("quarterly");
  const [done,setDone]=useState(false);
  const [paying,setPaying]=useState(false);
  const toast=useToast();

  const DURS=[
    {id:"daily",    label:"DAILY",    days:1,  mo:0.08, disc:0,  desc:"24 hours"},
    {id:"weekly",   label:"WEEKLY",   days:7,  mo:0.32, disc:0,  desc:"7 days"},
    {id:"monthly",  label:"MONTHLY",  days:30, mo:1,    disc:0,  desc:"1 month"},
    {id:"quarterly",label:"QUARTERLY",days:90, mo:2.7,  disc:10, desc:"3 months"},
    {id:"annual",   label:"ANNUAL",   days:365,mo:9.6,  disc:20, desc:"12 months"},
  ];
  const sel=DURS.find(d=>d.id===duration)||DURS[2];
  const total=Math.round(PASS.fare*sel.mo*(1-sel.disc/100));

  const pay=async()=>{
    setPaying(true); await new Promise(r=>setTimeout(r,1500)); setPaying(false); setDone(true);
  };

  if(done) return (
    <>
      <Page style={{ display:"flex",alignItems:"center",justifyContent:"center" }}>
        <div style={{ textAlign:"center",animation:"fadeUp .5s ease" }}>
          <div style={{ width:80,height:80,background:"var(--success-bg)",border:"3px solid var(--green)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",borderRadius:"50%",animation:"stampIn .6s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
            <span style={{ fontFamily:"var(--font-display)",fontSize:40,color:"var(--green)" }}>✓</span>
          </div>
          <div style={{ fontFamily:"var(--font-display)",fontSize:54,color:"var(--ink)",
            letterSpacing:1,lineHeight:1 }}>RENEWED!</div>
          <div style={{ fontFamily:"var(--font-serif)",fontSize:16,color:"var(--muted)",
            fontStyle:"italic",margin:"12px 0 28px" }}>
            Pass renewed for {sel.label.toLowerCase()} · {sel.desc}.
          </div>
          <Btn variant="primary" size="lg" onClick={onDone||(() => {})}>VIEW NEW PASS →</Btn>
        </div>
      </Page>
    </>
  );

  return (
    <>
      <Page style={{ maxWidth:840,margin:"0 auto" }}>
        <PageHeader tag="Passenger · Pass" title="RENEW PASS"
          subtitle={`Extend validity for pass ${PASS.pass_number}`}/>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:36, alignItems:"start" }}>
          <div>
            {/* Duration selection */}
            <Tag>SELECT RENEWAL DURATION</Tag>
            <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:32 }}>
              {DURS.map((d,i)=>{
                const amt=Math.round(PASS.fare*d.mo*(1-d.disc/100));
                const active = duration===d.id;
                return (
                  <div key={d.id} onClick={()=>setDuration(d.id)}
                    style={{ border:`2px solid ${active?"var(--amber)":"var(--rule)"}`,
                      padding:"16px 20px",cursor:"pointer",
                      background:active?"var(--surface)":"var(--cream)",
                      transition:"all .2s ease", display:"flex", justifyContent:"space-between",
                      alignItems:"center", borderRadius:"12px",
                      boxShadow:active?"0 4px 16px rgba(200,131,42,0.1)":"none",
                      transform:active?"translateY(-2px)":"none",
                      animation:`slideInRight .3s ease ${i*0.05}s both` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                      <div style={{ width:24,height:24,borderRadius:"50%", border:active?"6px solid var(--amber)":"2px solid var(--rule)", transition:"all .2s" }}/>
                      <div>
                        <div style={{ fontFamily:"var(--font-display)",fontSize:20,letterSpacing:1,
                          color:active?"var(--amber-text)":"var(--ink)", display:"flex", alignItems:"center", gap:8 }}>
                          {d.label}
                          {d.disc>0&&<span style={{ fontFamily:"var(--font-mono)",fontSize:9,
                            letterSpacing:1,color:"var(--green)",
                            background:"var(--success-bg)",padding:"2px 6px", borderRadius:"4px", border:"1px solid var(--green)" }}>{d.disc}% OFF</span>}
                        </div>
                        <div style={{ fontFamily:"var(--font-sans)",fontSize:13,
                          color:"var(--muted)", marginTop:2 }}>{d.desc}</div>
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:"var(--font-display)",fontSize:24,letterSpacing:1,
                        color:"var(--ink)" }}>₹{amt}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment summary */}
            <Tag>PAYMENT SUMMARY</Tag>
            <div style={{ border:"1.5px solid var(--rule)",borderRadius:"12px",background:"var(--surface)",
              padding:"20px 24px",marginBottom:20 }}>
              {[["Route",PASS.route],["Duration",`${sel.label} (${sel.desc})`],
                ["Base Fare",`₹${PASS.fare} × ${sel.mo}`],
                sel.disc>0&&["Discount",`${sel.disc}% off`]].filter(Boolean).map(([k,v])=>(
                <div key={k} style={{ display:"flex",justifyContent:"space-between",
                  padding:"10px 0",borderBottom:"1px solid var(--rule)" }}>
                  <span style={{ fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:2,
                    color:"var(--muted)" }}>{k}</span>
                  <span style={{ fontFamily:"var(--font-sans)",fontSize:14,color:"var(--ink)", fontWeight:600 }}>{v}</span>
                </div>
              ))}
              <div style={{ display:"flex",justifyContent:"space-between",
                alignItems:"center",paddingTop:16 }}>
                <span style={{ fontFamily:"var(--font-display)",fontSize:20,
                  letterSpacing:2,color:"var(--ink)" }}>TOTAL DUE</span>
                <span style={{ fontFamily:"var(--font-display)",fontSize:36,
                  letterSpacing:1,color:"var(--amber-text)" }}>₹{total.toLocaleString()}</span>
              </div>
            </div>

            <Btn variant="primary" size="lg" full onClick={pay} disabled={paying}>
              {paying?<><Spinner size={18}/> PROCESSING PAYMENT…</>:`PAY ₹${total.toLocaleString()} & RENEW →`}
            </Btn>
          </div>

          <div style={{ position:"sticky", top:24 }}>
            <Tag>Current Pass</Tag>
            {/* Visual Tear-Off Ticket Stub */}
            <div style={{ background:"var(--surface)", border:"2px solid var(--ink)", borderRadius:"16px", overflow:"hidden", boxShadow:"var(--shadow-lg)", position:"relative", animation:"slideDown .5s ease" }}>
              <div style={{ background:PASS.color||"var(--amber)", padding:"24px 20px", color:"white", position:"relative" }}>
                 <div style={{ fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:3, opacity:0.8, marginBottom:4 }}>PASSENGER TICKET</div>
                 <div style={{ fontFamily:"var(--font-display)",fontSize:32,lineHeight:1.1, letterSpacing:1 }}>{PASS.route.toUpperCase()}</div>
                 <div style={{ position:"absolute", top:20, right:20, fontSize:28, opacity:0.2 }}>🚌</div>
              </div>
              <div style={{ position:"relative", height:20, background:"var(--surface)" }}>
                 <div style={{ position:"absolute", left:-14, top:0, width:24,height:24, borderRadius:"50%", background:"var(--cream)", borderRight:"2px solid var(--ink)", zIndex:2 }}/>
                 <div style={{ position:"absolute", right:-14, top:0, width:24,height:24, borderRadius:"50%", background:"var(--cream)", borderLeft:"2px solid var(--ink)", zIndex:2 }}/>
                 <div style={{ position:"absolute", left:16, right:16, top:11, borderTop:"2px dashed var(--rule)", zIndex:1 }}/>
              </div>
              <div style={{ padding:"20px", background:"var(--surface)" }}>
                 <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
                   <div>
                     <div style={{ fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:2, color:"var(--muted)" }}>PASSENGER</div>
                     <div style={{ fontFamily:"var(--font-sans)",fontSize:14, fontWeight:600, color:"var(--ink)" }}>{PASS.name}</div>
                   </div>
                   <div>
                     <div style={{ fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:2, color:"var(--muted)" }}>PASS NO.</div>
                     <div style={{ fontFamily:"var(--font-sans)",fontSize:14, fontWeight:600, color:"var(--ink)" }}>{PASS.pass_number}</div>
                   </div>
                   <div style={{ gridColumn:"1 / -1" }}>
                     <div style={{ fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:2, color:"var(--muted)" }}>BOARDING</div>
                     <div style={{ fontFamily:"var(--font-sans)",fontSize:14, fontWeight:600, color:"var(--ink)" }}>{PASS.boarding_stop}</div>
                   </div>
                   <div style={{ gridColumn:"1 / -1" }}>
                     <div style={{ fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:2, color:"var(--muted)" }}>VALID THRU</div>
                     <div style={{ fontFamily:"var(--font-sans)",fontSize:18, fontWeight:600, color:"var(--red)" }}>{PASS.validity}</div>
                   </div>
                 </div>
                 <div style={{ textAlign:"center", padding:"12px 0", borderTop:"2px solid var(--rule)", borderBottom:"2px solid var(--rule)", marginTop:20 }}>
                   <div style={{ fontFamily:"var(--font-display)",fontSize:24, letterSpacing:4, color:"var(--ink)" }}>{PASS.type}</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </Page>
      <toast.Toaster/>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  9. BUS ROUTE MAP
// ══════════════════════════════════════════════════════════════════════
export function BusRouteMap() {
  const [selRoute,setSelRoute]=useState(0);
  const [busPos,setBusPos]=useState(1);

  const ROUTES_DATA=[
    { name:"Red Line",   color:"#B02020",
      stops:["Central Station","Old Market","Hospital Gate","Library Square","IT Park","City Mall"],
      time:["07:00","07:12","07:24","07:36","07:48","08:00"], busAt:2 },
    { name:"Blue Line",  color:"#1A4A8A",
      stops:["Central Station","Railway Station","Bus Terminal","Ring Road","Outer Ring","Airport Road"],
      time:["07:30","07:44","07:58","08:12","08:26","08:40"], busAt:1 },
    { name:"Green Line", color:"#1E6641",
      stops:["North Zone","University Gate","Sector 4","Main Market","City Square","South End"],
      time:["08:00","08:13","08:26","08:39","08:52","09:05"], busAt:3 },
  ];
  const route=ROUTES_DATA[selRoute];

  useEffect(()=>{
    setBusPos(route.busAt);
    const t=setInterval(()=>setBusPos(p=>(p+1)%route.stops.length),3500);
    return()=>clearInterval(t);
  },[selRoute]);

  return (
    <>
      <style>{`
        @keyframes radarSweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }
        @keyframes mapReveal {
          from { opacity: 0; transform: translateY(20px); filter: blur(10px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
      `}</style>
      <Page>
        <PageHeader tag="Live Route Map" title="TRANSIT RADAR"
          subtitle="Real-time stop-by-stop view with dynamic vehicle tracking"/>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 340px",gap:28,alignItems:"start" }}>

          {/* Left panel - Map Visualization */}
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {/* Route selector overlaying the map or above it */}
            <div style={{ display:"flex",gap:8, overflowX:"auto", paddingBottom:4 }}>
              {ROUTES_DATA.map((r,i)=>(
                <button key={r.name} onClick={()=>setSelRoute(i)}
                  style={{ padding:"12px 24px", borderRadius:"30px",
                    background:selRoute===i?r.color:"var(--surface)",
                    color:selRoute===i?"white":"var(--ink)",
                    border:`1.5px solid ${selRoute===i?r.color:"var(--rule)"}`,
                    fontFamily:"var(--font-sans)",fontSize:14, fontWeight:600,
                    cursor:"pointer",transition:"all .2s ease",
                    boxShadow:selRoute===i?`0 4px 12px ${r.color}40`:"none" }}>
                  {r.name}
                </button>
              ))}
            </div>

            {/* The Animated "Map" */}
            <div style={{ 
              position:"relative", background:"var(--ink)", borderRadius:"24px", 
              overflow:"hidden", minHeight:"500px", padding:"40px",
              boxShadow:"inset 0 0 80px rgba(0,0,0,0.5), 0 12px 40px rgba(26,18,8,0.2)",
              animation:"mapReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
             }}>
              {/* Grid / Radar background */}
              <div style={{ position:"absolute", inset:0, opacity:0.1, 
                backgroundImage:"linear-gradient(rgba(246, 240, 228, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(246, 240, 228, 0.4) 1px, transparent 1px)", 
                backgroundSize:"40px 40px" }}/>
              <div style={{ position:"absolute", inset:0, background: "radial-gradient(circle at center, transparent 0%, var(--ink) 90%)", zIndex:1 }}/>

              {/* Radar Sweeper */}
              <div style={{ position:"absolute", top:"50%", left:"50%", width:600, height:600, marginTop:-300, marginLeft:-300, 
                background:`conic-gradient(from 0deg, transparent 70%, ${route.color}80 100%)`, 
                borderRadius:"50%", animation:"radarSweep 4s linear infinite", zIndex:2, opacity:0.4 }}/>

              <div style={{ position:"relative", zIndex:5, maxWidth:400, margin:"0 auto" }}>
                {route.stops.map((stop,i)=>(
                  <div key={stop} style={{ position:"relative", height:80, display:"flex", alignItems:"flex-start", gap:24 }}>
                    {/* Time */}
                    <div style={{ width:40, textAlign:"right", fontFamily:"var(--font-mono)", fontSize:11, color:"var(--muted-on-ink)", paddingTop:2 }}>
                       {route.time[i]}
                    </div>
                    {/* Line & Dots */}
                    <div style={{ position:"relative", width:20, display:"flex", flexDirection:"column", alignItems:"center" }}>
                      {/* Connection Line */}
                      {i < route.stops.length - 1 && (
                        <div style={{ position:"absolute", top:16, bottom:-64, width:4, 
                          background:i<busPos?route.color:"rgba(255,255,255,0.1)", transition:"background 0.5s ease" }}/>
                      )}
                      
                      {/* Stop Dot */}
                      <div style={{ width:16, height:16, borderRadius:"50%", 
                        background:i===busPos?"var(--cream)":i<busPos?route.color:"var(--ink)",
                        border:`3px solid ${i<=busPos?route.color:"rgba(255,255,255,0.2)"}`, 
                        zIndex:2, transition:"all 0.4s ease", position:"relative" }}>
                        
                        {i === busPos && (
                          <>
                            <div style={{ position:"absolute", inset:-8, border:`2px solid ${route.color}`, borderRadius:"50%", animation:"ripple 1.5s infinite" }}/>
                            <div style={{ position:"absolute", left:"150%", top:"50%", transform:"translateY(-50%)", background:"var(--amber)", color:"var(--ink)", padding:"4px 8px", borderRadius:"4px", fontFamily:"var(--font-mono)", fontSize:9, fontWeight:"bold", letterSpacing:1, whiteSpace:"nowrap", boxShadow:"0 2px 8px rgba(0,0,0,0.4)" }}>
                              BUS-0{selRoute+1}
                            </div>
                          </>
                        )}
                        {i < busPos && (
                          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--cream)", fontSize:8 }}>✓</div>
                        )}
                      </div>
                    </div>
                    {/* Stop Name */}
                    <div style={{ flex:1, paddingTop:1, fontFamily:"var(--font-sans)", fontSize:16, 
                      color:i===busPos?"white":i<busPos?"var(--muted-on-ink)":"rgba(255,255,255,0.6)", 
                      fontWeight:i===busPos?600:400, transition:"all 0.4s ease",
                      textShadow:i===busPos?`0 0 10px ${route.color}`:"none" }}>
                      {stop}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right info panel */}
          <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
            {/* Live status glass card */}
            <div style={{ background:route.color, borderRadius:"16px", padding:"24px", color:"white", boxShadow:`0 12px 32px ${route.color}50`, transition:"background 0.4s ease" }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16 }}>
                <div style={{ width:10,height:10,background:"#fff", borderRadius:"50%",
                  animation:"pulse 2s ease-in-out infinite" }}/>
                <span style={{ fontFamily:"var(--font-mono)",fontSize:10,
                  letterSpacing:3, fontWeight:700 }}>LIVE TRACKING</span>
              </div>
              <div style={{ fontFamily:"var(--font-display)",fontSize:32,
                letterSpacing:1,marginBottom:4, lineHeight:1 }}>
                BUS-0{selRoute+1}
              </div>
              <div style={{ fontFamily:"var(--font-sans)",fontSize:16, opacity:0.9, marginBottom:16 }}>
                Currently at <strong>{route.stops[busPos]}</strong>
              </div>
              <div style={{ background:"rgba(0,0,0,0.2)", padding:"12px 16px", borderRadius:"8px" }}>
                 <div style={{ fontFamily:"var(--font-mono)",fontSize:9,letterSpacing:2, opacity:0.8, marginBottom:4 }}>NEXT STOP</div>
                 <div style={{ fontFamily:"var(--font-sans)",fontSize:16, fontWeight:600 }}>
                   {route.stops[Math.min(busPos+1,route.stops.length-1)]}
                 </div>
                 <div style={{ fontFamily:"var(--font-mono)",fontSize:10, marginTop:4, opacity:0.8 }}>
                   {busPos<route.stops.length-1?"Arriving in ~4 mins":"End of route"}
                 </div>
              </div>
            </div>

            {/* Route stats */}
            <div style={{ border:"1px solid var(--rule)",borderRadius:"16px",background:"var(--surface)",padding:"24px", boxShadow:"var(--shadow-sm)" }}>
              <Tag>Route Info</Tag>
              {[["STOPS",route.stops.length],
                ["FIRST BUS",route.time[0]],
                ["LAST STOP",route.time[route.stops.length-1]],
                ["FREQUENCY","Every 12 min"]].map(([l,v])=>(
                <div key={l} style={{ display:"flex",justifyContent:"space-between",
                  padding:"12px 0",borderBottom:"1px solid var(--rule)" }}>
                  <span style={{ fontFamily:"var(--font-mono)",fontSize:9,
                    letterSpacing:2,color:"var(--muted)" }}>{l}</span>
                  <span style={{ fontFamily:"var(--font-sans)",fontSize:14,
                    color:"var(--ink)",fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* My stop */}
            <div style={{ border:"1px solid var(--rule)",borderRadius:"16px",background:"var(--surface)",
              padding:"24px", boxShadow:"var(--shadow-sm)" }}>
              <Tag>My Boarding Stop</Tag>
              <div style={{ fontFamily:"var(--font-serif)",fontSize:20,
                color:"var(--amber-text)",marginBottom:8 }}>Library Square</div>
              <div style={{ fontFamily:"var(--font-sans)",fontSize:14,
                color:"var(--muted)",lineHeight:1.6 }}>
                Bus arrives in approx.{" "}
                <strong style={{ color:"var(--ink)" }}>12 minutes</strong>.
              </div>
            </div>
          </div>
        </div>
      </Page>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  10. CAMERA SCANNER
// ══════════════════════════════════════════════════════════════════════
export function CameraScanner() {
  const videoRef=useRef(null);
  const canvasRef=useRef(null);
  const [active,setActive]=useState(false);
  const [result,setResult]=useState(null);
  const [error,setError]=useState("");
  const [history,setHistory]=useState([
    { pass:"BPP·2024·001234",student:"Aryan Sharma",  result:"VALID",  time:"08:42" },
    { pass:"BPP·2024·000891",student:"Priya Patel",   result:"EXPIRED",time:"08:40" },
  ]);
  const scanLoop=useRef(null);

  const startCamera=async()=>{
    setError(""); setResult(null);
    try {
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
      videoRef.current.srcObject=stream; videoRef.current.play(); setActive(true);
      scanLoop.current=setInterval(()=>{
        if(!videoRef.current||!canvasRef.current) return;
        const ctx=canvasRef.current.getContext("2d");
        canvasRef.current.width=videoRef.current.videoWidth;
        canvasRef.current.height=videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current,0,0);
        const imageData=ctx.getImageData(0,0,canvasRef.current.width,canvasRef.current.height);
        if(window.jsQR){
          const code=window.jsQR(imageData.data,imageData.width,imageData.height);
          if(code) handleScan(code.data);
        }
      },300);
    } catch(e) {
      setError("Camera access denied or unavailable. Use Manual Lookup instead.");
    }
  };

  const stopCamera=()=>{
    clearInterval(scanLoop.current);
    if(videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t=>t.stop());
    setActive(false);
  };

  const handleScan=data=>{
    stopCamera();
    const mock={ pass:data||"BPP·2024·001234",student:"Aryan Sharma",
      result:"VALID",route:"Red Line",until:"01 APR 2024" };
    setResult(mock);
    setHistory(h=>[{...mock,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})},...h.slice(0,9)]);
  };

  useEffect(()=>()=>stopCamera(),[]);

  const RC={VALID:"var(--green)",EXPIRED:"var(--amber-text)",INVALID:"var(--red)"};

  return (
    <>
      
      <Page>
        <PageHeader tag="Conductor · Scanner" title="CAMERA SCAN"
          subtitle="Point camera at passenger's QR code"/>

        <div style={{ display:"grid",gridTemplateColumns:"360px 1fr",gap:28,alignItems:"start" }}>

          {/* Camera view */}
          <div>
            {/* Viewfinder */}
            <div style={{ width:"100%",aspectRatio:"1/1",
              border:`3px solid ${active?"var(--amber)":"var(--ink)"}`,
              background:"var(--ink)",position:"relative",overflow:"hidden",
              marginBottom:12,transition:"border-color .3s" }}>
              <video ref={videoRef} style={{ width:"100%",height:"100%",
                objectFit:"cover",display:active?"block":"none" }} playsInline muted/>
              <canvas ref={canvasRef} style={{ display:"none" }}/>

              {!active&&(
                <div style={{ position:"absolute",inset:0,display:"flex",
                  flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12 }}>
                  <div style={{ fontFamily:"var(--font-display)",fontSize:48,
                    color:"rgba(240,168,48,.3)",lineHeight:1 }}>◈</div>
                  <div style={{ fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:3,
                    color:"var(--muted-on-ink)" }}>CAMERA OFF</div>
                </div>
              )}

              {/* Scan line */}
              {active&&(
                <div style={{ position:"absolute",left:0,right:0,height:3,
                  background:"var(--amber)",opacity:.8,
                  animation:"scanLine 2s linear infinite",
                  boxShadow:"0 0 12px var(--amber)" }}/>
              )}

              {/* Corner brackets */}
              {[[{top:8,left:8},{borderTop:3,borderLeft:3}],
                [{top:8,right:8},{borderTop:3,borderRight:3}],
                [{bottom:8,left:8},{borderBottom:3,borderLeft:3}],
                [{bottom:8,right:8},{borderBottom:3,borderRight:3}]].map(([pos,borders],i)=>(
                <div key={i} style={{ position:"absolute",...pos,width:24,height:24,
                  borderStyle:"solid",borderColor:active?"var(--amber)":"rgba(255,255,255,.2)",
                  borderTopWidth:borders.borderTop||0,borderRightWidth:borders.borderRight||0,
                  borderBottomWidth:borders.borderBottom||0,borderLeftWidth:borders.borderLeft||0,
                  transition:"border-color .3s" }}/>
              ))}
            </div>

            {error&&(
              <div style={{ fontFamily:"var(--font-sans)",fontSize:12,color:"var(--red)",
                marginBottom:10,padding:"10px 12px",background:"var(--error-bg)",
                border:"1px solid var(--red)" }}>{error}</div>
            )}

            {!active
              ? <Btn variant="primary" full size="md" onClick={startCamera}>▶ START CAMERA</Btn>
              : <Btn variant="danger"  full size="md" onClick={stopCamera}>■ STOP CAMERA</Btn>
            }

            {/* Scan result */}
            {result&&!active&&(
              <div style={{ marginTop:14,padding:20,
                border:`3px solid ${RC[result.result]}`,
                background:result.result==="VALID"?"var(--success-bg)":
                  result.result==="EXPIRED"?"var(--warn-bg)":"var(--error-bg)",
                animation:"stampIn .4s ease" }}>
                <div style={{ fontFamily:"var(--font-display)",fontSize:26,letterSpacing:3,
                  color:RC[result.result],marginBottom:8 }}>
                  {result.result==="VALID"?"✓ PASS VALID":
                   result.result==="EXPIRED"?"⚠ PASS EXPIRED":"✕ INVALID QR"}
                </div>
                {result.student&&(
                  <>
                    <div style={{ fontFamily:"var(--font-serif)",fontSize:18,color:"var(--ink)" }}>{result.student}</div>
                    <div style={{ fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:2,
                      color:"var(--muted)",marginTop:4 }}>{result.route} · UNTIL {result.until}</div>
                    <div style={{ fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:1,
                      color:"var(--muted)",marginTop:2 }}>{result.pass}</div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Scan log */}
          <div>
            <Tag>Today's Scan Log — {history.length} scans</Tag>
            <div style={{ display:"grid",gridTemplateColumns:"50px 1fr 80px 1fr",
              gap:12,padding:"6px 14px",borderBottom:"2px solid var(--ink)" }}>
              {["TIME","STUDENT","STATUS","PASS"].map(h=>(
                <span key={h} style={{ fontFamily:"var(--font-mono)",fontSize:7,
                  letterSpacing:3,color:"var(--muted)" }}>{h}</span>
              ))}
            </div>
            {history.map((h,i)=>(
              <div key={i} style={{ display:"grid",gridTemplateColumns:"50px 1fr 80px 1fr",
                gap:12,padding:"12px 14px",
                background:i%2===0?"var(--surface)":"var(--cream)",
                borderBottom:"1px solid var(--rule)",
                borderLeft:`3px solid ${RC[h.result]||"var(--rule)"}`,
                animation:`fadeUp .3s ease ${i*.04}s both` }}>
                <div style={{ fontFamily:"var(--font-mono)",fontSize:9,color:"var(--muted)" }}>{h.time}</div>
                <div style={{ fontFamily:"var(--font-sans)",fontSize:13,color:"var(--ink)" }}>{h.student||"—"}</div>
                <Pill s={h.result}/>
                <div style={{ fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:1,color:"var(--muted)" }}>{h.pass}</div>
              </div>
            ))}
          </div>
        </div>
      </Page>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  11. TRIP LOG
// ══════════════════════════════════════════════════════════════════════
export function TripLog() {
  const SCANS=[
    {time:"08:42",pass:"BPP·2024·001234",student:"Aryan Sharma",  stop:"Library Square",  result:"VALID"},
    {time:"08:40",pass:"BPP·2024·000891",student:"Priya Patel",   stop:"Library Square",  result:"EXPIRED"},
    {time:"08:38",pass:"BPP·2024·001102",student:"Rahul Kumar",   stop:"Hospital Gate",   result:"VALID"},
    {time:"08:35",pass:"BPP·2024·001087",student:"Sneha Iyer",    stop:"Central Station", result:"VALID"},
    {time:"08:32",pass:"BPP·2024·001031",student:"Vikram Singh",  stop:"Central Station", result:"VALID"},
    {time:"08:30",pass:"BPP·2023·000042",student:"Kiran Rao",     stop:"Central Station", result:"INVALID"},
  ];
  const valid  =SCANS.filter(s=>s.result==="VALID").length;
  const expired=SCANS.filter(s=>s.result==="EXPIRED").length;
  const invalid=SCANS.filter(s=>s.result==="INVALID").length;

  return (
    <>
      
      <Page>
        <PageHeader tag="Conductor · Report" title="TRIP LOG"
          subtitle="03 Mar 2024 · Red Line · BUS-02"
          actions={[<Btn key="exp" variant="ghost" size="sm">⬇ EXPORT PDF</Btn>]}/>

        {/* Stats strip */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",
          borderTop:"3px solid var(--ink)",borderBottom:"1px solid var(--rule)",
          marginBottom:24 }}>
          {[[SCANS.length,"TOTAL SCANS","var(--ink)"],
            [valid,        "VALID",       "var(--green)"],
            [expired,      "EXPIRED",     "var(--amber-text)"],
            [invalid,      "INVALID",     "var(--red)"]].map(([n,l,c],i)=>(
            <div key={l} style={{ padding:"18px 22px",textAlign:"center",
              borderRight:i<3?"1px solid var(--rule)":"none" }}>
              <div style={{ fontFamily:"var(--font-display)",fontSize:36,
                letterSpacing:1,color:c,lineHeight:1 }}>{n}</div>
              <div style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:3,
                color:"var(--muted)",marginTop:6 }}>SCANS — {l}</div>
            </div>
          ))}
        </div>

        {/* Table header */}
        <div style={{ display:"grid",
          gridTemplateColumns:"36px 60px 80px 1fr 140px 80px",
          gap:12,padding:"10px 16px",marginBottom:8,
          background:"var(--surface)", borderRadius:"8px",
          border:"1px solid var(--rule)",
          boxShadow:"0 2px 4px rgba(26,18,8,.02)" }}>
          {["#","TIME","STATUS","STUDENT","STOP","PASS"].map(h=>(
            <span key={h} style={{ fontFamily:"var(--font-mono)",fontSize:10,
              letterSpacing:3,color:"var(--ink-mid)", fontWeight:700 }}>{h}</span>
          ))}
        </div>

        {SCANS.map((s,i)=>{
          const borderColor=s.result==="VALID"?"var(--green)":
            s.result==="EXPIRED"?"var(--amber)":"var(--red)";
          return (
            <div key={i} style={{ display:"grid",
              gridTemplateColumns:"36px 60px 80px 1fr 140px 80px",
              gap:12,padding:"14px 16px",alignItems:"center",
              background:"var(--surface)", marginBottom:8,
              borderRadius:"8px",
              border:`1px solid var(--rule)`,
              borderLeft:`4px solid ${borderColor}`,
              boxShadow:"0 2px 8px rgba(26,18,8,0.04)",
              transition:"all .2s ease",
              onMouseEnter:e=>e.currentTarget.style.transform="translateY(-2px)",
              onMouseLeave:e=>e.currentTarget.style.transform="none",
              animation:`fadeUp .4s cubic-bezier(0.16, 1, 0.3, 1) ${i*.05}s both` }}>
              <span style={{ fontFamily:"var(--font-mono)",fontSize:11,
                color:"var(--muted)",textAlign:"center" }}>#{i+1}</span>
              <span style={{ fontFamily:"var(--font-mono)",fontSize:11,color:"var(--ink-mid)",fontWeight:600 }}>{s.time}</span>
              <Pill s={s.result}/>
              <div>
                <div style={{ fontFamily:"var(--font-sans)",fontSize:14,color:"var(--ink)", fontWeight:600 }}>{s.student}</div>
                <div style={{ fontFamily:"var(--font-mono)",fontSize:9,letterSpacing:1,color:"var(--muted)" }}>{s.pass}</div>
              </div>
              <span style={{ fontFamily:"var(--font-sans)",fontSize:13,color:"var(--ink-mid)" }}>{s.stop}</span>
              <span style={{ fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:1,color:"var(--muted)" }}>{s.pass.slice(-6)}</span>
            </div>
          );
        })}

        <div style={{ marginTop:28,padding:"14px 20px",
          borderTop:"1px solid var(--rule)",background:"var(--parchment)",
          display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <span style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:3,
            color:"var(--muted)" }}>CONDUCTOR: MOHAN KUMAR · BUS-02</span>
          <span style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:3,
            color:"var(--muted)" }}>GENERATED: {new Date().toLocaleString("en-IN",{dateStyle:"short",timeStyle:"short"})}</span>
        </div>
      </Page>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  12. MANUAL LOOKUP
// ══════════════════════════════════════════════════════════════════════
export function ManualLookup() {
  const [query,setQuery]=useState("");
  const [result,setResult]=useState(null);
  const [searching,setSearching]=useState(false);
  const [notFound,setNotFound]=useState(false);
  const toast=useToast();

  const DB={
    "STU-10042":{ name:"Aryan Sharma",  pass:"BPP·2024·001234",route:"Red Line",  status:"VALID",  until:"01 Apr 2024",boarding:"Library Square"   },
    "STU-10018":{ name:"Priya Patel",   pass:"BPP·2023·000891",route:"Red Line",  status:"EXPIRED",until:"31 Dec 2023",boarding:"Library Square"   },
    "GEN-10031":{ name:"Rahul Kumar",   pass:"BPP·2024·001102",route:"Blue Line", status:"VALID",  until:"15 Mar 2024",boarding:"Bus Terminal"       },
    "BPP·2024·001234":{ name:"Aryan Sharma",pass:"BPP·2024·001234",route:"Red Line",status:"VALID",until:"01 Apr 2024",boarding:"Library Square" },
  };

  const search=async()=>{
    if(!query.trim()){toast.error("Enter a passenger ID or pass number.");return;}
    setSearching(true); setResult(null); setNotFound(false);
    await new Promise(r=>setTimeout(r,700));
    const found=DB[query.trim().toUpperCase()]||DB[query.trim()];
    setSearching(false);
    if(found) setResult(found); else setNotFound(true);
  };

  const RC={VALID:"var(--green)",EXPIRED:"var(--amber-text)",INVALID:"var(--red)"};
  const RECENT=[
    ["STU-10042","Aryan Sharma","VALID"],
    ["STU-10018","Priya Patel","EXPIRED"],
    ["GEN-10031","Rahul Kumar","VALID"],
  ];

  return (
    <>
      
      <Page style={{ maxWidth:640,margin:"0 auto" }}>
        <PageHeader tag="Conductor · Lookup" title="MANUAL LOOKUP"
          subtitle="Search by passenger ID or pass number"/>

        {/* Search */}
        <div style={{ display:"flex",gap:0,marginBottom:24,
          border:"2px solid var(--ink)", borderRadius:"var(--r-md)", overflow:"hidden" }}>
          <input value={query} onChange={e=>setQuery(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&search()}
            placeholder="STU-10042  or  BPP·2024·001234"
            style={{ flex:1,padding:"13px 18px",border:"none",
              background:"var(--surface)",fontFamily:"var(--font-mono)",
              fontSize:13,color:"var(--ink)",outline:"none",letterSpacing:1 }}/>
          <button onClick={search}
            style={{ padding:"13px 24px",background:"var(--ink)",color:"var(--amber-on-ink)",
              border:"none",fontFamily:"var(--font-display)",fontSize:16,letterSpacing:2,
              cursor:"pointer",transition:"background .18s" }}
            onMouseEnter={e=>e.currentTarget.style.background="#2C1E0A"}
            onMouseLeave={e=>e.currentTarget.style.background="var(--ink)"}>
            {searching?<Spinner size={16} color="var(--amber-on-ink)"/>:"SEARCH"}
          </button>
        </div>

        {/* Not found */}
        {notFound&&(
          <div style={{ padding:"24px",border:"2px solid var(--red)",
            background:"var(--error-bg)",textAlign:"center",
            animation:"stampIn .4s ease",marginBottom:20 }}>
            <div style={{ fontFamily:"var(--font-display)",fontSize:32,letterSpacing:2,
              color:"var(--red)",marginBottom:8 }}>NOT FOUND</div>
            <div style={{ fontFamily:"var(--font-sans)",fontSize:13,color:"var(--red)" }}>
              No passenger or pass found for "<strong>{query}</strong>".
              Check the ID and try again.
            </div>
          </div>
        )}

        {/* Result */}
        {result&&(
          <div style={{ border:`3px solid ${RC[result.status]}`,
            background:result.status==="VALID"?"var(--success-bg)":
              result.status==="EXPIRED"?"var(--warn-bg)":"var(--error-bg)",
            padding:24,animation:"stampIn .4s ease",marginBottom:20 }}>

            {/* Status stamp */}
            <div style={{ fontFamily:"var(--font-display)",fontSize:28,letterSpacing:3,
              color:RC[result.status],marginBottom:12 }}>
              {result.status==="VALID"?"✓ PASS VALID":
               result.status==="EXPIRED"?"⚠ PASS EXPIRED":"✕ INVALID"}
            </div>

            <div style={{ fontFamily:"var(--font-serif)",fontSize:22,
              color:"var(--ink)",marginBottom:14 }}>{result.name}</div>

            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 24px",
              marginBottom:18 }}>
              {[["Pass Number",result.pass],["Route",result.route],
                ["Valid Until",result.until],["Boarding Stop",result.boarding]].map(([l,v])=>(
                <div key={l}>
                  <div style={{ fontFamily:"var(--font-mono)",fontSize:7,letterSpacing:3,
                    color:"var(--muted)",marginBottom:2 }}>{l}</div>
                  <div style={{ fontFamily:"var(--font-sans)",fontSize:13,
                    color:"var(--ink)",fontWeight:500 }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"flex",gap:10 }}>
              <Btn variant="success" size="sm"
                onClick={()=>toast.success("Boarding logged.")}>LOG BOARDING</Btn>
              <Btn variant="secondary" size="sm"
                onClick={()=>{ setResult(null); setQuery(""); }}>CLEAR</Btn>
            </div>
          </div>
        )}

        {/* Recent lookups */}
        <Rule my={28}/>
        <Tag>Recent Lookups Today</Tag>
        <div style={{ display:"grid",gridTemplateColumns:"90px 1fr 80px auto",
          gap:12,padding:"6px 0",borderBottom:"2px solid var(--ink)" }}>
          {["ID","PASSENGER","STATUS",""].map(h=>(
            <span key={h} style={{ fontFamily:"var(--font-mono)",fontSize:7,
              letterSpacing:3,color:"var(--muted)" }}>{h}</span>
          ))}
        </div>
        {RECENT.map(([id,name,status],i)=>(
          <div key={i} style={{ display:"grid",gridTemplateColumns:"90px 1fr 80px auto",
            gap:12,padding:"11px 0",borderBottom:"1px solid var(--rule)",
            alignItems:"center" }}>
            <span style={{ fontFamily:"var(--font-mono)",fontSize:8,
              letterSpacing:1,color:"var(--amber-text)" }}>{id}</span>
            <span style={{ fontFamily:"var(--font-sans)",fontSize:13,color:"var(--ink)" }}>{name}</span>
            <Pill s={status}/>
            <button onClick={()=>{ setQuery(id); }}
              style={{ background:"none",border:"none",fontFamily:"var(--font-mono)",
                fontSize:7,letterSpacing:2,color:"var(--amber-text)",
                cursor:"pointer",textDecoration:"underline",textUnderlineOffset:2 }}>
              SEARCH AGAIN
            </button>
          </div>
        ))}
      </Page>
      <toast.Toaster/>
    </>
  );
}
