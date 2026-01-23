import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// In-memory store for refresh tokens (use Redis in production)
const refreshTokenStore = new Map();

export const generateTokenPair = (userId) => {
  const accessToken = jwt.sign(
    { id: userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Short-lived access token
  );

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
    return null;
  }

  return tokenData;
};

export const revokeRefreshToken = (refreshToken) => {
  const tokenData = refreshTokenStore.get(refreshToken);
  if (tokenData) {
    tokenData.isActive = false;
  }
};

export const revokeAllUserTokens = (userId) => {
  for (const [token, data] of refreshTokenStore.entries()) {
    if (data.userId === userId) {
      data.isActive = false;
    }
  }
};

export const cleanupExpiredTokens = () => {
  const now = new Date();
  for (const [token, data] of refreshTokenStore.entries()) {
    if (data.expiresAt < now) {
      refreshTokenStore.delete(token);
    }
  }
};