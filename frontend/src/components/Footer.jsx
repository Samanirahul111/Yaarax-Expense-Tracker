import React from 'react';
import { Wallet, Globe, Mail, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo" style={{ color: 'white', marginBottom: '1rem' }}>
              <Wallet color="var(--accent-primary)" />
              Yaarax Expense Tracker
            </div>
            <p className="footer-description">
              Empower your financial journey with Yaarax. Seamlessly track expenses, manage budgets, and gain meaningful insights to take full control of your money.
            </p>
          </div>
          
          <div className="footer-links-group">
            <h4>Application</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/analytics">Analytics</Link></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4>Features</h4>
            <ul>
              <li><Link to="/groups">Groups</Link></li>
              <li><Link to="/savings">Savings</Link></li>
              <li><Link to="/subscriptions">Subscriptions</Link></li>
              <li><Link to="/logs">Logs</Link></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/feedback">Feedback</Link></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4>Calculators</h4>
            <ul>
              <li><Link to="/tools">All Tools</Link></li>
              <li><Link to="/tools/gst">GST Calculator</Link></li>
              <li><Link to="/tools/sip">SIP Calculator</Link></li>
              <li><Link to="/tools/emi">EMI Calculator</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Yaarax Expense Tracker. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
