import "dotenv/config";
import express from "express";
import multer from "multer";
import cors from "cors";
import chatRoutes from "./src/routes/chatRoutes.js";
import fileRoutes from "./src/routes/fileRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

app.use(express.json({ limit: "5mb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "AI Study Assistant backend is running.",
  });
});

// Chat API routes
app.use("/api/chat", chatRoutes);

// File handling routes
app.use("/api/files", fileRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found.",
  });
});

// Turn upload/body errors into JSON the frontend can display
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: "A file is larger than 10 MB.",
      LIMIT_FILE_COUNT: "Too many files (max 5 at a time).",
      LIMIT_UNEXPECTED_FILE: "Too many files (max 5 at a time).",
    };
    return res
      .status(400)
      .json({ error: messages[err.code] || "File upload failed." });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Request is too large." });
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
