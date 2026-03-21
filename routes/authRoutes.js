import express from "express";
import {
  registerUser,
  loginUser,
  deleteAccount,
  googleAuthCallback,
  getAllUsers,
  getOneUser,
} from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import passport from "../config/passport.js";

const router = express.Router();

//POST
router.post("/register", registerUser);
router.post("/login", loginUser);

//DELETE
router.delete("/deleteAccount", authMiddleware, deleteAccount);

//GET
router.get("/users", authMiddleware, getAllUsers);
router.get("/users/:id", authMiddleware, getOneUser);
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
