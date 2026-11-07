require("dotenv").config();
const mongoose = require("mongoose");
console.log("Starting...");

const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoURI) {
  console.error("❌ Set MONGO_URI in .env file before running this script.");
  process.exit(1);
}

(async () => {
  try {
    console.log("Connecting to MongoDB...");
    const conn = await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });

    console.log("Connected!");

    // Check admin exists
    const User = mongoose.model("User", {
      email: String,
      role: String,
      password: String,
    });
    const admin = await User.collection.findOne({
      email: "admin@careconnect.com",
    });
    console.log("Admin user:", admin ? "EXISTS" : "NOT FOUND");

    process.exit(0);
  } catch (e) {
    console.log("Error:", e.message);
    process.exit(1);
  }
})();
