import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Wallet, PieChart, Shield, LayoutDashboard,
  CheckCircle2, User, Users, Star, Sparkles, TrendingUp, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../api';
import developerProfileImg from '../assets/developer-profile.jpg';
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count}{suffix}</>;
}

const features = [
  {
    icon: <LayoutDashboard size={22} />,
    title: 'Intelligent Dashboard',
    desc: 'Monitor your financial health at a glance with real-time insights, automated categorization, and beautiful charts.',
    gradient: 'rgba(59,130,246,0.15)',
    glow: 'rgba(59,130,246,0.3)',
    accent: 'var(--accent-primary)',
  },
  {
    icon: <PieChart size={22} />,
    title: 'Advanced Analytics',
    desc: 'Generate detailed reports and visualize spending patterns to make informed, data-driven financial decisions.',
    gradient: 'rgba(139,92,246,0.15)',
    glow: 'rgba(139,92,246,0.3)',
    accent: 'var(--accent-violet)',
  },
  {
    icon: <Shield size={22} />,
    title: 'Enterprise Security',
    desc: 'Industry-leading encryption keeps your sensitive financial data completely secure and private at all times.',
    gradient: 'rgba(16,185,129,0.15)',
    glow: 'rgba(16,185,129,0.3)',
    accent: 'var(--accent-emerald)',
  },
  {
    icon: <Sparkles size={22} />,
    title: 'AI Budget Forecast',
    desc: 'Our ML model analyzes your habits and predicts next month\'s spending so you can plan ahead with confidence.',
    gradient: 'rgba(245,158,11,0.15)',
    glow: 'rgba(245,158,11,0.3)',
    accent: 'var(--accent-amber)',
  },
  {
    icon: <Users size={22} />,
    title: 'Group Expenses',
    desc: 'Split bills and manage shared expenses with friends and family. Track who owes what, instantly.',
    gradient: 'rgba(6,182,212,0.15)',
    glow: 'rgba(6,182,212,0.3)',
    accent: 'var(--accent-cyan)',
  },
  {
    icon: <TrendingUp size={22} />,
    title: 'Savings Tracker',
    desc: 'Set savings goals, track subscriptions, and watch your wealth grow with visual progress indicators.',
    gradient: 'rgba(244,63,94,0.15)',
    glow: 'rgba(244,63,94,0.3)',
    accent: 'var(--accent-rose)',
  },
];

const team = [
  {
    name: 'Rahul Samani',
    role: 'Full Stack Developer & Founder',
    bio: 'Crafted with passion by a developer dedicated to financial empowerment and elegant software engineering. Building scalable interfaces and robust architectures to simplify your financial life.',
    image: developerProfileImg,
    gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_users: 0, total_ratings: 0, average_rating: 0 });

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      navigate('/dashboard', { replace: true });
    }
    fetch(`${API_BASE_URL}/api/public-stats/`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Failed to fetch stats:", err));
  }, [navigate]);

  return (
    <div className="home-container">
      {/* Aurora background */}
      <div className="bg-animation-wrapper">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
        <div className="shape shape-4" />
      </div>

      {/* ─── HEADER ─── */}
      <header className="header">
        <div className="logo">
          <Wallet size={22} />
          Yaarax
          <span style={{ fontWeight: 400, opacity: 0.7, fontSize: '0.95rem' }} className="mobile-hidden">
            Expense Tracker
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button className="btn-secondary" onClick={() => navigate('/login')}
            style={{ padding: '0.5rem 1.125rem', fontSize: '0.875rem' }}>
            Log In
          </button>
          <button className="btn-primary" onClick={() => navigate('/signup')}
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
            Get Started
          </button>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1 }}>

        {/* ─── HERO ─── */}
        <section className="hero">
          <div className="section-content hero-content">
            {/* Badge */}
            <div className="animate-slide-up" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 1rem',
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.25)',
              borderRadius: 'var(--radius-full)',
              marginBottom: '1.5rem',
            }}>
              <Zap size={14} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', letterSpacing: '0.04em' }}>
                AI-Powered Financial Intelligence
              </span>
            </div>

            <h1 className="animate-slide-up delay-100 text-center" style={{ color: 'var(--text-primary)', margin: '0 auto 1.25rem', maxWidth: '820px' }}>
              Master Your Finances with{' '}
              <span style={{
                background: 'var(--grad-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Yaarax
              </span>
            </h1>

            <p className="hero-subtitle animate-slide-up delay-200 text-center">
              The professional standard for personal and business expense tracking.
              Gain complete visibility into your cash flow with AI-powered insights and beautiful analytics.
            </p>

            <div className="hero-actions animate-slide-up delay-300">
              <button
                className="btn-primary"
                onClick={() => { localStorage.clear(); navigate('/dashboard'); }}
                style={{ padding: '0.875rem 2.5rem', fontSize: '1rem', borderRadius: '50px' }}
              >
                Explore Free <ArrowRight size={18} />
              </button>
              <button
                className="btn-secondary"
                onClick={() => navigate('/signup')}
                style={{ padding: '0.875rem 2.5rem', fontSize: '1rem', borderRadius: '50px' }}
              >
                Create Account
              </button>
            </div>

            {/* Trust indicators */}
            <div className="animate-slide-up delay-400" style={{
              display: 'flex', gap: '2rem', marginTop: '2.5rem', justifyContent: 'center', flexWrap: 'wrap',
            }}>
              {[
                { icon: '🔒', text: 'Bank-grade Security' },
                { icon: '⚡', text: 'Real-time Sync' },
                { icon: '🤖', text: 'AI Forecasting' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)',
                }}>
                  <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>

            {/* Dashboard Mockup Preview */}
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.6, type: 'spring', bounce: 0.4 }}
              style={{
                marginTop: '4rem',
                position: 'relative',
                width: '100%',
                maxWidth: '900px',
                height: '400px',
                margin: '4rem auto 0',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--glass-border-md)',
                borderRadius: 'var(--radius-2xl)',
                boxShadow: 'var(--shadow-2xl), 0 0 60px rgba(59, 130, 246, 0.15)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
              className="mobile-hidden"
            >
              {/* Mockup Header */}
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
              </div>
              {/* Mockup Body */}
              <div style={{ padding: '2rem', display: 'flex', gap: '2rem', height: '100%' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ width: '40%', height: '24px', background: 'var(--text-dim)', borderRadius: '4px', opacity: 0.5 }} />
                  <div style={{ width: '100%', height: '100px', background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))', border: '1px solid var(--glass-border-md)', borderRadius: '8px' }} />
                  <div style={{ width: '100%', flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', padding: '1rem', gap: '1rem' }}>
                     <div style={{ width: '100%', height: '10px', background: 'var(--glass-border)', borderRadius: '2px' }} />
                     <div style={{ width: '80%', height: '10px', background: 'var(--glass-border)', borderRadius: '2px' }} />
                     <div style={{ width: '90%', height: '10px', background: 'var(--glass-border)', borderRadius: '2px' }} />
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   <div style={{ width: '100%', height: '150px', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '15px solid var(--glass-border)', borderTopColor: 'var(--accent-primary)', borderRightColor: 'var(--accent-violet)' }} />
                   </div>
                   <div style={{ width: '100%', flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Neon divider */}
        <div className="neon-divider" style={{ margin: '0' }} />

        {/* ─── FEATURES ─── */}
        <section className="section" style={{ padding: '5rem 2rem' }}>
          <div className="section-content">
            <div className="text-center animate-slide-up">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.35rem 1rem',
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: 'var(--radius-full)',
                marginBottom: '1rem',
              }}>
                <Sparkles size={14} color="var(--accent-violet)" />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-violet)', letterSpacing: '0.05em' }}>
                  FEATURES
                </span>
              </div>
              <h2 className="section-title">Everything you need to thrive</h2>
              <p className="section-subtitle">
                Powerful tools built for modern financial management, designed to save you time and money.
              </p>
            </div>

            <div className="features">
              {features.map((f, idx) => (
                <FeatureCard key={idx} {...f} delay={`delay-${(idx % 3 + 1) * 100}`} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── STATS ─── */}
        <section style={{
          padding: '5rem 2rem',
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid var(--glass-border)',
          borderBottom: '1px solid var(--glass-border)',
          backdropFilter: 'blur(4px)',
        }}>
          <div className="section-content">
            <div className="text-center animate-slide-up" style={{ marginBottom: '3rem' }}>
              <h2 className="section-title" style={{ fontSize: '2rem' }}>Trusted by thousands</h2>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              {[
                { icon: <Users size={28} />, value: stats.total_users, suffix: '+', label: 'Active Users', color: 'var(--accent-primary)', bg: 'rgba(59,130,246,0.12)' },
                { icon: <Star size={28} fill="#f59e0b" color="#f59e0b" />, value: stats.average_rating || 4.9, suffix: '', label: `from ${stats.total_ratings || '100'}+ reviews`, color: 'var(--accent-amber)', bg: 'rgba(245,158,11,0.12)' },
                { icon: <CheckCircle2 size={28} />, value: 99, suffix: '%', label: 'Satisfaction Rate', color: 'var(--accent-emerald)', bg: 'rgba(16,185,129,0.12)' },
              ].map((s, i) => (
                <div key={i} className="animate-scale-in" style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                  padding: '2rem 3rem',
                  background: s.bg,
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-2xl)',
                  minWidth: '220px',
                  backdropFilter: 'blur(12px)',
                  animation: `scaleIn 0.5s var(--ease-spring) ${i * 100 + 200}ms both`,
                }}>
                  <div style={{ color: s.color }}>{s.icon}</div>
                  <div style={{
                    fontFamily: 'var(--font-heading)', fontSize: '2.75rem', fontWeight: 900,
                    letterSpacing: '-0.04em', color: 'var(--text-primary)', lineHeight: 1,
                  }}>
                    <AnimatedCounter target={typeof s.value === 'number' ? s.value : 0} suffix={s.suffix} />
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TEAM ─── */}
        <section className="section" style={{ padding: '5rem 2rem' }}>
          <div className="section-content">
            <div className="text-center animate-slide-up" style={{ marginBottom: '3.5rem' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.35rem 1rem',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 'var(--radius-full)',
                marginBottom: '1rem',
              }}>
                <Users size={14} color="var(--accent-emerald)" />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-emerald)', letterSpacing: '0.05em' }}>
                  Developer
                </span>
              </div>
              <h2 className="section-title">Meet the Creator</h2>
              <p className="section-subtitle">The vision and code behind Yaarax Expense Tracker.</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="animate-slide-up delay-100 card-solid" style={{
                padding: '2.5rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.25rem',
                maxWidth: '450px',
                width: '100%',
                transition: 'transform 0.3s var(--ease-bounce), box-shadow 0.3s ease',
                cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-xl)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{
                  width: '84px', height: '84px', borderRadius: '50%',
                  background: team[0].gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 800, color: 'white',
                  letterSpacing: '0.05em',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                  fontFamily: 'var(--font-heading)',
                }}>
                  {team[0].image ? (
                    <img src={team[0].image} alt={team[0].name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    team[0].initial
                  )}
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {team[0].name}
                  </h3>
                  <div style={{
                    background: 'var(--grad-primary)', WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem',
                  }}>
                    {team[0].role}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {team[0].bio}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section style={{
          padding: '6rem 2rem',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.1) 50%, rgba(16,185,129,0.08) 100%)',
          borderTop: '1px solid var(--glass-border)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Glow orbs */}
          <div style={{
            position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
            width: '400px', height: '200px',
            background: 'radial-gradient(ellipse, rgba(59,130,246,0.25), transparent)',
            filter: 'blur(40px)', pointerEvents: 'none',
          }} />

          <div className="section-content text-center animate-slide-up" style={{ position: 'relative' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.35rem 1rem',
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.25)',
              borderRadius: 'var(--radius-full)',
              marginBottom: '1.5rem',
            }}>
              <Zap size={14} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-primary)', letterSpacing: '0.04em' }}>
                FREE TO START
              </span>
            </div>

            <h2 className="section-title" style={{ fontSize: '2.75rem', marginBottom: '1rem' }}>
              Ready to take control<br />of your money?
            </h2>
            <p className="section-subtitle" style={{ marginBottom: '2rem' }}>
              Join thousands of users already managing their finances the smart way. No credit card required.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn-primary"
                onClick={() => navigate('/signup')}
                style={{ padding: '1rem 2.75rem', fontSize: '1rem', borderRadius: '50px' }}
              >
                Create Free Account <ArrowRight size={18} />
              </button>
              <button
                className="btn-secondary"
                onClick={() => { localStorage.clear(); navigate('/dashboard'); }}
                style={{ padding: '1rem 2rem', fontSize: '1rem', borderRadius: '50px' }}
              >
                View Demo
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc, gradient, glow, accent, delay }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`animate-slide-up ${delay} card-solid`}
      style={{
        padding: '2rem',
        transition: 'transform 0.35s var(--ease-bounce), box-shadow 0.35s ease, border-color 0.3s ease',
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: hovered ? `var(--shadow-xl), 0 0 40px ${glow}` : 'none',
        borderColor: hovered ? `${accent}40` : 'var(--glass-border)',
        cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        width: '50px', height: '50px', borderRadius: 'var(--radius-md)',
        background: hovered ? `linear-gradient(135deg, ${glow}, ${gradient})` : gradient,
        border: `1px solid ${hovered ? accent + '66' : accent + '33'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accent, marginBottom: '1.25rem',
        transition: 'all 0.35s var(--ease-bounce)',
        transform: hovered ? 'scale(1.12) rotate(5deg)' : 'scale(1)',
        boxShadow: hovered ? `0 8px 20px ${glow}` : 'none',
      }}>
        {icon}
      </div>
      <h3 style={{
        fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700,
        marginBottom: '0.6rem', color: 'var(--text-primary)',
      }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65 }}>{desc}</p>
    </div>
  );
}
