
import jsonwebtoken from "jsonwebtoken";


export const signToken = (payload) => {
    return jsonwebtoken.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }
  export const verifyToken = (token) => {
    try {
      const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded); // Debug log
      return decoded.id;
    } catch (error) {
      console.log('Token verification error:', error.message); // Debug log
      throw error;
    }
  }


