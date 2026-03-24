import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  deleteAccount,
  googleAuthCallback,
  loginGoogleMobile,
  getMe,
  uploadProfileImage,
  updateProfilePrivacy,
  updateUsername,
  registerFcmToken,
  unregisterFcmToken,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import passport from "../config/passport.js";
import { uploadImageMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

//POST
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google/mobile", loginGoogleMobile);
router.post("/logout", authMiddleware, logoutUser);
router.post(
  "/profile-image",
  authMiddleware,
  uploadImageMiddleware.single("image"),
  uploadProfileImage,
);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.patch("/privacy", authMiddleware, updateProfilePrivacy);
router.patch("/username", authMiddleware, updateUsername);
router.post("/fcm-token", authMiddleware, registerFcmToken);

//DELETE
router.delete("/deleteAccount", authMiddleware, deleteAccount);
router.delete("/fcm-token", authMiddleware, unregisterFcmToken);
//GET
router.get("/me", authMiddleware, getMe);
router.get("/google", (req, res, next) => {
  const state =
    typeof req.query.state === "string" && req.query.state.trim().length > 0
      ? req.query.state.trim()
      : undefined;

  return passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state,
  })(req, res, next);
});
router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (error, user) => {
    const state = typeof req.query.state === "string" ? req.query.state : "";
    const isMobileCallback = state.startsWith("ivox://");

    if (error || !user) {
      if (isMobileCallback) {
        const separator = state.includes("?") ? "&" : "?";
        return res.redirect(
          `${state}${separator}error=${encodeURIComponent("google_auth_failed")}`,
        );
      }

      return res.status(401).json({ message: "Google authentication failed" });
    }

    req.user = user;
    return googleAuthCallback(req, res, next);
  })(req, res, next);
});
router.get("/google/failure", (_req, res) => {
  return res.status(401).json({ message: "Google authentication failed" });
});
export default router;
