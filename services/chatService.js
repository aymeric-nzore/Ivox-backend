import mongoose from "mongoose";
import Message from "../models/message.js";
import { getRoomId } from "../utils/chatHelper.js";
export const createMessage = async (messageData) => {
  try {
    const message = new Message({
      chatRoomId: messageData.roomId,
      messageId: messageData.messageId,
      sender: messageData.sender,
      receiver: messageData.receiver,
      message: messageData.message,
      status: messageData.status || "sent",
    });
    await message.save();
    return message;
  } catch (error) {
    throw error;
  }
};
export const fetchChatMessages = async ({
  currentUserId,
  senderId,
  receiverId,
  page = 1,
  limit = 20,
}) => {
  const chatRoomId = getRoomId(senderId, receiverId);
  const query = { chatRoomId: roomId };
  try {
    if (currentUserId === receiverId) {
      const undelieryQuery = {
        chatRoomId: roomId,
        receiver: mongoose.Types.ObjectId(currentUserId),
        status: "sent",
      };
      const undeliveryUpdate = await Message.updateMany(undelieryQuery, {
        $set: { status: "delivered" },
      });
    }
  } catch (error) {}
};
