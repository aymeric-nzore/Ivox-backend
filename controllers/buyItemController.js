import User from "../models/user.js";
import Song from "../models/song.js";
import Animation from "../models/animation.js";
import Avatar from "../models/avatarItem.js";

export const buyShopItem = async (req, res) => {
  try {
    const { type } = req.body;
    const userId = req.user.id;
    const itemId = req.params.id;

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
      itemId: item._id,
      type,
    });
    //MAJ du nombre d'achat
    item.buyCount += 1;
    await user.save();
    await item.save();
    return res.json({ message: "Achat de réussi", user, item });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
