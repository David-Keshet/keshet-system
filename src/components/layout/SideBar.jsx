import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SideBar.css';

const SideBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'home', icon: 'fas fa-home', label: 'דף הבית', path: '/' },
    { id: 'dashboard', icon: 'fas fa-chart-line', label: 'דשבורד', path: '/dashboard' },
    { id: 'customers', icon: 'fas fa-users', label: 'לקוחות', path: '/customers' },
    { id: 'products', icon: 'fas fa-box', label: 'מוצרים', path: '/products' },
    { id: 'orders', icon: 'fas fa-shopping-cart', label: 'הזמנות', path: '/orders' },
    { id: 'invoices', icon: 'fas fa-file-invoice-dollar', label: 'חשבוניות', path: '/invoices' },
    { id: 'reports', icon: 'fas fa-chart-pie', label: 'דוחות', path: '/reports' },
    { id: 'tasks', icon: 'fas fa-tasks', label: 'משימות', path: '/tasks' },
  ];

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div
      className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* תפריט ניווט */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => handleNavigate(item.path)}
            title={!isExpanded ? item.label : ''}
          >
            <i className={item.icon}></i>
            {isExpanded && <span className="sidebar-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* מידע נוסף בתחתית */}
      <div className="sidebar-footer">
        <div className="sidebar-item">
          <i className="fas fa-info-circle"></i>
          {isExpanded && <span className="sidebar-label">v2.0.0</span>}
        </div>
      </div>
    </div>
  );
};

export default SideBar;
