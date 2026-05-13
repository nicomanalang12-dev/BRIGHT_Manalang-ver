// models/User.js
const db = require('../config/database');

const User = {
  findByUsername: (username, callback) => {
    try {
      const user = db.prepare("SELECT * FROM Users WHERE username = ? AND status = 'approved'").get(username);
      callback(null, user);
    } catch (err) { callback(err); }
  },
  findByEmail: (email, callback) => {
    try {
      const user = db.prepare('SELECT * FROM Users WHERE email = ?').get(email);
      callback(null, user);
    } catch (err) { callback(err); }
  },
  create: (username, full_name, passwordHash, email, role, position, callback) => {
    try {
      const now = new Date();
      const timestamp = now.getFullYear() + '-' + ('0'+(now.getMonth()+1)).slice(-2) + '-' + ('0'+now.getDate()).slice(-2) + ' ' + ('0'+now.getHours()).slice(-2) + ':' + ('0'+now.getMinutes()).slice(-2) + ':' + ('0'+now.getSeconds()).slice(-2);
      const result = db.prepare('INSERT INTO Users (username, full_name, password_hash, role, email, position, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(username, full_name, passwordHash, role, email, position, timestamp);
      callback(null, { id: result.lastInsertRowid });
    } catch (err) { callback(err); }
  },
  getAll: (callback) => {
    try {
      const rows = db.prepare('SELECT user_id, full_name, role FROM Users ORDER BY full_name').all();
      callback(null, rows);
    } catch (err) { callback(err); }
  },
  getAllRequests: (callback) => {
    try {
      const rows = db.prepare("SELECT user_id, full_name, position, role, email, created_at AS requested_date, status FROM Users ORDER BY CASE status WHEN 'pending' THEN 1 WHEN 'approved' THEN 2 WHEN 'rejected' THEN 3 END, created_at DESC").all();
      callback(null, rows);
    } catch (err) { callback(err); }
  },
  updateStatus: (userId, newStatus, callback) => {
    try {
      const result = db.prepare('UPDATE Users SET status = ? WHERE user_id = ?').run(newStatus, userId);
      callback(null, { changes: result.changes });
    } catch (err) { callback(err); }
  },
  getStatusSummary: (callback) => {
    try {
      const row = db.prepare("SELECT COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending, COUNT(CASE WHEN status = 'approved' THEN 1 END) AS approved, COUNT(CASE WHEN status = 'rejected' THEN 1 END) AS rejected FROM Users").get();
      callback(null, row);
    } catch (err) { callback(err); }
  },
  saveResetToken: (userId, token, expires, callback) => {
    try {
      const result = db.prepare('UPDATE Users SET reset_token = ?, reset_token_expires = ? WHERE user_id = ?').run(token, expires, userId);
      callback(null, result.changes);
    } catch (err) { callback(err); }
  },
  findByResetToken: (token, callback) => {
    try {
      const user = db.prepare("SELECT * FROM Users WHERE reset_token = ? AND reset_token_expires > datetime('now')").get(token);
      callback(null, user);
    } catch (err) { callback(err); }
  },
  updatePassword: (userId, hashedPassword, callback) => {
    try {
      const result = db.prepare('UPDATE Users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE user_id = ?').run(hashedPassword, userId);
      callback(null, result.changes);
    } catch (err) { callback(err); }
  },
  updateAccountDetails: (userId, data, callback) => {
    try {
      const { username, full_name, email, position } = data;
      const result = db.prepare('UPDATE Users SET username = ?, full_name = ?, email = ?, position = ? WHERE user_id = ?').run(username, full_name, email, position, userId);
      callback(null, { changes: result.changes });
    } catch (err) { callback(err); }
  },
  changePassword: (userId, newPasswordHash, callback) => {
    try {
      const result = db.prepare('UPDATE Users SET password_hash = ? WHERE user_id = ?').run(newPasswordHash, userId);
      callback(null, { changes: result.changes });
    } catch (err) { callback(err); }
  },
  saveTwoFACode: (userId, hashedCode, expires, callback) => {
    try {
      const result = db.prepare('UPDATE Users SET two_fa_code = ?, two_fa_expires = ? WHERE user_id = ?').run(hashedCode, expires, userId);
      callback(null, result.changes);
    } catch (err) { callback(err); }
  },
  findByTwoFACode: (userId, hashedCode, callback) => {
    try {
      const user = db.prepare("SELECT * FROM Users WHERE user_id = ? AND two_fa_code = ? AND two_fa_expires > datetime('now')").get(userId, hashedCode);
      callback(null, user);
    } catch (err) { callback(err); }
  },
  clearTwoFACode: (userId, callback) => {
    try {
      const result = db.prepare('UPDATE Users SET two_fa_code = NULL, two_fa_expires = NULL WHERE user_id = ?').run(userId);
      callback(null, result.changes);
    } catch (err) { callback(err); }
  }
};
module.exports = User;
