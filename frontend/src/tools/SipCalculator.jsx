import React, { useState } from 'react';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SipCalculator() {
  const navigate = useNavigate();
  const [monthlyInvestment, setMonthlyInvestment] = useState('5000');
  const [rate, setRate] = useState('12');
  const [years, setYears] = useState('10');

  const calcSip = () => {
    const P = parseFloat(monthlyInvestment) || 0;
    const i = (parseFloat(rate) || 0) / 100 / 12;
    const n = (parseFloat(years) || 0) * 12;
    const investedAmount = P * n;
    let maturityAmount = i !== 0 ? P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i) : investedAmount;
    const wealthGained = maturityAmount - investedAmount;
    return { invested: investedAmount.toFixed(0), wealthGained: wealthGained.toFixed(0), total: maturityAmount.toFixed(0) };
  };

  const res = calcSip();
  const inputSt = { width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border-md)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box', marginBottom: '1rem' };

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 5rem', minHeight: '100vh', background: 'var(--bg-deep)', position: 'relative' }}>
      <div className="bg-animation-wrapper"><div className="shape shape-1" style={{ opacity: 0.35 }} /></div>
      <div className="tools-header" style={{ marginBottom: '2rem' }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate('/tools')} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--text-primary)', padding: '8px', borderRadius: 'var(--radius-md)', display: 'flex' }}><ArrowLeft size={18} /></button>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp color="var(--accent-emerald)" size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>SIP Calculator</h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Estimate your SIP returns</div>
          </div>
        </div>
      </div>

      <div className="page-container" style={{ position: 'relative', zIndex: 1, maxWidth: '520px' }}>
        <div className="animate-slide-up card-solid" style={{ padding: '2rem', marginBottom: '1.25rem' }}>
          <label className="auth-label">Monthly Investment (₹)</label>
          <input type="number" style={inputSt} value={monthlyInvestment} onChange={e => setMonthlyInvestment(e.target.value)}
            onFocus={e => { e.target.style.borderColor = 'var(--accent-emerald)'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.boxShadow = 'none'; }} />
          <label className="auth-label">Expected Return Rate (%)</label>
          <input type="number" style={inputSt} value={rate} onChange={e => setRate(e.target.value)}
            onFocus={e => { e.target.style.borderColor = 'var(--accent-emerald)'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.boxShadow = 'none'; }} />
          <label className="auth-label">Time Period (Years)</label>
          <input type="number" style={{ ...inputSt, marginBottom: 0 }} value={years} onChange={e => setYears(e.target.value)}
            onFocus={e => { e.target.style.borderColor = 'var(--accent-emerald)'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.boxShadow = 'none'; }} />
        </div>

        <div className="animate-slide-up delay-100 card-solid" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.08))' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Results</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { label: 'Invested Amount', value: `₹${Number(res.invested).toLocaleString('en-IN')}`, color: 'var(--text-primary)' },
              { label: 'Wealth Gained', value: `₹${Number(res.wealthGained).toLocaleString('en-IN')}`, color: 'var(--accent-emerald)' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{r.label}</span>
                <span style={{ fontWeight: 700, color: r.color, fontSize: '0.95rem' }}>{r.value}</span>
              </div>
            ))}
            <div style={{ height: '1px', background: 'var(--glass-border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>Total Value</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em', background: 'var(--grad-emerald)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                ₹{Number(res.total).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
