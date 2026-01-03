import React, { useState } from 'react';
import './CustomerSearchModal.css';

const CustomerSearchModal = ({
  onClose,
  onCreateNew,
  onSelectCustomer,
  onViewOrders,
  onEditCustomer,
  matchingCustomers,
  onSearch
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (value) => {
    setSearchInput(value);
    // קורא לפונקציית החיפוש מ-Orders.jsx
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="customer-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>חיפוש לקוח</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="search-section">
          <div className="search-input-group">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="חפש לפי שם, טלפון או קוד לקוח..."
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {matchingCustomers && matchingCustomers.length > 0 && (
          <div className="matching-customers-section">
            <h3>נמצאו {matchingCustomers.length} לקוחות תואמים:</h3>
            <div className="customers-list">
              {matchingCustomers.map(customer => (
                <div key={customer.id} className="customer-card">
                  <div className="customer-info">
                    <div className="customer-header">
                      <h4>{customer.name}</h4>
                      <span className={`customer-type-badge ${customer.customer_type}`}>
                        {customer.customer_type === 'private' ? 'פרטי' : 'עסקי'}
                      </span>
                    </div>
                    <div className="customer-details">
                      <span><i className="fas fa-id-card"></i> קוד: {customer.customer_code}</span>
                      <span><i className="fas fa-phone"></i> {customer.phone}</span>
                      {customer.email && (
                        <span><i className="fas fa-envelope"></i> {customer.email}</span>
                      )}
                    </div>
                  </div>
                  <div className="customer-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onSelectCustomer(customer)}
                    >
                      <i className="fas fa-shopping-cart"></i>
                      פתח הזמנה
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onViewOrders(customer)}
                    >
                      <i className="fas fa-list"></i>
                      הצג הזמנות
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onEditCustomer(customer)}
                    >
                      <i className="fas fa-edit"></i>
                      ערוך
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="additional-actions">
              <button
                className="btn btn-success"
                onClick={onCreateNew}
              >
                <i className="fas fa-user-plus"></i>
                הקם לקוח נוסף עם פרטים אלו
              </button>
            </div>
          </div>
        )}

        {matchingCustomers && matchingCustomers.length === 0 && searchInput.length >= 2 && (
          <div className="no-matches">
            <i className="fas fa-user-slash"></i>
            <p>לא נמצאו לקוחות תואמים עבור "{searchInput}"</p>
            <button
              className="btn btn-primary"
              onClick={onCreateNew}
            >
              <i className="fas fa-user-plus"></i>
              צור לקוח חדש
            </button>
          </div>
        )}

        {(!matchingCustomers || matchingCustomers.length === 0) && searchInput.length < 2 && (
          <div className="no-matches">
            <i className="fas fa-search"></i>
            <p>הקלד שם לקוח, מספר טלפון או קוד לקוח כדי לחפש</p>
            <p style={{fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px'}}>
              או לחץ על הכפתור למטה ליצירת לקוח חדש
            </p>
            <button
              className="btn btn-success"
              onClick={onCreateNew}
            >
              <i className="fas fa-user-plus"></i>
              צור לקוח חדש
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSearchModal;
