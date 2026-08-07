import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Wallet, CheckCircle2, Eye, EyeOff, ArrowRight, Shield, TrendingUp, Zap } from 'lucide-react';
import ForgotPasswordModal from './ForgotPasswordModal';
import { API_BASE_URL } from '../api';

// ─── Social Button SVG Icons ──────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
  </svg>
);

// ─── Divider Component ────────────────────────────────────────────────────────
const OrDivider = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border-md)' }} />
    <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 500, whiteSpace: 'nowrap' }}>or continue with</span>
    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border-md)' }} />
  </div>
);

// ─── Social Buttons Component ─────────────────────────────────────────────────
function SocialLoginButtons({ onGoogleClick, onFacebookClick, loading, socialLoading }) {
  const [googleHover, setGoogleHover] = useState(false);
  const [fbHover, setFbHover] = useState(false);
  const btnBase = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
    width: '100%', padding: '11px 16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--glass-border-md)',
    background: 'rgba(255,255,255,0.04)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem', fontWeight: 600,
    cursor: (loading || socialLoading) ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    opacity: (loading || socialLoading) ? 0.6 : 1,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <button type="button" id="btn-google-login" onClick={onGoogleClick} disabled={loading || !!socialLoading}
        onMouseEnter={() => setGoogleHover(true)} onMouseLeave={() => setGoogleHover(false)}
        style={{ ...btnBase, background: googleHover ? 'rgba(66,133,244,0.1)' : 'rgba(255,255,255,0.04)', borderColor: googleHover ? 'rgba(66,133,244,0.5)' : 'var(--glass-border-md)', boxShadow: googleHover ? '0 0 0 3px rgba(66,133,244,0.12)' : 'none', transform: googleHover && !loading && !socialLoading ? 'translateY(-1px)' : 'none' }}>
        <GoogleIcon />
        {socialLoading === 'google' ? 'Connecting…' : 'Continue with Google'}
      </button>
      <button type="button" id="btn-facebook-login" onClick={onFacebookClick} disabled={loading || !!socialLoading}
        onMouseEnter={() => setFbHover(true)} onMouseLeave={() => setFbHover(false)}
        style={{ ...btnBase, background: fbHover ? 'rgba(24,119,242,0.1)' : 'rgba(255,255,255,0.04)', borderColor: fbHover ? 'rgba(24,119,242,0.5)' : 'var(--glass-border-md)', boxShadow: fbHover ? '0 0 0 3px rgba(24,119,242,0.12)' : 'none', transform: fbHover && !loading && !socialLoading ? 'translateY(-1px)' : 'none' }}>
        <FacebookIcon />
        {socialLoading === 'facebook' ? 'Connecting…' : 'Continue with Facebook'}
      </button>
    </div>
  );
}


const PERKS = [
  { icon: <TrendingUp size={18} />, text: 'Real-time spending insights' },
  { icon: <Shield size={18} />, text: 'Bank-grade 256-bit encryption' },
  { icon: <Zap size={18} />, text: 'AI-powered budget forecasting' },
];

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [signupData, setSignupData] = useState({ username: '', email: '', mobile_number: '', password: '', confirmPassword: '' });
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null); // 'google' | 'facebook' | null
  const googleInitialized = useRef(false);


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
    const s = calculateStrength();
    if (s <= 20) return 'var(--accent-rose)';
    if (s <= 60) return 'var(--accent-amber)';
    if (s <= 80) return 'var(--accent-primary)';
    return 'var(--accent-emerald)';
  };

  const getStrengthLabel = () => {
    const s = calculateStrength();
    if (s === 0) return '';
    if (s <= 20) return 'Weak';
    if (s <= 60) return 'Fair';
    if (s <= 80) return 'Good';
    return 'Strong';
  };

  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      navigate('/dashboard', { replace: true });
      return;
    }
    setIsLogin(location.pathname === '/login');
    setError('');
    setIsOtpStep(false);
    setOtp('');
  }, [location, navigate]);

  // Warm up the Render server on page load
  useEffect(() => {
    const warmUp = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);
        await fetch(`${API_BASE_URL}/api/auth/login/`, {
          method: 'OPTIONS',
          signal: controller.signal,
        });
        clearTimeout(timeout);
        setServerStatus('ready');
      } catch {
        setServerStatus('ready');
      }
    };
    warmUp();
  }, []);

  // Load Google Identity Services SDK
  useEffect(() => {
    if (googleInitialized.current) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
          auto_select: false,
        });
        googleInitialized.current = true;
      }
    };
    document.head.appendChild(script);
  }, []);

  // Load Facebook JS SDK
  useEffect(() => {
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!appId || window.FB) return;
    window.fbAsyncInit = function () {
      window.FB.init({ appId, cookie: true, xfbml: true, version: 'v19.0' });
    };
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // ── Social Auth Handler (shared) ──────────────────────────────────────────
  const handleSocialAuthSuccess = async (provider, token) => {
    setSocialLoading(provider);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/social/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `${provider} login failed`);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      setLoginSuccess(true);
      setTimeout(() => navigate(data.is_new_user ? '/onboarding' : '/dashboard'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSocialLoading(null);
    }
  };

  // ── Google click ──────────────────────────────────────────────────────────
  const handleGoogleClick = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Google Client ID not configured. Add VITE_GOOGLE_CLIENT_ID to your frontend .env file.');
      return;
    }
    if (window.google && googleInitialized.current) {
      window.google.accounts.id.prompt();
    } else {
      setError('Google Sign-In is loading, please try again in a moment.');
    }
  };

  const handleGoogleResponse = async (response) => {
    if (response.credential) {
      await handleSocialAuthSuccess('google', response.credential);
    }
  };

  // ── Facebook click ────────────────────────────────────────────────────────
  const handleFacebookClick = () => {
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!appId) {
      setError('Facebook App ID not configured. Add VITE_FACEBOOK_APP_ID to your frontend .env file.');
      return;
    }
    if (!window.FB) {
      setError('Facebook SDK is loading, please try again in a moment.');
      return;
    }
    setSocialLoading('facebook');
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          handleSocialAuthSuccess('facebook', response.authResponse.accessToken);
        } else {
          setSocialLoading(null);
          setError('Facebook login was cancelled.');
        }
      },
      { scope: 'public_profile,email' }
    );
  };


  const toggleMode = (e) => {
    e.preventDefault();
    navigate(isLogin ? '/signup' : '/login');
  };

  const handleSignupChange = (e) => setSignupData({ ...signupData, [e.target.name]: e.target.value });
  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (signupData.password !== signupData.confirmPassword) return setError("Passwords do not match");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupData.email)) return setError("Please enter a valid email address");
    const mobileClean = signupData.mobile_number.replace(/\D/g, '');
    if (mobileClean.length !== 10) return setError("Mobile number must be exactly 10 digits");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: signupData.username, email: signupData.email, mobile_number: signupData.mobile_number, password: signupData.password })
      });
      const data = await res.json();
      if (!res.ok) {
        let errorMsg = data.error || 'Signup failed';
        if (data.details) {
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
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      try {
        const profileRes = await fetch(`${API_BASE_URL}/api/auth/profile/`, { headers: { 'Authorization': `Bearer ${data.access}` } });
        setLoginSuccess(true);
        setTimeout(() => navigate(profileRes.ok ? '/dashboard' : '/onboarding'), 1500);
      } catch (e) {
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--glass-border-md)',
    background: 'rgba(255,255,255,0.04)',
    color: 'var(--text-primary)',
    outline: 'none', fontSize: '0.95rem',
    fontFamily: 'var(--font-body)',
    transition: 'all 0.25s ease',
    marginBottom: '1rem',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', background: 'var(--bg-deep)', position: 'relative', overflow: 'hidden',
    }} className="animate-fade-in">
      {/* Aurora BG */}
      <div className="bg-animation-wrapper">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      <div className="animate-scale-in auth-container" style={{
        position: 'relative', maxWidth: '1050px', width: '100%',
        minHeight: isLogin ? '750px' : '900px',
        transition: 'min-height 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
        border: '1px solid var(--glass-border-md)',
        zIndex: 1,
      }}>

        {/* Server Warm-up Banner */}
        {serverStatus === 'checking' && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
            background: 'linear-gradient(90deg, rgba(245,158,11,0.15), rgba(245,158,11,0.08))',
            borderBottom: '1px solid rgba(245,158,11,0.3)',
            padding: '0.6rem 1rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '0.82rem', color: '#f59e0b',
            justifyContent: 'center',
          }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', animation: 'pulse 1.5s infinite' }} />
            Connecting to server... Please wait a moment before logging in.
          </div>
        )}

        {/* Left: Signup */}
        <div className={`auth-form-panel mobile-p-4 ${isLogin ? 'inactive-mobile' : ''}`} style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%',
          padding: '3rem 3.5rem', textAlign: 'center',
          opacity: isLogin ? 0 : 1, visibility: isLogin ? 'hidden' : 'visible',
          transition: 'opacity 0.3s ease, visibility 0.3s',
          transitionDelay: isLogin ? '0s' : '0.3s',
          overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)' }}>
              <Wallet color="white" size={24} />
            </div>
          </div>
          <h2 style={{ marginBottom: '0.4rem', fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>Create account</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>Start managing your finances professionally.</p>

          {/* Social Signup Buttons */}
          <SocialLoginButtons
            onGoogleClick={handleGoogleClick}
            onFacebookClick={handleFacebookClick}
            loading={loading}
            socialLoading={socialLoading}
          />
          <OrDivider />

          {!isLogin && error && (
            <div style={{ background: 'rgba(244,63,94,0.12)', color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.25)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }} onSubmit={handleSignupSubmit}>
            <label className="auth-label">Username</label>
            <input type="text" name="username" value={signupData.username} onChange={handleSignupChange} style={inputStyle} placeholder="e.g. rahul_samani" required
              onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.background = 'rgba(59,130,246,0.05)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.boxShadow = 'none'; }}
            />
            <label className="auth-label">Email</label>
            <input type="email" name="email" value={signupData.email} onChange={handleSignupChange} style={inputStyle} placeholder="you@example.com" required
              onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.background = 'rgba(59,130,246,0.05)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.boxShadow = 'none'; }}
            />
            <label className="auth-label">Mobile Number</label>
            <input type="tel" name="mobile_number" value={signupData.mobile_number} onChange={handleSignupChange} style={inputStyle} placeholder="10-digit number"
              onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.background = 'rgba(59,130,246,0.05)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.boxShadow = 'none'; }}
            />
            <label className="auth-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? "text" : "password"} name="password" value={signupData.password} onChange={handleSignupChange} style={{ ...inputStyle, paddingRight: '42px' }} placeholder="••••••••" required
                onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.background = 'rgba(59,130,246,0.05)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.boxShadow = 'none'; }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0 }}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {signupData.password.length > 0 && (
              <div style={{ marginTop: '-0.5rem', marginBottom: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Strength</span>
                  <span style={{ color: getStrengthColor(), fontWeight: 600 }}>{getStrengthLabel()}</span>
                </div>
                <div style={{ height: '3px', background: 'var(--bg-glass-md)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${calculateStrength()}%`, background: getStrengthColor(), transition: 'width 0.3s ease, background 0.3s ease', borderRadius: '2px' }} />
                </div>
              </div>
            )}
            <label className="auth-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={signupData.confirmPassword} onChange={handleSignupChange} style={{ ...inputStyle, paddingRight: '42px' }} placeholder="••••••••" required
                onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.background = 'rgba(59,130,246,0.05)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.boxShadow = 'none'; }}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '12px', top: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0 }}>
                {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating…' : 'Create Account'} {!loading && <ArrowRight size={16} />}
            </button>
          </form>
          <p style={{ marginTop: '1.25rem', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
            Already have an account? <a href="#" onClick={toggleMode} style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Log in</a>
          </p>
          <p style={{ marginTop: '0.4rem', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
            <Link to="/" style={{ color: 'var(--text-dim)' }}>← Back to Home</Link>
          </p>
        </div>

        {/* Right: Login / OTP */}
        <div className={`auth-form-panel mobile-p-4 ${!isLogin ? 'inactive-mobile' : ''}`} style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%',
          padding: '2.5rem 3.5rem', textAlign: 'center',
          opacity: isLogin ? 1 : 0, visibility: isLogin ? 'visible' : 'hidden',
          transition: 'opacity 0.3s ease, visibility 0.3s',
          transitionDelay: isLogin ? '0.3s' : '0s',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)' }}>
              <Wallet color="white" size={24} />
            </div>
          </div>
          <h2 style={{ marginBottom: '0.4rem', fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
            {isOtpStep ? 'Verify OTP' : 'Welcome back'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {isOtpStep ? `We sent a 6-digit code to ${verifiedEmail}` : 'Login to your dashboard.'}
          </p>

          {isLogin && error && (
            <div style={{ background: 'rgba(244,63,94,0.12)', color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.25)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          {loginSuccess ? (
            <div className="animate-scale-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem 0' }}>
              <CheckCircle2 color="var(--accent-emerald)" size={64} />
              <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700 }}>Login Successful!</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Redirecting to your dashboard…</p>
            </div>
          ) : !isOtpStep ? (
            <>
              {/* Social Login Buttons */}
              <SocialLoginButtons
                onGoogleClick={handleGoogleClick}
                onFacebookClick={handleFacebookClick}
                loading={loading}
                socialLoading={socialLoading}
              />
              <OrDivider />

              <form style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }} onSubmit={handleLoginSubmit}>
              <label className="auth-label">Email or Username</label>
              <input type="text" name="identifier" value={loginData.identifier} onChange={handleLoginChange} style={inputStyle} placeholder="you@example.com" required
                onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.background = 'rgba(59,130,246,0.05)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.boxShadow = 'none'; }}
              />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="auth-label" style={{ marginBottom: 0 }}>Password</label>
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowForgotModal(true); }} style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
                    Forgot Password?
                  </a>
                </div>
                <div style={{ position: 'relative' }}>
                  <input type={showLoginPassword ? "text" : "password"} name="password" value={loginData.password} onChange={handleLoginChange} style={{ ...inputStyle, paddingRight: '42px', width: '100%' }} placeholder="••••••••" required
                    onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.background = 'rgba(59,130,246,0.05)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} style={{ position: 'absolute', right: '12px', top: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0 }}>
                    {showLoginPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Logging in…' : 'Log In'} {!loading && <ArrowRight size={16} />}
              </button>
            </form>
            </>
          ) : (
            <form style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }} onSubmit={handleOtpSubmit}>
              <label className="auth-label">One-Time Password</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} style={{ ...inputStyle, textAlign: 'center', letterSpacing: '6px', fontSize: '1.3rem', fontWeight: 700 }} placeholder="000000" maxLength={6} required
                onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.background = 'rgba(59,130,246,0.05)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.boxShadow = 'none'; }}
              />
              <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', opacity: (loading || otp.length !== 6) ? 0.6 : 1 }}>
                {loading ? 'Verifying…' : 'Verify & Continue'}
              </button>
              <button type="button" onClick={() => setIsOtpStep(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', marginTop: '0.75rem', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}>
                ← Back to Login
              </button>
            </form>
          )}

          <p style={{ marginTop: '1.5rem', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
            No account? <a href="#" onClick={toggleMode} style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Sign up free</a>
          </p>
          <p style={{ marginTop: '0.4rem', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
            <Link to="/" style={{ color: 'var(--text-dim)' }}>← Back to Home</Link>
          </p>
        </div>

        {/* Sliding Blue Panel */}
        <div className="auth-slider-panel" style={{
          position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 60%, #8b5cf6 100%)',
          color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '3.5rem 3.5rem',
          transform: isLogin ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
          zIndex: 10,
          boxShadow: isLogin ? '20px 0 60px rgba(0,0,0,0.3)' : '-20px 0 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}>
          {/* Glow orb */}
          <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(139,92,246,0.4), transparent)', filter: 'blur(40px)', pointerEvents: 'none' }} />

          <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
            <Wallet color="white" size={22} />
          </div>

          <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem', fontWeight: 900, fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em', color: 'white', lineHeight: 1.1 }}>
            Master Your<br />Finances.
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2.5rem', lineHeight: 1.7 }}>
            Yaarax gives you complete visibility into your spending with AI-powered insights and beautiful analytics.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            {PERKS.map((perk, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {perk.icon}
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>{perk.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />}
    </div>
  );
}
