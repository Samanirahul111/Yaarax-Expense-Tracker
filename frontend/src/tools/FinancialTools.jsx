import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, TrendingUp, Percent, CreditCard, Calculator, LineChart, ChevronRight, ReceiptText } from 'lucide-react';

const tools = [
  { name: 'GST Calculator', desc: 'Calculate GST on products & services', icon: <Landmark size={22} />, path: '/tools/gst', color: 'var(--accent-primary)', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.25)' },
  { name: 'SIP Calculator', desc: 'Estimate your SIP returns & wealth', icon: <TrendingUp size={22} />, path: '/tools/sip', color: 'var(--accent-emerald)', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.25)' },
  { name: 'FD Calculator', desc: 'Fixed deposit maturity calculator', icon: <Percent size={22} />, path: '/tools/fd', color: 'var(--accent-amber)', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.25)' },
  { name: 'Loan Affordability', desc: 'Find out how much loan you can afford', icon: <CreditCard size={22} />, path: '/tools/loan', color: 'var(--accent-violet)', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.25)' },
  { name: 'EMI Calculator', desc: 'Calculate your monthly EMI payments', icon: <Calculator size={22} />, path: '/tools/emi', color: 'var(--accent-cyan)', bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.25)' },
  { name: 'Compound Interest', desc: 'Watch your money grow over time', icon: <LineChart size={22} />, path: '/tools/compound', color: 'var(--accent-rose)', bg: 'rgba(244,63,94,0.15)', border: 'rgba(244,63,94,0.25)' },
];

export default function FinancialTools() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg-deep)', minHeight: '100vh', position: 'relative', paddingBottom: '5rem' }}>
      <div className="bg-animation-wrapper">
        <div className="shape shape-1" style={{ opacity: 0.4 }} />
        <div className="shape shape-2" style={{ opacity: 0.3 }} />
      </div>

      <div className="tools-header" style={{ marginBottom: '2rem' }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calculator color="var(--accent-primary)" size={20} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Financial Tools</h1>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '1px' }}>Professional calculators at your fingertips</div>
          </div>
        </div>
      </div>

      <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
          {tools.map((tool, idx) => (
            <div key={idx}
              onClick={() => navigate(tool.path)}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              className="animate-slide-up"
              style={{
                animationDelay: `${idx * 40}ms`,
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                borderBottom: idx < tools.length - 1 ? '1px solid var(--glass-border)' : 'none',
                transition: 'background 0.25s ease, padding-left 0.25s var(--ease-bounce)',
                background: hovered === idx ? 'rgba(255,255,255,0.03)' : 'transparent',
                paddingLeft: hovered === idx ? '1.875rem' : '1.5rem',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: 'var(--radius-md)',
                  background: tool.bg, border: `1px solid ${tool.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: tool.color, flexShrink: 0,
                  transition: 'transform 0.25s var(--ease-bounce)',
                  transform: hovered === idx ? 'scale(1.1) rotate(-5deg)' : 'scale(1)',
                  boxShadow: hovered === idx ? `0 0 16px ${tool.border}` : 'none',
                }}>
                  {tool.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', marginBottom: '0.2rem' }}>
                    {tool.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 400 }}>
                    {tool.desc}
                  </div>
                </div>
              </div>
              <ChevronRight size={18} color={hovered === idx ? tool.color : 'var(--text-dim)'}
                style={{ transition: 'color 0.25s, transform 0.25s', transform: hovered === idx ? 'translateX(3px)' : 'none' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
