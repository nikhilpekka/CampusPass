const mongoose = require("mongoose");

/**
 * Connects to MongoDB using MONGODB_URI from the environment.
 * The app intentionally fails fast if the connection is not available -
 * for a real database-backed project we want to know immediately
 * instead of silently running against nothing.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("MONGODB_URI is not set. Copy backend/.env.example to backend/.env and fill it in.");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
