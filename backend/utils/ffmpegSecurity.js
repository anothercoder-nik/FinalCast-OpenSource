import path from 'path';
import fs from 'fs';

// FFmpeg fixup: Security helpers for FFmpeg input validation and sanitization

/**
 * Validates and sanitizes layout parameter
 * @param {string} layout - User-provided layout
 * @returns {string} - Validated layout or throws error
 */
export function sanitizeLayout(layout) {
  const allowedLayouts = ['grid', 'split', 'pip', 'speaker'];
  if (!allowedLayouts.includes(layout)) {
    throw new Error('Invalid layout specified');
  }
  return layout;
}

/**
 * Sanitizes file paths to prevent directory traversal and injection
 * @param {string} inputPath - User-provided path
 * @param {string} baseDir - Base directory to restrict to
 * @returns {string} - Sanitized absolute path or throws error
 */
export function sanitizeSafePath(inputPath, baseDir) {
  // Reject dangerous characters
  const dangerousChars = /[;&|$\\<>]/;
  if (dangerousChars.test(inputPath)) {
    throw new Error('Invalid path characters detected');
  }

  // Resolve to absolute path
  const resolvedPath = path.resolve(baseDir, inputPath);

  // Ensure it's within base directory
  if (!resolvedPath.startsWith(path.resolve(baseDir))) {
    throw new Error('Path outside allowed directory');
  }

  // Check if file exists (optional but good practice)
  if (!fs.existsSync(resolvedPath)) {
    throw new Error('File does not exist');
  }

  return resolvedPath;
}

/**
 * Asserts string is safe (no injection chars)
 * @param {string} value - Value to check
 * @param {string} fieldName - Field name for error
 */
export function assertSafeString(value, fieldName) {
  const dangerousChars = /[;&|$\\<>]/;
  if (dangerousChars.test(value)) {
    throw new Error(`Invalid characters in ${fieldName}`);
  }
}