import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  uploadShopItem,
  buyShopItem,
  getAllItems,
  getOneItem,
  deleteShopItem,
} from "../controllers/ItemController.js";
import { uploadItemMiddleware } from "../middlewares/itemMiddleware.js";

const router = express.Router();

//POST
router.post(
  "/upload",
  authMiddleware,
  uploadItemMiddleware.single("file"),
  uploadShopItem,
);
router.post("/:id/buy", authMiddleware, buyShopItem);
//GET
router.get("/", getAllItems);
router.get("/:id", getOneItem);
//DELETE
router.delete("/:id", deleteShopItem);
export default router;
