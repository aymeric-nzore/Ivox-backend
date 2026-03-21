import multer from "multer";
import fs from "fs";
import path from "path";

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
  song: [
    "audio/mpeg",
    "audio/mp3",
    "audio/ogg",
    "audio/wav",
    "audio/x-wav",
    "audio/vnd.wave",
    "audio/wave",
    "audio/aac",
  ],
  animation: ["application/json", "image/gif", "video/mp4", "video/webm"],
  avatar: ["image/jpeg", "image/png", "image/webp"],
};

const ALLOWED_EXT_BY_ITEM = {
  song: [".mp3", ".ogg", ".wav", ".aac"],
  animation: [".json", ".gif", ".mp4", ".webm"],
  avatar: [".jpg", ".jpeg", ".png", ".webp"],
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

  const ext = path.extname(file.originalname || "").toLowerCase();
  const allowedExtensions = ALLOWED_EXT_BY_ITEM[type] || [];
  const mimetypeOk = allowedTypes.includes(file.mimetype);
  const extensionOk = allowedExtensions.includes(ext);

  if (!mimetypeOk && !extensionOk) {
    return cb(new Error(`Format de fichier non supporté pour ${type}`));
  }

  return cb(null, true);
};

export const uploadItemMiddleware = multer({
  storage,
  fileFilter: itemFilter,
});
