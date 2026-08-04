import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

const AdjustSplitModal = ({ totalAmount, members, initialSplit, onSave, onClose }) => {
  const [tab, setTab] = useState(initialSplit?.type || 'equally');
  
  // State for Equally
  const [selectedMembers, setSelectedMembers] = useState(
    initialSplit?.type === 'equally' ? initialSplit.activeMembers : members.map(m => m.id)
  );

  // State for Unequally
  const [exactAmounts, setExactAmounts] = useState(
    initialSplit?.type === 'unequally' ? initialSplit.amounts : {}
  );

  // State for Percentages
  const [percentages, setPercentages] = useState(
    initialSplit?.type === 'percentages' ? initialSplit.percentages : {}
  );

  useEffect(() => {
    if (initialSplit?.type === 'equally') setSelectedMembers(initialSplit.activeMembers);
    if (initialSplit?.type === 'unequally') setExactAmounts(initialSplit.amounts || {});
    if (initialSplit?.type === 'percentages') setPercentages(initialSplit.percentages || {});
  }, [initialSplit]);

  const handleToggleMember = (id) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter(m => m !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  const handleAmountChange = (id, val) => {
    setExactAmounts({ ...exactAmounts, [id]: parseFloat(val) || 0 });
  };

  const handlePercentageChange = (id, val) => {
    setPercentages({ ...percentages, [id]: parseFloat(val) || 0 });
  };

  const handleSave = () => {
    const amount = parseFloat(totalAmount) || 0;

    if (tab === 'equally') {
      if (selectedMembers.length === 0) return alert('Select at least one person');
      onSave({ type: 'equally', activeMembers: selectedMembers });
    } else if (tab === 'unequally') {
      const total = Object.values(exactAmounts).reduce((a, b) => a + (b || 0), 0);
      if (Math.abs(total - amount) > 0.01) return alert(`Amounts must add up to exactly ${amount}`);
      onSave({ type: 'unequally', amounts: exactAmounts });
    } else if (tab === 'percentages') {
      const total = Object.values(percentages).reduce((a, b) => a + (b || 0), 0);
      if (Math.abs(total - 100) > 0.01) return alert('Percentages must add up to exactly 100%');
      onSave({ type: 'percentages', percentages });
    }
  };

  const renderEqually = () => {
    const amount = parseFloat(totalAmount) || 0;
    const splitAmount = selectedMembers.length > 0 ? (amount / selectedMembers.length).toFixed(2) : '0.00';

    return (
      <div style={{ marginTop: '20px' }}>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '24px' }}>
          Select which people owe an equal share.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {members.map(m => {
            const isSelected = selectedMembers.includes(m.id);
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                    {m.name[0].toUpperCase()}
                  </div>
                  <span style={{ color: '#1f2937', fontWeight: '500' }}>{m.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {isSelected && <span style={{ fontWeight: '600', color: '#1f2937' }}>₹ {splitAmount}</span>}
                  <div 
                    onClick={() => handleToggleMember(m.id)}
                    style={{
                      width: 24, height: 24, borderRadius: 4, 
                      backgroundColor: isSelected ? '#2563eb' : '#fff',
                      border: `2px solid ${isSelected ? '#2563eb' : '#d1d5db'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    {isSelected && <Check size={16} color="#fff" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderUnequally = () => {
    const amount = parseFloat(totalAmount) || 0;
    const totalAssigned = Object.values(exactAmounts).reduce((a, b) => a + (b || 0), 0);
    const left = (amount - totalAssigned).toFixed(2);

    return (
      <div style={{ marginTop: '20px' }}>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '24px' }}>
          Specify exactly how much each person owes.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {members.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                  {m.name[0].toUpperCase()}
                </div>
                <span style={{ color: '#1f2937', fontWeight: '500' }}>{m.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#4b5563', fontWeight: '500' }}>₹</span>
                <input 
                  type="number"
                  value={exactAmounts[m.id] === undefined ? '' : exactAmounts[m.id]}
                  onChange={e => handleAmountChange(m.id, e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: '80px', padding: '4px 0', border: 'none', borderBottom: '1px solid #d1d5db',
                    textAlign: 'right', fontSize: '1rem', outline: 'none', color: '#1f2937', fontWeight: '500'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <div style={{ fontWeight: 'bold', color: '#1f2937' }}>₹{totalAssigned.toFixed(2)} of ₹{amount.toFixed(2)}</div>
          <div style={{ color: left == 0 ? '#6b7280' : '#ef4444', fontSize: '0.9rem' }}>₹{left} left</div>
        </div>
      </div>
    );
  };

  const renderPercentages = () => {
    const amount = parseFloat(totalAmount) || 0;
    const totalAssigned = Object.values(percentages).reduce((a, b) => a + (b || 0), 0);
    const left = (100 - totalAssigned).toFixed(2);

    return (
      <div style={{ marginTop: '20px' }}>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '24px' }}>
          Split by percentages.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {members.map(m => {
            const p = percentages[m.id] || 0;
            const splitAmt = ((p / 100) * amount).toFixed(2);
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                    {m.name[0].toUpperCase()}
                  </div>
                  <span style={{ color: '#1f2937', fontWeight: '500' }}>{m.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>₹{splitAmt}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input 
                      type="number"
                      value={percentages[m.id] === undefined ? '' : percentages[m.id]}
                      onChange={e => handlePercentageChange(m.id, e.target.value)}
                      placeholder="0"
                      style={{
                        width: '50px', padding: '4px 0', border: 'none', borderBottom: '1px solid #d1d5db',
                        textAlign: 'right', fontSize: '1rem', outline: 'none', color: '#1f2937', fontWeight: '500'
                      }}
                    />
                    <span style={{ color: '#4b5563', fontWeight: '500' }}>%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{totalAssigned.toFixed(2)}% of 100%</div>
          <div style={{ color: left == 0 ? '#6b7280' : '#ef4444', fontSize: '0.9rem' }}>{left}% left</div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1100, padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px', width: '100%', maxWidth: '400px',
        position: 'relative', display: 'flex', flexDirection: 'column',
        maxHeight: '90vh'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}>
            <X size={24} />
          </button>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500', color: '#111827' }}>Adjust split</h2>
          <button onClick={handleSave} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}>
            <Check size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', padding: '0 8px' }}>
          {['equally', 'unequally', 'percentages'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '16px 0', background: 'none', border: 'none',
                borderBottom: `2px solid ${tab === t ? '#111827' : 'transparent'}`,
                color: tab === t ? '#111827' : '#6b7280',
                fontWeight: '500', cursor: 'pointer', textTransform: 'capitalize',
                fontSize: '0.9rem'
              }}
            >
              {t === 'percentages' ? 'By percentages' : t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto' }}>
          {tab === 'equally' && renderEqually()}
          {tab === 'unequally' && renderUnequally()}
          {tab === 'percentages' && renderPercentages()}
        </div>
      </div>
    </div>
  );
};

export default AdjustSplitModal;
