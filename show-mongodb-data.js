#!/usr/bin/env node

/**
 * MongoDB Data Viewer
 * Shows all data currently in your MongoDB database
 */

const http = require("http");

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3001,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function printHeader(title) {
  console.log("\n" + "═".repeat(70));
  console.log("  " + title);
  console.log("═".repeat(70));
}

function printObject(obj, indent = 2) {
  const indentStr = " ".repeat(indent);
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      console.log(indentStr + key + ":");
      printObject(value, indent + 2);
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        console.log(indentStr + key + ": []");
      } else if (typeof value[0] === "object") {
        console.log(indentStr + key + ":");
        value.forEach((item, idx) => {
          console.log(indentStr + "  [" + idx + "]:");
          printObject(item, indent + 4);
        });
      } else {
        console.log(indentStr + key + ": [" + value.join(", ") + "]");
      }
    } else {
      console.log(indentStr + key + ": " + String(value));
    }
  });
}

async function main() {
  console.log("\n\n");
  console.log(
    "  ╔════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "  ║      📊 MONGODB DATABASE - COMPLETE DATA VIEW                 ║",
  );
  console.log(
    "  ║      All data currently in your CareConnect Database          ║",
  );
  console.log(
    "  ╚════════════════════════════════════════════════════════════════╝",
  );

  try {
    // Step 1: Login
    console.log("\n🔐 Authenticating...");
    const loginRes = await makeRequest("POST", "/api/auth/admin-login", {
      email: "admin@careconnect.com",
      password: "admin123",
    });

    if (!loginRes.data.data?.token) {
      console.log("❌ Login failed");
      process.exit(1);
    }

    const token = loginRes.data.data.token;
    console.log("✅ Authentication successful\n");

    // Step 2: Fetch Users
    printHeader("👥 USERS COLLECTION");
    const usersRes = await makeRequest("GET", "/api/admin/users", null, token);

    if (usersRes.data.data && usersRes.data.data.length > 0) {
      console.log(`\n📊 Total Users: ${usersRes.data.data.length}\n`);

      usersRes.data.data.forEach((user, idx) => {
        console.log(`  User #${idx + 1}:`);
        console.log("  " + "─".repeat(65));
        printObject(user, 4);
        console.log("");
      });

      // Calculate stats
      const verified = usersRes.data.data.filter((u) => u.isVerified).length;
      const unverified = usersRes.data.data.filter((u) => !u.isVerified).length;

      console.log("  " + "─".repeat(65));
      console.log(`  📈 Statistics:`);
      console.log(`     • Total Users: ${usersRes.data.data.length}`);
      console.log(`     • Verified ✓: ${verified}`);
      console.log(`     • Pending ⏳: ${unverified}`);
    } else {
      console.log("\n   ℹ️  No users found in database\n");
    }

    // Step 3: Fetch Doctors
    printHeader("👨‍⚕️  DOCTORS COLLECTION");
    const doctorsRes = await makeRequest(
      "GET",
      "/api/admin/doctors",
      null,
      token,
    );

    if (doctorsRes.data.data && doctorsRes.data.data.length > 0) {
      console.log(`\n📊 Total Doctors: ${doctorsRes.data.data.length}\n`);

      doctorsRes.data.data.forEach((doctor, idx) => {
        console.log(`  Doctor #${idx + 1}:`);
        console.log("  " + "─".repeat(65));
        printObject(doctor, 4);
        console.log("");
      });

      // Calculate stats
      const approved = doctorsRes.data.data.filter((d) => d.isApproved).length;
      const pending = doctorsRes.data.data.filter((d) => !d.isApproved).length;

      console.log("  " + "─".repeat(65));
      console.log(`  📈 Statistics:`);
      console.log(`     • Total Doctors: ${doctorsRes.data.data.length}`);
      console.log(`     • Approved ✓: ${approved}`);
      console.log(`     • Pending ⏳: ${pending}`);
    } else {
      console.log("\n   ℹ️  No doctors found in database\n");
    }

    // Summary
    printHeader("📊 DATABASE SUMMARY");
    console.log("");
    console.log(`  Collections:`);
    console.log(
      `  ├─ Users:       ${usersRes.data.data?.length || 0} documents`,
    );
    console.log(
      `  ├─ Doctors:     ${doctorsRes.data.data?.length || 0} documents`,
    );
    console.log(`  └─ Others:      (Appointments, Transactions, etc.)`);
    console.log("");
    console.log(`  Database:     MongoDB Atlas (careconnect collection)`);
    console.log(`  Backend:      http://localhost:3001 ✓`);
    console.log(`  Admin Panel:  http://localhost:5178`);
    console.log("");

    console.log("═".repeat(70));
    console.log("  ✅ All data shown above is currently in your MongoDB\n");
    console.log("═".repeat(70));
  } catch (error) {
    console.log("❌ Error:", error.message);
    console.log("\nTroubleshooting:");
    console.log("  1. Is backend running? (npm start in CareConnect-backend)");
    console.log("  2. Is MongoDB connected?");
    console.log("  3. Run: node show-mongodb-data.js");
    process.exit(1);
  }
}

main();
