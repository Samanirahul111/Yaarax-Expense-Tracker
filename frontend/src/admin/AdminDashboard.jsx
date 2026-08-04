import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Mail, Clock, Activity, ShieldCheck, User, Trash2, ShieldPlus, ShieldMinus } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API_BASE_URL } from '../api';
import AdminAuth from './AdminAuth';


const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ total_users: 0, users: [], current_user_id: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [needsAuth, setNeedsAuth] = useState(!localStorage.getItem('access_token'));

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setNeedsAuth(true);
        setLoading(false);
        return;
      }
      
      const res = await fetch(`${API_BASE_URL}/api/admin/dashboard/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${res.status}`);
      }
      
      const json = await res.json();
      setData(json);
    } catch (err) {
      if (err.message.includes('401')) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setNeedsAuth(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!needsAuth) {
      fetchData();
    }
  }, [needsAuth]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/admin/user/${userId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${res.status}`);
      }

      // Remove user from state
      setData(prev => ({
        ...prev,
        total_users: prev.total_users - 1,
        users: prev.users.filter(u => u.id !== userId)
      }));
      
      alert("User deleted successfully.");
    } catch (err) {
      alert("Failed to delete user: " + err.message);
    }
  };

  const handlePromoteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to promote this user to Admin?")) return;

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/admin/user/${userId}/promote/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${res.status}`);
      }

      // Update user in state
      setData(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === userId ? { ...u, is_superuser: true } : u)
      }));
      
      alert("User successfully promoted to admin!");
    } catch (err) {
      alert("Failed to promote user: " + err.message);
    }
  };

  const handleDemoteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to demote this Admin to a regular User?")) return;

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/admin/user/${userId}/demote/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${res.status}`);
      }

      // Update user in state
      setData(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === userId ? { ...u, is_superuser: false } : u)
      }));
      
      alert("Admin successfully demoted to regular user!");
    } catch (err) {
      alert("Failed to demote user: " + err.message);
    }
  };

  if (needsAuth) {
    return <AdminAuth onSuccess={() => { setNeedsAuth(false); setLoading(true); }} />;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading Admin Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '12px' }}>
          <strong>Error: </strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '12px', background: 'var(--accent-primary)', borderRadius: '12px', color: 'white' }}>
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.8rem', fontWeight: 'bold' }}>Admin Dashboard</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Manage and view platform statistics</p>
        </div>
      </div>
      
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '2rem', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '50%', color: 'var(--accent-primary)' }}>
          <Users size={32} />
        </div>
        <div>
          <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Registered Users</p>
          <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{data.total_users}</h2>
        </div>
      </div>
      
      <h2 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>Payment Systems Overview</h2>
      <div className="grid-responsive-2 card-responsive-padding" style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem'
      }}>
        {/* Chart */}
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.payment_stats}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="total"
                nameKey="payment_method"
              >
                {data.payment_stats?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)' }}>Average Payment Size</h3>
          {data.payment_stats?.map((stat, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '12px', borderLeft: `4px solid ${COLORS[index % COLORS.length]}` }}>
              <div>
                <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-primary)' }}>{stat.payment_method}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{stat.count} transactions</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>₹{Number(stat.average).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>average</p>
              </div>
            </div>
          ))}
          {(!data.payment_stats || data.payment_stats.length === 0) && (
            <p style={{ color: 'var(--text-secondary)' }}>No payment data available yet.</p>
          )}
        </div>
      </div>

      <h2 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>User Directory</h2>
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>ID</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>Username</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>Email</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>Role</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>Date Joined</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>#{user.id}</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                      <User size={16} />
                    </div>
                    {user.username}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={16} /> {user.email}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    {user.is_superuser ? (
                      <span style={{ background: '#fef3c7', color: '#b45309', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600' }}>Admin</span>
                    ) : (
                      <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600' }}>User</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} /> {user.date_joined || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    {!user.is_superuser ? (
                      <button 
                        onClick={() => handlePromoteUser(user.id)}
                        style={{ 
                          background: 'transparent', 
                          border: 'none', 
                          color: '#10b981',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          transition: 'background 0.2s',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '0.5rem'
                        }}
                        title="Make Admin"
                      >
                        <ShieldPlus size={18} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleDemoteUser(user.id)}
                        disabled={data.current_user_id === user.id}
                        style={{ 
                          background: 'transparent', 
                          border: 'none', 
                          color: data.current_user_id === user.id ? '#cbd5e1' : '#f59e0b',
                          cursor: data.current_user_id === user.id ? 'not-allowed' : 'pointer',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          transition: 'background 0.2s',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '0.5rem'
                        }}
                        title={data.current_user_id === user.id ? "Cannot demote yourself" : "Demote to Regular User"}
                      >
                        <ShieldMinus size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.is_superuser || data.current_user_id === user.id}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: (user.is_superuser || data.current_user_id === user.id) ? '#cbd5e1' : '#ef4444',
                        cursor: (user.is_superuser || data.current_user_id === user.id) ? 'not-allowed' : 'pointer',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        transition: 'background 0.2s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title={(user.is_superuser || data.current_user_id === user.id) ? "Cannot delete this user" : "Delete User"}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
