import React, { useState } from 'react';
import './ColumnManager.css';

const ColumnManager = ({ columns, onAddColumn, onUpdateColumn, onDeleteColumn, onClose }) => {
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('#6366f1');
  const [editingColumn, setEditingColumn] = useState(null);

  const colorPresets = [
    { name: 'כחול', value: '#6366f1' },
    { name: 'צהוב', value: '#f59e0b' },
    { name: 'סגול', value: '#8b5cf6' },
    { name: 'ירוק', value: '#10b981' },
    { name: 'אדום', value: '#ef4444' },
    { name: 'ורוד', value: '#ec4899' },
    { name: 'תכלת', value: '#06b6d4' },
    { name: 'אפור', value: '#6b7280' },
  ];

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      onAddColumn({
        name: newColumnName.trim(),
        color: newColumnColor,
        position: columns.length
      });
      setNewColumnName('');
      setNewColumnColor('#6366f1');
    }
  };

  const handleUpdateColumn = (column) => {
    if (editingColumn) {
      onUpdateColumn(editingColumn.id, editingColumn);
      setEditingColumn(null);
    }
  };

  const startEdit = (column) => {
    setEditingColumn({ ...column });
  };

  const cancelEdit = () => {
    setEditingColumn(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="column-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>ניהול עמודות</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Add New Column */}
          <div className="add-column-section">
            <h3>הוספת עמודה חדשה</h3>
            <div className="add-column-form">
              <input
                type="text"
                placeholder="שם העמודה..."
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
              />
              <div className="color-picker">
                <label>צבע:</label>
                <div className="color-options">
                  {colorPresets.map((color) => (
                    <button
                      key={color.value}
                      className={`color-option ${newColumnColor === color.value ? 'selected' : ''}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setNewColumnColor(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleAddColumn}>
                <i className="fas fa-plus"></i> הוסף עמודה
              </button>
            </div>
          </div>

          {/* Existing Columns */}
          <div className="columns-list-section">
            <h3>עמודות קיימות ({columns.length})</h3>
            <div className="columns-list">
              {columns.map((column) => (
                <div key={column.id} className="column-item">
                  {editingColumn && editingColumn.id === column.id ? (
                    // Edit Mode
                    <div className="column-edit-mode">
                      <input
                        type="text"
                        value={editingColumn.name}
                        onChange={(e) => setEditingColumn({ ...editingColumn, name: e.target.value })}
                        autoFocus
                      />
                      <div className="color-picker">
                        <div className="color-options">
                          {colorPresets.map((color) => (
                            <button
                              key={color.value}
                              className={`color-option ${editingColumn.color === color.value ? 'selected' : ''}`}
                              style={{ backgroundColor: color.value }}
                              onClick={() => setEditingColumn({ ...editingColumn, color: color.value })}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="column-edit-actions">
                        <button className="btn btn-sm btn-primary" onClick={handleUpdateColumn}>
                          <i className="fas fa-check"></i> שמור
                        </button>
                        <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>
                          <i className="fas fa-times"></i> ביטול
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="column-info">
                        <div
                          className="column-color-indicator"
                          style={{ backgroundColor: column.color }}
                        />
                        <span className="column-name">{column.name}</span>
                        <span className="column-position">#{column.position + 1}</span>
                      </div>
                      <div className="column-actions">
                        <button
                          className="btn-icon"
                          onClick={() => startEdit(column)}
                          title="ערוך"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => {
                            if (window.confirm(`האם למחוק את העמודה "${column.name}"?\n\nהמשימות בעמודה זו יועברו לעמודה הראשונה.`)) {
                              onDeleteColumn(column.id);
                            }
                          }}
                          title="מחק"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColumnManager;
