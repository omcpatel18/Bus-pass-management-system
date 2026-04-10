import React from 'react';

/**
 * PROTOTYPE: Font Size Increase
 * This file contains the updated CSS and base components with larger font sizes
 * to address readability issues.
 */

export const PROTOTYPE_CSS = `
:root {
  /* Original values with increases */
  --fs-xs: 12px;    /* was 8-10px */
  --fs-sm: 14px;    /* was 11-12px */
  --fs-md: 16px;    /* was 14px */
  --fs-lg: 20px;    /* was 18px */
  --fs-xl: 24px;    /* was 20px */
  --fs-2xl: 32px;   /* was 28px */
  --fs-display: 48px; /* was 40px */
  --fs-hero: 72px;    /* was 64px */
  
  --ls-nav: 2px;    /* tighter letter spacing for readability at larger sizes */
}

/* Base resets or overrides if needed */
body {
  font-size: var(--fs-md);
  line-height: 1.6;
}

/* Navigation specific */
.nav-link {
  font-size: var(--fs-sm) !important;
  letter-spacing: var(--ls-nav) !important;
}

/* Labels and Tags */
.label-tag {
  font-size: 11px !important; /* was 7-8px */
  letter-spacing: 2px !important; /* was 4-5px */
}
`;

export const PrototypePreview = () => {
  return (
    <div style={{ padding: '20px', background: '#F6F0E4', fontFamily: "'Instrument Sans', sans-serif" }}>
      <style>{PROTOTYPE_CSS}</style>
      
      <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'var(--fs-2xl)' }}>Typography Prototype</h1>
      <p style={{ fontSize: 'var(--fs-md)', color: '#1A1208' }}>
        This is how the new base font size (16px) looks compared to the previous 14px.
      </p>

      <div style={{ marginTop: '30px', borderTop: '1px solid #D4C4A0', paddingTop: '20px' }}>
        <div style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '3px', color: '#6B5535', marginBottom: '10px' }}>
          Navigation Example (was 10px, now 13px)
        </div>
        <nav style={{ display: 'flex', gap: '20px', background: '#1A1208', padding: '15px', color: '#F0A830', fontFamily: "'Bebas Neue', sans-serif" }}>
          <span style={{ fontSize: '16px', letterSpacing: '2px' }}>HOME</span>
          <span style={{ fontSize: '16px', letterSpacing: '2px' }}>GET PASS</span>
          <span style={{ fontSize: '16px', letterSpacing: '2px' }}>LIVE MAP</span>
        </nav>
      </div>

      <div style={{ marginTop: '30px' }}>
        <div style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '3px', color: '#6B5535', marginBottom: '10px' }}>
          Badge Example (was 7px, now 10px)
        </div>
        <div style={{ 
          display: 'inline-flex', padding: '4px 12px', background: '#1E6641', color: 'white', 
          fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '2px' 
        }}>
          R1 RED LINE
        </div>
      </div>
    </div>
  );
};
