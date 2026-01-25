import secretManager from '../services/secretManager.service.js';

// Security configuration and validation
export const validateEnvironment = () => {
  // Load encrypted secrets
  secretManager.loadSecrets();
  secretManager.migrateFromEnv();

  const requiredVars = [
    'JWT_SECRET',
    'MONGODB_URI'
  ];

  const missing = requiredVars.filter(varName => {
    return !process.env[varName] && !secretManager.getSecret(varName);
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate JWT secret strength in production
  if (process.env.NODE_ENV === 'production') {
    const jwtSecret = process.env.JWT_SECRET || secretManager.getSecret('JWT_SECRET');
    
    if (jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production');
    }
    
    if (jwtSecret.includes('change-in-production')) {
      throw new Error('Please change default JWT_SECRET in production');
    }
  }

  // Warn about optional services
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('Google OAuth not configured. Google login will be disabled.');
  }
};

export const securityHeaders = (req, res, next) => {
  // Basic security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' ws: wss:; " +
    "font-src 'self'; " +
    "object-src 'none'; " +
    "media-src 'self'; " +
    "frame-src 'none';"
  );
  
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

// IP blocking middleware
const blockedIPs = new Set();
const suspiciousActivity = new Map();

export const ipProtection = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Check if IP is blocked
  if (blockedIPs.has(clientIP)) {
    return res.status(403).json({ error: 'IP address blocked due to suspicious activity' });
  }
  
  // Track suspicious activity
  const activity = suspiciousActivity.get(clientIP) || { count: 0, lastActivity: Date.now() };
  
  // Reset counter if more than 1 hour has passed
  if (Date.now() - activity.lastActivity > 60 * 60 * 1000) {
    activity.count = 0;
  }
  
  activity.count++;
  activity.lastActivity = Date.now();
  suspiciousActivity.set(clientIP, activity);
  
  // Block IP if too many requests
  if (activity.count > 1000) { // 1000 requests per hour
    blockedIPs.add(clientIP);
    console.warn(`IP ${clientIP} blocked due to excessive requests`);
    return res.status(403).json({ error: 'IP address blocked due to suspicious activity' });
  }
  
  next();
};

// Cleanup blocked IPs periodically (every 24 hours)
setInterval(() => {
  blockedIPs.clear();
  suspiciousActivity.clear();
  console.log('IP blocks cleared');
}, 24 * 60 * 60 * 1000);