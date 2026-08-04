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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ monthly_budget: budget })
      });
      if (res.ok) {
        onAdded();
        onClose();
      } else {
        alert('Failed to update budget');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div className="animate-scale-in" style={{
        background: 'white', padding: '2.5rem', borderRadius: '24px',
        width: '100%', maxWidth: '400px', color: 'var(--text-primary)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
        border: '1px solid var(--border-color)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '0.5rem', fontWeight: '700', fontSize: '1.5rem', textAlign: 'center' }}>Set Monthly Budget</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center', fontSize: '0.95rem' }}>Track your spending against a goal.</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label className="auth-label">Monthly Limit (₹)</label>
            <input type="number" step="0.01" value={budget} onChange={e => setBudget(e.target.value)} required 
                   className="auth-input" style={{ fontSize: '1.2rem', fontWeight: '600', padding: '12px 14px' }} placeholder="0.00" />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1 }}>
              {loading ? 'Saving...' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
