import { onlineUsers } from "./userSocket.js";
import {
  sendMessage,
  markAsDelivered,
  markAsRead,
  getChatMessages,
} from "../controllers/messageController.js";
import { getRoomId } from "../utils/chatHelper.js";

export const registerChatSocket = (io, socket) => {
  socket.on("chat_join_room", ({ sender, receiver }) => {
    if (!sender || !receiver) {
      return;
    }

    const roomId = getRoomId(sender.toString(), receiver.toString());
    socket.join(roomId);
  });

  socket.on("chat_get_messages", async ({ chatRoomId }, callback) => {
    try {
      if (!chatRoomId) {
        throw new Error("chatRoomId requis");
      }

      const messages = await getChatMessages(chatRoomId);
      if (typeof callback === "function") {
        callback({ success: true, messages });
      }
    } catch (error) {
      if (typeof callback === "function") {
        callback({ success: false, message: error.message });
      }
    }
  });

  socket.on("chat_send_message", async (payload, callback) => {
    try {
      const newMessage = await sendMessage(payload);
      const roomId = getRoomId(
        newMessage.sender.toString(),
        newMessage.receiver.toString(),
      );

      io.to(roomId).emit("chat_new_message", newMessage);

      const receiverSocketId = onlineUsers.get(newMessage.receiver.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("chat_message_received", newMessage);
      }

      if (typeof callback === "function") {
        callback({ success: true, message: newMessage });
      }
    } catch (error) {
      if (typeof callback === "function") {
        callback({ success: false, message: error.message });
      }
    }
  });

  socket.on("chat_mark_delivered", async ({ messageId }, callback) => {
    try {
      const updatedMessage = await markAsDelivered(messageId);
      io.emit("chat_message_delivered", updatedMessage);
      if (typeof callback === "function") {
        callback({ success: true, message: updatedMessage });
      }
    } catch (error) {
      if (typeof callback === "function") {
        callback({ success: false, message: error.message });
      }
    }
  });

  socket.on("chat_mark_read", async ({ messageId }, callback) => {
    try {
      const updatedMessage = await markAsRead(messageId);
      io.emit("chat_message_read", updatedMessage);
      if (typeof callback === "function") {
        callback({ success: true, message: updatedMessage });
      }
    } catch (error) {
      if (typeof callback === "function") {
        callback({ success: false, message: error.message });
      }
    }
  });
};
