import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  deleteAccount,
  googleAuthCallback,
} from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import passport from "../config/passport.js";

const router = express.Router();

//POST
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);

//DELETE
router.delete("/deleteAccount", authMiddleware, deleteAccount);

//GET
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/google/failure",
  }),
  googleAuthCallback,
);
router.get("/google/failure", (_req, res) => {
  return res.status(401).json({ message: "Google authentication failed" });
});
export default router;
