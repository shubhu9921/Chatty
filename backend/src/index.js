// backend/src/index.js
import { app, server } from "./lib/socket.js";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { connectDB } from "./lib/db.js";
import apiRoutes from "./routes/api.route.js";

dotenv.config();

const __dirname = path.resolve();

// CORS for frontend dev + deployed frontend
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  "http://127.0.0.1:5173",
  "http://localhost:5174", // Verify port 5174
  "http://localhost:5175", // Verify port 5175
  "https://chatty-eight-gray.vercel.app", // deployed frontend
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Body parser & cookie parser
app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api", apiRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));

  // Serve index.html for any other route
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});

export default app;
