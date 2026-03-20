import express from "express";
import { uploadVideoMiddleware } from "../middlewares/uploadVideoMiddleware.js";
import {
  uploadVideo,
  getAllVideos,
  getOneVideo,
  likeVideo,
  playVideo,
  deleteVideo,
} from "../controllers/VideoController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { creatorMiddleware } from "../middlewares/creatorMiddleware.js";
const router = express.Router();

//POST
router.post(
  "/upload",
  authMiddleware,
  creatorMiddleware,
  uploadVideoMiddleware.single("video"),
  uploadVideo,
);
router.post("/:id/like", authMiddleware, likeVideo);
router.post("/:id/play", authMiddleware, playVideo);
//GET
router.get("/", getAllVideos);
router.get("/:id", getOneVideo);
//DELETE
router.delete("/:id", authMiddleware, creatorMiddleware, deleteVideo);
export default router;
