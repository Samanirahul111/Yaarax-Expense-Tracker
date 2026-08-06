import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Receipt, IndianRupee } from 'lucide-react';
import AddGroupExpenseModal from './AddGroupExpenseModal';
import AuthAlertModal from '../components/AuthAlertModal';
import { API_BASE_URL } from '../api';


const GroupDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [settlements, setSettlements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAuthAlert, setShowAuthAlert] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        // Mock group for guests or show error
        setGroup({ name: 'Demo Group', members: [], expenses: [] });
        setLoading(false);
        return;
      }

      // Fetch group details
      const groupRes = await fetch(`${API_BASE_URL}/api/groups/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!groupRes.ok) {
        if (groupRes.status === 401) {
          setGroup({ name: 'Demo Group', members: [], expenses: [] });
          return;
        }
        throw new Error('Failed to fetch group details');
      }
      
      const groupData = await groupRes.json();
      setGroup(groupData);

      // Fetch settlements
      const setRes = await fetch(`${API_BASE_URL}/api/groups/${id}/settlements/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (setRes.ok) {
        const setData = await setRes.json();
        setSettlements(setData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading...</div>;
  if (error) return <div style={{ color: '#ef4444', padding: '20px' }}>{error}</div>;
  if (!group) return null;

  return (
    <div className="page-container" style={{ paddingBottom: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => navigate('/groups')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', margin: 0, flex: 1 }}>{group.name}</h1>
        <button 
          onClick={() => {
            const token = localStorage.getItem('access_token');
            if (!token) {
              setShowAuthAlert(true);
              return;
            }
            setShowAddExpense(true);
          }}
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={18} /> Add Expense
        </button>
      </div>

      {/* Invite Code Section */}
      {group.invite_code && (
        <div style={{ backgroundColor: 'var(--bg-elevated)', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px dashed var(--accent-primary)' }}>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Group Invite Code</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-primary)', letterSpacing: '2px' }}>{group.invite_code}</div>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(group.invite_code);
              alert('Invite code copied!');
            }}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Copy
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'var(--bg-elevated)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Total Group Spend</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            ₹{settlements?.total_spent || 0}
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-elevated)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Per Person Share</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            ₹{settlements?.per_person_share?.toFixed(2) || 0}
          </div>
        </div>
      </div>
      
      {/* Group Members Section */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', margin: '0 0 16px 0', color: 'var(--text-primary)' }}>Members</h2>
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
          {group.members && group.members.map(member => (
            <div key={member.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px' }}>
              <div style={{ 
                width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--bg-elevated)', 
                border: '2px solid var(--accent-primary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '8px'
              }}>
                {member.photo ? (
                  <img src={member.photo.startsWith('http') ? member.photo : `${API_BASE_URL}${member.photo}`} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', wordBreak: 'break-word', maxWidth: '70px' }}>
                {member.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* Settlements Section */}
        <div style={{ backgroundColor: 'var(--bg-elevated)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.2rem', margin: '0 0 16px 0', color: 'var(--text-primary)' }}>How to Settle Up</h2>
          {(!settlements?.settlements || settlements.settlements.length === 0) ? (
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>All settled up! No one owes anything.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {settlements.settlements.map((s, idx) => (
                <div key={idx} style={{ 
                  padding: '12px 16px', 
                  backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                  color: 'var(--accent-primary)',
                  borderRadius: '12px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <IndianRupee size={18} /> {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expenses List */}
        <div>
          <h2 style={{ fontSize: '1.2rem', margin: '0 0 16px 0', color: 'var(--text-primary)' }}>Recent Expenses</h2>
          {group.expenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--bg-elevated)', borderRadius: '16px' }}>
              <Receipt size={32} style={{ color: 'var(--text-secondary)', marginBottom: '12px', opacity: 0.5 }} />
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No expenses recorded yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {group.expenses.map(exp => (
                <div key={exp.id} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  backgroundColor: 'var(--bg-elevated)', padding: '16px', borderRadius: '16px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{exp.description}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Paid by {exp.paid_by_name} • {exp.date}</span>
                  </div>
                  <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                    ₹{exp.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddExpense && (
        <AddGroupExpenseModal 
          groupId={id}
          groupName={group.name}
          members={group.members}
          onClose={() => setShowAddExpense(false)}
          onSuccess={() => {
            setShowAddExpense(false);
            fetchData();
          }}
        />
      )}

      {showAuthAlert && (
        <AuthAlertModal 
          onClose={() => setShowAuthAlert(false)} 
          message="Please log in or sign up to add an expense."
        />
      )}
    </div>
  );
};

export default GroupDashboard;
