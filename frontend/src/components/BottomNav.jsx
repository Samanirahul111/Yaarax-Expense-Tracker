import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, PieChart, Calculator, Users } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active route based on the beginning of the pathname
  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Hide on admin page
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { path: '/dashboard', icon: <Home size={24} />, label: 'Home' },
    { path: '/logs', icon: <FileText size={24} />, label: 'Logs' },
    { path: '/analytics', icon: <PieChart size={24} />, label: 'Analytics' },
    { path: '/groups', icon: <Users size={24} />, label: 'Groups' },
    { path: '/tools', icon: <Calculator size={24} />, label: 'Tools' }
  ];

  return (
    <div className="bottom-nav animate-fade-in">
      {navItems.map((item, index) => {
        const active = isActive(item.path);
        return (
          <div
            key={index}
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', flex: 1, padding: '0.75rem 0',
              cursor: 'pointer', transition: 'all 0.3s ease',
              color: active ? 'var(--accent-primary)' : 'var(--text-secondary)'
            }}
          >
            {item.icon}
            {/* Optional label if needed, the image only had icons */}
          </div>
        );
      })}
    </div>
  );
}
