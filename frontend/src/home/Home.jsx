import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Wallet, PieChart, Shield, LayoutDashboard, CheckCircle2, User, Users, Star } from 'lucide-react';
import { API_BASE_URL } from '../api';

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_users: 0, total_ratings: 0, average_rating: 0 });

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      navigate('/dashboard', { replace: true });
    }

    // Fetch public stats
    fetch(`${API_BASE_URL}/api/public-stats/`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Failed to fetch stats:", err));
  }, [navigate]);

  return (
    <div className="home-container">
      {/* Animated Professional Background */}
      <div className="bg-animation-wrapper">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <header className="header">
        <div className="logo">
          <Wallet color="var(--accent-primary)" />
          Yaarax Expense Tracker
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={() => navigate('/login')}>Log In</button>
          <button className="btn-primary" onClick={() => navigate('/signup')}>Sign Up</button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="section hero" style={{ backgroundColor: '#ffffff', paddingTop: '4rem', paddingBottom: '5rem' }}>
          <div className="hero-image-bg" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', minWidth: '1200px', zIndex: 0, opacity: 0.25, pointerEvents: 'none' }}>
            <img src="/hero-image.png" alt="Yaarax Dashboard" className="animate-scale-in delay-300" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', mixBlendMode: 'multiply' }} />
          </div>

          <div className="section-content hero-content">
            <div className="hero-text text-center" style={{ zIndex: 1, position: 'relative' }}>
              <h1 className="animate-slide-up">
                Master Your Finances with <br />
                <span className="text-highlight">Yaarax Expense Tracker</span>
              </h1>
              <p className="hero-subtitle animate-slide-up delay-100" style={{ margin: '0 auto 2.5rem auto', maxWidth: '600px' }}>
                The professional standard for personal and business expense tracking.
                Gain complete visibility into your cash flow with our robust accounting tools.
              </p>
              <div className="hero-actions animate-slide-up delay-200" style={{ justifyContent: 'center' }}>
                <button className="btn-primary" onClick={() => {
                  localStorage.clear();
                  navigate('/dashboard');
                }} style={{ padding: '1rem 4rem', fontSize: '1.1rem' }}>
                  Explore Now <ArrowRight style={{ marginLeft: '12px' }} size={22} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Advantages / Features Section */}
        <section className="section animate-slide-up delay-400" style={{ backgroundColor: '#f8fafc', paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div className="section-content">
            <div className="text-center">
              <h2 className="section-title">Why choose us?</h2>
              <p className="section-subtitle">Everything you need to manage your money effectively.</p>
            </div>

            <div className="features">
              <div className="feature-card card" style={{ background: '#ffffff' }}>
                <div className="feature-icon">
                  <LayoutDashboard size={24} />
                </div>
                <h3>Intelligent Dashboard</h3>
                <p>Monitor your financial health at a glance. Our comprehensive dashboard provides real-time insights and automated categorization.</p>
              </div>

              <div className="feature-card card" style={{ background: '#ffffff' }}>
                <div className="feature-icon">
                  <PieChart size={24} />
                </div>
                <h3>Advanced Analytics</h3>
                <p>Generate detailed reports and visualize spending patterns to make informed, data-driven financial decisions.</p>
              </div>

              <div className="feature-card card" style={{ background: '#ffffff' }}>
                <div className="feature-icon">
                  <Shield size={24} />
                </div>
                <h3>Enterprise Security</h3>
                <p>Built with industry-leading encryption protocols to ensure your sensitive financial data remains completely secure and compliant.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="section animate-slide-up delay-300" style={{ backgroundColor: '#ffffff', paddingTop: '5rem', paddingBottom: '5rem', position: 'relative', zIndex: 10 }}>
          <div className="section-content">
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc', padding: '2rem 4rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', minWidth: '250px' }}>
                <Users size={40} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{stats.total_users}+</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontWeight: 500, fontSize: '1.1rem' }}>Active Users</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc', padding: '2rem 4rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', minWidth: '250px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '1rem' }}>
                  <Star size={40} fill="#fbbf24" color="#fbbf24" />
                </div>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{stats.average_rating || 5.0}</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontWeight: 500, fontSize: '1.1rem' }}>from {stats.total_ratings} reviews</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc', padding: '2rem 4rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', minWidth: '250px' }}>
                <CheckCircle2 size={40} color="#10b981" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>99%</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontWeight: 500, fontSize: '1.1rem' }}>Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Team Section */}
        <section className="section animate-slide-up delay-100" style={{ backgroundColor: '#f9fafb', paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div className="section-content">
            <div className="text-center">
              <h2 className="section-title">Meet Our Team</h2>
              <p className="section-subtitle">The brilliant minds building Yaarax Expense Tracker.</p>
            </div>

            <div className="features">
              <div className="feature-card card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white' }}>
                <div className="feature-icon" style={{ borderRadius: '50%', width: '80px', height: '80px', marginBottom: '1.5rem', background: '#eff6ff' }}>
                  <User size={36} color="var(--accent-primary)" />
                </div>
                <h3>Rahul Samani</h3>
                <p style={{ color: 'var(--accent-primary)', fontWeight: '600', marginBottom: '1rem', fontSize: '0.9rem' }}>Full Stack Developer</p>
                <p style={{ textAlign: 'center' }}>Passionate about building scalable front-end interfaces and robust backend architectures.</p>
              </div>

              <div className="feature-card card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white' }}>
                <div className="feature-icon" style={{ borderRadius: '50%', width: '80px', height: '80px', marginBottom: '1.5rem', background: '#eff6ff' }}>
                  <User size={36} color="var(--accent-primary)" />
                </div>
                <h3>MahekKumar Kanani</h3>
                <p style={{ color: 'var(--accent-primary)', fontWeight: '600', marginBottom: '1rem', fontSize: '0.9rem' }}>Full Stack Developer</p>
                <p style={{ textAlign: 'center' }}>Focused on creating seamless user experiences powered by highly efficient APIs.</p>
              </div>

              <div className="feature-card card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white' }}>
                <div className="feature-icon" style={{ borderRadius: '50%', width: '80px', height: '80px', marginBottom: '1.5rem', background: '#eff6ff' }}>
                  <User size={36} color="var(--accent-primary)" />
                </div>
                <h3>Yash Pateliya</h3>
                <p style={{ color: 'var(--accent-primary)', fontWeight: '600', marginBottom: '1rem', fontSize: '0.9rem' }}>Full Stack Developer</p>
                <p style={{ textAlign: 'center' }}>Security and database expert ensuring your financial data is always fast and completely safe.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section animate-slide-up delay-500" style={{ backgroundColor: 'var(--accent-primary)', paddingTop: '6rem', paddingBottom: '6rem' }}>
          <div className="section-content text-center" style={{ color: 'white' }}>
            <h2 className="section-title" style={{ color: 'white' }}>Ready to take control?</h2>
            <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Join thousands of users who are already managing their finances the smart way.
            </p>
            <button className="btn-primary bg-white text-primary hover-lift" onClick={() => navigate('/signup')} style={{ background: 'white', color: 'var(--accent-primary)', marginTop: '2rem' }}>
              Create Free Account
            </button>
          </div>
        </section>
      </main>

    </div>
  );
}
