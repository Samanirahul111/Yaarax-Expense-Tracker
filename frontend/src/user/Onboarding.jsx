import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api';


export default function Onboarding() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_type: '',
    date_of_birth: '',
    perspective: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.user_type || !formData.date_of_birth) {
      return setError('Please fill in all required fields.');
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/auth/profile/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        let data;
        try {
          data = await res.json();
        } catch (e) {
          throw new Error('Server returned an invalid response. Please check the backend console.');
        }
        throw new Error(data.error || 'Failed to save profile');
      }
      
      alert('Profile saved successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-muted)', padding: '2rem' 
    }}>
      <div className="animate-scale-in" style={{ 
        background: 'white', padding: '3rem', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', 
        maxWidth: '600px', width: '100%', border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <h1 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem', fontSize: '2rem', fontWeight: 'bold', textAlign: 'center' }}>
          Complete Your Profile
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center', fontSize: '1rem' }}>
          Tell us a bit about yourself so we can tailor the experience to your needs.
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* User Type */}
          <div>
            <label className="auth-label" style={{ marginBottom: '0.5rem', display: 'block' }}>I am using this app as a: *</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {['personal', 'student', 'employee'].map(type => (
                <label key={type} className="hover-lift" style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                  padding: '1rem 1rem', border: formData.user_type === type ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  borderRadius: '12px', background: formData.user_type === type ? '#eff6ff' : 'white', flex: '1', justifyContent: 'center',
                  fontWeight: formData.user_type === type ? '600' : '400', color: formData.user_type === type ? 'var(--accent-primary)' : 'var(--text-primary)',
                  transition: 'all 0.2s ease', minWidth: '120px'
                }}>
                  <input type="radio" name="user_type" value={type} checked={formData.user_type === type} onChange={handleChange} style={{ display: 'none' }} />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="auth-label">Date of Birth *</label>
            <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="auth-input" required />
          </div>

          {/* Perspective */}
          <div>
            <label className="auth-label">What is your perspective to use this app? (Optional)</label>
            <textarea name="perspective" value={formData.perspective} onChange={handleChange} className="auth-input" placeholder="e.g. I want to save money for a car..." rows="3" style={{ resize: 'vertical' }}></textarea>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving...' : 'Finish Onboarding'}
          </button>
        </form>
      </div>
    </div>
  );
}
