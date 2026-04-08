#!/usr/bin/env node

/**
 * Get Admin Token and Run Tests
 */

async function getAdminToken() {
  console.log("🔐 Getting admin token...\n");

  try {
    const response = await fetch(
      "https://doctor-booking-appointment-i137.onrender.com/api/auth/admin-login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@careconnect.com",
          password: "admin123",
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Login failed:", data.message || data.error);
      return null;
    }

    const token = data.data?.token;
    if (!token) {
      console.error("❌ No token in response:", data);
      return null;
    }

    console.log("✅ Token obtained successfully\n");
    return token;
  } catch (err) {
    console.error("❌ Error getting token:", err.message);
    return null;
  }
}

async function testWithToken(token) {
  if (!token) {
    console.error("❌ Cannot run tests without token");
    process.exit(1);
  }

  const BASE_URL = "https://doctor-booking-appointment-i137.onrender.com";
  const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
  };

  function log(msg, color = "reset") {
    console.log(`${colors[color]}${msg}${colors.reset}`);
  }

  let passed = 0;
  let failed = 0;

  // Test 1: Fetch Users
  try {
    const response = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data = await response.json();
      log(`✅ Fetch Users: ${data.data?.length || 0} users`, "green");
      passed++;
    } else {
      log(`❌ Fetch Users: HTTP ${response.status}`, "red");
      failed++;
    }
  } catch (err) {
    log(`❌ Fetch Users: ${err.message}`, "red");
    failed++;
  }

  // Test 2: Fetch Doctors
  try {
    const response = await fetch(`${BASE_URL}/api/admin/doctors`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data = await response.json();
      log(`✅ Fetch Doctors: ${data.data?.length || 0} doctors`, "green");
      passed++;
    } else {
      log(`❌ Fetch Doctors: HTTP ${response.status}`, "red");
      failed++;
    }
  } catch (err) {
    log(`❌ Fetch Doctors: ${err.message}`, "red");
    failed++;
  }

  // Test 3: Check User Verification Data
  try {
    const response = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        const verified = data.data.filter((u) => u.isVerified).length;
        const pending = data.data.filter((u) => !u.isVerified).length;
        log(
          `✅ User Status Counts: ${verified} Verified, ${pending} Pending`,
          "green",
        );
        passed++;
      }
    }
  } catch (err) {
    log(`❌ User Status Counts: ${err.message}`, "red");
    failed++;
  }

  // Test 4: Check Doctor Approval Data
  try {
    const response = await fetch(`${BASE_URL}/api/admin/doctors`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        const approved = data.data.filter((d) => d.isApproved).length;
        const pending = data.data.filter((d) => !d.isApproved).length;
        log(
          `✅ Doctor Status Counts: ${approved} Approved, ${pending} Pending`,
          "green",
        );
        passed++;
      }
    }
  } catch (err) {
    log(`❌ Doctor Status Counts: ${err.message}`, "red");
    failed++;
  }

  // Summary
  log("\n" + "=".repeat(50), "blue");
  log(
    `📊 RESULTS: ${passed} Passed, ${failed} Failed`,
    passed === 4 ? "green" : "yellow",
  );
  log("=".repeat(50), "blue");
}

async function main() {
  const token = await getAdminToken();
  if (token) {
    await testWithToken(token);
  }
}

main();
