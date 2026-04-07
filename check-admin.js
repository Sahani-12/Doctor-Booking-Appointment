const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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

async function checkAdmin() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected");

    // Find admin
    const admin = await User.findOne({ email: "admin@careconnect.com" });

    if (!admin) {
      console.log("❌ Admin user does NOT exist in database");
      console.log("\nCreating admin now...");

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      const newAdmin = new User({
        fullname: "Admin User",
        email: "admin@careconnect.com",
        password: hashedPassword,
        role: "admin",
        phone: "9999999999",
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await newAdmin.save();
      console.log("✅ Admin user created!");
    } else {
      console.log("✅ Admin user EXISTS in database");
      console.log("Fields:");
      console.log("  - Email:", admin.email);
      console.log("  - Role:", admin.role);
      console.log(
        "  - Password Hash:",
        admin.password.substring(0, 20) + "...",
      );
      console.log("  - Fullname:", admin.fullname);

      // Test password
      const isMatch = await bcrypt.compare("admin123", admin.password);
      console.log("  - Password Match:", isMatch ? "✅ YES" : "❌ NO");
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkAdmin();
