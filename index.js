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

// IMPORTANT: bind to 0.0.0.0 for Caddy / external access
app.listen(PORT, "0.0.0.0", () => {
  console.log("ENV PORT:", process.env.PORT);
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});