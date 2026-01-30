import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import memoryManager from './memoryManager.service.js';
import { signToken } from '../utils/helper.js';

// In-memory store for refresh tokens (use Redis in production)
const refreshTokenStore = new Map();

// Cleanup expired tokens periodically
const cleanupInterval = memoryManager.trackInterval(
  setInterval(() => {
    cleanupExpiredTokens();
  }, 60 * 60 * 1000) // Every hour
);

export const generateTokenPair = (userId) => {
  const accessToken = signToken({ id: userId, type: 'access' });

  const refreshToken = crypto.randomBytes(32).toString('hex');
  const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Store refresh token with metadata
  refreshTokenStore.set(refreshToken, {
    userId,
    expiresAt: refreshTokenExpiry,
    createdAt: new Date(),
    isActive: true
  });

  return { accessToken, refreshToken, refreshTokenExpiry };
};

export const verifyRefreshToken = (refreshToken) => {
  const tokenData = refreshTokenStore.get(refreshToken);
  
  if (!tokenData || !tokenData.isActive || tokenData.expiresAt < new Date()) {
    if (tokenData) {
      refreshTokenStore.delete(refreshToken); // Clean up invalid token
    }
    return null;
  }

  return tokenData;
};

export const revokeRefreshToken = (refreshToken) => {
  refreshTokenStore.delete(refreshToken);
};

export const revokeAllUserTokens = (userId) => {
  const tokensToDelete = [];
  for (const [token, data] of refreshTokenStore.entries()) {
    if (data.userId === userId) {
      tokensToDelete.push(token);
    }
  }
  
  tokensToDelete.forEach(token => refreshTokenStore.delete(token));
};

export const cleanupExpiredTokens = () => {
  const now = new Date();
  const tokensToDelete = [];
  
  for (const [token, data] of refreshTokenStore.entries()) {
    if (data.expiresAt < now) {
      tokensToDelete.push(token);
    }
  }
  
  tokensToDelete.forEach(token => refreshTokenStore.delete(token));
  
  if (tokensToDelete.length > 0) {
    console.log(`Cleaned up ${tokensToDelete.length} expired refresh tokens`);
  }
};

// Add cleanup task for graceful shutdown
memoryManager.addCleanupTask(async () => {
  console.log('Cleaning up refresh tokens...');
  refreshTokenStore.clear();
});