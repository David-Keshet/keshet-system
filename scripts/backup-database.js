/**
 * Database Backup Script
 * סקריפט גיבוי בסיס נתונים
 *
 * שימוש: node scripts/backup-database.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Tables to backup
const TABLES = [
  'users',
  'customers',
  'orders',
  'order_items',
  'tasks',
  'whatsapp_templates'
];

async function backupTable(tableName) {
  console.log(`📦 Backing up ${tableName}...`);

  const { data, error } = await supabase
    .from(tableName)
    .select('*');

  if (error) {
    console.error(`❌ Error backing up ${tableName}:`, error.message);
    return null;
  }

  console.log(`✅ Backed up ${data.length} records from ${tableName}`);
  return data;
}

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const backupDir = path.join(__dirname, '..', 'backups');

  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupData = {
    timestamp: new Date().toISOString(),
    tables: {}
  };

  console.log('\n🔄 Starting database backup...\n');

  // Backup each table
  for (const table of TABLES) {
    const data = await backupTable(table);
    if (data) {
      backupData.tables[table] = data;
    }
  }

  // Save to file
  const filename = `backup-${timestamp}.json`;
  const filepath = path.join(backupDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2), 'utf8');

  console.log('\n✅ Backup completed successfully!');
  console.log(`📁 File: ${filepath}`);
  console.log(`📊 Total tables: ${Object.keys(backupData.tables).length}`);

  // Calculate total records
  const totalRecords = Object.values(backupData.tables).reduce(
    (sum, records) => sum + records.length,
    0
  );
  console.log(`📝 Total records: ${totalRecords}`);

  return filepath;
}

// Run backup
createBackup()
  .then(() => {
    console.log('\n🎉 Backup process finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Backup failed:', error);
    process.exit(1);
  });
