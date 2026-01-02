import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './Customers.css';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, private, business

  const [formData, setFormData] = useState({
    customer_type: 'private',
    name: '',
    phone: '',
    email: '',
    contact_person: '',
    payer_name: '',
    id_number: '',
    address: '',
    city: '',
    notes: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setCustomers(data || []);
    } catch (err) {
      setError('שגיאה בטעינת לקוחות: ' + err.message);
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateCustomerCode = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_customer_code');
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error generating customer code:', err);
      // Fallback: generate code manually
      const maxCode = customers.reduce((max, c) => {
        const num = parseInt(c.customer_code) || 0;
        return num > max ? num : max;
      }, 1000);
      return String(maxCode + 1).padStart(4, '0');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');

      // Validation
      if (!formData.name.trim()) {
        setError('שם הלקוח הוא שדה חובה');
        return;
      }
      if (!formData.phone.trim()) {
        setError('טלפון הוא שדה חובה');
        return;
      }

      if (editingCustomer) {
        // Update existing customer
        const { error: updateError } = await supabase
          .from('customers')
          .update(formData)
          .eq('id', editingCustomer.id);

        if (updateError) throw updateError;
      } else {
        // Create new customer
        const customer_code = await generateCustomerCode();

        const { error: insertError } = await supabase
          .from('customers')
          .insert([{ ...formData, customer_code }]);

        if (insertError) throw insertError;
      }

      setShowModal(false);
      resetForm();
      loadCustomers();
    } catch (err) {
      setError('שגיאה בשמירת לקוח: ' + err.message);
      console.error('Error saving customer:', err);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      customer_type: customer.customer_type || 'private',
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      contact_person: customer.contact_person || '',
      payer_name: customer.payer_name || '',
      id_number: customer.id_number || '',
      address: customer.address || '',
      city: customer.city || '',
      notes: customer.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק לקוח זה?')) return;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadCustomers();
    } catch (err) {
      setError('שגיאה במחיקת לקוח: ' + err.message);
      console.error('Error deleting customer:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      customer_type: 'private',
      name: '',
      phone: '',
      email: '',
      contact_person: '',
      payer_name: '',
      id_number: '',
      address: '',
      city: '',
      notes: ''
    });
    setEditingCustomer(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
    setError('');
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_code?.includes(searchTerm) ||
      customer.phone?.includes(searchTerm);

    const matchesType =
      filterType === 'all' ||
      customer.customer_type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="customers-page">
      <div className="customers-header">
        <h1>ניהול לקוחות</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="fas fa-plus"></i> לקוח חדש
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters and Search */}
      <div className="customers-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="חיפוש לפי שם, מספר לקוח או טלפון..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={filterType === 'all' ? 'active' : ''}
            onClick={() => setFilterType('all')}
          >
            הכל ({customers.length})
          </button>
          <button
            className={filterType === 'private' ? 'active' : ''}
            onClick={() => setFilterType('private')}
          >
            פרטי ({customers.filter(c => c.customer_type === 'private').length})
          </button>
          <button
            className={filterType === 'business' ? 'active' : ''}
            onClick={() => setFilterType('business')}
          >
            עסקי ({customers.filter(c => c.customer_type === 'business').length})
          </button>
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="loading">טוען לקוחות...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="no-data">לא נמצאו לקוחות</div>
      ) : (
        <div className="customers-table-container">
          <table className="customers-table">
            <thead>
              <tr>
                <th>מספר לקוח</th>
                <th>סוג</th>
                <th>שם</th>
                <th>טלפון</th>
                <th>אימייל</th>
                <th>עיר</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.id}>
                  <td className="customer-code">{customer.customer_code}</td>
                  <td>
                    <span className={`badge badge-${customer.customer_type}`}>
                      {customer.customer_type === 'private' ? 'פרטי' : 'עסקי'}
                    </span>
                  </td>
                  <td className="customer-name">{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.email || '-'}</td>
                  <td>{customer.city || '-'}</td>
                  <td className="actions">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleEdit(customer)}
                      title="ערוך"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(customer.id)}
                      title="מחק"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCustomer ? 'עריכת לקוח' : 'לקוח חדש'}</h2>
              <button className="close-btn" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Customer Type */}
              <div className="form-group">
                <label>סוג לקוח *</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="customer_type"
                      value="private"
                      checked={formData.customer_type === 'private'}
                      onChange={handleInputChange}
                    />
                    פרטי
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="customer_type"
                      value="business"
                      checked={formData.customer_type === 'business'}
                      onChange={handleInputChange}
                    />
                    עסקי
                  </label>
                </div>
              </div>

              {/* Basic Fields (for both types) */}
              <div className="form-group">
                <label>שם *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="שם הלקוח"
                />
              </div>

              <div className="form-group">
                <label>טלפון *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="050-1234567"
                />
              </div>

              {/* Business-only fields */}
              {formData.customer_type === 'business' && (
                <>
                  <div className="form-group">
                    <label>אימייל</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>איש קשר</label>
                    <input
                      type="text"
                      name="contact_person"
                      value={formData.contact_person}
                      onChange={handleInputChange}
                      placeholder="שם איש הקשר"
                    />
                  </div>

                  <div className="form-group">
                    <label>שם משלם</label>
                    <input
                      type="text"
                      name="payer_name"
                      value={formData.payer_name}
                      onChange={handleInputChange}
                      placeholder="שם המשלם"
                    />
                  </div>

                  <div className="form-group">
                    <label>ח.פ / ת.ז</label>
                    <input
                      type="text"
                      name="id_number"
                      value={formData.id_number}
                      onChange={handleInputChange}
                      placeholder="ח.פ או ת.ז"
                    />
                  </div>
                </>
              )}

              {/* Optional fields for both */}
              <div className="form-group">
                <label>כתובת</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="רחוב ומספר בית"
                />
              </div>

              <div className="form-group">
                <label>עיר</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="עיר"
                />
              </div>

              <div className="form-group">
                <label>הערות</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="הערות נוספות..."
                ></textarea>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  ביטול
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCustomer ? 'עדכן' : 'שמור'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
