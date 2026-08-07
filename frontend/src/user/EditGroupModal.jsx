import React, { useState } from 'react';
import { X, Upload, Camera } from 'lucide-react';
import { API_BASE_URL } from '../api';

const EditGroupModal = ({ isOpen, onClose, group, onGroupUpdated }) => {
  const [name, setName] = useState(group?.name || '');
  const [groupType, setGroupType] = useState(group?.group_type || 'other');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(
    group?.photo ? (group.photo.startsWith('http') ? group.photo : `${API_BASE_URL}${group.photo}`) : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('group_type', groupType);
    if (photo) {
      formData.append('photo', photo);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/groups/${group.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error('Failed to update group');
      }

      const updatedGroup = await res.json();
      onGroupUpdated(updatedGroup);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <div className="modal-content card" onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Edit Group</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '16px', backgroundColor: 'var(--bg-body)',
              position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px dashed var(--border-color)', marginBottom: '12px'
            }}>
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Camera size={32} color="var(--text-secondary)" />
              )}
              <label style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white', fontSize: '0.75rem', padding: '4px', textAlign: 'center', cursor: 'pointer'
              }}>
                Upload
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Group Type</label>
            <select
              value={groupType}
              onChange={(e) => setGroupType(e.target.value)}
              className="input-field"
            >
              <option value="trip">Trip</option>
              <option value="home">Home</option>
              <option value="couple">Couple</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditGroupModal;
