import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  chatRoomId: {
    type: String,
    required: true,
    index: true,
  },
  messageId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enums: ["sent", "delivered", "read"],
    default: "sent",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

messageSchema.index({ chatRoomId: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, status: -1 });

export default mongoose.model("Message", messageSchema);
