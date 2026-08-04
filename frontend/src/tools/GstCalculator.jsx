import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GstCalculator() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('18');

  const calcGst = () => {
    const amt = parseFloat(amount) || 0;
    const r = parseFloat(rate) || 0;
    const gstAmount = (amt * r) / 100;
    return {
      gstAmount: gstAmount.toFixed(2),
      totalAmount: (amt + gstAmount).toFixed(2)
    };
  };

  const res = calcGst();

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/tools')} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ margin: 0 }}>GST Calculator</h2>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label className="auth-label">Amount</label>
          <input type="number" className="auth-input" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" />
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <label className="auth-label">GST Rate (%)</label>
          <select className="auth-input" value={rate} onChange={e => setRate(e.target.value)}>
            <option value="5">5%</option>
            <option value="12">12%</option>
            <option value="18">18%</option>
            <option value="28">28%</option>
          </select>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span>GST Amount:</span>
            <span style={{ fontWeight: '600' }}>₹{res.gstAmount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
            <span>Total Amount:</span>
            <span>₹{res.totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
