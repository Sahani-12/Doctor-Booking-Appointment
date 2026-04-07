const mongoose = require("mongoose");
console.log("Starting...");

(async () => {
  try {
    console.log("Connecting to Atlas...");
    const conn = await mongoose.connect(
      "mongodb+srv://anandsahani617_db_user:anand121@cluster0.aq1naoq.mongodb.net/careconnect?retryWrites=true&w=majority",
      { serverSelectionTimeoutMS: 5000 },
    );

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
