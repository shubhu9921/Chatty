import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

/**
 * Signup Controller
 */
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

    const newUser = await User.create({ fullName, email, password: hashedPassword });

    generateToken(newUser._id, res);

    return res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic || null,
    });
  } catch (error) {
    console.error("❌ Error in signup:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Login Controller
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id, res);

    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic || null,
    });
  } catch (error) {
    console.error("❌ Error in login:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Logout Controller
 */
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("❌ Error in logout:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Update Profile Controller
 */
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user?._id;

    if (!profilePic || !userId)
      return res.status(400).json({ message: "Missing required data" });

    const uploadResult = await cloudinary.uploader.upload(profilePic, {
      folder: "chat-app-profile-pics",
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResult.secure_url },
      { new: true }
    );

    return res.status(200).json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
    });
  } catch (error) {
    console.error("❌ Error in updateProfile:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Check Auth Controller
 */
export const checkAuth = (req, res) => {
  try {
    return res.status(200).json(req.user || null);
  } catch (error) {
    console.error("❌ Error in checkAuth:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
