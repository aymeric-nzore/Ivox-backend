import Animation from "../models/animation.js";
import User from "../models/user.js";

// GET /api/animations/splash - Récupérer toutes les animations de démarrage
export const getSplashAnimations = async (req, res) => {
  try {
    const animations = await Animation.find({ categorie: "ani_splash" }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      total: animations.length,
      animations: animations.map((anim) => ({
        id: anim._id,
        title: anim.title,
        assetUrl: anim.assetUrl,
        duration: anim.duration,
        format: anim.format,
        price: anim.price,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur récupération animations splash",
      detail: error.message,
    });
  }
};

// GET /api/animations/:id - Détails d'une animation
export const getAnimationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.length !== 24) {
      return res.status(400).json({ message: "ID animation invalide" });
    }

    const animation = await Animation.findById(id);

    if (!animation) {
      return res.status(404).json({ message: "Animation non trouvée" });
    }

    return res.status(200).json({
      id: animation._id,
      title: animation.title,
      assetUrl: animation.assetUrl,
      duration: animation.duration,
      format: animation.format,
      price: animation.price,
      categorie: animation.categorie,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur récupération détails animation",
      detail: error.message,
    });
  }
};

// POST /api/animations/buy/:id - Acheter une animation
export const buyAnimation = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id: animationId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    if (!animationId || animationId.length !== 24) {
      return res.status(400).json({ message: "ID animation invalide" });
    }

    // Récupérer l'animation
    const animation = await Animation.findById(animationId);
    if (!animation) {
      return res.status(404).json({ message: "Animation non trouvée" });
    }

    // Récupérer l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier si déjà possédée
    const alreadyOwned = user.ownedAnimations?.some(
      (id) => String(id) === String(animationId)
    );
    if (alreadyOwned) {
      return res
        .status(400)
        .json({ message: "Vous possédez déjà cette animation" });
    }

    // Vérifier les coins
    if (user.coins < animation.price) {
      return res.status(400).json({
        message: "Coins insuffisant",
        required: animation.price,
        available: user.coins,
      });
    }

    // Déduire les coins et ajouter l'animation
    user.coins -= animation.price;
    user.ownedAnimations.push(animationId);

    await user.save();

    return res.status(200).json({
      message: "Animation achetée avec succès",
      coinsRemaining: user.coins,
      totalOwned: user.ownedAnimations.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur achat animation",
      detail: error.message,
    });
  }
};

// POST /api/animations/equip/:id - Équiper une animation
export const equipAnimation = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id: animationId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    if (!animationId || animationId.length !== 24) {
      return res.status(400).json({ message: "ID animation invalide" });
    }

    // Récupérer l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier que l'animation existe
    const animation = await Animation.findById(animationId);
    if (!animation) {
      return res.status(404).json({ message: "Animation non trouvée" });
    }

    // Vérifier que l'utilisateur possède l'animation (ou que c'est gratuit / défaut)
    const owns = user.ownedAnimations?.some(
      (id) => String(id) === String(animationId)
    );

    if (!owns && animation.price > 0) {
      return res
        .status(403)
        .json({ message: "Vous ne possédez pas cette animation" });
    }

    // Équiper l'animation
    user.activeSplashAnimation = animationId;
    await user.save();

    return res.status(200).json({
      message: "Animation équipée avec succès",
      activeSplashAnimation: animationId,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur équipement animation",
      detail: error.message,
    });
  }
};

// GET /api/user/splash-animation - Récupérer l'animation équipée
export const getActiveSplashAnimation = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const user = await User.findById(userId).populate("activeSplashAnimation");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const animation = user.activeSplashAnimation;

    if (!animation) {
      return res.status(200).json({
        message: "Aucune animation équipée",
        animation: null,
      });
    }

    return res.status(200).json({
      id: animation._id,
      title: animation.title,
      assetUrl: animation.assetUrl,
      duration: animation.duration,
      format: animation.format,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur récupération animation équipée",
      detail: error.message,
    });
  }
};

// GET /api/user/animations - Liste des animations possédées
export const getUserAnimations = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const user = await User.findById(userId).populate("ownedAnimations");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const animations = (user.ownedAnimations || []).map((anim) => ({
      id: anim._id,
      title: anim.title,
      assetUrl: anim.assetUrl,
      duration: anim.duration,
      format: anim.format,
      price: anim.price,
      isActive: String(user.activeSplashAnimation) === String(anim._id),
    }));

    return res.status(200).json({
      total: animations.length,
      animations,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur récupération animations utilisateur",
      detail: error.message,
    });
  }
};
