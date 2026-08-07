import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, TrendingUp, ChevronRight, Plus, Target, Sparkles, ArrowUpRight } from 'lucide-react';
import AddExpenseModal from './AddExpenseModal';
import CategorySpends from './CategorySpends';
import SetBudgetModal from './SetBudgetModal';
import AuthAlertModal from '../components/AuthAlertModal';
import { getCategoryColor } from './utils';
import { API_BASE_URL } from '../api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts';

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.06) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: '0.78rem', fontWeight: 700 }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function StatCard({ label, value, sub, gradient, icon, delay }) {
  return (
    <div className={`animate-slide-up ${delay}`} style={{
      background: gradient || 'var(--bg-glass)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-xl)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.3s var(--ease-bounce), box-shadow 0.3s ease',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-xl)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {icon && (
        <div style={{
          position: 'absolute', top: '1rem', right: '1rem',
          opacity: 0.15, fontSize: '2.5rem',
        }}>{icon}</div>
      )}
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800,
        color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1,
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{sub}</div>}
    </div>
  );
}

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
    if (!localStorage.getItem('access_token')) setShowGuestModal(true);
    else action();
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
        if (res.status === 401) { localStorage.removeItem('access_token'); navigate('/login'); }
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

  useEffect(() => { fetchDashboardData(); }, []);

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1rem',
      background: 'var(--bg-deep)',
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '50%',
        border: '3px solid var(--glass-border)',
        borderTop: '3px solid var(--accent-primary)',
        animation: 'spin-slow 0.8s linear infinite',
      }} />
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading dashboard…</div>
    </div>
  );

  if (!data) return (
    <div className="page-wrapper animate-fade-in" style={{ flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem' }}>⚠️</div>
      <h3 style={{ color: 'var(--accent-rose)' }}>Connection Error</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Could not connect to the server. Check your network or backend.
      </p>
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

  const budget = parseFloat(data.monthly_budget);
  const spent = data.total_spends_this_month;
  const budgetPercentage = budget > 0 ? (spent / budget) * 100 : 0;
  const displayPercentage = Math.min(budgetPercentage, 100);
  const isOverBudget = budget > 0 && spent > budget;

  const budgetBarColor = budgetPercentage >= 90
    ? 'linear-gradient(90deg, #f43f5e, #ef4444)'
    : budgetPercentage > 50
    ? 'linear-gradient(90deg, #f59e0b, #f97316)'
    : 'var(--grad-primary)';

  const totalPayments = data.payment_method_spends?.reduce((acc, p) => acc + p.total, 0) || 1;

  return (
    <div className="animate-fade-in" style={{
      background: 'var(--bg-deep)',
      color: 'var(--text-primary)',
      minHeight: '100vh',
      paddingBottom: '5rem',
      fontFamily: 'var(--font-body)',
      position: 'relative',
    }}>
      {/* Aurora background */}
      <div className="bg-animation-wrapper">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
      </div>

      {/* Page Header */}
      <div className="tools-header" style={{ marginBottom: '2rem' }}>
        <div className="page-container flex-responsive-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
              background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Wallet color="var(--accent-primary)" size={20} />
            </div>
            <div>
              <h2 style={{
                margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.35rem',
                fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)',
              }}>
                Spends Dashboard
              </h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '1px' }}>
                Track & manage your finances
              </div>
            </div>
          </div>

          {/* Quick action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={async () => {
                const token = localStorage.getItem('access_token');
                if (!token) return;
                try {
                  const res = await fetch(`${API_BASE_URL}/api/export-data/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  if (!res.ok) {
                    const txt = await res.text();
                    throw new Error(`HTTP ${res.status}: ${txt.substring(0, 50)}`);
                  }
                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'expenses_export.csv';
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                } catch (e) {
                  console.error(e);
                  alert(`Export failed: ${e.message}`);
                }
              }}
              className="btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              <TrendingUp size={15} />
              <span className="mobile-hidden">Export CSV</span>
            </button>
            <button
              onClick={() => handleAction(() => setShowBudgetModal(true))}
              className="btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              <Target size={15} />
              <span className="mobile-hidden">Set Budget</span>
            </button>
            <button
              onClick={() => handleAction(() => setShowAddModal(true))}
              className="btn-primary"
              style={{ padding: '0.5rem 1.125rem', fontSize: '0.875rem' }}
            >
              <Plus size={15} />
              Add Spend
            </button>
          </div>
        </div>
      </div>

      <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>

        {/* ─── Spend Overview Hero Card ─── */}
        <div className="animate-slide-up card-solid" style={{
          padding: '2rem',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.08) 50%, var(--bg-elevated) 100%)',
          border: '1px solid var(--glass-border-md)',
          borderRadius: 'var(--radius-2xl)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Decorative orb */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '200px', height: '200px',
            background: 'radial-gradient(circle, rgba(59,130,246,0.2), transparent)',
            filter: 'blur(30px)', pointerEvents: 'none',
          }} />

          <div className="responsive-flex-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                Total Spends This Month
              </div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                background: 'var(--grad-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem',
              }}>
                ₹{data.total_spends_this_month.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              {budget > 0 && (
                <div style={{ fontSize: '0.85rem', color: isOverBudget ? 'var(--accent-rose)' : 'var(--text-secondary)' }}>
                  {isOverBudget
                    ? `🚨 Over budget by ₹${(spent - budget).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                    : `Budget: ₹${budget.toLocaleString('en-IN', { maximumFractionDigits: 0 })} · ${budgetPercentage.toFixed(0)}% used`
                  }
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
              {/* Financial Health Score */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.75rem 1.25rem',
                background: 'var(--bg-glass-md)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)',
              }}>
                <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                  <svg width="48" height="48" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke={budgetPercentage > 90 ? 'var(--accent-rose)' : budgetPercentage > 50 ? 'var(--accent-amber)' : 'var(--accent-emerald)'} strokeWidth="10" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * (Math.max(100 - budgetPercentage, 0)) / 100)} style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
                  </svg>
                  <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {Math.max(100 - Math.floor(budgetPercentage), 0)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Health Score
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {budgetPercentage > 90 ? 'Needs Attention' : budgetPercentage > 50 ? 'On Track' : 'Excellent'}
                  </div>
                </div>
              </div>

              {/* AI Forecast badge */}
              {forecast !== null && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  background: 'rgba(16,185,129,0.12)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: 'var(--radius-xl)',
                  flexShrink: 0,
                  width: '100%'
                }}>
                  <Sparkles size={16} color="var(--accent-emerald)" />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      AI Forecast
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                      ₹{forecast.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Budget Progress Bar */}
          {budget > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              {/* Warning alert */}
              {budgetPercentage >= 90 && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.625rem 1rem',
                  background: budgetPercentage >= 100 ? 'rgba(244,63,94,0.12)' : 'rgba(245,158,11,0.12)',
                  border: `1px solid ${budgetPercentage >= 100 ? 'rgba(244,63,94,0.25)' : 'rgba(245,158,11,0.25)'}`,
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: budgetPercentage >= 100 ? 'var(--accent-rose)' : 'var(--accent-amber)',
                  marginBottom: '0.75rem',
                  gap: '1rem',
                }}>
                  <span>
                    {budgetPercentage >= 100
                      ? '🚨 Budget limit reached!'
                      : '⚠️ Over 90% of budget used'}
                  </span>
                  {budgetPercentage >= 100 && (
                    <button
                      onClick={() => handleAction(() => setShowBudgetModal(true))}
                      style={{
                        background: 'var(--accent-rose)', color: 'white', border: 'none',
                        padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer',
                        fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      Update Budget
                    </button>
                  )}
                </div>
              )}

              {/* Bar track */}
              <div style={{
                height: '6px', background: 'rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-full)', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${displayPercentage}%`,
                  background: budgetBarColor,
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.8s var(--ease-spring)',
                  boxShadow: budgetPercentage >= 90 ? '0 0 8px rgba(244,63,94,0.5)' : '0 0 8px rgba(59,130,246,0.5)',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                <span>{budgetPercentage.toFixed(0)}% used</span>
                <span>₹{spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })} / ₹{budget.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          )}
        </div>

        {/* ─── Main Grid ─── */}
        <div className="responsive-grid">

          {/* Top Categories Card */}
          <div className="animate-slide-up delay-100 card-solid" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{
                margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 700,
                fontSize: '1.1rem', color: 'var(--text-primary)',
              }}>Top Categories</h3>
              <div style={{
                padding: '0.3rem 0.75rem',
                background: 'var(--bg-glass)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)',
              }}>
                {data.monthly_spends[data.monthly_spends.length - 1]?.month || 'This'} 2026
              </div>
            </div>

            {/* Segmented bar */}
            <div style={{
              display: 'flex', height: '10px', borderRadius: 'var(--radius-full)',
              overflow: 'hidden', marginBottom: '1.5rem',
              background: 'rgba(255,255,255,0.06)',
            }}>
              {topCategories.map((cat, idx) => (
                <div key={idx} style={{
                  width: `${(cat.total / totalCategorySpends) * 100}%`,
                  background: getCategoryColor(cat.category__name, idx),
                  borderRight: idx < topCategories.length - 1 ? '2px solid var(--bg-elevated)' : 'none',
                  transition: 'width 0.5s var(--ease-spring)',
                }} />
              ))}
            </div>

            {/* Category list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
              {topCategories.map((cat, idx) => {
                const pct = ((cat.total / totalCategorySpends) * 100).toFixed(0);
                const color = getCategoryColor(cat.category__name, idx);
                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: color, boxShadow: `0 0 6px ${color}66`, flexShrink: 0,
                      }} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                        {cat.category__name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 500 }}>{pct}%</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                        ₹{cat.total.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {topCategories.length === 0 && (
                <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem 0', fontSize: '0.9rem' }}>
                  No expenses yet. Add your first spend!
                </div>
              )}
            </div>

            <button
              onClick={() => setViewAllCategories(true)}
              className="btn-secondary"
              style={{ width: '100%', fontSize: '0.875rem' }}
            >
              View all categories <ChevronRight size={14} />
            </button>
          </div>

          {/* Monthly Spends Chart */}
          <div className="animate-slide-up delay-200 card-solid" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{
                margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 700,
                fontSize: '1.1rem', color: 'var(--text-primary)',
              }}>Monthly Spends</h3>
              <TrendingUp size={18} color="var(--accent-primary)" />
            </div>

            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthly_spends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-dim)', fontSize: 12, fontWeight: 500 }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-dim)', fontSize: 12, fontWeight: 500 }} 
                    tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                  />
                  <Tooltip 
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }}
                    contentStyle={{ background: 'var(--bg-glass-md)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: 'var(--shadow-xl)' }}
                    itemStyle={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}
                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Spends']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="var(--accent-primary)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="animate-slide-up delay-300 card-solid" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{
                margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 700,
                fontSize: '1.1rem', color: 'var(--text-primary)',
              }}>Payment Methods</h3>
            </div>

            {/* Segmented bar */}
            <div style={{
              display: 'flex', height: '10px', borderRadius: 'var(--radius-full)',
              overflow: 'hidden', marginBottom: '1.5rem',
              background: 'rgba(255,255,255,0.06)',
            }}>
              {data.payment_method_spends?.map((pm, idx) => (
                <div key={idx} style={{
                  width: `${(pm.total / totalPayments) * 100}%`,
                  background: getCategoryColor(pm.payment_method, idx + 5),
                  borderRight: idx < data.payment_method_spends.length - 1 ? '2px solid var(--bg-elevated)' : 'none',
                  transition: 'width 0.5s var(--ease-spring)',
                }} title={`${pm.payment_method}: ₹${pm.total}`} />
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {data.payment_method_spends?.map((pm, idx) => {
                const pct = ((pm.total / totalPayments) * 100).toFixed(0);
                const color = getCategoryColor(pm.payment_method, idx + 5);
                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: color, boxShadow: `0 0 6px ${color}66`, flexShrink: 0,
                      }} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                        {pm.payment_method}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 500 }}>{pct}%</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                        ₹{pm.total.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {(!data.payment_method_spends || data.payment_method_spends.length === 0) && (
                <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '1.5rem 0', fontSize: '0.9rem' }}>
                  No payment methods recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Category Pie Chart */}
          <div className="animate-slide-up delay-400 card-solid" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{
                margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 700,
                fontSize: '1.1rem', color: 'var(--text-primary)',
              }}>Category Breakdown</h3>
            </div>

            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.category_spends.length > 0 ? data.category_spends : [{ category__name: 'None', total: 1 }]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={data.category_spends.length > 0 ? renderCustomizedLabel : false}
                    outerRadius={95}
                    innerRadius={30}
                    dataKey="total"
                    paddingAngle={2}
                  >
                    {data.category_spends.length > 0
                      ? data.category_spends.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category__name, index)} />
                        ))
                      : <Cell fill="rgba(255,255,255,0.08)" />
                    }
                  </Pie>
                  {data.category_spends.length > 0 && (
                    <Tooltip
                      formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                      contentStyle={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--glass-border-md)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        boxShadow: 'var(--shadow-lg)',
                      }}
                      labelStyle={{ color: 'var(--text-secondary)' }}
                    />
                  )}
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem' }}>
              {data.category_spends.map((cat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: getCategoryColor(cat.category__name, idx),
                    boxShadow: `0 0 4px ${getCategoryColor(cat.category__name, idx)}88`,
                  }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {cat.category__name}
                  </span>
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
