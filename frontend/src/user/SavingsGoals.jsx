import React, { useState, useEffect, useCallback } from 'react';
import { Target, Plus, CheckCircle, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { API_BASE_URL } from '../api';

export default function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFundsGoal, setAddFundsGoal] = useState(null);
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [formData, setFormData] = useState({ name: '', target_amount: '', current_amount: '0', deadline: '' });

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/savings-goals/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setGoals(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchGoals(); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/savings-goals/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          target_amount: parseFloat(formData.target_amount),
          current_amount: parseFloat(formData.current_amount) || 0
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({ name: '', target_amount: '', current_amount: '0', deadline: '' });
        fetchGoals();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    if (!addFundsGoal || !addFundsAmount) return;
    try {
      const token = localStorage.getItem('access_token');
      const newAmount = parseFloat(addFundsGoal.current_amount) + parseFloat(addFundsAmount);
      const res = await fetch(`${API_BASE_URL}/api/savings-goals/${addFundsGoal.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ current_amount: newAmount })
      });
      if (res.ok) {
        setAddFundsGoal(null);
        setAddFundsAmount('');
        if (newAmount >= parseFloat(addFundsGoal.target_amount)) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
          });
        }
        fetchGoals();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this goal?")) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/savings-goals/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchGoals();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>


      {/* Manual Savings Goals Section */}
      <div className="flex-responsive-header" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target color="var(--accent-primary)" /> Manual Savings Goals
        </h2>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, boxShadow: 'var(--shadow-md)' }}
        >
          <Plus size={18} /> Add Goal
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {goals.map(goal => {
          const progress = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
          return (
            <div key={goal.id} style={{ background: 'var(--bg-glass)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', position: 'relative' }}>
              <button onClick={() => handleDelete(goal.id)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', opacity: 0.7 }}><Trash2 size={18} /></button>
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>{goal.name}</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                {/* Circular Progress */}
                <div style={{ position: 'relative', width: '70px', height: '70px', flexShrink: 0 }}>
                  <svg width="70" height="70" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke={progress >= 100 ? 'var(--accent-emerald)' : 'var(--accent-primary)'} strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * progress) / 100} style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} strokeLinecap="round" />
                  </svg>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {progress}%
                  </div>
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span>Saved</span>
                    <span>Target</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <span style={{ color: progress >= 100 ? 'var(--accent-emerald)' : 'var(--accent-primary)', fontSize: '1.1rem' }}>₹{parseFloat(goal.current_amount).toLocaleString()}</span>
                    <span style={{ fontSize: '1.1rem' }}>₹{parseFloat(goal.target_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>
                  {goal.deadline ? `Deadline: ${goal.deadline}` : 'No deadline'}
                </span>
                {progress >= 100 && (
                  <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                    <CheckCircle size={14} /> Reached!
                  </span>
                )}
              </div>
              
              {progress < 100 && (
                <button onClick={() => setAddFundsGoal(goal)} style={{ width: '100%', marginTop: '1rem', padding: '0.625rem', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: 'var(--accent-primary)', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-primary)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}>
                  <Plus size={16} /> Add Funds
                </button>
              )}
            </div>
          );
        })}
        {goals.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--glass-border)' }}>
            <Target size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No savings goals yet. Start saving today!</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-deep)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-2xl)', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow-2xl)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Add Savings Goal</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Goal Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', color: 'white', outline: 'none' }} placeholder="e.g. New Car" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Target Amount (₹)</label>
                <input required type="number" step="0.01" value={formData.target_amount} onChange={e => setFormData({...formData, target_amount: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', color: 'white', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Already Saved (₹)</label>
                <input type="number" step="0.01" value={formData.current_amount} onChange={e => setFormData({...formData, current_amount: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', color: 'white', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Deadline (Optional)</label>
                <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', color: 'white', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-lg)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '0.75rem', background: 'var(--accent-primary)', border: 'none', color: 'white', borderRadius: 'var(--radius-lg)', cursor: 'pointer', fontWeight: 600 }}>Save Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addFundsGoal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="animate-slide-up" style={{ background: 'var(--bg-deep)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-2xl)', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow-2xl)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Add Funds to {addFundsGoal.name}</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Target: ₹{parseFloat(addFundsGoal.target_amount).toLocaleString()} | Current: ₹{parseFloat(addFundsGoal.current_amount).toLocaleString()}</p>
            <form onSubmit={handleAddFunds} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Amount to Add (₹)</label>
                <input required autoFocus type="number" step="0.01" value={addFundsAmount} onChange={e => setAddFundsAmount(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', color: 'white', outline: 'none' }} placeholder="e.g. 500" />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => { setAddFundsGoal(null); setAddFundsAmount(''); }} style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-lg)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '0.75rem', background: 'var(--accent-primary)', border: 'none', color: 'white', borderRadius: 'var(--radius-lg)', cursor: 'pointer', fontWeight: 600 }}>Add Funds</button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
