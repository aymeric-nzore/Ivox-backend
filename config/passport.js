import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.js";
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET_CLIENT,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:3000/api/auth/google/callback",
    },
    async (refreshToken, accessToken, profile, done) => {
      try {
        const email = profile.email?.[0]?.value || null;
        const username =
          (profile.displayName || "").trim() ||
          (email ? email.split("@")[0] : "user");
        //Inscription avec google
        const user = await User.create({
          googleId: profile.id,
          email: email,
          username: username,
          password: `google_${profile.id}_${Date.now()}`,
        });
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);
export default passport;
