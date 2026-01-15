import speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";

export const generateTwoFactorSecret = (email, appName = "FinalCast") => {
  const secret = speakeasy.generateSecret({
    name: email,
    issuer: appName,
    length: 32
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url
  };
};

export const generateQRCode = async (otpauthUrl) => {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch {
    throw new Error("Failed to generate QR code");
  }
};

export const verifyTOTP = (token, secret) => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 2
  });
};

export const generateBackupCodes = (count = 8) => {
  return Array.from({ length: count }).map(() => ({
    code: crypto.randomBytes(4).toString("hex").toUpperCase(),
    used: false
  }));
};

export const verifyBackupCode = (inputCode, backupCodes) => {
  const code = inputCode.toUpperCase();

  const match = backupCodes.find(
    bc => bc.code === code && !bc.used
  );

  if (!match) return false;

  match.used = true;
  return true;
};

export const hasUnusedBackupCodes = (backupCodes) => {
  return backupCodes.some(bc => !bc.used);
};
