import User from "../models/user";
const onlineUsers = new Map();

export default function userSocket(io) {
  io.on("connection", (socket) => {
    socket.on("user_connected", async (userId) => {
      onlineUsers.set(userId, socket.id);
      await User.findByIdAndUpdate(userId, { status: "online" });
      io.emit("user_status_update", {
        userId,
        status: "online",
      });
    });
    socket.on("disconnection", async () => {
      let disconnectUser;
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectUser = userId;
          break;
        }
      }
      if (disconnectUser) {
        onlineUsers.delete(disconnectUser);
        await User.findByIdAndUpdate(disconnectUser, {
          status: "offline",
          lastSeen: Date.now(),
        });
        io.emit("user_status_update", {
          disconnectUser,
          status: "offline",
        });
      }
    });
  });
}
export { onlineUsers };
