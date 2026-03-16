import "dotenv/config";
import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import uploadVideoRoutes from "./routes/videoRoutes.js";
import uploadSongRoutes from "./routes/songRoutes.js";
connectDB();
const app = express();
app.use(cors());
app.use(express.json());

//ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/video", uploadVideoRoutes);
app.use("/api/song", uploadSongRoutes);

//IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
app.listen(process.env.PORT || 3000, function () {
  console.log("Server started");
});
