import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Clock, RefreshCw, Download, FileText, ChevronRight } from 'lucide-react';
import { useRazorpay } from '../hooks/useRazorpay';
import api from '../services/api';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;700&family=Instrument+Sans:wght@400;500;600&display=swap');

.pay-btn-primary {
  background: var(--ink, #1A1208);
  color: var(--amber-on-ink, #F0A830);
  border: none;
  font-family: var(--font-display, 'Bebas Neue', sans-serif);
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.pay-btn-primary:hover:not(:disabled) {
  background: var(--ink-mid, #3D2410);
  transform: translateY(-1px);
}
.pay-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pay-btn-danger {
  background: var(--red, #B02020);
  color: var(--cream-on-ink, #F6F0E4);
}
.pay-btn-danger:hover:not(:disabled) {
  background: #8A1818;
}
`;

export const PaymentSummaryCard = ({ title, amountText, planText, features = [] }) => (
  <div style={{
    background: 'var(--cream, #F6F0E4)',
    border: '2px solid var(--ink, #1A1208)',
    padding: '32px',
    position: 'relative',
    boxShadow: '4px 4px 0 var(--ink, #1A1208)'
  }}>
    <style>{CSS}</style>
    <div style={{ marginBottom: '24px' }}>
      <div style={{ fontFamily: 'var(--font-mono, "JetBrains Mono")', fontSize: '10px', letterSpacing: '2px', color: 'var(--muted, #6B5535)', marginBottom: '8px' }}>
        SECURE CHECKOUT
      </div>
      <div style={{ fontFamily: 'var(--font-serif, "DM Serif Display")', fontSize: '28px', color: 'var(--ink, #1A1208)' }}>
        {title}
      </div>
      {planText && <div style={{ fontFamily: 'var(--font-sans, "Instrument Sans")', fontSize: '14px', fontStyle: 'italic', color: 'var(--muted, #6B5535)' }}>{planText}</div>}
    </div>

    <div style={{ borderTop: '1px dashed var(--ink, #1A1208)', borderBottom: '1px dashed var(--ink, #1A1208)', padding: '20px 0', margin: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display, "Bebas Neue")', fontSize: '20px', color: 'var(--ink, #1A1208)' }}>TOTAL PAYABLE</div>
      <div style={{ fontFamily: 'var(--font-display, "Bebas Neue")', fontSize: '42px', color: 'var(--amber-text, #8B520A)', lineHeight: 1 }}>{amountText}</div>
    </div>

    {features.length > 0 && (
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-sans, "Instrument Sans")', fontSize: '13px', color: 'var(--ink, #1A1208)' }}>
            <CheckCircle size={14} color="var(--green, #1E6641)" /> {f}
          </li>
        ))}
      </ul>
    )}

    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--parchment, #EDE4CC)', border: '1px solid var(--rule, #D4C4A0)' }}>
      <Shield size={16} color="var(--green, #1E6641)" />
      <span style={{ fontFamily: 'var(--font-mono, "JetBrains Mono")', fontSize: '10px', letterSpacing: '1px', color: 'var(--ink, #1A1208)' }}>100% SECURED BY RAZORPAY API</span>
    </div>
  </div>
);

export const PaymentButton = ({ 
  amount, 
  purpose, 
  metadata = {}, 
  onSuccess, 
  onFailure, 
  btnText = "PAY NOW", 
  full = false, 
  size = "md",
  disabled = false
}) => {
  const { openCheckout, loadScript } = useRazorpay();
  const [processing, setProcessing] = useState(false);

  useEffect(() => { loadScript(); }, [loadScript]);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const orderRes = await api.post('/payments/create-order/', { amount, purpose, metadata });
      const { order_id, key_id, amount: orderAmount, currency } = orderRes.data;

      const profileRes = await api.get('/auth/me/');
      const { full_name, email, phone_number } = profileRes.data || {};

      const options = {
        key: key_id,
        amount: orderAmount,
        currency: currency,
        name: "BusPassPro",
        description: purpose === "PASS_PURCHASE" ? "New Pass Application" : purpose === "PASS_RENEWAL" ? "Pass Extension" : "Wallet Top-up",
        order_id: order_id,
        prefill: {
          name: full_name || "Passenger",
          email: email || "passenger@example.com",
          contact: phone_number || "9999999999"
        },
        theme: { color: "#F59E0B" },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            if(onFailure) onFailure("Payment cancelled by user.");
          }
        },
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/payments/verify-payment/', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            setProcessing(false);
            if(onSuccess) onSuccess(verifyRes.data);
          } catch (err) {
            setProcessing(false);
            if(onFailure) onFailure("Signature verification failed.");
          }
        }
      };

      openCheckout(options);
    } catch (err) {
      setProcessing(false);
      console.error("Order creation failed", err);
      if(onFailure) onFailure("Failed to initialize payment gateway.");
    }
  };

  const fs = { sm: '13px', md: '16px', lg: '20px' };
  const pad = { sm: '8px 16px', md: '12px 24px', lg: '16px 32px' };

  return (
    <>
      <style>{CSS}</style>
      <button 
        className="pay-btn-primary"
        style={{ width: full ? '100%' : 'auto', fontSize: fs[size], padding: pad[size] }}
        onClick={handlePayment}
        disabled={disabled || processing}
      >
        {processing ? <RefreshCw size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
        {processing ? "PROCESSING..." : btnText}
      </button>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export const PaymentStatusModal = ({ status, message, onClose, onAction, actionText }) => {
  // status: 'SUCCESS' | 'FAILED' | 'PENDING'
  if (!status) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26,18,8,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
      <style>{CSS}</style>
      <div style={{ 
        background: status === 'FAILED' ? '#FDEAEA' : 'var(--surface, #FDFAF3)', 
        border: `3px solid ${status === 'FAILED' ? 'var(--red, #B02020)' : 'var(--ink, #1A1208)'}`,
        padding: '40px',
        maxWidth: '480px',
        width: '90%',
        position: 'relative',
        boxShadow: `12px 12px 0 ${status === 'FAILED' ? 'var(--red, #B02020)' : 'var(--ink, #1A1208)'}`,
        animation: 'slideUp 0.3s ease-out'
      }}>
        <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }`}</style>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-block', marginBottom: '16px' }}>
            {status === 'SUCCESS' && <CheckCircle size={64} color="var(--green, #1E6641)" />}
            {status === 'FAILED' && <XCircle size={64} color="var(--red, #B02020)" />}
            {status === 'PENDING' && <RefreshCw size={64} color="var(--amber, #C8832A)" style={{ animation: 'spin 2s linear infinite' }} />}
          </div>
          
          <div style={{ fontFamily: 'var(--font-display, "Bebas Neue")', fontSize: '48px', color: 'var(--ink, #1A1208)', lineHeight: 1, marginBottom: '8px' }}>
            {status === 'SUCCESS' && 'PAYMENT SUCCESSFUL'}
            {status === 'FAILED' && 'TRANSACTION FAILED'}
            {status === 'PENDING' && 'PROCESSING PAYMENT'}
          </div>
          
          <div style={{ fontFamily: 'var(--font-sans, "Instrument Sans")', fontSize: '15px', color: 'var(--muted, #6B5535)' }}>
            {message || (status === 'SUCCESS' ? 'Your transaction has been securely processed and recorded.' : status === 'FAILED' ? 'We could not process your payment. Please try again.' : 'Please wait while we confirm your payment securely...')}
          </div>
        </div>

        {status !== 'PENDING' && (
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            {onClose && (
              <button onClick={onClose} style={{ 
                background: 'transparent', border: '2px solid var(--ink, #1A1208)', padding: '12px 24px', 
                fontFamily: 'var(--font-display, "Bebas Neue")', fontSize: '18px', letterSpacing: '1px', cursor: 'pointer' 
              }}>CLOSE</button>
            )}
            {onAction && (
              <button className={status === 'FAILED' ? "pay-btn-primary" : "pay-btn-primary"} onClick={onAction} style={{ 
                padding: '12px 24px', fontFamily: 'var(--font-display, "Bebas Neue")', fontSize: '18px', letterSpacing: '1px', cursor: 'pointer' 
              }}>
                {actionText || (status === 'FAILED' ? 'TRY AGAIN' : 'DOWNLOAD RECEIPT')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const PaymentHistoryTable = ({ payments = [] }) => (
  <div style={{ width: '100%', overflowX: 'auto', border: '2px solid var(--ink, #1A1208)', background: 'var(--cream, #F6F0E4)' }}>
    <style>{CSS}</style>
    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
      <thead>
        <tr style={{ background: 'var(--ink, #1A1208)', color: 'var(--cream-on-ink, #F6F0E4)' }}>
          <th style={{ padding: '16px', fontFamily: 'var(--font-mono, "JetBrains Mono")', fontSize: '11px', letterSpacing: '2px' }}>DATE / TIME</th>
          <th style={{ padding: '16px', fontFamily: 'var(--font-mono, "JetBrains Mono")', fontSize: '11px', letterSpacing: '2px' }}>ORDER REF</th>
          <th style={{ padding: '16px', fontFamily: 'var(--font-mono, "JetBrains Mono")', fontSize: '11px', letterSpacing: '2px' }}>PURPOSE</th>
          <th style={{ padding: '16px', fontFamily: 'var(--font-mono, "JetBrains Mono")', fontSize: '11px', letterSpacing: '2px' }}>AMOUNT</th>
          <th style={{ padding: '16px', fontFamily: 'var(--font-mono, "JetBrains Mono")', fontSize: '11px', letterSpacing: '2px' }}>STATUS</th>
        </tr>
      </thead>
      <tbody>
        {payments.length === 0 ? (
          <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', fontFamily: 'var(--font-sans, "Instrument Sans")', color: 'var(--muted, #6B5535)' }}>No payment history found.</td></tr>
        ) : payments.map((p, i) => (
          <tr key={i} style={{ borderBottom: '1px solid var(--rule, #D4C4A0)' }}>
            <td style={{ padding: '16px', fontFamily: 'var(--font-mono, "JetBrains Mono")', fontSize: '13px' }}>{new Date(p.created_at).toLocaleString()}</td>
            <td style={{ padding: '16px', fontFamily: 'var(--font-mono, "JetBrains Mono")', fontSize: '13px', color: 'var(--ink-mid, #3D2410)' }}>{p.razorpay_order_id}</td>
            <td style={{ padding: '16px', fontFamily: 'var(--font-sans, "Instrument Sans")', fontSize: '14px', fontWeight: 500 }}>{p.purpose.replace('_', ' ')}</td>
            <td style={{ padding: '16px', fontFamily: 'var(--font-display, "Bebas Neue")', fontSize: '20px', color: 'var(--amber-text, #8B520A)' }}>₹{(p.amount / 100).toFixed(2)}</td>
            <td style={{ padding: '16px' }}>
              <span style={{ 
                fontFamily: 'var(--font-mono, "JetBrains Mono")', fontSize: '10px', padding: '4px 8px', letterSpacing: '1px', fontWeight: 'bold',
                background: p.status === 'PAID' ? 'var(--green, #1E6641)' : p.status === 'FAILED' ? 'var(--red, #B02020)' : p.status === 'REFUNDED' ? 'var(--muted, #6B5535)' : 'var(--amber, #C8832A)',
                color: p.status === 'CREATED' ? 'var(--ink, #1A1208)' : 'var(--cream-on-ink, #F6F0E4)',
              }}>
                {p.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
