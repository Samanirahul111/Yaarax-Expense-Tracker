import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, UploadCloud, Plus, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../api';

export default function AddExpenseModal({ isOpen, onClose, onAdded, expenseToEdit }) {
  const [categories, setCategories] = useState([]);
  const [mode, setMode] = useState('manual');
  const [formData, setFormData] = useState({ amount: '', category: '', payment_method: 'Cash', description: '', items: [] });
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { if (isOpen) fetchCategories(); }, [isOpen]);

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
      setCategories(await res.json());
    } catch (e) { console.error(e); }
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
      const res = await fetch(`${API_BASE_URL}/api/expenses/scan-receipt/`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }, body: data });
      if (res.ok) {
        const result = await res.json();
        setFormData(prev => ({ ...prev, items: result.items, amount: result.total, description: 'Groceries / Store Bill' }));
      } else { alert('Failed to scan receipt'); }
    } catch (error) { console.error('Scan error:', error); alert('An error occurred during scanning'); } finally { setScanning(false); }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
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

  const addItem = () => setFormData(prev => ({ ...prev, items: [...prev.items, { name: '', price: '' }] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const mlRes = await fetch(`${API_BASE_URL}/api/ml/analyze-expense/`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ amount: formData.amount, description: formData.description }) });
      if (mlRes.ok) {
        const mlData = await mlRes.json();
        if (mlData.is_recurring) console.log("AI detected this as a recurring expense.");
      }
    } catch (e) { console.error("ML Anomaly check failed", e); }

    try {
      const token = localStorage.getItem('access_token');
      const url = expenseToEdit ? `${API_BASE_URL}/api/expenses/${expenseToEdit.id}/` : `${API_BASE_URL}/api/expenses/`;
      const res = await fetch(url, { method: expenseToEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(formData) });
      if (res.ok) {
        if (expenseToEdit) alert('edit successfully');
        onAdded(); onClose(); resetForm();
      } else { alert('Failed to add expense'); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const inputSt = { width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border-md)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' };
  const focus = e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; };
  const blur = e => { e.target.style.borderColor = 'var(--glass-border-md)'; e.target.style.boxShadow = 'none'; };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { onClose(); resetForm(); } }}>
      <div className="modal-panel animate-scale-in" style={{ width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-elevated)', zIndex: 10, backdropFilter: 'blur(12px)' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>{expenseToEdit ? 'Edit Expense' : 'Add New Expense'}</h2>
          <button onClick={() => { onClose(); resetForm(); }} style={{ background: 'var(--bg-glass)', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: 'var(--radius-sm)', display: 'flex' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={() => setMode('manual')} style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', border: `1px solid ${mode === 'manual' ? 'var(--accent-primary)' : 'var(--glass-border-md)'}`, cursor: 'pointer', background: mode === 'manual' ? 'rgba(59,130,246,0.15)' : 'var(--bg-glass-md)', color: mode === 'manual' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600, transition: 'all 0.2s' }}>
              Manual Entry
            </button>
            <button type="button" onClick={() => setMode('scan')} style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', border: `1px solid ${mode === 'scan' ? 'var(--accent-primary)' : 'var(--glass-border-md)'}`, cursor: 'pointer', background: mode === 'scan' ? 'rgba(59,130,246,0.15)' : 'var(--bg-glass-md)', color: mode === 'scan' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Camera size={18} /> Scan Bill
            </button>
          </div>

          {mode === 'scan' && formData.items.length === 0 && (
            <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed var(--glass-border-lg)', borderRadius: 'var(--radius-lg)', padding: '2.5rem 1.5rem', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-glass-md)', transition: 'border-color 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--glass-border-lg)'}>
              {scanning ? (
                <div style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Scanning Receipt...</div>
              ) : (
                <>
                  <UploadCloud size={40} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
                  <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Upload Receipt Photo</h4>
                  <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.9rem' }}>We'll automatically extract the items.</p>
                </>
              )}
              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} disabled={scanning} />
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {formData.items.length > 0 && (
              <div style={{ background: 'var(--bg-glass)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem' }}>Scanned Items</h4>
                  <button type="button" onClick={addItem} style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600, padding: '4px 10px', borderRadius: 'var(--radius-sm)' }}>
                    <Plus size={14} /> Add Item
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {formData.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input type="text" value={item.name} onChange={e => handleItemChange(idx, 'name', e.target.value)} placeholder="Item name" style={{ ...inputSt, flex: 1 }} onFocus={focus} onBlur={blur} required />
                      <input type="number" value={item.price} onChange={e => handleItemChange(idx, 'price', e.target.value)} placeholder="Price" step="0.01" min="0" style={{ ...inputSt, width: '90px' }} onFocus={focus} onBlur={blur} required />
                      <button type="button" onClick={() => removeItem(idx)} style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: 'var(--accent-rose)', cursor: 'pointer', padding: '10px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div><label className="auth-label">Amount (₹)</label><input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} style={inputSt} onFocus={focus} onBlur={blur} required step="0.01" min="0" disabled={formData.items.length > 0} /></div>

            <div>
              <label className="auth-label">Description</label>
              <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={inputSt} onFocus={focus} onBlur={blur} required
                onBlur={async (e) => {
                  blur(e);
                  if (!formData.description) return;
                  try {
                    const token = localStorage.getItem('access_token');
                    const res = await fetch(`${API_BASE_URL}/api/ml/predict-category/`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ description: formData.description }) });
                    if (res.ok) {
                      const data = await res.json();
                      if (data.category) {
                        const matchedCat = categories.find(c => c.name.toLowerCase() === data.category.toLowerCase());
                        if (matchedCat) setFormData(prev => ({ ...prev, category: matchedCat.id }));
                      }
                    }
                  } catch (e) { console.error('ML Category prediction failed', e); }
                }}
              />
              <small style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', marginTop: '6px', display: 'block' }}>✨ AI will auto-categorize when you finish typing.</small>
            </div>

            <div>
              <label className="auth-label">Category</label>
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ ...inputSt, cursor: 'pointer' }} onFocus={focus} onBlur={blur}>
                {categories.map(cat => <option key={cat.id} value={cat.id} style={{ background: 'var(--bg-deep)' }}>{cat.name}</option>)}
              </select>
            </div>

            <div>
              <label className="auth-label">Payment Method</label>
              <select value={formData.payment_method} onChange={e => setFormData({ ...formData, payment_method: e.target.value })} style={{ ...inputSt, cursor: 'pointer' }} onFocus={focus} onBlur={blur}>
                <option value="Cash" style={{ background: 'var(--bg-deep)' }}>Cash</option>
                <option value="Credit Card" style={{ background: 'var(--bg-deep)' }}>Credit Card</option>
                <option value="Debit Card" style={{ background: 'var(--bg-deep)' }}>Debit Card</option>
                <option value="UPI" style={{ background: 'var(--bg-deep)' }}>UPI</option>
                <option value="Net Banking" style={{ background: 'var(--bg-deep)' }}>Net Banking</option>
                <option value="Other" style={{ background: 'var(--bg-deep)' }}>Other</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '0.5rem' }}>{loading ? 'Saving...' : 'Save Expense'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
