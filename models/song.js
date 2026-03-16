import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    audioUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    buyCount: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Song", songSchema);
