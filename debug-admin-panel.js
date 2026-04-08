#!/usr/bin/env node

/**
 * Admin Panel Debugging Script
 * Checks all components and helps identify the issue
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

async function main() {
  console.log("\n\n🔧 ADMIN PANEL DEBUGGING SCRIPT\n");
  console.log("═".repeat(70) + "\n");

  // Check 1: Backend connectivity
  console.log("check #1: Testing Backend Connection");
  console.log("─".repeat(70));
  try {
    const testRes = await makeRequest("GET", "/api/health");
    console.log(
      "✅ Backend is running on https://doctor-booking-appointment-i137.onrender.com",
    );
    console.log("   Status:", testRes.statusCode);
  } catch (err) {
    console.log("❌ Backend is NOT running!");
    console.log("   Error:", err.message);
    console.log("\n🚀 SOLUTION:");
    console.log("   1. Open a new terminal");
    console.log("   2. cd CareConnect-backend");
    console.log("   3. npm start");
    console.log("   4. Wait for 'Server running on port 3001'");
    console.log("   5. Then come back to admin panel\n");
    process.exit(1);
  }

  // Check 2: Admin Login
  console.log("\n\nCheck #2: Testing Admin Login");
  console.log("─".repeat(70));
  try {
    const loginRes = await makeRequest("POST", "/api/auth/admin-login", {
      email: "admin@careconnect.com",
      password: "admin123",
    });

    if (loginRes.statusCode !== 200) {
      console.log("❌ Login failed with status:", loginRes.statusCode);
      console.log("   Response:", loginRes.data);
      process.exit(1);
    }

    if (!loginRes.data.data?.token) {
      console.log("❌ No token received from login");
      console.log("   Response:", loginRes.data);
      process.exit(1);
    }

    const token = loginRes.data.data.token;
    console.log("✅ Admin login successful");
    console.log("   Token received:", token.substring(0, 30) + "...");

    // Check 3: Fetch Users
    console.log("\n\nCheck #3: Testing Users API");
    console.log("─".repeat(70));
    const usersRes = await makeRequest("GET", "/api/admin/users", null, token);

    if (usersRes.statusCode !== 200) {
      console.log("❌ Users API failed with status:", usersRes.statusCode);
      console.log("   Response:", usersRes.data);
      process.exit(1);
    }

    const users = usersRes.data.data || [];
    console.log("✅ Users API working");
    console.log(`   Users found: ${users.length}`);

    if (users.length > 0) {
      console.log(
        "   Sample user:",
        users[0].fullname,
        "(" + users[0].email + ")",
      );
    }

    // Check 4: Fetch Doctors
    console.log("\n\nCheck #4: Testing Doctors API");
    console.log("─".repeat(70));
    const doctorsRes = await makeRequest(
      "GET",
      "/api/admin/doctors",
      null,
      token,
    );

    if (doctorsRes.statusCode !== 200) {
      console.log("❌ Doctors API failed with status:", doctorsRes.statusCode);
      console.log("   Response:", doctorsRes.data);
      process.exit(1);
    }

    const doctors = doctorsRes.data.data || [];
    console.log("✅ Doctors API working");
    console.log(`   Doctors found: ${doctors.length}`);

    // Check 5: Recommendations
    console.log("\n\n✅ ALL SYSTEMS OPERATIONAL!\n");
    console.log("═".repeat(70));
    console.log("\n📋 NEXT STEPS:\n");

    if (users.length === 0 && doctors.length === 0) {
      console.log("   Your database is empty. This is normal.\n");
      console.log("   💡 OPTIONS:");
      console.log("      a) Register new users/doctors");
      console.log("      b) Use User/Doctor frontends to create accounts");
      console.log("      c) They'll appear in admin panel automatically\n");
    }

    console.log("   To view data in Admin Panel:");
    console.log("   1. Open http://localhost:5178");
    console.log("   2. Login with: admin@careconnect.com / admin123");
    console.log("   3. Go to Users/Doctors page");
    console.log("   4. Click refresh if needed\n");

    console.log("═".repeat(70));

    // Check browser console debugging
    console.log("\n📱 IF DATA STILL NOT SHOWING IN ADMIN PANEL:\n");
    console.log("   1. Open admin panel: http://localhost:5178");
    console.log("   2. Press F12 to open Developer Tools");
    console.log("   3. Go to Console tab");
    console.log("   4. Look for error messages");
    console.log("   5. Share the errors\n");

    console.log("═".repeat(70) + "\n");
  } catch (error) {
    console.log("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
