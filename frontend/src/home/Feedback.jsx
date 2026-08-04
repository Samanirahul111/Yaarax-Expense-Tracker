import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../api';

export default function Feedback() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    rating: 5
  });
  const [status, setStatus] = useState({ loading: false, error: null, success: false });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: false });

    try {
      const token = localStorage.getItem('access_token');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/feedback/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback. Please try again.');
      }

      setStatus({ loading: false, error: null, success: true });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: false });
    }
  };

  return (
    <div className="home-container">
      {/* Animated Professional Background */}
      <div className="bg-animation-wrapper">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <Navbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '600px', padding: '3rem' }}>
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              We Value Your <span className="text-highlight">Feedback</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              Tell us what you love about Yaarax or what we could improve.
            </p>
          </div>

          {status.success ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <CheckCircle2 size={64} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Thank You!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Your feedback has been successfully submitted. We appreciate your input!</p>
              <button 
                className="btn-primary" 
                onClick={() => setStatus({ ...status, success: false })}
                style={{ width: '100%' }}
              >
                Submit Another Response
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {status.error && (
                <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertCircle size={20} />
                  {status.error}
                </div>
              )}

              <div>
                <label className="auth-label">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="auth-input"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="auth-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="auth-input"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="auth-label" style={{ marginBottom: '0.75rem' }}>How would you rate Yaarax?</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={28}
                      onClick={() => setFormData({ ...formData, rating: star })}
                      style={{
                        cursor: 'pointer',
                        color: star <= formData.rating ? '#fbbf24' : '#d1d5db',
                        fill: star <= formData.rating ? '#fbbf24' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="auth-label">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="auth-input"
                  placeholder="How can we improve?"
                  rows="5"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary hover-lift" 
                disabled={status.loading}
                style={{ marginTop: '1rem', width: '100%', fontSize: '1.1rem', padding: '14px' }}
              >
                {status.loading ? 'Submitting...' : (
                  <>
                    Send Feedback <Send size={18} style={{ marginLeft: '10px' }} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
