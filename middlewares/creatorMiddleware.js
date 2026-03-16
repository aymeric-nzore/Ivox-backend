import User from "../models/user.js";

export const creatorMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifie" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouve" });
    }
    if (user.role !== "creator") {
      return res.status(403).json({ message: "Acces reserve aux createurs de contenus" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
