export const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", 
    maxAge: 15 * 60 * 1000, // 15 minutes for access token
    path: '/',
    domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined,
};

export const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
    path: '/api/auth',
    domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined,
};