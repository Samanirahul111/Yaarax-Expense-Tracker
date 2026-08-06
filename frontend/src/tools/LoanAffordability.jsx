import React, { useState } from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LoanAffordability() {
  const navigate = useNavigate();
  const [monthlyIncome, setMonthlyIncome] = useState('80000');
  const [monthlyExpenses, setMonthlyExpenses] = useState('30000');
  const [rate, setRate] = useState('9.5');
  const [years, setYears] = useState('20');

  const calcLoan = () => {
    const inc = parseFloat(monthlyIncome) || 0;
    const exp = parseFloat(monthlyExpenses) || 0;
    const rAnnual = parseFloat(rate) || 0;
    const t = parseFloat(years) || 0;
    const availableEmi = inc - exp;
    if (availableEmi <= 0) return { maxLoan: 0, affordableEmi: 0 };
    const rMonthly = rAnnual / 100 / 12;
    const n = t * 12;
    let maxLoan = rMonthly > 0 ? availableEmi * (Math.pow(1 + rMonthly, n) - 1) / (rMonthly * Math.pow(1 + rMonthly, n)) : availableEmi * n;
    return { maxLoan: maxLoan.toFixed(0), affordableEmi: availableEmi.toFixed(0) };
  };

  const res = calcLoan();
  const inputSt = { width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border-md)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box', marginBottom: '1rem' };
  const focus = e => { e.target.style.borderColor = 'var(--accent-violet)'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)'; };
  const blur = e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.boxShadow = 'none'; };

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 5rem', minHeight: '100vh', background: 'var(--bg-deep)', position: 'relative' }}>
      <div className="bg-animation-wrapper"><div className="shape shape-2" style={{ opacity: 0.35 }} /></div>
      <div className="tools-header" style={{ marginBottom: '2rem' }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate('/tools')} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--text-primary)', padding: '8px', borderRadius: 'var(--radius-md)', display: 'flex' }}><ArrowLeft size={18} /></button>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard color="var(--accent-violet)" size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800 }}>Loan Affordability</h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Find how much loan you can afford</div>
          </div>
        </div>
      </div>
      <div className="page-container" style={{ position: 'relative', zIndex: 1, maxWidth: '520px' }}>
        <div className="animate-slide-up card-solid" style={{ padding: '2rem', marginBottom: '1.25rem' }}>
          {[
            ['Monthly Income (₹)', monthlyIncome, setMonthlyIncome],
            ['Monthly Expenses & Obligations (₹)', monthlyExpenses, setMonthlyExpenses],
            ['Expected Interest Rate (% p.a.)', rate, setRate],
            ['Loan Tenure (Years)', years, setYears],
          ].map(([label, val, setter], i, arr) => (
            <div key={i}>
              <label className="auth-label">{label}</label>
              <input type="number" step="0.1" style={{ ...inputSt, marginBottom: i === arr.length - 1 ? 0 : '1rem' }} value={val} onChange={e => setter(e.target.value)} onFocus={focus} onBlur={blur} />
            </div>
          ))}
        </div>
        <div className="animate-slide-up delay-100 card-solid" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Results</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Affordable EMI</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{Number(res.affordableEmi).toLocaleString('en-IN')} / month</span>
            </div>
            <div style={{ height: '1px', background: 'var(--glass-border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>Max Loan Amount</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                ₹{Number(res.maxLoan).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
