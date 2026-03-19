import User from "../models/user.js";

const onlineUsers = new Map();

export const registerUserSocket = (io, socket) => {
  socket.on("user_connected", async (userId) => {
    if (!userId) {
      return;
    }

    onlineUsers.set(userId.toString(), socket.id);

    try {
      await User.findByIdAndUpdate(userId, { status: "online" });
    } catch (_error) {
      // No-op: socket status still updated in-memory.
    }

    io.emit("user_status_update", {
      userId,
      status: "online",
      socketId: socket.id,
    });
  });

  socket.on("disconnect", async () => {
    let disconnectedUserId;

    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        break;
      }
    }

    if (!disconnectedUserId) {
      return;
    }

    onlineUsers.delete(disconnectedUserId);

    try {
      await User.findByIdAndUpdate(disconnectedUserId, {
        status: "offline",
        lastSeen: Date.now(),
      });
    } catch (_error) {
      // No-op: socket status still updated in-memory.
    }

    io.emit("user_status_update", {
      userId: disconnectedUserId,
      status: "offline",
    });
  });
};

export { onlineUsers };
