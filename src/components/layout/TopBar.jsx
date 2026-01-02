import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TopBar.css';

const TopBar = ({ currentUser, onThemeToggle, isDarkMode }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState('online');

  // עדכון שעון כל שנייה
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // בדיקת חיבור לשרת
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:3000');
        setConnectionStatus(response.ok ? 'online' : 'offline');
      } catch (error) {
        setConnectionStatus('disconnected');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000); // בדיקה כל 10 שניות

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'online':
        return { icon: '●', color: '#4CAF50', label: 'מחובר' };
      case 'offline':
        return { icon: '●', color: '#FF9800', label: 'אופליין' };
      case 'disconnected':
        return { icon: '●', color: '#F44336', label: 'מנותק' };
      default:
        return { icon: '●', color: '#9E9E9E', label: 'לא ידוע' };
    }
  };

  const connectionInfo = getConnectionIcon();

  return (
    <div className="topbar">
      <div className="topbar-right">
        {/* לוגו וכותרת */}
        <div className="topbar-logo">
          <i className="fas fa-chart-pie"></i>
          <span className="topbar-title">BMS 2025</span>
        </div>

        {/* אינדיקטור חיבור */}
        <div className="topbar-connection" title={connectionInfo.label}>
          <span
            className="connection-dot"
            style={{ color: connectionInfo.color }}
          >
            {connectionInfo.icon}
          </span>
          <span className="connection-label">{connectionInfo.label}</span>
        </div>
      </div>

      <div className="topbar-left">
        {/* שעון ותאריך */}
        <div className="topbar-datetime">
          <div className="topbar-time">
            <i className="far fa-clock"></i>
            <span>{formatTime(currentTime)}</span>
          </div>
          <div className="topbar-date">
            <i className="far fa-calendar"></i>
            <span>{formatDate(currentTime)}</span>
          </div>
        </div>

        {/* משתמש */}
        <div className="topbar-user">
          <i className="far fa-user-circle"></i>
          <span>{currentUser?.name || 'אורח'}</span>
        </div>

        {/* מעבר בין ערכות נושא */}
        <button
          className="topbar-btn"
          onClick={onThemeToggle}
          title={isDarkMode ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
        >
          <i className={isDarkMode ? 'far fa-sun' : 'far fa-moon'}></i>
        </button>

        {/* הגדרות */}
        <button
          className="topbar-btn"
          onClick={() => navigate('/settings')}
          title="הגדרות"
        >
          <i className="fas fa-cog"></i>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
