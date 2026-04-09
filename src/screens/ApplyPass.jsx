/**
 * ══════════════════════════════════════════════════════════════════════
 *  APPLY PASS SCREEN — PASS APPLICATION CENTER
 *  Premium City Transit Pass Wizard
 * ══════════════════════════════════════════════════════════════════════
 */

import React, { useState } from "react";
import { User, GraduationCap, Leaf, Accessibility, Briefcase, MapPin, Navigation, CheckCircle, ArrowRight, ChevronLeft, Info, Bookmark } from "lucide-react";

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
  --amber-text:   #8B520A;
  --amber-on-ink: #F0A830;
  --cream-on-ink: #F6F0E4;
  --muted:        #6B5535;
  --muted-on-ink: #B09878;
  --green:        #1E6641;
  --green-on-ink: #52B788;
  --red:          #B02020;
  --red-on-ink:   #FF6B6B;
  --rule:         #D4C4A0;
  --font-display: 'Bebas Neue', sans-serif;
  --font-serif:   'DM Serif Display', serif;
  --font-mono:    'JetBrains Mono', monospace;
  --font-sans:    'Instrument Sans', sans-serif;
}

@keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn   { from{opacity:0} to{opacity:1} }
@keyframes stampIn  { 0%{transform:scale(2.2) rotate(-8deg);opacity:0} 65%{transform:scale(.92) rotate(3deg);opacity:1} 100%{transform:scale(1) rotate(-3deg);opacity:1} }
@keyframes lineGrow { from{transform:scaleX(0)} to{transform:scaleX(1)} }
`;

// ── Data Constants ────────────────────────────────────────────────────
const CITY_ROUTES = [
  { id: 1, name: "Red Express", code: "R1", color: "#B02020", src: "Central Station", dst: "Old Market", stops: 12, km: 14.5 },
  { id: 2, name: "Blue Line", code: "B2", color: "#1A4A8A", src: "City Square", dst: "Airport Road", stops: 8, km: 22.1 },
  { id: 3, name: "Green Orbital", code: "G3", color: "#1E6641", src: "North Hub", dst: "South End", stops: 18, km: 19.8 },
];

const PASSENGER_TYPES = [
  { id: "general", label: "GENERAL", disc: 0, color: "var(--ink)", icon: <User size={24} /> },
  { id: "student", label: "STUDENT", disc: 30, color: "var(--green)", icon: <GraduationCap size={24} /> },
  { id: "senior", label: "SENIOR", disc: 50, color: "var(--amber)", icon: <Leaf size={24} /> },
  { id: "differently_abled", label: "DIFF. ABLED", disc: 75, color: "var(--ink-mid)", icon: <Accessibility size={24} /> },
  { id: "corporate", label: "CORPORATE", disc: 15, color: "var(--muted)", icon: <Briefcase size={24} /> },
];

const PASS_DURATIONS = [
  { id: "daily", label: "DAILY", days: 1, price: 60, desc: "24-hour validity" },
  { id: "weekly", label: "WEEKLY", days: 7, price: 350, desc: "7-day unlimited" },
  { id: "monthly", label: "MONTHLY", days: 30, price: 1200, desc: "Full calendar month" },
  { id: "quarterly", label: "QUARTERLY", days: 90, price: 3200, desc: "90-day mega pass" },
];

const VALID_PROMOS = {
  "CITY20": 20,
  "SAVEMORE": 15,
  "STUDENT50": 50,
  "FREEDOM": 100
};

// ── Atomic Components ─────────────────────────────────────────────────

const Tag = ({ children, color }) => (
  <div style={{
    fontFamily: "var(--font-mono)", fontSize: 8,
    letterSpacing: 4, color: color || "var(--muted)",
    textTransform: "uppercase", marginBottom: 8, lineHeight: 1.4,
  }}>{children}</div>
);

const Rule = ({ my = 20 }) => (
  <div style={{ height: 1, background: "var(--rule)", margin: `${my}px 0` }} />
);

const Btn = ({ children, onClick, variant = "primary", full = false, size = "md", disabled = false, style = {} }) => {
  const [hov, setHov] = useState(false);
  const pad = { sm: "7px 16px", md: "11px 24px", lg: "14px 32px" }[size];
  const fs = { sm: 11, md: 13, lg: 16 }[size];
  const styles = {
    primary: { bg: hov && !disabled ? "var(--ink-mid)" : "var(--ink)", color: "var(--amber-on-ink)" },
    secondary: { bg: hov && !disabled ? "var(--parchment)" : "transparent", color: "var(--ink)", border: "1.5px solid var(--ink)" },
    ghost: { bg: hov && !disabled ? "var(--parchment)" : "transparent", color: "var(--muted)", border: "1.5px solid var(--rule)" }
  };
  const s = styles[variant];
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: pad, background: s.bg, color: s.color,
        border: s.border || "none",
        fontFamily: "var(--font-display)", fontSize: fs, letterSpacing: 2,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1, width: full ? "100%" : "auto",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "all .18s ease", ...style
      }}>{children}</button>
  );
};

// ── Application Form Wizard ───────────────────────────────────────────

export default function ApplyPass({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    routeId: null,
    typeId: "general",
    durationId: "monthly",
    reason: ""
  });
  const [promoInput, setPromoInput] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");

  const selectedRoute = CITY_ROUTES.find(r => r.id === formData.routeId);
  const selectedType = PASSENGER_TYPES.find(p => p.id === formData.typeId);
  const selectedDur = PASS_DURATIONS.find(d => d.id === formData.durationId);
  
  const basePrice = selectedDur?.price || 0;
  const categoryDiscount = selectedType?.disc || 0;
  
  // Calculate price with both category and promo discounts
  const discountedPrice = basePrice * (1 - categoryDiscount / 100);
  const finalPrice = Math.round(discountedPrice * (1 - promoDiscount / 100));

  const applyPromo = () => {
    const code = promoInput.toUpperCase().trim();
    if (VALID_PROMOS[code]) {
      setPromoDiscount(VALID_PROMOS[code]);
      setPromoError("");
    } else {
      setPromoError("Invalid or expired code");
      setPromoDiscount(0);
    }
  };

  const handleNext = () => { if (step < 4) setStep(s => s + 1); };
  const handlePrev = () => { if (step > 1) setStep(s => s - 1); };

  const handleSubmit = () => {
    setSubmitted(true);
    // Remove hash redirect - let user click the button or auto-redirect properly
    setTimeout(() => { if(onNavigate) onNavigate("dashboard"); }, 5000);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <style>{FONTS + CSS_VARS}</style>
        <div style={{ textAlign: "center", animation: "fadeUp .5s ease" }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: 32 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
              <CheckCircle size={40} color="white" />
            </div>
            <div style={{ position: "absolute", top: "50%", right: -60, transform: "translateY(-50%) rotate(-10deg)", border: "3px solid var(--green)", padding: "10px 24px", animation: "stampIn .6s var(--ease-spring) both" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, letterSpacing: 4, color: "var(--green)" }}>RECEIVED</div>
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 56, color: "var(--ink)", lineHeight: 1 }}>SUCCESSFULLY FILED</div>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--muted)", fontStyle: "italic", margin: "16px 0 32px" }}>
            Your application for a {selectedDur?.label} {selectedType?.label} Pass is now under review.
          </p>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 4, color: "var(--amber)", marginBottom: 40 }}>APP REGISTRY ID: BPP-APP-{Math.floor(Math.random()*90000)+10000}</div>
          <Btn variant="primary" size="lg" onClick={() => onNavigate("dashboard")}>RETURN TO DASHBOARD</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)", padding: "48px 44px" }}>
      <style>{FONTS + CSS_VARS}</style>
      
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48, animation: "fadeUp .4s ease" }}>
          <Tag color="var(--amber-text)">Ticket Wizard</Tag>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 64, lineHeight: 0.9 }}>
            PASS APPLICATION<br /><span style={{ color: "var(--ink)" }}>CENTER</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 48, alignItems: "start" }}>
          
          {/* Main Form */}
          <div style={{ animation: "fadeUp .5s ease" }}>
            {/* Step Track */}
            <div style={{ display: "flex", gap: 12, marginBottom: 40 }}>
              {[1, 2, 3, 4].map(s => (
                <div key={s} style={{ flex: 1, position: "relative" }}>
                  <div style={{ height: 4, background: step >= s ? "var(--ink)" : "var(--rule)", transition: "background .4s" }} />
                  <div style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 2, color: step >= s ? "var(--ink)" : "var(--muted)" }}>STEP 0{s}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "var(--cream)", border: "2px solid var(--ink)", padding: 40, position: "relative" }}>
              
              {/* Step 1: Route Selection */}
              {step === 1 && (
                <div style={{ animation: "fadeIn .3s ease" }}>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "var(--ink)", marginBottom: 8 }}>Select Transit Line</div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--muted)", marginBottom: 32 }}>Choose the primary transit line for your regular commute.</p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {CITY_ROUTES.map(route => (
                      <div key={route.id} onClick={() => setFormData({...formData, routeId: route.id})}
                        style={{
                          display: "flex", alignItems: "center", gap: 20, padding: 24, cursor: "pointer",
                          border: `2px solid ${formData.routeId === route.id ? "var(--ink)" : "var(--rule)"}`,
                          background: formData.routeId === route.id ? "var(--surface)" : "transparent",
                          transition: "all .2s ease"
                        }}>
                        <div style={{ width: 48, height: 48, background: route.color, color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 20 }}>{route.code}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink)" }}>{route.name}</div>
                          <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)" }}>{route.src} → {route.dst}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1 }}>{route.km} KM</div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1, color: "var(--muted)" }}>{route.stops} STOPS</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Passenger Type */}
              {step === 2 && (
                <div style={{ animation: "fadeIn .3s ease" }}>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "var(--ink)", marginBottom: 8 }}>Passenger Category</div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--muted)", marginBottom: 32 }}>Select your category. Verification documents will be required later.</p>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {PASSENGER_TYPES.map(type => (
                      <div key={type.id} onClick={() => setFormData({...formData, typeId: type.id})}
                        style={{
                          padding: 32, cursor: "pointer", textAlign: "center",
                          border: `2px solid ${formData.typeId === type.id ? "var(--ink)" : "var(--rule)"}`,
                          background: formData.typeId === type.id ? "var(--surface)" : "transparent",
                          transition: "all .2s ease"
                        }}>
                        <div style={{ background: formData.typeId === type.id ? "var(--ink)" : "var(--parchment)", color: formData.typeId === type.id ? "white" : "var(--ink)", width: 56, height: 56, borderRadius: "50%", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {type.icon}
                        </div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--ink)" }}>{type.label}</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: type.disc > 0 ? "var(--green)" : "var(--muted)", marginTop: 8 }}>{type.disc}% DISCOUNT</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Duration */}
              {step === 3 && (
                <div style={{ animation: "fadeIn .3s ease" }}>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "var(--ink)", marginBottom: 8 }}>Select Duration</div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--muted)", marginBottom: 32 }}>How long should this pass be valid for?</p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {PASS_DURATIONS.map(dur => (
                      <div key={dur.id} onClick={() => setFormData({...formData, durationId: dur.id})}
                        style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center", padding: 24, cursor: "pointer",
                          border: `2px solid ${formData.durationId === dur.id ? "var(--ink)" : "var(--rule)"}`,
                          background: formData.durationId === dur.id ? "var(--surface)" : "transparent",
                          transition: "all .2s ease"
                        }}>
                        <div>
                          <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--ink)" }}>{dur.label}</div>
                          <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)" }}>{dur.desc}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--amber-text)" }}>₹{dur.price}</div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>{dur.days} DAYS</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Finalize */}
              {step === 4 && (
                <div style={{ animation: "fadeIn .3s ease" }}>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "var(--ink)", marginBottom: 8 }}>Final Review</div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--muted)", marginBottom: 32 }}>Check your details before submitting for approval.</p>
                  
                  <div style={{ marginBottom: 32 }}>
                    <Tag>HAVE A PROMO CODE?</Tag>
                    <div style={{ display: "flex", gap: 12 }}>
                      <input 
                        value={promoInput}
                        onChange={e => setPromoInput(e.target.value)}
                        placeholder="e.g. CITY20"
                        style={{ flex: 1, padding: "12px 16px", background: "var(--surface)", border: `1.5px solid ${promoError ? "var(--red)" : "var(--rule)"}`, fontFamily: "var(--font-mono)", fontSize: 13, outline: "none" }}
                      />
                      <Btn variant="secondary" onClick={applyPromo} disabled={!promoInput}>APPLY</Btn>
                    </div>
                    {promoError && <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--red)", marginTop: 6 }}>{promoError}</div>}
                    {promoDiscount > 0 && <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--green)", marginTop: 6, fontWeight: 600 }}>PROMO APPLIED: {promoDiscount}% EXTRA SAVINGS!</div>}
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <Tag>REASON FOR APPLICATION</Tag>
                    <textarea 
                      value={formData.reason} 
                      onChange={e => setFormData({...formData, reason: e.target.value})}
                      placeholder="e.g. Regular commute for university classes..."
                      style={{ width: "100%", padding: 16, background: "var(--surface)", border: "1.5px solid var(--rule)", fontFamily: "var(--font-sans)", fontSize: 14, minHeight: 120, outline: "none" }}
                    />
                  </div>

                  <div style={{ padding: 20, background: "var(--parchment)", border: "1.5px dashed var(--ink)", display: "flex", gap: 14 }}>
                    <Info size={20} color="var(--ink)" style={{ flexShrink: 0 }} />
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink)", lineHeight: 1.6, margin: 0 }}>
                      By submitting, you acknowledge that all provided info is true. Misrepresentation will lead to permanent transit service ban.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
              <Btn variant="secondary" onClick={handlePrev} disabled={step === 1}>← BACK</Btn>
              {step < 4 ? (
                <Btn variant="primary" onClick={handleNext} disabled={step === 1 && !formData.routeId}>CONTINUE →</Btn>
              ) : (
                <Btn variant="primary" onClick={handleSubmit}>SUBMIT APPLICATION ✓</Btn>
              )}
            </div>
          </div>

          {/* Ticket Preview Card */}
          <div style={{ position: "sticky", top: 100 }}>
            <Tag>Live Pass Preview</Tag>
            <div style={{ background: "var(--ink)", padding: 32, borderRadius: 0, position: "relative", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,.2)" }}>
              {/* Decorative cuts */}
              <div style={{ position: "absolute", left: -10, top: "50%", width: 20, height: 20, borderRadius: "50%", background: "var(--surface)" }} />
              <div style={{ position: "absolute", right: -10, top: "50%", width: 20, height: 20, borderRadius: "50%", background: "var(--surface)" }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
                <div style={{ width: 44, height: 44, background: selectedRoute?.color || "var(--rule)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "var(--font-display)", fontSize: 20 }}>{selectedRoute?.code || "??"}</div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted-on-ink)", letterSpacing: 2 }}>PASS STATUS</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--amber-on-ink)" }}>PROVISIONAL</div>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted-on-ink)", letterSpacing: 2, marginBottom: 4 }}>PASS TYPE</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--cream)", letterSpacing: 1 }}>{selectedType?.label || "GENERAL"} ACCESS</div>
              </div>

              <div style={{ borderTop: "1px dashed rgba(255,255,255,0.2)", padding: "24px 0", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted-on-ink)", letterSpacing: 2, marginBottom: 4 }}>ESTIMATED FARE</div>
                      {promoDiscount > 0 && <span style={{ padding: "2px 6px", background: "var(--green)", color: "white", fontSize: 7, fontFamily: "var(--font-mono)", borderRadius: 4, marginBottom: 4 }}>PROMO APPLIED</span>}
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 44, color: "var(--cream)", lineHeight: 1 }}>₹{finalPrice}</div>
                    {promoDiscount > 0 && <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--green-on-ink)", marginTop: 4 }}>ADDITIONAL {promoDiscount}% OFF</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted-on-ink)", letterSpacing: 2, marginBottom: 4 }}>VALIDITY</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--cream)" }}>{selectedDur?.label || "---"}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 24, opacity: 0.6 }}>
                <Bookmark size={14} color="var(--amber-on-ink)" />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted-on-ink)" }}>BUSPASSPRO CITY TRANSIT SYSTEM</span>
              </div>
            </div>

            <div style={{ marginTop: 24, padding: 20, border: "1.5px solid var(--rule)", background: "var(--parchment)" }}>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                Approval typically takes 2-4 business hours. Once approved, you can pay and activate your digital QR pass from the dashboard.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
