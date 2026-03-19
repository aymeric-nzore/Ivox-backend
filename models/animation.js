import mongoose from "mongoose";

const animationschema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    itemType: {
      type: String,
      default: "animation",
    },
    assetUrl: {
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
    categorie: {
      type: String,
      enum: ["ani_splash", "ani_quizz", "ani_achat"],
      required: true,
    },
    format: {
      type: String,
    }, // gif / lottie
  },
  { timestamps: true },
);
export default mongoose.model("Animation", animationschema);
