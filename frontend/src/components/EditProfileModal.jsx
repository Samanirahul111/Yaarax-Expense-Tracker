import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, User } from 'lucide-react';
import { API_BASE_URL } from '../api';


const EditProfileModal = ({ onClose, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/auth/profile/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUsername(data.username || '');
        if (data.profile_picture) {
          setPreviewUrl(data.profile_picture.startsWith('http') ? data.profile_picture : `${API_BASE_URL}${data.profile_picture}`);
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('username', username);
      if (profilePicture) {
        formData.append('profile_picture', profilePicture);
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/profile/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <div className="animate-scale-in" style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '16px',
        width: '100%', maxWidth: '400px',
        padding: '32px 24px',
        position: 'relative',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '1.4rem', margin: '0 0 24px 0', fontWeight: '600', textAlign: 'center', color: 'var(--text-primary)' }}>Edit Profile</h2>

        {error && <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Profile Picture Upload */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div 
              onClick={() => fileInputRef.current.click()}
              style={{
                width: '100px', height: '100px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-secondary)',
                border: '2px dashed var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Camera size={32} color="var(--text-secondary)" />
              )}
              
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white', fontSize: '0.75rem',
                textAlign: 'center', padding: '4px 0'
              }}>
                Edit
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div style={{ marginBottom: '24px', position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                <User size={18} />
              </div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px 12px 40px',
                  borderRadius: '8px', border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
                  fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
                }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !username}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', opacity: (loading || !username) ? 0.7 : 1 }}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
