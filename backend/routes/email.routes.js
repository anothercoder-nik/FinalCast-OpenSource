import express from "express";
import {
  sendRoomInvitation,
  sendBulkInvitations,
  testEmailService
} from "../controllers/emailController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/test", testEmailService);
router.post("/send-invitation", authenticateToken, sendRoomInvitation);
router.post("/send-bulk-invitations", authenticateToken, sendBulkInvitations);

export default router;
