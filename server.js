import "dotenv/config";
import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import uploadVideoRoutes from "./routes/videoRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import levelRoutes from "./routes/levelRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import registerSocketHandlers from "./sockets/registerSocketHandlers.js";
import { initFirebaseAdmin } from "./config/firebaseAdmin.js";
connectDB();
const app = express();
app.use(cors());
app.use(express.json());

// Health checks for uptime monitors
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "backend" });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "backend" });
});

//ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/video", uploadVideoRoutes);
app.use("/api/shopItem", itemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/levels", levelRoutes);
app.use("/api/messages", messageRoutes);
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
server.listen(PORT, function () {
  const firebaseReady = initFirebaseAdmin();
  console.log(`Server started on port ${PORT}`);
  if (!firebaseReady) {
    console.log(
      "Push notifications hors-app desactivees: Firebase Admin non configure.",
    );
  }
});
