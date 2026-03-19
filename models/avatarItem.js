import mongoose from "mongoose";

const avatarSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    itemType: {
      type: String,
      default: "avatar",
    },
    assetUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
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
      enum: ["avat_hair", "avat_outfit", "avat_eye"],
      required: true,
    },
    gender: {
      type: String,
      enum: ["homme", "femmes", "unisex"],
      required: true,
    },
  },
  { timestamps: true },
);
export default mongoose.model("Avatar", avatarSchema);
