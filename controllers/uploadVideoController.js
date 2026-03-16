import cloudinary from "../config/cloudinary.js";
import Video from "../models/video.js";
//Upload
export const uploadVideo = async (req, res) => {
  const { title, description, duration, coverImage } = req.body;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Fichier vidéo requis" });
    }
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "video",
      folder: "Videos",
    });
    const video = await Video.create({
      title: title,
      description: description,
      auteur: req.user.id,
      duration: duration,
      coverImage: coverImage,
      videoUrl: result.secure_url,
      publicId: result.public_id,
    });
    return res.status(201).json(video);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//get all videos
export const getAllVideos = async (req, res) => {
  try {
    const video = await Video.find().sort({ createdAt: -1 });
    return res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//get one Video
export const getOneVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    return res.json(video);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//liké une vidéo
export const likeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video non trouvee" });
    }
    video.likes += 1;
    await video.save();
    return res.json(video);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//Jouer une vidéo
export const playVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "video not found" });
    }
    video.views += 1;
    await video.save();
    return res.json(video);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//Supp la deo
export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "video not found" });
    }
    //Suppr dans cloudinary
    await cloudinary.uploader.destroy(video.publicId, {
      resource_type: "video",
    });
    //Suppr dans mongoDb
    await video.deleteOne();
    res.json({ message: "Vidéo supprimé avec succès" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
