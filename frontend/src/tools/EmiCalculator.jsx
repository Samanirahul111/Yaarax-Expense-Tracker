import React, { useState } from 'react';
import { ArrowLeft, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmiCalculator() {
  const navigate = useNavigate();
  const [loanAmount, setLoanAmount] = useState('500000');
  const [interestRate, setInterestRate] = useState('8.5');
  const [tenureYears, setTenureYears] = useState('5');

  const calcEmi = () => {
    const P = parseFloat(loanAmount) || 0;
    const R = parseFloat(interestRate) || 0;
    const N = parseFloat(tenureYears) || 0;
    const r = R / 12 / 100;
    const n = N * 12;
    let emi = r === 0 ? (n > 0 ? P / n : 0) : P * r * (Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
    if (!isFinite(emi) || isNaN(emi)) emi = 0;
    const totalPayment = emi * n;
    return { emi: emi.toFixed(0), totalInterest: Math.max(0, totalPayment - P).toFixed(0), totalPayment: Math.max(0, totalPayment).toFixed(0), principal: P.toFixed(0) };
  };
  const res = calcEmi();
  const inputSt = { width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border-md)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box', marginBottom: '1rem' };

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 5rem', minHeight: '100vh', background: 'var(--bg-deep)', position: 'relative' }}>
      <div className="bg-animation-wrapper"><div className="shape shape-2" style={{ opacity: 0.35 }} /></div>
      <div className="tools-header" style={{ marginBottom: '2rem' }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate('/tools')} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--text-primary)', padding: '8px', borderRadius: 'var(--radius-md)', display: 'flex' }}><ArrowLeft size={18} /></button>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calculator color="var(--accent-cyan)" size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>EMI Calculator</h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Calculate your monthly EMI</div>
          </div>
        </div>
      </div>
      <div className="page-container" style={{ position: 'relative', zIndex: 1, maxWidth: '520px' }}>
        <div className="animate-slide-up card-solid" style={{ padding: '2rem', marginBottom: '1.25rem' }}>
          {[['Loan Amount (₹)', loanAmount, setLoanAmount, 'number'], ['Interest Rate (% p.a.)', interestRate, setInterestRate, 'number'], ['Tenure (Years)', tenureYears, setTenureYears, 'number']].map(([label, val, setter, type], i, arr) => (
            <div key={i}>
              <label className="auth-label">{label}</label>
              <input type={type} step={label.includes('Rate') ? '0.1' : '1'} style={{ ...inputSt, marginBottom: i === arr.length - 1 ? 0 : '1rem' }} value={val} onChange={e => setter(e.target.value)}
                onFocus={e => { e.target.style.borderColor = 'var(--accent-cyan)'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.boxShadow = 'none'; }} />
            </div>
          ))}
        </div>
        <div className="animate-slide-up delay-100 card-solid" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(59,130,246,0.08))' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Results</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { label: 'Principal Amount', value: `₹${Number(res.principal).toLocaleString('en-IN')}`, color: 'var(--text-primary)' },
              { label: 'Total Interest', value: `₹${Number(res.totalInterest).toLocaleString('en-IN')}`, color: 'var(--accent-rose)' },
              { label: 'Total Payment', value: `₹${Number(res.totalPayment).toLocaleString('en-IN')}`, color: 'var(--accent-primary)' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{r.label}</span>
                <span style={{ fontWeight: 700, color: r.color, fontSize: '0.95rem' }}>{r.value}</span>
              </div>
            ))}
            <div style={{ height: '1px', background: 'var(--glass-border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>Monthly EMI</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--accent-emerald)' }}>₹{Number(res.emi).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
