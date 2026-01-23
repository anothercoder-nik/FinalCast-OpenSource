import { cookieOptions, refreshCookieOptions } from "../config/config.js";
import { loginUser as loginUserService, registerUser as registerUserService, refreshAccessToken } from "../services/auth.service.js";
import { revokeRefreshToken, revokeAllUserTokens } from "../services/refreshToken.service.js";
import wrapAsync from "../utils/trycatchwrapper.js";
import User from "../models/user.model.js";
import passport from "passport";
import registrationOTPService from "../services/registrationOtp.service.js";
import {
  generateTwoFactorSecret,
  generateQRCode,
  verifyTOTP,
  generateBackupCodes as generateBackupCodesService
} from "../services/twoFactor.service.js";

// -------------------- OTP --------------------

export const sendRegistrationOtp = wrapAsync(async (req, res) => {
  const { email, name, redirectTo } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const result = await registrationOTPService.sendRegistrationOTP(email, name);

  res.status(200).json({
    message: "OTP sent",
    otpId: result.otpId,
    expiresAt: result.expiresAt,
    email: email.toLowerCase(),
    redirectTo: redirectTo || null
  });
});

export const verifyRegistrationOtp = wrapAsync(async (req, res) => {
  const { otpId, otp, email, redirectTo } = req.body;

  if (!otpId || !otp || !email) {
    return res.status(400).json({ message: "Missing OTP details" });
  }

  const result = registrationOTPService.verifyRegistrationOTP(otpId, otp, email);

  if (!result.success) {
    return res.status(400).json({
      verified: false,
      message: result.message
    });
  }

  res.status(200).json({
    verified: true,
    message: "Email verified",
    redirectTo: redirectTo || null
  });
});

export const resendRegistrationOtp = wrapAsync(async (req, res) => {
  const { otpId, email, name, redirectTo } = req.body;

  if (!otpId || !email) {
    return res.status(400).json({ message: "OTP ID and email required" });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const result = await registrationOTPService.resendRegistrationOTP(
    otpId,
    email,
    name
  );

  res.status(200).json({
    message: "OTP resent",
    otpId: result.otpId,
    expiresAt: result.expiresAt,
    email: email.toLowerCase(),
    redirectTo: redirectTo || null
  });
});

// -------------------- AUTH --------------------

export const registerUser = wrapAsync(async (req, res) => {
  const { name, email, password, otpId, redirectTo } = req.body;

  if (!otpId) {
    return res.status(400).json({ message: "Email verification required" });
  }

  const otpStatus = registrationOTPService.getOTPStatus(otpId);

  if (
    !otpStatus.exists ||
    !otpStatus.verified ||
    otpStatus.email !== email.toLowerCase()
  ) {
    return res.status(400).json({ message: "Invalid email verification" });
  }

  const { accessToken, refreshToken, user } = await registerUserService(name, email, password);

  registrationOTPService.deleteOTP(otpId);

  // Set secure cookies
  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  res.status(200).json({
    user,
    message: "Register success",
    redirectTo: redirectTo || null
  });
});

export const loginUser = wrapAsync(async (req, res) => {
  const { email, password, twoFactorToken, backupCode, redirectTo } = req.body;

  const { accessToken, refreshToken, user, requires2FA } = await loginUserService(
    email,
    password,
    twoFactorToken,
    backupCode
  );

  if (requires2FA) {
    return res.status(200).json({
      requires2FA: true,
      tempUserId: user._id,
      message: "2FA required",
      redirectTo
    });
  }

  // Set secure cookies
  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  res.status(200).json({
    user,
    message: "Login success",
    redirectTo: redirectTo || null
  });
});

export const logoutUser = wrapAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  // Revoke refresh token if exists
  if (refreshToken) {
    revokeRefreshToken(refreshToken);
  }
  
  // Revoke all user tokens for complete logout
  if (req.user) {
    revokeAllUserTokens(req.user._id);
  }
  
  // Clear cookies
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", refreshCookieOptions);
  
  res.status(200).json({ message: "Logout success" });
});

// -------------------- USER --------------------

export const deleteUser = wrapAsync(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await User.findByIdAndDelete(req.user._id);
  res.clearCookie("accessToken", cookieOptions);

  res.status(200).json({ message: "User deleted" });
});

export const getCurrentUser = wrapAsync(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.status(200).json(req.user);
});

// -------------------- GOOGLE --------------------

export const googleAuth = wrapAsync(async (req, res, next) => {
  const redirectTo = req.query.redirect;

  if (redirectTo) {
    res.cookie("oauth_redirect", redirectTo, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60 * 1000
    });
  }

  passport.authenticate("google", {
    scope: ["profile", "email"]
  })(req, res, next);
});

// -------------------- 2FA --------------------

export const get2FAStatus = wrapAsync(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findById(req.user._id);
  res.json({ enabled: !!user.twoFactorEnabled });
});

export const setup2FA = wrapAsync(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await User.findById(req.user._id);

  if (!user || user.twoFactorEnabled) {
    return res.status(400).json({ message: "2FA already enabled" });
  }

  const { secret, otpauthUrl } = generateTwoFactorSecret(
    user.email,
    "FinalCast"
  );

  user.twoFactorSecret = secret;
  await user.save();

  const qrCode = await generateQRCode(otpauthUrl);

  res.status(200).json({
    secret,
    qrCode,
    message: "Scan QR to enable 2FA"
  });
});

export const enable2FA = wrapAsync(async (req, res) => {
  const { token } = req.body;

  if (!req.user || !token) {
    return res.status(400).json({ message: "Invalid request" });
  }

  const user = await User.findById(req.user._id).select("+twoFactorSecret");

  if (!user || !verifyTOTP(token, user.twoFactorSecret)) {
    return res.status(400).json({ message: "Invalid 2FA token" });
  }

  user.twoFactorEnabled = true;
  user.backupCodes = generateBackupCodesService();
  await user.save();

  res.status(200).json({
    message: "2FA enabled",
    backupCodes: user.backupCodes.map(b => b.code)
  });
});

export const disable2FA = wrapAsync(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findById(req.user._id);
  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  user.backupCodes = [];
  await user.save();
  res.json({ message: "2FA disabled" });
});

export const regenerateBackupCodes = wrapAsync(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findById(req.user._id);
  if (!user.twoFactorEnabled) {
    return res.status(400).json({ message: "2FA not enabled" });
  }
  user.backupCodes = generateBackupCodesService();
  await user.save();
  res.json({
    message: "Backup codes regenerated",
    backupCodes: user.backupCodes.map(b => b.code)
  });
});

// -------------------- TOKEN REFRESH --------------------

export const refreshToken = wrapAsync(async (req, res) => {
  const refreshTokenFromCookie = req.cookies.refreshToken;
  
  if (!refreshTokenFromCookie) {
    return res.status(401).json({ message: "Refresh token required" });
  }
  
  try {
    const { accessToken, refreshToken: newRefreshToken } = await refreshAccessToken(refreshTokenFromCookie);
    
    // Set new tokens in cookies
    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);
    
    res.status(200).json({ message: "Tokens refreshed" });
  } catch (error) {
    // Clear invalid cookies
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", refreshCookieOptions);
    
    res.status(401).json({ message: "Invalid refresh token" });
  }
});
