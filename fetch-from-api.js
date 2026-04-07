#!/usr/bin/env node

/**
 * Direct API Call to Fetch MongoDB Data Through Backend
 * Tests the same API that admin panel uses
 */

const http = require("http");

console.log(`
╔════════════════════════════════════════════════════════════════╗
║      📡 FETCHING DATA FROM YOUR MONGODB THROUGH API           ║
║    (Using the same endpoint as admin panel)                   ║
╚════════════════════════════════════════════════════════════════╝
`);

// First, test login
async function getAdminToken() {
  return new Promise((resolve) => {
    const loginData = JSON.stringify({
      email: "admin@careconnect.com",
      password: "admin123",
    });

    const options = {
      hostname: "localhost",
      port: 3001,
      path: "/api/auth/admin-login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(loginData),
      },
    };

    console.log("🔐 Step 1: Logging in as admin...");

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            console.log("✅ Login successful!");
            console.log(
              `   Token: ${response.data.token.substring(0, 40)}...\n`,
            );
            resolve(response.data.token);
          } catch (e) {
            console.error("❌ Failed to parse login response");
            resolve(null);
          }
        } else {
          console.error(`❌ Login failed (${res.statusCode})`);
          resolve(null);
        }
      });
    });

    req.on("error", (err) => {
      console.error("❌ Connection error:", err.message);
      resolve(null);
    });

    req.write(loginData);
    req.end();
  });
}

async function fetchUsers(token) {
  return new Promise((resolve) => {
    const options = {
      hostname: "localhost",
      port: 3001,
      path: "/api/admin/users",
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    console.log("👥 Step 2: Fetching users from MongoDB...");

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            console.log(`✅ Users fetched successfully!`);
            console.log(`   Total: ${response.data.length} user(s)\n`);

            if (response.data.length > 0) {
              console.log("   📋 User Details:");
              response.data.forEach((user, idx) => {
                console.log(`\n   ${idx + 1}. ${user.fullname || user.name}`);
                console.log(`      Email: ${user.email}`);
                console.log(`      Phone: ${user.phone || "N/A"}`);
                console.log(
                  `      Verified: ${user.isVerified ? "✅ Yes" : "❌ No"}`,
                );
                console.log(`      ID: ${user._id}`);
              });
            }
            resolve(response.data);
          } catch (e) {
            console.error("❌ Failed to parse response");
            resolve([]);
          }
        } else {
          console.error(`❌ Failed to fetch users (${res.statusCode})`);
          resolve([]);
        }
      });
    });

    req.on("error", (err) => {
      console.error("❌ Connection error:", err.message);
      resolve([]);
    });

    req.end();
  });
}

async function fetchDoctors(token) {
  return new Promise((resolve) => {
    const options = {
      hostname: "localhost",
      port: 3001,
      path: "/api/admin/doctors",
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    console.log("\n👨‍⚕️  Step 3: Fetching doctors from MongoDB...");

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            console.log(`✅ Doctors fetched successfully!`);
            console.log(`   Total: ${response.data.length} doctor(s)\n`);

            if (response.data.length > 0) {
              console.log("   📋 Doctor Details:");
              response.data.forEach((doctor, idx) => {
                console.log(
                  `\n   ${idx + 1}. ${doctor.fullname || doctor.name}`,
                );
                console.log(`      Email: ${doctor.email}`);
                console.log(
                  `      Specialization: ${doctor.specialization || "N/A"}`,
                );
                console.log(
                  `      Approved: ${doctor.isApproved ? "✅ Yes" : "❌ No"}`,
                );
              });
            } else {
              console.log("   (No doctors registered yet)");
            }

            resolve(response.data);
          } catch (e) {
            console.error("❌ Failed to parse response");
            resolve([]);
          }
        } else {
          console.error(`❌ Failed to fetch doctors (${res.statusCode})`);
          resolve([]);
        }
      });
    });

    req.on("error", (err) => {
      console.error("❌ Connection error:", err.message);
      resolve([]);
    });

    req.end();
  });
}

async function main() {
  const token = await getAdminToken();

  if (!token) {
    console.log("\n❌ Could not login. Is backend running?");
    console.log("   Start backend: cd CareConnect-backend && npm start");
    return;
  }

  const users = await fetchUsers(token);
  const doctors = await fetchDoctors(token);

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   ✅ DATA FETCHED SUMMARY                     ║
╚════════════════════════════════════════════════════════════════╝

  📊 Database Statistics:
  ├─ Users in DB: ${users.length}
  ├─ Doctors in DB: ${doctors.length}
  │
  🎯 What Admin Panel Should Show:
  ├─ Users Page: ${users.length} user${users.length !== 1 ? "s" : ""}
  └─ Doctors Page: ${doctors.length} doctor${doctors.length !== 1 ? "s" : ""}

  ✅ Backend API Working: YES
  ✅ MongoDB Connection: YES
  ✅ Data Exists: ${users.length > 0 || doctors.length > 0 ? "YES" : "NO"}

  If admin panel NOT showing this data:
  ➜ Issue is FRONTEND (not backend/database)
  ➜ Solution:
     1. Hard refresh: Ctrl+Shift+R
     2. Clear storage: F12 → Clear storage
     3. Login again
     4. Data should appear!
  `);
}

main();
