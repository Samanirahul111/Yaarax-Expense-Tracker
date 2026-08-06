import React, { useState } from 'react';
import { ArrowLeft, LineChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CompoundInterestCalculator() {
  const navigate = useNavigate();
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('10');
  const [years, setYears] = useState('5');
  const [frequency, setFrequency] = useState('1');

  const calcCompoundInterest = () => {
    const P = parseFloat(principal) || 0;
    const R = parseFloat(rate) || 0;
    const T = parseFloat(years) || 0;
    const n = parseInt(frequency, 10) || 1;
    const r = R / 100;
    let amount = P * Math.pow((1 + (r / n)), (n * T));
    if (!isFinite(amount) || isNaN(amount)) amount = P;
    const interest = amount - P;
    return { principal: P.toFixed(0), interest: Math.max(0, interest).toFixed(0), amount: Math.max(0, amount).toFixed(0) };
  };

  const res = calcCompoundInterest();
  const inputSt = { width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border-md)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box', marginBottom: '1rem' };
  const focus = e => { e.target.style.borderColor = 'var(--accent-rose)'; e.target.style.boxShadow = '0 0 0 3px rgba(244,63,94,0.15)'; };
  const blur = e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.boxShadow = 'none'; };

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 5rem', minHeight: '100vh', background: 'var(--bg-deep)', position: 'relative' }}>
      <div className="bg-animation-wrapper"><div className="shape shape-1" style={{ opacity: 0.35 }} /></div>
      <div className="tools-header" style={{ marginBottom: '2rem' }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate('/tools')} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--text-primary)', padding: '8px', borderRadius: 'var(--radius-md)', display: 'flex' }}><ArrowLeft size={18} /></button>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(244,63,94,0.2)', border: '1px solid rgba(244,63,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LineChart color="var(--accent-rose)" size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800 }}>Compound Interest</h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Watch your money grow</div>
          </div>
        </div>
      </div>
      <div className="page-container" style={{ position: 'relative', zIndex: 1, maxWidth: '520px' }}>
        <div className="animate-slide-up card-solid" style={{ padding: '2rem', marginBottom: '1.25rem' }}>
          <label className="auth-label">Principal Amount (₹)</label>
          <input type="number" style={inputSt} value={principal} onChange={e => setPrincipal(e.target.value)} onFocus={focus} onBlur={blur} />
          <label className="auth-label">Interest Rate (% p.a.)</label>
          <input type="number" step="0.1" style={inputSt} value={rate} onChange={e => setRate(e.target.value)} onFocus={focus} onBlur={blur} />
          <label className="auth-label">Time Period (Years)</label>
          <input type="number" style={inputSt} value={years} onChange={e => setYears(e.target.value)} onFocus={focus} onBlur={blur} />
          <label className="auth-label">Compounding Frequency</label>
          <select style={{ ...inputSt, cursor: 'pointer', marginBottom: 0 }} value={frequency} onChange={e => setFrequency(e.target.value)} onFocus={focus} onBlur={blur}>
            <option value="1">Yearly</option>
            <option value="2">Half-Yearly</option>
            <option value="4">Quarterly</option>
            <option value="12">Monthly</option>
          </select>
        </div>
        <div className="animate-slide-up delay-100 card-solid" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(244,63,94,0.1), rgba(139,92,246,0.08))' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Results</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { label: 'Principal Amount', value: `₹${Number(res.principal).toLocaleString('en-IN')}`, color: 'var(--text-primary)' },
              { label: 'Interest Earned', value: `₹${Number(res.interest).toLocaleString('en-IN')}`, color: 'var(--accent-emerald)' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{r.label}</span>
                <span style={{ fontWeight: 700, color: r.color }}>{r.value}</span>
              </div>
            ))}
            <div style={{ height: '1px', background: 'var(--glass-border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>Total Value</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--accent-rose)' }}>₹{Number(res.amount).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
