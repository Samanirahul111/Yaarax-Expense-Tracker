import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, TrendingUp, Percent, ReceiptText, CreditCard, ChevronRight, Calculator, LineChart } from 'lucide-react';

export default function FinancialTools() {
  const navigate = useNavigate();

  const tools = [
    { name: 'GST Calculator', icon: <Landmark size={24} />, path: '/tools/gst' },
    { name: 'SIP Calculator', icon: <TrendingUp size={24} />, path: '/tools/sip' },
    { name: 'FD Calculator', icon: <Percent size={24} />, path: '/tools/fd' },
    { name: 'Loan Affordability', icon: <CreditCard size={24} />, path: '/tools/loan' },
    { name: 'EMI Calculator', icon: <Calculator size={24} />, path: '/tools/emi' },
    { name: 'Compound Interest', icon: <LineChart size={24} />, path: '/tools/compound' },
  ];

  return (
    <div className="animate-fade-in" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <div className="tools-header">
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Financial Tools</h1>
      </div>
      
      <div style={{ padding: '1rem', marginTop: '1rem' }}>
        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          {tools.map((tool, index) => (
            <div 
              key={index} 
              className="tools-list-item"
              onClick={() => navigate(tool.path)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--text-primary)' }}>
                  {tool.icon}
                </div>
                <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                  {tool.name}
                </div>
              </div>
              <ChevronRight size={20} color="var(--text-secondary)" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
