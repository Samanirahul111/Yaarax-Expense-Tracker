import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, ArrowRight } from 'lucide-react';
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
      if (!token) {
        setGroups([]);
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/groups/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          setGroups([]);
          return;
        }
        throw new Error('Failed to fetch groups');
      }

      const data = await res.json();
      setGroups(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) {
      setJoinError('Please enter an invite code.');
      return;
    }
    setJoinLoading(true);
    setJoinError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/groups/join/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ invite_code: joinCode.trim().toUpperCase() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to join group.');
      }
      setShowJoinModal(false);
      setJoinCode('');
      fetchGroups();
    } catch (err) {
      setJoinError(err.message);
    } finally {
      setJoinLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div style={{ paddingBottom: '80px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div className="tools-header" style={{ marginBottom: '24px' }}>
        <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Groups & Trips</h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => {
                const token = localStorage.getItem('access_token');
                if (!token) {
                  setShowAuthAlert(true);
                  return;
                }
                setShowJoinModal(true);
              }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                padding: '10px 16px',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Join Group
            </button>
            <button 
              onClick={() => {
                const token = localStorage.getItem('access_token');
                if (!token) {
                  setShowAuthAlert(true);
                  return;
                }
                setShowCreateModal(true);
              }}
              style={{
                backgroundColor: 'white',
                color: 'var(--accent-primary)',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus size={18} /> New Group
            </button>
          </div>
        </div>
      </div>

      <div className="page-container">

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading groups...</div>
      ) : groups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px' }}>
          <Users size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>No Groups Yet</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Create a group to start splitting expenses with friends.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {groups.map(group => (
            <div 
              key={group.id}
              onClick={() => navigate(`/groups/${group.id}`)}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                padding: '20px',
                borderRadius: '16px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
            >
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '1.2rem' }}>{group.name}</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {group.members.length} members
                </p>
              </div>
              <div style={{ color: 'var(--accent-primary)' }}>
                <ArrowRight size={20} />
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateGroupModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={() => {
            setShowCreateModal(false);
            fetchGroups();
          }} 
        />
      )}

      {showJoinModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-primary)', borderRadius: '16px', width: '100%', maxWidth: '400px',
            padding: '24px', color: 'var(--text-primary)'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>Join a Group</h2>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Enter the 6-character invite code shared by the group creator.
            </p>
            {joinError && (
              <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
                {joinError}
              </div>
            )}
            <input 
              type="text" 
              placeholder="e.g. G-8A2F9"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              style={{
                width: '100%', padding: '12px', border: '1px solid var(--border-color)',
                borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)',
                marginBottom: '20px', fontSize: '1rem', outline: 'none', textTransform: 'uppercase'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => { setShowJoinModal(false); setJoinError(''); setJoinCode(''); }}
                style={{ padding: '10px 16px', border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleJoinGroup}
                disabled={joinLoading}
                style={{ padding: '10px 20px', border: 'none', backgroundColor: 'var(--accent-primary)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {joinLoading ? 'Joining...' : 'Join Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuthAlert && (
        <AuthAlertModal 
          onClose={() => setShowAuthAlert(false)} 
          message="Please log in or sign up to create a group."
        />
      )}
      </div>
    </div>
  );
};

export default GroupsList;
