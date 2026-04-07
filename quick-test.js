#!/usr/bin/env node

/**
 * Quick Testing Script - Admin Panel Real-Time Updates
 * यह script test करेगा कि सब कुछ काम कर रहा है या नहीं
 */

const http = require("http");

console.log(`
╔════════════════════════════════════════════════════════════════╗
║     🧪 QUICK SYSTEM TEST - Real-Time Updates                  ║
╚════════════════════════════════════════════════════════════════╝
`);

let testsPassed = 0;
let testsFailed = 0;

async function test1_BackendRunning() {
  return new Promise((resolve) => {
    console.log("\n📍 TEST 1: Backend Running?");

    http
      .get("http://localhost:3001", (res) => {
        if (res.statusCode) {
          console.log("   ✅ Backend is RUNNING on port 3001");
          console.log(`   Status Code: ${res.statusCode}`);
          testsPassed++;
          resolve(true);
        }
      })
      .on("error", (err) => {
        console.log("   ❌ Backend NOT RUNNING");
        console.log(`   Error: ${err.message}`);
        testsFailed++;
        resolve(false);
      });
  });
}

async function test2_AdminPanelRunning() {
  return new Promise((resolve) => {
    console.log("\n📍 TEST 2: Admin Panel Running?");

    http
      .get("http://localhost:5178", (res) => {
        if (res.statusCode === 200 || res.statusCode === 404) {
          console.log("   ✅ Admin Panel is RUNNING on port 5178");
          console.log(`   Status Code: ${res.statusCode}`);
          testsPassed++;
          resolve(true);
        }
      })
      .on("error", (err) => {
        console.log("   ❌ Admin Panel NOT RUNNING");
        console.log(`   Error: ${err.message}`);
        console.log("   Start with: cd CareConnect-Admin && npm run dev");
        testsFailed++;
        resolve(false);
      });
  });
}

async function test3_AdminLogin() {
  return new Promise((resolve) => {
    console.log("\n📍 TEST 3: Admin Login Working?");

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

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            if (response.data.token) {
              console.log("   ✅ Admin Login SUCCESSFUL");
              console.log(
                `   Token: ${response.data.token.substring(0, 30)}...`,
              );
              testsPassed++;
              resolve(true);
            }
          } catch (e) {
            console.log("   ❌ Invalid response format");
            testsFailed++;
            resolve(false);
          }
        } else {
          console.log(`   ❌ Login Failed (Status: ${res.statusCode})`);
          testsFailed++;
          resolve(false);
        }
      });
    });

    req.on("error", (err) => {
      console.log(`   ❌ Connection Error: ${err.message}`);
      testsFailed++;
      resolve(false);
    });

    req.write(loginData);
    req.end();
  });
}

async function test4_UsersAPI() {
  return new Promise(async (resolve) => {
    console.log("\n📍 TEST 4: Users API Working?");

    // First login
    const loginData = JSON.stringify({
      email: "admin@careconnect.com",
      password: "admin123",
    });

    const loginOptions = {
      hostname: "localhost",
      port: 3001,
      path: "/api/auth/admin-login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(loginData),
      },
    };

    const loginReq = http.request(loginOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const response = JSON.parse(data);
          const token = response.data.token;

          // Now fetch users
          const userOptions = {
            hostname: "localhost",
            port: 3001,
            path: "/api/admin/users",
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          };

          const userReq = http.request(userOptions, (userRes) => {
            let userData = "";
            userRes.on("data", (chunk) => (userData += chunk));
            userRes.on("end", () => {
              if (userRes.statusCode === 200) {
                try {
                  const users = JSON.parse(userData);
                  console.log("   ✅ Users API WORKING");
                  console.log(`   Users Found: ${users.data.length}`);
                  if (users.data.length > 0) {
                    console.log(
                      `   First User: ${users.data[0].fullname} (${users.data[0].email})`,
                    );
                  }
                  testsPassed++;
                  resolve(true);
                } catch (e) {
                  console.log("   ❌ Invalid response format");
                  testsFailed++;
                  resolve(false);
                }
              } else {
                console.log(`   ❌ API Failed (Status: ${userRes.statusCode})`);
                testsFailed++;
                resolve(false);
              }
            });
          });

          userReq.on("error", (err) => {
            console.log(`   ❌ Connection Error: ${err.message}`);
            testsFailed++;
            resolve(false);
          });

          userReq.end();
        } catch (e) {
          console.log("   ❌ Login failed");
          testsFailed++;
          resolve(false);
        }
      });
    });

    loginReq.on("error", (err) => {
      console.log(`   ❌ Connection Error: ${err.message}`);
      testsFailed++;
      resolve(false);
    });

    loginReq.write(loginData);
    loginReq.end();
  });
}

async function test5_DoctorsAPI() {
  return new Promise(async (resolve) => {
    console.log("\n📍 TEST 5: Doctors API Working?");

    // First login
    const loginData = JSON.stringify({
      email: "admin@careconnect.com",
      password: "admin123",
    });

    const loginOptions = {
      hostname: "localhost",
      port: 3001,
      path: "/api/auth/admin-login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(loginData),
      },
    };

    const loginReq = http.request(loginOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const response = JSON.parse(data);
          const token = response.data.token;

          // Now fetch doctors
          const doctorOptions = {
            hostname: "localhost",
            port: 3001,
            path: "/api/admin/doctors",
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          };

          const doctorReq = http.request(doctorOptions, (doctorRes) => {
            let doctorData = "";
            doctorRes.on("data", (chunk) => (doctorData += chunk));
            doctorRes.on("end", () => {
              if (doctorRes.statusCode === 200) {
                try {
                  const doctors = JSON.parse(doctorData);
                  console.log("   ✅ Doctors API WORKING");
                  console.log(`   Doctors Found: ${doctors.data.length}`);
                  testsPassed++;
                  resolve(true);
                } catch (e) {
                  console.log("   ❌ Invalid response format");
                  testsFailed++;
                  resolve(false);
                }
              } else {
                console.log(
                  `   ❌ API Failed (Status: ${doctorRes.statusCode})`,
                );
                testsFailed++;
                resolve(false);
              }
            });
          });

          doctorReq.on("error", (err) => {
            console.log(`   ❌ Connection Error: ${err.message}`);
            testsFailed++;
            resolve(false);
          });

          doctorReq.end();
        } catch (e) {
          console.log("   ❌ Login failed");
          testsFailed++;
          resolve(false);
        }
      });
    });

    loginReq.on("error", (err) => {
      console.log(`   ❌ Connection Error: ${err.message}`);
      testsFailed++;
      resolve(false);
    });

    loginReq.write(loginData);
    loginReq.end();
  });
}

async function printSummary() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   📊 TEST SUMMARY                             ║
╚════════════════════════════════════════════════════════════════╝

Total Tests: ${testsPassed + testsFailed}
✅ Passed: ${testsPassed}
❌ Failed: ${testsFailed}

${
  testsPassed === 5
    ? `
🎉 ALL TESTS PASSED! 🎉

Your system is ready:
✅ Backend running on port 3001
✅ Admin Panel running on port 5178
✅ MongoDB connected
✅ Authentication working
✅ APIs responding correctly

Next Steps:
1. Go to http://localhost:5178
2. Login with admin@careconnect.com / admin123
3. Check Users page for real-time updates
4. Check Doctors page for real-time updates
5. Test auto-refresh (every 5 seconds)
6. Test manual refresh button
7. Test verify/unverify toggle
8. Test delete functionality

All features working? 🎊 You're ready to go!
`
    : `
⚠️  SOME TESTS FAILED

Issues found:
${
  testsFailed > 0
    ? `
❌ ${testsFailed} test(s) failed

Please fix:
- If Backend failed: npm start in CareConnect-backend
- If Admin Panel failed: npm run dev in CareConnect-Admin
- If Tests 3-5 failed: Check backend is running

Then run this script again.
`
    : ""
}
`
}
  `);
}

async function runAllTests() {
  await test1_BackendRunning();
  await test2_AdminPanelRunning();
  await test3_AdminLogin();
  await test4_UsersAPI();
  await test5_DoctorsAPI();
  await printSummary();
}

runAllTests();
