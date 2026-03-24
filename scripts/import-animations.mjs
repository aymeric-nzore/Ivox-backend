import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import Animation from "../models/animation.js";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

// Configurer Cloudinary après dotenv.config()
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

console.log("✅ Cloudinary configuré:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.API_KEY?.slice(0, 5) + "...",
});

const ANIMATIONS_FOLDER = "C:\\Users\\ACER\\Downloads\\Animations";
const CATEGORY = "ani_splash"; // animations de démarrage
const PRICE = 0; // gratuit par défaut, tu peux changer

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connecté");
  } catch (error) {
    console.error("❌ Erreur connexion MongoDB:", error.message);
    process.exit(1);
  }
}

function extractDuration(jsonData) {
  try {
    const data = JSON.parse(jsonData);
    const framerate = data.fr || 24; // défaut 24 fps
    const totalFrames = data.op || 1; // défaut 1 frame
    const durationMs = Math.round((totalFrames / framerate) * 1000);
    return durationMs;
  } catch (error) {
    console.error("Erreur parsing JSON:", error.message);
    return 1000; // défaut 1 seconde
  }
}

async function uploadToCloudinary(filePath, fileName) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw", // upload raw JSON file
      folder: "ivox_animations",
      public_id: fileName.replace(".json", ""),
      tags: ["animation", "splash"],
    });
    return {
      assetUrl: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error(`❌ Erreur upload Cloudinary (${fileName}):`, error.message);
    throw error;
  }
}

async function importAnimations() {
  try {
    console.log("🚀 Démarrage import animations...\n");

    // Lire les fichiers du dossier
    const files = fs.readdirSync(ANIMATIONS_FOLDER).filter((file) =>
      file.endsWith(".json")
    );

    if (files.length === 0) {
      console.log("❌ Aucun fichier JSON trouvé dans le dossier");
      return;
    }

    console.log(`📁 Trouvé ${files.length} fichiers JSON\n`);

    for (const file of files) {
      try {
        const filePath = path.join(ANIMATIONS_FOLDER, file);
        const fileName = path.basename(file);
        const title = fileName.replace(".json", "");

        console.log(`\n📤 Import: ${fileName}`);

        // Lire le fichier JSON
        const jsonData = fs.readFileSync(filePath, "utf-8");
        const duration = extractDuration(jsonData);

        console.log(`   ⏱️  Durée calculée: ${duration}ms`);

        // Upload à Cloudinary
        console.log(`   ☁️  Upload vers Cloudinary...`);
        const { assetUrl, publicId } = await uploadToCloudinary(
          filePath,
          fileName
        );

        console.log(`   ✅ Cloudinary OK - publicId: ${publicId}`);

        // Créer le document Animation
        const animation = new Animation({
          title,
          itemType: "animation",
          assetUrl,
          publicId,
          duration,
          price: PRICE,
          categorie: CATEGORY,
          format: "lottie",
        });

        await animation.save();
        console.log(`   💾 Animation sauvegardée en BD - ID: ${animation._id}`);
      } catch (error) {
        console.error(`   ❌ Erreur traitement ${file}:`, error.message);
        continue;
      }
    }

    console.log("\n✨ Import terminé!");
  } catch (error) {
    console.error("❌ Erreur générale:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connexion MongoDB fermée");
    process.exit(0);
  }
}

// Exécuter
connectDB().then(() => importAnimations());
