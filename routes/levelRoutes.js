import express from "express";
import { saveLevelWords, addXpAndScore, addCoins } from "../controllers/levelController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Générer/enregistrer les mots d'un niveau
router.post("/save-words", authMiddleware, saveLevelWords);
// Ajouter XP et score à la fin d'un niveau
router.post("/add-xp-score", authMiddleware, addXpAndScore);
// Ajouter des pièces
router.post("/add-coins", authMiddleware, addCoins);

export default router;
