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
        const email = profile.emails?.[0]?.value?.toLowerCase() || null;
        const baseUsername =
          (profile.displayName || "").trim().toLowerCase() ||
          (email ? email.split("@")[0] : "user");

        let user = await User.findOne({
          $or: [{ googleId: profile.id }, ...(email ? [{ email }] : [])],
        });

        if (!user) {
          let usernameCandidate = baseUsername;
          let suffix = 1;

          while (await User.exists({ username: usernameCandidate })) {
            usernameCandidate = `${baseUsername}${suffix}`;
            suffix += 1;
          }

          user = await User.create({
            googleId: profile.id,
            email,
            username: usernameCandidate,
            password: `google_${profile.id}_${Date.now()}`,
          });
        } else if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);
export default passport;
