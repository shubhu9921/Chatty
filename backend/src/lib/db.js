import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI; // matches your .env
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables!");
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1); // stop server if DB fails
  }
};
