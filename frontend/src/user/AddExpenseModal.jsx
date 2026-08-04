import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, UploadCloud, Plus, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../api';


export default function AddExpenseModal({ isOpen, onClose, onAdded, expenseToEdit }) {
  const [categories, setCategories] = useState([]);
  const [mode, setMode] = useState('manual'); // 'manual' or 'scan'
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    payment_method: 'Cash',
    description: '',
    items: [] // { name, price }
  });
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && expenseToEdit) {
      setFormData({
        amount: expenseToEdit.amount || '',
        category: expenseToEdit.category || (categories.find(c => c.name === expenseToEdit.category_name)?.id) || '',
        payment_method: expenseToEdit.payment_method || 'Cash',
        description: expenseToEdit.description || '',
        items: expenseToEdit.items || []
      });
      setMode('manual');
    } else if (isOpen && !expenseToEdit && categories.length > 0) {
      setFormData(prev => ({ ...prev, category: categories[0].id }));
    }
  }, [isOpen, expenseToEdit, categories]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/`);
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setFormData({ amount: '', category: categories[0]?.id || '', payment_method: 'Cash', description: '', items: [] });
    setMode('manual');
  };

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanning(true);
    const data = new FormData();
    data.append('receipt', file);

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/expenses/scan-receipt/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });
      
      if (res.ok) {
        const result = await res.json();
        setFormData(prev => ({
          ...prev,
          items: result.items,
          amount: result.total,
          description: 'Groceries / Store Bill' // Auto-fill
        }));
      } else {
        alert('Failed to scan receipt');
      }
    } catch (error) {
      console.error('Scan error:', error);
      alert('An error occurred during scanning');
    } finally {
      setScanning(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Auto-update total
    if (field === 'price') {
      const newTotal = newItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
      setFormData(prev => ({ ...prev, items: newItems, amount: newTotal }));
    } else {
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const newTotal = newItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    setFormData(prev => ({ ...prev, items: newItems, amount: newTotal }));
  };

  const addItem = () => {
    setFormData(prev => ({ ...prev, items: [...prev.items, { name: '', price: '' }] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Check for anomaly
    try {
      const token = localStorage.getItem('access_token');
      const mlRes = await fetch(`${API_BASE_URL}/api/ml/analyze-expense/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: formData.amount, description: formData.description })
      });
      if (mlRes.ok) {
        const mlData = await mlRes.json();
        if (mlData.is_recurring) {
          console.log("AI detected this as a recurring expense.");
        }
      }
    } catch (e) {
      console.error("ML Anomaly check failed", e);
    }

    try {
      const token = localStorage.getItem('access_token');
      const url = expenseToEdit 
        ? `${API_BASE_URL}/api/expenses/${expenseToEdit.id}/`
        : `${API_BASE_URL}/api/expenses/`;
      const method = expenseToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        if (expenseToEdit) {
          alert('edit successfully');
        }
        onAdded();
        onClose();
        resetForm();
      } else {
        alert('Failed to add expense');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '24px', width: '100%', maxWidth: '500px',
        maxHeight: '90vh', overflowY: 'auto', padding: '30px', position: 'relative',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <button onClick={() => { onClose(); resetForm(); }} style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)'
        }}>
          <X size={24} />
        </button>

        <h2 style={{ margin: '0 0 20px 0', color: 'var(--text-primary)' }}>{expenseToEdit ? 'Edit Expense' : 'Add New Expense'}</h2>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <button 
            type="button" 
            onClick={() => setMode('manual')}
            style={{
              flex: 1, padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              backgroundColor: mode === 'manual' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              color: mode === 'manual' ? 'white' : 'var(--text-primary)',
              fontWeight: '600', transition: 'all 0.2s'
            }}
          >
            Manual Entry
          </button>
          <button 
            type="button" 
            onClick={() => setMode('scan')}
            style={{
              flex: 1, padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              backgroundColor: mode === 'scan' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              color: mode === 'scan' ? 'white' : 'var(--text-primary)',
              fontWeight: '600', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <Camera size={18} /> Scan Bill
          </button>
        </div>

        {mode === 'scan' && formData.items.length === 0 && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--border-color)', borderRadius: '16px', padding: '40px 20px',
              textAlign: 'center', cursor: 'pointer', marginBottom: '24px', backgroundColor: 'var(--bg-secondary)',
              transition: 'border-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            {scanning ? (
              <div style={{ color: 'var(--accent-primary)' }}>Scanning Receipt...</div>
            ) : (
              <>
                <UploadCloud size={40} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Upload Receipt Photo</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>We'll automatically extract the items.</p>
              </>
            )}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileUpload} 
              disabled={scanning}
            />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {formData.items.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Scanned Items</h4>
                <button type="button" onClick={addItem} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', fontWeight: '500' }}>
                  <Plus size={16} /> Add Item
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {formData.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      value={item.name} 
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      placeholder="Item name"
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                      required
                    />
                    <input 
                      type="number" 
                      value={item.price} 
                      onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                      placeholder="Price"
                      step="0.01" min="0"
                      style={{ width: '100px', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                      required
                    />
                    <button type="button" onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Amount (₹)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', boxSizing: 'border-box' }}
              required
              step="0.01"
              min="0"
              disabled={formData.items.length > 0} // Disabled if items dictate the total
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              onBlur={async () => {
                if (!formData.description) return;
                try {
                  const token = localStorage.getItem('access_token');
                  const res = await fetch(`${API_BASE_URL}/api/ml/predict-category/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ description: formData.description })
                  });
                  if (res.ok) {
                    const data = await res.json();
                    if (data.category) {
                      const matchedCat = categories.find(c => c.name.toLowerCase() === data.category.toLowerCase());
                      if (matchedCat) setFormData(prev => ({ ...prev, category: matchedCat.id }));
                    }
                  }
                } catch (e) {
                  console.error('ML Category prediction failed', e);
                }
              }}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', boxSizing: 'border-box' }}
              required
            />
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
              ✨ AI will auto-categorize when you finish typing.
            </small>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', boxSizing: 'border-box' }}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Payment Method</label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', boxSizing: 'border-box' }}
            >
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="UPI">UPI</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? 'Saving...' : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  );
}
