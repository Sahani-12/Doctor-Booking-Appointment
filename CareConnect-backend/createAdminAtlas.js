const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Use MongoDB Atlas connection
const MONGODB_URI =
  "mongodb+srv://anandsahani617_db_user:anand121@cluster0.aq1naoq.mongodb.net/careconnect?retryWrites=true&w=majority";

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

async function createAdminInAtlas() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");

    // Delete existing admin if any
    await User.deleteOne({ email: "admin@careconnect.com" });
    console.log("🧹 Cleared old admin user if existed");

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);
    console.log("🔒 Password hashed");

    // Create new admin
    const admin = new User({
      fullname: "Admin User",
      email: "admin@careconnect.com",
      password: hashedPassword,
      role: "admin",
      phone: "9999999999",
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await admin.save();
    console.log("✅ Admin user created in MongoDB Atlas!");
    console.log("");
    console.log("🔐 Login Credentials:");
    console.log("📧 Email:    admin@careconnect.com");
    console.log("🔑 Password: admin123");
    console.log("");

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createAdminInAtlas();
