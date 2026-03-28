import {
  getChatMessages,
  markAsRead,
  sendMessage,
} from "../controllers/messageController.js";
import { getRoomId } from "../utils/chatHelper.js";
import User from "../models/user.js";
import {
  emitToUser,
  emitMessageEvents,
  emitPresence,
  emitReadEvents,
  emitTypingEvents,
  joinUserChannels,
} from "../services/notificationService.js";

const onlineUsers = new Map();

const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    socket.on("user_join", async ({ userId } = {}) => {
      if (!userId) {
        socket.emit("chat_error", { message: "userId est requis" });
        return;
      }

      const uid = userId.toString();
      socket.userId = uid;
      joinUserChannels(socket, uid);
      onlineUsers.set(uid, socket.id);

      try {
        await User.findByIdAndUpdate(uid, {
          status: "online",
          lastSeen: new Date(),
        });
      } catch (_error) {
      }

      emitPresence(io, {
        userId: uid,
        status: "online",
        lastSeen: new Date().toISOString(),
      });
    });

    socket.on("chat_join", ({ withUserId } = {}) => {
      if (!withUserId) {
        return;
      }
      if (!socket.userId) {
        socket.emit("chat_error", { message: "Tu dois faire user_join d'abord" });
        return;
      }

      const roomId = getRoomId(socket.userId, withUserId.toString());
      socket.join(roomId);
    });

    socket.on("chat_history", async ({ withUserId } = {}) => {
      if (!withUserId) {
        socket.emit("chat_error", { message: "withUserId est requis" });
        return;
      }

      if (!socket.userId) {
        socket.emit("chat_error", { message: "Tu dois faire user_join d'abord" });
        return;
      }

      const roomId = getRoomId(socket.userId, withUserId.toString());
      try {
        const messages = await getChatMessages(roomId);
        socket.emit("chat_history", { roomId, messages });
      } catch (error) {
        socket.emit("chat_error", { message: error.message });
      }
    });

    socket.on("message_send", async (payload = {}) => {
      const { receiver, message } = payload;

      if (!receiver || !message) {
        socket.emit("message_error", {
          message: "receiver et message sont requis",
        });
        return;
      }

      if (!socket.userId) {
        socket.emit("message_error", {
          message: "Tu dois faire user_join d'abord",
        });
        return;
      }

      try {
        const created = await sendMessage({
          sender: socket.userId,
          receiver,
          message,
        });
        emitMessageEvents(io, created.toObject ? created.toObject() : created);
      } catch (error) {
        socket.emit("message_error", { message: error.message });
      }
    });

    socket.on("message_read", async ({ messageId, senderId } = {}) => {
      if (!messageId) {
        socket.emit("message_error", { message: "messageId est requis" });
        return;
      }

      try {
        const updated = await markAsRead(messageId);
        if (!updated) {
          socket.emit("message_error", { message: "Message introuvable" });
          return;
        }

        if (!socket.userId) {
          socket.emit("message_error", {
            message: "Tu dois faire user_join d'abord",
          });
          return;
        }

        emitReadEvents(
          io,
          updated.toObject ? updated.toObject() : updated,
          socket.userId,
        );
      } catch (error) {
        socket.emit("message_error", { message: error.message });
      }
    });

    socket.on("typing_start", ({ toUserId } = {}) => {
      if (!socket.userId || !toUserId) {
        return;
      }

      emitTypingEvents(io, toUserId, socket.userId, true);
    });

    socket.on("typing_stop", ({ toUserId } = {}) => {
      if (!socket.userId || !toUserId) {
        return;
      }

      emitTypingEvents(io, toUserId, socket.userId, false);
    });

    socket.on("call_invite", ({ toUserId, callId, callerName } = {}) => {
      if (!socket.userId || !toUserId || !callId) {
        socket.emit("call_error", {
          message: "toUserId et callId sont requis",
        });
        return;
      }

      emitToUser(io, toUserId, "call_invite", {
        callId: callId.toString(),
        fromUserId: socket.userId,
        callerName: (callerName || "Utilisateur").toString(),
        createdAt: new Date().toISOString(),
      });
    });

    socket.on("call_accept", ({ toUserId, callId } = {}) => {
      if (!socket.userId || !toUserId || !callId) {
        return;
      }

      emitToUser(io, toUserId, "call_accept", {
        callId: callId.toString(),
        fromUserId: socket.userId,
        createdAt: new Date().toISOString(),
      });
    });

    socket.on("call_reject", ({ toUserId, callId } = {}) => {
      if (!socket.userId || !toUserId || !callId) {
        return;
      }

      emitToUser(io, toUserId, "call_reject", {
        callId: callId.toString(),
        fromUserId: socket.userId,
        createdAt: new Date().toISOString(),
      });
    });

    socket.on("call_end", ({ toUserId, callId } = {}) => {
      if (!socket.userId || !toUserId || !callId) {
        return;
      }

      emitToUser(io, toUserId, "call_end", {
        callId: callId.toString(),
        fromUserId: socket.userId,
        createdAt: new Date().toISOString(),
      });
    });

    socket.on("webrtc_offer", ({ toUserId, callId, sdp } = {}) => {
      if (!socket.userId || !toUserId || !callId || !sdp) {
        return;
      }

      emitToUser(io, toUserId, "webrtc_offer", {
        callId: callId.toString(),
        fromUserId: socket.userId,
        sdp,
      });
    });

    socket.on("webrtc_answer", ({ toUserId, callId, sdp } = {}) => {
      if (!socket.userId || !toUserId || !callId || !sdp) {
        return;
      }

      emitToUser(io, toUserId, "webrtc_answer", {
        callId: callId.toString(),
        fromUserId: socket.userId,
        sdp,
      });
    });

    socket.on("webrtc_ice", ({ toUserId, callId, candidate } = {}) => {
      if (!socket.userId || !toUserId || !callId || !candidate) {
        return;
      }

      emitToUser(io, toUserId, "webrtc_ice", {
        callId: callId.toString(),
        fromUserId: socket.userId,
        candidate,
      });
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);

        const offlineAt = new Date();
        User.findByIdAndUpdate(socket.userId, {
          status: "offline",
          lastSeen: offlineAt,
        }).catch(() => {});

        emitPresence(io, {
          userId: socket.userId,
          status: "offline",
          lastSeen: offlineAt.toISOString(),
        });
      }
    });
  });
};

export default registerSocketHandlers;
