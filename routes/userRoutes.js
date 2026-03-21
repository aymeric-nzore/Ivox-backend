import express from "express";
import {
  getAllUsers,
  getOneUser,
  patchUserCoinsById,
  updateUserRole,
} from "../controllers/userController.js";
import { deleteAccount } from "../controllers/authController.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = express.Router();

//PATCH
router.patch("/:id/coins", adminMiddleware, patchUserCoinsById);
router.patch("/:id/updateRole", adminMiddleware, updateUserRole);
//GET
router.get("/", adminMiddleware, getAllUsers);
router.get("/:id", adminMiddleware, getOneUser);

//DELETE
router.delete("/:id", adminMiddleware, deleteAccount);

export default router;
