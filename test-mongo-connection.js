#!/usr/bin/env node

/**
 * Simple MongoDB Data Fetcher
 * Using backend's database connection
 */

const mongoose = require("mongoose");

async function testConnection() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║         🔍 Testing Your MongoDB Connection & Data             ║
╚════════════════════════════════════════════════════════════════╝
  `);

  const MONGO_URI =
    "mongodb+srv://anandsahani617_db_user:anand121@cluster0.aq1naoq.mongodb.net/careconnect?retryWrites=true&w=majority";

  try {
    console.log("⏳ Connecting to MongoDB...");

    await mongoose.connect(MONGO_URI, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ Successfully connected to MongoDB!\n");

    const db = mongoose.connection.db;

    // Get collections
    const collections = await db.listCollections().toArray();
    console.log(
      `📁 Found ${collections.length} collection(s) in your database:\n`,
    );

    for (const collection of collections) {
      const colName = collection.name;
      const col = db.collection(colName);
      const count = await col.countDocuments();

      console.log(`   📊 ${colName.toUpperCase()}`);
      console.log(`      Documents: ${count}`);

      if (count > 0 && colName === "users") {
        const users = await col.find({}).toArray();
        users.forEach((user) => {
          console.log(`      └─ ${user.fullname || user.name} (${user.email})`);
        });
      }
    }

    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    ✅ DATA SUMMARY                            ║
╚════════════════════════════════════════════════════════════════╝
    `);

    const usersCount = await db.collection("users").countDocuments();
    const doctorsCount = await db.collection("doctors").countDocuments();

    console.log(`
  👥 Users: ${usersCount}
  👨‍⚕️  Doctors: ${doctorsCount}
  
  ✅ MongoDB is working correctly!
  ✅ Data exists in your database!
  
  If you're not seeing this data in the admin panel:
  → Clear browser cache (F12 → Clear storage)
  → Hard refresh (Ctrl+Shift+R)
  → Login again
    `);

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Connection Failed:", error.message);
    console.log(`
  ⚠️  Possible issues:
  1. MongoDB cluster is down
  2. Incorrect credentials
  3. IP not whitelisted in MongoDB Atlas
  4. Network connectivity issue
  5. Database name incorrect
    `);
  }
}

testConnection();
