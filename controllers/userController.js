import User from "../models/user.js";
export const getAllUsers = async (_req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    console.log("getAllUsers error:", error.message);
    return res
      .status(500)
      .json({ message: "Erreur lors de la recuperation des utilisateurs" });
  }
};

export const getOneUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouve" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log("getOneUser error:", error.message);
    return res
      .status(500)
      .json({ message: "Erreur lors de la recuperation de l'utilisateur" });
  }
};

//Juste pour les tests , afin d'eviter d'aller en bd a chaque fois
export const patchUserCoinsById = async (req, res) => {
  try {
    const { coins } = req.body;
    const parsedCoins = Number(coins);

    if (!Number.isFinite(parsedCoins)) {
      return res.status(400).json({ message: "Valeur de coins invalide" });
    }
    if (parsedCoins < 0) {
      return res
        .status(400)
        .json({ message: "Le nombre de pieces ne peut pas etre negatif" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { coins: parsedCoins },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouve" });
    }

    return res.status(200).json({
      message: "Nombre de pieces mis a jour",
      userId: updatedUser._id,
      coins: updatedUser.coins,
    });
  } catch (error) {
    console.log("patchUserCoinsById error:", error.message);
    return res
      .status(500)
      .json({ message: "Erreur lors de la mise a jour des pieces" });
  }
};
export const updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndUpdate(userId, { role: "creator" });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouve" });
    }
    return res.status(200).json({
      message: "Nouveau créateur de contenus",
      username: user.username,
      id: user._id,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur lors de la mise a jour du role" });
  }
};

