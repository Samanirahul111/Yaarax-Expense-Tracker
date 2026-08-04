import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CompoundInterestCalculator() {
  const navigate = useNavigate();
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('10');
  const [years, setYears] = useState('5');
  const [frequency, setFrequency] = useState('1'); // 1 = yearly, 12 = monthly

  const calcCompoundInterest = () => {
    const P = parseFloat(principal) || 0;
    const R = parseFloat(rate) || 0;
    const T = parseFloat(years) || 0;
    const n = parseInt(frequency, 10) || 1;

    // A = P(1 + r/n)^(nt)
    const r = R / 100;
    
    let amount = P * Math.pow((1 + (r / n)), (n * T));
    
    if (!isFinite(amount) || isNaN(amount)) amount = P;
    
    const interest = amount - P;

    return {
      principal: P.toFixed(0),
      interest: Math.max(0, interest).toFixed(0),
      amount: Math.max(0, amount).toFixed(0)
    };
  };

  const res = calcCompoundInterest();

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/tools')} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ margin: 0 }}>Compound Interest</h2>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label className="auth-label">Principal Amount (₹)</label>
          <input type="number" className="auth-input" value={principal} onChange={e => setPrincipal(e.target.value)} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="auth-label">Interest Rate (% p.a.)</label>
          <input type="number" className="auth-input" step="0.1" value={rate} onChange={e => setRate(e.target.value)} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="auth-label">Time Period (Years)</label>
          <input type="number" className="auth-input" value={years} onChange={e => setYears(e.target.value)} />
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <label className="auth-label">Compounding Frequency</label>
          <select 
            className="auth-input" 
            value={frequency} 
            onChange={e => setFrequency(e.target.value)}
            style={{ appearance: 'auto' }}
          >
            <option value="1">Yearly</option>
            <option value="2">Half-Yearly</option>
            <option value="4">Quarterly</option>
            <option value="12">Monthly</option>
          </select>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Principal Amount:</span>
            <span style={{ fontWeight: '600' }}>₹{Number(res.principal).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span>Interest Earned:</span>
            <span style={{ fontWeight: '600', color: '#16a34a' }}>₹{Number(res.interest).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
            <span>Total Value:</span>
            <span>₹{Number(res.amount).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
