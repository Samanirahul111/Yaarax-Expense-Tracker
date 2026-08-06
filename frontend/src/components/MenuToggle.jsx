import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, PieChart, Users, Calculator, PiggyBank, TrendingUp } from 'lucide-react';
import './MenuToggle.css';

export default function MenuToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
  };

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const navItems = [
    { path: '/dashboard', icon: <Home size={20} />, label: 'Home' },
    { path: '/savings-goals', icon: <PiggyBank size={20} />, label: 'Banks & Goals' },
    { path: '/savings', icon: <TrendingUp size={20} />, label: 'Investments' },
    { path: '/logs', icon: <FileText size={20} />, label: 'Logs' },
    { path: '/analytics', icon: <PieChart size={20} />, label: 'Analytics' },
    { path: '/groups', icon: <Users size={20} />, label: 'Groups' },
    { path: '/subscriptions', icon: <FileText size={20} />, label: 'Subscriptions' },
    { path: '/tools', icon: <Calculator size={20} />, label: 'Tools' }
  ];

  const handleNav = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div 
      className={`floating-menu-container ${isOpen ? 'open' : ''}`} 
      ref={menuRef}
    >
      <div 
        className="floating-menu"
        role="button"
        tabIndex="0"
        aria-expanded={isOpen}
        onClick={toggleMenu}
        onKeyDown={handleKeyDown}
      >
        <div className="menu-items-wrapper">
          {navItems.map((item, index) => (
            <div 
              key={index} 
              className="menu-item-pill" 
              onClick={(e) => {
                e.stopPropagation();
                handleNav(item.path);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        
        {/* Hamburger Icon */}
        <div className="hamburger-icon">
          <span className="line line-top"></span>
          <span className="line line-middle"></span>
          <span className="line line-bottom"></span>
        </div>
      </div>
    </div>
  );
}
