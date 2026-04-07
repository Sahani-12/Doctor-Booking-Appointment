#!/usr/bin/env node

/**
 * Direct MongoDB Connection Test
 * Connect to your MongoDB and fetch all data
 */

const mongoose = require("mongoose");

const MONGO_URI =
  "mongodb+srv://anandsahani617_db_user:anand121@cluster0.aq1naoq.mongodb.net/careconnect?retryWrites=true&w=majority";

console.log(`
╔════════════════════════════════════════════════════════════════╗
║           🔗 CONNECTING TO YOUR MONGODB DIRECTLY              ║
║          Fetching data from your Atlas database               ║
╚════════════════════════════════════════════════════════════════╝
`);

async function connectAndFetchData() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    console.log(`   URL: ${MONGO_URI.substring(0, 50)}...`);

    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB!\n");

    // Get database
    const db = mongoose.connection.db;

    // List all collections
    console.log("📁 Collections in database:");
    const collections = await db.listCollections().toArray();
    console.log(`   Total collections: ${collections.length}\n`);

    // Fetch from each collection
    for (const collection of collections) {
      const collName = collection.name;
      console.log(`\n📊 Collection: "${collName}"`);
      console.log("─".repeat(60));

      const col = db.collection(collName);
      const count = await col.countDocuments();
      console.log(`   Total documents: ${count}`);

      if (count > 0) {
        const docs = await col.find().limit(10).toArray();
        console.log(
          `   \n   Showing first ${Math.min(10, docs.length)} document(s):\n`,
        );

        docs.forEach((doc, idx) => {
          console.log(`   Document ${idx + 1}:`);
          console.log(`   ${JSON.stringify(doc, null, 2)}`);
          console.log();
        });
      } else {
        console.log(`   ⚠️  No documents in this collection`);
      }
    }

    // Special check for users collection
    console.log(`\n${"═".repeat(60)}`);
    console.log("👥 USERS COLLECTION - DETAILED VIEW");
    console.log("═".repeat(60));

    const usersCol = db.collection("users");
    const userCount = await usersCol.countDocuments();

    if (userCount > 0) {
      const users = await usersCol.find().toArray();
      console.log(`\nTotal Users: ${userCount}`);
      users.forEach((user, idx) => {
        console.log(`\n${idx + 1}. User`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Name: ${user.fullname || user.name || "N/A"}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Phone: ${user.phone || "N/A"}`);
        console.log(`   Verified: ${user.isVerified ? "✅ Yes" : "❌ No"}`);
        console.log(`   Role: ${user.role || "user"}`);
        console.log(`   Created: ${user.createdAt || "N/A"}`);
      });
    } else {
      console.log("\n❌ No users found in database!");
    }

    // Special check for doctors collection
    console.log(`\n${"═".repeat(60)}`);
    console.log("👨‍⚕️  DOCTORS COLLECTION - DETAILED VIEW");
    console.log("═".repeat(60));

    const doctorsCol = db.collection("doctors");
    const doctorCount = await doctorsCol.countDocuments();

    if (doctorCount > 0) {
      const doctors = await doctorsCol.find().toArray();
      console.log(`\nTotal Doctors: ${doctorCount}`);
      doctors.forEach((doctor, idx) => {
        console.log(`\n${idx + 1}. Doctor`);
        console.log(`   ID: ${doctor._id}`);
        console.log(`   Name: ${doctor.fullname || doctor.name || "N/A"}`);
        console.log(`   Email: ${doctor.email}`);
        console.log(`   Specialization: ${doctor.specialization || "N/A"}`);
        console.log(`   Approved: ${doctor.isApproved ? "✅ Yes" : "❌ No"}`);
      });
    } else {
      console.log(
        "\n✅ No doctors found (Normal - ready for new registrations)",
      );
    }

    printSummary(userCount, doctorCount);
  } catch (err) {
    console.error("❌ Connection Error:", err.message);
    console.error("\n🔧 Troubleshooting:");
    console.error("   1. Check MongoDB URL is correct");
    console.error("   2. Check internet connection");
    console.error("   3. Check MongoDB security whitelist (IP address)");
    console.error("   4. Check MongoDB cluster is running");
  } finally {
    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
  }
}

function printSummary(userCount, doctorCount) {
  console.log(`\n${"═".repeat(60)}`);
  console.log("📊 SUMMARY");
  console.log("═".repeat(60));
  console.log(`
  Total Users in Database:   ${userCount}
  Total Doctors in Database: ${doctorCount}
  
  This is what SHOULD appear in your Admin Panel:
  • Users Page:  Should show ${userCount} user${userCount !== 1 ? "s" : ""}
  • Doctors Page: Should show ${doctorCount} doctor${doctorCount !== 1 ? "s" : ""}
  
  If Admin Panel is NOT showing this data, the issue is:
  ❌ Frontend rendering problem (not backend/database)
  
  Solutions:
  1. Hard refresh browser (Ctrl+Shift+R)
  2. Clear localStorage (F12 → Application → Clear storage)
  3. Login again
  4. Data should appear!
  `);
}

connectAndFetchData();
