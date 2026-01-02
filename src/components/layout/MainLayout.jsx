import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import TopBar from './TopBar';
import SideBar from './SideBar';
import './MainLayout.css';

const MainLayout = ({ children, currentUser }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="main-layout">
      <TopBar
        currentUser={currentUser}
        onThemeToggle={toggleTheme}
        isDarkMode={isDarkMode}
      />
      <SideBar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
