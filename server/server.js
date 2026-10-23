import "dotenv/config";
import express from "express";
import cors from "cors";
import chatRoutes from "./src/routes/chatRoutes.js";
import documentRoutes from "./src/routes/documentRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

app.use(express.json({ limit: "200kb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "AI Study Assistant backend is running.",
  });
});

// Chat API routes
app.use("/api/chat", chatRoutes);

// Document API routes
app.use("/api/documents", documentRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found.",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
