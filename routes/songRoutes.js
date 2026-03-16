import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  uploadSong,
  getAllSongs,
  getOneSong,
  deleteSong,
  buySong,
} from "../controllers/uploadSongController.js";
import { uploadSongMiddleware } from "../middlewares/uploadAudioMiddleware.js";
const router = express.Router();

//POST
router.post(
  "/upload",
  authMiddleware,
  uploadSongMiddleware.single("audio"),
  uploadSong,
);
router.post("/:id/buy", authMiddleware, buySong);
//GET
router.get("/", getAllSongs);
router.get("/:id", getOneSong);
//DELETE
router.delete("/:id", deleteSong);
export default router;
