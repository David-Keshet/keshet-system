import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <div className="welcome-section">
        <h1>ברוכים הבאים ל-BMS 2025</h1>
        <p>מערכת ניהול עסקית מתקדמת</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3>לקוחות</h3>
            <p className="stat-number">1,234</p>
            <span className="stat-change positive">+12% מהחודש שעבר</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <div className="stat-content">
            <h3>הזמנות</h3>
            <p className="stat-number">856</p>
            <span className="stat-change positive">+8% מהחודש שעבר</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="stat-content">
            <h3>הכנסות</h3>
            <p className="stat-number">₪245,890</p>
            <span className="stat-change positive">+15% מהחודש שעבר</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-box"></i>
          </div>
          <div className="stat-content">
            <h3>מוצרים</h3>
            <p className="stat-number">342</p>
            <span className="stat-change neutral">ללא שינוי</span>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>פעולות מהירות</h2>
        <div className="actions-grid">
          <button className="action-btn">
            <i className="fas fa-plus"></i>
            <span>הוסף לקוח חדש</span>
          </button>
          <button className="action-btn">
            <i className="fas fa-file-invoice"></i>
            <span>צור חשבונית</span>
          </button>
          <button className="action-btn">
            <i className="fas fa-shopping-bag"></i>
            <span>הזמנה חדשה</span>
          </button>
          <button className="action-btn">
            <i className="fas fa-chart-bar"></i>
            <span>צפה בדוחות</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
