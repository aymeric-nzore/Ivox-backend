import mongoose from "mongoose";
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI manquant");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("Connexion réussie");
  } catch (e) {
    console.log("Erreur connexion MongoDB:", e.message);
    process.exit(1);
  }
};

export default connectDB;
