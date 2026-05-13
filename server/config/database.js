// config/database.js
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

function runMigrations(db) {
  try {
    db.exec('ALTER TABLE Users ADD COLUMN two_fa_code TEXT');
    console.log('✅ Migration: Added two_fa_code column to Users.');
  } catch (err) {
    if (!err.message.includes('duplicate column name')) {
      console.error('Migration Error (two_fa_code):', err.message);
    }
  }
  try {
    db.exec('ALTER TABLE Users ADD COLUMN two_fa_expires DATETIME');
    console.log('✅ Migration: Added two_fa_expires column to Users.');
  } catch (err) {
    if (!err.message.includes('duplicate column name')) {
      console.error('Migration Error (two_fa_expires):', err.message);
    }
  }
}

const CODE_DB_PATH = path.resolve(__dirname, '..', 'data', 'BRIGHTDatabase.db');
const VOLUME_FOLDER = '/app/data';
const VOLUME_DB_PATH = path.join(VOLUME_FOLDER, 'BRIGHTDatabase.db');

let dbPath;

console.log('--- DATABASE SETUP STARTED ---');

if (fs.existsSync(VOLUME_FOLDER)) {
  console.log('✅ Volume folder found. Running in Production/Railway.');
  if (!fs.existsSync(VOLUME_DB_PATH)) {
    console.log('⚠️ Database NOT found in Volume. Seeding from code...');
    if (fs.existsSync(CODE_DB_PATH)) {
      try {
        fs.copyFileSync(CODE_DB_PATH, VOLUME_DB_PATH);
        console.log('✅ SUCCESS: Copied initial database to Volume.');
      } catch (err) {
        console.error('❌ ERROR: Failed to copy database file:', err);
      }
    }
  } else {
    console.log('✅ Existing database found in Volume. Using it.');
  }
  dbPath = VOLUME_DB_PATH;
} else {
  console.log('ℹ️ Volume folder NOT found. Using local file.');
  dbPath = CODE_DB_PATH;
}

console.log('Final Database Path:', dbPath);

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');
console.log('✅ Connected to SQLite database.');

const schemaPath = path.join(__dirname, '../data/schema.sql');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
  console.log('✅ Schema applied.');
}

runMigrations(db);

module.exports = db;
