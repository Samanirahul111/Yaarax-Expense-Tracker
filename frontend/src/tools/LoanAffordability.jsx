import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
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

    // Max Loan = EMI / [ r * (1+r)^n / ((1+r)^n - 1) ]
    let maxLoan = 0;
    if (rMonthly > 0) {
      maxLoan = availableEmi * (Math.pow(1 + rMonthly, n) - 1) / (rMonthly * Math.pow(1 + rMonthly, n));
    } else {
      maxLoan = availableEmi * n;
    }

    return {
      maxLoan: maxLoan.toFixed(0),
      affordableEmi: availableEmi.toFixed(0)
    };
  };

  const res = calcLoan();

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/tools')} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ margin: 0 }}>Loan Affordability</h2>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label className="auth-label">Monthly Income (₹)</label>
          <input type="number" className="auth-input" value={monthlyIncome} onChange={e => setMonthlyIncome(e.target.value)} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="auth-label">Monthly Expenses & Obligations (₹)</label>
          <input type="number" className="auth-input" value={monthlyExpenses} onChange={e => setMonthlyExpenses(e.target.value)} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="auth-label">Expected Interest Rate (% p.a)</label>
          <input type="number" className="auth-input" value={rate} onChange={e => setRate(e.target.value)} />
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <label className="auth-label">Loan Tenure (Years)</label>
          <input type="number" className="auth-input" value={years} onChange={e => setYears(e.target.value)} />
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span>Affordable EMI:</span>
            <span style={{ fontWeight: '600' }}>₹{Number(res.affordableEmi).toLocaleString()} / month</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
            <span>Max Loan Amount:</span>
            <span>₹{Number(res.maxLoan).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
