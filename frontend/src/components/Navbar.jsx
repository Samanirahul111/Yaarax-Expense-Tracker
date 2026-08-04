import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, User, LogOut } from 'lucide-react';
import EditProfileModal from './EditProfileModal';
import { API_BASE_URL } from '../api';


export default function Navbar() {
  const [showPopover, setShowPopover] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const popoverRef = useRef(null);
  const [username, setUsername] = useState(localStorage.getItem('username') || 'User');
  const [profilePictureUrl, setProfilePictureUrl] = useState(localStorage.getItem('profile_picture') || null);
  
  const isAdmin = location.pathname.startsWith('/admin');

  const fetchProfile = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.username && data.username !== 'User') {
        setUsername(data.username);
        localStorage.setItem('username', data.username);
      }
      if (data.profile_picture) {
        setProfilePictureUrl(data.profile_picture);
        localStorage.setItem('profile_picture', data.profile_picture);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (username === 'User' || !profilePictureUrl) {
      fetchProfile();
    }
  }, [username, profilePictureUrl]);

  const handleSignout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowPopover(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="navbar-container" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'white',
      borderBottom: '1px solid var(--border-color, #e2e8f0)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      {/* Left side: Logo and Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ padding: '8px', background: 'var(--bg-primary, #eff6ff)', borderRadius: '8px' }}>
          <Wallet color="var(--accent-primary, #3b82f6)" size={24} />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: 'var(--text-primary, #1e293b)' }}>
          Yaarax <span className="mobile-hidden">Expense Tracker</span>
        </h1>
      </div>

      {/* Right side: User info and popover or Auth buttons */}
      {!isAdmin && (
        localStorage.getItem('access_token') ? (
          <div style={{ position: 'relative' }} ref={popoverRef}>
            <div 
              onClick={() => setShowPopover(!showPopover)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '8px',
                transition: 'background 0.2s',
                background: showPopover ? '#f1f5f9' : 'transparent'
              }}
              onMouseOver={(e) => { if (!showPopover) e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseOut={(e) => { if (!showPopover) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontWeight: '500', color: 'var(--text-primary, #1e293b)' }}>{username}</span>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                background: 'var(--accent-primary, #3b82f6)', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {profilePictureUrl ? (
                  <img src={profilePictureUrl.startsWith('http') ? profilePictureUrl : `${API_BASE_URL}${profilePictureUrl}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={20} />
                )}
              </div>
            </div>

            {/* Popover */}
            {showPopover && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                border: 'none',
                width: '280px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 60
              }}>
                {/* Top Blue Section */}
                <div style={{
                  background: 'var(--accent-primary, #3b82f6)',
                  padding: '2rem 1.5rem 2.5rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  borderBottomLeftRadius: '50% 40px',
                  borderBottomRightRadius: '50% 40px',
                }}>
                  <div style={{ 
                    width: '72px', 
                    height: '72px', 
                    borderRadius: '50%', 
                    background: 'white', 
                    color: 'var(--accent-primary, #3b82f6)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    overflow: 'hidden'
                  }}>
                    {profilePictureUrl ? (
                      <img src={profilePictureUrl.startsWith('http') ? profilePictureUrl : `${API_BASE_URL}${profilePictureUrl}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={36} />
                    )}
                  </div>
                  <h3 style={{ margin: '0', fontWeight: '600', fontSize: '1.3rem', color: 'white' }}>{username}</h3>
                </div>
                
                {/* Bottom White Section */}
                <div style={{
                  padding: '1.5rem',
                  background: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <button 
                    onClick={() => { setShowPopover(false); setShowEditModal(true); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      background: '#f1f5f9',
                      color: 'var(--text-primary)',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      fontSize: '1rem'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
                  >
                    <User size={18} />
                    Edit Profile
                  </button>
                  <button 
                    onClick={handleSignout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      background: '#fee2e2',
                      color: '#ef4444',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      fontSize: '1rem'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#fecaca'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#fee2e2'}
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                  <button 
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.")) {
                        try {
                          const token = localStorage.getItem('access_token');
                          const res = await fetch(`${API_BASE_URL}/api/auth/delete-account/`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          if (res.ok) {
                            localStorage.removeItem('access_token');
                            localStorage.removeItem('refresh_token');
                            localStorage.removeItem('username');
                            localStorage.removeItem('profile_picture');
                            navigate('/signup');
                          } else {
                            alert("Failed to delete account. You might be an admin.");
                          }
                        } catch(e) {
                          console.error(e);
                        }
                      }
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      background: 'transparent',
                      color: '#ef4444',
                      border: '1px solid #ef4444',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      fontSize: '1rem',
                      marginTop: '0.25rem'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => navigate('/login')}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/signup')}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--accent-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Sign Up
            </button>
          </div>
        )
      )}

      {showEditModal && (
        <EditProfileModal 
          onClose={() => setShowEditModal(false)}
          onSuccess={(data) => {
            if (data.username) {
              setUsername(data.username);
              localStorage.setItem('username', data.username);
            }
            if (data.profile_picture) {
              setProfilePictureUrl(data.profile_picture);
              localStorage.setItem('profile_picture', data.profile_picture);
            }
          }}
        />
      )}
    </div>
  );
}
