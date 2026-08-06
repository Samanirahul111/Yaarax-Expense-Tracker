import React, { useState } from 'react';
import { X, Check, Receipt } from 'lucide-react';
import AdjustSplitModal from './AdjustSplitModal';
import { API_BASE_URL } from '../api';

const AddGroupExpenseModal = ({ groupId, groupName, members, onClose, onSuccess }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(members.length > 0 ? members[0].id : '');
  const [splitConfig, setSplitConfig] = useState({ type: 'equally', activeMembers: members.map(m => m.id) });
  const [showAdjustSplit, setShowAdjustSplit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount || !paidBy) return setError('Please fill in all fields');
    const numAmount = parseFloat(amount);
    let splits = [];
    if (splitConfig.type === 'equally') {
      if (splitConfig.activeMembers.length === 0) return setError('Select at least one person to split');
      splits = splitConfig.activeMembers.map(id => ({ member: id, amount_owed: numAmount / splitConfig.activeMembers.length }));
    } else if (splitConfig.type === 'unequally') {
      if (Math.abs(Object.values(splitConfig.amounts || {}).reduce((a, b) => a + b, 0) - numAmount) > 0.01) return setError('Unequal amounts do not add up to total');
      splits = Object.entries(splitConfig.amounts).map(([id, val]) => ({ member: parseInt(id), amount_owed: val }));
    } else if (splitConfig.type === 'percentages') {
      if (Math.abs(Object.values(splitConfig.percentages || {}).reduce((a, b) => a + b, 0) - 100) > 0.01) return setError('Percentages do not add up to 100%');
      splits = Object.entries(splitConfig.percentages).map(([id, val]) => ({ member: parseInt(id), amount_owed: (val / 100) * numAmount, percentage: val }));
    }

    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/group-expenses/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
        body: JSON.stringify({ group: groupId, paid_by: paidBy, description, amount, split_type: splitConfig.type, splits })
      });
      if (!res.ok) throw new Error('Failed to add expense');
      onSuccess();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const inputSt = { width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border-md)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' };
  const focus = e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; };
  const blur = e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.boxShadow = 'none'; };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-panel animate-scale-in" style={{ width: '90%', maxWidth: '420px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-elevated)', backdropFilter: 'blur(12px)' }}>
          <button onClick={onClose} style={{ background: 'var(--bg-glass)', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: 'var(--radius-sm)', display: 'flex' }}><X size={20} /></button>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>Add Group Expense</h2>
          <button onClick={handleSubmit} disabled={loading} style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', cursor: 'pointer', color: 'var(--accent-primary)', padding: '6px', borderRadius: 'var(--radius-sm)', display: 'flex' }}><Check size={20} /></button>
        </div>

        <div style={{ padding: '0.75rem 1.5rem', background: 'var(--bg-glass)', borderBottom: '1px solid var(--glass-border)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          With <strong>you</strong> and: <span style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Receipt size={14} /> All of {groupName || 'Group'}</span>
        </div>

        {error && <div style={{ color: 'var(--accent-rose)', background: 'rgba(244,63,94,0.12)', padding: '0.75rem', margin: '1rem 1.5rem 0', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', border: '1px solid rgba(244,63,94,0.25)' }}>{error}</div>}

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div><label className="auth-label">Description</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Dinner at XYZ" style={inputSt} onFocus={focus} onBlur={blur} /></div>
          <div><label className="auth-label">Amount (₹)</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" step="0.01" min="0" style={inputSt} onFocus={focus} onBlur={blur} /></div>

          <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-glass)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              Paid by 
              <select value={paidBy} onChange={e => setPaidBy(e.target.value)} style={{ padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'var(--bg-glass-md)', color: 'var(--text-primary)', cursor: 'pointer', outline: 'none' }}>
                {members.map(m => <option key={m.id} value={m.id} style={{ background: 'var(--bg-deep)' }}>{m.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              and split 
              <button onClick={() => setShowAdjustSplit(true)} style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'rgba(59,130,246,0.15)', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}>
                {splitConfig.type}
              </button>
            </div>
          </div>
        </div>
      </div>
      {showAdjustSplit && <AdjustSplitModal totalAmount={amount} members={members} initialSplit={splitConfig} onSave={ns => { setSplitConfig(ns); setShowAdjustSplit(false); }} onClose={() => setShowAdjustSplit(false)} />}
    </div>
  );
};

export default AddGroupExpenseModal;
