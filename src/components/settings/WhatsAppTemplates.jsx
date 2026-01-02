import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './WhatsAppTemplates.css';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const WhatsAppTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [formData, setFormData] = useState({
    template_name: '',
    template_text: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError('');
      const { data, error: fetchError } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setTemplates(data || []);
    } catch (err) {
      setError('שגיאה בטעינת תבניות: ' + err.message);
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setSuccess('');

      if (!formData.template_name.trim()) {
        setError('שם התבנית הוא שדה חובה');
        return;
      }
      if (!formData.template_text.trim()) {
        setError('טקסט התבנית הוא שדה חובה');
        return;
      }

      if (editingTemplate) {
        const { error: updateError } = await supabase
          .from('whatsapp_templates')
          .update({
            template_text: formData.template_text,
            description: formData.description,
            is_active: formData.is_active
          })
          .eq('id', editingTemplate.id);

        if (updateError) throw updateError;
        setSuccess('התבנית עודכנה בהצלחה');
      } else {
        const { error: insertError } = await supabase
          .from('whatsapp_templates')
          .insert([formData]);

        if (insertError) throw insertError;
        setSuccess('התבנית נוצרה בהצלחה');
      }

      setShowModal(false);
      resetForm();
      loadTemplates();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('שגיאה בשמירת תבנית: ' + err.message);
      console.error('Error saving template:', err);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      template_name: template.template_name || '',
      template_text: template.template_text || '',
      description: template.description || '',
      is_active: template.is_active !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק תבנית זו?')) return;

    try {
      const { error } = await supabase
        .from('whatsapp_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSuccess('התבנית נמחקה בהצלחה');
      loadTemplates();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('שגיאה במחיקת תבנית: ' + err.message);
      console.error('Error deleting template:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      template_name: '',
      template_text: '',
      description: '',
      is_active: true
    });
    setEditingTemplate(null);
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

  return (
    <div className="whatsapp-templates">
      <div className="templates-header">
        <div>
          <h3>תבניות הודעות WhatsApp</h3>
          <p className="templates-description">
            ניתן להשתמש במשתנים: {'{customer_name}'}, {'{order_number}'}
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAddModal}>
          <i className="fas fa-plus"></i> תבנית חדשה
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {loading ? (
        <div className="loading">טוען תבניות...</div>
      ) : templates.length === 0 ? (
        <div className="no-data">לא נמצאו תבניות</div>
      ) : (
        <div className="templates-list">
          {templates.map(template => (
            <div key={template.id} className="template-card">
              <div className="template-header">
                <div>
                  <h4>{template.template_name}</h4>
                  {template.description && (
                    <p className="template-description">{template.description}</p>
                  )}
                </div>
                <div className="template-actions">
                  <span className={`status-badge ${template.is_active ? 'active' : 'inactive'}`}>
                    {template.is_active ? 'פעיל' : 'לא פעיל'}
                  </span>
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => handleEdit(template)}
                    title="ערוך"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(template.id)}
                    title="מחק"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div className="template-text">
                {template.template_text}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTemplate ? 'עריכת תבנית' : 'תבנית חדשה'}</h2>
              <button className="close-btn" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>שם התבנית *</label>
                <input
                  type="text"
                  name="template_name"
                  value={formData.template_name}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingTemplate}
                  placeholder="לדוגמה: new_order, order_with_pdf"
                />
                {editingTemplate && (
                  <small className="form-hint">לא ניתן לשנות את שם התבנית</small>
                )}
              </div>

              <div className="form-group">
                <label>תיאור</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="תיאור קצר של התבנית"
                />
              </div>

              <div className="form-group">
                <label>טקסט ההודעה *</label>
                <textarea
                  name="template_text"
                  value={formData.template_text}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  placeholder="שלום {customer_name}, נפתחה הזמנה מספר {order_number}"
                ></textarea>
                <small className="form-hint">
                  משתנים זמינים: {'{customer_name}'}, {'{order_number}'}
                </small>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  תבנית פעילה
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  ביטול
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTemplate ? 'עדכן' : 'שמור'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppTemplates;
