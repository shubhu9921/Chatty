import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

/**
 * Middleware to protect routes.
 * Sets req.user if token exists; otherwise sets null.
 */
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      req.user = null;
      return next();
    }

    const user = await User.findById(decoded.userId).select("-password");
    req.user = user || null;

    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message);
    req.user = null;
    next();
  }
};
