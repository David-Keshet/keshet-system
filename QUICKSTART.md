# 🚀 BMS 2025 - התחלה מהירה
## Quick Start Guide

---

## 📦 התקנה ראשונית (פעם אחת)

### 1. Clone הפרויקט
```bash
git clone https://github.com/David-Keshet/keshet-system.git
cd keshet-system
```

### 2. התקן תלויות
```bash
npm install
```

### 3. הגדר משתני סביבה
```bash
# העתק את קובץ הדוגמה
copy .env.example .env

# ערוך את .env והכנס את פרטי Supabase שלך
```

### 4. הרץ את סקריפט הSQL
1. פתח [Supabase Dashboard](https://app.supabase.com)
2. SQL Editor → New Query
3. העתק והדבק את `UPDATE_SCHEMA_FOR_ORDERS.sql`
4. Run!

---

## 🎯 שימוש יומיומי

### סביבת פיתוח (Development)
```bash
# לחץ פעמיים על:
start-dev.bat

# או בטרמינל:
npm start
```
פותח: **http://localhost:3000**

### בניית Production
```bash
# לחץ פעמיים על:
build-prod.bat

# או בטרמינל:
npm run build
```
יוצר תיקייה: `build/`

### גיבוי בסיס נתונים
```bash
# לחץ פעמיים על:
backup.bat

# או בטרמינל:
node scripts/backup-database.js
```
שומר ב: `backups/backup-[תאריך].json`

---

## 🌿 עבודה עם Git Branches

### פיתוח תכונה חדשה
```bash
# עבור ל-development
git checkout development

# צור branch חדש
git checkout -b feature/שם-התכונה

# עבוד, שמור, commit
git add .
git commit -m "תיאור השינוי"

# העלה ל-GitHub
git push origin feature/שם-התכונה
```

### העלאה ל-Production
```bash
# גיבוי ראשון!
backup.bat

# מזג ל-main
git checkout main
git merge development
git push origin main
```

---

## 📁 מבנה הפרויקט

```
bms-2025/
├── src/                          # קוד המקור
│   ├── components/              # קומפוננטות React
│   │   ├── auth/               # התחברות
│   │   ├── layout/             # תבנית עיצוב
│   │   ├── orders/             # הזמנות
│   │   └── settings/           # הגדרות
│   ├── pages/                   # עמודים
│   │   ├── Home.jsx
│   │   ├── Customers.jsx
│   │   ├── Orders.jsx
│   │   ├── Tasks.jsx
│   │   └── Settings.jsx
│   ├── App.js                   # קובץ ראשי
│   └── index.js                 # נקודת כניסה
├── public/                       # קבצים סטטיים
├── scripts/                      # סקריפטים עזר
│   └── backup-database.js
├── backups/                      # גיבויים (לא ב-Git)
├── .env.example                 # תבנית משתני סביבה
├── .env.development             # הגדרות פיתוח (לא ב-Git)
├── .env.production              # הגדרות ייצור (לא ב-Git)
├── start-dev.bat                # התחל פיתוח
├── build-prod.bat               # בנה ייצור
├── backup.bat                   # גבה DB
├── package.json                 # תלויות
├── WORKFLOW.md                  # מדריך מפורט
└── QUICKSTART.md               # המדריך הזה
```

---

## 🔑 משתני סביבה נדרשים

ב-`.env`:
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_KEY=your-service-role-key
```

**איפה למצוא?**
1. [Supabase Dashboard](https://app.supabase.com)
2. Settings → API
3. העתק:
   - Project URL → `REACT_APP_SUPABASE_URL`
   - Service Role Key → `REACT_APP_SUPABASE_KEY`

---

## ⚡ פקודות שימושיות

| פקודה | מה זה עושה |
|-------|-----------|
| `npm start` | הפעלת שרת פיתוח |
| `npm run build` | בנייה לייצור |
| `npm test` | הרצת בדיקות |
| `npm install` | התקנת תלויות |
| `git status` | מצב Git נוכחי |
| `git pull` | משיכת עדכונים |
| `git push` | דחיפת שינויים |

---

## 🆘 פתרון בעיות

### השרת לא עולה
```bash
# נקה cache
rm -rf node_modules/.cache

# התקן מחדש
npm install

# נסה שוב
npm start
```

### Port 3000 תפוס
```bash
# מצא תהליך
netstat -ano | findstr :3000

# הרוג תהליך
taskkill /F /PID <מספר>
```

### שגיאות בסיס נתונים
1. ✅ וודא שהרצת `UPDATE_SCHEMA_FOR_ORDERS.sql`
2. ✅ בדוק שה-Service Role Key נכון
3. ✅ בדוק חיבור לאינטרנט

---

## 📚 קישורים חשובים

- 📖 [מדריך מפורט - WORKFLOW.md](./WORKFLOW.md)
- 🗄️ [Supabase Dashboard](https://app.supabase.com/project/snyysiklfbaycdshgsif)
- 💻 [GitHub Repository](https://github.com/David-Keshet/keshet-system)

---

## 🎓 למדו עוד

### React
- [React Docs](https://react.dev)
- [React Tutorial](https://react.dev/learn)

### Supabase
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Tutorial](https://supabase.com/docs/guides/getting-started)

### Git
- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

---

## ✅ Checklist להתחלה

- [ ] Clone הפרויקט
- [ ] `npm install`
- [ ] העתק `.env.example` ל-`.env`
- [ ] מלא את פרטי Supabase
- [ ] הרץ `UPDATE_SCHEMA_FOR_ORDERS.sql` בSupabase
- [ ] הרץ `start-dev.bat`
- [ ] פתח http://localhost:3000
- [ ] התחבר: admin (ללא סיסמה)
- [ ] בדוק שהכל עובד!

---

<p align="center">
  <strong>מוכן לעבוד? 🚀</strong><br>
  הרץ <code>start-dev.bat</code> ותתחיל!
</p>
