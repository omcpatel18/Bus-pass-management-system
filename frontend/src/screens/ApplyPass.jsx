/**
 * ══════════════════════════════════════════════════════════════════════
 *  APPLY PASS SCREEN
 *  Multi-step form for students to apply for a new bus pass
 *  Steps: Route Selection → Pass Type → Reason → Review & Payment
 * ══════════════════════════════════════════════════════════════════════
 */

import { useState } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;700&family=Instrument+Sans:wght@400;500;600&display=swap');

:root {
  --cream:#F6F0E4; --surface:#FDFAF3; --parchment:#EDE4CC;
  --ink:#1A1208; --ink-mid:#3D2410;
  --amber:#C8832A; --amber-text:#8B520A; --amber-on-ink:#F0A830;
  --amber-light:#F5D49A;
  --muted:#6B5535; --rule:#D4C4A0;
  --green:#1E6641; --green-on-ink:#52B788;
  --red:#B02020; --cream-on-ink:#F6F0E4; --muted-on-ink:#B09878;
  --success-bg:#EBF7F0; --error-bg:#FDEAEA;
  --warn-bg:#FEF7E6; --info-bg:#EDF4FD;
  --font-display:'Bebas Neue',sans-serif;
  --font-serif:'DM Serif Display',serif;
  --font-mono:'JetBrains Mono',monospace;
  --font-sans:'Instrument Sans',sans-serif;
}

@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
@keyframes stampDrop { 0%{transform:scale(2.2)rotate(-8deg);opacity:0} 65%{transform:scale(.92)rotate(3deg);opacity:1} 100%{transform:scale(1)rotate(-3deg);opacity:1} }
`;

const Tag = ({ children, color }) => (
  <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 4, color: color || "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>{children}</div>
);

const Rule = ({ my = 20 }) => <div style={{ height: 1, background: "var(--rule)", margin: `${my}px 0` }} />;

const Pill = ({ s }) => {
  const m = { PENDING: { bg: "#C8832A", c: "#1A1208" }, APPROVED: { bg: "#1E6641", c: "#F6F0E4" }, SUBMITTED: { bg: "#C8832A", c: "#1A1208" } };
  const p = m[(s || "").toUpperCase()] || m.PENDING;
  return <span style={{ background: p.bg, color: p.c, fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: 2, padding: "3px 10px", clipPath: "polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)", display: "inline-block", lineHeight: 1.7 }}>{(s || "").toUpperCase()}</span>;
};

const Btn = ({ children, onClick, variant = "primary", size = "md", full = false, disabled = false }) => {
  const [h, setH] = useState(false);
  const pad = { sm: "7px 16px", md: "11px 24px", lg: "14px 32px" }[size] || "11px 24px";
  const fs = { sm: 11, md: 13, lg: 15 }[size] || 13;
  const s = {
    primary: { bg: h && !disabled ? "#2C1E0A" : "var(--ink)", color: "var(--amber-on-ink)", border: "none" },
    secondary: { bg: h && !disabled ? "var(--parchment)" : "transparent", color: "var(--ink)", border: "1.5px solid var(--ink)" },
    danger: { bg: h && !disabled ? "#8A1818" : "var(--red)", color: "var(--cream-on-ink)", border: "none" },
    success: { bg: h && !disabled ? "#155230" : "var(--green)", color: "var(--cream-on-ink)", border: "none" },
    ghost: { bg: h && !disabled ? "var(--parchment)" : "transparent", color: "var(--amber-text)", border: "1.5px solid var(--rule)" },
  }[variant] || {};
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ padding: pad, background: s.bg, color: s.color, border: s.border || "none", fontFamily: "var(--font-display)", fontSize: fs, letterSpacing: 2, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1, width: full ? "100%" : "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .18s" }}
    >{children}</button>
  );
};

const Field = ({ label, type = "text", value, onChange, placeholder, error, readOnly }) => {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 3, color: "var(--muted)", textTransform: "uppercase", marginBottom: 7 }}>{label}</div>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
        onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
        style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${error ? "var(--red)" : foc ? "var(--amber)" : "var(--rule)"}`, background: readOnly ? "var(--parchment)" : foc ? "var(--surface)" : "var(--cream)", fontFamily: "var(--font-sans)", fontSize: 14, color: readOnly ? "var(--muted)" : "var(--ink)", outline: "none", transition: "border-color .18s" }} />
      {error && <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--red)", marginTop: 4 }}>{error}</div>}
    </div>
  );
};

const ROUTES = [
  { id: "A", name: "Route Alpha", stops: 8, from: "Library Square", to: "Main Campus" },
  { id: "B", name: "Route Beta", stops: 6, from: "Tech Park", to: "College Gate" },
  { id: "C", name: "Route Gamma", stops: 10, from: "Ring Road", to: "Main Campus" },
];

const PASS_TYPES = [
  { id: "monthly", name: "Monthly", price: 650, validity: "30 days" },
  { id: "quarterly", name: "Quarterly", price: 1215, validity: "90 days" },
  { id: "annual", name: "Annual", price: 6500, validity: "365 days" },
];

export default function ApplyPass() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    route: null,
    passType: null,
    reason: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleRouteSelect = (routeId) => {
    setFormData({ ...formData, route: routeId });
    setErrors({ ...errors, route: null });
  };

  const handlePassTypeSelect = (typeId) => {
    setFormData({ ...formData, passType: typeId });
    setErrors({ ...errors, passType: null });
  };

  const handleReasonChange = (e) => {
    setFormData({ ...formData, reason: e.target.value });
    setErrors({ ...errors, reason: null });
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1 && !formData.route) newErrors.route = "Please select a route";
    if (step === 2 && !formData.passType) newErrors.passType = "Please select a pass type";
    if (step === 3 && !formData.reason.trim()) newErrors.reason = "Please provide a reason";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < 4) setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (validateStep()) {
      setSubmitted(true);
      setTimeout(() => {
        window.location.hash = "#dashboard";
      }, 2000);
    }
  };

  const selectedRoute = ROUTES.find(r => r.id === formData.route);
  const selectedPassType = PASS_TYPES.find(p => p.id === formData.passType);

  if (submitted) {
    return (
      <div style={{ minHeight: "calc(100vh - 62px)", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 44px" }}>
        <div style={{ textAlign: "center", animation: "fadeUp .5s ease" }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: 32 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 80, color: "var(--green)", marginBottom: 16 }}>✓</div>
            <div style={{ position: "absolute", top: "50%", right: -30, transform: "translateY(-50%) rotate(-12deg)", border: "3px solid var(--green)", padding: "8px 16px", animation: "stampDrop .6s ease .3s both" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: 3, color: "var(--green)" }}>APPLIED</div>
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: 2, color: "var(--ink)", marginBottom: 12 }}>APPLICATION SUBMITTED</div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 16, color: "var(--muted)", fontStyle: "italic", marginBottom: 28, lineHeight: 1.6 }}>
            Your pass application has been submitted successfully.<br />We'll review and notify you within 24 hours.
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 2, color: "var(--amber)", marginBottom: 28 }}>Application #APP·2024·{Math.random().toString().slice(2, 8)}</div>
          <Btn variant="primary" size="md" onClick={() => window.location.hash = "#dashboard"}>← BACK TO DASHBOARD</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "calc(100vh - 62px)", background: "var(--cream)", padding: "40px 44px" }}>
      <style>{CSS}</style>

      <div style={{ maxWidth: 700, margin: "0 auto", animation: "fadeUp .4s ease" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <Tag>Apply for Pass</Tag>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 36, color: "var(--ink)", marginBottom: 12, lineHeight: 1.1 }}>
            Get Your Bus Pass
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>
            Complete these steps to apply for a new bus pass. It takes just 5 minutes.
          </div>

          {/* Step Indicator */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {[1, 2, 3, 4].map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: step >= s ? "var(--ink)" : "var(--parchment)",
                  border: `2px solid ${step === s ? "var(--amber)" : step > s ? "var(--ink)" : "var(--rule)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-display)",
                  color: step >= s ? "var(--amber-on-ink)" : "var(--muted)",
                  fontSize: 16,
                  fontWeight: 700,
                  transition: "all .3s",
                }}>
                  {step > s ? "✓" : s}
                </div>
                {s < 4 && <div style={{ width: 12, height: 2, background: step > s ? "var(--green)" : "var(--rule)", transition: "background .3s" }} />}
              </div>
            ))}
          </div>

          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: "var(--muted)", marginTop: 12 }}>
            STEP {step} OF 4
          </div>
        </div>

        {/* Step 1 — Route Selection */}
        {step === 1 && (
          <div style={{ animation: "fadeUp .3s ease" }}>
            <Tag>Step 1</Tag>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--ink)", marginBottom: 20 }}>Select Your Route</div>
            <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
              {ROUTES.map((route) => (
                <div
                  key={route.id}
                  onClick={() => handleRouteSelect(route.id)}
                  style={{
                    border: `2px solid ${formData.route === route.id ? "var(--amber)" : "var(--rule)"}`,
                    background: formData.route === route.id ? "var(--warn-bg)" : "var(--surface)",
                    padding: 20,
                    cursor: "pointer",
                    transition: "all .2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 1, color: "var(--ink)", marginBottom: 8 }}>
                        {route.name}
                      </div>
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)" }}>
                        {route.from} → {route.to} ({route.stops} stops)
                      </div>
                    </div>
                    {formData.route === route.id && <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--amber)" }}>✓</div>}
                  </div>
                </div>
              ))}
            </div>
            {errors.route && <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--red)", marginBottom: 16 }}>✕ {errors.route}</div>}
          </div>
        )}

        {/* Step 2 — Pass Type Selection */}
        {step === 2 && (
          <div style={{ animation: "fadeUp .3s ease" }}>
            <Tag>Step 2</Tag>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--ink)", marginBottom: 20 }}>Choose Pass Type</div>
            <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
              {PASS_TYPES.map((passType) => (
                <div
                  key={passType.id}
                  onClick={() => handlePassTypeSelect(passType.id)}
                  style={{
                    border: `2px solid ${formData.passType === passType.id ? "var(--green)" : "var(--rule)"}`,
                    background: formData.passType === passType.id ? "var(--success-bg)" : "var(--surface)",
                    padding: 20,
                    cursor: "pointer",
                    transition: "all .2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: 1, color: "var(--ink)", marginBottom: 4 }}>
                        {passType.name}
                      </div>
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)" }}>
                        Valid for {passType.validity}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: 1, color: "var(--ink)" }}>
                        ₹{passType.price}
                      </div>
                      {formData.passType === passType.id && <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--green)", marginTop: 4 }}>✓ SELECTED</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.passType && <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--red)", marginBottom: 16 }}>✕ {errors.passType}</div>}
          </div>
        )}

        {/* Step 3 — Reason for Travel */}
        {step === 3 && (
          <div style={{ animation: "fadeUp .3s ease" }}>
            <Tag>Step 3</Tag>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--ink)", marginBottom: 20 }}>Tell Us Your Reason</div>
            <Field
              label="Reason for applying"
              type="textarea"
              value={formData.reason}
              onChange={handleReasonChange}
              placeholder="e.g., Daily commute from home to college"
            />
            {formData.reason && !errors.reason && (
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--green)", marginBottom: 16 }}>✓ {formData.reason.length} characters</div>
            )}
            {errors.reason && <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--red)", marginBottom: 16 }}>✕ {errors.reason}</div>}
          </div>
        )}

        {/* Step 4 — Review & Submit */}
        {step === 4 && (
          <div style={{ animation: "fadeUp .3s ease" }}>
            <Tag>Step 4</Tag>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--ink)", marginBottom: 20 }}>Review Your Application</div>
            
            <div style={{ background: "var(--ink)", color: "var(--cream-on-ink)", padding: 24, marginBottom: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted-on-ink)", marginBottom: 8 }}>ROUTE</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 14 }}>
                    {selectedRoute?.name}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted-on-ink)", marginBottom: 8 }}>PASS TYPE</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 14 }}>
                    {selectedPassType?.name}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted-on-ink)", marginBottom: 8 }}>AMOUNT</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--amber-on-ink)" }}>
                    ₹{selectedPassType?.price}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted-on-ink)", marginBottom: 8 }}>VALIDITY</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 14 }}>
                    {selectedPassType?.validity}
                  </div>
                </div>
              </div>
              <Rule my={16} />
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 2, color: "var(--muted-on-ink)", marginBottom: 8 }}>REASON</div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.6 }}>
                  {formData.reason}
                </div>
              </div>
            </div>

            <div style={{ background: "var(--info-bg)", border: "1.5px solid var(--rule)", padding: 16, marginBottom: 24, borderLeft: "4px solid var(--ink)" }}>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink)", lineHeight: 1.6 }}>
                ◆ After submission, your application will be reviewed by the admin team. You'll receive a notification within 24 hours.
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <Rule my={26} />

        <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
          <Btn
            variant="secondary"
            size="md"
            onClick={handlePrevious}
            disabled={step === 1}
          >
            ← PREVIOUS
          </Btn>

          {step < 4 ? (
            <Btn
              variant="primary"
              size="md"
              onClick={handleNext}
            >
              NEXT →
            </Btn>
          ) : (
            <Btn
              variant="success"
              size="md"
              full
              onClick={handleSubmit}
            >
              ✓ SUBMIT APPLICATION
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}
