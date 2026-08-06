import React, { useState } from 'react';
import { API_BASE_URL } from '../api';

export default function SetBudgetModal({ isOpen, onClose, onAdded, currentBudget }) {
  const [budget, setBudget] = useState(currentBudget || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/auth/update-budget/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ monthly_budget: budget })
      });
      if (res.ok) { onAdded(); onClose(); } 
      else { alert('Failed to update budget'); }
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const inputSt = { width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border-md)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-panel animate-scale-in" style={{ width: '90%', maxWidth: '400px', padding: '2rem' }}>
        <h2 style={{ margin: '0 0 0.5rem', fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, textAlign: 'center' }}>Set Monthly Budget</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '2rem', textAlign: 'center', fontSize: '0.85rem' }}>Track your spending against a goal.</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label className="auth-label">Monthly Limit (₹)</label>
            <input type="number" step="0.01" value={budget} onChange={e => setBudget(e.target.value)} required style={inputSt} placeholder="0.00"
              onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.boxShadow = 'none'; }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1 }}>{loading ? 'Saving...' : 'Save Budget'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
