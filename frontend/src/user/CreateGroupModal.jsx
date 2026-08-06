import React, { useState, useRef } from 'react';
import { X, ArrowRight, Check, Plane, Home, Heart, List, Upload, User } from 'lucide-react';
import { API_BASE_URL } from '../api';

export default function CreateGroupModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState('trip');
  const [addDates, setAddDates] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [addRent, setAddRent] = useState(false);
  const [rentAmount, setRentAmount] = useState('');
  const [rentDueDate, setRentDueDate] = useState('');
  const [addAnniversary, setAddAnniversary] = useState(false);
  const [anniversaryDate, setAnniversaryDate] = useState('');
  const [addDescription, setAddDescription] = useState(false);
  const [description, setDescription] = useState('');
  const [numMembers, setNumMembers] = useState('');
  const [membersData, setMembersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!groupName.trim()) return setError('Please enter a group name');
    const num = parseInt(numMembers, 10);
    if (!num || num < 1) return setError('Please enter a valid number of members');
    setError(''); setMembersData(Array(num).fill(null).map(() => ({ name: '', photo: null, photoPreview: null }))); setStep(2);
  };

  const handleMemberChange = (idx, field, value) => {
    const nd = [...membersData]; nd[idx][field] = value; setMembersData(nd);
  };

  const handlePhotoChange = (idx, e) => {
    const f = e.target.files[0];
    if (f) { const nd = [...membersData]; nd[idx].photo = f; nd[idx].photoPreview = URL.createObjectURL(f); setMembersData(nd); }
  };

  const handleSubmit = async () => {
    if (membersData.some(m => !m.name.trim())) return setError('Please fill in all member names');
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('name', groupName); fd.append('group_type', groupType);
      if (groupType === 'trip' && addDates && startDate && endDate) { fd.append('start_date', startDate); fd.append('end_date', endDate); }
      if (groupType === 'home' && addRent) { fd.append('rent_amount', rentAmount); fd.append('rent_due_date', rentDueDate); }
      if (groupType === 'couple' && addAnniversary && anniversaryDate) fd.append('anniversary_date', anniversaryDate);
      if (groupType === 'other' && addDescription && description) fd.append('description', description);
      membersData.forEach((m, idx) => { if (m.name.trim()) { fd.append(`member_name_${idx}`, m.name.trim()); if (m.photo) fd.append(`member_photo_${idx}`, m.photo); } });
      const res = await fetch(`${API_BASE_URL}/api/groups/`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }, body: fd });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to create group');
      onSuccess();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const types = [{ id: 'trip', label: 'Trip', icon: Plane }, { id: 'home', label: 'Home', icon: Home }, { id: 'couple', label: 'Couple', icon: Heart }, { id: 'other', label: 'Other', icon: List }];

  const inputSt = { width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border-md)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' };
  const focus = e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; };
  const blur = e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.boxShadow = 'none'; };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-panel animate-scale-in" style={{ width: '90%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>{step === 1 ? 'Create a group' : 'Add Members'}</h2>
          <button onClick={onClose} style={{ background: 'var(--bg-glass)', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: 'var(--radius-sm)', display: 'flex' }}><X size={20} /></button>
        </div>

        {error && <div style={{ background: 'rgba(244,63,94,0.12)', color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.25)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</div>}

        {step === 1 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div><label className="auth-label">Group name</label><input type="text" value={groupName} onChange={e => { setGroupName(e.target.value); if (error) setError(''); }} style={inputSt} onFocus={focus} onBlur={blur} /></div>
            <div>
              <label className="auth-label">Type</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {types.map(t => {
                  const Icon = t.icon; const sel = groupType === t.id;
                  return (
                    <div key={t.id} onClick={() => setGroupType(t.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 0.5rem', borderRadius: 'var(--radius-md)', border: `1px solid ${sel ? 'var(--accent-primary)' : 'var(--glass-border-md)'}`, background: sel ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.02)', color: sel ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <Icon size={20} /><span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{t.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {groupType === 'trip' && (
              <div style={{ background: 'var(--bg-glass)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: addDates ? '1rem' : 0 }}>
                  <label style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>Add trip dates</label>
                  <div onClick={() => setAddDates(!addDates)} style={{ width: 36, height: 20, borderRadius: 10, background: addDates ? 'var(--accent-primary)' : 'var(--bg-glass-lg)', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: addDates ? 18 : 2, transition: 'all 0.2s' }} />
                  </div>
                </div>
                {addDates && <div style={{ display: 'flex', gap: '1rem' }}><div style={{ flex: 1 }}><label className="auth-label">Start</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputSt} onFocus={focus} onBlur={blur} /></div><div style={{ flex: 1 }}><label className="auth-label">End</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputSt} onFocus={focus} onBlur={blur} /></div></div>}
              </div>
            )}

            {groupType === 'home' && (
              <div style={{ background: 'var(--bg-glass)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: addRent ? '1rem' : 0 }}>
                  <label style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>Add rent details</label>
                  <div onClick={() => setAddRent(!addRent)} style={{ width: 36, height: 20, borderRadius: 10, background: addRent ? 'var(--accent-primary)' : 'var(--bg-glass-lg)', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: addRent ? 18 : 2, transition: 'all 0.2s' }} />
                  </div>
                </div>
                {addRent && <div style={{ display: 'flex', gap: '1rem' }}><div style={{ flex: 1 }}><label className="auth-label">Monthly Rent (₹)</label><input type="number" value={rentAmount} onChange={e => setRentAmount(e.target.value)} style={inputSt} onFocus={focus} onBlur={blur} /></div><div style={{ flex: 1 }}><label className="auth-label">Due Date (1-31)</label><input type="number" min="1" max="31" value={rentDueDate} onChange={e => setRentDueDate(e.target.value)} style={inputSt} onFocus={focus} onBlur={blur} /></div></div>}
              </div>
            )}

            {groupType === 'couple' && (
              <div style={{ background: 'var(--bg-glass)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: addAnniversary ? '1rem' : 0 }}>
                  <label style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>Add anniversary</label>
                  <div onClick={() => setAddAnniversary(!addAnniversary)} style={{ width: 36, height: 20, borderRadius: 10, background: addAnniversary ? 'var(--accent-primary)' : 'var(--bg-glass-lg)', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: addAnniversary ? 18 : 2, transition: 'all 0.2s' }} />
                  </div>
                </div>
                {addAnniversary && <div><label className="auth-label">Anniversary Date</label><input type="date" value={anniversaryDate} onChange={e => setAnniversaryDate(e.target.value)} style={inputSt} onFocus={focus} onBlur={blur} /></div>}
              </div>
            )}

            {groupType === 'other' && (
              <div style={{ background: 'var(--bg-glass)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: addDescription ? '1rem' : 0 }}>
                  <label style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>Add a description</label>
                  <div onClick={() => setAddDescription(!addDescription)} style={{ width: 36, height: 20, borderRadius: 10, background: addDescription ? 'var(--accent-primary)' : 'var(--bg-glass-lg)', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: addDescription ? 18 : 2, transition: 'all 0.2s' }} />
                  </div>
                </div>
                {addDescription && <div><label className="auth-label">What is this group for?</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} style={inputSt} onFocus={focus} onBlur={blur} /></div>}
              </div>
            )}

            <div><label className="auth-label">How many OTHER persons? (excluding you)</label><input type="number" value={numMembers} onChange={e => { setNumMembers(e.target.value); if (error) setError(''); }} min="0" max="50" style={inputSt} onFocus={focus} onBlur={blur} /></div>
            <button onClick={handleNext} className="btn-primary" style={{ width: '100%', padding: '12px' }}>Continue <ArrowRight size={18} /></button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {membersData.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>You are the only member in this group for now!</p> : membersData.map((member, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-glass-md)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ position: 'relative' }}>
                  <label htmlFor={`photo-upload-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--glass-border-md)', cursor: 'pointer', overflow: 'hidden' }}>
                    {member.photoPreview ? <img src={member.photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={24} color="var(--text-secondary)" />}
                  </label>
                  <input id={`photo-upload-${idx}`} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handlePhotoChange(idx, e)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="auth-label">Person {idx + 1} Name</label>
                  <input type="text" value={member.name} placeholder="Enter name" onChange={e => handleMemberChange(idx, 'name', e.target.value)} style={inputSt} onFocus={focus} onBlur={blur} />
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1 }}>Back</button>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ flex: 1 }}>{loading ? 'Creating...' : 'Finish'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
