import multer from "multer";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/audio");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const songFilter = (req, file, cb) => {
  const allowedTypes = [
    "audio/mpeg", // mp3
    "audio/ogg",
    "audio/wav",
    "audio/aac",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format audio non supporte"));
  }
};
export const uploadSongMiddleware = multer({
  storage,
  fileFilter: songFilter,
});
