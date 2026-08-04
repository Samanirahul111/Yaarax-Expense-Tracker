import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategoryColor } from './utils';
import { API_BASE_URL } from '../api';


export default function Analytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setData({
          total_spends_this_month: 25400,
          monthly_budget: 35000,
          monthly_spends: [
            { month: 'Apr', total: 18000 },
            { month: 'May', total: 22000 },
            { month: 'Jun', total: 24000 },
            { month: 'Jul', total: 25400 },
          ],
          category_spends: [
            { category__name: 'Food', total: 8500 },
            { category__name: 'Rent', total: 12000 },
            { category__name: 'Transport', total: 2900 },
            { category__name: 'Entertainment', total: 2000 },
          ],
          payment_method_spends: [
            { payment_method: 'Credit Card', total: 15400 },
            { payment_method: 'UPI', total: 10000 },
          ]
        });
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_BASE_URL}/api/dashboard-data/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login');
        }
        throw new Error('Failed to fetch analytics');
      }
      
      const result = await res.json();
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: 'var(--text-secondary)' }}>Loading analytics...</div></div>;
  if (!data) return <div style={{ textAlign: 'center', padding: '2rem' }}>Error loading data</div>;

  const totalCategorySpends = data.category_spends.reduce((acc, cat) => acc + cat.total, 0) || 1;
  const totalPaymentSpends = (data.payment_method_spends || []).reduce((acc, p) => acc + p.total, 0) || 1;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div className="tools-header" style={{ marginBottom: '2rem' }}>
        <div className="page-container">
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Analytics</h2>
        </div>
      </div>
      
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Category Analytics */}
        <div className="card" style={{ padding: '2rem', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, marginBottom: '1.5rem', fontSize: '1.25rem' }}>Spends by Category</h3>
          <div style={{ display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem', background: 'var(--bg-primary)' }}>
            {data.category_spends.map((cat, idx) => (
              <div key={idx} style={{ 
                width: `${(cat.total / totalCategorySpends) * 100}%`, 
                background: getCategoryColor(cat.category__name, idx),
                borderRight: idx < data.category_spends.length - 1 ? '2px solid white' : 'none'
              }} title={`${cat.category__name}: ₹${cat.total}`} />
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.category_spends.map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: getCategoryColor(cat.category__name, idx) }}></div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{cat.category__name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>({((cat.total / totalCategorySpends) * 100).toFixed(1)}%)</div>
                </div>
                <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>₹{cat.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              </div>
            ))}
            {data.category_spends.length === 0 && <div style={{ color: 'var(--text-secondary)' }}>No data available.</div>}
          </div>
        </div>

        {/* Payment Method Analytics */}
        {data.payment_method_spends && data.payment_method_spends.length > 0 && (
          <div className="card" style={{ padding: '2rem', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: 0, marginBottom: '1.5rem', fontSize: '1.25rem' }}>Spends by Payment Method</h3>
            <div style={{ display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem', background: 'var(--bg-primary)' }}>
              {data.payment_method_spends.map((pm, idx) => (
                <div key={idx} style={{ 
                  width: `${(pm.total / totalPaymentSpends) * 100}%`, 
                  background: getCategoryColor(pm.payment_method, idx + 5),
                  borderRight: idx < data.payment_method_spends.length - 1 ? '2px solid white' : 'none'
                }} title={`${pm.payment_method}: ₹${pm.total}`} />
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.payment_method_spends.map((pm, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: getCategoryColor(pm.payment_method, idx + 5) }}></div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{pm.payment_method}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>({((pm.total / totalPaymentSpends) * 100).toFixed(1)}%)</div>
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>₹{pm.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
