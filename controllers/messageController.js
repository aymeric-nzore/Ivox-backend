import Message from "../models/message.js";
import { getRoomId } from "../utils/chatHelper.js";
import { v4 as uuidv4 } from "uuid";
//Envoyé message
export const sendMessage = async ({ sender, receiver, message }) => {
  if (!sender || !receiver || !message) {
    throw new Error("sender, receiver et message sont requis");
  }

  const chatRoomId = getRoomId(sender.toString(), receiver.toString());

  try {
    const newMessage = await Message.create({
      chatRoomId,
      messageId: uuidv4(),
      sender,
      receiver,
      message,
    });
    return newMessage;
  } catch (error) {
    throw error;
  }
};
//Marqué comme delivré
export const markAsDelivered = async (messageId) => {
  try {
    const updatedMessage = await Message.findOneAndUpdate(
      { messageId },
      { status: "delivered" },
      { new: true },
    );
    return updatedMessage;
  } catch (error) {
    throw error;
  }
};
//Marqué comme lu
export const markAsRead = async (messageId) => {
  try {
    const updatedMessage = await Message.findOneAndUpdate(
      { messageId },
      { status: "read" },
      { new: true },
    );
    return updatedMessage;
  } catch (error) {
    throw error;
  }
};
//Charger les messages
export const getChatMessages = async (chatRoomId) => {
  try {
    const messages = await Message.find({ chatRoomId }).sort({ createdAt: -1 });
    return messages;
  } catch (e) {
    throw e;
  }
};
