import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, CreditCard, Trash2, Edit3, CheckCircle, XCircle } from 'lucide-react';
import AuthAlertModal from '../components/AuthAlertModal';
import { API_BASE_URL } from '../api';

export default function SubscriptionsDashboard() {
  const POPULAR_PLANS = [
    {
      "platform_name": "Amazon Prime",
      "plans": [
        { "plan_name": "Prime Shopping Edition", "price_yearly": 399, "features": ["Free fast delivery on Amazon", "No Prime Video access", "No Amazon Music"] },
        { "plan_name": "Prime Lite", "price_yearly": 799, "features": ["Free fast delivery on Amazon", "Unlimited Prime Video (HD, with ads)", "Watch on Mobile or TV (1 device)"] },
        { "plan_name": "Monthly Prime", "price_monthly": 299, "features": ["All Prime benefits (Shipping, Music, Gaming)", "Ad-free 4K UHD Prime Video", "Watch on 5 devices"] },
        { "plan_name": "Annual Prime", "price_yearly": 1499, "price_quarterly": 599, "features": ["Best Value Plan", "All Prime benefits (Shipping, Music, Gaming)", "Ad-free 4K UHD Prime Video"] }
      ]
    },
    {
      "platform_name": "JioCinema",
      "plans": [
        { "plan_name": "Premium Monthly", "price_monthly": 29, "features": ["Ad-free (except live sports)", "4K Quality", "Watch on Any Device (1 Screen)"] },
        { "plan_name": "Family Monthly", "price_monthly": 89, "features": ["Ad-free (except live sports)", "4K Quality", "Watch on 4 Screens simultaneously"] }
      ]
    },
    {
      "platform_name": "SonyLIV",
      "plans": [
        { "plan_name": "Mobile Only", "price_yearly": 699, "features": ["Watch on Mobile Only", "720p HD Quality"] },
        { "plan_name": "LIV Premium Monthly", "price_monthly": 399, "features": ["Watch on TV, Laptop, Mobile", "Full HD / 4K Quality", "Ad-free (except live sports)"] },
        { "plan_name": "LIV Premium Yearly", "price_yearly": 1499, "features": ["Watch on TV, Laptop, Mobile", "Full HD / 4K Quality", "Concurrent viewing on 2 devices"] }
      ]
    },
    {
      "platform_name": "Zee5",
      "plans": [
        { "plan_name": "Premium HD", "price_six_months": 699, "features": ["2 Screens", "Dolby 5.1 Audio", "Full HD Quality"] },
        { "plan_name": "Premium 4K", "price_yearly": 1499, "features": ["4 Screens", "Dolby Atmos Audio", "4K UHD Quality", "Ad-free content"] }
      ]
    },
    {
      "platform_name": "Netflix",
      "plans": [
        { "plan_name": "Mobile", "price_monthly": 149, "features": ["480p Quality", "Watch on 1 Mobile/Tablet", "Ad-free"] },
        { "plan_name": "Basic", "price_monthly": 199, "features": ["720p HD Quality", "Watch on 1 device", "Ad-free"] },
        { "plan_name": "Standard", "price_monthly": 499, "features": ["1080p Full HD Quality", "Watch on 2 devices", "Ad-free"] },
        { "plan_name": "Premium", "price_monthly": 649, "features": ["4K+HDR Quality", "Watch on 4 devices", "Spatial Audio"] }
      ]
    },
    {
      "platform_name": "Spotify",
      "plans": [
        { "plan_name": "Individual", "price_monthly": 119, "features": ["Ad-free music listening", "Play anywhere - even offline", "On-demand playback"] },
        { "plan_name": "Duo", "price_monthly": 149, "features": ["2 Premium accounts for a couple under one roof", "Ad-free music listening", "Offline playback"] },
        { "plan_name": "Family", "price_monthly": 179, "features": ["Up to 6 Premium accounts", "Block explicit music", "Offline playback"] },
        { "plan_name": "Student", "price_monthly": 59, "features": ["Special discount for eligible students", "Ad-free music listening", "Offline playback"] }
      ]
    },
    {
      "platform_name": "YouTube Premium",
      "plans": [
        { "plan_name": "Individual", "price_monthly": 129, "features": ["Ad-free videos", "Background play", "YouTube Music Premium included"] },
        { "plan_name": "Family", "price_monthly": 189, "features": ["Add up to 5 family members (13+)", "Ad-free videos", "YouTube Music Premium included"] },
        { "plan_name": "Student", "price_monthly": 79, "features": ["Eligible students only", "Ad-free videos", "YouTube Music Premium included"] }
      ]
    },
    {
      "platform_name": "JioSaavn Pro",
      "plans": [
        { "plan_name": "Pro Monthly", "price_monthly": 99, "features": ["Ad-free music", "Unlimited downloads", "High-quality audio"] },
        { "plan_name": "Pro Yearly", "price_yearly": 749, "features": ["Best Value", "Ad-free music", "Unlimited downloads"] }
      ]
    },
    {
      "platform_name": "ShemarooMe",
      "plans": [
        { "plan_name": "Premium Monthly", "price_monthly": 129, "features": ["Bollywood Premieres", "Ad-free (except live content)", "2 Screens"] },
        { "plan_name": "Premium Yearly", "price_yearly": 749, "features": ["Best Value", "Bollywood Premieres", "Ad-free (except live content)"] }
      ]
    }
  ];

  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    billing_cycle: 'Monthly',
    next_billing_date: '',
    description: ''
  });

  const handleAction = (action) => {
    if (!localStorage.getItem('access_token')) {
      setShowGuestModal(true);
    } else {
      action();
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setSubscriptions([
          { id: 1, name: 'Netflix', amount: 1499, billing_cycle: 'Monthly', next_billing_date: '2026-08-15', is_active: true },
          { id: 2, name: 'Spotify Premium', amount: 119, billing_cycle: 'Monthly', next_billing_date: '2026-08-10', is_active: true },
          { id: 3, name: 'Amazon Prime', amount: 1499, billing_cycle: 'Yearly', next_billing_date: '2027-01-01', is_active: true }
        ]);
        setLoading(false);
        return;
      }
      
      const res = await fetch(`${API_BASE_URL}/api/subscriptions/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login');
        }
        throw new Error('Failed to fetch data');
      }
      
      const data = await res.json();
      setSubscriptions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const payload = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        billing_cycle: formData.billing_cycle,
        next_billing_date: formData.next_billing_date || null,
        description: formData.description
      };
      
      const res = await fetch(`${API_BASE_URL}/api/subscriptions/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setShowAddModal(false);
        setFormData({ name: '', amount: '', billing_cycle: 'Monthly', next_billing_date: '', description: '' });
        fetchSubscriptions();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteSubscription = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/subscriptions/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchSubscriptions();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/subscriptions/${id}/`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) {
        fetchSubscriptions();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const activeSubscriptions = subscriptions.filter(s => s.is_active);
  const monthlyTotal = activeSubscriptions.reduce((acc, sub) => {
    if (sub.billing_cycle === 'Monthly') return acc + parseFloat(sub.amount);
    if (sub.billing_cycle === 'Yearly') return acc + (parseFloat(sub.amount) / 12);
    if (sub.billing_cycle === 'Weekly') return acc + (parseFloat(sub.amount) * 4);
    return acc;
  }, 0);

  const inputSt = { width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border-md)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--glass-border)', borderTop: '3px solid var(--accent-primary)', animation: 'spin-slow 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg-deep)', minHeight: '100vh', paddingBottom: '5rem', fontFamily: 'var(--font-body)', position: 'relative' }}>
      <div className="bg-animation-wrapper">
        <div className="shape shape-1" style={{ opacity: 0.4 }} />
        <div className="shape shape-2" style={{ opacity: 0.3 }} />
      </div>

      <div className="tools-header" style={{ marginBottom: '2rem' }}>
        <div className="page-container flex-responsive-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar color="var(--accent-violet)" size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Subscriptions</h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '1px' }}>Manage recurring payments</div>
            </div>
          </div>
          <button onClick={() => handleAction(() => setShowAddModal(true))} className="btn-primary" style={{ padding: '0.5rem 1.125rem', fontSize: '0.875rem' }}>
            <Plus size={15} /> Add Subscription
          </button>
        </div>
      </div>

      <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Overview */}
        <div className="animate-slide-up card-solid" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.08) 100%)', borderRadius: 'var(--radius-2xl)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(139,92,246,0.25), transparent)', filter: 'blur(25px)', pointerEvents: 'none' }} />
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Estimated Monthly Cost</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.5rem' }}>
            ₹{monthlyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{activeSubscriptions.length} active subscriptions</div>
        </div>

        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem' }}>Your Subscriptions</h3>

        {subscriptions.length === 0 && (
          <div className="animate-scale-in card-solid" style={{ padding: '3rem', textAlign: 'center' }}>
            <CreditCard size={40} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>No subscriptions yet</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Add your recurring subscriptions to track costs.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '2.5rem' }}>
          {subscriptions.map(sub => (
            <div key={sub.id} className="animate-slide-up card-solid" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: sub.is_active ? 1 : 0.55, transition: 'transform 0.25s var(--ease-bounce), box-shadow 0.25s, opacity 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: sub.is_active ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${sub.is_active ? 'rgba(59,130,246,0.25)' : 'var(--glass-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sub.is_active ? 'var(--accent-primary)' : 'var(--text-dim)', flexShrink: 0 }}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>{sub.name}</h4>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ background: 'var(--bg-glass)', padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 600 }}>{sub.billing_cycle}</span>
                    {sub.next_billing_date && <span>Next: {new Date(sub.next_billing_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>₹{parseFloat(sub.amount).toLocaleString('en-IN')}</div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button onClick={() => handleAction(() => toggleStatus(sub.id, sub.is_active))} title={sub.is_active ? 'Pause' : 'Resume'}
                    style={{ background: 'var(--bg-glass)', border: '1px solid var(--glass-border)', cursor: 'pointer', color: sub.is_active ? 'var(--accent-amber)' : 'var(--accent-emerald)', padding: '6px', borderRadius: 'var(--radius-sm)', display: 'flex' }}>
                    {sub.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                  </button>
                  <button onClick={() => handleAction(() => deleteSubscription(sub.id))} title="Delete"
                    style={{ background: 'var(--bg-glass)', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--accent-rose)', padding: '6px', borderRadius: 'var(--radius-sm)', display: 'flex' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Explore */}
        <div style={{ marginTop: '3rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem' }}>Explore Popular Subscriptions (India)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {POPULAR_PLANS.map((platform, idx) => (
              <div key={idx} className="animate-slide-up card-solid" style={{ animationDelay: `${idx * 30}ms`, padding: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', paddingBottom: '0.625rem', borderBottom: '1px solid var(--glass-border)' }}>{platform.platform_name}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {platform.plans.map((plan, pIdx) => (
                    <div key={pIdx} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{plan.plan_name}</span>
                        <span style={{ fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-heading)', fontSize: '0.9rem' }}>
                          ₹{plan.price_monthly || plan.price_yearly || plan.price_six_months || plan.price_quarterly}<span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 500 }}>/{plan.price_monthly ? 'mo' : 'yr'}</span>
                        </span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.6 }}>
                        {plan.features.map((f, fIdx) => <li key={fIdx}>{f}</li>)}
                      </ul>
                      <button onClick={() => { setFormData({ name: `${platform.platform_name} - ${plan.plan_name}`, amount: plan.price_monthly || plan.price_yearly || plan.price_six_months || plan.price_quarterly, billing_cycle: plan.price_monthly ? 'Monthly' : 'Yearly', next_billing_date: '', description: plan.features.join(', ') }); handleAction(() => setShowAddModal(true)); }}
                        className="btn-secondary" style={{ marginTop: '0.25rem', fontSize: '0.8rem', padding: '0.4rem 0.875rem', justifyContent: 'center' }}>
                        <Plus size={13} /> Add to tracker
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="modal-panel animate-scale-in" style={{ width: '90%', maxWidth: '420px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800 }}>Add Subscription</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'var(--bg-glass)', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: 'var(--radius-sm)', display: 'flex' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <label className="auth-label">Service Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputSt} placeholder="e.g. Netflix"
                onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.boxShadow = 'none'; }} />
              <label className="auth-label">Amount (₹)</label>
              <input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} style={inputSt}
                onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.boxShadow = 'none'; }} />
              <label className="auth-label">Billing Cycle</label>
              <select value={formData.billing_cycle} onChange={e => setFormData({...formData, billing_cycle: e.target.value})} style={{ ...inputSt, cursor: 'pointer' }}>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
                <option value="Weekly">Weekly</option>
              </select>
              <label className="auth-label">Next Billing Date</label>
              <input type="date" required value={formData.next_billing_date} onChange={e => setFormData({...formData, next_billing_date: e.target.value})} style={{ ...inputSt, marginBottom: '1.25rem' }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.boxShadow = 'none'; }} />
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showGuestModal && (
        <AuthAlertModal onClose={() => setShowGuestModal(false)} message="Please log in to manage your subscriptions." />
      )}
    </div>
  );
}
