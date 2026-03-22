import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getChatUsersHandler,
  getMessagesWithUserHandler,
  markMessageAsReadHandler,
  sendMessageHandler,
} from "../controllers/messageController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/users", getChatUsersHandler);
router.get("/:withUserId", getMessagesWithUserHandler);
router.post("/", sendMessageHandler);
router.patch("/:messageId/read", markMessageAsReadHandler);

export default router;
