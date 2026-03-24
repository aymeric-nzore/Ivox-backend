import cloudinary from "../config/cloudinary.js";
import User from "../models/user.js";
import Song from "../models/song.js";
import Animation from "../models/animation.js";
import Avatar from "../models/avatarItem.js";
import { emitGlobalEvent, emitUserEvent } from "../utils/socketEmitter.js";
import { sendPushToAllUsers } from "../services/pushNotificationService.js";

//Ajouter un item
export const uploadShopItem = async (req, res) => {
  const {
    title,
    description,
    duration,
    price,
    itemType,
    categorie,
    gender,
    format,
  } = req.body;
  try {
    const type = itemType || req.query.itemType || req.body.type;
    if (!type || !["song", "animation", "avatar"].includes(type)) {
      return res.status(400).json({ message: "itemType invalide" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Fichier requis" });
    }
    let ressourceType = "auto";
    let folder = "Shop";
    if (type === "song") {
      ressourceType = "video";
      folder = "Shop/Songs";
    } else if (type === "animation") {
      ressourceType = "auto";
      folder = "Shop/Animations";
    } else if (type === "avatar") {
      ressourceType = "image";
      folder = "Shop/Avatars";
    }
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: ressourceType,
      folder,
    });

    let item;
    if (type === "song") {
      item = await Song.create({
        title,
        description,
        duration,
        assetUrl: result.secure_url,
        publicId: result.public_id,
        price,
        categorie,
      });
    } else if (type === "animation") {
      item = await Animation.create({
        title,
        duration,
        assetUrl: result.secure_url,
        publicId: result.public_id,
        price,
        categorie,
        format,
      });
    } else {
      item = await Avatar.create({
        title,
        assetUrl: result.secure_url,
        publicId: result.public_id,
        price,
        categorie,
        gender,
      });
    }

    emitGlobalEvent(req, "item_created", {
      message: "Nouvel item ajouté à la boutique",
      item,
    });

    if (type === "song") {
      sendPushToAllUsers({
        title: "Nouvelle musique disponible",
        body: item.title,
        data: {
          type: "shop_item_created",
          itemType: "song",
          itemId: item._id,
          title: item.title,
        },
      }).catch(() => {});
    }

    return res.status(201).json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//recup tout les item
export const getAllItems = async (req, res) => {
  try {
    const type = req.query.itemType || req.query.type;

    if (!type || !["song", "animation", "avatar"].includes(type)) {
      return res.status(400).json({ message: "Type d'item invalide" });
    }

    let model;
    if (type === "song") {
      model = Song;
    } else if (type === "animation") {
      model = Animation;
    } else {
      model = Avatar;
    }

    const items = await model.find().sort({ createdAt: -1 });
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//Recup one item
export const getOneItem = async (req, res) => {
  try {
    const type = req.query.itemType || req.query.type;

    if (!type || !["song", "animation", "avatar"].includes(type)) {
      return res.status(400).json({ message: "Type d'item invalide" });
    }

    let model;
    if (type === "song") {
      model = Song;
    } else if (type === "animation") {
      model = Animation;
    } else {
      model = Avatar;
    }

    const item = await model.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item non trouvé" });
    }

    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//Supp l'item
export const deleteShopItem = async (req, res) => {
  try {
    const type =
      req.query.itemType ||
      req.body?.itemType ||
      req.query.type ||
      req.body?.type;

    if (!type || !["song", "animation", "avatar"].includes(type)) {
      return res.status(400).json({ message: "Type d'item invalide" });
    }

    let model;
    let resourceType = "auto";

    if (type === "song") {
      model = Song;
      resourceType = "video";
    } else if (type === "animation") {
      model = Animation;
      resourceType = "auto";
    } else {
      model = Avatar;
      resourceType = "image";
    }

    const item = await model.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item non trouvé" });
    }
    //Suppr dans cloudinary
    await cloudinary.uploader.destroy(item.publicId, {
      resource_type: resourceType,
    });
    //Suppr dans mongoDb
    await item.deleteOne();
    res.json({ message: "Item supprimé avec succès" });
    //Notifications
    emitGlobalEvent(req, "item_deleted", {
      message: "Item supprimé de la boutique",
      item,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//Acheter un item
export const buyShopItem = async (req, res) => {
  try {
    const { type } = req.body;
    const userId = req.user.id;
    const itemId = req.params.id;

    // Validation du type
    const validTypes = ["song", "animation", "avatar"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "Type d'item invalide" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    //On vérifie si l'user a deja l'item
    if (user.ownedItems.find((i) => i.itemId.toString() === itemId)) {
      return res.status(400).json({ message: "Item déjà acheté" });
    }
    let item;
    if (type === "song") {
      item = await Song.findById(itemId);
    } else if (type === "animation") {
      item = await Animation.findById(itemId);
    } else if (type === "avatar") {
      item = await Avatar.findById(itemId);
    }

    if (!item) {
      return res.status(404).json({ message: "Item non trouvé" });
    }

    if (user.coins < item.price) {
      return res.status(400).json({ message: "Pas assez de pièces" });
    }
    //Achat
    user.coins -= item.price;
    //Ajout à l'inventaire ( owned Items)
    user.ownedItems.push({
      itemName: item.title,
      itemId: item._id,
      type,
    });
    //MAJ du nombre d'achat
    item.buyCount += 1;
    await user.save();
    await item.save();

    emitUserEvent(req, userId, "item_bought", {
      message: "Item achete",
      item,
      type,
    });

    return res.status(200).json({ message: "Achat réussi", user, item });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Équiper une animation comme splash screen
export const equipAnimation = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { animationId } = req.body;

    if (!animationId) {
      return res.status(400).json({ message: "animationId requis" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier que l'utilisateur possède l'animation
    const ownsAnimation = user.ownedItems.some(
      (item) => item.itemId.toString() === animationId && item.type === "animation"
    );

    if (!ownsAnimation) {
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
    return res.status(500).json({ message: error.message });
  }
};

// Récupérer l'animation équipée
export const getActiveSplashAnimation = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

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
    return res.status(500).json({ message: error.message });
  }
};

// Récupérer les animations possédées par l'utilisateur
export const getUserOwnedAnimations = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Récupérer les IDs des animations possédées
    const animationIds = user.ownedItems
      .filter((item) => item.type === "animation")
      .map((item) => item.itemId);

    // Charger les animations
    const animations = await Animation.find({ _id: { $in: animationIds } });

    const result = animations.map((anim) => ({
      id: anim._id,
      title: anim.title,
      assetUrl: anim.assetUrl,
      duration: anim.duration,
      format: anim.format,
      price: anim.price,
      isActive: String(user.activeSplashAnimation) === String(anim._id),
    }));

    return res.status(200).json({
      total: result.length,
      animations: result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
