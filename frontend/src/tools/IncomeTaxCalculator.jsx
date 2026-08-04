import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function IncomeTaxCalculator() {
  const navigate = useNavigate();
  const [income, setIncome] = useState('800000');

  const calcTax = () => {
    const inc = parseFloat(income) || 0;
    let tax = 0;
    // Simplified New Tax Regime logic for demo purposes
    if (inc <= 300000) {
      tax = 0;
    } else if (inc <= 600000) {
      tax = (inc - 300000) * 0.05;
    } else if (inc <= 900000) {
      tax = 15000 + (inc - 600000) * 0.10;
    } else if (inc <= 1200000) {
      tax = 45000 + (inc - 900000) * 0.15;
    } else if (inc <= 1500000) {
      tax = 90000 + (inc - 1200000) * 0.20;
    } else {
      tax = 150000 + (inc - 1500000) * 0.30;
    }
    
    // Section 87A rebate (up to 7L income has 0 tax in new regime usually, simplifying here)
    if (inc <= 700000) {
      tax = 0;
    }

    const cess = tax * 0.04;
    const totalTax = tax + cess;

    return {
      totalTax: totalTax.toFixed(0),
      takeHome: (inc - totalTax).toFixed(0)
    };
  };

  const res = calcTax();

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/tools')} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ margin: 0 }}>Income Tax Calculator</h2>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <label className="auth-label">Total Annual Income (₹)</label>
          <input type="number" className="auth-input" value={income} onChange={e => setIncome(e.target.value)} />
          <small style={{ color: 'var(--text-secondary)' }}>Note: This provides a simplified estimate based on the new tax regime (2023-24).</small>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span>Estimated Tax (inc. Cess):</span>
            <span style={{ fontWeight: '600', color: '#ef4444' }}>₹{Number(res.totalTax).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
            <span>Take Home Income:</span>
            <span>₹{Number(res.takeHome).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
