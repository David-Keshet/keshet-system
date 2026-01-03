-- ================================================
-- BMS 2025 - Trello-Style Task Management Schema
-- Created: 2026-01-03
-- ================================================

-- ============================================
-- 1. Create task_columns table
-- ============================================
CREATE TABLE IF NOT EXISTS task_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  position INTEGER NOT NULL,
  color VARCHAR(20) DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. Add column_id to tasks table
-- ============================================
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS column_id UUID REFERENCES task_columns(id) ON DELETE SET NULL;

-- ============================================
-- 3. Add position to tasks for ordering within column
-- ============================================
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- ============================================
-- 4. Insert default columns (like Trello starter board)
-- ============================================
INSERT INTO task_columns (name, position, color) VALUES
  ('לעשות', 0, '#6366f1'),
  ('בתהליך', 1, '#f59e0b'),
  ('בבדיקה', 2, '#8b5cf6'),
  ('הושלם', 3, '#10b981')
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. Create RLS policies for task_columns
-- ============================================
ALTER TABLE task_columns ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow all for service role" ON task_columns;
    CREATE POLICY "Allow all for service role" ON task_columns FOR ALL USING (true);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;

-- ============================================
-- 6. Add trigger for updated_at
-- ============================================
DROP TRIGGER IF EXISTS update_task_columns_updated_at ON task_columns;
CREATE TRIGGER update_task_columns_updated_at
BEFORE UPDATE ON task_columns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. Update existing tasks to have column_id
-- ============================================
-- התאם את הסטטוס הישן לעמודה החדשה
UPDATE tasks
SET column_id = (
  SELECT id FROM task_columns WHERE position = 0 LIMIT 1
)
WHERE status = 'todo' AND column_id IS NULL;

UPDATE tasks
SET column_id = (
  SELECT id FROM task_columns WHERE position = 1 LIMIT 1
)
WHERE status = 'in_progress' AND column_id IS NULL;

UPDATE tasks
SET column_id = (
  SELECT id FROM task_columns WHERE position = 3 LIMIT 1
)
WHERE status IN ('done', 'cancelled') AND column_id IS NULL;

-- ============================================
-- 8. Add indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tasks_column_position
ON tasks(column_id, position);

CREATE INDEX IF NOT EXISTS idx_task_columns_position
ON task_columns(position);

-- ============================================
-- End of Updates
-- ============================================

-- הערות:
-- * העמודות מאורגנות לפי position (0, 1, 2, 3...)
-- * כל משימה שייכת לעמודה דרך column_id
-- * המשימות בתוך עמודה מסודרות לפי position
-- * ניתן להוסיף/למחוק/לשנות עמודות בחופשיות
-- * הצבעים הם בפורמט HEX (#6366f1)
