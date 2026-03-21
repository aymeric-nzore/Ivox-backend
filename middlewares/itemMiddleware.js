import multer from "multer";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync("uploads/items", { recursive: true });
    cb(null, "uploads/items");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const ALLOWED_TYPES_BY_ITEM = {
  song: ["audio/mpeg", "audio/ogg", "audio/wav", "audio/aac"],
  animation: ["application/json", "image/gif", "video/mp4", "video/webm"],
  avatar: ["image/jpeg", "image/png", "image/webp"],
};

const normalizeType = (value) =>
  typeof value === "string" ? value.toLowerCase() : "";

const itemFilter = (req, file, cb) => {
  const type = normalizeType(
    req.body?.itemType ||
      req.query?.itemType ||
      req.body?.type ||
      req.query?.type ||
      req.params?.itemType ||
      req.headers["x-item-type"],
  );
  const allowedTypes = ALLOWED_TYPES_BY_ITEM[type];

  if (!allowedTypes) {
    return cb(new Error("Type d'item invalide"));
  }

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error(`Format de fichier non supporté pour ${type}`));
  }

  return cb(null, true);
};

export const uploadItemMiddleware = multer({
  storage,
  fileFilter: itemFilter,
});
