import crypto from "crypto";
import emailService from "./email.service.js";

class RegistrationOTPService {
  constructor() {
    this.otpStore = new Map();
    this.OTP_EXPIRY_MINUTES = 10;
    this.MAX_ATTEMPTS = 3;
  }

  generateOTP() {
    return crypto.randomInt(100000, 1000000).toString();
  }

  async sendRegistrationOTP(email, name = null) {
    const otp = this.generateOTP();
    const otpId = crypto.randomUUID();
    const expiresAt = Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000;

    this.otpStore.set(otpId, {
      email: email.toLowerCase(),
      otp,
      expiresAt,
      attempts: 0,
      verified: false
    });

    await emailService.sendRegistrationOTP({
      email,
      name,
      otp,
      expiresIn: this.OTP_EXPIRY_MINUTES
    });

    return {
      success: true,
      otpId,
      expiresAt: new Date(expiresAt),
      message: "OTP sent successfully"
    };
  }

  verifyRegistrationOTP(otpId, otp, email) {
    const data = this.otpStore.get(otpId);

    if (!data) {
      return { success: false, message: "Invalid or expired OTP session" };
    }

    if (Date.now() > data.expiresAt) {
      this.otpStore.delete(otpId);
      return { success: false, message: "OTP has expired. Please request a new one" };
    }

    if (data.verified) {
      return { success: false, message: "OTP has already been used" };
    }

    if (data.email !== email.toLowerCase()) {
      return { success: false, message: "Email mismatch" };
    }

    if (data.attempts >= this.MAX_ATTEMPTS) {
      this.otpStore.delete(otpId);
      return {
        success: false,
        message: "Too many failed attempts. Please request a new OTP"
      };
    }

    data.attempts++;

    if (data.otp !== otp) {
      const remaining = this.MAX_ATTEMPTS - data.attempts;

      if (remaining === 0) {
        this.otpStore.delete(otpId);
        return {
          success: false,
          message: "Invalid OTP. Maximum attempts exceeded. Please request a new OTP"
        };
      }

      return {
        success: false,
        message: `Invalid OTP. ${remaining} attempts remaining`
      };
    }

    data.verified = true;

    return {
      success: true,
      message: "OTP verified successfully",
      email: data.email
    };
  }

  async resendRegistrationOTP(otpId, email, name = null) {
    this.otpStore.delete(otpId);
    return this.sendRegistrationOTP(email, name);
  }

  cleanupExpiredOTPs() {
    const now = Date.now();

    for (const [otpId, data] of this.otpStore.entries()) {
      if (now > data.expiresAt) {
        this.otpStore.delete(otpId);
      }
    }
  }

  getOTPStatus(otpId) {
    const data = this.otpStore.get(otpId);

    if (!data) {
      return { exists: false };
    }

    return {
      exists: true,
      email: data.email,
      expiresAt: new Date(data.expiresAt),
      attempts: data.attempts,
      verified: data.verified,
      isExpired: Date.now() > data.expiresAt
    };
  }

  deleteOTP(otpId) {
    this.otpStore.delete(otpId);
  }
}

const registrationOTPService = new RegistrationOTPService();

setInterval(() => {
  registrationOTPService.cleanupExpiredOTPs();
}, 5 * 60 * 1000);

export default registrationOTPService;
