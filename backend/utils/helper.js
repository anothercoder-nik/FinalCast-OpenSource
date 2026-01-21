
import jsonwebtoken from "jsonwebtoken";


export const signToken = (payload) => {
    return jsonwebtoken.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }
  export const verifyToken = (token) => {
    if (!token) {
      throw new Error('Token is required');
    }
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }
    
    try {
      const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
      
      // Validate token structure
      if (!decoded.id || !decoded.exp) {
        throw new Error('Invalid token structure');
      }
      
      // Check if token is expired
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
      throw error;
    }
  }


