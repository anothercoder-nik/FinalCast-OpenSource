import { verifyToken } from "../utils/helper.js";
import { findUserById } from "../DAO/user.dao.js";
import Session from "../models/session.model.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Access token required" 
      });
    }

    const userId = verifyToken(token);
    const user = await findUserById(userId);

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found or token invalid" 
      });
    }

    // Remove sensitive data
    const { password, ...safeUser } = user.toObject();
    req.user = safeUser;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: "Authentication failed"
    });
  }
};


export const requireSessionHost = async (req, res, next) => {
  try {
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid session ID format" 
      });
    }

    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ 
        success: false,
        message: "Session not found" 
      });
    }
    
    if (session.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "Only session host can perform this action" 
      });
    }
    
    req.session = session;
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Authorization check failed" 
    });
  }
};

