import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Target, Shield, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Animated Professional Background */}
      <div className="bg-animation-wrapper">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <Navbar />

      <main>
        {/* Header Section */}
        <section className="section" style={{ paddingTop: '6rem', paddingBottom: '3rem' }}>
          <div className="section-content text-center">
            <h1 className="animate-slide-up" style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              About <span className="text-highlight">Yaarax</span>
            </h1>
            <p className="hero-subtitle animate-slide-up delay-100" style={{ maxWidth: '800px', margin: '0 auto' }}>
              We're on a mission to simplify financial management for everyone. Our platform helps you track, analyze, and optimize your expenses so you can achieve financial freedom.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="section bg-glass-medium animate-slide-up delay-200">
          <div className="section-content">
            <div className="text-center" style={{ marginBottom: '4rem' }}>
              <h2 className="section-title">Our Core Values</h2>
              <p className="section-subtitle">What drives us to build the best financial tools for you.</p>
            </div>
            
            <div className="features">
              <div className="feature-card card">
                <div className="feature-icon">
                  <Target size={24} />
                </div>
                <h3>Simplicity</h3>
                <p>We believe managing money shouldn't be complicated. Our interfaces are designed to be intuitive and frictionless.</p>
              </div>

              <div className="feature-card card">
                <div className="feature-icon">
                  <Shield size={24} />
                </div>
                <h3>Security</h3>
                <p>Your financial data is sensitive. We employ enterprise-grade security to ensure your information remains strictly confidential.</p>
              </div>

              <div className="feature-card card">
                <div className="feature-icon">
                  <Heart size={24} />
                </div>
                <h3>Empowerment</h3>
                <p>We build tools that give you insights and control, empowering you to make confident financial decisions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Team Section */}
        <section className="section bg-muted animate-slide-up delay-300">
          <div className="section-content">
            <div className="text-center" style={{ marginBottom: '4rem' }}>
              <h2 className="section-title">Meet Our Team</h2>
              <p className="section-subtitle">The brilliant minds building Yaarax Expense Tracker.</p>
            </div>
            
            <div className="features">
              <div className="feature-card card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white' }}>
                <div className="feature-icon" style={{ borderRadius: '50%', width: '80px', height: '80px', marginBottom: '1.5rem', background: '#eff6ff' }}>
                  <Users size={36} color="var(--accent-primary)" />
                </div>
                <h3>Rahul Samani</h3>
                <p style={{ color: 'var(--accent-primary)', fontWeight: '600', marginBottom: '1rem', fontSize: '0.9rem' }}>Full Stack Developer</p>
                <p style={{ textAlign: 'center' }}>Passionate about building scalable front-end interfaces and robust backend architectures.</p>
              </div>

              <div className="feature-card card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white' }}>
                <div className="feature-icon" style={{ borderRadius: '50%', width: '80px', height: '80px', marginBottom: '1.5rem', background: '#eff6ff' }}>
                  <Users size={36} color="var(--accent-primary)" />
                </div>
                <h3>MahekKumar Kanani</h3>
                <p style={{ color: 'var(--accent-primary)', fontWeight: '600', marginBottom: '1rem', fontSize: '0.9rem' }}>Full Stack Developer</p>
                <p style={{ textAlign: 'center' }}>Focused on creating seamless user experiences powered by highly efficient APIs.</p>
              </div>

              <div className="feature-card card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white' }}>
                <div className="feature-icon" style={{ borderRadius: '50%', width: '80px', height: '80px', marginBottom: '1.5rem', background: '#eff6ff' }}>
                  <Users size={36} color="var(--accent-primary)" />
                </div>
                <h3>Yash Pateliya</h3>
                <p style={{ color: 'var(--accent-primary)', fontWeight: '600', marginBottom: '1rem', fontSize: '0.9rem' }}>Full Stack Developer</p>
                <p style={{ textAlign: 'center' }}>Security and database expert ensuring your financial data is always fast and completely safe.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
