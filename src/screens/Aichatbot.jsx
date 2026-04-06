/**
 * ══════════════════════════════════════════════════════════════════════
 *  BUSPASSPRO — AI GUIDE CHATBOT
 *  File: src/components/AIChatbot.jsx
 *
 *  Anthropic API powered floating chat widget.
 *  Guides students, admins, and conductors through the entire app.
 *
 *  FEATURES:
 *  ─────────────────────────────────────────────────────────────────
 *  ◆ Real Claude responses via Anthropic API (claude-sonnet-4-20250514)
 *  ◆ Full BusPassPro system knowledge in system prompt
 *  ◆ Role-aware — different suggestions for student/admin/conductor
 *  ◆ Quick-action chips for common questions
 *  ◆ Typing indicator with animated dots
 *  ◆ Persistent conversation history within session
 *  ◆ Esc to close, Enter to send
 *  ◆ Fully consistent with BusPassPro design system
 *  ◆ "Navigate to" deep links — chatbot can suggest which page to visit
 *
 *  ADD TO App.jsx:
 *  ─────────────────────────────────────────────────────────────────
 *  import AIChatbot from "./components/AIChatbot";
 *
 *  Inside the post-auth shell, before closing </div>:
 *    <AIChatbot role={auth.role} onNavigate={setPage} />
 *
 *  That's it. The floating button appears bottom-right on every page.
 * ══════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ── Design tokens (identical to DesignSystem.jsx) ─────────────────────
const G = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;700&family=Instrument+Sans:wght@400;500;600&display=swap');
:root {
  --cream:#F6F0E4; --surface:#FDFAF3; --parchment:#EDE4CC;
  --ink:#1A1208;   --ink-mid:#3D2410;
  --amber:#C8832A; --amber-text:#8B520A; --amber-on-ink:#F0A830;
  --amber-light:#F5D49A; --muted:#6B5535; --rule:#D4C4A0;
  --green:#1E6641; --green-on-ink:#52B788;
  --red:#B02020;   --cream-on-ink:#F6F0E4; --muted-on-ink:#B09878;
  --font-display:'Bebas Neue',sans-serif;
  --font-serif:'DM Serif Display',serif;
  --font-mono:'JetBrains Mono',monospace;
  --font-sans:'Instrument Sans',sans-serif;
}
@keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn    { from{opacity:0} to{opacity:1} }
@keyframes slideUp   { from{opacity:0;transform:translateY(24px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes pulse     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.65)} }
@keyframes spin      { to{transform:rotate(360deg)} }
@keyframes dotBounce {
  0%,80%,100% { transform:translateY(0); opacity:.4 }
  40%          { transform:translateY(-5px); opacity:1 }
}
@keyframes ripple {
  0%   { transform:scale(1);   opacity:.6 }
  100% { transform:scale(2.2); opacity:0  }
}
`;

// ══════════════════════════════════════════════════════════════════════
//  BUSPASSPRO SYSTEM PROMPT
//  The entire app knowledge given to Claude.
// ══════════════════════════════════════════════════════════════════════
const SYSTEM_PROMPT = `You are the BusPassPro Guide — an AI assistant built into the BusPassPro college bus pass management system. Your job is to help users navigate and use the app effectively.

Be concise, friendly, and practical. Use short paragraphs. When giving steps, number them. Never be verbose. Always end with a helpful follow-up offer.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABOUT BUSPASSPRO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BusPassPro is a college bus pass management system with three roles:
- STUDENT: Apply for passes, book tickets, book taxis, track buses
- ADMIN: Manage applications, routes, students, analytics, announcements
- CONDUCTOR: Scan QR passes, log trips, look up students

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROUTES & FARES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Route Alpha: College Gate → North Campus → Library Sq → Main Market → City Centre | 12.5km | 35min | ₹450/month
Route Beta:  College Gate → Tech Park → Sector 4 → Bus Terminal → Railway Station | 18.2km | 50min | ₹650/month
Route Gamma: College Gate → East Campus → Ring Road → IT Hub → Airport Road | 22km | 65min | ₹750/month

Pass durations:
- Monthly:   1 month  | No discount | Pay base fare
- Quarterly: 3 months | 10% off     | Best for most students
- Annual:    12 months| 20% off     | Best value

Single journey tickets: ₹10 base + ₹15 per stop segment (e.g. College Gate → City Centre = ₹55)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STUDENT FEATURES & HOW TO USE THEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DASHBOARD: View your active pass (QR code), live bus positions, AI route optimizer, demand chart.

APPLY FOR A PASS (3 steps):
1. Go to APPLY PASS in the nav
2. Step 1: Choose your route and boarding stop
3. Step 2: Select duration (monthly/quarterly/annual)
4. Step 3: Review total and pay via Razorpay (UPI/Card/Netbanking)
5. Pass goes to PENDING — admin approves within 24 hours
6. Once approved, your QR pass appears on Dashboard

RENEW A PASS:
1. Click RENEW in the nav (or go to Profile → My Pass → Renew)
2. Pick duration (same route is pre-filled)
3. Pay — no admin approval needed for renewal

BOOK A SINGLE TICKET (no pass needed):
1. Go to TICKETS in the nav
2. Enter from/to stops and date, click SEARCH
3. Pick a trip from results (shows seats available, fare, departure time)
4. Select your seat on the visual bus map
5. Pay — get instant QR ticket (valid one journey only)
6. Show QR to conductor when boarding

BOOK A TAXI:
1. Go to TAXI in the nav
2. Enter pickup and destination (type to search stops)
3. Choose ride type: Auto (₹12/km), Economy (₹16/km), Premium (₹24/km), Shared (₹8/km)
4. Book Now or Schedule for later
5. Confirm and pay — driver assigned with OTP
6. Share OTP only when driver physically arrives

BUS MAP: See live stop-by-stop route with real-time bus position and ETA to your stop.

PROFILE: View/edit personal info, see all past passes, payment history, notification preferences, change password.

NOTIFICATIONS: Bell icon top-right. Shows pass approvals, expiry warnings, route delays, payment confirmations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADMIN FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPLICATIONS: Review pending student applications. Click any row to see full detail. Approve (issues pass instantly) or Reject (with note). Filter by status.

ROUTES: Add new routes, edit fares and stops, enable/disable routes. Each route needs: name, source, destination, stops (comma-separated), fare, distance.

STUDENTS: Search/browse all registered students. View their pass history. Suspend accounts if needed.

ANALYTICS: Daily/weekly/monthly stats — passes issued, revenue, ridership charts, route distribution.

ANNOUNCE: Broadcast messages to all students or specific routes. Types: general info, warning, good news.

ADMIN HUB (HUB in nav):
- Overview: Live activity feed + email log
- Emails: Send stats reports, cancellation notices
- Discounts: Create voucher codes with % off for specific students
- Support: Respond to student queries, mark resolved
- Reports: Download CSV reports (daily/weekly/monthly)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONDUCTOR FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCANNER: Click SCAN QR CODE → student shows QR → result shows VALID / EXPIRED / INVALID
CAMERA: Use device camera to scan QR codes automatically (requires jsQR library)
TRIP LOG: End-of-day report showing all scans, valid/invalid counts. Export as PDF.
LOOKUP: Search student by ID or pass number. Shows pass validity. Log boarding manually.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMMON ISSUES & FIXES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Pass not showing after payment" → Payment may be pending verification. Wait 5 min, refresh Dashboard. If still missing, go to Profile → Payments to confirm payment status. Contact support if payment shows SUCCESS but pass is missing.

"Application stuck on PENDING" → Admin reviews within 24 hours. If >48 hours, use Profile → raise a support query.

"QR not scanning" → Ensure screen brightness is high. Ask conductor to use Manual Lookup and enter your pass number.

"Payment failed but amount deducted" → Raise a support query in Profile → Support. Provide Razorpay reference number. Refund in 5-7 business days.

"Can't find my route" → Only 3 routes currently. Check TICKETS for single journeys to intermediate stops not on your pass route.

"Forgot password" → On login screen, click "Forgot password?" → enter email → enter 6-digit OTP → set new password.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NAVIGATION SHORTCUTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When you suggest the user visit a page, include the page key in your response like this exactly: [navigate:dashboard], [navigate:apply], [navigate:tickets], [navigate:taxi], [navigate:profile], [navigate:renew], [navigate:busmap], [navigate:notifications], [navigate:admin], [navigate:routes], [navigate:users], [navigate:analytics], [navigate:announce], [navigate:hub], [navigate:conductor], [navigate:camera], [navigate:triplog], [navigate:lookup]

The app will render these as clickable buttons automatically. Always include one when directing the user somewhere.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TONE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Friendly and direct. No filler phrases like "Great question!" or "Certainly!"
- Use Indian context naturally (₹, college campus, UPI, etc.)
- If you don't know something, say so and suggest contacting support.
- Keep responses under 150 words unless a step-by-step guide is needed.`;

// ══════════════════════════════════════════════════════════════════════
//  QUICK SUGGESTIONS PER ROLE
// ══════════════════════════════════════════════════════════════════════
const QUICK_CHIPS = {
  student: [
    { label: "How do I apply for a pass?",     q: "How do I apply for a bus pass? Walk me through it." },
    { label: "Book a single ticket",            q: "How do I book a single journey ticket without a pass?" },
    { label: "My pass is pending — what now?", q: "My pass application is pending. How long does it take?" },
    { label: "Book a taxi",                     q: "How do I book a taxi from the app?" },
    { label: "Payment failed help",             q: "My payment failed but money was deducted. What should I do?" },
    { label: "Track my bus",                    q: "How do I see where my bus is right now?" },
    { label: "Renew my pass",                   q: "How do I renew my existing bus pass?" },
    { label: "Route fares & timings",           q: "What are the available routes, fares, and timings?" },
  ],
  admin: [
    { label: "Approve applications",            q: "How do I approve student pass applications?" },
    { label: "Add a new route",                 q: "How do I add a new bus route?" },
    { label: "Send an announcement",            q: "How do I broadcast a message to all students?" },
    { label: "Create a discount voucher",       q: "How do I create a discount for specific students?" },
    { label: "Download reports",                q: "How do I download daily/weekly/monthly reports?" },
    { label: "Respond to a student query",      q: "How do I respond to and resolve student support queries?" },
    { label: "View analytics",                  q: "Where can I see ridership and revenue analytics?" },
    { label: "Suspend a student account",       q: "How do I suspend a student account?" },
  ],
  conductor: [
    { label: "Scan a QR pass",                  q: "How do I scan a student's QR pass?" },
    { label: "Handle an invalid QR",            q: "What do I do if a student's QR shows INVALID?" },
    { label: "Use camera scanning",             q: "How does the camera QR scanner work?" },
    { label: "Look up a student manually",      q: "How do I manually look up a student without scanning?" },
    { label: "View today's trip log",           q: "How do I see today's scan log and trip report?" },
    { label: "Export my daily report",          q: "How do I export my daily trip report as PDF?" },
  ],
};

const WELCOME_MSG = {
  student:   "Hi! I'm your BusPassPro guide. I can help you apply for a pass, book tickets or taxis, track your bus, and more. What do you need?",
  admin:     "Welcome, Admin. I can walk you through managing applications, routes, students, analytics, and the admin hub. What would you like to do?",
  conductor: "Hey! I can help you with scanning passes, handling invalid QRs, looking up students, and your trip log. What do you need?",
};

// ══════════════════════════════════════════════════════════════════════
//  PARSE RESPONSE — extract [navigate:xxx] deep links
// ══════════════════════════════════════════════════════════════════════
const PAGE_LABELS = {
  dashboard:"Dashboard", apply:"Apply Pass", tickets:"Tickets",
  taxi:"Taxi Booking", profile:"My Profile", renew:"Renew Pass",
  busmap:"Bus Map", notifications:"Notifications",
  admin:"Applications", routes:"Route Manager", users:"Student Manager",
  analytics:"Analytics", announce:"Announcements", hub:"Admin Hub",
  conductor:"QR Scanner", camera:"Camera Scan", triplog:"Trip Log",
  lookup:"Manual Lookup",
};

function parseMessage(text) {
  const parts = [];
  const regex = /\[navigate:([a-z]+)\]/g;
  let last = 0, match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: "text", content: text.slice(last, match.index) });
    parts.push({ type: "nav", page: match[1], label: PAGE_LABELS[match[1]] || match[1] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", content: text.slice(last) });
  return parts;
}

// ══════════════════════════════════════════════════════════════════════
//  TYPING INDICATOR
// ══════════════════════════════════════════════════════════════════════
function TypingDots() {
  return (
    <div style={{ display:"flex", gap:4, alignItems:"center", padding:"12px 16px" }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"var(--amber)", animation:`dotBounce 1.2s ease infinite`, animationDelay:`${i*0.18}s` }}/>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  MESSAGE BUBBLE
// ══════════════════════════════════════════════════════════════════════
function MessageBubble({ msg, onNavigate }) {
  const isUser = msg.role === "user";
  const parts  = isUser ? [{ type:"text", content:msg.content }] : parseMessage(msg.content);

  return (
    <div style={{ display:"flex", flexDirection:"column",
      alignItems: isUser ? "flex-end" : "flex-start",
      marginBottom:12, animation:"fadeUp .25s ease" }}>

      {/* Role label */}
      {!isUser && (
        <div style={{ fontFamily:"var(--font-mono)", fontSize:6, letterSpacing:3,
          color:"var(--amber-text)", marginBottom:4, paddingLeft:2 }}>BUSPASSPRO AI</div>
      )}

      {/* Bubble */}
      <div style={{
        maxWidth:"88%",
        background: isUser ? "var(--ink)" : "var(--surface)",
        border: isUser ? "none" : "1.5px solid var(--rule)",
        padding:"11px 14px",
        borderRadius: isUser ? "12px 12px 2px 12px" : "2px 12px 12px 12px",
      }}>
        {parts.map((p, i) => {
          if (p.type === "text") return (
            <span key={i} style={{ fontFamily:"var(--font-sans)", fontSize:13,
              color: isUser ? "var(--cream-on-ink)" : "var(--ink)",
              lineHeight:1.65, whiteSpace:"pre-wrap" }}>{p.content}</span>
          );
          if (p.type === "nav") return (
            <button key={i} onClick={() => onNavigate(p.page)}
              style={{ display:"inline-flex", alignItems:"center", gap:6,
                margin:"6px 4px 2px 0", padding:"5px 12px",
                background:"var(--amber)", border:"none",
                fontFamily:"var(--font-display)", fontSize:11, letterSpacing:2,
                color:"var(--ink)", cursor:"pointer",
                borderRadius:2, transition:"background .15s" }}
              onMouseEnter={e=>e.target.style.background="#7A4206"}
              onMouseLeave={e=>e.target.style.background="var(--amber)"}>
              → {(p.label||p.page).toUpperCase()}
            </button>
          );
          return null;
        })}
      </div>

      {/* Timestamp */}
      <div style={{ fontFamily:"var(--font-mono)", fontSize:6, letterSpacing:1,
        color:"var(--muted)", marginTop:3,
        paddingRight: isUser ? 2 : 0, paddingLeft: isUser ? 0 : 2 }}>
        {msg.time}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  MAIN CHATBOT COMPONENT
// ══════════════════════════════════════════════════════════════════════
export default function AIChatbot({ role = "student", onNavigate = () => {} }) {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [unread,   setUnread]   = useState(0);
  const [showChips, setShowChips] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const chips          = QUICK_CHIPS[role] || QUICK_CHIPS.student;

  // ── Scroll to bottom on new message ────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  // ── Focus input when opened ─────────────────────────────────────────
  useEffect(() => {
    if (open) { setTimeout(()=> inputRef.current?.focus(), 180); }
  }, [open]);

  // ── Esc to close ────────────────────────────────────────────────────
  useEffect(() => {
    const h = e => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // ── Init welcome message ────────────────────────────────────────────
  useEffect(() => {
    setMessages([{
      role:"assistant",
      content: WELCOME_MSG[role] || WELCOME_MSG.student,
      time: new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }),
    }]);
  }, [role]);

  // ── Toggle open ─────────────────────────────────────────────────────
  const toggle = () => {
    setOpen(o => !o);
    setUnread(0);
  };

  // ── Send message ────────────────────────────────────────────────────
  const send = useCallback(async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    setError("");
    setShowChips(false);

    const userMsg = {
      role:"user", content:q,
      time: new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }),
    };
    setMessages(m => [...m, userMsg]);
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.role === "user" || m.role === "assistant")
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model:      "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system:     SYSTEM_PROMPT + `\n\nCurrent user role: ${role.toUpperCase()}`,
          messages:   [...history, { role:"user", content:q }],
        }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "Sorry, I couldn't get a response. Please try again.";

      const aiMsg = {
        role:"assistant", content:reply,
        time: new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }),
      };
      setMessages(m => [...m, aiMsg]);

      // If chat is closed, increment unread badge
      if (!open) setUnread(n => n + 1);

    } catch (e) {
      setError("Couldn't reach the AI. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, open, role]);

  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => {
    setMessages([{
      role:"assistant",
      content: WELCOME_MSG[role] || WELCOME_MSG.student,
      time: new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }),
    }]);
    setShowChips(true);
    setError("");
    setInput("");
  };

  // ── Navigate and close ──────────────────────────────────────────────
  const handleNavigate = (page) => {
    onNavigate(page);
    setOpen(false);
  };

  return (
    <>
      <style>{G}</style>

      {/* ── Floating button ── */}
      <div style={{ position:"fixed", bottom:28, right:28, zIndex:8000 }}>

        {/* Ripple ring when unread */}
        {unread > 0 && !open && (
          <div style={{ position:"absolute", inset:-6, borderRadius:"50%",
            border:"2px solid var(--amber)", animation:"ripple 1.5s ease-out infinite",
            pointerEvents:"none" }}/>
        )}

        <button onClick={toggle}
          style={{ width:56, height:56, borderRadius:"50%",
            background: open ? "var(--red)" : "var(--ink)",
            border:`3px solid ${open ? "var(--red)" : "var(--amber)"}`,
            boxShadow:"0 6px 24px rgba(26,18,8,.28)",
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", transition:"all .22s",
            position:"relative" }}>

          {/* Icon */}
          {open
            ? <span style={{ fontFamily:"var(--font-display)", fontSize:20,
                color:"white", lineHeight:1 }}>✕</span>
            : <svg width={24} height={24} viewBox="0 0 24 24" fill="none"
                stroke="var(--amber-on-ink)" strokeWidth={1.8}
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
          }

          {/* Unread badge */}
          {unread > 0 && !open && (
            <div style={{ position:"absolute", top:-4, right:-4,
              width:18, height:18, borderRadius:"50%",
              background:"var(--red)", border:"2px solid var(--cream)",
              fontFamily:"var(--font-mono)", fontSize:8, fontWeight:700,
              color:"white", display:"flex", alignItems:"center", justifyContent:"center",
              lineHeight:1 }}>{unread > 9 ? "9+" : unread}</div>
          )}
        </button>
      </div>

      {/* ── Chat panel ── */}
      {open && (
        <div style={{ position:"fixed", bottom:96, right:28, zIndex:7999,
          width:380, maxHeight:"72vh",
          display:"flex", flexDirection:"column",
          border:"2px solid var(--ink)",
          boxShadow:"0 16px 48px rgba(26,18,8,.22)",
          animation:"slideUp .28s cubic-bezier(.34,1.28,.64,1)",
          background:"var(--cream)" }}>

          {/* Header */}
          <div style={{ background:"var(--ink)", padding:"14px 18px",
            display:"flex", justifyContent:"space-between", alignItems:"center",
            flexShrink:0 }}>
            <div>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:7,
                letterSpacing:4, color:"var(--muted-on-ink)", marginBottom:3 }}>
                BUSPASSPRO · AI GUIDE
              </div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:18,
                letterSpacing:2, color:"var(--amber-on-ink)", lineHeight:1 }}>
                SMART ASSISTANT
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {/* Live dot */}
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:6, height:6, borderRadius:"50%",
                  background:"var(--green-on-ink)",
                  animation:"pulse 2s ease-in-out infinite" }}/>
                <span style={{ fontFamily:"var(--font-mono)", fontSize:6,
                  letterSpacing:3, color:"var(--muted-on-ink)" }}>ONLINE</span>
              </div>
              {/* Clear button */}
              <button onClick={clearChat}
                style={{ background:"none", border:"1px solid rgba(255,255,255,.15)",
                  padding:"4px 10px", fontFamily:"var(--font-mono)", fontSize:7,
                  letterSpacing:2, color:"var(--muted-on-ink)", cursor:"pointer",
                  transition:"border-color .18s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.4)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.15)"}>
                CLEAR
              </button>
            </div>
          </div>

          {/* Role badge */}
          <div style={{ padding:"6px 18px", background:"var(--parchment)",
            borderBottom:"1px solid var(--rule)", flexShrink:0,
            display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:7,
              letterSpacing:3, color:"var(--muted)" }}>LOGGED IN AS</div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:13,
              letterSpacing:2, color:"var(--amber-text)" }}>{role.toUpperCase()}</div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"16px 14px",
            display:"flex", flexDirection:"column" }}>

            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} onNavigate={handleNavigate}/>
            ))}

            {loading && (
              <div style={{ display:"flex", alignItems:"flex-start",
                marginBottom:12, animation:"fadeIn .2s ease" }}>
                <div style={{ background:"var(--surface)", border:"1.5px solid var(--rule)",
                  borderRadius:"2px 12px 12px 12px" }}>
                  <TypingDots/>
                </div>
              </div>
            )}

            {error && (
              <div style={{ padding:"10px 12px", background:"var(--error-bg)",
                border:"1.5px solid var(--red)", marginBottom:10,
                fontFamily:"var(--font-sans)", fontSize:12, color:"var(--red)",
                animation:"fadeUp .3s ease" }}>{error}</div>
            )}

            <div ref={messagesEndRef}/>
          </div>

          {/* Quick chips — shown on fresh start */}
          {showChips && (
            <div style={{ padding:"10px 14px 6px", borderTop:"1px solid var(--rule)",
              background:"var(--parchment)", flexShrink:0 }}>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:6,
                letterSpacing:3, color:"var(--muted)", marginBottom:8 }}>QUICK QUESTIONS</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5,
                maxHeight:100, overflowY:"auto" }}>
                {chips.map((c, i) => (
                  <button key={i} onClick={() => send(c.q)}
                    style={{ padding:"5px 10px", background:"var(--cream)",
                      border:"1.5px solid var(--rule)",
                      fontFamily:"var(--font-sans)", fontSize:11,
                      color:"var(--ink)", cursor:"pointer",
                      borderRadius:2, lineHeight:1.4, textAlign:"left",
                      transition:"border-color .15s, background .15s" }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--amber)";e.currentTarget.style.background="var(--amber-light)"}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--rule)";e.currentTarget.style.background="var(--cream)"}}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div style={{ padding:"12px 14px", borderTop:"2px solid var(--ink)",
            background:"var(--surface)", flexShrink:0,
            display:"flex", gap:8, alignItems:"flex-end" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything about BusPassPro…"
              rows={1}
              style={{ flex:1, padding:"9px 12px",
                border:"1.5px solid var(--rule)",
                background:"var(--cream)",
                fontFamily:"var(--font-sans)", fontSize:13,
                color:"var(--ink)", outline:"none", resize:"none",
                lineHeight:1.5, maxHeight:80, overflowY:"auto",
                transition:"border-color .18s",
                borderRadius:2 }}
              onFocus={e=>e.target.style.borderColor="var(--amber)"}
              onBlur={e=>e.target.style.borderColor="var(--rule)"}
            />
            <button onClick={() => send()}
              disabled={!input.trim() || loading}
              style={{ width:38, height:38, background:!input.trim()||loading?"var(--parchment)":"var(--ink)",
                border:"none", display:"flex", alignItems:"center",
                justifyContent:"center", cursor:!input.trim()||loading?"not-allowed":"pointer",
                transition:"background .18s", flexShrink:0, borderRadius:2 }}>
              {loading
                ? <div style={{ width:14, height:14, border:"2px solid rgba(200,131,42,.3)",
                    borderTop:"2px solid var(--amber)", borderRadius:"50%",
                    animation:"spin .7s linear infinite" }}/>
                : <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                    stroke={!input.trim()?"var(--muted)":"var(--amber-on-ink)"}
                    strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
              }
            </button>
          </div>

          {/* Footer hint */}
          <div style={{ padding:"5px 14px 8px", background:"var(--surface)",
            borderTop:"1px solid var(--rule)", flexShrink:0 }}>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:6,
              letterSpacing:2, color:"var(--muted)" }}>
              ENTER TO SEND · SHIFT+ENTER FOR NEW LINE · ESC TO CLOSE
            </div>
          </div>
        </div>
      )}
    </>
  );
}
