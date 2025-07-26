import rateLimit from 'express-rate-limit';
import { userDb } from '../database/db.js';

// Strict rate limiter for login attempts
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: 'Too many login attempts from this IP, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Account-based login attempt limiter
export const accountLimiter = async (req, res, next) => {
  const { username } = req.body;
  
  if (!username) {
    return next();
  }
  
  try {
    // Check if account is locked
    const user = userDb.getUserByUsername(username);
    if (user) {
      const lockInfo = userDb.getAccountLockInfo(user.id);
      
      if (lockInfo.is_locked) {
        const lockExpiry = new Date(lockInfo.locked_until);
        const now = new Date();
        
        if (now < lockExpiry) {
          const remainingMinutes = Math.ceil((lockExpiry - now) / 60000);
          return res.status(429).json({
            error: `Account is locked due to too many failed login attempts. Please try again in ${remainingMinutes} minutes.`
          });
        } else {
          // Unlock the account if lock period has expired
          userDb.unlockAccount(user.id);
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Account limiter error:', error);
    next(); // Continue even if there's an error
  }
};

// Track failed login attempts
export const trackFailedLogin = async (username) => {
  try {
    const user = userDb.getUserByUsername(username);
    if (user) {
      const attempts = userDb.incrementFailedAttempts(user.id);
      
      // Lock account after 5 failed attempts
      if (attempts >= 5) {
        userDb.lockAccount(user.id, 30); // Lock for 30 minutes
        return {
          locked: true,
          attempts: attempts,
          message: 'Account has been locked due to too many failed login attempts.'
        };
      }
      
      return {
        locked: false,
        attempts: attempts,
        remaining: 5 - attempts
      };
    }
  } catch (error) {
    console.error('Failed login tracking error:', error);
  }
  
  return null;
};

// Clear failed attempts on successful login
export const clearFailedAttempts = async (userId) => {
  try {
    userDb.clearFailedAttempts(userId);
  } catch (error) {
    console.error('Clear failed attempts error:', error);
  }
};