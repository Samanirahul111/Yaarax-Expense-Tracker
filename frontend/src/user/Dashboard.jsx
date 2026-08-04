import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, ArrowLeft, Wallet } from 'lucide-react';
import AddExpenseModal from './AddExpenseModal';
import CategorySpends from './CategorySpends';
import SetBudgetModal from './SetBudgetModal';
import AuthAlertModal from '../components/AuthAlertModal';
import { getCategoryColor } from './utils';
import { API_BASE_URL } from '../api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show label for very small slices

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [viewAllCategories, setViewAllCategories] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);

  const handleAction = (action) => {
    if (!localStorage.getItem('access_token')) {
      setShowGuestModal(true);
    } else {
      action();
    }
  };

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
      
      try {
        const forecastRes = await fetch(`${API_BASE_URL}/api/ml/budget-forecast/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (forecastRes.ok) {
          const forecastData = await forecastRes.json();
          setForecast(forecastData.next_month_prediction);
        }
      } catch (e) {
        console.error("Failed to fetch forecast");
      }
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login');
        }
        throw new Error('Failed to fetch data');
      }
      
      const result = await res.json();
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: 'var(--text-secondary)' }}>Loading your dashboard...</div></div>;
  if (!data) return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h3 style={{color: '#dc2626'}}>Error connecting to server</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Check the browser console or backend logs for details.</p>
      <button className="btn-primary" onClick={fetchDashboardData}>Retry Connection</button>
    </div>
  );

  if (viewAllCategories) {
    return <CategorySpends 
      categorySpends={data.category_spends} 
      monthName={data.monthly_spends[data.monthly_spends.length - 1]?.month}
      onBack={() => setViewAllCategories(false)} 
    />;
  }

  const topCategories = data.category_spends.slice(0, 4);
  const totalCategorySpends = topCategories.reduce((acc, cat) => acc + cat.total, 0) || 1;

  const maxMonthlyTotal = Math.max(...data.monthly_spends.map(m => m.total), 1);

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', paddingBottom: '4rem', fontFamily: 'var(--font-family)' }}>
      
      {/* Background Animated Shapes for consistency */}
      <div className="bg-animation-wrapper">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>

      <div className="tools-header" style={{ marginBottom: '2.5rem' }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '8px', background: 'white', borderRadius: '10px' }}>
            <Wallet color="var(--accent-primary)" size={24} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>Spends Dashboard</h2>
        </div>
      </div>

      <div className="page-container">

        {/* Total Spends Overview */}
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem', background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div className="responsive-flex-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '500' }}>Spends this month</div>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                ₹{data.total_spends_this_month.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {forecast !== null && (
                <div style={{ padding: '0.8rem 1.5rem', background: '#f0fdf4', color: '#166534', borderRadius: '12px', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #bbf7d0' }}>
                  ✨ AI Forecast Next Month: ₹{forecast.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              )}
              <button onClick={() => handleAction(() => setShowBudgetModal(true))} className="btn-secondary hover-lift" style={{ padding: '0.8rem 1.5rem', fontSize: '1rem', background: 'var(--bg-primary)' }}>
                Set Budget
              </button>
              <button onClick={() => handleAction(() => setShowAddModal(true))} className="btn-primary hover-lift" style={{ padding: '0.8rem 1.5rem', fontSize: '1rem', boxShadow: '0 10px 20px -5px rgba(37,99,235,0.3)' }}>
                + Add Spend
              </button>
            </div>
          </div>

          {/* Budget Progress Bar */}
          {parseFloat(data.monthly_budget) > 0 && (() => {
            const budget = parseFloat(data.monthly_budget);
            const spent = data.total_spends_this_month;
            const percentage = (spent / budget) * 100;
            const displayPercentage = Math.min(percentage, 100);
            const isOverBudget = spent > budget;
            
            let barColor = 'var(--accent-primary)'; // Blue for <= 50%
            if (percentage >= 90) {
              barColor = '#ef4444'; // Red for >= 90%
            } else if (percentage > 50) {
              barColor = '#eab308'; // Yellow for 51-89%
            }
            
            return (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {percentage >= 90 && (
                  <div style={{ 
                    background: percentage >= 100 ? '#fee2e2' : '#fef9c3', 
                    color: percentage >= 100 ? '#991b1b' : '#854d0e',
                    padding: '0.75rem 1rem', 
                    borderRadius: '8px', 
                    fontSize: '0.9rem', 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: '500'
                  }}>
                    <span>
                      {percentage >= 100 
                        ? '🚨 You have reached your budget limit!' 
                        : '⚠️ You have used over 90% of your budget.'}
                    </span>
                    {percentage >= 100 && (
                      <button 
                        onClick={() => handleAction(() => setShowBudgetModal(true))} 
                        style={{
                          background: '#ef4444', color: 'white', border: 'none',
                          padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer',
                          fontWeight: '600', fontSize: '0.8rem'
                        }}
                      >
                        Update Budget
                      </button>
                    )}
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '500' }}>
                  <span style={{ color: isOverBudget ? '#ef4444' : 'var(--text-secondary)' }}>
                    {isOverBudget ? 'Over budget by ' : 'Budget used: '}
                    {percentage.toFixed(0)}%
                  </span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    ₹{spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })} / ₹{budget.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${displayPercentage}%`, 
                    background: barColor,
                    borderRadius: '4px',
                    transition: 'width 0.5s ease, background-color 0.5s ease'
                  }}></div>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="responsive-grid">
          
          {/* Top Categories Card */}
          <div className="animate-slide-up delay-100" style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, fontWeight: '700', fontSize: '1.25rem' }}>Top Categories</h3>
              <button style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                {data.monthly_spends[data.monthly_spends.length - 1]?.month || 'July'} 2026
                <span style={{ fontSize: '0.7rem' }}>▼</span>
              </button>
            </div>
            
            {/* Progress Bar */}
            <div style={{ display: 'flex', height: '28px', borderRadius: '14px', overflow: 'hidden', marginBottom: '2rem', background: 'var(--bg-primary)' }}>
              {topCategories.map((cat, idx) => (
                <div key={idx} style={{ 
                  width: `${(cat.total / totalCategorySpends) * 100}%`, 
                  background: getCategoryColor(cat.category__name, idx),
                  borderRight: idx < topCategories.length - 1 ? '3px solid white' : 'none'
                }} />
              ))}
            </div>

            {/* Categories List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
              {topCategories.map((cat, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: getCategoryColor(cat.category__name, idx) }}></div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{cat.category__name}</div>
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>₹{cat.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
              ))}
              {topCategories.length === 0 && <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>No categories yet.</div>}
            </div>

            <button onClick={() => setViewAllCategories(true)} className="btn-secondary" style={{ width: '100%' }}>
              View all categories
            </button>
          </div>

          {/* Monthly Spends Chart Card */}
          <div className="animate-slide-up delay-200" style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: 0, fontWeight: '700', fontSize: '1.25rem', marginBottom: '2rem' }}>Monthly Spends</h3>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              <button style={{ background: 'var(--text-primary)', border: 'none', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '24px', whiteSpace: 'nowrap', fontWeight: '500' }}>All</button>
              <button style={{ background: 'white', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.5rem 1.25rem', borderRadius: '24px', whiteSpace: 'nowrap', fontWeight: '500' }}>Food, Beverages...</button>
              <button style={{ background: 'white', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.5rem 1.25rem', borderRadius: '24px', whiteSpace: 'nowrap', fontWeight: '500' }}>Utility</button>
            </div>

            <div style={{ position: 'relative', height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: '1rem', paddingRight: '2.5rem' }}>
              {/* Horizontal Grid Lines */}
              {[1, 0.75, 0.5, 0.25, 0].map((ratio, idx) => {
                const val = ((maxMonthlyTotal * ratio) / 1000);
                return (
                  <div key={idx} style={{ position: 'absolute', bottom: `${ratio * 100}%`, left: 0, right: 0, borderBottom: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ position: 'absolute', right: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', transform: 'translateY(50%)', background: 'white', paddingLeft: '0.5rem', fontWeight: '500' }}>
                      ₹{val < 1 && val > 0 ? val.toFixed(1) : val.toFixed(0)}k
                    </span>
                  </div>
                );
              })}

              {/* Bars */}
              {data.monthly_spends.map((monthData, idx) => {
                const heightPercentage = maxMonthlyTotal > 0 ? (monthData.total / maxMonthlyTotal) * 100 : 0;
                const isCurrentMonth = idx === data.monthly_spends.length - 1;
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '18%', position: 'relative' }}>
                    {isCurrentMonth && monthData.total > 0 && (
                      <div style={{ position: 'absolute', top: `-${heightPercentage + 20}%`, background: 'var(--text-primary)', color: 'white', padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', transform: 'translateY(-100%)', zIndex: 10, fontWeight: '600', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        ₹{monthData.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </div>
                    )}
                    <div className="hover-lift" style={{ 
                      width: '32px', 
                      height: `${heightPercentage}%`, 
                      minHeight: monthData.total > 0 ? '6px' : '0',
                      background: isCurrentMonth ? 'var(--accent-primary)' : '#e2e8f0', 
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.5s ease-out, background 0.3s'
                    }} />
                    <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: isCurrentMonth ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isCurrentMonth ? '600' : '500' }}>{monthData.month}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method Spends Card */}
          <div className="animate-slide-up delay-300" style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, fontWeight: '700', fontSize: '1.25rem' }}>Payment Methods</h3>
            </div>
            
            {/* Progress Bar */}
            <div style={{ display: 'flex', height: '28px', borderRadius: '14px', overflow: 'hidden', marginBottom: '2rem', background: 'var(--bg-primary)' }}>
              {data.payment_method_spends?.map((pm, idx) => (
                <div key={idx} style={{ 
                  width: `${(pm.total / (data.payment_method_spends.reduce((acc, p) => acc + p.total, 0) || 1)) * 100}%`, 
                  background: getCategoryColor(pm.payment_method, idx + 5),
                  borderRight: idx < data.payment_method_spends.length - 1 ? '3px solid white' : 'none'
                }} title={`${pm.payment_method}: ₹${pm.total}`} />
              ))}
            </div>

            {/* Methods List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
              {data.payment_method_spends?.map((pm, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: getCategoryColor(pm.payment_method, idx + 5) }}></div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{pm.payment_method}</div>
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>₹{pm.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
              ))}
              {(!data.payment_method_spends || data.payment_method_spends.length === 0) && <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>No payment methods used yet.</div>}
            </div>
          </div>

          {/* Category-wise Breakdown Pie Chart */}
          <div className="animate-slide-up delay-400" style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontWeight: '700', fontSize: '1.1rem', color: '#c29b2b', textTransform: 'uppercase', letterSpacing: '1px' }}>Category-wise Breakdown</h3>
            </div>
            
            <div style={{ width: '100%', height: '260px', display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.category_spends.length > 0 ? data.category_spends : [{category__name: 'None', total: 1}]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={data.category_spends.length > 0 ? renderCustomizedLabel : false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {data.category_spends.length > 0 ? data.category_spends.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category__name, index)} />
                    )) : <Cell fill="#e2e8f0" />}
                  </Pie>
                  {data.category_spends.length > 0 && <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />}
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              {data.category_spends.map((cat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: '12px', height: '12px', background: getCategoryColor(cat.category__name, idx) }}></div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{cat.category__name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AddExpenseModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdded={fetchDashboardData} />
      <SetBudgetModal isOpen={showBudgetModal} onClose={() => setShowBudgetModal(false)} onAdded={fetchDashboardData} currentBudget={data.monthly_budget} />
      
      {showGuestModal && (
        <AuthAlertModal 
          onClose={() => setShowGuestModal(false)} 
          message="You can't use any functionality without logging in. Create a free account to track your real expenses!"
        />
      )}
    </div>
  );
}
