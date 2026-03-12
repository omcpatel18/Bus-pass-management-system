import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   BUSPASSPRO — "TRANSIT EDITORIAL" AESTHETIC
   
   Concept: Indian transit brutalism × high-fashion editorial magazine
   Palette: Warm cream, burnt amber, ink black, signal red — NOT blue/purple
   Type: Bebas Neue (display) + DM Serif Display (editorial) + JetBrains Mono
   Motion: Mechanical reveals, stamp animations, ink-bleed transitions
   Layout: Asymmetric, grid-breaking, overlapping — horizontal top nav
   
   Anti-AI-pattern manifesto:
   ✗ No dark navy sidebar          ✓ Light editorial layout
   ✗ No blue/purple gradients      ✓ Warm amber + cream + ink
   ✗ No rounded card clusters      ✓ Hard-edged ruled columns
   ✗ No Space Grotesk / Inter      ✓ Bebas Neue + DM Serif Display
   ✗ No icon-label nav             ✓ Monospaced all-caps letterpress nav
   ✗ No gradient CTA buttons       ✓ Solid ink blocks, amber text
───────────────────────────────────────────────────────────────────────────── */

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;700&family=Instrument+Sans:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --cream:#F5EFE0; --parchment:#EDE4CC; --amber:#BC7820; --amber-l:#E8A84A;
  --ink:#1A1208; --ink-mid:#3D2E0E; --red:#C0392B; --green:#2D6A4F;
  --muted:#7A6347; --rule:#C8B99A;
  --bg-valid:#EDFAF3; --bg-warn:#FFF8EC; --bg-error:#FFF0EE; --bg-selected:#FFF8EE; --on-dark-dim:#888888;
}
body{background:var(--cream);color:var(--ink);}
@keyframes flipIn{0%{transform:rotateX(-90deg);opacity:0}100%{transform:rotateX(0);opacity:1}}
@keyframes stampDrop{0%{transform:scale(2.2)rotate(-8deg);opacity:0}60%{transform:scale(.95)rotate(2deg);opacity:1}100%{transform:scale(1)rotate(-3deg);opacity:1}}
@keyframes inkBleed{0%{clip-path:inset(0 100% 0 0)}100%{clip-path:inset(0 0% 0 0)}}
@keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
@keyframes scanBar{0%{top:0}100%{top:100%}}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
.stamp{animation:stampDrop .5s cubic-bezier(.23,1,.32,1) both}
.fade-up{animation:fadeUp .4s ease both}
.ink-reveal{animation:inkBleed .6s ease both}
button{cursor:pointer;}
`;

const TICKER = ["ROUTE A: ON TIME","ROUTE B: 4 MIN DELAY","ROUTE C: ON TIME","EXAM WEEK: HIGH DEMAND","NEW STOP: TECH PARK GATE 2","PASS RENEWAL: MARCH DEADLINE","ROUTE D: SUSPENDED"];
const ROUTES = [
  {id:1,name:"Route Alpha",code:"Rα",src:"College Gate",dst:"City Center",     stops:["North Campus","Library Sq","Main Market"],       fare:450,km:12.5,min:35},
  {id:2,name:"Route Beta", code:"Rβ",src:"College Gate",dst:"Railway Station", stops:["Tech Park","Sector 4","Bus Terminal"],            fare:650,km:18.2,min:50},
  {id:3,name:"Route Gamma",code:"Rγ",src:"College Gate",dst:"Airport Road",    stops:["East Campus","Ring Road","IT Hub"],              fare:750,km:22.0,min:65},
];
const PASS={num:"BPP·2024·001234",student:"Aryan Sharma",sid:"CS21B042",dept:"Computer Science — IV Year",route:"Route Alpha",stop:"Library Sq",until:"01 APR 2024",type:"QUARTERLY"};
const BUSES=[
  {num:"BUS-01",route:"Route Alpha",speed:32,stop:"North Campus", eta:"8 MIN"},
  {num:"BUS-02",route:"Route Beta", speed:0, stop:"Tech Park",    eta:"AT STOP"},
  {num:"BUS-03",route:"Route Gamma",speed:28,stop:"Ring Road",    eta:"15 MIN"},
  {num:"BUS-04",route:"Route Alpha",speed:45,stop:"Main Market",  eta:"22 MIN"},
];
const APPS=[
  {id:"A-001",student:"Priya Patel", route:"Route Alpha",status:"PENDING", date:"01 MAR",amt:450},
  {id:"A-002",student:"Rahul Kumar", route:"Route Beta", status:"APPROVED",date:"28 FEB",amt:650},
  {id:"A-003",student:"Sneha Iyer",  route:"Route Gamma",status:"PENDING", date:"02 MAR",amt:750},
  {id:"A-004",student:"Amit Singh",  route:"Route Alpha",status:"REJECTED",date:"25 FEB",amt:450},
  {id:"A-005",student:"Divya Menon", route:"Route Beta", status:"APPROVED",date:"01 MAR",amt:650},
];
const DEMAND=[{h:"6A",v:15},{h:"7A",v:45},{h:"8A",v:89},{h:"9A",v:72},{h:"10A",v:35},{h:"11A",v:22},{h:"12P",v:48},{h:"1P",v:55},{h:"2P",v:30},{h:"3P",v:25},{h:"4P",v:78},{h:"5P",v:92},{h:"6P",v:67},{h:"7P",v:40}];
const ALL_STOPS=["College Gate","North Campus","Library Sq","Main Market","City Center","Tech Park","Sector 4","Bus Terminal","Railway Station","East Campus","Ring Road","IT Hub","Airport Road"];

// ── Atoms ──────────────────────────────────────────────────────────────────
const Pill=({s})=>{
  const m={ACTIVE:{bg:"var(--green)",c:"var(--cream)"},APPROVED:{bg:"var(--green)",c:"var(--cream)"},VALID:{bg:"var(--green)",c:"var(--cream)"},PENDING:{bg:"var(--amber)",c:"var(--ink)"},REJECTED:{bg:"var(--red)",c:"var(--cream)"},EXPIRED:{bg:"var(--muted)",c:"var(--cream)"},INVALID:{bg:"var(--red)",c:"var(--cream)"}};
  const p=m[s]||m.PENDING;
  return <span style={{background:p.bg,color:p.c,fontFamily:"'JetBrains Mono'",fontSize:9,fontWeight:700,letterSpacing:2,padding:"3px 9px",clipPath:"polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"}}>{s}</span>;
};
const Rule=({my=16})=><div style={{height:1,background:"var(--rule)",margin:`${my}px 0`}}/>;
const Tag=({children})=><div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:4,color:"var(--muted)",textTransform:"uppercase",marginBottom:8}}>{children}</div>;
const SelStyle={width:"100%",padding:"10px 13px",border:"1px solid var(--ink)",background:"var(--cream)",fontFamily:"'Instrument Sans'",fontSize:13,color:"var(--ink)",outline:"none",appearance:"none"};
const InpStyle={...{width:"100%",padding:"10px 13px",border:"1px solid var(--ink)",background:"var(--cream)",fontFamily:"'Instrument Sans'",fontSize:13,color:"var(--ink)",outline:"none"}};

// ── QR Canvas ─────────────────────────────────────────────────────────────
function QRCanvas({seed=42,size=96}){
  const ref=useRef();
  useEffect(()=>{
    const c=ref.current;if(!c)return;
    const ctx=c.getContext("2d"),m=17,cell=size/m;
    ctx.fillStyle="#F5EFE0";ctx.fillRect(0,0,size,size);
    for(let r=0;r<m;r++)for(let col=0;col<m;col++){
      const corner=(r<4&&col<4)||(r<4&&col>m-5)||(r>m-5&&col<4);
      const filled=corner?1:(((seed*2654435761+r*1234567+col*7654321)>>>0)%3===0?1:0);
      if(filled){ctx.fillStyle="#1A1208";ctx.fillRect(col*cell+.5,r*cell+.5,cell-1,cell-1);}
    }
    [[0,0],[0,m-4],[m-4,0]].forEach(([row,cl])=>{
      ctx.strokeStyle="#1A1208";ctx.lineWidth=1.5;
      ctx.strokeRect(cl*cell+1,row*cell+1,4*cell-2,4*cell-2);
      ctx.fillStyle="#1A1208";ctx.fillRect(cl*cell+cell+1,row*cell+cell+1,2*cell-2,2*cell-2);
    });
  },[seed,size]);
  return <canvas ref={ref} width={size} height={size} style={{imageRendering:"pixelated"}}/>;
}

// ── Ticker ────────────────────────────────────────────────────────────────
function Ticker(){
  const t=[...TICKER,...TICKER].join("   ◆   ");
  return(
    <div style={{background:"var(--ink)",color:"var(--amber)",fontFamily:"'JetBrains Mono'",fontSize:10,letterSpacing:2,overflow:"hidden",padding:"5px 0",borderBottom:"2px solid var(--amber)"}}>
      <div style={{display:"flex",animation:"tickerScroll 30s linear infinite",whiteSpace:"nowrap"}}>
        <span style={{paddingRight:60}}>{t}</span><span style={{paddingRight:60}}>{t}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function StudentDashboard(){
  const [buses,setBuses]=useState(BUSES);
  const [aiFrom,setAiFrom]=useState("");const [aiTo,setAiTo]=useState("");
  const [aiRes,setAiRes]=useState(null);const [aiLoad,setAiLoad]=useState(false);

  useEffect(()=>{
    const t=setInterval(()=>setBuses(b=>b.map(bus=>({...bus,speed:Math.max(0,bus.speed+(Math.random()-.5)*4)}))),2500);
    return()=>clearInterval(t);
  },[]);

  const optimize=async()=>{
    if(!aiFrom||!aiTo)return;
    setAiLoad(true);setAiRes(null);
    await new Promise(r=>setTimeout(r,1100));
    const i1=ALL_STOPS.indexOf(aiFrom),i2=ALL_STOPS.indexOf(aiTo);
    const path=ALL_STOPS.slice(Math.min(i1,i2),Math.max(i1,i2)+1);
    setAiRes({path,km:(path.length*3.1).toFixed(1),fare:path.length*90,min:path.length*9,demand:["LOW","MEDIUM","HIGH"][Math.floor(Math.random()*3)]});
    setAiLoad(false);
  };

  return(
    <div className="fade-up">
      {/* ── Hero ── */}
      <div style={{position:"relative",overflow:"hidden",borderBottom:"3px double var(--ink)",paddingBottom:28,marginBottom:32}}>
        <div style={{position:"absolute",right:-16,top:-12,fontFamily:"'Bebas Neue'",fontSize:170,color:"var(--parchment)",lineHeight:.85,userSelect:"none",letterSpacing:-4,pointerEvents:"none"}}>Rα</div>
        <Tag>Student Portal · Session 2024</Tag>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:54,letterSpacing:1,lineHeight:.92,color:"var(--ink)"}}>
          GOOD MORNING,<br/><span style={{color:"var(--amber)"}}>ARYAN.</span>
        </div>
        <div style={{marginTop:10,fontFamily:"'Instrument Sans'",fontSize:13,color:"var(--muted)"}}>
          Tuesday, 03 March 2024 &nbsp;·&nbsp; Your pass is active for <strong style={{color:"var(--ink)"}}>42 more days</strong>
        </div>
        <div style={{display:"flex",gap:0,marginTop:22,borderTop:"1px solid var(--rule)",paddingTop:18}}>
          {[["PASS STATUS","ACTIVE ✓","var(--green)"],["DAYS LEFT","42","var(--ink)"],["RIDES / MONTH","24","var(--ink)"],["NEXT BUS","8 MIN →","var(--amber)"]].map(([k,v,c],i)=>(
            <div key={i} style={{flex:1,paddingRight:20,marginRight:20,borderRight:i<3?"1px solid var(--rule)":"none"}}>
              <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:3,color:"var(--muted)",marginBottom:4}}>{k}</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:28,color:c,letterSpacing:1}}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two col layout ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:48,alignItems:"start"}}>
        {/* LEFT */}
        <div>
          {/* Digital Pass */}
          <Tag>Digital Pass</Tag>
          <div style={{background:"var(--ink)",color:"var(--cream)",padding:28,position:"relative",overflow:"hidden",marginBottom:36}}>
            <div style={{position:"absolute",left:0,top:0,bottom:0,width:7,background:"repeating-linear-gradient(180deg,var(--ink) 0,var(--ink) 8px,var(--cream) 8px,var(--cream) 14px)",opacity:.25}}/>
            <div style={{position:"absolute",right:0,top:0,bottom:0,width:7,background:"repeating-linear-gradient(180deg,var(--ink) 0,var(--ink) 8px,var(--cream) 8px,var(--cream) 14px)",opacity:.25}}/>
            <div className="stamp" style={{position:"absolute",top:14,right:22,border:"3px solid var(--green)",color:"var(--green)",fontFamily:"'Bebas Neue'",fontSize:16,letterSpacing:3,padding:"3px 10px",transform:"rotate(-3deg)"}}>VALID</div>
            <div style={{paddingLeft:14}}>
              <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:3,color:"var(--amber)",marginBottom:10}}>BUSPASSPRO · BUS PASS MANAGEMENT</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontFamily:"'DM Serif Display'",fontSize:26,lineHeight:1.1}}>{PASS.student}</div>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:"var(--amber-l)",marginTop:4}}>{PASS.sid}</div>
                  <div style={{fontFamily:"'Instrument Sans'",fontSize:12,color:"var(--on-dark-dim)",marginTop:2}}>{PASS.dept}</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{background:"var(--cream)",padding:5,display:"inline-block"}}><QRCanvas seed={1234} size={80}/></div>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,color:"var(--on-dark-dim)",marginTop:4}}>SCAN TO VERIFY</div>
                </div>
              </div>
              <Rule my={14}/>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                {[["ROUTE",PASS.route],["BOARDING",PASS.stop],["VALID UNTIL",PASS.until],["TYPE",PASS.type]].map(([k,v])=>(
                  <div key={k}>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:2,color:"var(--on-dark-dim)",marginBottom:3}}>{k}</div>
                    <div style={{fontFamily:"'Instrument Sans'",fontSize:12,fontWeight:600}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:14,fontFamily:"'JetBrains Mono'",fontSize:9,color:"var(--on-dark-dim)",letterSpacing:1}}>#{PASS.num}</div>
            </div>
          </div>

          {/* Live Bus Board */}
          <Tag>Live Bus Board</Tag>
          <div style={{border:"1px solid var(--ink)",marginBottom:32}}>
            <div style={{background:"var(--ink)",color:"var(--amber)",fontFamily:"'Bebas Neue'",fontSize:12,letterSpacing:3,display:"grid",gridTemplateColumns:"80px 1fr 110px 72px 80px",padding:"8px 16px",gap:8}}>
              {["BUS","CURRENT STOP","ROUTE","SPEED","ETA"].map(h=><span key={h}>{h}</span>)}
            </div>
            {buses.map((bus,i)=>(
              <div key={bus.num} style={{display:"grid",gridTemplateColumns:"80px 1fr 110px 72px 80px",padding:"12px 16px",gap:8,alignItems:"center",borderBottom:i<buses.length-1?"1px solid var(--rule)":"none",background:i%2===0?"transparent":"var(--parchment)"}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:15,letterSpacing:1,color:"var(--amber)"}}>{bus.num}</div>
                <div>
                  <div style={{fontFamily:"'Instrument Sans'",fontSize:13,fontWeight:500}}>{bus.stop}</div>
                  <div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:bus.speed>0?"var(--green)":"var(--amber)",animation:"pulseDot 1.5s infinite"}}/>
                    <span style={{fontFamily:"'JetBrains Mono'",fontSize:8,color:"var(--muted)",letterSpacing:1}}>{bus.speed>0?"MOVING":"STOPPED"}</span>
                  </div>
                </div>
                <div style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:"var(--muted)"}}>{bus.route}</div>
                <div style={{fontFamily:"'JetBrains Mono'",fontSize:11}}>{Math.round(bus.speed)} km/h</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:17,letterSpacing:1,color:bus.eta==="AT STOP"?"var(--green)":"var(--ink)"}}>{bus.eta}</div>
              </div>
            ))}
            <div style={{padding:"7px 16px",background:"var(--parchment)",fontFamily:"'JetBrains Mono'",fontSize:8,color:"var(--muted)",letterSpacing:2}}>◆ LIVE · WEBSOCKET · UPDATES EVERY 2.5s</div>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          {/* AI Planner */}
          <Tag>AI Route Optimizer</Tag>
          <div style={{border:"2px solid var(--ink)",padding:24,marginBottom:32,position:"relative"}}>
            <div style={{position:"absolute",top:-2,right:-2,width:18,height:18,background:"var(--amber)"}}/>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,marginBottom:4,lineHeight:1.1}}>Find your<br/><em>optimal route.</em></div>
            <div style={{fontFamily:"'Instrument Sans'",fontSize:12,color:"var(--muted)",marginBottom:20}}>Powered by NetworkX graph algorithm</div>
            {[["FROM",aiFrom,setAiFrom],["TO",aiTo,setAiTo]].map(([lbl,val,set])=>(
              <div key={lbl} style={{marginBottom:12}}>
                <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:3,color:"var(--muted)",marginBottom:6}}>{lbl}</div>
                <select value={val} onChange={e=>set(e.target.value)} style={SelStyle}>
                  <option value="">Select stop…</option>
                  {ALL_STOPS.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ))}
            <button onClick={optimize} disabled={aiLoad||!aiFrom||!aiTo} style={{width:"100%",padding:"11px 0",background:aiLoad?"var(--muted)":"var(--ink)",color:"var(--amber)",border:"none",fontFamily:"'Bebas Neue'",fontSize:15,letterSpacing:3,transition:"background .2s",opacity:(!aiFrom||!aiTo)?.5:1}}>
              {aiLoad?"COMPUTING…":"FIND OPTIMAL ROUTE →"}
            </button>
            {aiRes&&(
              <div className="fade-up" style={{marginTop:18,borderTop:"1px solid var(--rule)",paddingTop:18}}>
                <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:14}}>
                  {aiRes.path.map((s,i)=>(
                    <span key={i} style={{display:"flex",alignItems:"center",gap:3}}>
                      <span style={{fontFamily:"'Instrument Sans'",fontSize:10,fontWeight:600,background:i===0?"var(--green)":i===aiRes.path.length-1?"var(--amber)":"var(--ink)",color:"var(--cream)",padding:"2px 7px"}}>{s}</span>
                      {i<aiRes.path.length-1&&<span style={{fontFamily:"'Bebas Neue'",fontSize:13,color:"var(--muted)"}}>›</span>}
                    </span>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",border:"1px solid var(--ink)"}}>
                  {[["DIST",`${aiRes.km}km`],["FARE",`₹${aiRes.fare}`],["TIME",`${aiRes.min}m`]].map(([k,v],i)=>(
                    <div key={k} style={{padding:"10px 8px",borderRight:i<2?"1px solid var(--ink)":"none",textAlign:"center"}}>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:7,letterSpacing:2,color:"var(--muted)"}}>{k}</div>
                      <div style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:1,color:"var(--amber)"}}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:8,padding:"8px 10px",border:`1px solid ${aiRes.demand==="HIGH"?"var(--red)":aiRes.demand==="MEDIUM"?"var(--amber)":"var(--green)"}`,fontFamily:"'Instrument Sans'",fontSize:11,color:aiRes.demand==="HIGH"?"var(--red)":aiRes.demand==="MEDIUM"?"var(--ink-mid)":"var(--green)"}}>
                  {aiRes.demand==="HIGH"?"⚠ High demand — travel ±30 min to avoid crowds":aiRes.demand==="MEDIUM"?"◆ Moderate demand — seats available":"✓ Low demand — comfortable journey expected"}
                </div>
              </div>
            )}
          </div>

          {/* Demand Chart */}
          <Tag>Today's Demand Forecast — Route Alpha</Tag>
          <div style={{border:"1px solid var(--ink)",padding:16}}>
            <div style={{display:"flex",alignItems:"flex-end",gap:3,height:88}}>
              {DEMAND.map((d,i)=>(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{width:"100%",height:`${(d.v/92)*76}px`,background:d.v>70?"var(--red)":d.v>40?"var(--amber-l)":"var(--green)",transition:"height .5s"}}/>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:6,color:"var(--muted)",transform:"rotate(-45deg)",transformOrigin:"top left",whiteSpace:"nowrap",marginTop:2}}>{d.h}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:18,display:"flex",gap:14}}>
              {[["var(--red)","HIGH"],["var(--amber-l)","MEDIUM"],["var(--green)","LOW"]].map(([c,l])=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:9,height:9,background:c}}/>
                  <span style={{fontFamily:"'JetBrains Mono'",fontSize:8,color:"var(--muted)",letterSpacing:1}}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLY PAGE
// ─────────────────────────────────────────────────────────────────────────────
function ApplyPage(){
  const [step,setStep]=useState(1);
  const [sel,setSel]=useState({route:null,boarding:"",duration:"monthly"});
  const [done,setDone]=useState(false);
  const DURS=[{id:"monthly",label:"MONTHLY",mo:1,disc:0},{id:"quarterly",label:"QUARTERLY",mo:3,disc:10},{id:"annual",label:"ANNUAL",mo:12,disc:20}];
  const base=sel.route?ROUTES.find(r=>r.id===sel.route)?.fare||0:0;
  const dur=DURS.find(d=>d.id===sel.duration);
  const total=Math.round(base*dur.mo*(1-dur.disc/100));
  if(done)return(
    <div className="fade-up" style={{maxWidth:480,margin:"80px auto",textAlign:"center"}}>
      <div className="stamp" style={{display:"inline-block",border:"4px solid var(--green)",padding:"10px 28px",fontFamily:"'Bebas Neue'",fontSize:52,color:"var(--green)",letterSpacing:4,transform:"rotate(-4deg)",marginBottom:32}}>SUBMITTED</div>
      <div style={{fontFamily:"'DM Serif Display'",fontSize:28,marginBottom:10}}>Application Received!</div>
      <div style={{fontFamily:"'Instrument Sans'",color:"var(--muted)",marginBottom:24,lineHeight:1.6}}>Your application is under review. Admin will approve within 24 hours and you'll receive an email confirmation.</div>
      <div style={{fontFamily:"'JetBrains Mono'",fontSize:12,background:"var(--ink)",color:"var(--amber)",padding:"10px 24px",display:"inline-block",letterSpacing:2}}>APP ID: A-{Math.floor(Math.random()*9000+1000)}</div>
      <div style={{marginTop:32}}><button onClick={()=>{setDone(false);setStep(1);setSel({route:null,boarding:"",duration:"monthly"});}} style={{background:"none",border:"1px solid var(--ink)",padding:"8px 20px",fontFamily:"'Instrument Sans'",fontSize:13,color:"var(--ink)"}}>Apply for another →</button></div>
    </div>
  );
  return(
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
              {ROUTES.map(route=>(
                <div key={route.id} onClick={()=>setSel(s=>({...s,route:route.id}))} style={{border:`2px solid ${sel.route===route.id?"var(--amber)":"var(--rule)"}`,padding:16,marginBottom:10,cursor:"pointer",background:sel.route===route.id?"var(--bg-selected)":"transparent",transition:"all .18s"}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <div><div style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:1}}>{route.name}</div><div style={{fontFamily:"'Instrument Sans'",fontSize:12,color:"var(--muted)",marginTop:2}}>{route.src} → {route.dst} · {route.stops.length+2} stops · {route.km}km</div></div>
                    <div style={{textAlign:"right"}}><div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:"var(--amber)"}}>₹{route.fare}</div><div style={{fontFamily:"'JetBrains Mono'",fontSize:8,color:"var(--muted)"}}>PER MONTH</div></div>
                  </div>
                  {sel.route===route.id&&(
                    <div style={{marginTop:12}}>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:2,color:"var(--muted)",marginBottom:6}}>SELECT BOARDING STOP</div>
                      <select value={sel.boarding} onChange={e=>setSel(s=>({...s,boarding:e.target.value}))} style={SelStyle} onClick={e=>e.stopPropagation()}>
                        <option value="">Choose stop…</option>
                        {[route.src,...route.stops,route.dst].map(st=><option key={st} value={st}>{st}</option>)}
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
                {[["Route",ROUTES.find(r=>r.id===sel.route)?.name||"—"],["Duration",dur.label],["Base Fare",`₹${base}`],["Discount",`${dur.disc}%`]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",fontFamily:"'Instrument Sans'",fontSize:13,marginBottom:8}}><span style={{color:"var(--muted)"}}>{k}</span><span>{v}</span></div>
                ))}
                <Rule/>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:"'Bebas Neue'",fontSize:18,letterSpacing:1}}>TOTAL</span><span style={{fontFamily:"'Bebas Neue'",fontSize:28,color:"var(--amber)"}}>₹{total}</span></div>
              </div>
              <div style={{border:"1px dashed var(--rule)",padding:22,textAlign:"center"}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:4,color:"var(--amber)",marginBottom:4}}>RAZORPAY</div>
                <div style={{fontFamily:"'Instrument Sans'",fontSize:12,color:"var(--muted)"}}>UPI · Cards · Netbanking · Wallets</div>
                <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,color:"var(--muted)",marginTop:8,letterSpacing:1}}>256-BIT SSL ENCRYPTED</div>
              </div>
            </div>
          )}
          <div style={{display:"flex",gap:10,marginTop:22}}>
            {step>1&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:"11px 0",background:"none",border:"1px solid var(--ink)",fontFamily:"'Bebas Neue'",fontSize:14,letterSpacing:2,color:"var(--ink)"}}>← BACK</button>}
            <button onClick={()=>step<3?setStep(s=>s+1):setDone(true)} disabled={step===1&&(!sel.route||!sel.boarding)} style={{flex:2,padding:"11px 0",background:"var(--ink)",color:"var(--amber)",border:"none",fontFamily:"'Bebas Neue'",fontSize:14,letterSpacing:2,opacity:(step===1&&(!sel.route||!sel.boarding))?.4:1,transition:"opacity .2s"}}>
              {step===3?"CONFIRM & PAY →":"CONTINUE →"}
            </button>
          </div>
        </div>
        {/* Summary */}
        <div style={{border:"1px solid var(--rule)",padding:20,position:"sticky",top:104}}>
          <Tag>Your Selection</Tag>
          {sel.route?(
            <>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:1,marginBottom:10}}>{ROUTES.find(r=>r.id===sel.route)?.name}</div>
              {sel.boarding&&<div style={{fontFamily:"'Instrument Sans'",fontSize:12,color:"var(--muted)",marginBottom:8}}>Board at: <strong style={{color:"var(--ink)"}}>{sel.boarding}</strong></div>}
              <Rule/>
              <div style={{fontFamily:"'Instrument Sans'",fontSize:12,color:"var(--muted)",marginBottom:4}}>Duration: <strong style={{color:"var(--ink)"}}>{dur.label}</strong></div>
              {dur.disc>0&&<div style={{fontFamily:"'JetBrains Mono'",fontSize:8,color:"var(--green)",letterSpacing:1,marginBottom:8}}>{dur.disc}% DISCOUNT APPLIED</div>}
              <Rule/>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:34,color:"var(--amber)",letterSpacing:1}}>₹{total}</div>
            </>
          ):<div style={{fontFamily:"'Instrument Sans'",fontSize:12,color:"var(--muted)"}}>Select a route to see pricing</div>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function AdminDashboard(){
  const [apps,setApps]=useState(APPS);
  const [filter,setFilter]=useState("ALL");
  const approve=id=>setApps(a=>a.map(x=>x.id===id?{...x,status:"APPROVED"}:x));
  const reject=id=>setApps(a=>a.map(x=>x.id===id?{...x,status:"REJECTED"}:x));
  const visible=filter==="ALL"?apps:apps.filter(a=>a.status===filter);
  return(
    <div>
      <Tag>Admin Control Panel</Tag>
      <div style={{fontFamily:"'Bebas Neue'",fontSize:44,letterSpacing:1,marginBottom:32}}>OPERATIONS <span style={{color:"var(--amber)"}}>DASHBOARD</span></div>
      {/* Stats strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderTop:"3px solid var(--ink)",borderBottom:"1px solid var(--rule)",marginBottom:40}}>
        {[["TOTAL APPS",apps.length,"var(--ink)"],["PENDING",apps.filter(a=>a.status==="PENDING").length,"var(--amber)"],["APPROVED",apps.filter(a=>a.status==="APPROVED").length,"var(--green)"],["REVENUE TODAY","₹4,250","var(--amber)"]].map(([k,v,c],i)=>(
          <div key={k} style={{padding:"18px 22px",borderRight:i<3?"1px solid var(--rule)":"none"}}>
            <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:3,color:"var(--muted)",marginBottom:4}}>{k}</div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:40,color:c,letterSpacing:1,lineHeight:1}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:40,alignItems:"start"}}>
        {/* Table */}
        <div>
          <div style={{display:"flex",gap:0,marginBottom:14,borderBottom:"1px solid var(--ink)"}}>
            {["ALL","PENDING","APPROVED","REJECTED"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{padding:"7px 18px",border:"none",background:filter===f?"var(--ink)":"transparent",color:filter===f?"var(--amber)":"var(--muted)",fontFamily:"'Bebas Neue'",fontSize:12,letterSpacing:2}}>
                {f}
              </button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"65px 1fr 120px 75px 75px 110px",padding:"7px 0",borderBottom:"2px solid var(--ink)",fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:2,color:"var(--muted)",gap:10}}>
            {["ID","STUDENT","ROUTE","DATE","AMT","ACTION"].map(h=><span key={h}>{h}</span>)}
          </div>
          {visible.map((app,i)=>(
            <div key={app.id} className="fade-up" style={{display:"grid",gridTemplateColumns:"65px 1fr 120px 75px 75px 110px",padding:"13px 0",borderBottom:"1px solid var(--rule)",gap:10,alignItems:"center",background:i%2===0?"transparent":"var(--parchment)",animationDelay:`${i*.04}s`}}>
              <div style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"var(--muted)"}}>{app.id}</div>
              <div style={{fontFamily:"'Instrument Sans'",fontSize:13,fontWeight:600}}>{app.student}</div>
              <div style={{fontFamily:"'Instrument Sans'",fontSize:11,color:"var(--muted)"}}>{app.route}</div>
              <div style={{fontFamily:"'JetBrains Mono'",fontSize:10}}>{app.date}</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:15,color:"var(--amber)"}}>₹{app.amt}</div>
              <div style={{display:"flex",gap:5}}>
                {app.status==="PENDING"?(
                  <>
                    <button onClick={()=>approve(app.id)} style={{padding:"4px 8px",background:"var(--green)",border:"none",color:"var(--cream)",fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:1}}>✓ OK</button>
                    <button onClick={()=>reject(app.id)} style={{padding:"4px 8px",background:"none",border:"1px solid var(--red)",color:"var(--red)",fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:1}}>✕</button>
                  </>
                ):<Pill s={app.status}/>}
              </div>
            </div>
          ))}
        </div>
        {/* Right col */}
        <div>
          <Tag>Hourly Demand — Route Alpha</Tag>
          <div style={{border:"1px solid var(--ink)",padding:16,marginBottom:24}}>
            <div style={{display:"flex",alignItems:"flex-end",gap:2,height:96}}>
              {DEMAND.map((d,i)=>(
                <div key={i} style={{flex:1}}>
                  <div style={{width:"100%",height:`${(d.v/92)*84}px`,background:d.v>70?"var(--red)":d.v>40?"var(--amber-l)":"var(--green)",transition:"height .5s"}}/>
                </div>
              ))}
            </div>
            <div style={{marginTop:8,fontFamily:"'JetBrains Mono'",fontSize:8,color:"var(--muted)",textAlign:"center",letterSpacing:2}}>PEAK: 8AM & 5PM</div>
          </div>
          <Tag>Active Routes</Tag>
          {ROUTES.map(r=>(
            <div key={r.id} style={{borderTop:"1px solid var(--rule)",padding:"13px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:16,letterSpacing:1}}>{r.name}</div>
                <div style={{fontFamily:"'Instrument Sans'",fontSize:11,color:"var(--muted)"}}>{r.src} → {r.dst}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:"var(--amber)"}}>₹{r.fare}</div>
                <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,color:"var(--green)",letterSpacing:1}}>ACTIVE</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONDUCTOR SCANNER
// ─────────────────────────────────────────────────────────────────────────────
function ConductorScanner(){
  const [scanning,setScanning]=useState(false);
  const [result,setResult]=useState(null);
  const [history,setHistory]=useState([
    {pass:"BPP·2024·001234",student:"Aryan Sharma",result:"VALID",  time:"08:42"},
    {pass:"BPP·2024·000891",student:"Priya Patel", result:"EXPIRED",time:"08:40"},
    {pass:"BPP·2024·001102",student:"Rahul Kumar", result:"VALID",  time:"08:38"},
  ]);
  const scan=async()=>{
    setScanning(true);setResult(null);
    await new Promise(r=>setTimeout(r,1600));
    const outcomes=[
      {result:"VALID",  student:"Aryan Sharma",pass:"BPP·2024·001234",route:"Route Alpha",until:"01 APR 2024"},
      {result:"EXPIRED",student:"Demo Student", pass:"BPP·2024·000123",route:"Route Beta",  until:"28 FEB 2024"},
      {result:"INVALID",student:null},
    ];
    const o=outcomes[Math.floor(Math.random()*outcomes.length)];
    setResult(o);
    if(o.student)setHistory(h=>[{pass:o.pass,student:o.student,result:o.result,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})},...h.slice(0,9)]);
    setScanning(false);
  };
  const rc={"VALID":"var(--green)","EXPIRED":"var(--amber)","INVALID":"var(--red)"};
  return(
    <div>
      <Tag>QR Verification Terminal</Tag>
      <div style={{fontFamily:"'Bebas Neue'",fontSize:44,letterSpacing:1,marginBottom:32}}>CONDUCTOR <span style={{color:"var(--amber)"}}>SCANNER</span></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,alignItems:"start"}}>
        {/* Scanner */}
        <div>
          <div style={{width:"100%",maxWidth:300,aspectRatio:"1/1",border:`3px solid ${scanning?"var(--amber)":"var(--ink)"}`,position:"relative",background:"var(--ink)",overflow:"hidden",marginBottom:18,transition:"border-color .3s"}}>
            {scanning&&<div style={{position:"absolute",left:0,right:0,height:2,background:"var(--amber)",animation:"scanBar 1.2s linear infinite",boxShadow:"0 0 10px var(--amber)"}}/>}
            {[[0,0],[0,1],[1,0],[1,1]].map(([r,c],i)=>(
              <div key={i} style={{position:"absolute",top:r?"auto":10,bottom:r?10:"auto",left:c?"auto":10,right:c?10:"auto",width:26,height:26,borderTop:!r?"3px solid var(--amber)":"none",borderBottom:r?"3px solid var(--amber)":"none",borderLeft:!c?"3px solid var(--amber)":"none",borderRight:c?"3px solid var(--amber)":"none"}}/>
            ))}
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}>
              {scanning?(
                <>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:18,letterSpacing:4,color:"var(--amber)"}}>SCANNING…</div>
                  <div style={{display:"flex",gap:6}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,background:"var(--amber)",borderRadius:"50%",animation:`pulseDot 1s ${i*.2}s infinite`}}/>)}</div>
                </>
              ):(
                <>
                  <div style={{opacity:.3}}><QRCanvas seed={999} size={72}/></div>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,color:"var(--amber)",letterSpacing:3,opacity:.5}}>POINT AT QR CODE</div>
                </>
              )}
            </div>
          </div>
          <button onClick={scan} disabled={scanning} style={{width:"100%",maxWidth:300,padding:"13px 0",background:scanning?"var(--muted)":"var(--ink)",color:"var(--amber)",border:"none",fontFamily:"'Bebas Neue'",fontSize:17,letterSpacing:4,transition:"background .2s"}}>
            {scanning?"READING CODE…":"SCAN QR CODE"}
          </button>
          {result&&!scanning&&(
            <div className="stamp" style={{marginTop:18,maxWidth:300,padding:20,border:`3px solid ${rc[result.result]}`,background:result.result==="VALID"?"var(--bg-valid)":result.result==="EXPIRED"?"var(--bg-warn)":"var(--bg-error)"}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:3,color:rc[result.result],marginBottom:6}}>{result.result==="VALID"?"✓ PASS VALID":result.result==="EXPIRED"?"⚠ PASS EXPIRED":"✕ INVALID QR"}</div>
              {result.student&&(
                <>
                  <div style={{fontFamily:"'DM Serif Display'",fontSize:18}}>{result.student}</div>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:"var(--muted)",marginTop:4}}>{result.route} · VALID UNTIL {result.until}</div>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"var(--muted)",marginTop:2,letterSpacing:1}}>{result.pass}</div>
                </>
              )}
            </div>
          )}
        </div>
        {/* Log */}
        <div>
          <Tag>Today's Scan Log — {history.length} scans</Tag>
          <div style={{border:"1px solid var(--ink)"}}>
            <div style={{background:"var(--ink)",color:"var(--amber)",display:"grid",gridTemplateColumns:"55px 1fr 80px",padding:"8px 14px",gap:8,fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:2}}>
              {["TIME","STUDENT / PASS","RESULT"].map(h=><span key={h}>{h}</span>)}
            </div>
            {history.map((h,i)=>(
              <div key={i} className="fade-up" style={{display:"grid",gridTemplateColumns:"55px 1fr 80px",padding:"11px 14px",gap:8,alignItems:"center",borderBottom:i<history.length-1?"1px solid var(--rule)":"none",background:i%2===0?"transparent":"var(--parchment)",animationDelay:`${i*.04}s`}}>
                <div style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:"var(--muted)"}}>{h.time}</div>
                <div>
                  <div style={{fontFamily:"'Instrument Sans'",fontSize:13,fontWeight:500}}>{h.student}</div>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,color:"var(--muted)"}}>{h.pass}</div>
                </div>
                <Pill s={h.result}/>
              </div>
            ))}
          </div>
          <div style={{marginTop:24,border:"1px solid var(--rule)",padding:16}}>
            <Tag>This Bus</Tag>
            {[["BUS NUMBER","BUS-02"],["ROUTE","Route Beta"],["CURRENT STOP","Tech Park"],["DRIVER","Ramesh Kumar"],["TODAY'S SCANS",history.length.toString()]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--rule)"}}>
                <span style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:1,color:"var(--muted)"}}>{k}</span>
                <span style={{fontFamily:"'Instrument Sans'",fontSize:13,fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function LoginScreen({onLogin}){
  const [role,setRole]=useState("student");
  const [email,setEmail]=useState("");const [pw,setPw]=useState("");
  return(
    <div style={{minHeight:"100vh",background:"var(--cream)",display:"flex"}}>
      {/* Left editorial hero */}
      <div style={{width:"55%",position:"relative",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:56,overflow:"hidden"}}>
        {/* Background image */}
        <img src="/images/img1.jpg" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center"}}/>
        {/* Dark overlay */}
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
          <div style={{display:"flex",gap:24}}>
            {[["3","ROUTES"],["10K+","RIDERS"],["99%","UPTIME"]].map(([n,l])=>(
              <div key={l}><div style={{fontFamily:"'Bebas Neue'",fontSize:32,color:"var(--amber)",letterSpacing:1}}>{n}</div><div style={{fontFamily:"'JetBrains Mono'",fontSize:8,color:"var(--on-dark-dim)",letterSpacing:3}}>{l}</div></div>
            ))}
          </div>
        </div>
      </div>
      {/* Right form */}
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"56px 48px"}}>
        <div style={{maxWidth:340}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:13,letterSpacing:5,color:"var(--muted)",marginBottom:6}}>SIGN IN</div>
          <div style={{fontFamily:"'DM Serif Display'",fontSize:32,marginBottom:30,lineHeight:1.1}}>Welcome<br/>back.</div>
          {/* Role tabs */}
          <div style={{marginBottom:22}}>
            <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:3,color:"var(--muted)",marginBottom:8}}>PORTAL TYPE</div>
            <div style={{display:"flex",border:"1px solid var(--ink)"}}>
              {[["student","STUDENT 🎓"],["admin","ADMIN ⚙"],["conductor","CONDUCTOR 🔍"]].map(([r,l])=>(
                <button key={r} onClick={()=>setRole(r)} style={{flex:1,padding:"9px 0",background:role===r?"var(--ink)":"transparent",color:role===r?"var(--amber)":"var(--muted)",border:"none",borderRight:r!=="conductor"?"1px solid var(--ink)":"none",fontFamily:"'JetBrains Mono'",fontSize:7,letterSpacing:1,transition:"all .18s"}}>{l}</button>
              ))}
            </div>
          </div>
          {[["EMAIL ADDRESS","email",email,setEmail,"student@college.edu"],["PASSWORD","password",pw,setPw,"••••••••"]].map(([label,type,val,setter,ph])=>(
            <div key={type} style={{marginBottom:14}}>
              <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:3,color:"var(--muted)",marginBottom:7}}>{label}</div>
              <input type={type} value={val} onChange={e=>setter(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onLogin(role)} placeholder={ph} style={InpStyle}/>
            </div>
          ))}
          <button onClick={()=>onLogin(role)} style={{width:"100%",padding:"13px 0",marginTop:8,background:"var(--ink)",color:"var(--amber)",border:"none",fontFamily:"'Bebas Neue'",fontSize:18,letterSpacing:4}}>ENTER PORTAL →</button>
          <div style={{marginTop:18,fontFamily:"'Instrument Sans'",fontSize:11,color:"var(--muted)",textAlign:"center"}}>Demo mode · any credentials work</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP SHELL
// ─────────────────────────────────────────────────────────────────────────────
const NAV={
  student:[["DASHBOARD","dashboard"],["APPLY PASS","apply"]],
  admin:[["DASHBOARD","admin"],["APPLICATIONS","admin"],["ROUTES","admin"]],
  conductor:[["SCANNER","conductor"]],
};
export default function App(){
  const [loggedIn,setLoggedIn]=useState(false);
  const [role,setRole]=useState("student");
  const [page,setPage]=useState("dashboard");
  const handleLogin=r=>{setRole(r);setLoggedIn(true);setPage(r==="admin"?"admin":r==="conductor"?"conductor":"dashboard");};
  if(!loggedIn)return(<><style>{FONTS}</style><LoginScreen onLogin={handleLogin}/></>);
  const navItems=NAV[role]||NAV.student;
  const renderPage=()=>{
    if(page==="admin")return<AdminDashboard/>;
    if(page==="conductor")return<ConductorScanner/>;
    if(page==="apply")return<ApplyPage/>;
    return<StudentDashboard/>;
  };
  return(
    <>
      <style>{FONTS}</style>
      <div style={{minHeight:"100vh",background:"var(--cream)",fontFamily:"'Instrument Sans',sans-serif"}}>
        <Ticker/>
        {/* Top nav */}
        <header style={{borderBottom:"1px solid var(--rule)",padding:"0 44px",display:"flex",alignItems:"center",gap:36,background:"var(--cream)",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(8px)"}}>
          <div style={{padding:"15px 0",display:"flex",alignItems:"baseline",gap:1}}>
            <span style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:2,color:"var(--ink)"}}>BUSP</span>
            <span style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:2,color:"var(--amber)"}}>ASS</span>
            <span style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:2,color:"var(--ink)"}}>PRO</span>
          </div>
          <div style={{width:1,height:22,background:"var(--rule)"}}/>
          {navItems.map(([label,pg])=>(
            <button key={label} onClick={()=>setPage(pg)} style={{background:"none",border:"none",fontFamily:"'JetBrains Mono'",fontSize:9,letterSpacing:3,color:page===pg?"var(--ink)":"var(--muted)",padding:"20px 0",borderBottom:`2px solid ${page===pg?"var(--amber)":"transparent"}`,transition:"all .18s"}}>
              {label}
            </button>
          ))}
          <div style={{flex:1}}/>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'Instrument Sans'",fontSize:13,fontWeight:600}}>{role==="student"?"Aryan Sharma":role==="admin"?"Administrator":"Conductor"}</div>
              <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:2,color:"var(--muted)",textTransform:"uppercase"}}>{role}</div>
            </div>
            <button onClick={()=>{setLoggedIn(false);setPage("dashboard");}} style={{padding:"6px 12px",border:"1px solid var(--rule)",background:"none",fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:2,color:"var(--muted)"}}>SIGN OUT</button>
          </div>
        </header>
        <main style={{maxWidth:1200,margin:"0 auto",padding:"40px 44px 80px"}}>{renderPage()}</main>
        <footer style={{borderTop:"3px double var(--ink)",padding:"18px 44px",display:"flex",justifyContent:"space-between"}}>
          <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:2,color:"var(--muted)"}}>BUSPASSPRO · BUS PASS MANAGEMENT SYSTEM · 2026</div>
          <div style={{fontFamily:"'JetBrains Mono'",fontSize:8,letterSpacing:2,color:"var(--muted)"}}>DJANGO + REACT · WEBSOCKET · AI POWERED</div>
        </footer>
      </div>
    </>
  );
}
