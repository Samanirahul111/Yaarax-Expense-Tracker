import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, User, LogOut, Trash2, ChevronDown, Shield, AlertTriangle, Sun, Moon } from 'lucide-react';
import EditProfileModal from './EditProfileModal';
import { API_BASE_URL } from '../api';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [showPopover, setShowPopover] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const popoverRef = useRef(null);
  const [username, setUsername] = useState(localStorage.getItem('username') || 'User');
  const [profilePictureUrl, setProfilePictureUrl] = useState(localStorage.getItem('profile_picture') || null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(5);
  const deleteTimerRef = useRef(null);
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

  const executeDelete = async () => {
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
        alert("Failed to delete account.");
      }
    } catch (e) {
      console.error(e);
    }
    setShowDeleteModal(false);
    setIsDeleting(false);
  };

  const handleDeleteAccountConfirm = () => {
    setIsDeleting(true);
    setDeleteCountdown(5);
    deleteTimerRef.current = setInterval(() => {
      setDeleteCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(deleteTimerRef.current);
          executeDelete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelDelete = () => {
    if (deleteTimerRef.current) clearInterval(deleteTimerRef.current);
    setIsDeleting(false);
    setShowDeleteModal(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowPopover(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = username
    ? username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <>
      <nav className="navbar-container">
        {/* Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}
          onClick={() => navigate(localStorage.getItem('access_token') ? '/dashboard' : '/')}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--grad-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
            flexShrink: 0,
          }}>
            <Wallet color="white" size={20} />
          </div>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.2rem',
            fontWeight: 800,
            background: 'var(--grad-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em',
          }}>
            Yaarax <span className="mobile-hidden" style={{ fontWeight: 500, opacity: 0.8 }}>Expense</span>
          </span>
        </div>

        {/* Right side */}
        {!isAdmin && (
          localStorage.getItem('access_token') ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                style={{
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-secondary)',
                  width: '36px', height: '36px',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-glass-md)'; }}
                onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-glass)'; }}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

            <div style={{ position: 'relative' }} ref={popoverRef}>
              {/* Avatar trigger */}
              <button
                onClick={() => setShowPopover(!showPopover)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  padding: '0.4rem 0.6rem 0.4rem 0.4rem',
                  borderRadius: '50px',
                  background: showPopover
                    ? 'rgba(59,130,246,0.15)'
                    : 'rgba(255,255,255,0.05)',
                  border: '1px solid',
                  borderColor: showPopover
                    ? 'rgba(59,130,246,0.4)'
                    : 'var(--glass-border-md)',
                  transition: 'all 0.25s ease',
                  backdropFilter: 'blur(12px)',
                }}
                onMouseOver={(e) => { if (!showPopover) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'var(--glass-border-lg)'; } }}
                onMouseOut={(e) => { if (!showPopover) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'var(--glass-border-md)'; } }}
              >
                {/* Avatar */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--grad-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                  boxShadow: '0 0 0 2px rgba(59,130,246,0.35)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'white',
                  letterSpacing: '0.05em',
                }}>
                  {profilePictureUrl ? (
                    <img
                      src={profilePictureUrl.startsWith('http') ? profilePictureUrl : `${API_BASE_URL}${profilePictureUrl}`}
                      alt="Profile"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        setProfilePictureUrl(null);
                        localStorage.removeItem('profile_picture');
                      }}
                    />
                  ) : initials}
                </div>
                <span style={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                  maxWidth: '100px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                  className="mobile-hidden"
                >{username}</span>
                <ChevronDown
                  size={14}
                  color="var(--text-secondary)"
                  style={{
                    transition: 'transform 0.25s ease',
                    transform: showPopover ? 'rotate(180deg)' : 'rotate(0)',
                    flexShrink: 0,
                  }}
                />
              </button>

              {/* Premium Popover */}
              {showPopover && (
                <div
                  className="animate-slide-down"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--glass-border-md)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-xl), 0 0 0 1px rgba(255,255,255,0.04)',
                    width: '260px',
                    overflow: 'hidden',
                    zIndex: 60,
                  }}
                >
                  {/* Header */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(139,92,246,0.2) 100%)',
                    borderBottom: '1px solid var(--glass-border)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* Glow orb */}
                    <div style={{
                      position: 'absolute',
                      top: '-30px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '100px',
                      height: '100px',
                      background: 'radial-gradient(circle, rgba(59,130,246,0.4), transparent)',
                      filter: 'blur(20px)',
                      pointerEvents: 'none',
                    }} />

                    {/* Avatar */}
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'var(--grad-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      border: '2px solid rgba(255,255,255,0.2)',
                      boxShadow: 'var(--shadow-glow)',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: 'white',
                      letterSpacing: '0.05em',
                      position: 'relative',
                    }}>
                      {profilePictureUrl ? (
                        <img
                          src={profilePictureUrl.startsWith('http') ? profilePictureUrl : `${API_BASE_URL}${profilePictureUrl}`}
                          alt="Profile"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            setProfilePictureUrl(null);
                            localStorage.removeItem('profile_picture');
                          }}
                        />
                      ) : initials}
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: 'var(--text-primary)',
                      }}>{username}</div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-dim)',
                        marginTop: '2px',
                      }}>Yaarax Member</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ padding: '0.75rem' }}>
                    <PopoverButton
                      icon={<User size={15} />}
                      label="Edit Profile"
                      onClick={() => { setShowPopover(false); setShowEditModal(true); }}
                    />
                    <PopoverButton
                      icon={<LogOut size={15} />}
                      label="Sign Out"
                      variant="warning"
                      onClick={handleSignout}
                    />
                    <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0.5rem 0' }} />
                    <PopoverButton
                      icon={<Trash2 size={15} />}
                      label="Delete Account"
                      variant="danger"
                      onClick={() => { setShowPopover(false); setShowDeleteModal(true); }}
                    />
                  </div>
                </div>
              )}
            </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button
                onClick={() => navigate('/login')}
                className="btn-secondary"
                style={{ padding: '0.5rem 1.125rem', fontSize: '0.9rem' }}
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="btn-primary"
                style={{ padding: '0.5rem 1.125rem', fontSize: '0.9rem' }}
              >
                Sign Up
              </button>
            </div>
          )
        )}
      </nav>

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

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) cancelDelete(); }}>
          <div className="modal-panel animate-scale-in" style={{ width: '90%', maxWidth: '420px' }}>
            {/* Danger header */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(244,63,94,0.2) 0%, rgba(244,63,94,0.08) 100%)',
              borderBottom: '1px solid rgba(244,63,94,0.2)',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(244,63,94,0.15)',
                border: '1px solid rgba(244,63,94,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <AlertTriangle color="var(--accent-rose)" size={26} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem',
                }}>Delete Account</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  This action is permanent and cannot be undone.
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem' }}>
              {!isDeleting ? (
                <>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    marginBottom: '1.5rem',
                    textAlign: 'center',
                  }}>
                    All your expenses, savings, groups, and settings will be permanently deleted. Are you sure?
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={cancelDelete}
                      className="btn-secondary"
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccountConfirm}
                      className="btn-danger"
                      style={{ flex: 1 }}
                    >
                      <Trash2 size={15} />
                      Yes, Delete
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Deleting account in…
                  </p>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: 'rgba(244,63,94,0.15)',
                    border: '2px solid var(--accent-rose)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                    boxShadow: '0 0 20px rgba(244,63,94,0.3)',
                    animation: 'pulse-glow 1s ease infinite',
                  }}>
                    <span style={{
                      fontSize: '2rem',
                      fontWeight: 900,
                      color: 'var(--accent-rose)',
                      fontFamily: 'var(--font-heading)',
                    }}>{deleteCountdown}</span>
                  </div>
                  <button
                    onClick={cancelDelete}
                    className="btn-secondary"
                    style={{ width: '100%' }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PopoverButton({ icon, label, onClick, variant }) {
  const [hovered, setHovered] = useState(false);

  const colors = {
    default: {
      bg: hovered ? 'rgba(255,255,255,0.07)' : 'transparent',
      color: 'var(--text-primary)',
    },
    warning: {
      bg: hovered ? 'rgba(245,158,11,0.12)' : 'transparent',
      color: hovered ? 'var(--accent-amber)' : 'var(--text-secondary)',
    },
    danger: {
      bg: hovered ? 'rgba(244,63,94,0.12)' : 'transparent',
      color: hovered ? 'var(--accent-rose)' : 'var(--text-secondary)',
    },
  };

  const c = colors[variant || 'default'];

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.625rem 0.75rem',
        background: c.bg,
        color: c.color,
        border: 'none',
        borderRadius: 'var(--radius-md)',
        fontWeight: 600,
        fontSize: '0.875rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left',
        fontFamily: 'var(--font-body)',
      }}
    >
      {icon}
      {label}
    </button>
  );
}
