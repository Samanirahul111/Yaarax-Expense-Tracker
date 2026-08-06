import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Edit2, Trash2, Receipt, Plus } from 'lucide-react';
import AddExpenseModal from './AddExpenseModal';
import { API_BASE_URL } from '../api';

const CATEGORY_COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#f43f5e','#06b6d4','#ec4899','#6366f1'];

export default function Logs() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setExpenses([
          { id: 1, description: 'Groceries', date: '2026-07-28', category_name: 'Food', payment_method: 'Credit Card', amount: '2500' },
          { id: 2, description: 'Electricity Bill', date: '2026-07-25', category_name: 'Utility', payment_method: 'UPI', amount: '1200' },
          { id: 3, description: 'Netflix Subscription', date: '2026-07-22', category_name: 'Entertainment', payment_method: 'Credit Card', amount: '649' },
        ]);
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_BASE_URL}/api/expenses/`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) {
        if (res.status === 401) { localStorage.removeItem('access_token'); navigate('/login'); }
        throw new Error('Failed to fetch expenses');
      }
      setExpenses(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/expenses/${id}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) fetchExpenses();
      else alert("Failed to delete expense");
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--glass-border)', borderTop: '3px solid var(--accent-primary)', animation: 'spin-slow 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '5rem', minHeight: '100vh', background: 'var(--bg-deep)', position: 'relative' }}>
      <div className="bg-animation-wrapper">
        <div className="shape shape-1" style={{ opacity: 0.5 }} />
        <div className="shape shape-2" style={{ opacity: 0.4 }} />
      </div>

      <div className="tools-header" style={{ marginBottom: '2rem' }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText color="var(--accent-primary)" size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Transactions Log
              </h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '1px' }}>All your expense records</div>
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-glass)', border: '1px solid var(--glass-border)', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-full)' }}>
            {expenses.length} records
          </div>
        </div>
      </div>

      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
        {expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)' }}>
            <Receipt size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>No transactions yet</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Add your first expense to get started.</p>
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '2.5rem', marginTop: '1rem' }}>
            <div style={{ position: 'absolute', top: '1rem', bottom: '1rem', left: '1.25rem', width: '2px', background: 'linear-gradient(to bottom, var(--accent-primary) 0%, var(--glass-border-md) 20%, var(--glass-border-md) 100%)', zIndex: 0 }} />
            {expenses.map((exp, idx) => {
              const catColor = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
              return (
                <div key={exp.id} className="animate-slide-up" style={{
                  position: 'relative',
                  animationDelay: `${idx * 30}ms`,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.25rem 1.5rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  transition: 'transform 0.25s var(--ease-bounce), box-shadow 0.25s ease, border-color 0.25s ease',
                  cursor: 'default',
                  marginBottom: '1rem',
                  zIndex: 1
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = `${catColor}66`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                >
                  <div style={{
                    position: 'absolute', top: '1.75rem', left: '-1.25rem', transform: 'translate(-50%, -50%)',
                    width: '12px', height: '12px', borderRadius: '50%', background: catColor,
                    border: '2px solid var(--bg-deep)', boxShadow: `0 0 10px ${catColor}88`, zIndex: 2,
                    transition: 'transform 0.3s'
                  }} className="timeline-dot" />
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                      {exp.description || 'No Description'}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                        {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>•</span>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.5rem',
                        background: `${catColor}18`, color: catColor, borderRadius: 'var(--radius-full)',
                        border: `1px solid ${catColor}30`,
                      }}>{exp.category_name}</span>
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>•</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{exp.payment_method}</span>
                    </div>

                    {exp.items && exp.items.length > 0 && (
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--glass-border)' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.4rem' }}>Receipt Items:</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {exp.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                              <span style={{ color: 'var(--text-dim)' }}>₹{parseFloat(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.625rem', marginLeft: '1rem', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-rose)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                      -₹{parseFloat(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button onClick={() => setEditingExpense(exp)} style={{ background: 'var(--bg-glass)', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(exp.id)} style={{ background: 'var(--bg-glass)', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.15)'; e.currentTarget.style.color = 'var(--accent-rose)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddExpenseModal isOpen={!!editingExpense} expenseToEdit={editingExpense} onClose={() => setEditingExpense(null)} onAdded={() => { setEditingExpense(null); fetchExpenses(); }} />
    </div>
  );
}
