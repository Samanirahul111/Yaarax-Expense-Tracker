import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FdCalculator() {
  const navigate = useNavigate();
  const [totalInvestment, setTotalInvestment] = useState('100000');
  const [rate, setRate] = useState('6.5');
  const [years, setYears] = useState('5');

  const calcFd = () => {
    const P = parseFloat(totalInvestment) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const t = parseFloat(years) || 0;
    const n = 4; // Quarterly compounding
    
    // A = P(1 + r/n)^(nt)
    const maturityAmount = P * Math.pow(1 + (r / n), n * t);
    const estReturns = maturityAmount - P;

    return {
      invested: P.toFixed(0),
      estReturns: estReturns.toFixed(0),
      total: maturityAmount.toFixed(0)
    };
  };

  const res = calcFd();

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/tools')} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ margin: 0 }}>FD Calculator</h2>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label className="auth-label">Total Investment (₹)</label>
          <input type="number" className="auth-input" value={totalInvestment} onChange={e => setTotalInvestment(e.target.value)} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="auth-label">Interest Rate (% p.a)</label>
          <input type="number" className="auth-input" value={rate} onChange={e => setRate(e.target.value)} />
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <label className="auth-label">Time Period (Years)</label>
          <input type="number" className="auth-input" value={years} onChange={e => setYears(e.target.value)} />
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Invested Amount:</span>
            <span style={{ fontWeight: '600' }}>₹{Number(res.invested).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span>Est. Returns:</span>
            <span style={{ fontWeight: '600', color: '#16a34a' }}>₹{Number(res.estReturns).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
            <span>Total Value:</span>
            <span>₹{Number(res.total).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
