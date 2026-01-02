-- ====================================================
-- בדיקת מצב מסד הנתונים
-- ====================================================

-- 1. בדיקה אם טבלת users קיימת
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'users'
) AS users_table_exists;

-- 2. ספירת משתמשים בטבלה
SELECT COUNT(*) AS total_users FROM users;

-- 3. הצגת כל המשתמשים
SELECT id, username, full_name, role, is_active, password_hash IS NOT NULL AS has_password
FROM users;

-- 4. בדיקת RLS Status
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('users', 'customers', 'products', 'orders', 'invoices', 'payments', 'tasks', 'activity_log');

-- 5. בדיקת Policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('users', 'customers', 'products', 'orders', 'invoices', 'payments', 'tasks', 'activity_log');
