import path from 'path';
import { extractProjectDirectory } from '../projects.js';

/**
 * Validates that a file path is within the allowed project directory
 * @param {string} filePath - The absolute file path to validate
 * @param {string} projectName - The project name
 * @returns {Promise<boolean>} - True if path is valid and safe
 */
export async function isPathWithinProject(filePath, projectName) {
  try {
    // Get the actual project directory
    const projectDir = await extractProjectDirectory(projectName);
    
    // Resolve both paths to handle .. and symbolic links
    const resolvedFilePath = path.resolve(filePath);
    const resolvedProjectDir = path.resolve(projectDir);
    
    // Check if the file path starts with the project directory
    return resolvedFilePath.startsWith(resolvedProjectDir + path.sep) || 
           resolvedFilePath === resolvedProjectDir;
  } catch (error) {
    console.error('Error validating path:', error);
    return false;
  }
}

/**
 * Sanitizes user input to prevent command injection
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
export function sanitizeShellInput(input) {
  // Remove or escape potentially dangerous characters
  return input
    .replace(/[;&|`$(){}[\]<>]/g, '') // Remove shell metacharacters
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/'/g, "\\'") // Escape single quotes
    .replace(/"/g, '\\"'); // Escape double quotes
}

/**
 * Validates file extensions for uploads
 * @param {string} filename - The filename to validate
 * @param {string[]} allowedExtensions - Array of allowed extensions
 * @returns {boolean} - True if extension is allowed
 */
export function isAllowedFileExtension(filename, allowedExtensions) {
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
}

/**
 * Generates a secure random token
 * @param {number} length - Token length
 * @returns {string} - Random token
 */
export function generateSecureToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    token += chars[randomValues[i] % chars.length];
  }
  
  return token;
}