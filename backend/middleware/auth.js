// auth.js

import { verifyToken } from "../utils/helper.js";
import { findUserById } from "../DAO/user.dao.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    console.log("Token from cookies:", token);

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const userId = verifyToken(token);
    console.log("User ID from token:", userId);

    const user = await findUserById(userId);
    console.log("User found:", user ? user._id : "No user");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ message: "Invalid token", error: error.message });
  }
};


export const requireSessionHost = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    
    if (session.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only session host can perform this action" });
    }
    
    req.session = session; // Attach session to request
    next();
  } catch (error) {
    res.status(500).json({ message: "Authorization check failed" });
  }
};

