import React, { useState } from 'react';
import { ArrowLeft, Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GstCalculator() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('18');
  const calcGst = () => {
    const amt = parseFloat(amount) || 0;
    const r = parseFloat(rate) || 0;
    const gstAmount = (amt * r) / 100;
    return { gstAmount: gstAmount.toFixed(2), totalAmount: (amt + gstAmount).toFixed(2) };
  };
  const res = calcGst();
  const inputSt = { width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border-md)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box', marginBottom: '1rem' };
  const focusSt = { borderColor: 'var(--accent-primary)', boxShadow: '0 0 0 3px rgba(59,130,246,0.15)' };
  const blurSt = { borderColor: 'var(--glass-border-md)', boxShadow: 'none' };
  return (
    <div className="animate-fade-in" style={{ padding: '0 0 5rem', minHeight: '100vh', background: 'var(--bg-deep)', position: 'relative' }}>
      <div className="bg-animation-wrapper"><div className="shape shape-1" style={{ opacity: 0.35 }} /></div>
      <div className="tools-header" style={{ marginBottom: '2rem' }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate('/tools')} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--text-primary)', padding: '8px', borderRadius: 'var(--radius-md)', display: 'flex' }}><ArrowLeft size={18} /></button>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Landmark color="var(--accent-primary)" size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>GST Calculator</h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Calculate GST on products & services</div>
          </div>
        </div>
      </div>
      <div className="page-container" style={{ position: 'relative', zIndex: 1, maxWidth: '520px' }}>
        <div className="animate-slide-up card-solid" style={{ padding: '2rem', marginBottom: '1.25rem' }}>
          <label className="auth-label">Amount (₹)</label>
          <input type="number" style={inputSt} value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" onFocus={e => Object.assign(e.target.style, focusSt)} onBlur={e => Object.assign(e.target.style, blurSt)} />
          <label className="auth-label">GST Rate</label>
          <select style={{ ...inputSt, cursor: 'pointer', marginBottom: 0 }} value={rate} onChange={e => setRate(e.target.value)} onFocus={e => Object.assign(e.target.style, focusSt)} onBlur={e => Object.assign(e.target.style, blurSt)}>
            {['5','12','18','28'].map(r => <option key={r} value={r}>{r}%</option>)}
          </select>
        </div>
        <div className="animate-slide-up delay-100 card-solid" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.08))' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Results</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>GST Amount</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-amber)', fontSize: '0.95rem' }}>₹{res.gstAmount}</span>
            </div>
            <div style={{ height: '1px', background: 'var(--glass-border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>Total Amount</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em', background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>₹{res.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
