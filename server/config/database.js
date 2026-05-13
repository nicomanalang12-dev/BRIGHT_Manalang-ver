// config/database.js
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

function runMigrations(db) {
  try {
    db.exec('ALTER TABLE Users ADD COLUMN two_fa_code TEXT');
  } catch (err) {}
  try {
    db.exec('ALTER TABLE Users ADD COLUMN two_fa_expires DATETIME');
  } catch (err) {}
  try {
    db.exec('ALTER TABLE Users ADD COLUMN reset_token TEXT');
  } catch (err) {}
  try {
    db.exec('ALTER TABLE Users ADD COLUMN reset_token_expires DATETIME');
  } catch (err) {}
}

const dbPath = path.resolve(__dirname, '..', 'data', 'BRIGHTDatabase.db');
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
