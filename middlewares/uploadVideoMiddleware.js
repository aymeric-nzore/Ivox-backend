import multer from "multer";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/video");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const videoFilter = (req, file, cb) => {
  const allowedTypes = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-matroska",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format video non supporte"));
  }
};
export const uploadVideoMiddleware = multer({
  storage,
  fileFilter: videoFilter,
});
