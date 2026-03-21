import "dotenv/config";
import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import uploadVideoRoutes from "./routes/videoRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import registerSocketHandlers from "./sockets/registerSocketHandlers.js";

const app = express();
app.use(cors());
app.use(express.json());

//ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/video", uploadVideoRoutes);
app.use("/api/shopItem", itemRoutes);

//IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("io", io);
registerSocketHandlers(io);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, function () {
    console.log(`Server started on port ${PORT}`);
  });
};

startServer();
