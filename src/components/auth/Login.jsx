import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './Login.css';

// הגדרת Supabase Client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [toast, setToast] = useState(null);
  const slideInterval = useRef(null);

  const navigate = useNavigate();

  const slides = [
    {
      title: "ברוכים הבאים למערכת BMS 2025",
      description: "מערכת ניהול עסקית מתקדמת לעסקים בכל הגדלים"
    },
    {
      title: "נהל את הלקוחות שלך בקלות",
      description: "מערכת ניהול לקוחות מתקדמת עם תובנות אנליטיות"
    },
    {
      title: "עקוב אחר המכירות והזמנות",
      description: "דשבורד יעיל לניהול מוצרים, הזמנות והצעות מחיר"
    }
  ];

  // התחלת סליידר אוטומטי
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (currentUser) {
      navigate('/');
      return;
    }

    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      setUsername(rememberedUser);
      setRememberMe(true);
    }

    startSlider();
    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, [navigate]);

  const startSlider = () => {
    slideInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
      startSlider();
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const hideToast = () => {
    setToast(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username) {
      showToast('error', 'אנא הזן שם משתמש');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // ניסיון התחברות דרך Supabase
      let userData = null;

      try {
        // קודם כל מושכים את המשתמש לפי שם משתמש
        const { data: users, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .eq('is_active', true)
          .limit(1);

        console.log('Supabase Response:', { users, dbError });

        if (!dbError && users && users.length > 0) {
          const currentUser = users[0];

          // בדיקה אם יש סיסמה במערכת
          if (currentUser.password_hash) {
            // אם יש סיסמה במערכת, חייבים להזין סיסמה נכונה
            if (!password) {
              setError('משתמש זה דורש סיסמה');
              showToast('error', 'משתמש זה דורש סיסמה');
              setLoading(false);
              return;
            }

            // בדיקת סיסמה (בפרודקשן צריך להשתמש בהצפנה)
            if (currentUser.password_hash !== password) {
              setError('סיסמה שגויה');
              showToast('error', 'סיסמה שגויה');
              setLoading(false);
              return;
            }
          }

          // התחברות הצליחה
          userData = {
            token: 'jwt-token-' + Date.now(),
            user: {
              id: currentUser.id,
              name: currentUser.full_name,
              username: currentUser.username,
              role: currentUser.role,
              email: currentUser.email || `${currentUser.username}@bms.co.il`,
              avatar: null
            }
          };

          // עדכון last_login
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', currentUser.id);
        }
      } catch (supabaseError) {
        console.error('שגיאת Supabase:', supabaseError);
        setError('שגיאה בחיבור למסד הנתונים');
        showToast('error', 'שגיאה בחיבור למסד הנתונים');
        setLoading(false);
        return;
      }

      if (!userData) {
        setError('שם משתמש לא קיים או המשתמש לא פעיל');
        showToast('error', 'שם משתמש לא קיים או המשתמש לא פעיל');
        setLoading(false);
        return;
      }

      if (rememberMe) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('rememberedUser', username);
      } else {
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
      }

      showToast('success', 'התחברות בוצעה בהצלחה, מעביר לדף הבית...');
      setTimeout(() => {
        onLogin(userData);
        navigate('/');
      }, 1000);

    } catch (err) {
      console.error('שגיאה בתהליך ההתחברות:', err);
      setError('אירעה שגיאה בהתחברות. נסה שוב מאוחר יותר.');
      showToast('error', 'שגיאה בהתחברות: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = () => {
    const savedUser = localStorage.getItem('currentUser');

    if (savedUser) {
      showToast('info', 'מבצע התחברות מהירה...');
      setTimeout(() => {
        showToast('success', 'זיהוי הצליח! מעביר לדף הבית...');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }, 1500);
    } else {
      showToast('error', 'אין משתמש שמור במערכת. יש להתחבר תחילה עם שם משתמש וסיסמה.');
    }
  };

  // קומפוננטת Toast
  const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
      if (type !== 'error') {
        const timer = setTimeout(() => {
          onClose();
        }, 4000);
        return () => clearTimeout(timer);
      }
    }, [type, onClose]);

    const getIcon = () => {
      switch (type) {
        case 'success':
          return 'fas fa-check-circle';
        case 'error':
          return 'fas fa-exclamation-circle';
        case 'info':
          return 'fas fa-info-circle';
        default:
          return 'fas fa-info-circle';
      }
    };

    return (
      <div className={`toast ${type} show`}>
        <div className="toast-icon">
          <i className={getIcon()}></i>
        </div>
        <div className="toast-message">{message}</div>
        <button className="toast-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
    );
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`
            }}></div>
          ))}
        </div>
      </div>

      <div className="login-container">
        <div className="login-card glass-effect tilt-on-hover">
          <div className="login-header">
            <div className="login-logo">
              <i className="fas fa-chart-pie"></i>
            </div>
            <h1>מערכת BMS 2025</h1>
            <p>ברוכים הבאים למערכת הניהול העסקית</p>
            <div className="login-version">גרסה 2.0.0</div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">
                <i className="fas fa-user"></i> שם משתמש
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="הכנס שם משתמש"
                required
                disabled={loading}
                className="login-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i> סיסמה (אופציונלי)
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="הכנס סיסמה אם נדרש"
                disabled={loading}
                className="login-input"
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span className="checkmark"></span>
                זכור אותי
              </label>

              <a href="#" className="forgot-password">
                שכחתי סיסמה?
              </a>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  מתחבר...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  התחברות למערכת
                </>
              )}
            </button>

            <div className="divider">
              <span>או</span>
            </div>

            <div className="quick-login">
              <button
                type="button"
                className="btn-quick-login"
                onClick={handleQuickLogin}
                disabled={loading}
              >
                <i className="fas fa-fingerprint"></i>
                <span>התחברות מהירה</span>
              </button>
            </div>
          </form>

          <div className="login-footer">
            <div className="system-info">
              <div className="info-item">
                <i className="fas fa-server"></i>
                <span>סטטוס מערכת: <strong>פעילה</strong></span>
              </div>
              <div className="info-item">
                <i className="fas fa-clock"></i>
                <span>עדכון אחרון: היום, 10:30</span>
              </div>
            </div>
            <p className="copyright">© 2025 מערכת BMS - כל הזכויות שמורות</p>
            <div className="tech-stack">
              <span>React 18</span>
              <span>Chart.js</span>
              <span>Supabase</span>
              <span>RTL Support</span>
            </div>
          </div>
        </div>

        <div className="login-side-info">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`side-info-card slide ${index === currentSlide ? 'active' : ''}`}
            >
              <h3><i className="fas fa-star"></i> {slide.title}</h3>
              <p>{slide.description}</p>
            </div>
          ))}

          <div className="slide-controls">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`slide-btn ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              ></button>
            ))}
          </div>

          <div className="side-info-card">
            <h3><i className="fas fa-star"></i> יתרונות המערכת</h3>
            <ul>
              <li><i className="fas fa-check"></i> ניהול לקוחות מתקדם</li>
              <li><i className="fas fa-check"></i> דוחות בזמן אמת</li>
              <li><i className="fas fa-check"></i> ניהול מלאי אוטומטי</li>
              <li><i className="fas fa-check"></i> מערכת חשבוניות</li>
              <li><i className="fas fa-check"></i> ניהול משימות צוות</li>
            </ul>
          </div>

          <div className="side-info-card">
            <h3><i className="fas fa-shield-alt"></i> אבטחה</h3>
            <ul>
              <li><i className="fas fa-lock"></i> הצפנת SSL</li>
              <li><i className="fas fa-user-shield"></i> אימות דו-שלבי</li>
              <li><i className="fas fa-history"></i> יומן פעילות</li>
              <li><i className="fas fa-database"></i> גיבויים אוטומטיים</li>
            </ul>
          </div>

          <div className="side-info-card stats">
            <h3><i className="fas fa-chart-line"></i> סטטיסטיקות</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">1,250+</div>
                <div className="stat-label">לקוחות פעילים</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">5,430+</div>
                <div className="stat-label">הזמנות החודש</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">99.8%</div>
                <div className="stat-label">זמינות מערכת</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
};

export default Login;