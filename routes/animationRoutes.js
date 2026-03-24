import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getSplashAnimations,
  getAnimationDetails,
  buyAnimation,
  equipAnimation,
  getActiveSplashAnimation,
  getUserAnimations,
} from "../controllers/animationController.js";

const router = express.Router();

// Routes publiques (pas d'auth)
router.get("/splash", getSplashAnimations);
router.get("/:id", getAnimationDetails);

// Routes protégées (auth required)
router.post("/buy/:id", authMiddleware, buyAnimation);
router.post("/equip/:id", authMiddleware, equipAnimation);
router.get("/user/active", authMiddleware, getActiveSplashAnimation);
router.get("/user/owned", authMiddleware, getUserAnimations);

export default router;
