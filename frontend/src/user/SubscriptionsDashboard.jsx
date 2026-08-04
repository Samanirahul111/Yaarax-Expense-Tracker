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

  if (loading) return <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: 'var(--text-secondary)' }}>Loading...</div></div>;

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: '4rem', fontFamily: 'var(--font-family)' }}>
      
      <div className="bg-animation-wrapper">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>

      <div className="tools-header" style={{ marginBottom: '2.5rem' }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '8px', background: 'white', borderRadius: '10px' }}>
            <Calendar color="var(--accent-primary)" size={24} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>Subscriptions</h2>
        </div>
      </div>

      <div className="page-container">
        
        {/* Overview Card */}
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem', background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div className="responsive-flex-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '500' }}>Estimated Monthly Cost</div>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                ₹{monthlyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                From {activeSubscriptions.length} active subscriptions
              </div>
            </div>
            <div>
              <button onClick={() => handleAction(() => setShowAddModal(true))} className="btn-primary hover-lift" style={{ padding: '0.8rem 1.5rem', fontSize: '1rem', boxShadow: '0 10px 20px -5px rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} /> Add Subscription
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="animate-slide-up delay-100" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontWeight: '700', fontSize: '1.25rem', color: 'var(--text-primary)' }}>Your Subscriptions</h3>
          
          {subscriptions.length === 0 && (
            <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px solid rgba(0,0,0,0.05)' }}>
              No subscriptions added yet.
            </div>
          )}

          {subscriptions.map(sub => (
            <div key={sub.id} style={{ 
              background: 'white', 
              padding: '1.5rem', 
              borderRadius: '20px', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.05)',
              opacity: sub.is_active ? 1 : 0.6
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '12px', 
                  background: sub.is_active ? 'var(--bg-primary)' : '#f1f5f9', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: sub.is_active ? 'var(--accent-primary)' : 'var(--text-secondary)'
                }}>
                  <CreditCard size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {sub.name}
                  </h4>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{sub.billing_cycle}</span>
                    {sub.next_billing_date && (
                      <>
                        <span>•</span>
                        <span>Next bill: {new Date(sub.next_billing_date).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    ₹{parseFloat(sub.amount).toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleAction(() => toggleStatus(sub.id, sub.is_active))}
                    title={sub.is_active ? "Pause" : "Resume"}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: sub.is_active ? '#eab308' : '#22c55e', padding: '8px' }}
                  >
                    {sub.is_active ? <XCircle size={20} /> : <CheckCircle size={20} />}
                  </button>
                  <button 
                    onClick={() => handleAction(() => deleteSubscription(sub.id))}
                    title="Delete"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '8px' }}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Explore Popular Subscriptions */}
        <div className="animate-slide-up delay-200" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '3rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontWeight: '700', fontSize: '1.25rem', color: 'var(--text-primary)' }}>Explore Popular Subscriptions (India)</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {POPULAR_PLANS.map((platform, idx) => (
              <div key={idx} style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', borderBottom: '2px solid var(--bg-primary)', paddingBottom: '0.5rem' }}>
                  {platform.platform_name}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {platform.plans.map((plan, pIdx) => (
                    <div key={pIdx} style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{plan.plan_name}</span>
                        <span style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>
                          ₹{plan.price_monthly || plan.price_yearly || plan.price_six_months || plan.price_quarterly}
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/{plan.price_monthly ? 'mo' : plan.price_yearly ? 'yr' : 'cycle'}</span>
                        </span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {plan.features.map((f, fIdx) => <li key={fIdx}>{f}</li>)}
                      </ul>
                      <button 
                        onClick={() => {
                          setFormData({
                            name: `${platform.platform_name} - ${plan.plan_name}`,
                            amount: plan.price_monthly || plan.price_yearly || plan.price_six_months || plan.price_quarterly,
                            billing_cycle: plan.price_monthly ? 'Monthly' : plan.price_yearly ? 'Yearly' : 'Monthly',
                            next_billing_date: '',
                            description: plan.features.join(', ')
                          });
                          handleAction(() => setShowAddModal(true));
                        }}
                        style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: 'var(--text-primary)', transition: 'background 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <Plus size={16} /> Add to tracker
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
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-primary)', borderRadius: '24px', width: '100%', maxWidth: '400px',
            padding: '30px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <button onClick={() => setShowAddModal(false)} style={{
              position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)'
            }}>✕</button>
            <h2 style={{ margin: '0 0 24px 0', color: 'var(--text-primary)' }}>Add Subscription</h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Service Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', boxSizing: 'border-box' }} placeholder="e.g. Netflix" />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Amount (₹)</label>
                <input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Billing Cycle</label>
                <select value={formData.billing_cycle} onChange={(e) => setFormData({...formData, billing_cycle: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', boxSizing: 'border-box' }}>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Next Billing Date</label>
                <input type="date" required value={formData.next_billing_date} onChange={(e) => setFormData({...formData, next_billing_date: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Save Subscription</button>
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
