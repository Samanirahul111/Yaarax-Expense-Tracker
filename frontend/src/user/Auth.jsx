import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Wallet, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import ForgotPasswordModal from './ForgotPasswordModal';
import { API_BASE_URL } from '../api';


export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Form States
  const [signupData, setSignupData] = useState({ username: '', email: '', mobile_number: '', password: '', confirmPassword: '' });
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  // Password Strength Logic
  const calculateStrength = () => {
    let score = 0;
    const pwd = signupData.password;
    if (!pwd) return 0;
    if (pwd.length > 8) score += 20;
    if (pwd.length > 12) score += 20;
    if (/[A-Z]/.test(pwd)) score += 20;
    if (/[0-9]/.test(pwd)) score += 20;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 20;
    return Math.min(score, 100);
  };

  const getStrengthColor = () => {
    const score = calculateStrength();
    if (score <= 20) return '#ef4444'; // Red (Weak)
    if (score <= 60) return '#eab308'; // Yellow (Fair)
    if (score <= 80) return '#3b82f6'; // Blue (Good)
    return '#22c55e'; // Green (Strong)
  };

  const getStrengthLabel = () => {
    const score = calculateStrength();
    if (score === 0) return '';
    if (score <= 20) return 'Weak';
    if (score <= 60) return 'Fair';
    if (score <= 80) return 'Good';
    return 'Strong';
  };

  // OTP States
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState(''); // Stores email where OTP was sent

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    if (localStorage.getItem('access_token')) {
      navigate('/dashboard', { replace: true });
      return;
    }
    
    setIsLogin(location.pathname === '/login');
    setError(''); // Clear error when switching modes
    setIsOtpStep(false);
    setOtp('');
  }, [location, navigate]);

  const toggleMode = (e) => {
    e.preventDefault();
    if (isLogin) {
      navigate('/signup');
    } else {
      navigate('/login');
    }
  };

  const handleSignupChange = (e) => setSignupData({ ...signupData, [e.target.name]: e.target.value });
  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (signupData.password !== signupData.confirmPassword) {
      return setError("Passwords do not match");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupData.email)) {
      return setError("Please enter a valid email address");
    }

    const mobileClean = signupData.mobile_number.replace(/\D/g, '');
    if (mobileClean.length !== 10) {
      return setError("Mobile number must be exactly 10 digits");
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: signupData.username,
          email: signupData.email,
          mobile_number: signupData.mobile_number,
          password: signupData.password
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        let errorMsg = data.error || 'Signup failed';
        if (data.details) {
          // Extract specific validation errors (e.g., email already exists)
          const detailMessages = Object.values(data.details).flat().join(', ');
          if (detailMessages) errorMsg = detailMessages;
        }
        throw new Error(errorMsg);
      }      
      alert('Signup successful! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      // Email was sent, show OTP screen
      setVerifiedEmail(data.email);
      setIsOtpStep(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifiedEmail, otp })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OTP Verification failed');
      
      // OTP matched, navigate to the new dashboard page
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      // Check if user has completed onboarding profile
      try {
        const profileRes = await fetch(`${API_BASE_URL}/api/auth/profile/`, {
          headers: {
            'Authorization': `Bearer ${data.access}`
          }
        });
        
        if (profileRes.ok) {
          setLoginSuccess(true);
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          setLoginSuccess(true);
          setTimeout(() => navigate('/onboarding'), 1500);
        }
      } catch (e) {
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      background: 'var(--bg-muted)'
    }}>
      <div className="animate-scale-in hover-lift auth-container" style={{
        position: 'relative',
        maxWidth: '1100px',
        width: '100%',
        minHeight: isLogin ? '650px' : '880px',
        transition: 'min-height 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        
        {/* Left Side (Underneath): Signup Form */}
        <div className={`auth-form-panel mobile-p-4 ${isLogin ? 'inactive-mobile' : ''}`} style={{ 
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '50%', 
          padding: '4rem 4rem', 
          textAlign: 'center',
          opacity: isLogin ? 0 : 1,
          visibility: isLogin ? 'hidden' : 'visible',
          transition: 'opacity 0.3s ease, visibility 0.3s',
          transitionDelay: isLogin ? '0s' : '0.3s'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '12px' }}>
              <Wallet color="var(--accent-primary)" size={32} />
            </div>
          </div>
          
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '700' }}>Create your account</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.95rem' }}>
            Start managing your expenses professionally.
          </p>

          {!isLogin && error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}
          
          <form style={{ display: 'flex', flexDirection: 'column' }} onSubmit={handleSignupSubmit}>
            <div>
              <label className="auth-label">Username</label>
              <input type="text" name="username" value={signupData.username} onChange={handleSignupChange} className="auth-input" placeholder="e.g. rahul_samani" required />
            </div>
            <div>
              <label className="auth-label">Email</label>
              <input type="email" name="email" value={signupData.email} onChange={handleSignupChange} className="auth-input" placeholder="you@company.com" required />
            </div>
            <div>
              <label className="auth-label">Mobile Number</label>
              <input type="tel" name="mobile_number" value={signupData.mobile_number} onChange={handleSignupChange} className="auth-input" placeholder="Enter Your Number" />
            </div>
            <div>
              <label className="auth-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={signupData.password} 
                  onChange={handleSignupChange} 
                  className="auth-input" 
                  placeholder="••••••••" 
                  required 
                  style={{ paddingRight: '40px' }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', 
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {signupData.password.length > 0 && (
                <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '500' }}>
                    <span>Password Strength</span>
                    <span style={{ color: getStrengthColor() }}>{getStrengthLabel()}</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${calculateStrength()}%`, 
                      background: getStrengthColor(),
                      transition: 'width 0.3s ease, background-color 0.3s ease'
                    }}></div>
                  </div>
                </div>
              )}
            </div>
            <div style={signupData.password.length > 0 ? {} : { marginTop: '1rem' }}>
              <label className="auth-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword" 
                  value={signupData.confirmPassword} 
                  onChange={handleSignupChange} 
                  className="auth-input" 
                  placeholder="••••••••" 
                  required 
                  style={{ paddingRight: '40px' }}
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ 
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', 
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
  
          <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Already have an account? <a href="#" onClick={toggleMode} className="text-highlight" style={{ fontWeight: '500' }}>Log in</a>
          </p>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Or return to the <Link to="/" className="text-highlight" style={{ fontWeight: '500' }}>Home page</Link>
          </p>
        </div>

        {/* Right Side (Underneath): Login & OTP Forms */}
        <div className={`auth-form-panel mobile-p-4 ${!isLogin ? 'inactive-mobile' : ''}`} style={{ 
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '50%', 
          padding: '4rem 4rem', 
          textAlign: 'center',
          opacity: isLogin ? 1 : 0,
          visibility: isLogin ? 'visible' : 'hidden',
          transition: 'opacity 0.3s ease, visibility 0.3s',
          transitionDelay: isLogin ? '0.3s' : '0s'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', marginTop: '2rem' }}>
            <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '12px' }}>
              <Wallet color="var(--accent-primary)" size={32} />
            </div>
          </div>
          
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '700' }}>
            {isOtpStep ? 'Verify OTP' : 'Welcome Back'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.95rem' }}>
            {isOtpStep ? `We sent a 6-digit code to ${verifiedEmail}` : 'Login to your professional dashboard.'}
          </p>

          {isLogin && error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}
          
          {loginSuccess ? (
            <div className="animate-scale-in" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <CheckCircle2 color="#22c55e" size={72} />
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: '700' }}>Login Successful!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Redirecting to your dashboard...</p>
            </div>
          ) : !isOtpStep ? (
            <form style={{ display: 'flex', flexDirection: 'column' }} onSubmit={handleLoginSubmit}>
              <div>
                <label className="auth-label">Email or Username</label>
                <input type="text" name="identifier" value={loginData.identifier} onChange={handleLoginChange} className="auth-input" placeholder="you@company.com" required />
              </div>
              <div style={{ position: 'relative' }}>
                <label className="auth-label">Password</label>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setShowForgotModal(true); }}
                  style={{ position: 'absolute', right: 0, top: 0, fontSize: '0.85rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '500', zIndex: 10 }}
                >
                  Forgot Password?
                </a>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showLoginPassword ? "text" : "password"} 
                    name="password" 
                    value={loginData.password} 
                    onChange={handleLoginChange} 
                    className="auth-input" 
                    placeholder="••••••••" 
                    required 
                    style={{ paddingRight: '40px', width: '100%', boxSizing: 'border-box' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    style={{ 
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', 
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                    }}
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
          ) : (
            <form style={{ display: 'flex', flexDirection: 'column' }} onSubmit={handleOtpSubmit}>
              <div>
                <label className="auth-label">One-Time Password</label>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  className="auth-input" 
                  placeholder="123456" 
                  maxLength={6}
                  required 
                  style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }}
                />
              </div>
              <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary" style={{ width: '100%', marginTop: '1rem', opacity: (loading || otp.length !== 6) ? 0.7 : 1 }}>
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
              <button 
                type="button" 
                onClick={() => setIsOtpStep(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', marginTop: '1rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Back to Login
              </button>
            </form>
          )}
  
          <p style={{ marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Don't have an account? <a href="#" onClick={toggleMode} className="text-highlight" style={{ fontWeight: '500' }}>Sign up</a>
          </p>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Or return to the <Link to="/" className="text-highlight" style={{ fontWeight: '500' }}>Home page</Link>
          </p>
        </div>

        {/* Sliding Info Panel (Overlay) */}
        <div className="auth-slider-panel" style={{ 
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: '50%',
          background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '4rem 4rem',
          transform: isLogin ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
          zIndex: 10,
          boxShadow: isLogin ? '20px 0 50px rgba(0,0,0,0.1)' : '-20px 0 50px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 'bold', color: 'white' }}>Master Your Finances.</h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            Yaarax Expense Tracker is the ultimate professional standard for tracking personal and business cash flow. 
            Gain complete visibility into your spending, automate your budgeting, and achieve financial freedom.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <div className="hover-slide-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.05rem', fontWeight: '500', color: 'white' }}>
               <CheckCircle2 color="white" size={24} /> 
               <span>Real-time spending & revenue insights</span>
             </div>
             <div className="hover-slide-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.05rem', fontWeight: '500', color: 'white' }}>
               <CheckCircle2 color="white" size={24} /> 
               <span>Bank-grade 256-bit encryption security</span>
             </div>
             <div className="hover-slide-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.05rem', fontWeight: '500', color: 'white' }}>
               <CheckCircle2 color="white" size={24} /> 
               <span>Customizable budgeting algorithms</span>
             </div>
          </div>
        </div>

      </div>

      {showForgotModal && (
        <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
      )}
    </div>
  );
}
