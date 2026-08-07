import React, { useState, useEffect } from 'react';
import { X, UserPlus, User, Camera, Trash2, Edit2, Check } from 'lucide-react';
import { API_BASE_URL } from '../api';

const ManageMembersModal = ({ isOpen, onClose, group, onGroupUpdated }) => {
  const [members, setMembers] = useState(group?.members || []);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhoto, setNewMemberPhoto] = useState(null);
  const [newMemberPhotoPreview, setNewMemberPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhoto, setEditPhoto] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState(null);

  useEffect(() => {
    if (group) setMembers(group.members);
  }, [group]);

  if (!isOpen) return null;

  const handleAddMemberPhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewMemberPhoto(file);
      setNewMemberPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleEditMemberPhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditPhoto(file);
      setEditPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('group', group.id);
    formData.append('name', newMemberName.trim());
    if (newMemberPhoto) {
      formData.append('photo', newMemberPhoto);
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/group-members/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (!res.ok) throw new Error('Failed to add member');
      
      const newMember = await res.json();
      const updatedMembers = [...members, newMember];
      setMembers(updatedMembers);
      
      // Update parent component group state
      onGroupUpdated({ ...group, members: updatedMembers });
      
      setNewMemberName('');
      setNewMemberPhoto(null);
      setNewMemberPhotoPreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setEditName(m.name);
    setEditPhoto(null);
    setEditPhotoPreview(m.photo ? (m.photo.startsWith('http') ? m.photo : `${API_BASE_URL}${m.photo}`) : null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditPhoto(null);
    setEditPhotoPreview(null);
  };

  const saveEdit = async (m) => {
    if (!editName.trim()) return;
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('name', editName.trim());
    if (editPhoto) {
      formData.append('photo', editPhoto);
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/group-members/${m.id}/`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (!res.ok) throw new Error('Failed to update member');
      
      const updatedMember = await res.json();
      const updatedMembers = members.map(mem => mem.id === m.id ? updatedMember : mem);
      setMembers(updatedMembers);
      
      // Update parent component group state
      onGroupUpdated({ ...group, members: updatedMembers });
      
      cancelEdit();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (m) => {
    if (!window.confirm(`Are you sure you want to remove ${m.name}? This might affect past expenses.`)) return;
    
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/group-members/${m.id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to delete member');
      
      const updatedMembers = members.filter(mem => mem.id !== m.id);
      setMembers(updatedMembers);
      onGroupUpdated({ ...group, members: updatedMembers });
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
        width: '100%', maxWidth: '500px', backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '16px',
        maxHeight: '80vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Manage Members</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.875rem' }}>{error}</div>}

        {/* Add New Member */}
        <form onSubmit={handleAddMember} style={{ 
          display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', 
          padding: '16px', backgroundColor: 'var(--bg-body)', borderRadius: '12px', border: '1px solid var(--border-color)' 
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-card)',
            position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px dashed var(--text-secondary)', flexShrink: 0
          }}>
            {newMemberPhotoPreview ? (
              <img src={newMemberPhotoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Camera size={20} color="var(--text-secondary)" />
            )}
            <input type="file" accept="image/*" onChange={handleAddMemberPhoto} style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
          </div>
          
          <input
            type="text"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="New member name..."
            className="input-field"
            style={{ flex: 1, marginBottom: 0 }}
            required
          />
          
          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={16} /> Add
          </button>
        </form>

        {/* List of Members */}
        <div>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Current Members ({members.length})</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {members.map(m => (
              <div key={m.id} style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                padding: '12px', backgroundColor: 'var(--bg-body)', borderRadius: '12px' 
              }}>
                {editingId === m.id ? (
                  /* Editing Mode */
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-card)',
                      position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px dashed var(--text-secondary)', flexShrink: 0
                    }}>
                      {editPhotoPreview ? (
                        <img src={editPhotoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <User size={20} color="var(--text-secondary)" />
                      )}
                      <input type="file" accept="image/*" onChange={handleEditMemberPhoto} style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                    </div>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-field"
                      style={{ flex: 1, padding: '8px', marginBottom: 0 }}
                      autoFocus
                    />
                    <button onClick={() => saveEdit(m)} disabled={loading} style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                      <Check size={16} />
                    </button>
                    <button onClick={cancelEdit} disabled={loading} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  /* View Mode */
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--grad-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold',
                        overflow: 'hidden'
                      }}>
                        {m.photo ? (
                          <img src={m.photo.startsWith('http') ? m.photo : `${API_BASE_URL}${m.photo}`} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          m.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{m.name}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => startEdit(m)} disabled={loading} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(m)} disabled={loading} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManageMembersModal;
