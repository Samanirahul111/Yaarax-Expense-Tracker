import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2 } from 'lucide-react';
import AddExpenseModal from './AddExpenseModal';
import { API_BASE_URL } from '../api';


export default function Logs() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setExpenses([
          { id: 1, description: 'Groceries', date: '2026-07-28', category_name: 'Food', payment_method: 'Credit Card', amount: '2500' },
          { id: 2, description: 'Electricity Bill', date: '2026-07-25', category_name: 'Utility', payment_method: 'UPI', amount: '1200' }
        ]);
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_BASE_URL}/api/expenses/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login');
        }
        throw new Error('Failed to fetch expenses');
      }
      
      const data = await res.json();
      setExpenses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/expenses/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchExpenses();
      } else {
        alert("Failed to delete expense");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: 'var(--text-secondary)' }}>Loading logs...</div></div>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div className="tools-header" style={{ marginBottom: '2rem' }}>
        <div className="page-container">
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Transactions Log</h2>
        </div>
      </div>
      
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {expenses.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No transactions found.</div>
        ) : (
          expenses.map(exp => (
            <div key={exp.id} className="card hover-slide-right" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{exp.description || 'No Description'}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', gap: '0.75rem' }}>
                    <span>{new Date(exp.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{exp.category_name}</span>
                    <span>•</span>
                    <span>{exp.payment_method}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <div style={{ fontWeight: '700', fontSize: '1.2rem', color: '#ef4444' }}>
                    -₹{parseFloat(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setEditingExpense(exp)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(exp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              {exp.items && exp.items.length > 0 && (
                <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Receipt Items:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {exp.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>₹{parseFloat(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      <AddExpenseModal 
        isOpen={!!editingExpense}
        expenseToEdit={editingExpense}
        onClose={() => setEditingExpense(null)}
        onAdded={() => {
          setEditingExpense(null);
          fetchExpenses();
        }}
      />
    </div>
  );
}
