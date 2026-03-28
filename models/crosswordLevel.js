import mongoose from "mongoose";

const wordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  row: { type: Number, required: true },
  col: { type: Number, required: true },
  direction: {
    type: String,
    enum: ["accross", "down"],
    required: true,
  },
});

const crosswordLevelSchema = new mongoose.Schema(
  {
    numero: {
      type: Number,
      required: true,
      unique: true,
    },
    gridSize: {
      rows: Number,
      cols: Number,
    },
    timeLimit: Number,
    xpReward: Number,
    coinsReward: Number,
    words : [wordSchema]
  },
  { timestamps: true },
);

export default mongoose.model("Level", crosswordLevelSchema);
