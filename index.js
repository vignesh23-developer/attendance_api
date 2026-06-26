import express from "express";
import authRoutes from "./routes/routes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();


app.use(express.json());


app.get("/", (req, res) => {
  res.send("Attendance API Running");
});


app.use("/auth", authRoutes);



const PORT = process.env.PORT || 3001;

// Global error handler for multer and other errors
app.use((err, req, res, next) => {
  // File size limit exceeded
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "Image size exceeds the maximum limit of 1 MB",
      max_file_size: "1 MB",
    });
  }

  // Invalid file format
  if (
    err.message &&
    err.message.includes("Only JPG")
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Only JPG, JPEG and PNG images are allowed. Maximum file size: 1 MB.",
      allowed_formats: ["jpg", "jpeg", "png"],
      max_file_size: "1 MB",
    });
  }

  // Generic error
  return res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// IMPORTANT: bind to 0.0.0.0 for Caddy / external access
app.listen(PORT, "0.0.0.0", () => {
  console.log("ENV PORT:", process.env.PORT);
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});