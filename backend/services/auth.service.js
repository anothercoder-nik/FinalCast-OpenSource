import {
  createUser,
  findUserByEmail,
  findUserByEmailByPassword
} from "../DAO/user.dao.js";
import { generateTokenPair, verifyRefreshToken, revokeAllUserTokens } from "../services/refreshToken.service.js";
import { verifyTOTP, verifyBackupCode } from "./twoFactor.service.js";

export const registerUser = async (name, email, password) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const user = await createUser(name, email, password);
  const { accessToken, refreshToken } = generateTokenPair(user._id);

  return { accessToken, refreshToken, user };
};

export const loginUser = async (
  email,
  password,
  twoFactorToken,
  backupCode
) => {
  const user = await findUserByEmailByPassword(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordValid = await user.comparePassword(password);
  if (!passwordValid) {
    throw new Error("Invalid email or password");
  }

  if (user.twoFactorEnabled && user.twoFactorSecret) {
    if (!twoFactorToken && !backupCode) {
      return {
        requires2FA: true,
        user: { _id: user._id }
      };
    }

    let verified = false;

    if (twoFactorToken) {
      verified = verifyTOTP(twoFactorToken, user.twoFactorSecret);
    }

    if (!verified && backupCode && user.backupCodes) {
      verified = verifyBackupCode(backupCode, user.backupCodes);
      if (verified) {
        await user.save();
      }
    }

    if (!verified) {
      throw new Error("Invalid 2FA token or backup code");
    }
  }

  // Revoke all existing tokens for security
  revokeAllUserTokens(user._id);
  
  const { accessToken, refreshToken } = generateTokenPair(user._id);
  return { accessToken, refreshToken, user };
};

export const refreshAccessToken = async (refreshToken) => {
  const tokenData = verifyRefreshToken(refreshToken);
  
  if (!tokenData) {
    throw new Error("Invalid or expired refresh token");
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(tokenData.userId);
  
  return { accessToken, refreshToken: newRefreshToken };
};
