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
  authMiddleware,
  uploadItem,
  uploadShopItem,
);
router.post("/:id/buy", authMiddleware, buyShopItem);
//GET
router.get("/", getAllItems);
router.get("/:id", getOneItem);
//DELETE
router.delete("/:id", deleteShopItem);
export default router;
