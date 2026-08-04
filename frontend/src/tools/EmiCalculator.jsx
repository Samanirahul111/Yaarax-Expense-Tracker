import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
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

    let emi = 0;
    if (r === 0) {
      emi = n > 0 ? P / n : 0;
    } else {
      emi = P * r * (Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
    }

    if (!isFinite(emi) || isNaN(emi)) emi = 0;

    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    return {
      emi: emi.toFixed(0),
      totalInterest: Math.max(0, totalInterest).toFixed(0),
      totalPayment: Math.max(0, totalPayment).toFixed(0),
      principal: P.toFixed(0)
    };
  };

  const res = calcEmi();

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/tools')} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ margin: 0 }}>EMI Calculator</h2>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label className="auth-label">Loan Amount (₹)</label>
          <input type="number" className="auth-input" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="auth-label">Interest Rate (% p.a.)</label>
          <input type="number" className="auth-input" step="0.1" value={interestRate} onChange={e => setInterestRate(e.target.value)} />
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <label className="auth-label">Tenure (Years)</label>
          <input type="number" className="auth-input" value={tenureYears} onChange={e => setTenureYears(e.target.value)} />
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Principal Amount:</span>
            <span style={{ fontWeight: '600' }}>₹{Number(res.principal).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span>Total Interest:</span>
            <span style={{ fontWeight: '600', color: '#ef4444' }}>₹{Number(res.totalInterest).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent-primary)', marginBottom: '1rem' }}>
            <span>Total Payment:</span>
            <span>₹{Number(res.totalPayment).toLocaleString()}</span>
          </div>
          
          <hr style={{ borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: '700', color: '#10b981' }}>
            <span>Monthly EMI:</span>
            <span>₹{Number(res.emi).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
