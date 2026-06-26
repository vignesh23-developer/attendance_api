import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, and PNG  images are allowed. Maximum file size: 1MB."));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // 1 MB
  },
  fileFilter,
});

export default upload;