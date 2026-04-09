import { useState, useEffect } from "react";
// ══════════════════════════════════════════════════════════════════════
//  DESIGN TOKENS (Standard Light Theme)
// ══════════════════════════════════════════════════════════════════════
// Using the globally defined CSS variables from App.jsx's root

// ══════════════════════════════════════════════════════════════════════
//  SHARED ATOMS
// ══════════════════════════════════════════════════════════════════════

const Tag = ({ children, color }) => (
  <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:4,
    color:color||"var(--muted)", textTransform:"uppercase", marginBottom:8 }}>{children}</div>
);

const Rule = ({ my=20 }) => <div style={{ height:1, background:"var(--rule)", margin:`${my}px 0` }}/>;

const LineBadge = ({ name, small }) => {
  const LINE_COLORS = { "Route Alpha":"#B02020", "Route Beta":"#1A4A8A", "Route Gamma":"#1E6641", "Red Line":"#B02020", "Blue Line":"#1A4A8A", "Green Line":"#1E6641" };
  const LINE_CODES  = { "Route Alpha":"Rα","Route Beta":"Rβ","Route Gamma":"Rγ", "Red Line":"R1","Blue Line":"R2","Green Line":"R3" };
  const color = LINE_COLORS[name]||"var(--muted)";
  const code  = LINE_CODES[name]||"?";
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4,
      background:color, color:"white",
      fontFamily:"var(--font-mono)", fontSize:small?7:9, fontWeight:700, letterSpacing:2,
      padding:small?"2px 7px":"3px 10px", borderRadius:"4px" }}>{code}</span>
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
  const m = { ACTIVE:{bg:"#EBF7F0",c:"#1E6641"}, VALID:{bg:"#EBF7F0",c:"#1E6641"},
    APPROVED:{bg:"#EBF7F0",c:"#1E6641"}, PAID:{bg:"#EBF7F0",c:"#1E6641"},
    PENDING:{bg:"#FEF7E6",c:"#C8832A"}, EXPIRED:{bg:"#F6F0E4",c:"#6B5535"},
    INACTIVE:{bg:"#F6F0E4",c:"#6B5535"}, REJECTED:{bg:"#FDEAEA",c:"#B02020"},
    USED:{bg:"#F6F0E4",c:"#6B5535"} };
  const p = m[(s||"").toUpperCase()]||{bg:"#F6F0E4",c:"#6B5535"};
  return <span style={{ background:p.bg, color:p.c, fontFamily:"var(--font-mono)",
    fontSize:9, fontWeight:700, letterSpacing:2, padding:"4px 10px",
    borderRadius:"var(--r-sm)", display:"inline-block",
    border:`1.5px solid ${p.c}33` }}>{(s||"").toUpperCase()}</span>;
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

const Toggle = ({ on, onChange }) => (
  <button onClick={()=>onChange(!on)} style={{ width:44, height:24, borderRadius:12,
    background:on?"var(--green)":"var(--rule)", border:"none", cursor:"pointer",
    position:"relative", transition:"background .2s", flexShrink:0 }}>
    <div style={{ width:18, height:18, borderRadius:"50%", background:"white",
      position:"absolute", top:3, left:on?23:3, transition:"left .2s",
      boxShadow:"0 1px 3px rgba(0,0,0,.2)" }}/>
  </button>
);

const PageHeader = ({ tag, title, subtitle, actions }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:32 }}>
    <div>
      <Tag>{tag}</Tag>
      <div style={{ fontFamily:"var(--font-display)", fontSize:46, letterSpacing:1, color:"var(--ink)", lineHeight:1, marginBottom:8 }}>{title}</div>
      <div style={{ fontFamily:"var(--font-sans)", fontSize:16, color:"var(--muted)" }}>{subtitle}</div>
    </div>
    {actions && <div style={{ display:"flex", gap:12 }}>{actions}</div>}
  </div>
);

// ══════════════════════════════════════════════════════════════════════
//  SCREENS COMPONENTS
// ══════════════════════════════════════════════════════════════════════

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
          minWidth:280, display:"flex", gap:10, alignItems:"center", borderRadius:"var(--r-md)", animation:"slideDown .3s ease",
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
          { n:STATS.todayPasses,   l:"PASSES TODAY",   fs:44, c:"var(--ink)",        top:"var(--amber)",      kind:"int"     },
          { n:STATS.weekPasses,    l:"THIS WEEK",      fs:44, c:"var(--ink)",        top:"var(--ink)",        kind:"int"     },
          { n:STATS.monthPasses,   l:"THIS MONTH",     fs:44, c:"var(--ink)",        top:"var(--ink)",        kind:"int"     },
          { n:420000,              l:"TOTAL REVENUE",  fs:56, c:"var(--amber-text)", top:"var(--green)",      kind:"currency"},
        ].map((s,i) => (
          <div key={s.l} style={{ padding:"24px 28px", textAlign:"center",
            borderRight:i<3?"1px solid var(--rule)":"none",
            borderTop:`3px solid ${s.top}`,
            animation:`fadeUp .4s ease ${i*.08}s both` }}>
            <div style={{ fontFamily:"var(--font-display)", fontSize:s.fs, letterSpacing:1,
              color:s.c, lineHeight:1, animation:"inkReveal .7s ease both",
              animationDelay:`${i*.1+.2}s` }}>
              {s.kind==="currency"
                ? <AnimatedCount target={s.n} prefix="₹" delay={i*100}/>
                : <AnimatedCount target={s.n} delay={i*100}/>
              }
            </div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:4,
              color:"var(--muted)", marginTop:8 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Secondary stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:32 }}>
        {[
          { n:STATS.pendingApps,      l:"PENDING APPS",    bg:"var(--warn-bg)",    border:"var(--amber-text)", c:"var(--amber-text)" },
          { n:STATS.activeStudents,   l:"ACTIVE STUDENTS", bg:"var(--parchment)",  border:"var(--amber-text)", c:"var(--amber-text)" },
          { n:STATS.scanSuccessRate,  l:"SCAN SUCCESS",    bg:"var(--success-bg)", border:"var(--green)",      c:"var(--green)"      },
          { n:STATS.avgOccupancy,     l:"AVG OCCUPANCY",   bg:"var(--surface)",    border:"var(--rule)",       c:"var(--muted)"      },
        ].map((s,i) => (
          <div key={s.l} style={{ padding:"18px 20px", background:s.bg,
            border:`1.5px solid ${s.border}`, animation:`fadeUp .4s ease ${i*.08+.3}s both` }}>
            <div style={{ fontFamily:"var(--font-display)", fontSize:32, letterSpacing:1, color:s.c, lineHeight:1 }}>
              {typeof s.n === "number"
                ? <AnimatedCount target={s.n} delay={i*80}/>
                : s.n.includes("%")
                  ? <AnimatedCount target={parseFloat(s.n)} suffix="%" decimals={1} delay={i*80}/>
                  : s.n
              }
            </div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:3, color:"var(--muted)", marginTop:6 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Two-column: Activity feed + Email log */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:24 }}>

        {/* Activity feed */}
        <div style={{ border:"1.5px solid var(--rule)", background:"var(--surface)", borderRadius:"var(--r-sm)", overflow:"hidden" }}>
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
              animation:`fadeUp .3s ease ${i*.06}s both` }}>
              {/* Time */}
              <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:1,
                color:"var(--muted)", opacity:.72, alignSelf:"flex-start", paddingTop:2 }}>{a.time}</div>
              {/* Colour bar */}
              <div style={{ background:DOT[a.type], alignSelf:"stretch", minHeight:"100%" }}/>
              {/* Content */}
              <div>
                <div style={{ fontFamily:"var(--font-sans)", fontSize:13, color:"var(--ink)", fontWeight:500 }}>{a.action}</div>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:1, color:"var(--muted)", marginTop:3 }}>{a.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Email dispatch log */}
        <div style={{ border:"1.5px solid var(--rule)", background:"var(--surface)", borderRadius:"var(--r-sm)", overflow:"hidden", display:"flex", flexDirection:"column" }}>
          <div style={{ background:"var(--parchment)", padding:"14px 20px", borderBottom:"2px solid var(--ink)" }}>
            <Tag>Dispatch Office</Tag>
            <div style={{ fontFamily:"var(--font-display)", fontSize:18, letterSpacing:2, color:"var(--ink)" }}>EMAIL LOG</div>
          </div>
          <div style={{ flex:1, overflowY:"auto", maxHeight:340 }}>
            {emailLog.length === 0 ? (
              <div style={{ padding:"40px 20px", textAlign:"center" }}>
                <div style={{ width:56, height:40, margin:"0 auto 10px", position:"relative" }}>
                  <div style={{ position:"absolute", inset:0, border:"2px solid var(--rule)", borderRadius:4, background:"var(--parchment)" }}/>
                  <div style={{ position:"absolute", left:2, right:2, top:2, height:0,
                    borderLeft:"24px solid transparent", borderRight:"24px solid transparent",
                    borderTop:"16px solid rgba(139,82,10,.2)" }}/>
                </div>
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
          <div style={{ border:"1.5px solid var(--rule)", background:"var(--surface)", borderRadius:"var(--r-sm)", overflow:"hidden", marginBottom:20 }}>
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
              <div style={{ border:"2px solid var(--ink)", background:"var(--cream)", borderRadius:"var(--r-sm)", marginBottom:20, overflow:"hidden" }}>
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
          <div style={{ border:"1.5px solid var(--rule)", background:"var(--surface)", borderRadius:"var(--r-sm)", overflow:"hidden" }}>
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
        <div style={{ border:"1.5px solid var(--ink)", borderRadius:"var(--r-sm)", background:"var(--surface)", position:"sticky", top:80, overflow:"hidden" }}>
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
        <div style={{ border:"1.5px solid var(--ink)", borderRadius:"var(--r-sm)", position:"sticky", top:80, overflow:"hidden" }}>
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
        <div style={{ position:"sticky", top:80, border:"1.5px solid var(--ink)", borderRadius:"var(--r-sm)", overflow:"hidden", background:"var(--surface)" }}>
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
        <div style={{ display:"flex", border:"1.5px solid var(--ink)", borderRadius:"var(--r-sm)", overflow:"hidden" }}>
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
          <div style={{ border:"1.5px solid var(--ink)", borderRadius:"var(--r-sm)", marginBottom:16 }}>
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
          <div style={{ border:"1.5px solid var(--rule)", borderRadius:"var(--r-md)", padding:"16px" }}>
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

export function AdminHub() {
  const [section,   setSection]  = useState("overview");
  const [emailLog,  setEmailLog] = useState([]);
  const [uptimeMins,setUptimeMins] = useState(2*60+14);
  const [animatedNums,setAnimatedNums] = useState(SECTIONS.map(() => 0));
  const toast = useToast();

  useEffect(() => {
    const uptimeTimer = setInterval(() => setUptimeMins(m => m + 1), 60000);
    return () => clearInterval(uptimeTimer);
  }, []);

  useEffect(() => {
    const timers = SECTIONS.map((s, idx) => setTimeout(() => {
      let cur = 0;
      const target = Number(s.num);
      const t = setInterval(() => {
        cur += 1;
        setAnimatedNums(prev => {
          const next = [...prev];
          next[idx] = cur > target ? target : cur;
          return next;
        });
        if (cur >= target) clearInterval(t);
      }, 40);
    }, idx * 100));
    return () => timers.forEach(clearTimeout);
  }, []);

  const sel = SECTIONS.find(s=>s.id===section);
  const uptimeH = Math.floor(uptimeMins / 60);
  const uptimeM = uptimeMins % 60;

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
              const idx = SECTIONS.findIndex(x => x.id===s.id);
              return(
                <button key={s.id} onClick={()=>setSection(s.id)}
                  style={{ width:"100%", padding:"14px 24px",
                    border:"none", borderLeft:`3px solid ${active?"var(--amber)":"transparent"}`,
                    textAlign:"left", cursor:"pointer", transition:"all .18s",
                    background:active?"rgba(200,131,42,0.08)":"transparent" }}>
                  <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
                    <span style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:2,
                      color:active?"var(--amber-on-ink)":"rgba(240,168,48,.3)" }}>
                      {String(animatedNums[idx]).padStart(2,"0")}
                    </span>
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
              <div style={{ width:10, height:10, borderRadius:"50%",
                background:"var(--green-on-ink)", animation:"pulse 2s ease-in-out infinite" }}/>
              <span style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:3,
                color:"var(--green-on-ink)" }}>SYSTEM ONLINE</span>
            </div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:2,
              color:"rgba(176,152,120,.5)" }}>
              {emailLog.length} EMAIL{emailLog.length!==1?"S":""} DISPATCHED
            </div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:2,
              color:"rgba(176,152,120,.7)", marginTop:4 }}>
              UPTIME {uptimeH}h {String(uptimeM).padStart(2,"0")}m
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
export function RouteManager() {
  const [filter, setFilter] = useState("ALL");
  const MOCK_ROUTES = [
    { id: 1, name: "Red Line", code: "R1", fare: 350, km: 12.5, stops: 18, buses: 6, active: true },
    { id: 2, name: "Blue Line", code: "R2", fare: 420, km: 18.0, stops: 24, buses: 8, active: true },
    { id: 3, name: "Green Line", code: "R3", fare: 280, km: 8.5, stops: 12, buses: 4, active: false },
    { id: 4, name: "Route Alpha", code: "Rα", fare: 500, km: 22.0, stops: 30, buses: 10, active: true },
  ];

  const visible = filter === "ALL" ? MOCK_ROUTES : MOCK_ROUTES.filter(r => (filter === "ACTIVE" ? r.active : !r.active));

  return (
    <div>
      <PageHeader tag="Admin · Routes" title="ROUTE MANAGER" subtitle="Configure and deploy transit lines across the city" 
        actions={<Btn variant="primary">+ ADD NEW ROUTE</Btn>} />
      
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, marginBottom:32 }}>
        {[
          ["TOTAL ROUTES", MOCK_ROUTES.length, "var(--ink)", "All registered lines"],
          ["ACTIVE LINES", MOCK_ROUTES.filter(r=>r.active).length, "var(--green)", "Currently deployed"],
          ["TOTAL BUSES", MOCK_ROUTES.reduce((a,b)=>a+b.buses, 0), "var(--amber-text)", "Vehicles in service"],
        ].map(([title, val, color, sub], i) => (
          <div key={title} style={{ padding:24, background:"var(--surface)", border:"1.5px solid var(--rule)", borderRadius:16, boxShadow:"0 4px 12px rgba(26,18,8,0.02)", display:"flex", alignItems:"center", gap:20, animation:`slideRight .4s ease ${i*0.05}s both` }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:`${color}22`, color, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-display)", fontSize:28, border:`2px solid ${color}` }}>
              {val}
            </div>
            <div>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:4, color:"var(--muted)", textTransform:"uppercase", marginBottom:4 }}>{title}</div>
              <div style={{ fontFamily:"var(--font-sans)", fontSize:13, color:"var(--ink)", fontWeight:600 }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:4, marginBottom:24 }}>
         {["ALL", "ACTIVE", "INACTIVE"].map(f => (
           <button key={f} onClick={() => setFilter(f)} style={{ padding:"8px 16px", background:filter===f?"var(--ink)":"transparent", color:filter===f?"var(--cream-on-ink)":"var(--muted)", border:`1.5px solid ${filter===f?"var(--ink)":"var(--rule)"}`, borderRadius:20, fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:2, cursor:"pointer", transition:"all .2s" }}>
             {f}
           </button>
         ))}
      </div>

      <div style={{ background:"var(--surface)", border:"1.5px solid var(--rule)", borderRadius:16, boxShadow:"0 4px 20px rgba(26,18,8,0.03)", overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"120px 1.5fr 1fr 1fr 1fr 1fr 100px", gap:16, padding:"16px 24px", borderBottom:"2px solid var(--ink)", background:"var(--parchment)" }}>
          {["LINE", "ROUTE NAME", "FARE / MO", "DISTANCE", "STOPS", "BUSES", "STATUS"].map(h => (
            <div key={h} style={{ fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:2, color:"var(--ink)", fontWeight:700 }}>{h}</div>
          ))}
        </div>
        
        {visible.map((r, i) => (
          <div key={r.id} style={{ display:"grid", gridTemplateColumns:"120px 1.5fr 1fr 1fr 1fr 1fr 100px", gap:16, padding:"18px 24px", alignItems:"center", borderBottom:i<visible.length-1?"1px solid var(--rule)":"none", background:!r.active?"repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(26,18,8,.02) 8px, rgba(26,18,8,.02) 9px)":i%2===0?"transparent":"var(--cream)", transition:"background .2s, transform .2s" }} onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateX(0)"}>
            <div><LineBadge name={r.name} /></div>
            <div style={{ fontFamily:"var(--font-sans)", fontSize:16, fontWeight:600, color:"var(--ink)" }}>{r.name}</div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:20, color:"var(--ink)", letterSpacing:1 }}>₹{r.fare}</div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--muted)" }}>{r.km} km</div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--muted)" }}>{r.stops} stops</div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--muted)" }}>{r.buses} buses</div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <Toggle on={r.active} onChange={()=>{}}/>
              <Pill s={r.active?"ACTIVE":"INACTIVE"}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UserManager() {
  const [selected, setSelected] = useState(null);
  const MOCK_USERS = [
    { id: "STU-10042", name: "Aryan Sharma", ptype: "student", status: "ACTIVE", passes: 3, joined: "Aug 2021", email: "aryan@mail.com" },
    { id: "COR-10045", name: "Sneha Iyer", ptype: "corporate", status: "ACTIVE", passes: 1, joined: "Feb 2024", email: "sneha@corp.com" },
    { id: "GEN-10031", name: "Rahul Kumar", ptype: "general", status: "EXPIRED", passes: 5, joined: "Jan 2023", email: "rahul@mail.com" },
    { id: "SEN-10027", name: "Ramesh Sharma", ptype: "senior", status: "ACTIVE", passes: 2, joined: "Mar 2023", email: "ramesh@mail.com" },
    { id: "STU-10033", name: "Priya Patel", ptype: "student", status: "PENDING", passes: 0, joined: "Mar 2024", email: "priya@mail.com" },
  ];

  return (
    <div>
      <PageHeader tag="Admin · Passengers" title="USER MANAGER" subtitle="Manage passenger profiles, verify details, and handle disputes" 
        actions={<Btn variant="secondary">IMPORT USERS</Btn>} />
      
      <div style={{ display:"flex", gap:32, alignItems:"stretch" }}>
        
        {/* Left Side: Directory */}
        <div style={{ flex:1, background:"var(--surface)", border:"1.5px solid var(--rule)", borderRadius:16, overflow:"hidden", display:"flex", flexDirection:"column", minHeight:500 }}>
          <div style={{ padding:"16px 24px", borderBottom:"1.5px solid var(--rule)", background:"var(--parchment)", display:"flex", gap:12 }}>
            <input placeholder="Search passengers..." style={{ flex:1, padding:"10px 16px", borderRadius:8, border:"1px solid var(--rule)", outline:"none", fontFamily:"var(--font-sans)" }}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"100px 1fr 100px 100px", gap:16, padding:"12px 24px", borderBottom:"2px solid var(--ink)", background:"var(--cream)" }}>
            {["ID", "NAME", "CATEGORY", "STATUS"].map(h => (
              <div key={h} style={{ fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:2, color:"var(--ink)", fontWeight:700 }}>{h}</div>
            ))}
          </div>
          <div style={{ overflowY:"auto", flex:1 }}>
            {MOCK_USERS.map((u, i) => (
              <div key={u.id} onClick={() => setSelected(u)} style={{ display:"grid", gridTemplateColumns:"100px 1fr 100px 100px", gap:16, padding:"18px 24px", alignItems:"center", borderBottom:i<MOCK_USERS.length-1?"1px solid var(--rule)":"none", background:selected?.id===u.id?"var(--parchment)":i%2===0?"transparent":"var(--cream)", borderLeft:selected?.id===u.id?"4px solid var(--amber)":"4px solid transparent", cursor:"pointer", transition:"all .2s" }}>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:10, fontWeight:700, letterSpacing:1, color:"var(--amber-text)" }}>{u.id}</div>
                <div style={{ fontFamily:"var(--font-sans)", fontSize:15, fontWeight:600, color:"var(--ink)" }}>{u.name}</div>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--muted)", textTransform:"uppercase" }}>{u.ptype}</div>
                <div><Pill s={u.status}/></div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Detail Panel */}
        <div style={{ width:360, background:"var(--parchment)", border:"1.5px solid var(--rule)", borderRadius:16, padding:32, position:"relative", overflow:"hidden" }}>
          {!selected ? (
            <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", opacity:0.6 }}>
              <div style={{ fontFamily:"var(--font-display)", fontSize:46, color:"var(--muted)", textShadow:"0 2px 0 rgba(255,255,255,0.5)" }}>SELECT ID</div>
              <div style={{ fontFamily:"var(--font-sans)", fontSize:14, color:"var(--muted)" }}>Click a passenger to view details</div>
            </div>
          ) : (
            <div style={{ animation:"slideRight .3s ease" }}>
              <Tag>{selected.ptype} Passenger</Tag>
              <div style={{ display:"flex", gap:16, alignItems:"center", marginBottom:24 }}>
                <div style={{ width:64, height:64, borderRadius:"50%", background:"var(--ink)", color:"var(--amber-on-ink)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-display)", fontSize:32 }}>
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:28, color:"var(--ink)", lineHeight:1, marginBottom:4 }}>{selected.name}</div>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--muted)" }}>{selected.id}</div>
                </div>
              </div>
              <Rule my={24}/>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:2, color:"var(--muted)", marginBottom:4 }}>EMAIL ADDRESS</div>
                  <div style={{ fontFamily:"var(--font-sans)", fontSize:14, color:"var(--ink)", fontWeight:500 }}>{selected.email}</div>
                </div>
                <div>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:2, color:"var(--muted)", marginBottom:4 }}>ACCOUNT STATUS</div>
                  <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                    <Pill s={selected.status}/>
                    <span style={{ fontFamily:"var(--font-sans)", fontSize:12, color:"var(--muted)" }}>Joined {selected.joined}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:2, color:"var(--muted)", marginBottom:4 }}>LIFETIME PASSES</div>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:32, color:"var(--amber-text)", lineHeight:1 }}>{selected.passes}</div>
                </div>
              </div>
              <Rule my={24}/>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <Btn full variant="secondary">VIEW PASS HISTORY</Btn>
                <Btn full variant="danger">SUSPEND ACCOUNT</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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


export function AnnouncementSender() {
  const [form, setForm] = useState({ title:"", body:"", type:"INFO" });
  const [audience, setAudience] = useState("ALL");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div>
      <PageHeader tag="Admin · Announce" title="ANNOUNCEMENTS" subtitle="Broadcast updates, delays, or news to passengers" />
      
      <div style={{ display:"grid", gridTemplateColumns:"1fr 400px", gap:40, alignItems:"start" }}>
        
        {/* Composer Form */}
        <div style={{ background:"var(--surface)", border:"1.5px solid var(--rule)", borderRadius:16, overflow:"hidden" }}>
          <div style={{ background:"var(--ink)", padding:"24px 32px" }}>
            <Tag color="var(--muted-on-ink)">Compose</Tag>
            <div style={{ fontFamily:"var(--font-display)", fontSize:24, letterSpacing:2, color:"var(--amber-on-ink)" }}>NEW BROADCAST</div>
          </div>
          
          <div style={{ padding:32 }}>
            <Field label="Announcement Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Red Line Delays Due to Weather" />
            <Field label="Message Body" type="textarea" value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="Type the full message here..." rows={6} />
            
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
              <div>
                 <Tag>Urgency</Tag>
                 <div style={{ display:"flex", gap:8 }}>
                    {["INFO", "WARN", "CRITICAL"].map(t => (
                      <button key={t} onClick={()=>setForm({...form, type:t})} style={{ padding:"10px 16px", borderRadius:8, border:`1.5px solid ${form.type===t?"var(--ink)":"var(--rule)"}`, background:form.type===t?"var(--parchment)":"transparent", fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:1, color:form.type===t?"var(--ink)":"var(--muted)", fontWeight:700, cursor:"pointer" }}>
                         {t}
                      </button>
                    ))}
                 </div>
              </div>
              <div>
                 <Tag>Audience Filter</Tag>
                 <div style={{ display:"flex", gap:8 }}>
                    {["ALL", "STUDENTS"].map(t => (
                      <button key={t} onClick={()=>setAudience(t)} style={{ padding:"10px 16px", borderRadius:8, border:`1.5px solid ${audience===t?"var(--ink)":"var(--rule)"}`, background:audience===t?"var(--parchment)":"transparent", fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:1, color:audience===t?"var(--ink)":"var(--muted)", fontWeight:700, cursor:"pointer", flex:1 }}>
                         {t}
                      </button>
                    ))}
                 </div>
              </div>
            </div>

            <Rule my={24}/>
            <Btn variant="primary" size="lg" disabled={form.title===""||form.body===""} 
              onClick={() => { setSubmitting(true); setTimeout(()=> { setSubmitting(false); setForm({title:"",body:"",type:"INFO"}); }, 800) }}>
              {submitting ? "SENDING..." : "DISPATCH BROADCAST →"}
            </Btn>
          </div>
        </div>

        {/* History / Previews */}
        <div style={{ background:"var(--parchment)", border:"1.5px solid var(--rule)", borderRadius:16, padding:28 }}>
           <Tag>Recent History</Tag>
           <div style={{ fontFamily:"var(--font-display)", fontSize:26, color:"var(--ink)", marginBottom:24 }}>PAST BROADCASTS</div>
           
           <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
             {[
               { title:"System Maintenance", date:"12 Mar, 4:00 PM", type:"INFO" },
               { title:"Heavy Traffic Warning", date:"10 Mar, 8:15 AM", type:"WARN" },
               { title:"Service Disruption: R3", date:"05 Mar, 2:30 PM", type:"CRITICAL" },
             ].map((b,i) => (
               <div key={i} style={{ background:"var(--surface)", border:"1px solid var(--rule)", padding:16, borderRadius:12 }}>
                 <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <div style={{ width:10, height:10, borderRadius:"50%", background:b.type==="CRITICAL"?"var(--red)":b.type==="WARN"?"var(--amber-text)":"var(--ink)", marginTop:4 }}/>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--muted)" }}>{b.date}</div>
                 </div>
                 <div style={{ fontFamily:"var(--font-sans)", fontSize:15, fontWeight:600, color:"var(--ink)" }}>{b.title}</div>
               </div>
             ))}
           </div>
           
           <Rule my={24}/>
           <Btn variant="secondary" full>VIEW FULL LOG</Btn>
        </div>
      </div>
    </div>
  );
}

export function AdminApplications() {
  const [filter, setFilter] = useState("ALL");
  const MOCK_APPS = [
    { id: "REQ-9921", passenger: "Aryan Sharma", ptype: "student", route: "Red Line", type: "Monthly", date: "16 Mar 2024", amt: 350, status: "PENDING" },
    { id: "REQ-9922", passenger: "Priya Patel", ptype: "student", route: "Blue Line", type: "Quarterly", date: "16 Mar 2024", amt: 1000, status: "PENDING" },
    { id: "REQ-9920", passenger: "Rajesh Kumar", ptype: "general", route: "Green Line", type: "Monthly", date: "15 Mar 2024", amt: 600, status: "APPROVED" },
    { id: "REQ-9919", passenger: "Sneha Iyer", ptype: "corporate", route: "Red Line", type: "Annual", date: "15 Mar 2024", amt: 6500, status: "REJECTED" },
    { id: "REQ-9918", passenger: "Amit Singh", ptype: "senior", route: "Blue Line", type: "Monthly", date: "14 Mar 2024", amt: 300, status: "APPROVED" },
  ];
  
  const visible = filter === "ALL" ? MOCK_APPS : MOCK_APPS.filter(a => a.status === filter);

  return (
    <div>
      <PageHeader tag="Admin · Passes" title="PASS REQUESTS" subtitle="Approve or decline incoming student & commuter passes" 
        actions={<Btn variant="secondary">EXPORT LOGS</Btn>} />
      
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", margin:"16px 0 24px" }}>
        <div style={{ display:"flex", gap:4 }}>
           {["ALL", "PENDING", "APPROVED", "REJECTED"].map(f => (
             <button key={f} onClick={() => setFilter(f)} style={{ padding:"8px 16px", background:filter===f?"var(--ink)":"transparent", color:filter===f?"var(--cream-on-ink)":"var(--muted)", border:`1.5px solid ${filter===f?"var(--ink)":"var(--rule)"}`, borderRadius:20, fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:2, cursor:"pointer", transition:"all .2s" }}>
               {f}
             </button>
           ))}
        </div>
      </div>

      <div style={{ background:"var(--surface)", border:"1.5px solid var(--rule)", borderRadius:16, boxShadow:"0 4px 20px rgba(26,18,8,0.03)", overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"90px 1.5fr 1fr 1fr 100px 90px 120px", gap:16, padding:"16px 24px", borderBottom:"2px solid var(--ink)", background:"var(--parchment)" }}>
          {["ID", "PASSENGER", "ROUTE", "DURATION", "DATE", "AMOUNT", "ACTION"].map(h => (
            <div key={h} style={{ fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:2, color:"var(--ink)", fontWeight:700 }}>{h}</div>
          ))}
        </div>
        
        {visible.map((app, i) => (
          <div key={app.id} style={{ display:"grid", gridTemplateColumns:"90px 1.5fr 1fr 1fr 100px 90px 120px", gap:16, padding:"18px 24px", alignItems:"center", borderBottom:i<visible.length-1?"1px solid var(--rule)":"none", background:i%2===0?"transparent":"var(--cream)", transition:"background .2s" }} onMouseEnter={e=>e.currentTarget.style.background="var(--parchment)"} onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"transparent":"var(--cream)"}>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:10, fontWeight:700, letterSpacing:1, color:"var(--amber-text)" }}>{app.id}</div>
            <div>
              <div style={{ fontFamily:"var(--font-sans)", fontSize:15, fontWeight:600, color:"var(--ink)", marginBottom:4 }}>{app.passenger}</div>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--muted)", textTransform:"uppercase" }}>{app.ptype}</div>
            </div>
            <div><LineBadge name={app.route} /></div>
            <div style={{ fontFamily:"var(--font-sans)", fontSize:13, fontWeight:500 }}>{app.type}</div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--muted)" }}>{app.date}</div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:20, color:"var(--ink)", letterSpacing:1 }}>₹{app.amt.toLocaleString()}</div>
            <div>
              {app.status === "PENDING" ? (
                <div style={{ display:"flex", gap:8 }}>
                  <button style={{ padding:"6px 12px", background:"var(--green)", color:"white", border:"none", borderRadius:6, fontFamily:"var(--font-sans)", fontSize:12, fontWeight:600, cursor:"pointer" }}>Approve</button>
                  <button style={{ padding:"6px 12px", background:"transparent", color:"var(--red)", border:"1px solid var(--red)", borderRadius:6, fontFamily:"var(--font-sans)", fontSize:12, fontWeight:600, cursor:"pointer" }}>Deny</button>
                </div>
              ) : (
                <Pill s={app.status}/>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
