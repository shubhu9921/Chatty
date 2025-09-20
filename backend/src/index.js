// backend/src/index.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { connectDB } from "./lib/db.js";
import apiRoutes from "./routes/api.route.js";

dotenv.config();

const app = express();
const __dirname = path.resolve();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://chatty-eight-gray.vercel.app" // ✅ your deployed frontend
];

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api", apiRoutes);

// ✅ Serve frontend in production
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// ✅ Connect DB (important for API routes)
connectDB();

// ❌ Do NOT call server.listen() in Vercel
// Instead, just export the Express app
export default app;
