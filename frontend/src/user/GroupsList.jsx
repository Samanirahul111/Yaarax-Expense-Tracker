import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, ArrowRight, Globe } from 'lucide-react';
import CreateGroupModal from './CreateGroupModal';
import AuthAlertModal from '../components/AuthAlertModal';
import { API_BASE_URL } from '../api';

const GroupsList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const navigate = useNavigate();

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) { setGroups([]); setLoading(false); return; }
      const res = await fetch(`${API_BASE_URL}/api/groups/`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) { if (res.status === 401) { setGroups([]); return; } throw new Error('Failed to fetch groups'); }
      setGroups(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) { setJoinError('Please enter an invite code.'); return; }
    setJoinLoading(true); setJoinError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/groups/join/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ invite_code: joinCode.trim().toUpperCase() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join group.');
      setShowJoinModal(false); setJoinCode(''); fetchGroups();
    } catch (err) { setJoinError(err.message); }
    finally { setJoinLoading(false); }
  };

  useEffect(() => { fetchGroups(); }, []);

  const requireAuth = (cb) => {
    if (!localStorage.getItem('access_token')) { setShowAuthAlert(true); return; }
    cb();
  };

  const GROUP_COLORS = ['var(--accent-primary)', 'var(--accent-violet)', 'var(--accent-emerald)', 'var(--accent-amber)', 'var(--accent-rose)', 'var(--accent-cyan)'];

  return (
    <div style={{ paddingBottom: '5rem', minHeight: '100vh', background: 'var(--bg-deep)', position: 'relative' }}>
      <div className="bg-animation-wrapper">
        <div className="shape shape-1" style={{ opacity: 0.4 }} />
        <div className="shape shape-3" style={{ opacity: 0.3 }} />
      </div>

      <div className="tools-header" style={{ marginBottom: '2rem' }}>
        <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users color="var(--accent-violet)" size={20} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Groups & Trips</h1>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '1px' }}>Split expenses with friends</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <button onClick={() => requireAuth(() => setShowJoinModal(true))} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              <Globe size={15} /> Join
            </button>
            <button onClick={() => requireAuth(() => setShowCreateModal(true))} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              <Plus size={15} /> New Group
            </button>
          </div>
        </div>
      </div>

      <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
        {error && (
          <div style={{ background: 'rgba(244,63,94,0.12)', color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.25)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--glass-border)', borderTop: '3px solid var(--accent-primary)', animation: 'spin-slow 0.8s linear infinite' }} />
          </div>
        ) : groups.length === 0 ? (
          <div className="animate-scale-in card-solid" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Users size={32} color="var(--accent-violet)" />
            </div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>No Groups Yet</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Create a group to start splitting expenses with friends.</p>
            <button onClick={() => requireAuth(() => setShowCreateModal(true))} className="btn-primary" style={{ display: 'inline-flex' }}>
              <Plus size={16} /> Create First Group
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {groups.map((group, idx) => {
              const color = GROUP_COLORS[idx % GROUP_COLORS.length];
              const initials = group.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div key={group.id} className="animate-slide-up card-solid" style={{
                  animationDelay: `${idx * 40}ms`,
                  padding: '1.25rem 1.5rem',
                  cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderLeft: `3px solid ${color}`,
                  transition: 'transform 0.25s var(--ease-bounce), box-shadow 0.25s ease',
                }}
                  onClick={() => navigate(`/groups/${group.id}`)}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: `linear-gradient(135deg, ${color}33, ${color}18)`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, color, fontFamily: 'var(--font-heading)', flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>{group.name}</h3>
                      <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.8rem' }}>{group.members.length} members</p>
                    </div>
                  </div>
                  <ArrowRight size={18} color="var(--text-dim)" style={{ transition: 'transform 0.2s', flexShrink: 0 }} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateGroupModal onClose={() => setShowCreateModal(false)} onSuccess={() => { setShowCreateModal(false); fetchGroups(); }} />
      )}

      {showJoinModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowJoinModal(false); setJoinError(''); setJoinCode(''); } }}>
          <div className="modal-panel animate-scale-in" style={{ width: '90%', maxWidth: '400px', padding: '2rem' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800 }}>Join a Group</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Enter the 6-character invite code shared by the group creator.
            </p>
            {joinError && (
              <div style={{ background: 'rgba(244,63,94,0.12)', color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.25)', padding: '0.625rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {joinError}
              </div>
            )}
            <input type="text" placeholder="e.g. G-8A2F9" value={joinCode} onChange={e => setJoinCode(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--glass-border-md)', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', marginBottom: '1.25rem', fontSize: '1rem', outline: 'none', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'var(--font-body)', fontWeight: 600 }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.boxShadow = 'none'; }}
            />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => { setShowJoinModal(false); setJoinError(''); setJoinCode(''); }} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleJoinGroup} disabled={joinLoading} className="btn-primary" style={{ flex: 1, opacity: joinLoading ? 0.7 : 1 }}>
                {joinLoading ? 'Joining…' : 'Join Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuthAlert && <AuthAlertModal onClose={() => setShowAuthAlert(false)} message="Please log in or sign up to create a group." />}
    </div>
  );
};

export default GroupsList;
