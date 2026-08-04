import React, { useState } from 'react';
import { X, Mail, KeyRound, Lock, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL } from '../api';


const ForgotPasswordModal = ({ onClose }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      setStep(3);
    } else {
      setError('Please enter a valid 6-digit OTP');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, new_password: newPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="animate-scale-in" style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        padding: '32px 24px',
        position: 'relative',
        color: 'var(--text-primary)',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        {step !== 4 && (
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            <X size={24} />
          </button>
        )}

        {/* Step 1: Request OTP */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '50%' }}>
                <KeyRound size={48} color="var(--accent-primary)" />
              </div>
            </div>
            
            <h2 style={{ fontSize: '1.4rem', margin: '0 0 8px 0', fontWeight: '600', textAlign: 'center' }}>Forgot Password</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem', textAlign: 'center' }}>
              Enter your registered email address and we'll send you an OTP to reset your password.
            </p>

            {error && <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

            <form onSubmit={handleSendEmail}>
              <div style={{ marginBottom: '20px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px 12px 40px',
                    borderRadius: '8px', border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
                    fontSize: '1rem', outline: 'none'
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', opacity: (loading || !email) ? 0.7 : 1 }}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <div className="animate-fade-in">
            <button 
              onClick={() => setStep(1)}
              style={{ position: 'absolute', top: '16px', left: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft size={24} />
            </button>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '50%' }}>
                <Lock size={48} color="var(--accent-primary)" />
              </div>
            </div>
            
            <h2 style={{ fontSize: '1.4rem', margin: '0 0 8px 0', fontWeight: '600', textAlign: 'center' }}>Verify OTP</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem', textAlign: 'center' }}>
              We've sent a 6-digit OTP to <strong>{email}</strong>
            </p>

            {error && <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

            <form onSubmit={handleVerifyOtp}>
              <div style={{ marginBottom: '24px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                  <KeyRound size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  style={{
                    width: '100%', padding: '12px 14px 12px 40px',
                    borderRadius: '8px', border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
                    fontSize: '1rem', outline: 'none', letterSpacing: '2px', textAlign: 'center'
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={otp.length !== 6}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', opacity: (otp.length !== 6) ? 0.7 : 1 }}
              >
                Verify OTP
              </button>
            </form>
          </div>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <div className="animate-fade-in">
            <button 
              onClick={() => setStep(2)}
              style={{ position: 'absolute', top: '16px', left: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft size={24} />
            </button>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '50%' }}>
                <Lock size={48} color="var(--accent-primary)" />
              </div>
            </div>
            
            <h2 style={{ fontSize: '1.4rem', margin: '0 0 8px 0', fontWeight: '600', textAlign: 'center' }}>Create New Password</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem', textAlign: 'center' }}>
              Please enter a new password for your account.
            </p>

            {error && <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '24px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                  <Lock size={18} />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 40px 12px 40px',
                    borderRadius: '8px', border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
                    fontSize: '1rem', outline: 'none'
                  }}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{ 
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', 
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                  }}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !newPassword}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', opacity: (loading || !newPassword) ? 0.7 : 1 }}
              >
                {loading ? 'Resetting...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="animate-scale-in" style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <CheckCircle2 size={64} color="#10b981" />
            </div>
            
            <h2 style={{ fontSize: '1.4rem', margin: '0 0 8px 0', fontWeight: '600' }}>Password Reset Successful!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
              Your password has been changed successfully. You can now log in with your new credentials.
            </p>

            <button
              onClick={onClose}
              className="btn-primary"
              style={{ width: '100%', padding: '14px' }}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
