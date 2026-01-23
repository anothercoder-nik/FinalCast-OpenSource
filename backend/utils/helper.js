import jsonwebtoken from "jsonwebtoken";
import secretManager from "../services/secretManager.service.js";

const getJWTSecret = () => {
  return process.env.JWT_SECRET || secretManager.getSecret('JWT_SECRET');
};

export const signToken = (payload) => {
    const secret = getJWTSecret();
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }
    
    return jsonwebtoken.sign(
      payload,
      secret,
      { 
        expiresIn: '15m',
        issuer: 'finalcast-api',
        audience: 'finalcast-client'
      }
    );
  }
  
export const verifyToken = (token) => {
    if (!token) {
      throw new Error('Token is required');
    }
    
    const secret = getJWTSecret();
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }
    
    try {
      const decoded = jsonwebtoken.verify(token, secret, {
        issuer: 'finalcast-api',
        audience: 'finalcast-client'
      });
      
      // Validate token structure
      if (!decoded.id || !decoded.exp || !decoded.iss || !decoded.aud) {
        throw new Error('Invalid token structure');
      }
      
      // Check if token is expired (additional check)
      if (decoded.exp < Date.now() / 1000) {
        throw new Error('Token expired');
      }
      
      return decoded.id;
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      }
      if (error.name === 'NotBeforeError') {
        throw new Error('Token not active');
      }
      throw error;
    }
  }


