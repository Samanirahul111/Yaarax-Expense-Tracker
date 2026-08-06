import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

export default function AdjustSplitModal({ totalAmount, members, initialSplit, onSave, onClose }) {
  const [tab, setTab] = useState(initialSplit?.type || 'equally');
  const [selectedMembers, setSelectedMembers] = useState(initialSplit?.type === 'equally' ? initialSplit.activeMembers : members.map(m => m.id));
  const [exactAmounts, setExactAmounts] = useState(initialSplit?.type === 'unequally' ? initialSplit.amounts : {});
  const [percentages, setPercentages] = useState(initialSplit?.type === 'percentages' ? initialSplit.percentages : {});

  useEffect(() => {
    if (initialSplit?.type === 'equally') setSelectedMembers(initialSplit.activeMembers);
    if (initialSplit?.type === 'unequally') setExactAmounts(initialSplit.amounts || {});
    if (initialSplit?.type === 'percentages') setPercentages(initialSplit.percentages || {});
  }, [initialSplit]);

  const handleToggleMember = (id) => {
    if (selectedMembers.includes(id)) setSelectedMembers(selectedMembers.filter(m => m !== id));
    else setSelectedMembers([...selectedMembers, id]);
  };

  const handleAmountChange = (id, val) => setExactAmounts({ ...exactAmounts, [id]: parseFloat(val) || 0 });
  const handlePercentageChange = (id, val) => setPercentages({ ...percentages, [id]: parseFloat(val) || 0 });

  const handleSave = () => {
    const amount = parseFloat(totalAmount) || 0;
    if (tab === 'equally') {
      if (selectedMembers.length === 0) return alert('Select at least one person');
      onSave({ type: 'equally', activeMembers: selectedMembers });
    } else if (tab === 'unequally') {
      const total = Object.values(exactAmounts).reduce((a, b) => a + (b || 0), 0);
      if (Math.abs(total - amount) > 0.01) return alert(`Amounts must add up to exactly ₹${amount.toFixed(2)}`);
      onSave({ type: 'unequally', amounts: exactAmounts });
    } else if (tab === 'percentages') {
      const total = Object.values(percentages).reduce((a, b) => a + (b || 0), 0);
      if (Math.abs(total - 100) > 0.01) return alert('Percentages must add up to exactly 100%');
      onSave({ type: 'percentages', percentages });
    }
  };

  const inputSt = { width: '80px', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border-md)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box', textAlign: 'right' };
  const focus = e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; };
  const blur = e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.boxShadow = 'none'; };

  const renderEqually = () => {
    const amount = parseFloat(totalAmount) || 0;
    const splitAmount = selectedMembers.length > 0 ? (amount / selectedMembers.length).toFixed(2) : '0.00';
    return (
      <div style={{ marginTop: '1.25rem' }}>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Select which people owe an equal share.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {members.map(m => {
            const sel = selectedMembers.includes(m.id);
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: sel ? 'var(--bg-glass-md)' : 'transparent', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', transition: 'background 0.2s', border: `1px solid ${sel ? 'var(--glass-border-lg)' : 'transparent'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem', border: '2px solid rgba(255,255,255,0.1)' }}>{m.name[0].toUpperCase()}</div>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{m.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {sel && <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹ {splitAmount}</span>}
                  <div onClick={() => handleToggleMember(m.id)} style={{ width: 22, height: 22, borderRadius: 4, background: sel ? 'var(--accent-primary)' : 'var(--bg-glass-md)', border: `1px solid ${sel ? 'var(--accent-primary)' : 'var(--glass-border-md)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    {sel && <Check size={14} color="#fff" />}
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
      <div style={{ marginTop: '1.25rem' }}>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Specify exactly how much each person owes.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {members.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-glass-md)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem', border: '2px solid rgba(255,255,255,0.1)' }}>{m.name[0].toUpperCase()}</div>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{m.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>₹</span>
                <input type="number" value={exactAmounts[m.id] === undefined ? '' : exactAmounts[m.id]} onChange={e => handleAmountChange(m.id, e.target.value)} placeholder="0.00" style={inputSt} onFocus={focus} onBlur={blur} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{totalAssigned.toFixed(2)} of ₹{amount.toFixed(2)}</div>
          <div style={{ color: left == 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontSize: '0.9rem', marginTop: '0.25rem' }}>₹{left} left</div>
        </div>
      </div>
    );
  };

  const renderPercentages = () => {
    const amount = parseFloat(totalAmount) || 0;
    const totalAssigned = Object.values(percentages).reduce((a, b) => a + (b || 0), 0);
    const left = (100 - totalAssigned).toFixed(2);
    return (
      <div style={{ marginTop: '1.25rem' }}>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Split by percentages.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {members.map(m => {
            const p = percentages[m.id] || 0;
            const splitAmt = ((p / 100) * amount).toFixed(2);
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-glass-md)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem', border: '2px solid rgba(255,255,255,0.1)' }}>{m.name[0].toUpperCase()}</div>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{m.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>₹{splitAmt}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="number" value={percentages[m.id] === undefined ? '' : percentages[m.id]} onChange={e => handlePercentageChange(m.id, e.target.value)} placeholder="0" style={{ ...inputSt, width: '60px' }} onFocus={focus} onBlur={blur} />
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{totalAssigned.toFixed(2)}% of 100%</div>
          <div style={{ color: left == 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{left}% left</div>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ zIndex: 1100 }}>
      <div className="modal-panel animate-scale-in" style={{ width: '90%', maxWidth: '440px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-elevated)', backdropFilter: 'blur(12px)' }}>
          <button onClick={onClose} style={{ background: 'var(--bg-glass)', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: 'var(--radius-sm)', display: 'flex' }}><X size={20} /></button>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Adjust Split</h2>
          <button onClick={handleSave} style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', cursor: 'pointer', color: 'var(--accent-primary)', padding: '6px', borderRadius: 'var(--radius-sm)', display: 'flex' }}><Check size={20} /></button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-glass)' }}>
          {['equally', 'unequally', 'percentages'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? 'var(--accent-primary)' : 'transparent'}`, color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', fontSize: '0.85rem', transition: 'all 0.2s' }}>
              {t === 'percentages' ? 'By percentages' : t}
            </button>
          ))}
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          {tab === 'equally' && renderEqually()}
          {tab === 'unequally' && renderUnequally()}
          {tab === 'percentages' && renderPercentages()}
        </div>
      </div>
    </div>
  );
}
