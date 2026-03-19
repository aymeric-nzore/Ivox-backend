import cloudinary from "../config/cloudinary.js";
import Song from "../models/song.js";
//Ajouter son
export const uploadSong = async (req, res) => {
  const { title, description, duration, price } = req.body;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Fichier audio requis" });
    }
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "video",
      folder: "Songs",
    });
    const song = await Song.create({
      title: title,
      description: description,
      duration: duration,
      assetUrl: result.secure_url,
      publicId: result.public_id,
      price: price,
    });
    //Notifications
    const io = req.app.get("io");
    io.emit("new_song", {
      message: "Nouvelle musique ajouté",
      song: song,
    });
    return res.status(201).json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//recup tout les sons
export const getAllSongs = async (req, res) => {
  try {
    const song = await Song.find().sort({ createdAt: -1 });
    return res.json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//Recup one son
export const getOneSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    return res.json(song);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//Supp le son
export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: "Son non trouve" });
    }
    //Suppr dans cloudinary
    await cloudinary.uploader.destroy(song.publicId, {
      resource_type: "video",
    });
    //Suppr dans mongoDb
    await song.deleteOne();
    res.json({ message: "Son supprimé avec succès" });
    //Notifications
    const io = req.app.get("io");
    io.emit("delete_song", {
      message: "Musique supprimée",
      song: song,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const buySong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: "song not found" });
    }
    song.buyCount += 1;
    await song.save();
    //Notifications
    const io = req.app.get("io");
    io.emit("buy_song", {
      message: "Musique achetée",
      song: song,
    });
    return res.json(song);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
