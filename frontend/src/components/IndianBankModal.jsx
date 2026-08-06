import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, ShieldCheck, Search, Loader, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../api';

const INDIAN_BANKS = [
  { name: 'HDFC Bank', color: '#004c8f', logo: 'H' },
  { name: 'State Bank of India', color: '#0078b5', logo: 'S' },
  { name: 'ICICI Bank', color: '#f18121', logo: 'I' },
  { name: 'Axis Bank', color: '#97144d', logo: 'A' },
  { name: 'Kotak Mahindra', color: '#ed1c24', logo: 'K' },
  { name: 'Punjab National Bank', color: '#a00f2e', logo: 'P' },
];

export default function IndianBankModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState('select_bank'); // select_bank, authenticating, fetching_data, success
  const [selectedBank, setSelectedBank] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep('select_bank');
      setSelectedBank(null);
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setStep('authenticating');
  };

  useEffect(() => {
    let timer1, timer2;
    if (step === 'authenticating') {
      timer1 = setTimeout(() => {
        setStep('fetching_data');
      }, 2500); // 2.5s for "authenticating"
    } else if (step === 'fetching_data') {
      timer2 = setTimeout(async () => {
        // Call backend API
        try {
          const token = localStorage.getItem('access_token');
          const res = await fetch(`${API_BASE_URL}/api/mock-banks/connect/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bank_name: selectedBank.name })
          });
          
          if (res.ok) {
            setStep('success');
            setTimeout(() => {
              onSuccess();
            }, 1500);
          } else {
            console.error("Failed to connect mock bank");
            setStep('select_bank');
          }
        } catch (e) {
          console.error(e);
          setStep('select_bank');
        }
      }, 3000); // 3s for "fetching_data"
    }
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [step, selectedBank, onSuccess]);

  if (!isOpen) return null;

  const filteredBanks = INDIAN_BANKS.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={{
          background: 'var(--bg-glass)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-xl)',
          width: '100%', maxWidth: '420px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem', borderBottom: '1px solid var(--glass-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 32, height: 32, background: 'var(--accent-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color="white" />
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              Secure Link
            </div>
          </div>
          {step === 'select_bank' && (
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          
          <AnimatePresence mode="wait">
            {step === 'select_bank' && (
              <motion.div
                key="select_bank"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>Select your bank</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-dim)' }}>Link your account via Account Aggregator to automatically track your balances.</p>
                </div>

                <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                  <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="Search for your bank"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)',
                      padding: '0.75rem 1rem 0.75rem 2.25rem', borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)',
                      outline: 'none', fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {filteredBanks.map((bank, i) => (
                    <div key={i} onClick={() => handleBankSelect(bank)} style={{
                      display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                      background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-lg)', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-glass-md)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: bank.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem' }}>
                        {bank.logo}
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {bank.name}
                      </div>
                    </div>
                  ))}
                  {filteredBanks.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem 0', fontSize: '0.9rem' }}>
                      No banks found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {(step === 'authenticating' || step === 'fetching_data') && selectedBank && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}
              >
                <div style={{ position: 'relative', width: 80, height: 80, marginBottom: '2rem' }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `3px solid ${selectedBank.color}30` }}></div>
                  <motion.div 
                    animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `3px solid transparent`, borderTopColor: selectedBank.color }}
                  />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2rem', color: selectedBank.color }}>
                    {selectedBank.logo}
                  </div>
                </div>
                
                <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>
                  {step === 'authenticating' ? `Connecting to ${selectedBank.name}...` : 'Fetching your accounts...'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                  Securely communicating via Account Aggregator framework. Please don't close this window.
                </p>
              </motion.div>
            )}

            {step === 'success' && selectedBank && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}
              >
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
                  style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(16,185,129,0.3)' }}
                >
                  <CheckCircle2 size={40} color="var(--accent-emerald)" />
                </motion.div>
                <h3 style={{ margin: '0 0 0.5rem', color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>
                  Successfully Connected!
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                  Your {selectedBank.name} accounts have been securely linked to your dashboard.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
        
        {/* Footer info */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.02)' }}>
          Powered by RBI-regulated Account Aggregator API
        </div>
      </motion.div>
    </div>
  );
}
