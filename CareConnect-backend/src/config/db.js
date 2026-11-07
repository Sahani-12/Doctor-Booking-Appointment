const mongoose = require("mongoose");

const connectDB = async (uri) => {
  if (!uri) throw new Error("MONGO_URI missing");
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");

    // Ensure all doctor documents in MongoDB have role="doctor"
    try {
      const Doctor = require("../models/Doctor");
      const result = await Doctor.updateMany(
        {
          $or: [
            { role: { $exists: false } },
            { role: null },
            { role: "" },
            { role: { $ne: "doctor" } },
          ],
        },
        { $set: { role: "doctor" } },
      );
      if (result.modifiedCount > 0) {
        console.log(
          `✅ Fixed ${result.modifiedCount} doctor records with missing role="doctor"`,
        );
      }
    } catch (migErr) {
      console.warn("Doctor role sync warning:", migErr.message);
    }
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

module.exports = connectDB;
