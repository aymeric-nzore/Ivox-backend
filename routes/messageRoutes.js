import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getChatUsersHandler,
  getMessagesWithUserHandler,
  markMessageAsReadHandler,
  reportMessageHandler,
  sendMessageHandler,
} from "../controllers/messageController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/users", getChatUsersHandler);
router.get("/:withUserId", getMessagesWithUserHandler);
router.post("/", sendMessageHandler);
router.patch("/:messageId/read", markMessageAsReadHandler);
router.post("/:messageId/report", reportMessageHandler);

export default router;
