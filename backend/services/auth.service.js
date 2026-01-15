import {
  createUser,
  findUserByEmail,
  findUserByEmailByPassword
} from "../DAO/user.dao.js";
import { signToken } from "../utils/helper.js";
import { verifyTOTP, verifyBackupCode } from "./twoFactor.service.js";

export const registerUser = async (name, email, password) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const user = await createUser(name, email, password);
  const token = signToken({ id: user._id });

  return { token, user };
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

  const token = signToken({ id: user._id });
  return { token, user };
};
