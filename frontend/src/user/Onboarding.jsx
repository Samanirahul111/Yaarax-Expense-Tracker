import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, GraduationCap, Briefcase, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../api';

const USER_TYPES = [
  { key: 'personal', label: 'Personal', icon: <User size={20} />, desc: 'Manage personal finances' },
  { key: 'student', label: 'Student', icon: <GraduationCap size={20} />, desc: 'Budget on a student income' },
  { key: 'employee', label: 'Employee', icon: <Briefcase size={20} />, desc: 'Track salary & expenses' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ user_type: '', date_of_birth: '', perspective: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.user_type || !formData.date_of_birth) return setError('Please fill in all required fields.');
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/auth/profile/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        let data;
        try { data = await res.json(); } catch (e) { throw new Error('Server returned an invalid response.'); }
        throw new Error(data.error || 'Failed to save profile');
      }
      navigate('/dashboard');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const inputSt = { width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border-md)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' };

  return (
    <div className="animate-fade-in" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <div className="bg-animation-wrapper">
        <div className="shape shape-1" />
        <div className="shape shape-2" style={{ opacity: 0.5 }} />
      </div>

      <div className="animate-scale-in" style={{
        background: 'var(--bg-elevated)', padding: '2.5rem', borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-xl)', maxWidth: '560px', width: '100%',
        border: '1px solid var(--glass-border-md)', position: 'relative', zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-lg)', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: 'var(--shadow-glow)' }}>
            <Sparkles color="white" size={26} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.5rem', background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Complete Your Profile
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tell us about yourself to personalize your experience.</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(244,63,94,0.12)', color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.25)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label className="auth-label" style={{ marginBottom: '0.75rem', display: 'block' }}>I am using this app as a: *</label>
            <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
              {USER_TYPES.map(type => (
                <label key={type.key} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', cursor: 'pointer',
                  padding: '1rem', border: formData.user_type === type.key ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border-md)',
                  borderRadius: 'var(--radius-lg)', background: formData.user_type === type.key ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
                  flex: '1', transition: 'all 0.2s var(--ease-bounce)', minWidth: '120px',
                  boxShadow: formData.user_type === type.key ? '0 0 0 3px rgba(59,130,246,0.15)' : 'none',
                }}>
                  <input type="radio" name="user_type" value={type.key} checked={formData.user_type === type.key} onChange={handleChange} style={{ display: 'none' }} />
                  <div style={{ color: formData.user_type === type.key ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>{type.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: formData.user_type === type.key ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{type.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center' }}>{type.desc}</div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="auth-label">Date of Birth *</label>
            <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} style={inputSt} required
              onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.boxShadow = 'none'; }} />
          </div>

          <div>
            <label className="auth-label">What's your goal? (Optional)</label>
            <textarea name="perspective" value={formData.perspective} onChange={handleChange} rows={3}
              placeholder="e.g. I want to save money for a car..." style={{ ...inputSt, resize: 'vertical' }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.boxShadow = 'none'; }} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', opacity: loading ? 0.7 : 1, marginTop: '0.5rem' }}>
            {loading ? 'Saving…' : <><span>Finish Setup</span><ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
