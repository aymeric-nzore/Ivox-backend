import "dotenv/config";
import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import uploadVideoRoutes from "./routes/videoRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import { registerUserSocket } from "./sockets/userSocket.js";
import { registerChatSocket } from "./sockets/chatSocket.js";
import { registerItemSocket } from "./sockets/itemSocket.js";
import { registerVideoSocket } from "./sockets/videoSocket.js";
connectDB();
const app = express();
app.use(cors());
app.use(express.json());

//ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/video", uploadVideoRoutes);
app.use("/api/item", itemRoutes);

//IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  registerUserSocket(io, socket);
  registerChatSocket(io, socket);
  registerItemSocket(io, socket);
  registerVideoSocket(io, socket);
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started");
});
