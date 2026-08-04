import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
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
    let maturityAmount = 0;
    if (i !== 0) {
      maturityAmount = P * ( (Math.pow(1 + i, n) - 1) / i ) * (1 + i);
    } else {
      maturityAmount = investedAmount;
    }
    const wealthGained = maturityAmount - investedAmount;

    return {
      invested: investedAmount.toFixed(0),
      wealthGained: wealthGained.toFixed(0),
      total: maturityAmount.toFixed(0)
    };
  };

  const res = calcSip();

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/tools')} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ margin: 0 }}>SIP Calculator</h2>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label className="auth-label">Monthly Investment (₹)</label>
          <input type="number" className="auth-input" value={monthlyInvestment} onChange={e => setMonthlyInvestment(e.target.value)} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="auth-label">Expected Return Rate (%)</label>
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
            <span>Wealth Gained:</span>
            <span style={{ fontWeight: '600', color: '#16a34a' }}>₹{Number(res.wealthGained).toLocaleString()}</span>
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
