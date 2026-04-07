const mongoose = require("mongoose");

const connectDB = async (uri) => {
  if (!uri) throw new Error("MONGO_URI missing");
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

module.exports = connectDB;
