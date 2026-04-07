const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/careconnect";

const userSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  password: String,
  role: String,
  phone: String,
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date,
});

const User = mongoose.model("User", userSchema);

async function seedAdminUser() {
  try {
    // MongoDB से connect करें
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected");

    // Check करें admin already exists या नहीं
    const existingAdmin = await User.findOne({
      email: "admin@careconnect.com",
      role: "admin",
    });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!");
      console.log("📧 Email: admin@careconnect.com");
      console.log("🔑 Password: admin123");
      await mongoose.connection.close();
      return;
    }

    // Password को hash करें
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    // New admin user create करें
    const adminUser = new User({
      fullname: "Admin User",
      email: "admin@careconnect.com",
      password: hashedPassword,
      role: "admin",
      phone: "9999999999",
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await adminUser.save();

    console.log("✅ Admin user created successfully!");
    console.log("");
    console.log("🔐 Admin Credentials:");
    console.log("📧 Email:    admin@careconnect.com");
    console.log("🔑 Password: admin123");
    console.log("");
    console.log("Login करें: http://localhost:5173/login");

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

seedAdminUser();
