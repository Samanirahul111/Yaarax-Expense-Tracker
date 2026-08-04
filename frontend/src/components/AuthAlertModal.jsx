import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShieldAlert } from 'lucide-react';

const AuthAlertModal = ({ onClose, message = "Please log in or sign up to use this feature." }) => {
  const navigate = useNavigate();

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        padding: '32px 24px',
        position: 'relative',
        color: 'var(--text-primary)',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          <X size={24} />
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '50%' }}>
            <ShieldAlert size={48} color="var(--accent-primary)" />
          </div>
        </div>
        
        <h2 style={{ fontSize: '1.4rem', margin: '0 0 12px 0', fontWeight: '600' }}>Authentication Required</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1rem', lineHeight: '1.5' }}>
          {message}
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => {
              onClose();
              navigate('/login');
            }}
            style={{
              backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none',
              padding: '14px', borderRadius: '12px', fontWeight: '600',
              fontSize: '1rem', cursor: 'pointer', width: '100%',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'var(--accent-primary)'}
          >
            Log In
          </button>
          
          <button
            onClick={() => {
              onClose();
              navigate('/signup');
            }}
            style={{
              backgroundColor: 'transparent', color: 'var(--text-primary)', 
              border: '1px solid var(--border-color)',
              padding: '14px', borderRadius: '12px', fontWeight: '600',
              fontSize: '1rem', cursor: 'pointer', width: '100%',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'var(--bg-primary)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthAlertModal;
