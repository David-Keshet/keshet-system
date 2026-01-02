/**
 * BMS 2025 - Design Guidelines
 * הנחיות עיצוב למערכת
 */

export const DESIGN_RULES = {
  // עיצוב כללי
  GENERAL: {
    highResolution: true,          // עיצוב עם רזולוציה גבוהה - חדות מקסימלית
    maxScreenUtilization: true,    // ניצול מקסימלי של המסך
    minimalScrolling: true,        // להימנע מגלילה ככל האפשר
    noDuplication: true,           // מינימום כפילויות
  },

  // TopBar - שורת עליונה קבועה
  TOPBAR: {
    fixed: true,
    components: [
      'logo',                      // לוגו
      'title',                     // כותרת
      'clock',                     // שעון
      'date',                      // תאריך
      'username',                  // שם משתמש
      'settings',                  // הגדרות
      'themeToggle',              // מעבר בין ערכת נושא (בהיר/כהה)
      'connectionStatus',         // אינדיקטור חיבור (ירוק/כתום/אדום)
    ],
    height: '60px',
    professional: true,
  },

  // SideBar - תפריט צד
  SIDEBAR: {
    position: 'right',             // צד ימין
    collapsible: true,             // ניתן לקיפול/פתיחה
    icons: true,                   // אייקונים
    labels: true,                  // תוויות טקסט לכל אייקון
    navigation: true,              // ניווט בין עמודים
    noSettings: true,              // אין צורך בעמוד הגדרות (זה ב-TopBar)
    width: {
      collapsed: '60px',
      expanded: '200px',
    },
  },

  // תמות צבע
  THEMES: {
    light: {
      primary: '#2196F3',
      secondary: '#FFC107',
      background: '#F5F7FA',
      surface: '#FFFFFF',
      text: '#212121',
      textSecondary: '#757575',
      border: '#E0E0E0',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
    },
    dark: {
      primary: '#90CAF9',
      secondary: '#FFD54F',
      background: '#121212',
      surface: '#1E1E1E',
      text: '#FFFFFF',
      textSecondary: '#B0B0B0',
      border: '#333333',
      success: '#66BB6A',
      warning: '#FFA726',
      error: '#EF5350',
    },
  },

  // סטטוסים של חיבור
  CONNECTION_STATUS: {
    online: {
      color: '#4CAF50',     // ירוק - מחובר ועובד
      label: 'מחובר',
    },
    offline: {
      color: '#FF9800',     // כתום - אופליין
      label: 'אופליין',
    },
    disconnected: {
      color: '#F44336',     // אדום - מנותק
      label: 'מנותק',
    },
  },

  // פונטים וגדלים
  TYPOGRAPHY: {
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    fontSizeBase: '14px',
    fontSizeSmall: '12px',
    fontSizeLarge: '16px',
    fontSizeTitle: '20px',
    lineHeight: '1.5',
  },

  // מרווחים
  SPACING: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },

  // צללים
  SHADOWS: {
    small: '0 2px 4px rgba(0,0,0,0.1)',
    medium: '0 4px 8px rgba(0,0,0,0.15)',
    large: '0 8px 16px rgba(0,0,0,0.2)',
  },

  // מעברים
  TRANSITIONS: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '400ms ease-in-out',
  },
};

export default DESIGN_RULES;
