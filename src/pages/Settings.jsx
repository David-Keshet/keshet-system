import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './Settings.css';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Settings = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    phone: '',
    role: 'user',
    password: '',
    is_active: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setError('שגיאה בטעינת משתמשים: ' + err.message);
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

  const validatePassword = (password) => {
    if (!password) return true; // Password is optional
    if (password.length < 4) {
      setError('סיסמה חייבת להכיל לפחות 4 ספרות');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate password if provided
    if (formData.password && !validatePassword(formData.password)) {
      return;
    }

    try {
      const userData = {
        username: formData.username,
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone || null,
        role: formData.role,
        is_active: formData.is_active
      };

      // Only include password_hash if password is provided
      if (formData.password) {
        // In production, you should hash the password on the server side
        // For now, we'll store it as-is (NOT SECURE - just for development)
        userData.password_hash = formData.password;
      }

      if (editingUser) {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update(userData)
          .eq('id', editingUser.id);

        if (error) throw error;
        setSuccess('המשתמש עודכן בהצלחה');
      } else {
        // Create new user
        const { error } = await supabase
          .from('users')
          .insert([userData]);

        if (error) throw error;
        setSuccess('המשתמש נוסף בהצלחה');
      }

      // Reload users and close modal
      await loadUsers();
      handleCloseModal();
    } catch (err) {
      setError('שגיאה בשמירת המשתמש: ' + err.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      full_name: user.full_name,
      email: user.email || '',
      phone: user.phone || '',
      role: user.role,
      password: '',
      is_active: user.is_active
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      setSuccess('המשתמש נמחק בהצלחה');
      await loadUsers();
    } catch (err) {
      setError('שגיאה במחיקת המשתמש: ' + err.message);
    }
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      full_name: '',
      email: '',
      phone: '',
      role: 'user',
      password: '',
      is_active: true
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      username: '',
      full_name: '',
      email: '',
      phone: '',
      role: 'user',
      password: '',
      is_active: true
    });
    setError('');
  };

  const getRoleName = (role) => {
    const roles = {
      admin: 'מנהל',
      user: 'משתמש',
      viewer: 'צופה'
    };
    return roles[role] || role;
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>הגדרות המערכת</h1>
        <p>ניהול משתמשים והרשאות</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="settings-content">
        <div className="users-section">
          <div className="section-header">
            <h2>ניהול משתמשים</h2>
            <button className="btn btn-primary" onClick={handleAddNew}>
              <i className="fas fa-user-plus"></i>
              הוסף משתמש
            </button>
          </div>

          {loading ? (
            <div className="loading">טוען משתמשים...</div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>שם משתמש</th>
                    <th>שם מלא</th>
                    <th>אימייל</th>
                    <th>טלפון</th>
                    <th>תפקיד</th>
                    <th>סטטוס</th>
                    <th>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="no-data">אין משתמשים במערכת</td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.full_name}</td>
                        <td>{user.email || '-'}</td>
                        <td>{user.phone || '-'}</td>
                        <td>
                          <span className={`role-badge role-${user.role}`}>
                            {getRoleName(user.role)}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                            {user.is_active ? 'פעיל' : 'לא פעיל'}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button
                              className="btn-icon btn-edit"
                              onClick={() => handleEdit(user)}
                              title="ערוך"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn-icon btn-delete"
                              onClick={() => handleDelete(user.id)}
                              title="מחק"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit User */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'עריכת משתמש' : 'משתמש חדש'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="username">שם משתמש *</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    disabled={editingUser !== null}
                    placeholder="הזן שם משתמש"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="full_name">שם מלא *</label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    placeholder="הזן שם מלא"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">אימייל</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@mail.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">טלפון</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="050-1234567"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="role">תפקיד *</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="user">משתמש</option>
                    <option value="admin">מנהל</option>
                    <option value="viewer">צופה</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="password">סיסמה (אופציונלי - מינימום 4 ספרות)</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="השאר ריק אם אין צורך בסיסמה"
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  <span>משתמש פעיל</span>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  ביטול
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i>
                  {editingUser ? 'עדכן' : 'הוסף'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
