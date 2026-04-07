#!/usr/bin/env node

/**
 * Migration: Ensure all Doctors have role="doctor"
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Doctor = require("./src/models/Doctor");

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ MONGO_URI not set in .env");
  process.exit(1);
}

async function migrate() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB\n");

    // Find all doctors without role or with null role
    console.log("🔍 Finding doctors without role...");
    const doctorsWithoutRole = await Doctor.find({
      $or: [{ role: { $exists: false } }, { role: null }, { role: "" }],
    });

    console.log(
      `   Found: ${doctorsWithoutRole.length} doctors without role\n`,
    );

    if (doctorsWithoutRole.length === 0) {
      console.log("✅ All doctors already have role set");
    } else {
      // Update all doctors to have role="doctor"
      const result = await Doctor.updateMany(
        {
          $or: [{ role: { $exists: false } }, { role: null }, { role: "" }],
        },
        { $set: { role: "doctor" } },
      );

      console.log("✅ Migration completed!");
      console.log(`   Updated: ${result.modifiedCount} doctors\n`);
    }

    // Verify
    console.log("📋 Verifying all doctors have role...");
    const allDoctors = await Doctor.countDocuments();
    const doctorsWithRole = await Doctor.countDocuments({ role: "doctor" });

    console.log(`   Total doctors: ${allDoctors}`);
    console.log(`   Doctors with role='doctor': ${doctorsWithRole}`);

    if (allDoctors === doctorsWithRole) {
      console.log("\n✅ All doctors have role='doctor' set!\n");
      console.log("🚀 Doctors should now be able to see their appointments!");
    } else {
      console.log(
        `\n⚠️  WARNING: ${allDoctors - doctorsWithRole} doctors still missing role`,
      );
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

migrate();
