export const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", 
    maxAge: 1000 * 60 * 60, // 1 hour
    path: '/',
    domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined,
};