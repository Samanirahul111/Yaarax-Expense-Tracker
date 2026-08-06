import React, { useState, useEffect } from 'react';
import { PiggyBank, Plus, TrendingUp, Bell, Calendar, Edit2, Trash2 } from 'lucide-react';
import AddSavingsModal from './AddSavingsModal';
import { API_BASE_URL } from '../api';

const INV_COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#f43f5e','#06b6d4'];

export default function SavingsDashboard() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);

  const fetchInvestments = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/investments/`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch investments');
      setInvestments(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInvestments(); }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this investment?")) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/investments/${id}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) fetchInvestments();
      else alert("Failed to delete");
    } catch (e) { console.error(e); }
  };

  const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount_invested), 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcomingReminders = investments.filter(inv => inv.reminder_date).sort((a, b) => new Date(a.reminder_date) - new Date(b.reminder_date));

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--glass-border)', borderTop: '3px solid var(--accent-primary)', animation: 'spin-slow 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ paddingBottom: '5rem', background: 'var(--bg-deep)', minHeight: '100vh', position: 'relative' }}>
      <div className="bg-animation-wrapper">
        <div className="shape shape-1" style={{ opacity: 0.4 }} />
        <div className="shape shape-2" style={{ opacity: 0.3 }} />
      </div>

      <div className="tools-header" style={{ marginBottom: '2rem' }}>
        <div className="page-container flex-responsive-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PiggyBank color="var(--accent-emerald)" size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Savings & Investments</h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '1px' }}>Track your wealth growth</div>
            </div>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ padding: '0.5rem 1.125rem', fontSize: '0.875rem' }}>
            <Plus size={15} /> Add Investment
          </button>
        </div>
      </div>

      <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
        {error && <div style={{ background: 'rgba(244,63,94,0.12)', color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.25)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

        {/* Summary Row */}
        <div className="responsive-grid" style={{ marginBottom: '2rem' }}>
          <div className="animate-slide-up card-solid" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp size={24} color="var(--accent-emerald)" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Total Invested</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                ₹{totalInvested.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="animate-slide-up delay-100 card-solid" style={{ padding: '1.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem', fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700 }}>
              <Bell size={16} color="var(--accent-amber)" /> Upcoming Reminders
            </h4>
            {upcomingReminders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {upcomingReminders.slice(0, 3).map(inv => {
                  const isPast = new Date(inv.reminder_date) < today;
                  return (
                    <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.625rem', borderBottom: '1px solid var(--glass-border)' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{inv.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{inv.investment_type}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isPast ? 'var(--accent-rose)' : 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={13} /> {new Date(inv.reminder_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                        {isPast && <div style={{ fontSize: '0.7rem', color: 'var(--accent-rose)' }}>Past due!</div>}
                      </div>
                    </div>
                  );
                })}
                {upcomingReminders.length > 3 && <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--accent-primary)', cursor: 'pointer' }}>+{upcomingReminders.length - 3} more</div>}
              </div>
            ) : (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', margin: 0 }}>No upcoming reminders.</p>
            )}
          </div>
        </div>

        {/* Portfolio */}
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem' }}>Your Portfolio</h3>
        {investments.length === 0 ? (
          <div className="animate-scale-in card-solid" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <PiggyBank size={32} color="var(--accent-emerald)" />
            </div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>No investments yet</h3>
            <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Start tracking your wealth by adding your first investment.</p>
            <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ display: 'inline-flex' }}>
              <Plus size={16} /> Add First Investment
            </button>
          </div>
        ) : (
          <div className="responsive-grid">
            {investments.map((inv, idx) => {
              const color = INV_COLORS[idx % INV_COLORS.length];
              const currentVal = inv.current_value ? parseFloat(inv.current_value) : null;
              const invested = parseFloat(inv.amount_invested);
              const gain = currentVal ? currentVal - invested : null;
              const gainPct = gain ? ((gain / invested) * 100).toFixed(1) : null;
              return (
                <div key={inv.id} className="animate-slide-up card-solid" style={{ animationDelay: `${idx * 50}ms`, overflow: 'hidden', borderTop: `3px solid ${color}`, transition: 'transform 0.25s var(--ease-bounce), box-shadow 0.25s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-xl)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ padding: '1.25rem 1.25rem 0.875rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color, background: `${color}18`, border: `1px solid ${color}30`, padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', display: 'inline-block', marginBottom: '0.5rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        {inv.investment_type}
                      </div>
                      <h4 style={{ margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700 }}>{inv.name}</h4>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button onClick={(e) => { e.stopPropagation(); setEditingInvestment(inv); }} style={{ background: 'var(--bg-glass)', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--text-secondary)', padding: '5px', borderRadius: 'var(--radius-sm)', display: 'flex' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                        <Edit2 size={14} />
                      </button>
                      <button onClick={(e) => handleDelete(e, inv.id)} style={{ background: 'var(--bg-glass)', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--text-secondary)', padding: '5px', borderRadius: 'var(--radius-sm)', display: 'flex' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.15)'; e.currentTarget.style.color = 'var(--accent-rose)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.25rem', fontWeight: 500 }}>Invested</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.05rem' }}>₹{invested.toLocaleString('en-IN')}</div>
                    </div>
                    {currentVal && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.25rem', fontWeight: 500 }}>Current</div>
                        <div style={{ fontWeight: 700, color: gain >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontFamily: 'var(--font-heading)', fontSize: '1.05rem' }}>
                          ₹{currentVal.toLocaleString('en-IN')}
                        </div>
                        {gainPct && <div style={{ fontSize: '0.72rem', color: gain >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 600 }}>{gain >= 0 ? '+' : ''}{gainPct}%</div>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddModal && <AddSavingsModal onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); fetchInvestments(); }} />}
      {editingInvestment && <AddSavingsModal investmentToEdit={editingInvestment} onClose={() => setEditingInvestment(null)} onSuccess={() => { setEditingInvestment(null); fetchInvestments(); }} />}
    </div>
  );
}
