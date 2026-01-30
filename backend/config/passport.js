import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          `${process.env.BACKEND_URL || "http://localhost:3000"}/api/auth/google/callback`
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            // Check if user exists with same email (case-insensitive)
            const email = profile.emails?.[0]?.value;
            if (email) {
               user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
            }

            if (user) {
              // Link Google account to existing user
              user.googleId = profile.id;
              if (profile.photos?.[0]?.value && (!user.avatar || user.avatar.includes("gravatar.com"))) {
                user.avatar = profile.photos[0].value;
              }
              await user.save();
            } else {
              // Create new user (enforce lowercase email)
              user = await User.create({
                googleId: profile.id,
                name: profile.displayName,
                email: email ? email.toLowerCase() : undefined,
                avatar: profile.photos?.[0]?.value
              });
            }
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
} else {
  console.warn('Google OAuth credentials not provided. Google login will be disabled.');
}
