import express from "express";
import passport from "passport";
import {
  // OTP
  sendRegistrationOtp,
  verifyRegistrationOtp,
  resendRegistrationOtp,

  // Auth
  registerUser,
  loginUser,
  logoutUser,
  deleteUser,
  getCurrentUser,
  refreshToken,

  // Google
  googleAuth,

  // 2FA
  get2FAStatus,
  setup2FA,
  enable2FA,
  disable2FA,
  regenerateBackupCodes
} from "../controllers/authController.js";

import { authenticateToken } from "../middleware/auth.js";
import { authLimiter, registrationLimiter, passwordResetLimiter } from "../middleware/rateLimiter.js";
import { generateTokenPair } from "../services/refreshToken.service.js";
import { cookieOptions, refreshCookieOptions } from "../config/config.js";

const router = express.Router();

/* ======================================================
   REGISTRATION (EMAIL OTP)
   ====================================================== */

router.post("/registration/send-otp", registrationLimiter, sendRegistrationOtp);
router.post("/registration/verify-otp", registrationLimiter, verifyRegistrationOtp);
router.post("/registration/resend-otp", registrationLimiter, resendRegistrationOtp);

/* ======================================================
   AUTH (EMAIL / PASSWORD)
   ====================================================== */

router.post("/register", registrationLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/logout", authenticateToken, logoutUser);
router.post("/refresh", authLimiter, refreshToken); // New refresh endpoint
router.post("/delete", authenticateToken, deleteUser);
router.get("/me", authenticateToken, getCurrentUser);

/* ======================================================
   TWO FACTOR AUTH (2FA)
   ====================================================== */

router.get("/2fa/status", authenticateToken, get2FAStatus);
router.post("/2fa/setup", authenticateToken, setup2FA);
router.post("/2fa/enable", authenticateToken, enable2FA);
router.post("/2fa/disable", authenticateToken, disable2FA);
router.post("/2fa/backup-codes", authenticateToken, regenerateBackupCodes);

/* ======================================================
   GOOGLE OAUTH
   ====================================================== */

router.get("/google", googleAuth);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/auth`
  }),
  (req, res) => {
    /**
     * Secure Google OAuth callback with refresh tokens
     */
    const { accessToken, refreshToken } = generateTokenPair(req.user._id);
    
    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    const redirectTo = req.cookies.oauth_redirect;
    if (redirectTo) {
      res.clearCookie("oauth_redirect");
    }

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const redirectUrl = redirectTo
      ? `${baseUrl}${redirectTo}`
      : `${baseUrl}/dashboard`;

    res.redirect(redirectUrl);
  }
);

export default router;
