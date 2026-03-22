import express from "express";
import {
  getAllUsers,
  getLeaderboard,
  getOneUser,
  patchUserCoinsById,
  updateUserRole,
} from "../controllers/userController.js";
import { deleteAccount } from "../controllers/authController.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

//PATCH
router.patch("/:id/coins", adminMiddleware, patchUserCoinsById);
router.patch("/:id/updateRole", adminMiddleware, updateUserRole);
//GET
router.get("/leaderboard", authMiddleware, getLeaderboard);
router.get("/", adminMiddleware, getAllUsers);
router.get("/:id", adminMiddleware, getOneUser);

//DELETE
router.delete("/:id", adminMiddleware, deleteAccount);

export default router;
