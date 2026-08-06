import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { API_BASE_URL } from '../api';

export default function AddSavingsModal({ onClose, onSuccess, investmentToEdit }) {
  const [formData, setFormData] = useState({ investment_type: 'Mutual Fund', name: '', amount_invested: '', current_value: '', start_date: '', reminder_date: '', notes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
    if (!formData.name || !formData.amount_invested) { setError('Please fill out the name and amount invested.'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const payload = { ...formData, start_date: formData.start_date || null, reminder_date: formData.reminder_date || null, current_value: formData.current_value || null };
      const url = investmentToEdit ? `${API_BASE_URL}/api/investments/${investmentToEdit.id}/` : `${API_BASE_URL}/api/investments/`;
      const res = await fetch(url, { method: investmentToEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json().catch(()=>({}))).error || 'Failed to add investment');
      onSuccess();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const inputSt = { width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border-md)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' };
  const focus = e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; };
  const blur = e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.boxShadow = 'none'; };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-panel animate-scale-in" style={{ width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-elevated)', zIndex: 10, backdropFilter: 'blur(12px)' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>{investmentToEdit ? 'Edit Investment' : 'Add Investment'}</h2>
          <button onClick={onClose} style={{ background: 'var(--bg-glass)', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: 'var(--radius-sm)', display: 'flex' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div style={{ background: 'rgba(244,63,94,0.12)', color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.25)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>{error}</div>}
          
          <div><label className="auth-label">Type</label><select style={{ ...inputSt, cursor: 'pointer' }} value={formData.investment_type} onChange={e => setFormData({...formData, investment_type: e.target.value})} onFocus={focus} onBlur={blur}>{investmentTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label className="auth-label">Name / Details</label><input type="text" placeholder="e.g. HDFC Fixed Deposit" style={inputSt} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} onFocus={focus} onBlur={blur} /></div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}><label className="auth-label">Amount Invested (₹)</label><input type="number" min="0" step="0.01" style={inputSt} value={formData.amount_invested} onChange={e => setFormData({...formData, amount_invested: e.target.value})} onFocus={focus} onBlur={blur} /></div>
            <div style={{ flex: 1 }}><label className="auth-label">Current Value (₹) (Optional)</label><input type="number" min="0" step="0.01" style={inputSt} value={formData.current_value} onChange={e => setFormData({...formData, current_value: e.target.value})} onFocus={focus} onBlur={blur} /></div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}><label className="auth-label">Start Date</label><input type="date" style={inputSt} value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} onFocus={focus} onBlur={blur} /></div>
            <div style={{ flex: 1 }}><label className="auth-label">Reminder Date</label><input type="date" style={inputSt} value={formData.reminder_date} onChange={e => setFormData({...formData, reminder_date: e.target.value})} onFocus={focus} onBlur={blur} /></div>
          </div>
          
          <div><label className="auth-label">Notes (Optional)</label><textarea rows="3" style={{ ...inputSt, resize: 'vertical' }} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} onFocus={focus} onBlur={blur} /></div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>{loading ? 'Saving...' : <><Save size={18} /> Save Investment</>}</button>
        </form>
      </div>
    </div>
  );
}
