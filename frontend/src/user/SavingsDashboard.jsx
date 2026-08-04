import React, { useState, useEffect } from 'react';
import { PiggyBank, Plus, TrendingUp, Bell, Calendar, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import AddSavingsModal from './AddSavingsModal';
import { API_BASE_URL } from '../api';


export default function SavingsDashboard() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);

  const fetchInvestments = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/investments/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch investments');
      const data = await res.json();
      setInvestments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this investment?")) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/investments/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchInvestments();
      } else {
        alert("Failed to delete investment");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount_invested), 0);
  
  // Get upcoming reminders (next 30 days or past due)
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const upcomingReminders = investments.filter(inv => {
    if (!inv.reminder_date) return false;
    return true; // Show all reminders
  }).sort((a, b) => new Date(a.reminder_date) - new Date(b.reminder_date));

  return (
    <div style={{ paddingBottom: '4rem', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div className="tools-header" style={{ marginBottom: '2rem' }}>
        <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <PiggyBank size={28} color="white" />
            Savings & Investments
          </h2>
          <button 
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.5rem', background: 'white',
              color: 'var(--accent-primary)', border: 'none', borderRadius: '8px',
              fontWeight: '600', cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Plus size={20} />
            Add Investment
          </button>
        </div>
      </div>

      <div className="page-container">

      {error && <div style={{ color: 'red', marginBottom: '1rem', background: '#fee2e2', padding: '1rem', borderRadius: '8px' }}>{error}</div>}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '50%' }}>
            <TrendingUp size={24} color="#10b981" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 0.25rem 0', fontSize: '0.9rem', fontWeight: '500' }}>Total Invested</p>
            <h3 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--text-primary)' }}>₹{totalInvested.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        {/* Reminders Widget */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>
            <Bell size={20} color="#f59e0b" />
            Upcoming Reminders
          </h4>
          {upcomingReminders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {upcomingReminders.slice(0, 3).map(inv => {
                const isPast = new Date(inv.reminder_date) < today;
                return (
                  <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{inv.name}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{inv.investment_type}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: isPast ? '#ef4444' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={14} />
                        {new Date(inv.reminder_date).toLocaleDateString()}
                      </span>
                      {isPast && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>Past due!</span>}
                    </div>
                  </div>
                );
              })}
              {upcomingReminders.length > 3 && (
                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--accent-primary)', margin: 0, cursor: 'pointer' }}>+{upcomingReminders.length - 3} more</p>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>No upcoming reminders found.</p>
          )}
        </div>
      </div>

      {/* Investment List */}
      <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Your Portfolio</h3>
      {loading ? (
        <p>Loading your investments...</p>
      ) : investments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <PiggyBank size={64} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>No investments yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Start tracking your wealth by adding your first investment.</p>
          <button 
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '0.75rem 1.5rem', background: 'var(--bg-primary)',
              color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', 
              borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
            }}
          >
            Add First Investment
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {investments.map(inv => (
            <div key={inv.id} style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
              <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent-primary)', background: 'var(--bg-primary)', padding: '0.25rem 0.75rem', borderRadius: '16px', display: 'inline-block', marginBottom: '0.5rem' }}>
                    {inv.investment_type}
                  </span>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{inv.name}</h4>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={(e) => { e.stopPropagation(); setEditingInvestment(inv); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={(e) => handleDelete(e, inv.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Invested</p>
                  <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-primary)' }}>₹{parseFloat(inv.amount_invested).toLocaleString('en-IN')}</p>
                </div>
                {inv.current_value && (
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current Value</p>
                    <p style={{ margin: 0, fontWeight: '600', color: '#10b981' }}>₹{parseFloat(inv.current_value).toLocaleString('en-IN')}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddSavingsModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => {
            setShowAddModal(false);
            fetchInvestments();
          }} 
        />
      )}
      {editingInvestment && (
        <AddSavingsModal 
          investmentToEdit={editingInvestment}
          onClose={() => setEditingInvestment(null)} 
          onSuccess={() => {
            setEditingInvestment(null);
            fetchInvestments();
          }} 
        />
      )}
      </div>
    </div>
  );
}
