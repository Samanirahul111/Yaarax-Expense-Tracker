import React, { useState } from 'react';
import { X, Check, Receipt } from 'lucide-react';
import AdjustSplitModal from './AdjustSplitModal';
import { API_BASE_URL } from '../api';


const AddGroupExpenseModal = ({ groupId, groupName, members, onClose, onSuccess }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(members.length > 0 ? members[0].id : '');
  
  // splitConfig defaults to equally among all members
  const [splitConfig, setSplitConfig] = useState({
    type: 'equally',
    activeMembers: members.map(m => m.id)
  });
  
  const [showAdjustSplit, setShowAdjustSplit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount || !paidBy) {
      setError('Please fill in all fields');
      return;
    }

    const numAmount = parseFloat(amount);
    
    // Validate split logic before sending
    let splits = [];
    if (splitConfig.type === 'equally') {
      if (splitConfig.activeMembers.length === 0) return setError('Select at least one person to split');
      const share = numAmount / splitConfig.activeMembers.length;
      splits = splitConfig.activeMembers.map(id => ({ member: id, amount_owed: share }));
    } else if (splitConfig.type === 'unequally') {
      const totalAssigned = Object.values(splitConfig.amounts || {}).reduce((a, b) => a + b, 0);
      if (Math.abs(totalAssigned - numAmount) > 0.01) return setError('Unequal amounts do not add up to total');
      splits = Object.entries(splitConfig.amounts).map(([id, val]) => ({ member: parseInt(id), amount_owed: val }));
    } else if (splitConfig.type === 'percentages') {
      const totalP = Object.values(splitConfig.percentages || {}).reduce((a, b) => a + b, 0);
      if (Math.abs(totalP - 100) > 0.01) return setError('Percentages do not add up to 100%');
      splits = Object.entries(splitConfig.percentages).map(([id, val]) => ({ 
        member: parseInt(id), 
        amount_owed: (val / 100) * numAmount,
        percentage: val
      }));
    }

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/group-expenses/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          group: groupId,
          paid_by: paidBy,
          description,
          amount,
          split_type: splitConfig.type,
          splits
        })
      });

      if (!res.ok) {
        throw new Error('Failed to add expense');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPaidByName = () => {
    const member = members.find(m => m.id == paidBy);
    return member ? member.name : 'someone';
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        width: '100%', maxWidth: '400px',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}>
            <X size={24} />
          </button>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500', color: '#111827' }}>Add expense</h2>
          <button onClick={handleSubmit} disabled={loading} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}>
            <Check size={24} />
          </button>
        </div>

        <div style={{ padding: '16px 20px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: '0.9rem' }}>
          With <strong>you</strong> and: <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Receipt size={14} /> All of {groupName || 'Group'}</span>
        </div>

        {error && (
          <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px', margin: '20px 20px 0', borderRadius: '8px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <div style={{ padding: '30px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '8px', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={24} color="#6b7280" />
            </div>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description"
              style={{
                flex: 1, padding: '8px 0', border: 'none', borderBottom: '2px solid #2563eb',
                fontSize: '1.1rem', outline: 'none', color: '#111827'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '8px', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#6b7280' }}>
              ₹
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01" min="0"
              style={{
                flex: 1, padding: '8px 0', border: 'none', borderBottom: '1px solid #d1d5db',
                fontSize: '1.8rem', outline: 'none', color: '#111827'
              }}
            />
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.95rem', color: '#4b5563' }}>
            Paid by{' '}
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              style={{
                padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db',
                backgroundColor: '#fff', color: '#111827', cursor: 'pointer',
                margin: '0 4px', fontSize: '0.95rem'
              }}
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {' '}and split{' '}
            <button
              onClick={() => setShowAdjustSplit(true)}
              style={{
                padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db',
                backgroundColor: '#fff', color: '#111827', cursor: 'pointer',
                margin: '0 4px', fontSize: '0.95rem'
              }}
            >
              {splitConfig.type}
            </button>
          </div>
        </div>
      </div>

      {showAdjustSplit && (
        <AdjustSplitModal 
          totalAmount={amount}
          members={members}
          initialSplit={splitConfig}
          onSave={(newSplit) => {
            setSplitConfig(newSplit);
            setShowAdjustSplit(false);
          }}
          onClose={() => setShowAdjustSplit(false)}
        />
      )}
    </div>
  );
};

export default AddGroupExpenseModal;

