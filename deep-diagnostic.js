#!/usr/bin/env node

/**
 * Deep Diagnostic: Check exact API response format
 * Verify what the frontend receives and compare with component expectations
 */

const http = require("http");

console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║           🔬 DEEP DIAGNOSTIC: API Response Check                      ║
║          What Frontend Receives vs What Component Expects              ║
╚════════════════════════════════════════════════════════════════════════╝

This will show exactly what data the frontend GETS from the API
and verify it matches what the React components EXPECT.
`);

// Try without token first to see if it returns error
function checkWithoutToken() {
  return new Promise((resolve) => {
    console.log(`\n📍 TEST 1: GET /api/admin/users (No Token)`);
    console.log("   Expected: 401 Unauthorized");

    const req = http
      .get(
        "https://doctor-booking-appointment-i137.onrender.com/api/admin/users",
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            console.log(`   ✓ Status: ${res.statusCode}`);
            if (res.statusCode !== 200) {
              console.log(`   ✓ Response: ${data.substring(0, 100)}`);
            }
            resolve();
          });
        },
      )
      .on("error", (err) => {
        console.log(`   ✗ Error: ${err.message}`);
        resolve();
      });

    req.setTimeout(3000, () => {
      req.destroy();
      resolve();
    });
  });
}

// Check the exact API endpoint format
async function checkApiFormat() {
  console.log(`\n📍 TEST 2: API Endpoint Structure`);
  console.log(`   Backend Port: 3001`);
  console.log(
    `   API Base URL: https://doctor-booking-appointment-i137.onrender.com/api`,
  );
  console.log(`   Users Endpoint: /api/admin/users`);
  console.log(`   Doctors Endpoint: /api/admin/doctors`);
  console.log(
    `   Expected Response Format: { data: [ { _id, email, phone, verified } ] }`,
  );
}

// Check frontend env file
async function checkFrontendEnv() {
  const fs = require("fs");
  console.log(`\n📍 TEST 3: Frontend Environment Variables`);

  try {
    const envPath = "CareConnect-Admin/.env";
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      console.log(`   ✓ File exists: ${envPath}`);
      console.log(`   Content:`);
      content.split("\n").forEach((line) => {
        if (line.trim()) console.log(`      ${line}`);
      });
    } else {
      console.log(`   ✗ .env file NOT FOUND at ${envPath}`);
      console.log(`   ⚠️  This might be the issue!`);
    }
  } catch (err) {
    console.log(`   ✗ Error reading .env: ${err.message}`);
  }
}

// Check token handling
async function checkTokenHandling() {
  console.log(`\n📍 TEST 4: Token & Authentication Flow`);
  console.log(`   Expected Flow:`);
  console.log(`   1. User logs in at /login`);
  console.log(`   2. Backend returns JWT token`);
  console.log(`   3. Token stored in localStorage as 'adminToken'`);
  console.log(`   4. Token sent in Authorization header: 'Bearer <token>'`);
  console.log(`   5. Backend validates token and returns data`);

  console.log(`\n   Testing token flow:`);

  try {
    // Only try login if we can
    await new Promise((resolve) => {
      const loginData = JSON.stringify({
        email: "admin@careconnect.com",
        password: "admin123",
      });

      const options = {
        hostname: "localhost",
        port: 3001,
        path: "/api/login",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(loginData),
        },
      };

      console.log(`   → Login attempt to /api/login`);

      const req = http.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          console.log(`   ← Status: ${res.statusCode}`);

          try {
            const response = JSON.parse(data);
            if (response.token) {
              console.log(
                `   ✓ Token received: ${response.token.substring(0, 30)}...`,
              );
              console.log(`   ✓ Token format valid`);

              // Now try to get users with token
              console.log(`\n   → Testing API with Bearer token`);

              const userReq = http.get(
                "https://doctor-booking-appointment-i137.onrender.com/api/admin/users",
                {
                  headers: {
                    Authorization: `Bearer ${response.token}`,
                  },
                },
                (userRes) => {
                  let userData = "";
                  userRes.on("data", (chunk) => (userData += chunk));
                  userRes.on("end", () => {
                    console.log(`   ← Status: ${userRes.statusCode}`);
                    try {
                      const users = JSON.parse(userData);
                      console.log(
                        `   ✓ Users data: ${JSON.stringify(users).substring(0, 100)}...`,
                      );
                      console.log(`   ✓ API returning data correctly!`);
                    } catch (e) {
                      console.log(`   ⚠️  Could not parse users response`);
                    }
                    resolve();
                  });
                },
              );

              userReq.setTimeout(3000, () => {
                userReq.destroy();
                resolve();
              });
              userReq.on("error", () => resolve());
            } else {
              console.log(`   ✗ No token in response`);
              console.log(`   Response: ${data.substring(0, 100)}`);
              resolve();
            }
          } catch (e) {
            console.log(`   ✗ Could not parse login response`);
            resolve();
          }
        });
      });

      req.setTimeout(3000, () => {
        req.destroy();
        resolve();
      });
      req.on("error", () => resolve());
      req.write(loginData);
      req.end();
    });
  } catch (err) {
    console.log(`   ✗ Error: ${err.message}`);
  }
}

// Main execution
(async () => {
  await checkWithoutToken();
  await checkApiFormat();
  await checkFrontendEnv();
  await checkTokenHandling();

  printRecommendations();
})();

function printRecommendations() {
  console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║                   📋 ANALYSIS & RECOMMENDATIONS                        ║
╚════════════════════════════════════════════════════════════════════════╝

Based on the tests above, here's what to do:

1️⃣  If Admin Panel is running but showing empty data:
   → Hard Refresh: Ctrl+Shift+R
   → Clear Storage: F12 → Application → Clear storage
   → Login again

2️⃣  If you see network errors in browser console:
   → Check CORS headers in backend
   → Restart backend: npm start in CareConnect-backend

3️⃣  If token is not being sent:
   → Check localStorage has 'adminToken'
      F12 → Application → Local Storage → http://localhost:5178
   → Should see 'adminToken' key with JWT value

4️⃣  If .env is missing in frontend:
   → Create CareConnect-Admin/.env with:
      VITE_API_URL=https://doctor-booking-appointment-i137.onrender.com/api

5️⃣  If API response format is wrong:
   → Backend returns: { data: [ ... ] }
   → Frontend expects: response.data (array of users)

📌 MOST LIKELY FIXES (in order):
   a) Hard refresh (Ctrl+Shift+R)
   b) Clear storage (F12)
   c) Login again
   d) Restart admin panel (npm run dev)
   e) Restart backend (npm start)

🎯 After trying above, visit http://localhost:5178 and:
   • Look for Users page
   • Should see 1 admin user
   • If still empty, press F12 and share console errors

`);
}
