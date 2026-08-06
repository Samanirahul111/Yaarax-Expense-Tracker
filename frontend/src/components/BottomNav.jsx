import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, PieChart, Calculator, Users } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  if (location.pathname.startsWith('/admin')) return null;

  const navItems = [
    { path: '/dashboard', icon: Home,        label: 'Home' },
    { path: '/logs',      icon: FileText,     label: 'Logs' },
    { path: '/analytics', icon: PieChart,     label: 'Analytics' },
    { path: '/groups',    icon: Users,        label: 'Groups' },
    { path: '/tools',     icon: Calculator,   label: 'Tools' },
  ];

  return (
    <div className="bottom-nav animate-fade-in">
      {navItems.map((item, index) => {
        const active = isActive(item.path);
        const Icon = item.icon;
        return (
          <div
            key={index}
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            style={{ color: active ? 'var(--accent-primary)' : 'var(--text-dim)' }}
          >
            <div className="nav-icon-wrap">
              <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
            </div>
            <span className="nav-label" style={{ color: active ? 'var(--accent-primary)' : 'var(--text-dim)' }}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
