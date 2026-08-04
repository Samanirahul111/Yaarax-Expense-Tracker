import React, { useState, useRef } from 'react';
import { X, ArrowRight, Check, Plane, Home, Heart, List, Upload, User } from 'lucide-react';
import { API_BASE_URL } from '../api';


const CreateGroupModal = ({ onClose, onSuccess }) => {
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
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }
    const num = parseInt(numMembers, 10);
    if (!num || num < 1) {
      setError('Please enter a valid number of members');
      return;
    }
    setError('');
    setMembersData(Array(num).fill(null).map(() => ({ name: '', photo: null, photoPreview: null })));
    setStep(2);
  };

  const handleMemberChange = (index, field, value) => {
    const newData = [...membersData];
    newData[index][field] = value;
    setMembersData(newData);
  };

  const handlePhotoChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newData = [...membersData];
      newData[index].photo = file;
      newData[index].photoPreview = URL.createObjectURL(file);
      setMembersData(newData);
    }
  };

  const handleSubmit = async () => {
    if (membersData.some(m => !m.name.trim())) {
      setError('Please fill in all member names');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      
      const formData = new FormData();
      formData.append('name', groupName);
      formData.append('group_type', groupType);
      
      if (groupType === 'trip' && addDates && startDate && endDate) {
        formData.append('start_date', startDate);
        formData.append('end_date', endDate);
      }
      
      if (groupType === 'home' && addRent) {
        formData.append('rent_amount', rentAmount);
        formData.append('rent_due_date', rentDueDate);
      }
      
      if (groupType === 'couple' && addAnniversary && anniversaryDate) {
        formData.append('anniversary_date', anniversaryDate);
      }
      
      if (groupType === 'other' && addDescription && description) {
        formData.append('description', description);
      }
      
      let hasPhotos = false;
      membersData.forEach((m, idx) => {
        if (m.name.trim()) {
          formData.append(`member_name_${idx}`, m.name.trim());
          if (m.photo) {
            formData.append(`member_photo_${idx}`, m.photo);
            hasPhotos = true;
          }
        }
      });
      
      // If no photos, we could also just send the simple json, but backend supports multipart.

      const res = await fetch(`${API_BASE_URL}/api/groups/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create group');
      
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const types = [
    { id: 'trip', label: 'Trip', icon: Plane },
    { id: 'home', label: 'Home', icon: Home },
    { id: 'couple', label: 'Couple', icon: Heart },
    { id: 'other', label: 'Other', icon: List }
  ];

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
        backgroundColor: '#fff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '420px',
        padding: '24px',
        position: 'relative',
        color: '#111827',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
          >
            <X size={24} />
          </button>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500' }}>
            {step === 1 ? 'Create a group' : 'Add Members'}
          </h2>
          {step === 2 ? (
            <button 
              onClick={handleSubmit} disabled={loading}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontWeight: 'bold' }}
            >
              Done
            </button>
          ) : <div style={{ width: 24 }} />}
        </div>

        {error && (
          <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {step === 1 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#4b5563', fontSize: '0.85rem' }}>Group name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                  if (error) setError('');
                }}
                style={{
                  width: '100%', padding: '8px 0',
                  border: 'none', borderBottom: '2px solid #2563eb',
                  backgroundColor: 'transparent', color: '#111827',
                  fontSize: '1.2rem', outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '12px', color: '#4b5563', fontSize: '0.85rem' }}>Type</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {types.map(t => {
                  const Icon = t.icon;
                  const isSelected = groupType === t.id;
                  return (
                    <div key={t.id} onClick={() => setGroupType(t.id)} style={{
                      flex: 1,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      padding: '12px 8px',
                      borderRadius: '12px',
                      border: `1px solid ${isSelected ? '#2563eb' : '#d1d5db'}`,
                      backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                      color: isSelected ? '#1d4ed8' : '#6b7280',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                      <Icon size={24} />
                      <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>{t.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              {groupType === 'trip' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0, color: '#111827', fontSize: '1rem' }}>Add trip dates</label>
                    <div 
                      onClick={() => setAddDates(!addDates)}
                      style={{
                        width: '40px', height: '24px', borderRadius: '12px',
                        backgroundColor: addDates ? '#2563eb' : '#d1d5db',
                        position: 'relative', cursor: 'pointer', transition: 'background-color 0.3s'
                      }}
                    >
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff',
                        position: 'absolute', top: '3px', left: addDates ? '19px' : '3px',
                        transition: 'left 0.3s'
                      }} />
                    </div>
                  </div>
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#6b7280' }}>Splitwise will remind friends to join, add expenses, and settle up.</p>
                  
                  {addDates && (
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '4px', color: '#4b5563', fontSize: '0.8rem' }}>Start</label>
                        <input 
                          type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                          style={{ width: '100%', padding: '8px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #d1d5db', color: '#111827' }} 
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '4px', color: '#4b5563', fontSize: '0.8rem' }}>End</label>
                        <input 
                          type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                          style={{ width: '100%', padding: '8px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #d1d5db', color: '#111827' }} 
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {groupType === 'home' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0, color: '#111827', fontSize: '1rem' }}>Add rent details</label>
                    <div 
                      onClick={() => setAddRent(!addRent)}
                      style={{
                        width: '40px', height: '24px', borderRadius: '12px',
                        backgroundColor: addRent ? '#2563eb' : '#d1d5db',
                        position: 'relative', cursor: 'pointer', transition: 'background-color 0.3s'
                      }}
                    >
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff',
                        position: 'absolute', top: '3px', left: addRent ? '19px' : '3px',
                        transition: 'left 0.3s'
                      }} />
                    </div>
                  </div>
                  
                  {addRent && (
                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '4px', color: '#4b5563', fontSize: '0.8rem' }}>Monthly Rent (₹)</label>
                        <input 
                          type="number" value={rentAmount} onChange={e => setRentAmount(e.target.value)}
                          placeholder="0.00"
                          style={{ width: '100%', padding: '8px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #d1d5db', color: '#111827' }} 
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '4px', color: '#4b5563', fontSize: '0.8rem' }}>Due Date (1-31)</label>
                        <input 
                          type="number" min="1" max="31" value={rentDueDate} onChange={e => setRentDueDate(e.target.value)}
                          placeholder="1"
                          style={{ width: '100%', padding: '8px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #d1d5db', color: '#111827' }} 
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {groupType === 'couple' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0, color: '#111827', fontSize: '1rem' }}>Add anniversary</label>
                    <div 
                      onClick={() => setAddAnniversary(!addAnniversary)}
                      style={{
                        width: '40px', height: '24px', borderRadius: '12px',
                        backgroundColor: addAnniversary ? '#2563eb' : '#d1d5db',
                        position: 'relative', cursor: 'pointer', transition: 'background-color 0.3s'
                      }}
                    >
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff',
                        position: 'absolute', top: '3px', left: addAnniversary ? '19px' : '3px',
                        transition: 'left 0.3s'
                      }} />
                    </div>
                  </div>
                  
                  {addAnniversary && (
                    <div style={{ marginTop: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', color: '#4b5563', fontSize: '0.8rem' }}>Anniversary Date</label>
                      <input 
                        type="date" value={anniversaryDate} onChange={e => setAnniversaryDate(e.target.value)}
                        style={{ width: '100%', padding: '8px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #d1d5db', color: '#111827' }} 
                      />
                    </div>
                  )}
                </>
              )}

              {groupType === 'other' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0, color: '#111827', fontSize: '1rem' }}>Add a description</label>
                    <div 
                      onClick={() => setAddDescription(!addDescription)}
                      style={{
                        width: '40px', height: '24px', borderRadius: '12px',
                        backgroundColor: addDescription ? '#2563eb' : '#d1d5db',
                        position: 'relative', cursor: 'pointer', transition: 'background-color 0.3s'
                      }}
                    >
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff',
                        position: 'absolute', top: '3px', left: addDescription ? '19px' : '3px',
                        transition: 'left 0.3s'
                      }} />
                    </div>
                  </div>
                  
                  {addDescription && (
                    <div style={{ marginTop: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', color: '#4b5563', fontSize: '0.8rem' }}>What is this group for?</label>
                      <input 
                        type="text" value={description} onChange={e => setDescription(e.target.value)}
                        placeholder="e.g. Split bills for the road trip"
                        style={{ width: '100%', padding: '8px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #d1d5db', color: '#111827', outline: 'none' }} 
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#4b5563', fontSize: '0.85rem' }}>How many OTHER persons in this group? (excluding you)</label>
              <input
                type="number"
                value={numMembers}
                onChange={(e) => {
                  setNumMembers(e.target.value);
                  if (error) setError('');
                }}
                min="0" max="50"
                style={{
                  width: '100%', padding: '8px 0',
                  border: 'none', borderBottom: '1px solid #d1d5db',
                  backgroundColor: 'transparent', color: '#111827',
                  fontSize: '1rem', outline: 'none'
                }}
              />
            </div>
            
            <button
              onClick={handleNext}
              style={{
                backgroundColor: '#2563eb', color: 'white', border: 'none',
                padding: '14px', borderRadius: '8px', fontWeight: '600',
                fontSize: '1rem', cursor: 'pointer', marginTop: '12px'
              }}
            >
              Continue
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              {membersData.length === 0 ? (
                <p style={{ color: '#4b5563' }}>You are the only member in this group for now!</p>
              ) : (
                membersData.map((member, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', alignItems: 'center', gap: '16px', 
                    marginBottom: '16px', padding: '12px', 
                    border: '1px solid #e5e7eb', borderRadius: '12px',
                    backgroundColor: '#f9fafb'
                  }}>
                    <div style={{ position: 'relative' }}>
                      <label 
                        htmlFor={`photo-upload-${idx}`}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: '60px', height: '60px', borderRadius: '50%',
                          backgroundColor: '#e5e7eb', cursor: 'pointer',
                          overflow: 'hidden', border: '2px dashed #9ca3af'
                        }}
                      >
                        {member.photoPreview ? (
                          <img src={member.photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <User size={24} color="#6b7280" />
                        )}
                      </label>
                      <input 
                        id={`photo-upload-${idx}`}
                        type="file" 
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handlePhotoChange(idx, e)}
                      />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '4px', color: '#4b5563', fontSize: '0.85rem' }}>
                        Person {idx + 1} Name
                      </label>
                      <input
                        type="text"
                        value={member.name}
                        placeholder="Enter name"
                        onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                        style={{
                          width: '100%', padding: '8px 0',
                          border: 'none', borderBottom: '1px solid #d1d5db',
                          backgroundColor: 'transparent', color: '#111827',
                          fontSize: '1rem', outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateGroupModal;

