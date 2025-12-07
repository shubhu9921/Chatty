// backend/routes/api.route.js
import express from "express";
import { checkAuth, login, logout, signup, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

// ==================== AUTH ROUTES ====================
// Signup, Login, Logout
router.post("/auth/signup", signup);
router.post("/auth/login", login);
router.post("/auth/logout", logout);

// Profile update (protected)
router.put("/auth/update-profile", protectRoute, updateProfile);

// Check authentication (protected)
router.get("/auth/check", protectRoute, checkAuth);

// ==================== MESSAGE ROUTES ====================
// Get all users for sidebar (protected)
router.get("/users", protectRoute, getUsersForSidebar);

// Get messages with specific user (protected)
router.get("/messages/:id", protectRoute, getMessages);

// Send a message to a specific user (protected)
router.post("/messages/send/:id", protectRoute, sendMessage);

export default router;
