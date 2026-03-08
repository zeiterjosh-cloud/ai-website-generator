const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL || "mongodb://localhost/jdz-builder");
    console.log("JDZ MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

module.exports = connectDB;
