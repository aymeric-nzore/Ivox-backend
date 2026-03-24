import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import {
  uploadShopItem,
  buyShopItem,
  getAllItems,
  getOneItem,
  deleteShopItem,
  equipAnimation,
  unequipAnimation,
  getActiveSplashAnimation,
  getUserOwnedAnimations,
} from "../controllers/ItemController.js";
import { uploadItemMiddleware } from "../middlewares/itemMiddleware.js";

const router = express.Router();

const uploadItem = (req, res, next) => {
  uploadItemMiddleware.single("file")(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    return next();
  });
};

//POST
router.post(
  "/upload",
  adminMiddleware,
  uploadItem,
  uploadShopItem,
);
router.post("/:id/buy", authMiddleware, buyShopItem);
router.post("/animation/equip", authMiddleware, equipAnimation);
router.post("/animation/unequip", authMiddleware, unequipAnimation);
//GET
router.get("/", getAllItems);
router.get("/:id", getOneItem);
router.get("/animation/active", authMiddleware, getActiveSplashAnimation);
router.get("/animation/owned", authMiddleware, getUserOwnedAnimations);
//DELETE
router.delete("/:id", adminMiddleware, deleteShopItem);
export default router;
