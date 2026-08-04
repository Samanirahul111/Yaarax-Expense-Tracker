import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { API_BASE_URL } from '../api';


export default function AddSavingsModal({ onClose, onSuccess, investmentToEdit }) {
  const [formData, setFormData] = useState({
    investment_type: 'Mutual Fund',
    name: '',
    amount_invested: '',
    current_value: '',
    start_date: '',
    reminder_date: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (investmentToEdit) {
      setFormData({
        investment_type: investmentToEdit.investment_type || 'Mutual Fund',
        name: investmentToEdit.name || '',
        amount_invested: investmentToEdit.amount_invested || '',
        current_value: investmentToEdit.current_value || '',
        start_date: investmentToEdit.start_date ? investmentToEdit.start_date.split('T')[0] : '',
        reminder_date: investmentToEdit.reminder_date ? investmentToEdit.reminder_date.split('T')[0] : '',
        notes: investmentToEdit.notes || ''
      });
    }
  }, [investmentToEdit]);

  const investmentTypes = ['Mutual Fund', 'FD', 'Stocks', 'SIP', 'IPO', 'Real Estate', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.amount_invested) {
      setError('Please fill out the name and amount invested.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const payload = {
        ...formData,
        start_date: formData.start_date || null,
        reminder_date: formData.reminder_date || null,
        current_value: formData.current_value || null,
      };

      const url = investmentToEdit
        ? `${API_BASE_URL}/api/investments/${investmentToEdit.id}/`
        : `${API_BASE_URL}/api/investments/`;
      const method = investmentToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to add investment');
      }

      if (res.ok) {
        if (investmentToEdit) alert('edit successfully');
        onSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 100, padding: '1rem'
    }}>
      <div style={{
        background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{investmentToEdit ? 'Edit Investment' : 'Add Investment'}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Type</label>
            <select 
              value={formData.investment_type}
              onChange={e => setFormData({...formData, investment_type: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
            >
              {investmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Name / Details</label>
            <input 
              type="text" 
              placeholder="e.g. HDFC Fixed Deposit"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Amount Invested (₹)</label>
              <input 
                type="number" 
                min="0"
                step="0.01"
                value={formData.amount_invested}
                onChange={e => setFormData({...formData, amount_invested: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Current Value (₹) (Optional)</label>
              <input 
                type="number" 
                min="0"
                step="0.01"
                value={formData.current_value}
                onChange={e => setFormData({...formData, current_value: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Start Date</label>
              <input 
                type="date" 
                value={formData.start_date}
                onChange={e => setFormData({...formData, start_date: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Reminder / Due Date</label>
              <input 
                type="date" 
                value={formData.reminder_date}
                onChange={e => setFormData({...formData, reminder_date: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Notes (Optional)</label>
            <textarea 
              rows="3"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            style={{
              width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
              padding: '0.875rem', background: 'var(--accent-primary)', color: 'white', border: 'none',
              borderRadius: '8px', fontWeight: '600', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            <Save size={20} />
            {loading ? 'Saving...' : 'Save Investment'}
          </button>
        </form>
      </div>
    </div>
  );
}
