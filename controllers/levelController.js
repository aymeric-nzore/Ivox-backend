import Level from "../models/crosswordLevel.js";
import User from "../models/user.js";

// Générer et enregistrer les mots d'un niveau (à appeler après génération IA côté Python)
export const saveLevelWords = async (req, res) => {
  try {
    const { numero, words, gridSize, timeLimit, xpReward, coinsReward } = req.body;
    if (!numero || !Array.isArray(words) || words.length === 0) {
      return res.status(400).json({ message: "Paramètres manquants ou invalides" });
    }
    const level = await Level.findOneAndUpdate(
      { numero },
      { $set: { words, gridSize, timeLimit, xpReward, coinsReward } },
      { upsert: true, new: true }
    );
    return res.status(200).json({ message: "Mots du niveau enregistrés", level });
  } catch (error) {
    console.log("saveLevelWords error:", error.message);
    return res.status(500).json({ message: "Erreur lors de l'enregistrement des mots du niveau" });
  }
};

// Ajouter XP et score à la fin d'un niveau, gérer le passage de niveau
export const addXpAndScore = async (req, res) => {
  try {
    const { userId, score, timeSeconds, levelNumero } = req.body;
    if (!userId || typeof score !== "number" || typeof timeSeconds !== "number" || typeof levelNumero !== "number") {
      return res.status(400).json({ message: "Paramètres manquants ou invalides" });
    }
    if (score <= 0) {
      return res.status(200).json({ message: "Aucune bonne réponse, aucune récompense.", xp: 0, coins: 0, leveledUp: false });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    const level = await Level.findOne({ numero: levelNumero });
    if (!level) return res.status(404).json({ message: "Niveau non trouvé" });
    // Barèmes
    const maxTime = 600; // 10 min en secondes
    const fullXP = level.xpReward || 100;
    const fullCoins = level.coinsReward || 10;
    let xp = 0;
    let coins = 0;
    if (timeSeconds < 180) { // < 3 min
      xp = fullXP;
      coins = fullCoins;
    } else if (timeSeconds < 420) { // 3-7 min
      xp = Math.round(fullXP * 0.7);
      coins = Math.round(fullCoins * 0.7);
    } else if (timeSeconds <= maxTime) { // 7-10 min
      xp = Math.round(fullXP * 0.5);
      coins = Math.round(fullCoins * 0.5);
    }
    // Score = nombre de bonnes réponses (déjà fourni)
    user.xp += xp;
    user.totalXP += xp;
    user.score = (user.score || 0) + score;
    user.coins += coins;
    // XP requise pour passer au niveau suivant
    const xpRequired = 100 + user.level * 50;
    let leveledUp = false;
    while (user.xp >= xpRequired) {
      user.xp -= xpRequired;
      user.level += 1;
      leveledUp = true;
    }
    await user.save();
    return res.status(200).json({
      message: `Récompenses attribuées${leveledUp ? ", niveau supérieur atteint !" : ""}`,
      xp,
      coins,
      score,
      user,
      leveledUp
    });
  } catch (error) {
    console.log("addXpAndScore error:", error.message);
    return res.status(500).json({ message: "Erreur lors de l'ajout d'XP/score" });
  }
};

// Ajouter des pièces à un utilisateur

