import React from 'react';
import { ArrowLeft, ArrowUpDown } from 'lucide-react';
import { getCategoryIcon } from './utils';

export default function CategorySpends({ categorySpends, onBack, monthName }) {
  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', padding: '2rem', fontFamily: 'var(--font-family)' }}>
      
      {/* Background Animated Shapes for consistency */}
      <div className="bg-animation-wrapper">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <button onClick={onBack} className="hover-lift" style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginRight: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <ArrowLeft size={20} color="var(--text-primary)" />
          </button>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Category Spends</h2>
        </div>

        <div className="animate-slide-up" style={{ background: 'white', borderRadius: '24px', padding: '2rem', minHeight: 'calc(100vh - 120px)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <button style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.6rem 1.2rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
              {monthName || 'July'} 2026
              <span style={{ fontSize: '0.7rem' }}>▼</span>
            </button>
            <ArrowUpDown color="var(--text-secondary)" size={20} />
          </div>
          
          <hr style={{ borderColor: 'var(--border-color)', marginBottom: '2rem', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {categorySpends.map((cat, idx) => (
              <div key={idx} className="hover-lift" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '16px', background: 'white', transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', border: '1px solid var(--border-color)' }}>
                    {getCategoryIcon(cat.category__name)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{cat.category__name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem', fontWeight: '500' }}>
                      {cat.transactions} Transaction{cat.transactions !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div style={{ fontWeight: '700', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                  ₹{cat.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
            {categorySpends.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 0', fontSize: '1.1rem' }}>No spends recorded this month.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
