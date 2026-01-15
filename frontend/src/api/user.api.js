import api from "../utils/axios.js";

export const loginUser = async (email, password, twoFactorToken, backupCode) => {
    const { data } = await api.post("/api/auth/login", {
        email, 
        password,
        twoFactorToken,
        backupCode
    });
    return data;
};

export const registerUser = async (name, password, email, otpId) => {
    const { data } = await api.post("/api/auth/register", { name, email, password, otpId });
    return data;
};

export const logoutUser = async () => {
    const { data } = await api.post("/api/auth/logout");
    return data;
};

export const getCurrentUser = async () => {
    const { data } = await api.get("/api/auth/me");
    return data;
};

// --- Registration OTP ---

export const sendRegistrationOTP = async (email, name) => {
    const { data } = await api.post("/api/auth/registration/send-otp", { email, name });
    return data;
};

export const verifyRegistrationOTP = async (otpId, otp, email) => {
    const { data } = await api.post("/api/auth/registration/verify-otp", { otpId, otp, email });
    return data;
};

export const resendRegistrationOTP = async (otpId, email, name) => {
    const { data } = await api.post("/api/auth/registration/resend-otp", { otpId, email, name });
    return data;
};

// --- 2FA Functions ---

export const get2FAStatus = async () => {
    const { data } = await api.get("/api/auth/2fa/status");
    return data;
};

export const setup2FA = async () => {
    const { data } = await api.post("/api/auth/2fa/setup");
    return data;
};

export const enable2FA = async (token) => {
    const { data } = await api.post("/api/auth/2fa/enable", { token });
    return data;
};

export const disable2FA = async (password, token) => {
    const { data } = await api.post("/api/auth/2fa/disable", { password, token });
    return data;
};

export const regenerateBackupCodes = async (password) => {
    const { data } = await api.post("/api/auth/2fa/backup-codes", { password });
    return data;
};


