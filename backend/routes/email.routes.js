import express from "express";
import {
  sendRoomInvitation,
  sendBulkInvitations,
  testEmailService
} from "../controllers/emailController.js";
import { attachuser } from "../utils/attachUser.js";

const router = express.Router();

router.use(attachuser);

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }
  next();
};

router.get("/test", testEmailService);
router.post("/send-invitation", requireAuth, sendRoomInvitation);
router.post("/send-bulk-invitations", requireAuth, sendBulkInvitations);

export default router;
