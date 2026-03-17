import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
passport.use(
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET_CLIENT,
    callbackURL:
      process.env.GOOGLE_CALLBACK_URL ||
      "http://localhost:3000/api/auth/google/callback",
  }),
);
