import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, TrendingUp, CreditCard } from 'lucide-react';
import { getCategoryColor } from './utils';
import { API_BASE_URL } from '../api';

function SegmentedBar({ items, getValue, getLabel, getColor }) {
  const total = items.reduce((a, i) => a + getValue(i), 0) || 1;
  return (
    <div style={{ display: 'flex', height: '12px', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.06)' }}>
      {items.map((item, idx) => (
        <div key={idx} style={{
          width: `${(getValue(item) / total) * 100}%`,
          background: getColor(item, idx),
          borderRight: idx < items.length - 1 ? '2px solid var(--bg-elevated)' : 'none',
          transition: 'width 0.5s var(--ease-spring)',
        }} title={`${getLabel(item)}: ₹${getValue(item)}`} />
      ))}
    </div>
  );
}

function AnalyticsCard({ icon, title, children, delay }) {
  return (
    <div className={`animate-slide-up ${delay} card-solid`} style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
          {icon}
        </div>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function Analytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setData({
          total_spends_this_month: 25400,
          monthly_budget: 35000,
          monthly_spends: [{ month: 'Apr', total: 18000 }, { month: 'May', total: 22000 }, { month: 'Jun', total: 24000 }, { month: 'Jul', total: 25400 }],
          category_spends: [{ category__name: 'Food', total: 8500 }, { category__name: 'Rent', total: 12000 }, { category__name: 'Transport', total: 2900 }, { category__name: 'Entertainment', total: 2000 }],
          payment_method_spends: [{ payment_method: 'Credit Card', total: 15400 }, { payment_method: 'UPI', total: 10000 }]
        });
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_BASE_URL}/api/dashboard-data/`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) {
        if (res.status === 401) { localStorage.removeItem('access_token'); navigate('/login'); }
        throw new Error('Failed to fetch analytics');
      }
      setData(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--glass-border)', borderTop: '3px solid var(--accent-primary)', animation: 'spin-slow 0.8s linear infinite' }} />
    </div>
  );
  if (!data) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Error loading data</div>;

  const totalCat = data.category_spends.reduce((a, c) => a + c.total, 0) || 1;
  const totalPay = (data.payment_method_spends || []).reduce((a, p) => a + p.total, 0) || 1;
  const maxMonth = Math.max(...data.monthly_spends.map(m => m.total), 1);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '5rem', minHeight: '100vh', background: 'var(--bg-deep)', position: 'relative' }}>
      <div className="bg-animation-wrapper">
        <div className="shape shape-1" style={{ opacity: 0.4 }} />
        <div className="shape shape-2" style={{ opacity: 0.3 }} />
      </div>

      <div className="tools-header" style={{ marginBottom: '2rem' }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 color="var(--accent-primary)" size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Analytics</h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '1px' }}>Spending insights & breakdowns</div>
          </div>
        </div>
      </div>

      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', zIndex: 1 }}>

        {/* Monthly Trend */}
        <AnalyticsCard icon={<TrendingUp size={18} />} title="Monthly Trend" delay="delay-100">
          <div style={{ position: 'relative', height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingRight: '2.5rem' }}>
            {[1, 0.75, 0.5, 0.25, 0].map((r, i) => (
              <div key={i} style={{ position: 'absolute', bottom: `${r * 100}%`, left: 0, right: 0, borderBottom: `1px dashed rgba(255,255,255,${r === 0 ? 0.1 : 0.05})` }}>
                <span style={{ position: 'absolute', right: 0, fontSize: '0.7rem', color: 'var(--text-dim)', transform: 'translateY(50%)', paddingLeft: '0.5rem' }}>
                  ₹{((maxMonth * r) / 1000).toFixed(0)}k
                </span>
              </div>
            ))}
            {data.monthly_spends.map((m, idx) => {
              const h = (m.total / maxMonth) * 100;
              const isCurrent = idx === data.monthly_spends.length - 1;
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '18%', position: 'relative' }}>
                  {isCurrent && m.total > 0 && (
                    <div style={{ position: 'absolute', bottom: `calc(${h}% + 8px)`, background: 'var(--bg-elevated)', border: '1px solid var(--glass-border-md)', color: 'var(--text-primary)', padding: '0.25rem 0.45rem', borderRadius: 'var(--radius-sm)', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      ₹{m.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  )}
                  <div style={{ width: '100%', height: `${h}%`, minHeight: m.total > 0 ? '4px' : '0', background: isCurrent ? 'var(--grad-primary)' : 'rgba(255,255,255,0.08)', borderRadius: '6px 6px 0 0', boxShadow: isCurrent ? 'var(--shadow-glow)' : 'none', transition: 'height 0.6s var(--ease-spring)' }} />
                  <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: isCurrent ? 'var(--text-primary)' : 'var(--text-dim)', fontWeight: isCurrent ? 700 : 500 }}>{m.month}</div>
                </div>
              );
            })}
          </div>
        </AnalyticsCard>

        {/* Category Breakdown */}
        <AnalyticsCard icon={<BarChart2 size={18} />} title="Spends by Category" delay="delay-200">
          <SegmentedBar items={data.category_spends} getValue={c => c.total} getLabel={c => c.category__name} getColor={(c, i) => getCategoryColor(c.category__name, i)} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {data.category_spends.map((cat, idx) => {
              const pct = ((cat.total / totalCat) * 100).toFixed(1);
              const color = getCategoryColor(cat.category__name, idx);
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}66`, flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>{cat.category__name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>({pct}%)</span>
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem' }}>₹{cat.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 'var(--radius-full)', transition: 'width 0.6s var(--ease-spring)' }} />
                  </div>
                </div>
              );
            })}
            {data.category_spends.length === 0 && <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '1.5rem 0' }}>No category data.</div>}
          </div>
        </AnalyticsCard>

        {/* Payment Methods */}
        {data.payment_method_spends && data.payment_method_spends.length > 0 && (
          <AnalyticsCard icon={<CreditCard size={18} />} title="Spends by Payment Method" delay="delay-300">
            <SegmentedBar items={data.payment_method_spends} getValue={p => p.total} getLabel={p => p.payment_method} getColor={(p, i) => getCategoryColor(p.payment_method, i + 5)} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {data.payment_method_spends.map((pm, idx) => {
                const pct = ((pm.total / totalPay) * 100).toFixed(1);
                const color = getCategoryColor(pm.payment_method, idx + 5);
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}66`, flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>{pm.payment_method}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>({pct}%)</span>
                      </div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem' }}>₹{pm.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 'var(--radius-full)', transition: 'width 0.6s var(--ease-spring)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </AnalyticsCard>
        )}
      </div>
    </div>
  );
}
