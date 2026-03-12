/**
 * BusPassPro — Full App (API Wired)
 * All mock data replaced with real API calls via hooks and services
 * Run alongside: BusPassPro.jsx (UI), hooks/, services/
 */

import { useState, useEffect, useCallback } from "react";
import { AuthProvider, useAuth }         from "./hooks/useAuth";
import { ToastProvider, useToast }       from "./hooks/useToast";
import { useWebSocket }                  from "./hooks/useWebSocket";
import { usePass, useAdminApplications } from "./hooks/usePass";
import PassService                        from "./services/passService";
import AIService                          from "./services/aiService";
import PaymentService                    from "./services/paymentService";

/* ── Import all UI components from the design file ─────────────────────────
   These are the styled components from BusPassPro.jsx.
   In your project, import them directly:
   import { QRCanvas, Ticker, Pill, Rule, Tag, ... } from "./BusPassPro";
   For this file we redefine the minimal wiring layer.
─────────────────────────────────────────────────────────────────────────── */

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;700&family=Instrument+Sans:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{--cream:#F5EFE0;--parchment:#EDE4CC;--amber:#BC7820;--amber-l:#E8A84A;--ink:#1A1208;--ink-mid:#3D2E0E;--red:#C0392B;--green:#2D6A4F;--muted:#7A6347;--rule:#C8B99A;--bg-valid:#EDFAF3;--bg-warn:#FFF8EC;--bg-error:#FFF0EE;--bg-selected:#FFF8EE;--on-dark-dim:#888888;}
body{background:var(--cream);color:var(--ink);}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes pulseDot{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes stampDrop{0%{transform:scale(2.2)rotate(-8deg);opacity:0}60%{transform:scale(.95)rotate(2deg);opacity:1}100%{transform:scale(1)rotate(-3deg);opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
.fade-up{animation:fadeUp .4s ease both}
.stamp{animation:stampDrop .5s cubic-bezier(.23,1,.32,1) both}
`;

// ── Shared atoms (minimal re-impl for wiring file) ────────────────────────
const Tag  = ({children}) => <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:4,color:"var(--muted)",textTransform:"uppercase",marginBottom:8}}>{children}</div>;
const Rule = ({my=16})    => <div style={{height:1,background:"var(--rule)",margin:`${my}px 0`}}/>;
const Pill = ({s}) => {
  const m={ACTIVE:{bg:"var(--green)",c:"var(--cream)"},APPROVED:{bg:"var(--green)",c:"var(--cream)"},VALID:{bg:"var(--green)",c:"var(--cream)"},PENDING:{bg:"var(--amber)",c:"var(--ink)"},REJECTED:{bg:"var(--red)",c:"var(--cream)"},EXPIRED:{bg:"var(--muted)",c:"var(--cream)"},INVALID:{bg:"var(--red)",c:"var(--cream)"}};
  const p=m[s?.toUpperCase()]||m.PENDING;
  return <span style={{background:p.bg,color:p.c,fontFamily:"'JetBrains Mono'",fontSize:9,fontWeight:700,letterSpacing:2,padding:"3px 9px",clipPath:"polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"}}>{s?.toUpperCase()}</span>;
};
const Spinner = () => <div style={{width:20,height:20,border:"3px solid var(--rule)",borderTop:"3px solid var(--amber)",borderRadius:"50%",animation:"spin .8s linear infinite",display:"inline-block"}}/>;
const Btn = ({children, onClick, variant="primary", disabled=false, full=false, size="md"}) => {
  const pad = size==="sm" ? "6px 14px" : "11px 20px";
  const styles = {
    primary:  {bg:"var(--ink)",   color:"var(--amber)"},
    secondary:{bg:"transparent",  color:"var(--ink)",  border:"1px solid var(--ink)"},
    danger:   {bg:"var(--red)",   color:"var(--cream)"},
    success:  {bg:"var(--green)", color:"var(--cream)"},
  };
  const s = styles[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding:pad, background:s.bg, color:s.color,
      border: s.border||"none",
      fontFamily:"'Bebas Neue'", fontSize:size==="sm"?12:14, letterSpacing:2,
      cursor:disabled?"not-allowed":"pointer", opacity:disabled?.5:1,
      width:full?"100%":"auto", transition:"opacity .2s",
    }}>{children}</button>
  );
};

// ── Loading skeleton ──────────────────────────────────────────────────────
const Skeleton = ({h=18, w="100%", mb=8}) => (
  <div style={{height:h,width:w,background:"var(--parchment)",marginBottom:mb,animation:"pulseDot 1.5s infinite"}}/>
);

// ── Error box ─────────────────────────────────────────────────────────────
const ErrorBox = ({message, onRetry}) => (
  <div style={{padding:20,border:"1px solid var(--red)",background:"var(--bg-error)"}}>
    <div style={{fontFamily:"'Bebas Neue'",fontSize:14,color:"var(--red)",letterSpacing:2,marginBottom:6}}>ERROR</div>
    <div style={{fontFamily:"'Instrument Sans'",fontSize:13,color:"var(--red)",marginBottom:12}}>{message}</div>
    {onRetry && <Btn variant="danger" size="sm" onClick={onRetry}>RETRY</Btn>}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN — wired to real API
// ─────────────────────────────────────────────────────────────────────────────
function LoginScreen({ onSuccess }) {
  const { login, loading, error, clearError } = useAuth();
  const [role,   setRole]   = useState("student");
  const [email,  setEmail]  = useState("");
  const [pw,     setPw]     = useState("");

  const handleLogin = async () => {
    clearError();
    try {
      const user = await login(email, pw);
      onSuccess(user);
    } catch (_) { /* error already set in hook */ }
  };

  const InpStyle = {width:"100%",padding:"10px 13px",border:"1px solid var(--ink)",background:"var(--cream)",fontFamily:"'Instrument Sans'",fontSize:13,color:"var(--ink)",outline:"none"};

  return (
    <div style={{minHeight:"100vh",background:"var(--cream)",display:"flex"}}>
      {/* Left hero */}
      <div style={{width:"55%",position:"relative",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:56,overflow:"hidden"}}>
        {/* Background image */}
        <img src="/images/img1.jpg" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center"}}/>
        {/* Dark overlay so text stays readable */}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(26,18,8,.92) 0%,rgba(26,18,8,.60) 50%,rgba(26,18,8,.45) 100%)"}}/>
        {/* Amber accent lines */}
        {[70,140,210,280,350].map((y,i)=><div key={i} style={{position:"absolute",left:0,right:0,top:y,height:1,background:i%2===0?"rgba(188,120,32,0.10)":"rgba(255,255,255,0.04)"}}/>)}
        {/* Ghost text */}
        <div style={{position:"absolute",top:-20,left:-10,fontFamily:"'Bebas Neue'",fontSize:240,color:"rgba(188,120,32,0.07)",lineHeight:.85,userSelect:"none",letterSpacing:-8}}>BUS<br/>PASS<br/>PRO</div>
        {/* Content */}
        <div style={{position:"relative"}}>
          <div style={{fontFamily:"'JetBrains Mono'",fontSize:9,letterSpacing:4,color:"var(--amber)",marginBottom:14}}>◆ BUS PASS MANAGEMENT SYSTEM</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:72,color:"var(--cream)",lineHeight:.9,letterSpacing:1,marginBottom:22}}>YOUR<br/>CITY.<br/><span style={{color:"var(--amber)"}}>YOUR RIDE.</span></div>
          <div style={{fontFamily:"'DM Serif Display'",fontSize:16,color:"var(--on-dark-dim)",fontStyle:"italic",maxWidth:320,lineHeight:1.6,marginBottom:38}}>Digital passes, real-time tracking, AI-powered routing — built for every commuter.</div>
        </div>
      </div>
      {/* Right form */}
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"56px 48px"}}>
        <div style={{maxWidth:340}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:13,letterSpacing:5,color:"var(--muted)",marginBottom:6}}>SIGN IN</div>
          <div style={{fontFamily:"'DM Serif Display'",fontSize:32,marginBottom:30,lineHeight:1.1}}>Welcome<br/>back.</div>
          {/* Role selector — determines which dashboard loads */}
          <div style={{marginBottom:20}}>
            <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:3,color:"var(--muted)",marginBottom:8}}>PORTAL TYPE</div>
            <div style={{display:"flex",border:"1px solid var(--ink)"}}>
              {[["student","STUDENT 🎓"],["admin","ADMIN ⚙"],["conductor","CONDUCTOR 🔍"]].map(([r,l])=>(
                <button key={r} onClick={()=>setRole(r)} style={{flex:1,padding:"9px 0",background:role===r?"var(--ink)":"transparent",color:role===r?"var(--amber)":"var(--muted)",border:"none",borderRight:r!=="conductor"?"1px solid var(--ink)":"none",fontFamily:"'JetBrains Mono'",fontSize:7,letterSpacing:1,cursor:"pointer",transition:"all .18s"}}>{l}</button>
              ))}
            </div>
          </div>
          {error && <div style={{marginBottom:14,padding:"10px 14px",background:"var(--bg-error)",border:"1px solid var(--red)",fontFamily:"'Instrument Sans'",fontSize:12,color:"var(--red)"}}>{error}</div>}
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:3,color:"var(--muted)",marginBottom:7}}>EMAIL ADDRESS</div>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="you@email.com" style={InpStyle}/>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:3,color:"var(--muted)",marginBottom:7}}>PASSWORD</div>
            <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="••••••••" style={InpStyle}/>
          </div>
          <Btn full onClick={handleLogin} disabled={loading||!email||!pw}>
            {loading ? <Spinner/> : "ENTER PORTAL →"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT DASHBOARD — real API
// ─────────────────────────────────────────────────────────────────────────────
function StudentDashboard() {
  const { user }                     = useAuth();
  const { activePass, loading, error, refetch } = usePass();
  const { buses, connected }         = useWebSocket(); // real WebSocket
  const toast                        = useToast();
  const [aiFrom,  setAiFrom]         = useState("");
  const [aiTo,    setAiTo]           = useState("");
  const [aiStops, setAiStops]        = useState([]);
  const [aiRes,   setAiRes]          = useState(null);
  const [aiLoad,  setAiLoad]         = useState(false);
  const [qrUrl,   setQrUrl]          = useState(null);

  // Load available stops for AI planner
  useEffect(() => {
    AIService.getStops()
      .then(setAiStops)
      .catch(() => toast.error("Could not load stops for route planner."));
  }, []);

  // Load QR code for active pass
  useEffect(() => {
    if (activePass?.id) {
      PassService.getQRCode(activePass.id)
        .then(d => setQrUrl(d.qr_code_url))
        .catch(() => {});
    }
  }, [activePass]);

  const optimize = async () => {
    if (!aiFrom || !aiTo) return;
    setAiLoad(true); setAiRes(null);
    try {
      const result = await AIService.optimizeRoute(aiFrom, aiTo);
      setAiRes(result);
    } catch (err) {
      toast.error(err.response?.data?.error || "Route optimization failed.");
    } finally { setAiLoad(false); }
  };

  const SelStyle = {width:"100%",padding:"10px 13px",border:"1px solid var(--ink)",background:"var(--cream)",fontFamily:"'Instrument Sans'",fontSize:13,color:"var(--ink)",outline:"none",appearance:"none"};

  if (loading) return <div style={{display:"flex",flexDirection:"column",gap:12,padding:24}}>{[...Array(6)].map((_,i)=><Skeleton key={i} h={i===0?52:22}/>)}</div>;
  if (error)   return <ErrorBox message={error} onRetry={refetch}/>;

  const name = user?.student_profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Student";

  return (
    <div className="fade-up">
      {/* Hero */}
      <div style={{position:"relative",overflow:"hidden",borderBottom:"3px double var(--ink)",paddingBottom:28,marginBottom:32}}>
        <div style={{position:"absolute",right:-16,top:-12,fontFamily:"'Bebas Neue'",fontSize:170,color:"var(--parchment)",lineHeight:.85,userSelect:"none",letterSpacing:-4,pointerEvents:"none"}}>Rα</div>
        <Tag>Student Portal · {new Date().getFullYear()}</Tag>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:54,letterSpacing:1,lineHeight:.92}}>
          GOOD {new Date().getHours()<12?"MORNING":new Date().getHours()<17?"AFTERNOON":"EVENING"},<br/>
          <span style={{color:"var(--amber)"}}>{name.toUpperCase()}.</span>
        </div>
        <div style={{marginTop:10,fontFamily:"'Instrument Sans'",fontSize:13,color:"var(--muted)"}}>
          {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"2-digit",month:"long",year:"numeric"})}
          {activePass && <> &nbsp;·&nbsp; Pass active for <strong style={{color:"var(--ink)"}}>{Math.ceil((new Date(activePass.valid_until)-new Date())/864e5)} more days</strong></>}
        </div>
        {/* Stats strip */}
        <div style={{display:"flex",gap:0,marginTop:22,borderTop:"1px solid var(--rule)",paddingTop:18}}>
          {[
            ["PASS STATUS", activePass ? "ACTIVE ✓" : "NONE", activePass ? "var(--green)" : "var(--red)"],
            ["DAYS LEFT",   activePass ? Math.ceil((new Date(activePass.valid_until)-new Date())/864e5) : "—", "var(--ink)"],
            ["WS STATUS",   connected ? "LIVE" : "OFFLINE", connected ? "var(--green)" : "var(--muted)"],
          ].map(([k,v,c],i)=>(
            <div key={i} style={{flex:1,paddingRight:20,marginRight:20,borderRight:i<2?"1px solid var(--rule)":"none"}}>
              <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:3,color:"var(--muted)",marginBottom:4}}>{k}</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:28,color:c,letterSpacing:1}}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:48,alignItems:"start"}}>
        {/* LEFT */}
        <div>
          {/* Digital Pass */}
          <Tag>Digital Pass</Tag>
          {activePass ? (
            <div style={{background:"var(--ink)",color:"var(--cream)",padding:28,position:"relative",overflow:"hidden",marginBottom:36}}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,width:7,background:"repeating-linear-gradient(180deg,var(--ink) 0,var(--ink) 8px,var(--cream) 8px,var(--cream) 14px)",opacity:.25}}/>
              <div style={{position:"absolute",right:0,top:0,bottom:0,width:7,background:"repeating-linear-gradient(180deg,var(--ink) 0,var(--ink) 8px,var(--cream) 8px,var(--cream) 14px)",opacity:.25}}/>
              <div className="stamp" style={{position:"absolute",top:14,right:22,border:"3px solid var(--green)",color:"var(--green)",fontFamily:"'Bebas Neue'",fontSize:16,letterSpacing:3,padding:"3px 10px",transform:"rotate(-3deg)"}}>VALID</div>
              <div style={{paddingLeft:14}}>
                <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:3,color:"var(--amber)",marginBottom:10}}>BUSPASSPRO · BUS PASS MANAGEMENT</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontFamily:"'DM Serif Display'",fontSize:26,lineHeight:1.1}}>{activePass.student_name}</div>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:"var(--amber-l)",marginTop:4}}>{activePass.student_id}</div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    {qrUrl
                      ? <img src={qrUrl} alt="QR Code" style={{width:80,height:80,background:"var(--cream)",padding:4}}/>
                      : <div style={{width:80,height:80,background:"var(--cream)",display:"flex",alignItems:"center",justifyContent:"center"}}><Spinner/></div>
                    }
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,color:"var(--on-dark-dim)",marginTop:4}}>SCAN TO VERIFY</div>
                  </div>
                </div>
                <Rule my={14}/>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                  {[["ROUTE",activePass.route_name],["BOARDING",activePass.boarding_stop],["VALID UNTIL",activePass.valid_until],["TYPE",activePass.duration_type?.toUpperCase()]].map(([k,v])=>(
                    <div key={k}>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:2,color:"var(--on-dark-dim)",marginBottom:3}}>{k}</div>
                      <div style={{fontFamily:"'Instrument Sans'",fontSize:12,fontWeight:600}}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:14,fontFamily:"'JetBrains Mono'",fontSize:9,color:"var(--on-dark-dim)",letterSpacing:1}}>#{activePass.pass_number}</div>
              </div>
            </div>
          ) : (
            <div style={{border:"1px dashed var(--rule)",padding:28,textAlign:"center",marginBottom:36}}>
              <div style={{fontFamily:"'DM Serif Display'",fontSize:22,marginBottom:8}}>No active pass</div>
              <div style={{fontFamily:"'Instrument Sans'",fontSize:13,color:"var(--muted)"}}>Apply for a bus pass to get started.</div>
            </div>
          )}

          {/* Live Bus Board */}
          <Tag>Live Bus Board {connected ? "· 🟢 LIVE" : "· 🔴 OFFLINE"}</Tag>
          <div style={{border:"1px solid var(--ink)",marginBottom:32}}>
            <div style={{background:"var(--ink)",color:"var(--amber)",fontFamily:"'Bebas Neue'",fontSize:12,letterSpacing:3,display:"grid",gridTemplateColumns:"80px 1fr 110px 72px 80px",padding:"8px 16px",gap:8}}>
              {["BUS","CURRENT STOP","ROUTE","SPEED","STATUS"].map(h=><span key={h}>{h}</span>)}
            </div>
            {buses.length === 0 ? (
              <div style={{padding:"20px 16px",fontFamily:"'Instrument Sans'",fontSize:13,color:"var(--muted)",textAlign:"center"}}>
                {connected ? "No buses currently broadcasting." : "Connecting to live feed…"}
              </div>
            ) : buses.map((bus,i)=>(
              <div key={bus.bus_number} style={{display:"grid",gridTemplateColumns:"80px 1fr 110px 72px 80px",padding:"12px 16px",gap:8,alignItems:"center",borderBottom:i<buses.length-1?"1px solid var(--rule)":"none",background:i%2===0?"transparent":"var(--parchment)"}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:15,letterSpacing:1,color:"var(--amber)"}}>{bus.bus_number}</div>
                <div>
                  <div style={{fontFamily:"'Instrument Sans'",fontSize:13,fontWeight:500}}>{bus.stop_name||"—"}</div>
                  <div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:bus.speed_kmh>0?"var(--green)":"var(--amber)",animation:"pulseDot 1.5s infinite"}}/>
                    <span style={{fontFamily:"'JetBrains Mono'",fontSize:8,color:"var(--muted)",letterSpacing:1}}>{bus.speed_kmh>0?"MOVING":"STOPPED"}</span>
                  </div>
                </div>
                <div style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:"var(--muted)"}}>{bus.route_name||"—"}</div>
                <div style={{fontFamily:"'JetBrains Mono'",fontSize:11}}>{Math.round(bus.speed_kmh||0)} km/h</div>
                <div style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"var(--muted)",letterSpacing:1}}>{bus.last_seen ? new Date(bus.last_seen).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : "—"}</div>
              </div>
            ))}
            <div style={{padding:"7px 16px",background:"var(--parchment)",fontFamily:"'JetBrains Mono'",fontSize:8,color:"var(--muted)",letterSpacing:2}}>◆ {connected?"LIVE · WEBSOCKET CONNECTED":"ATTEMPTING RECONNECT…"}</div>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <Tag>AI Route Optimizer</Tag>
          <div style={{border:"2px solid var(--ink)",padding:24,marginBottom:32,position:"relative"}}>
            <div style={{position:"absolute",top:-2,right:-2,width:18,height:18,background:"var(--amber)"}}/>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,marginBottom:4,lineHeight:1.1}}>Find your<br/><em>optimal route.</em></div>
            <div style={{fontFamily:"'Instrument Sans'",fontSize:12,color:"var(--muted)",marginBottom:20}}>NetworkX graph · scikit-learn demand</div>
            {[["FROM",aiFrom,setAiFrom],["TO",aiTo,setAiTo]].map(([lbl,val,set])=>(
              <div key={lbl} style={{marginBottom:12}}>
                <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:3,color:"var(--muted)",marginBottom:6}}>{lbl}</div>
                <select value={val} onChange={e=>set(e.target.value)} style={SelStyle}>
                  <option value="">Select stop…</option>
                  {aiStops.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ))}
            <Btn full onClick={optimize} disabled={aiLoad||!aiFrom||!aiTo}>
              {aiLoad ? <Spinner/> : "FIND OPTIMAL ROUTE →"}
            </Btn>
            {aiRes && (
              <div className="fade-up" style={{marginTop:18,borderTop:"1px solid var(--rule)",paddingTop:18}}>
                <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:14}}>
                  {aiRes.path?.map((s,i)=>(
                    <span key={i} style={{display:"flex",alignItems:"center",gap:3}}>
                      <span style={{fontFamily:"'Instrument Sans'",fontSize:10,fontWeight:600,background:i===0?"var(--green)":i===aiRes.path.length-1?"var(--amber)":"var(--ink)",color:"var(--cream)",padding:"2px 7px"}}>{s}</span>
                      {i<aiRes.path.length-1&&<span style={{fontFamily:"'Bebas Neue'",fontSize:13,color:"var(--muted)"}}>›</span>}
                    </span>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",border:"1px solid var(--ink)"}}>
                  {[["DIST",`${aiRes.total_distance_km}km`],["FARE",`₹${aiRes.estimated_fare}`],["TIME",`${aiRes.estimated_duration_min}m`]].map(([k,v],i)=>(
                    <div key={k} style={{padding:"10px 8px",borderRight:i<2?"1px solid var(--ink)":"none",textAlign:"center"}}>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:7,letterSpacing:2,color:"var(--muted)"}}>{k}</div>
                      <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:"var(--amber)"}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLY PAGE — real API + Razorpay
// ─────────────────────────────────────────────────────────────────────────────
function ApplyPage() {
  const { user }           = useAuth();
  const { routes, refetch } = usePass();
  const toast               = useToast();
  const [step, setStep]     = useState(1);
  const [sel,  setSel]      = useState({ route: null, boarding: "", duration: "monthly" });
  const [loading, setLoading] = useState(false);
  const [appId, setAppId]   = useState(null);
  const [done, setDone]     = useState(false);

  const DURS = [{id:"monthly",label:"MONTHLY",mo:1,disc:0},{id:"quarterly",label:"QUARTERLY",mo:3,disc:10},{id:"annual",label:"ANNUAL",mo:12,disc:20}];
  const dur  = DURS.find(d=>d.id===sel.duration);
  const base = sel.route ? routes.find(r=>r.id===sel.route)?.fare||0 : 0;
  const total = Math.round(base * dur.mo * (1 - dur.disc/100));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Create application
      const app = await PassService.applyForPass({
        route:         sel.route,
        boarding_stop: sel.boarding,
        duration_type: sel.duration,
      });
      setAppId(app.id);

      // 2. Trigger Razorpay payment
      await PaymentService.pay(app.id, {
        name:  user?.student_profile?.full_name,
        email: user?.email,
        phone: user?.phone,
      });

      toast.success("Payment successful! Application submitted.");
      setDone(true);
      refetch();
    } catch (err) {
      if (err.message === "Payment cancelled by user") {
        toast.warn("Payment cancelled. Your application was saved — complete payment later.");
        setDone(true); // app created, payment pending
      } else {
        toast.error(err.response?.data?.error || err.message || "Submission failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const SelStyle = {width:"100%",padding:"10px 13px",border:"1px solid var(--ink)",background:"var(--cream)",fontFamily:"'Instrument Sans'",fontSize:13,color:"var(--ink)",outline:"none",appearance:"none"};

  if (done) return (
    <div className="fade-up" style={{maxWidth:480,margin:"80px auto",textAlign:"center"}}>
      <div className="stamp" style={{display:"inline-block",border:"4px solid var(--green)",padding:"10px 28px",fontFamily:"'Bebas Neue'",fontSize:52,color:"var(--green)",letterSpacing:4,transform:"rotate(-4deg)",marginBottom:32}}>SUBMITTED</div>
      <div style={{fontFamily:"'DM Serif Display'",fontSize:28,marginBottom:10}}>Application Received!</div>
      <div style={{fontFamily:"'Instrument Sans'",color:"var(--muted)",marginBottom:24,lineHeight:1.6}}>Awaiting admin approval. You'll receive an email confirmation within 24 hours.</div>
      {appId && <div style={{fontFamily:"'JetBrains Mono'",fontSize:12,background:"var(--ink)",color:"var(--amber)",padding:"10px 24px",display:"inline-block",letterSpacing:2}}>APP ID: {appId}</div>}
    </div>
  );

  return (
    <div>
      <Tag>Application Form</Tag>
      <div style={{fontFamily:"'Bebas Neue'",fontSize:44,letterSpacing:1,marginBottom:8}}>APPLY FOR <span style={{color:"var(--amber)"}}>BUS PASS</span></div>
      {/* Stepper */}
      <div style={{display:"flex",alignItems:"center",marginBottom:36}}>
        {["SELECT ROUTE","DURATION","PAYMENT","CONFIRM"].map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",background:i+1<step?"var(--green)":i+1===step?"var(--amber)":"transparent",border:`2px solid ${i+1<=step?(i+1<step?"var(--green)":"var(--amber)"):"var(--rule)"}`,fontFamily:"'Bebas Neue'",fontSize:12,color:i+1<=step?"var(--cream)":"var(--muted)"}}>{i+1<step?"✓":i+1}</div>
              <div style={{fontFamily:"'JetBrains Mono'",fontSize:7,letterSpacing:2,color:i+1===step?"var(--ink)":"var(--muted)"}}>{s}</div>
            </div>
            {i<3&&<div style={{flex:1,height:1,background:i+1<step?"var(--green)":"var(--rule)",margin:"0 8px"}}/>}
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:40,alignItems:"start"}}>
        <div style={{border:"1px solid var(--ink)",padding:28}}>
          {step===1&&(
            <div className="fade-up">
              <div style={{fontFamily:"'DM Serif Display'",fontSize:22,marginBottom:18}}>Choose your route</div>
              {routes.length===0 ? [...Array(3)].map((_,i)=><Skeleton key={i} h={72} mb={10}/>) : routes.map(route=>(
                <div key={route.id} onClick={()=>setSel(s=>({...s,route:route.id}))} style={{border:`2px solid ${sel.route===route.id?"var(--amber)":"var(--rule)"}`,padding:16,marginBottom:10,cursor:"pointer",background:sel.route===route.id?"var(--bg-selected)":"transparent",transition:"all .18s"}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <div><div style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:1}}>{route.name}</div><div style={{fontFamily:"'Instrument Sans'",fontSize:12,color:"var(--muted)",marginTop:2}}>{route.source} → {route.destination} · {route.distance_km}km</div></div>
                    <div style={{textAlign:"right"}}><div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:"var(--amber)"}}>₹{route.fare}</div><div style={{fontFamily:"'JetBrains Mono'",fontSize:8,color:"var(--muted)"}}>PER MONTH</div></div>
                  </div>
                  {sel.route===route.id&&(
                    <div style={{marginTop:12}} onClick={e=>e.stopPropagation()}>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:2,color:"var(--muted)",marginBottom:6}}>SELECT BOARDING STOP</div>
                      <select value={sel.boarding} onChange={e=>setSel(s=>({...s,boarding:e.target.value}))} style={SelStyle}>
                        <option value="">Choose stop…</option>
                        {[route.source,...(route.stops||[]),route.destination].map(st=><option key={st} value={st}>{st}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {step===2&&(
            <div className="fade-up">
              <div style={{fontFamily:"'DM Serif Display'",fontSize:22,marginBottom:18}}>Select duration</div>
              {DURS.map(d=>{const amt=Math.round(base*d.mo*(1-d.disc/100));return(
                <div key={d.id} onClick={()=>setSel(s=>({...s,duration:d.id}))} style={{border:`2px solid ${sel.duration===d.id?"var(--ink)":"var(--rule)"}`,padding:20,marginBottom:10,cursor:"pointer",background:sel.duration===d.id?"var(--ink)":"transparent",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all .18s"}}>
                  <div><div style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:2,color:sel.duration===d.id?"var(--amber)":"var(--ink)"}}>{d.label}</div><div style={{fontFamily:"'Instrument Sans'",fontSize:12,color:sel.duration===d.id?"var(--on-dark-dim)":"var(--muted)"}}>{d.mo} month{d.mo>1?"s":""}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontFamily:"'Bebas Neue'",fontSize:28,color:sel.duration===d.id?"var(--cream)":"var(--ink)"}}>₹{amt}</div>{d.disc>0&&<div style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"var(--green)",letterSpacing:1}}>{d.disc}% SAVED</div>}</div>
                </div>
              );})}
            </div>
          )}
          {step===3&&(
            <div className="fade-up">
              <div style={{fontFamily:"'DM Serif Display'",fontSize:22,marginBottom:18}}>Complete payment</div>
              <div style={{border:"1px solid var(--rule)",padding:20,marginBottom:18}}>
                {[["Route",routes.find(r=>r.id===sel.route)?.name||"—"],["Duration",dur.label],["Base Fare",`₹${base}`],["Discount",`${dur.disc}%`]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",fontFamily:"'Instrument Sans'",fontSize:13,marginBottom:8}}><span style={{color:"var(--muted)"}}>{k}</span><span>{v}</span></div>
                ))}
                <Rule/>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:"'Bebas Neue'",fontSize:18,letterSpacing:1}}>TOTAL</span><span style={{fontFamily:"'Bebas Neue'",fontSize:28,color:"var(--amber)"}}>₹{total}</span></div>
              </div>
              <div style={{border:"1px dashed var(--rule)",padding:22,textAlign:"center"}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:4,color:"var(--amber)",marginBottom:4}}>RAZORPAY</div>
                <div style={{fontFamily:"'Instrument Sans'",fontSize:12,color:"var(--muted)"}}>UPI · Cards · Netbanking · Wallets</div>
              </div>
            </div>
          )}
          <div style={{display:"flex",gap:10,marginTop:22}}>
            {step>1&&<Btn variant="secondary" onClick={()=>setStep(s=>s-1)}>← BACK</Btn>}
            <Btn full onClick={()=>step<3?setStep(s=>s+1):handleSubmit()} disabled={loading||(step===1&&(!sel.route||!sel.boarding))}>
              {loading ? <Spinner/> : step===3 ? "CONFIRM & PAY →" : "CONTINUE →"}
            </Btn>
          </div>
        </div>
        {/* Summary */}
        <div style={{border:"1px solid var(--rule)",padding:20,position:"sticky",top:104}}>
          <Tag>Your Selection</Tag>
          {sel.route ? (
            <>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:1,marginBottom:10}}>{routes.find(r=>r.id===sel.route)?.name}</div>
              {sel.boarding&&<div style={{fontFamily:"'Instrument Sans'",fontSize:12,color:"var(--muted)",marginBottom:8}}>Board at: <strong style={{color:"var(--ink)"}}>{sel.boarding}</strong></div>}
              <Rule/><div style={{fontFamily:"'Bebas Neue'",fontSize:34,color:"var(--amber)",letterSpacing:1}}>₹{total}</div>
            </>
          ) : <div style={{fontFamily:"'Instrument Sans'",fontSize:12,color:"var(--muted)"}}>Select a route to see pricing</div>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD — real API
// ─────────────────────────────────────────────────────────────────────────────
function AdminDashboard() {
  const { applications, loading, error, approve, reject, refetch } = useAdminApplications();
  const toast   = useToast();
  const [filter, setFilter] = useState("ALL");
  const [busy,   setBusy]   = useState({});

  const doApprove = async (id) => {
    setBusy(b=>({...b,[id]:true}));
    try { await approve(id); toast.success("Application approved! Pass issued."); }
    catch { toast.error("Failed to approve."); }
    finally { setBusy(b=>({...b,[id]:false})); }
  };
  const doReject = async (id) => {
    setBusy(b=>({...b,[id]:true}));
    try { await reject(id); toast.warn("Application rejected."); }
    catch { toast.error("Failed to reject."); }
    finally { setBusy(b=>({...b,[id]:false})); }
  };

  const visible = filter==="ALL" ? applications : applications.filter(a=>a.status?.toUpperCase()===filter);

  if (loading) return <div style={{display:"flex",flexDirection:"column",gap:12}}>{[...Array(8)].map((_,i)=><Skeleton key={i} h={48}/>)}</div>;
  if (error)   return <ErrorBox message={error} onRetry={refetch}/>;

  return (
    <div>
      <Tag>Admin Control Panel</Tag>
      <div style={{fontFamily:"'Bebas Neue'",fontSize:44,letterSpacing:1,marginBottom:32}}>OPERATIONS <span style={{color:"var(--amber)"}}>DASHBOARD</span></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderTop:"3px solid var(--ink)",borderBottom:"1px solid var(--rule)",marginBottom:40}}>
        {[["TOTAL",applications.length,"var(--ink)"],["PENDING",applications.filter(a=>a.status==="pending").length,"var(--amber)"],["APPROVED",applications.filter(a=>a.status==="approved").length,"var(--green)"],["REJECTED",applications.filter(a=>a.status==="rejected").length,"var(--red)"]].map(([k,v,c],i)=>(
          <div key={k} style={{padding:"18px 22px",borderRight:i<3?"1px solid var(--rule)":"none"}}>
            <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:3,color:"var(--muted)",marginBottom:4}}>{k}</div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:40,color:c,letterSpacing:1,lineHeight:1}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:0,marginBottom:14,borderBottom:"1px solid var(--ink)"}}>
        {["ALL","PENDING","APPROVED","REJECTED"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:"7px 18px",border:"none",background:filter===f?"var(--ink)":"transparent",color:filter===f?"var(--amber)":"var(--muted)",fontFamily:"'Bebas Neue'",fontSize:12,letterSpacing:2,cursor:"pointer"}}>{f}</button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"65px 1fr 130px 75px 75px 120px",padding:"7px 0",borderBottom:"2px solid var(--ink)",fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:2,color:"var(--muted)",gap:10}}>
        {["ID","STUDENT","ROUTE","DATE","AMOUNT","ACTION"].map(h=><span key={h}>{h}</span>)}
      </div>
      {visible.map((app,i)=>(
        <div key={app.id} className="fade-up" style={{display:"grid",gridTemplateColumns:"65px 1fr 130px 75px 75px 120px",padding:"13px 0",borderBottom:"1px solid var(--rule)",gap:10,alignItems:"center",background:i%2===0?"transparent":"var(--parchment)",animationDelay:`${i*.04}s`}}>
          <div style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"var(--muted)"}}>{String(app.id).slice(-6)}</div>
          <div style={{fontFamily:"'Instrument Sans'",fontSize:13,fontWeight:600}}>{app.student_name||app.student_email}</div>
          <div style={{fontFamily:"'Instrument Sans'",fontSize:11,color:"var(--muted)"}}>{app.route_name}</div>
          <div style={{fontFamily:"'JetBrains Mono'",fontSize:10}}>{app.applied_at ? new Date(app.applied_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "—"}</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:15,color:"var(--amber)"}}>₹{app.route_fare||"—"}</div>
          <div style={{display:"flex",gap:5,alignItems:"center"}}>
            {app.status==="pending" ? (
              busy[app.id] ? <Spinner/> : (
                <>
                  <Btn variant="success" size="sm" onClick={()=>doApprove(app.id)}>✓ OK</Btn>
                  <Btn variant="danger"  size="sm" onClick={()=>doReject(app.id)}>✕</Btn>
                </>
              )
            ) : <Pill s={app.status}/>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONDUCTOR SCANNER — real API
// ─────────────────────────────────────────────────────────────────────────────
function ConductorScanner() {
  const toast = useToast();
  const [scanning, setScanning] = useState(false);
  const [result,   setResult]   = useState(null);
  const [history,  setHistory]  = useState([]);
  const [manualQR, setManualQR] = useState("");

  const handleScan = async (token) => {
    if (!token) return;
    setScanning(true); setResult(null);
    try {
      const data = await PassService.scanQR(token, "BUS-02", "Tech Park");
      setResult(data);
      if (data.student_name) {
        setHistory(h=>[{student:data.student_name,pass:token.slice(0,24)+"…",result:data.result,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})},...h.slice(0,9)]);
      }
      if (data.result === "valid")   toast.success(`✓ Valid — ${data.student_name}`);
      if (data.result === "expired") toast.warn(`⚠ Expired — ${data.student_name}`);
      if (data.result === "invalid") toast.error("⛔ Invalid QR code");
    } catch (err) {
      toast.error(err.response?.data?.message || "Scan failed.");
    } finally { setScanning(false); }
  };

  const rc={"valid":"var(--green)","expired":"var(--amber)","invalid":"var(--red)"};

  return (
    <div>
      <Tag>QR Verification Terminal</Tag>
      <div style={{fontFamily:"'Bebas Neue'",fontSize:44,letterSpacing:1,marginBottom:32}}>CONDUCTOR <span style={{color:"var(--amber)"}}>SCANNER</span></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,alignItems:"start"}}>
        <div>
          {/* Manual QR input (for testing without camera) */}
          <div style={{marginBottom:20}}>
            <Tag>Paste QR Token (for testing)</Tag>
            <div style={{display:"flex",gap:8}}>
              <input value={manualQR} onChange={e=>setManualQR(e.target.value)} placeholder="Paste QR token here…" style={{flex:1,padding:"10px 13px",border:"1px solid var(--ink)",background:"var(--cream)",fontFamily:"'JetBrains Mono'",fontSize:11,color:"var(--ink)",outline:"none"}}/>
              <Btn onClick={()=>handleScan(manualQR)} disabled={!manualQR||scanning}>{scanning?<Spinner/>:"SCAN"}</Btn>
            </div>
          </div>

          {/* Viewfinder */}
          <div style={{width:"100%",maxWidth:300,aspectRatio:"1/1",border:`3px solid ${scanning?"var(--amber)":"var(--ink)"}`,position:"relative",background:"var(--ink)",overflow:"hidden",marginBottom:18}}>
            {[[0,0],[0,1],[1,0],[1,1]].map(([r,c],i)=>(
              <div key={i} style={{position:"absolute",top:r?"auto":10,bottom:r?10:"auto",left:c?"auto":10,right:c?10:"auto",width:26,height:26,borderTop:!r?"3px solid var(--amber)":"none",borderBottom:r?"3px solid var(--amber)":"none",borderLeft:!c?"3px solid var(--amber)":"none",borderRight:c?"3px solid var(--amber)":"none"}}/>
            ))}
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}>
              {scanning ? <Spinner/> : <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,color:"var(--amber)",letterSpacing:3,opacity:.5}}>USE INPUT ABOVE</div>}
            </div>
          </div>

          {result && !scanning && (
            <div className="stamp" style={{maxWidth:300,padding:20,border:`3px solid ${rc[result.result]}`,background:result.result==="valid"?"var(--bg-valid)":result.result==="expired"?"var(--bg-warn)":"var(--bg-error)"}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:26,letterSpacing:3,color:rc[result.result],marginBottom:6}}>
                {result.result==="valid"?"✓ PASS VALID":result.result==="expired"?"⚠ PASS EXPIRED":"✕ INVALID QR"}
              </div>
              {result.student_name&&(
                <>
                  <div style={{fontFamily:"'DM Serif Display'",fontSize:18}}>{result.student_name}</div>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:"var(--muted)",marginTop:4}}>{result.route} · UNTIL {result.valid_until}</div>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"var(--muted)",marginTop:2,letterSpacing:1}}>{result.pass_number}</div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Scan log */}
        <div>
          <Tag>Today's Scan Log — {history.length} scans</Tag>
          {history.length === 0 ? (
            <div style={{fontFamily:"'Instrument Sans'",fontSize:13,color:"var(--muted)",padding:"20px 0"}}>No scans yet. Paste a QR token to test.</div>
          ) : (
            <div style={{border:"1px solid var(--ink)"}}>
              <div style={{background:"var(--ink)",color:"var(--amber)",display:"grid",gridTemplateColumns:"55px 1fr 80px",padding:"8px 14px",gap:8,fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:2}}>
                {["TIME","STUDENT","RESULT"].map(h=><span key={h}>{h}</span>)}
              </div>
              {history.map((h,i)=>(
                <div key={i} className="fade-up" style={{display:"grid",gridTemplateColumns:"55px 1fr 80px",padding:"11px 14px",gap:8,alignItems:"center",borderBottom:i<history.length-1?"1px solid var(--rule)":"none",background:i%2===0?"transparent":"var(--parchment)",animationDelay:`${i*.04}s`}}>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:"var(--muted)"}}>{h.time}</div>
                  <div style={{fontFamily:"'Instrument Sans'",fontSize:13,fontWeight:500}}>{h.student}</div>
                  <Pill s={h.result}/>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP SHELL — with AuthProvider + ToastProvider
// ─────────────────────────────────────────────────────────────────────────────
const TICKER_TEXT = ["ROUTE A: ON TIME","ROUTE B: 4 MIN DELAY","EXAM WEEK: HIGH DEMAND","ROUTE C: ON TIME","PASS RENEWAL: MARCH DEADLINE"];

function AppShell() {
  const { user, isAuthenticated, logout, role } = useAuth();
  const toast = useToast();
  const [page, setPage] = useState("dashboard");

  const handleLogout = async () => {
    await logout();
    setPage("dashboard");
    toast.info("Signed out.");
  };

  if (!isAuthenticated) return <LoginScreen onSuccess={() => setPage(role==="admin"?"admin":role==="conductor"?"conductor":"dashboard")}/>;

  const NAV = {
    student:   [["DASHBOARD","dashboard"],["APPLY PASS","apply"]],
    admin:     [["DASHBOARD","admin"]],
    conductor: [["SCANNER","conductor"]],
  };
  const navItems = NAV[role] || NAV.student;

  const renderPage = () => {
    if (page==="admin"||role==="admin")    return <AdminDashboard/>;
    if (page==="conductor"||role==="conductor") return <ConductorScanner/>;
    if (page==="apply")                    return <ApplyPage/>;
    return <StudentDashboard/>;
  };

  const ticker = [...TICKER_TEXT,...TICKER_TEXT].join("   ◆   ");

  return (
    <div style={{minHeight:"100vh",background:"var(--cream)",fontFamily:"'Instrument Sans',sans-serif"}}>
      {/* Ticker */}
      <div style={{background:"var(--ink)",color:"var(--amber)",fontFamily:"'JetBrains Mono'",fontSize:10,letterSpacing:2,overflow:"hidden",padding:"5px 0",borderBottom:"2px solid var(--amber)"}}>
        <div style={{display:"flex",animation:"tickerScroll 30s linear infinite",whiteSpace:"nowrap"}}>
          <span style={{paddingRight:60}}>{ticker}</span><span style={{paddingRight:60}}>{ticker}</span>
        </div>
      </div>
      {/* Top nav */}
      <header style={{borderBottom:"1px solid var(--rule)",padding:"0 44px",display:"flex",alignItems:"center",gap:36,background:"var(--cream)",position:"sticky",top:0,zIndex:100}}>
        <div style={{padding:"15px 0",display:"flex",alignItems:"baseline",gap:1}}>
          <span style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:2,color:"var(--ink)"}}>BUSP</span>
          <span style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:2,color:"var(--amber)"}}>ASS</span>
          <span style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:2,color:"var(--ink)"}}>PRO</span>
        </div>
        <div style={{width:1,height:22,background:"var(--rule)"}}/>
        {navItems.map(([label,pg])=>(
          <button key={label} onClick={()=>setPage(pg)} style={{background:"none",border:"none",fontFamily:"'JetBrains Mono'",fontSize:9,letterSpacing:3,color:page===pg?"var(--ink)":"var(--muted)",padding:"20px 0",borderBottom:`2px solid ${page===pg?"var(--amber)":"transparent"}`,transition:"all .18s",cursor:"pointer"}}>{label}</button>
        ))}
        <div style={{flex:1}}/>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'Instrument Sans'",fontSize:13,fontWeight:600}}>{user?.student_profile?.full_name || user?.email}</div>
            <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:2,color:"var(--muted)",textTransform:"uppercase"}}>{role}</div>
          </div>
          <button onClick={handleLogout} style={{padding:"6px 12px",border:"1px solid var(--rule)",background:"none",fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:2,color:"var(--muted)",cursor:"pointer"}}>SIGN OUT</button>
        </div>
      </header>
      <main style={{maxWidth:1200,margin:"0 auto",padding:"40px 44px 80px"}}>{renderPage()}</main>
      <footer style={{borderTop:"3px double var(--ink)",padding:"18px 44px",display:"flex",justifyContent:"space-between"}}>
        <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:2,color:"var(--muted)"}}>BUSPASSPRO · 2026</div>
        <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:2,color:"var(--muted)"}}>DJANGO + REACT · WEBSOCKET · AI</div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <>
      <style>{FONTS}</style>
      <AuthProvider>
        <ToastProvider>
          <AppShell/>
        </ToastProvider>
      </AuthProvider>
    </>
  );
}
