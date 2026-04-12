import { useState, useEffect, useCallback } from "react";
import PassService from "../services/passService";

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

const DEFAULT_ROUTE_COLOR = "#1A4A8A";
const LINE_COLORS = { "Route Alpha":"#B02020", "Route Beta":"#1A4A8A", "Route Gamma":"#1E6641", "Red Line":"#B02020", "Blue Line":"#1A4A8A", "Green Line":"#1E6641" };

const LineBadge = ({ name, color, code, small }) => {
  const LINE_CODES  = { "Route Alpha":"Rα","Route Beta":"Rβ","Route Gamma":"Rγ", "Red Line":"R1","Blue Line":"R2","Green Line":"R3" };
  const badgeColor = color || LINE_COLORS[name] || DEFAULT_ROUTE_COLOR;
  const badgeCode  = code || LINE_CODES[name] || "?";
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4,
      background:badgeColor, color:"white",
      fontFamily:"var(--font-mono)", fontSize:small?7:9, fontWeight:700, letterSpacing:2,
      padding:small?"2px 7px":"3px 10px", borderRadius:"4px" }}>{badgeCode}</span>
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

const makeRouteCode = (name, fallbackIndex = 0) => {
  const cleaned = String(name || "").replace(/[^a-z0-9]+/gi, " ").trim();
  if (!cleaned) return `R${String(fallbackIndex + 1).padStart(2, "0")}`;
  const initials = cleaned
    .split(/\s+/)
    .map(word => word.charAt(0))
    .join("")
    .slice(0, 3)
    .toUpperCase();
  return `R${initials || String(fallbackIndex + 1).padStart(2, "0")}`;
};

const normalizeRoute = (route, fallbackIndex = 0) => ({
  id: route.id ?? Date.now() + fallbackIndex,
  name: route.name || "Unnamed Route",
  code: route.code || makeRouteCode(route.name, fallbackIndex),
  color: route.color || LINE_COLORS[route.name] || DEFAULT_ROUTE_COLOR,
  fare: Number(route.fare ?? route.route_fare ?? 0),
  km: Number(route.distance_km ?? route.km ?? 0),
  stops: Array.isArray(route.stops) ? route.stops.length : Number(route.stops ?? 0),
  buses: Number(route.buses ?? 0),
  active: route.is_active ?? route.active ?? true,
});

// ══════════════════════════════════════════════════════════════════════
//  SCREENS CLONE COMPONENTS
// ══════════════════════════════════════════════════════════════════════

export function AdminHubClone({ onNavigate, toast }) {
  const ACTIVITY = [
    { time:"09:14", action:"Pass approved",   detail:"BPP·2024·001567 — Priya Patel",    type:"success" },
    { time:"09:02", action:"Payment received", detail:"₹1,215 — Aryan Sharma · Quarterly",type:"success" },
    { time:"08:55", action:"Query raised",     detail:"QRY-004 — Sneha Iyer",              type:"warn"    },
    { time:"08:41", action:"Pass rejected",    detail:"BPP·2024·001563 — Amit Singh",      type:"error"   },
    { time:"08:30", action:"New registration", detail:"Vikram Nair — Corporate",           type:"info"    },
  ];

  const QUERIES = [
    { id:"QRY-001", passenger:"Aryan Sharma", subject:"Payment deducted but pass not issued", priority:"HIGH", date:"14 Mar" },
    { id:"QRY-003", passenger:"Rahul Kumar",  subject:"Bus BUS-02 consistently late by 20 min", priority:"HIGH", date:"12 Mar" },
  ];

  return (
    <div>
      <PageHeader tag="Admin · Hub" title="COMMAND CENTER" subtitle="System health, live feed, and essential dispatches" />
      
      {/* Top Stats Strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20, marginBottom:32 }}>
        {[
          ["PASSES TODAY", "24", "var(--ink)", "Active applications processing"],
          ["ACTIVE PASSENGERS", "1,243", "var(--green)", "Across all lines"],
          ["MONTHLY REVENUE", "₹4.2L", "var(--amber-text)", "Up 12% this week"],
          ["SYSTEM STATUS", "OPTIMAL", "var(--ink)", "99.9% uptime · No delays"],
        ].map(([title, val, color, sub], i) => (
          <div key={title} style={{ padding:28, background:"var(--surface)", border:"1.5px solid var(--rule)", borderRadius:16, boxShadow:"0 4px 12px rgba(26,18,8,0.02)", animation:`fadeUp .4s ease ${i*0.05}s both` }}>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:4, color:"var(--muted)", textTransform:"uppercase", marginBottom:12 }}>{title}</div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:46, letterSpacing:1, color, lineHeight:1, marginBottom:8 }}><AnimatedCount target={val}/></div>
            <div style={{ fontFamily:"var(--font-sans)", fontSize:12, color:"var(--muted)", fontWeight:500 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 400px", gap:32, alignItems:"start" }}>
        {/* Left Column */}
        <div style={{ display:"flex", flexDirection:"column", gap:32 }}>
          
          {/* Live Feed */}
          <div style={{ background:"var(--surface)", border:"1.5px solid var(--rule)", borderRadius:16, overflow:"hidden" }}>
            <div style={{ padding:"20px 24px", borderBottom:"1.5px solid var(--rule)", background:"var(--parchment)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontFamily:"var(--font-display)", fontSize:20, letterSpacing:2, color:"var(--ink)" }}>LIVE ACTIVITY FEED</div>
              <Btn variant="ghost" size="sm" onClick={() => onNavigate("admin")}>VIEW ALL</Btn>
            </div>
            <div>
              {ACTIVITY.map((a,i)=>(
                <div key={i} style={{ padding:"16px 24px", display:"grid", gridTemplateColumns:"50px 1fr", gap:16, alignItems:"center", borderBottom:i<ACTIVITY.length-1?"1px solid var(--rule)":"none", background:i%2===0?"transparent":"var(--cream)" }}>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--muted)", fontWeight:700 }}>{a.time}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontFamily:"var(--font-sans)", fontSize:15, color:"var(--ink)", fontWeight:600, marginBottom:4 }}>{a.action}</div>
                      <div style={{ fontFamily:"var(--font-sans)", fontSize:12, color:"var(--muted)" }}>{a.detail}</div>
                    </div>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:a.type==="success"?"var(--green)":a.type==="warn"?"var(--amber-text)":a.type==="error"?"var(--red)":"var(--ink)" }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Queries */}
          <div style={{ background:"var(--surface)", border:"1.5px solid var(--rule)", borderRadius:16, overflow:"hidden" }}>
            <div style={{ padding:"20px 24px", borderBottom:"1.5px solid var(--rule)", background:"#FEF7E6", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontFamily:"var(--font-display)", fontSize:20, letterSpacing:2, color:"var(--amber-text)" }}>UNRESOLVED QUERIES</div>
              <Pill s="HIGH"/>
            </div>
            <div style={{ padding:24, display:"grid", gap:16 }}>
              {QUERIES.map((q,i)=>(
                <div key={i} style={{ border:"1px solid var(--rule)", padding:16, borderRadius:12, background:"var(--cream)", borderLeft:"4px solid var(--amber-text)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:1, color:"var(--amber-text)", fontWeight:700 }}>{q.id}</div>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--muted)" }}>{q.date}</div>
                  </div>
                  <div style={{ fontFamily:"var(--font-sans)", fontSize:16, color:"var(--ink)", fontWeight:600, marginBottom:6 }}>{q.subject}</div>
                  <div style={{ fontFamily:"var(--font-sans)", fontSize:13, color:"var(--muted)" }}>From: {q.passenger}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions & Tools */}
        <div style={{ display:"flex", flexDirection:"column", gap:24, position:"sticky", top:100 }}>
          
          <div style={{ background:"var(--ink)", color:"var(--cream-on-ink)", borderRadius:16, padding:28, boxShadow:"0 12px 32px rgba(26,18,8,0.12)" }}>
            <div style={{ fontFamily:"var(--font-display)", fontSize:24, letterSpacing:2, color:"var(--amber-on-ink)", marginBottom:20 }}>QUICK ACTIONS</div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <button style={{ padding:"12px 16px", background:"transparent", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"white", fontFamily:"var(--font-sans)", fontSize:14, fontWeight:600, textAlign:"left", cursor:"pointer", transition:"background .2s" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                + Generate Discount Voucher
              </button>
              <button style={{ padding:"12px 16px", background:"transparent", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"white", fontFamily:"var(--font-sans)", fontSize:14, fontWeight:600, textAlign:"left", cursor:"pointer", transition:"background .2s" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                ✉ Dispatch Mass Email
              </button>
              <button style={{ padding:"12px 16px", background:"var(--amber)", border:"none", borderRadius:8, color:"var(--ink)", fontFamily:"var(--font-sans)", fontSize:14, fontWeight:700, textAlign:"left", cursor:"pointer", transition:"background .2s" }}>
                ↓ Download Monthly Report
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export function RouteManagerClone({ onNavigate, toast }) {
  const [filter, setFilter] = useState("ALL");
  const [routes, setRoutes] = useState([
    { id: 1, name: "Red Line", code: "R1", color: "#B02020", fare: 350, km: 12.5, stops: 18, buses: 6, active: true },
    { id: 2, name: "Blue Line", code: "R2", color: "#1A4A8A", fare: 420, km: 18.0, stops: 24, buses: 8, active: true },
    { id: 3, name: "Green Line", code: "R3", color: "#1E6641", fare: 280, km: 8.5, stops: 12, buses: 4, active: false },
    { id: 4, name: "Route Alpha", code: "Rα", color: "#B02020", fare: 500, km: 22.0, stops: 30, buses: 10, active: true },
  ]);
  const [showCreateRoute, setShowCreateRoute] = useState(false);
  const [savingRoute, setSavingRoute] = useState(false);
  const [routeForm, setRouteForm] = useState({
    name: "",
    source: "",
    destination: "",
    stops: "",
    distance_km: "",
    duration_min: "",
    fare: "",
    color: DEFAULT_ROUTE_COLOR,
    is_active: true,
  });
  const [routeErrors, setRouteErrors] = useState({});

  const updateRouteField = (field, value) => {
    setRouteForm(prev => ({ ...prev, [field]: value }));
    setRouteErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const resetRouteForm = () => {
    setRouteForm({
      name: "",
      source: "",
      destination: "",
      stops: "",
      distance_km: "",
      duration_min: "",
      fare: "",
      color: DEFAULT_ROUTE_COLOR,
      is_active: true,
    });
    setRouteErrors({});
  };

  const validateRouteForm = () => {
    const errors = {};
    const stopsList = routeForm.stops.split(",").map(stop => stop.trim()).filter(Boolean);
    const distance = Number(routeForm.distance_km);
    const duration = Number(routeForm.duration_min);
    const fare = Number(routeForm.fare);

    if (!routeForm.name.trim()) errors.name = "Route name is required.";
    if (!routeForm.source.trim()) errors.source = "Source stop is required.";
    if (!routeForm.destination.trim()) errors.destination = "Destination stop is required.";
    if (!stopsList.length) errors.stops = "Enter at least one intermediate stop.";
    if (!Number.isFinite(distance) || distance <= 0) errors.distance_km = "Distance must be greater than zero.";
    if (!Number.isFinite(duration) || duration <= 0) errors.duration_min = "Duration must be greater than zero.";
    if (!Number.isFinite(fare) || fare <= 0) errors.fare = "Fare must be greater than zero.";
    if (!/^#[0-9A-Fa-f]{6}$/.test(routeForm.color || "")) errors.color = "Choose a valid hex color.";

    setRouteErrors(errors);
    return { ok: Object.keys(errors).length === 0, stopsList, distance, duration, fare };
  };

  const createRoute = async () => {
    const validation = validateRouteForm();
    if (!validation.ok) return;

    setSavingRoute(true);
    try {
      const payload = {
        name: routeForm.name.trim(),
        source: routeForm.source.trim(),
        destination: routeForm.destination.trim(),
        stops: validation.stopsList,
        distance_km: validation.distance,
        duration_min: validation.duration,
        fare: validation.fare,
        color: routeForm.color,
        is_active: routeForm.is_active,
      };

      const created = await PassService.createRoute(payload);
      const newRoute = normalizeRoute({
        ...created,
        stops: created.stops || validation.stopsList,
        distance_km: created.distance_km ?? validation.distance,
        fare: created.fare ?? validation.fare,
        color: created.color || routeForm.color,
        buses: created.buses ?? 0,
      }, routes.length);

      setRoutes(prev => [newRoute, ...prev]);
      toast.success(`${newRoute.name} created successfully.`);
      setShowCreateRoute(false);
      resetRouteForm();
    } catch (error) {
      const detail = error?.response?.data;
      const message = typeof detail === "string"
        ? detail
        : detail?.detail || detail?.error || "Unable to create route.";
      toast.error(message);
    } finally {
      setSavingRoute(false);
    }
  };

  const toggleRoute = (id) => {
    setRoutes(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
    const r = routes.find(x => x.id === id);
    toast.info(`${r.name} status: ${!r.active ? "ACTIVE" : "INACTIVE"}`);
  };

  const sortedRoutes = [...routes].sort((a, b) => b.active - a.active);
  const visible = filter === "ALL" ? sortedRoutes : sortedRoutes.filter(r => (filter === "ACTIVE" ? r.active : !r.active));

  return (
    <div>
      <PageHeader tag="Admin · Routes" title="ROUTE MANAGER" subtitle="Configure and deploy transit lines across the city" 
        actions={<Btn variant="primary" onClick={() => { resetRouteForm(); setShowCreateRoute(true); }}>+ ADD NEW ROUTE</Btn>} />
      
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, marginBottom:32 }}>
        {[
          ["TOTAL ROUTES", routes.length, "var(--ink)", "All registered lines"],
          ["ACTIVE LINES", routes.filter(r=>r.active).length, "var(--green)", "Currently deployed"],
          ["TOTAL BUSES", routes.reduce((a,b)=>a+b.buses, 0), "var(--amber-text)", "Vehicles in service"],
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
            <div><LineBadge name={r.name} color={r.color} code={r.code} /></div>
            <div style={{ fontFamily:"var(--font-sans)", fontSize:16, fontWeight:600, color:"var(--ink)" }}>{r.name}</div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:20, color:"var(--ink)", letterSpacing:1 }}>₹{r.fare}</div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--muted)" }}>{r.km} km</div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--muted)" }}>{r.stops} stops</div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--muted)" }}>{r.buses} buses</div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <Toggle on={r.active} onChange={() => toggleRoute(r.id)}/>
              <Pill s={r.active?"ACTIVE":"INACTIVE"}/>
            </div>
          </div>
        ))}
      </div>

      {showCreateRoute && (
        <div style={{ position:"fixed", inset:0, zIndex:3000, background:"rgba(26,18,8,.72)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={() => setShowCreateRoute(false)}>
          <div style={{ width:"min(980px, 100%)", maxHeight:"90vh", overflowY:"auto", background:"var(--surface)", border:"2px solid var(--ink)", borderRadius:16, boxShadow:"0 24px 80px rgba(26,18,8,.35)" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding:"18px 24px", background:"var(--ink)", color:"var(--cream-on-ink)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:4, color:"var(--muted-on-ink)", marginBottom:4 }}>ROUTE DESIGNER</div>
                <div style={{ fontFamily:"var(--font-display)", fontSize:24, letterSpacing:2, color:"var(--amber-on-ink)" }}>CREATE NEW ROUTE</div>
              </div>
              <button onClick={() => setShowCreateRoute(false)} style={{ background:"none", border:"none", color:"var(--muted-on-ink)", fontFamily:"var(--font-display)", fontSize:20, cursor:"pointer" }}>✕</button>
            </div>

            <div style={{ padding:24, display:"grid", gridTemplateColumns:"1.2fr .8fr", gap:24 }}>
              <div>
                <Field label="Route Name" value={routeForm.name} onChange={e => updateRouteField("name", e.target.value)} placeholder="Route Delta" error={routeErrors.name} required />
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <Field label="Source" value={routeForm.source} onChange={e => updateRouteField("source", e.target.value)} placeholder="Central Station" error={routeErrors.source} required />
                  <Field label="Destination" value={routeForm.destination} onChange={e => updateRouteField("destination", e.target.value)} placeholder="City Mall" error={routeErrors.destination} required />
                </div>
                <Field label="Intermediate Stops" type="textarea" rows={4} value={routeForm.stops} onChange={e => updateRouteField("stops", e.target.value)} placeholder="Old Market, Hospital Gate, Library Square" error={routeErrors.stops} hint="Separate stops with commas." required />
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12 }}>
                  <Field label="Distance (km)" type="number" value={routeForm.distance_km} onChange={e => updateRouteField("distance_km", e.target.value)} placeholder="12.5" error={routeErrors.distance_km} required />
                  <Field label="Duration (min)" type="number" value={routeForm.duration_min} onChange={e => updateRouteField("duration_min", e.target.value)} placeholder="42" error={routeErrors.duration_min} required />
                  <Field label="Fare" type="number" value={routeForm.fare} onChange={e => updateRouteField("fare", e.target.value)} placeholder="450" error={routeErrors.fare} required />
                </div>
                <div style={{ marginBottom:18 }}>
                  <div style={{ fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:2,color:"var(--ink-mid)",textTransform:"uppercase",marginBottom:8,fontWeight:700 }}>
                    Route Color<span style={{ color:"var(--red)",marginLeft:4 }}>*</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"56px 1fr", gap:10, alignItems:"center" }}>
                    <input
                      type="color"
                      value={routeForm.color}
                      onChange={e => updateRouteField("color", e.target.value.toUpperCase())}
                      style={{ width:56, height:44, border:"1.5px solid var(--rule)", borderRadius:8, background:"var(--cream)", cursor:"pointer" }}
                    />
                    <Field
                      value={routeForm.color}
                      onChange={e => updateRouteField("color", e.target.value.toUpperCase())}
                      placeholder="#1A4A8A"
                      error={routeErrors.color}
                      style={{ marginBottom:0 }}
                    />
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background:"var(--parchment)", border:"1.5px solid var(--rule)", borderRadius:12, marginBottom:20 }}>
                  <div>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:2, color:"var(--muted)", marginBottom:4 }}>START ACTIVE</div>
                    <div style={{ fontFamily:"var(--font-sans)", fontSize:13, color:"var(--ink)" }}>Make the route available immediately</div>
                  </div>
                  <Toggle on={routeForm.is_active} onChange={(next) => updateRouteField("is_active", next)} />
                </div>
                <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                  <Btn variant="ghost" onClick={() => setShowCreateRoute(false)}>Cancel</Btn>
                  <Btn variant="primary" onClick={createRoute} disabled={savingRoute}>{savingRoute ? "CREATING…" : "CREATE ROUTE"}</Btn>
                </div>
              </div>

              <div style={{ border:"1.5px solid var(--rule)", borderRadius:16, background:"var(--cream)", padding:20 }}>
                <Tag color="var(--amber-text)">Preview</Tag>
                <div style={{ fontFamily:"var(--font-display)", fontSize:28, letterSpacing:1, color:"var(--ink)", marginBottom:12 }}>{routeForm.name || "NEW ROUTE"}</div>
                <div style={{ display:"grid", gap:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}><span style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:2, color:"var(--muted)" }}>LINE</span><LineBadge name={routeForm.name || "NEW ROUTE"} color={routeForm.color} code={makeRouteCode(routeForm.name, routes.length)} /></div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:2, color:"var(--muted)" }}>SOURCE</span><span style={{ fontFamily:"var(--font-sans)", fontSize:13, color:"var(--ink)" }}>{routeForm.source || "—"}</span></div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:2, color:"var(--muted)" }}>DESTINATION</span><span style={{ fontFamily:"var(--font-sans)", fontSize:13, color:"var(--ink)" }}>{routeForm.destination || "—"}</span></div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:2, color:"var(--muted)" }}>DISTANCE</span><span style={{ fontFamily:"var(--font-sans)", fontSize:13, color:"var(--ink)" }}>{routeForm.distance_km || "0"} km</span></div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:2, color:"var(--muted)" }}>DURATION</span><span style={{ fontFamily:"var(--font-sans)", fontSize:13, color:"var(--ink)" }}>{routeForm.duration_min || "0"} min</span></div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:2, color:"var(--muted)" }}>FARE</span><span style={{ fontFamily:"var(--font-display)", fontSize:22, color:"var(--amber-text)" }}>₹{routeForm.fare || "0"}</span></div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:2, color:"var(--muted)" }}>STATUS</span><Pill s={routeForm.is_active ? "ACTIVE" : "INACTIVE"}/></div>
                  <div style={{ marginTop:10 }}>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:2, color:"var(--muted)", marginBottom:6 }}>STOPS</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {routeForm.stops.split(",").map(stop => stop.trim()).filter(Boolean).length ? routeForm.stops.split(",").map(stop => stop.trim()).filter(Boolean).map(stop => (
                        <span key={stop} style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:1, color:"var(--amber-text)", background:"var(--parchment)", padding:"3px 8px", border:"1px solid var(--rule)" }}>{stop}</span>
                      )) : <span style={{ fontFamily:"var(--font-sans)", fontSize:12, color:"var(--muted)", fontStyle:"italic" }}>No stops entered yet.</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function UserManagerClone({ onNavigate, toast }) {
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([
    { id: "STU-10042", name: "Aryan Sharma", ptype: "student", status: "ACTIVE", passes: 3, joined: "Aug 2021", email: "aryan@mail.com" },
    { id: "COR-10045", name: "Sneha Iyer", ptype: "corporate", status: "ACTIVE", passes: 1, joined: "Feb 2024", email: "sneha@corp.com" },
    { id: "GEN-10031", name: "Rahul Kumar", ptype: "general", status: "EXPIRED", passes: 5, joined: "Jan 2023", email: "rahul@mail.com" },
    { id: "SEN-10027", name: "Ramesh Sharma", ptype: "senior", status: "ACTIVE", passes: 2, joined: "Mar 2023", email: "ramesh@mail.com" },
    { id: "STU-10033", name: "Priya Patel", ptype: "student", status: "PENDING", passes: 0, joined: "Mar 2024", email: "priya@mail.com" },
  ]);

  const suspendUser = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "INACTIVE" } : u));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status: "INACTIVE" }));
    toast.warn("Account suspended for " + id);
  };

  const visible = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <PageHeader tag="Admin · Passengers" title="USER MANAGER" subtitle="Manage passenger profiles, verify details, and handle disputes" 
        actions={<Btn variant="secondary">IMPORT USERS</Btn>} />
      
      <div style={{ display:"flex", gap:32, alignItems:"stretch" }}>
        
        {/* Left Side: Directory */}
        <div style={{ flex:1, background:"var(--surface)", border:"1.5px solid var(--rule)", borderRadius:16, overflow:"hidden", display:"flex", flexDirection:"column", minHeight:500 }}>
          <div style={{ padding:"16px 24px", borderBottom:"1.5px solid var(--rule)", background:"var(--parchment)", display:"flex", gap:12 }}>
            <input 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="Search passengers by Name or ID..." 
              style={{ flex:1, padding:"10px 16px", borderRadius:8, border:"1px solid var(--rule)", outline:"none", fontFamily:"var(--font-sans)" }}
            />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"100px 1fr 100px 100px", gap:16, padding:"12px 24px", borderBottom:"2px solid var(--ink)", background:"var(--cream)" }}>
            {["ID", "NAME", "CATEGORY", "STATUS"].map(h => (
              <div key={h} style={{ fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:2, color:"var(--ink)", fontWeight:700 }}>{h}</div>
            ))}
          </div>
          <div style={{ overflowY:"auto", flex:1 }}>
            {visible.map((u, i) => (
              <div key={u.id} onClick={() => setSelected(u)} style={{ display:"grid", gridTemplateColumns:"100px 1fr 100px 100px", gap:16, padding:"18px 24px", alignItems:"center", borderBottom:i<visible.length-1?"1px solid var(--rule)":"none", background:selected?.id===u.id?"var(--parchment)":i%2===0?"transparent":"var(--cream)", borderLeft:selected?.id===u.id?"4px solid var(--amber)":"4px solid transparent", cursor:"pointer", transition:"all .2s" }}>
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
                <Btn full variant="secondary" onClick={() => onNavigate("triplog")}>VIEW PASS HISTORY</Btn>
                <Btn full variant="danger" onClick={() => suspendUser(selected.id)}>SUSPEND ACCOUNT</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AnalyticsDashboardClone({ onNavigate, toast }) {
  const [period, setPeriod] = useState("week");

  const PERIOD_DATA = {
    week: {
      stats: [
        ["ACTIVE PASSES", "243", "+12", "var(--amber-text)", true],
        ["REVENUE (₹K)", "180.5", "+8.2%", "var(--green)", true],
        ["WEEKLY SCANS", "4,820", "-3%", "var(--ink)", false],
        ["SUCCESS RATE", "97.4%", "STABLE", "var(--ink)", true],
      ],
      ridership: [
        { day: "MON", val: 680 }, { day: "TUE", val: 720 }, { day: "WED", val: 690 },
        { day: "THU", val: 810 }, { day: "FRI", val: 850 }, { day: "SAT", val: 420 }, { day: "SUN", val: 210 }
      ],
      financials: [
        { m: "MON", val: 24.5 }, { m: "TUE", val: 26.2 }, { m: "WED", val: 25.1 },
        { m: "THU", val: 29.8 }, { m: "FRI", val: 31.2 }, { m: "SAT", val: 15.4 }
      ]
    },
    month: {
      stats: [
        ["ACTIVE PASSES", "1,102", "+41", "var(--amber-text)", true],
        ["REVENUE (₹K)", "742.8", "+15.4%", "var(--green)", true],
        ["MONTHLY SCANS", "22,400", "+5.2%", "var(--ink)", true],
        ["SUCCESS RATE", "98.1%", "+1.2%", "var(--green)", true],
      ],
      ridership: [
        { day: "W1", val: 4800 }, { day: "W2", val: 5200 }, { day: "W3", val: 4950 },
        { day: "W4", val: 5400 }, { day: "W5", val: 2050 }, { day: "", val: 0 }, { day: "", val: 0 }
      ],
      financials: [
        { m: "W1", val: 142 }, { m: "W2", val: 158 }, { m: "W3", val: 149 },
        { m: "W4", val: 164 }, { m: "W5", val: 72 }, { m: "AVG", val: 137 }
      ]
    },
    year: {
      stats: [
        ["ACTIVE PASSES", "5,420", "+1,200", "var(--amber-text)", true],
        ["REVENUE (₹M)", "8.92", "+22.5%", "var(--green)", true],
        ["ANNUAL SCANS", "265k", "+18.4%", "var(--ink)", true],
        ["SUCCESS RATE", "98.5%", "STABLE", "var(--green)", true],
      ],
      ridership: [
        { day: "Q1", val: 62000 }, { day: "Q2", val: 68000 }, { day: "Q3", val: 64500 },
        { day: "Q4", val: 70500 }, { day: "", val: 0 }, { day: "", val: 0 }, { day: "", val: 0 }
      ],
      financials: [
        { m: "2020", val: 3.2 }, { m: "2021", val: 4.8 }, { m: "2022", val: 6.1 },
        { m: "2023", val: 7.4 }, { m: "2024", val: 8.9 }, { m: "PROJ", val: 10.5 }
      ]
    }
  };

  const data = PERIOD_DATA[period];
  const maxR = Math.max(...data.ridership.map(x => x.val)) || 1;
  const maxF = Math.max(...data.financials.map(x => x.val)) || 1;

  return (
    <div>
      <PageHeader tag="Admin · Analytics" title="DATA & ANALYTICS" subtitle="Metrics, revenue, and system utilization patterns" 
        actions={
          <div style={{ display:"flex", background:"var(--surface)", border:"1.5px solid var(--rule)", borderRadius:8, overflow:"hidden" }}>
            {["week","month","year"].map(p => (
              <button key={p} onClick={()=>setPeriod(p)} style={{ padding:"10px 20px", background:period===p?"var(--ink)":"transparent", color:period===p?"var(--amber-on-ink)":"var(--muted)", border:"none", borderRight:p!=="year"?"1px solid var(--rule)":"none", fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:2, textTransform:"uppercase", cursor:"pointer", transition:"background .2s" }}>
                {p}
              </button>
            ))}
          </div>
        } />
      
      {/* Big Stats Row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20, marginBottom:32 }}>
        {data.stats.map(([title, val, delta, color, up], i) => (
          <div key={title} style={{ padding:28, background:"var(--surface)", border:"1.5px solid var(--rule)", borderRadius:16, boxShadow:"0 4px 12px rgba(26,18,8,0.02)", animation:`fadeUp .4s ease ${i*0.05}s both` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:4, color:"var(--muted)", textTransform:"uppercase" }}>{title}</div>
              <div style={{ padding:"4px 8px", background:up?"var(--success-bg)":"var(--error-bg)", color:up?"var(--green)":"var(--red)", borderRadius:6, fontFamily:"var(--font-sans)", fontSize:11, fontWeight:700 }}>
                {up?"↑":"↓"} {delta}
              </div>
            </div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:48, letterSpacing:1, color, lineHeight:1 }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 340px", gap:32 }}>
        
        {/* Pass Registrations Timeline */}
        <div style={{ background:"var(--surface)", border:"1.5px solid var(--rule)", borderRadius:16, padding:28 }}>
          <Tag>System Load</Tag>
          <div style={{ fontFamily:"var(--font-display)", fontSize:28, color:"var(--ink)", marginBottom:32 }}>RIDERSHIP BREAKDOWN</div>
          
          <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:180, position:"relative", paddingTop:20 }}>
            {[25,50,75,100].map((pct, idx) => (
              <div key={idx} style={{ position:"absolute", left:0, right:0, bottom:`${pct}%`, borderTop:"1px dashed var(--rule)", pointerEvents:"none" }}/>
            ))}
            {data.ridership.map((d,i) => (
              <div key={i} style={{ flex:1, display:d.day?"flex":"none", flexDirection:"column", alignItems:"center", gap:8 }}>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--amber-text)", fontWeight:700 }}>{d.val > 1000 ? (d.val/1000).toFixed(1)+"k" : d.val}</div>
                <div style={{ width:"100%", background:"var(--amber)", height:`${(d.val/maxR)*160}px`, minHeight:4, borderRadius:"4px 4px 0 0", transition:"height .5s var(--ease-spring)", animation:`barGrow .6s var(--ease-spring) ${i*0.05}s both`, transformOrigin:"bottom" }}/>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--muted)" }}>{d.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Financials */}
        <div style={{ background:"var(--surface)", border:"1.5px solid var(--rule)", borderRadius:16, padding:28 }}>
          <Tag>Financials</Tag>
          <div style={{ fontFamily:"var(--font-display)", fontSize:28, color:"var(--ink)", marginBottom:32 }}>REVENUE TREND</div>
          
          <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:180, position:"relative", paddingTop:20 }}>
            {[25,50,75,100].map((pct, idx) => (
              <div key={idx} style={{ position:"absolute", left:0, right:0, bottom:`${pct}%`, borderTop:"1px dashed var(--rule)", pointerEvents:"none" }}/>
            ))}
            {data.financials.map((d,i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--green)", fontWeight:700 }}>{d.val}{period==="year"?"M":"k"}</div>
                <div style={{ width:"100%", background:"var(--green)", height:`${(d.val/maxF)*160}px`, minHeight:4, borderRadius:"4px 4px 0 0", transition:"height .5s var(--ease-spring)", animation:`barGrow .6s var(--ease-spring) ${i*0.05}s both`, transformOrigin:"bottom" }}/>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--muted)" }}>{d.m}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Demographics / Distribution */}
        <div style={{ background:"var(--parchment)", border:"1.5px solid var(--rule)", borderRadius:16, padding:28 }}>
          <Tag>Distribution</Tag>
          <div style={{ fontFamily:"var(--font-display)", fontSize:28, color:"var(--ink)", marginBottom:24 }}>BY PASSENGER TYPE</div>
          
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
             {[
               {name:"Student", pct:55, color:"#1A4A8A"},
               {name:"General Commuter", pct:30, color:"#B02020"},
               {name:"Senior Citizen", pct:10, color:"#1E6641"},
               {name:"Corporate", pct:5, color:"#C8832A"}
             ].map((r,i)=>(
               <div key={r.name}>
                 <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, alignItems:"center" }}>
                   <div style={{ fontFamily:"var(--font-sans)", fontSize:14, fontWeight:600, color:"var(--ink)" }}>{r.name}</div>
                   <div style={{ fontFamily:"var(--font-display)", fontSize:18, color:"var(--ink)" }}>{r.pct}%</div>
                 </div>
                 <div style={{ height:6, background:"var(--rule)", borderRadius:3, overflow:"hidden" }}>
                   <div style={{ width:`${r.pct}%`, height:"100%", background:r.color, borderRadius:3 }}/>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnnouncementSenderClone({ onNavigate, toast }) {
  const [form, setForm] = useState({ title:"", body:"", type:"INFO" });
  const [audience, setAudience] = useState("ALL");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([
    { title:"System Maintenance", date:"12 Mar, 4:00 PM", type:"INFO", body:"Scheduled database optimization." },
    { title:"Heavy Traffic Warning", date:"10 Mar, 8:15 AM", type:"WARN", body:"Expected delays across all Red Line routes." },
    { title:"Service Disruption: R3", date:"05 Mar, 2:30 PM", type:"CRITICAL", body:"Power line failure at Sector 4." },
  ]);

  const dispatch = () => {
    setSubmitting(true);
    setTimeout(() => {
      const now = new Date();
      const timestamp = now.toLocaleDateString("en-IN", { day:"2-digit", month:"short" }) + ", " + now.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
      const newEntry = {
        title: form.title,
        date: timestamp,
        type: form.type,
        body: form.body
      };
      setHistory(prev => [newEntry, ...prev]);
      setSubmitting(false);
      setForm({ title:"", body:"", type:"INFO" });
      toast.success("Broadcast Dispatched to " + audience);
    }, 800);
  };

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
            <Btn variant="primary" size="lg" disabled={form.title===""||form.body===""||submitting} 
              onClick={dispatch}>
              {submitting ? "SENDING..." : "DISPATCH BROADCAST →"}
            </Btn>
          </div>
        </div>

        {/* History / Previews */}
        <div style={{ background:"var(--parchment)", border:"1.5px solid var(--rule)", borderRadius:16, padding:28 }}>
           <Tag>Recent History</Tag>
           <div style={{ fontFamily:"var(--font-display)", fontSize:26, color:"var(--ink)", marginBottom:24 }}>PAST BROADCASTS</div>
           
           <div style={{ display:"flex", flexDirection:"column", gap:16, maxHeight:500, overflowY:"auto" }}>
             {history.map((b,i) => (
               <div key={i} style={{ background:"var(--surface)", border:"1px solid var(--rule)", padding:16, borderRadius:12 }}>
                 <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <div style={{ width:10, height:10, borderRadius:"50%", background:b.type==="CRITICAL"?"var(--red)":b.type==="WARN"?"var(--amber-text)":"var(--ink)", marginTop:4 }}/>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--muted)" }}>{b.date}</div>
                 </div>
                 <div style={{ fontFamily:"var(--font-sans)", fontSize:15, fontWeight:600, color:"var(--ink)" }}>{b.title}</div>
                 <div style={{ fontFamily:"var(--font-sans)", fontSize:12, color:"var(--muted)", marginTop:6, fontStyle:"italic" }}>{b.body}</div>
               </div>
             ))}
           </div>
           
           <Rule my={24}/>
           <Btn variant="secondary" full onClick={() => toast.info("Full log currently limited to session history.")}>VIEW FULL LOG</Btn>
        </div>
      </div>
    </div>
  );
}

export function AdminApplicationsClone({ onNavigate, toast }) {
  const [filter, setFilter] = useState("ALL");
  const [apps, setApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);

  const mapApp = useCallback((app) => {
    const duration = (app.duration_type || "monthly").replace(/_/g, " ");
    const dateSource = app.applied_at || app.created_at || app.reviewed_at;
    return {
      id: app.id,
      passenger: app.student_name || app.student_email || `User ${app.student}`,
      ptype: app.metadata?.passenger_type || "general",
      route: app.route_name || "Unknown Route",
      type: duration.charAt(0).toUpperCase() + duration.slice(1),
      date: dateSource ? new Date(dateSource).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—",
      amt: Number(app.route_fare || 0),
      status: (app.status || "pending").toUpperCase(),
    };
  }, []);

  const fetchApplications = useCallback(async (silent = false) => {
    if (!silent) setLoadingApps(true);
    try {
      const data = await PassService.getApplications();
      setApps((data || []).map(mapApp));
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to fetch applications.");
    } finally {
      if (!silent) setLoadingApps(false);
    }
  }, [mapApp, toast]);

  useEffect(() => {
    fetchApplications(false);
    const unsubscribe = PassService.subscribePassSync(() => fetchApplications(true));
    const timer = setInterval(() => fetchApplications(true), 5000);
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [fetchApplications]);

  const handleAction = async (id, status) => {
    try {
      if (status === "APPROVED") {
        await PassService.approveApplication(id);
      } else {
        await PassService.rejectApplication(id, "Rejected by admin");
      }
      setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      toast.success(`Application ${id} ${status.toLowerCase()}`);
      fetchApplications(true);
    } catch (err) {
      const data = err?.response?.data;
      const msg = data?.error || data?.detail || data?.message || "Action failed.";

      if ((err?.response?.status || 0) >= 500) {
        toast.error("Server error while processing request. Retrying data sync...");
      } else {
        toast.error(msg);
      }

      // Always force a refresh after failed action to avoid stale status in admin table.
      fetchApplications(true);
    }
  };

  const exportLogs = () => {
    const csv = "ID,Passenger,Type,Route,Duration,Date,Amount,Status\n" + 
      apps.map(a => `${a.id},${a.passenger},${a.ptype},${a.route},${a.type},${a.date},${a.amt},${a.status}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "pass_request_logs.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Logs exported to CSV.");
  };

  const visible = filter === "ALL" ? apps : apps.filter(a => a.status === filter);

  return (
    <div>
      <PageHeader tag="Admin · Passes" title="PASS REQUESTS" subtitle="Approve or decline incoming student & commuter passes" 
        actions={<Btn variant="secondary" onClick={exportLogs}>EXPORT LOGS</Btn>} />
      
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", margin:"16px 0 24px" }}>
        <div style={{ display:"flex", gap:4 }}>
           {["ALL", "PENDING", "APPROVED", "REJECTED"].map(f => (
             <button key={f} onClick={() => setFilter(f)} style={{ padding:"8px 16px", background:filter===f?"var(--ink)":"transparent", color:filter===f?"var(--cream-on-ink)":"var(--muted)", border:`1.5px solid ${filter===f?"var(--ink)":"var(--rule)"}`, borderRadius:20, fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:2, cursor:"pointer", transition:"all .2s" }}>
               {f}
             </button>
           ))}
        </div>
        <div style={{ fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:1, color:"var(--muted)" }}>
          {loadingApps ? "SYNCING…" : `${apps.length} TOTAL`}
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
                  <button onClick={() => handleAction(app.id, "APPROVED")} style={{ padding:"6px 12px", background:"var(--green)", color:"white", border:"none", borderRadius:6, fontFamily:"var(--font-sans)", fontSize:12, fontWeight:600, cursor:"pointer" }}>Approve</button>
                  <button onClick={() => handleAction(app.id, "REJECTED")} style={{ padding:"6px 12px", background:"transparent", color:"var(--red)", border:"1px solid var(--red)", borderRadius:6, fontFamily:"var(--font-sans)", fontSize:12, fontWeight:600, cursor:"pointer" }}>Deny</button>
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
