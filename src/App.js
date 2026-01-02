import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/auth/Login';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Settings from './pages/Settings';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // בדיקה אם יש משתמש שמור
    const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setIsAuthenticated(true);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user:', error);
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
  };

  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ?
                  <Navigate to="/" replace /> :
                  <Login onLogin={handleLogin} />
              }
            />
            <Route
              path="/"
              element={
                isAuthenticated ?
                  <MainLayout currentUser={user?.user}>
                    <Home />
                  </MainLayout> :
                  <Navigate to="/login" replace />
              }
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ?
                  <MainLayout currentUser={user?.user}>
                    <div>Dashboard - בקרוב</div>
                  </MainLayout> :
                  <Navigate to="/login" replace />
              }
            />
            <Route
              path="/customers"
              element={
                isAuthenticated ?
                  <MainLayout currentUser={user?.user}>
                    <div>לקוחות - בקרוב</div>
                  </MainLayout> :
                  <Navigate to="/login" replace />
              }
            />
            <Route
              path="/products"
              element={
                isAuthenticated ?
                  <MainLayout currentUser={user?.user}>
                    <div>מוצרים - בקרוב</div>
                  </MainLayout> :
                  <Navigate to="/login" replace />
              }
            />
            <Route
              path="/orders"
              element={
                isAuthenticated ?
                  <MainLayout currentUser={user?.user}>
                    <div>הזמנות - בקרוב</div>
                  </MainLayout> :
                  <Navigate to="/login" replace />
              }
            />
            <Route
              path="/invoices"
              element={
                isAuthenticated ?
                  <MainLayout currentUser={user?.user}>
                    <div>חשבוניות - בקרוב</div>
                  </MainLayout> :
                  <Navigate to="/login" replace />
              }
            />
            <Route
              path="/reports"
              element={
                isAuthenticated ?
                  <MainLayout currentUser={user?.user}>
                    <div>דוחות - בקרוב</div>
                  </MainLayout> :
                  <Navigate to="/login" replace />
              }
            />
            <Route
              path="/tasks"
              element={
                isAuthenticated ?
                  <MainLayout currentUser={user?.user}>
                    <div>משימות - בקרוב</div>
                  </MainLayout> :
                  <Navigate to="/login" replace />
              }
            />
            <Route
              path="/settings"
              element={
                isAuthenticated ?
                  <MainLayout currentUser={user?.user}>
                    <Settings />
                  </MainLayout> :
                  <Navigate to="/login" replace />
              }
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
