import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = path.join(__dirname, 'auth.db');
const INIT_SQL_PATH = path.join(__dirname, 'init.sql');

// Create database connection
const db = new Database(DB_PATH);
console.log('Connected to SQLite database');

// Initialize database with schema
const initializeDatabase = async () => {
  try {
    const initSQL = fs.readFileSync(INIT_SQL_PATH, 'utf8');
    db.exec(initSQL);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error.message);
    throw error;
  }
};

// User database operations
const userDb = {
  // Check if any users exist
  hasUsers: () => {
    try {
      const row = db.prepare('SELECT COUNT(*) as count FROM users').get();
      return row.count > 0;
    } catch (err) {
      throw err;
    }
  },

  // Create a new user
  createUser: (username, passwordHash) => {
    try {
      const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
      const result = stmt.run(username, passwordHash);
      return { id: result.lastInsertRowid, username };
    } catch (err) {
      throw err;
    }
  },

  // Get user by username
  getUserByUsername: (username) => {
    try {
      const row = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username);
      return row;
    } catch (err) {
      throw err;
    }
  },

  // Update last login time
  updateLastLogin: (userId) => {
    try {
      db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(userId);
    } catch (err) {
      throw err;
    }
  },

  // Get user by ID
  getUserById: (userId) => {
    try {
      const row = db.prepare('SELECT id, username, created_at, last_login FROM users WHERE id = ? AND is_active = 1').get(userId);
      return row;
    } catch (err) {
      throw err;
    }
  },

  // Increment failed login attempts
  incrementFailedAttempts: (userId) => {
    try {
      db.prepare(`
        UPDATE users 
        SET failed_login_attempts = failed_login_attempts + 1,
            last_failed_attempt = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(userId);
      
      const row = db.prepare('SELECT failed_login_attempts FROM users WHERE id = ?').get(userId);
      return row.failed_login_attempts;
    } catch (err) {
      throw err;
    }
  },

  // Clear failed login attempts
  clearFailedAttempts: (userId) => {
    try {
      db.prepare(`
        UPDATE users 
        SET failed_login_attempts = 0,
            last_failed_attempt = NULL
        WHERE id = ?
      `).run(userId);
    } catch (err) {
      throw err;
    }
  },

  // Lock user account
  lockAccount: (userId, minutes) => {
    try {
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + minutes);
      
      db.prepare(`
        UPDATE users 
        SET is_locked = 1,
            locked_until = ?
        WHERE id = ?
      `).run(lockedUntil.toISOString(), userId);
    } catch (err) {
      throw err;
    }
  },

  // Unlock user account
  unlockAccount: (userId) => {
    try {
      db.prepare(`
        UPDATE users 
        SET is_locked = 0,
            locked_until = NULL,
            failed_login_attempts = 0
        WHERE id = ?
      `).run(userId);
    } catch (err) {
      throw err;
    }
  },

  // Get account lock information
  getAccountLockInfo: (userId) => {
    try {
      const row = db.prepare(`
        SELECT is_locked, locked_until, failed_login_attempts 
        FROM users 
        WHERE id = ?
      `).get(userId);
      return row || { is_locked: 0, locked_until: null, failed_login_attempts: 0 };
    } catch (err) {
      throw err;
    }
  }
};

export {
  db,
  initializeDatabase,
  userDb
};