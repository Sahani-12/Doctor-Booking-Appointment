#!/usr/bin/env node

const http = require("http");

const BASE_URL = "http://localhost:3001";
let adminToken = "";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
};

function log(color, icon, message) {
  console.log(`${color}${icon} ${message}${colors.reset}`);
}

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (adminToken) {
      options.headers["Authorization"] = `Bearer ${adminToken}`;
    }

    const req = http.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log(
    `\n${colors.bright}${colors.blue}🔍 CARECONNECT INTEGRATION TEST SUITE${colors.reset}\n`,
  );

  let passed = 0;
  let failed = 0;

  // Test 1: Admin Login
  try {
    log(colors.blue, "📋", "Test 1: Admin Login");
    const res = await makeRequest("POST", "/api/auth/admin-login", {
      email: "admin@careconnect.com",
      password: "admin123",
    });

    if (res.status === 200 && res.data.data && res.data.data.token) {
      adminToken = res.data.data.token;
      log(colors.green, "✓", "Admin login successful");
      passed++;
    } else {
      log(colors.red, "✗", `Admin login failed: ${res.status}`);
      failed++;
    }
  } catch (err) {
    log(colors.red, "✗", `Admin login error: ${err.message}`);
    failed++;
  }

  // Test 2: Get Dashboard Stats
  try {
    log(colors.blue, "📋", "Test 2: Get Dashboard Stats");
    const res = await makeRequest("GET", "/api/admin/stats");

    if (res.status === 200 && res.data.data) {
      log(colors.green, "✓", `Dashboard stats retrieved`);
      log(
        colors.yellow,
        "   ",
        `Users: ${res.data.data.totalUsers}, Doctors: ${res.data.data.totalDoctors}, Appointments: ${res.data.data.totalAppointments}`,
      );
      passed++;
    } else {
      log(colors.red, "✗", `Dashboard stats failed: ${res.status}`);
      failed++;
    }
  } catch (err) {
    log(colors.red, "✗", `Dashboard stats error: ${err.message}`);
    failed++;
  }

  // Test 3: Get All Users
  try {
    log(colors.blue, "📋", "Test 3: Get All Users");
    const res = await makeRequest("GET", "/api/admin/users");

    if (res.status === 200 && res.data.data) {
      log(colors.green, "✓", `Users fetched (${res.data.data.length} users)`);
      if (res.data.data.length > 0) {
        const user = res.data.data[0];
        log(
          colors.yellow,
          "   ",
          `Sample: ${user.fullname} (${user.email}), Verified: ${user.isVerified}`,
        );
      }
      passed++;
    } else {
      log(colors.red, "✗", `Users fetch failed: ${res.status}`);
      failed++;
    }
  } catch (err) {
    log(colors.red, "✗", `Users fetch error: ${err.message}`);
    failed++;
  }

  // Test 4: Get All Doctors
  try {
    log(colors.blue, "📋", "Test 4: Get All Doctors");
    const res = await makeRequest("GET", "/api/admin/doctors");

    if (res.status === 200 && res.data.data !== undefined) {
      log(
        colors.green,
        "✓",
        `Doctors fetched (${res.data.data.length} doctors)`,
      );
      if (res.data.data.length > 0) {
        const doc = res.data.data[0];
        log(
          colors.yellow,
          "   ",
          `Sample: ${doc.fullname}, Specialization: ${Array.isArray(doc.specialization) ? doc.specialization.join(", ") : doc.specialization}`,
        );
      }
      passed++;
    } else {
      log(colors.red, "✗", `Doctors fetch failed: ${res.status}`);
      failed++;
    }
  } catch (err) {
    log(colors.red, "✗", `Doctors fetch error: ${err.message}`);
    failed++;
  }

  // Test 5: Get Pending Doctors
  try {
    log(colors.blue, "📋", "Test 5: Get Pending Doctors");
    const res = await makeRequest("GET", "/api/admin/doctors/pending");

    if (res.status === 200 && res.data.data !== undefined) {
      log(
        colors.green,
        "✓",
        `Pending doctors fetched (${res.data.data.length} pending)`,
      );
      passed++;
    } else {
      log(colors.red, "✗", `Pending doctors fetch failed: ${res.status}`);
      failed++;
    }
  } catch (err) {
    log(colors.red, "✗", `Pending doctors fetch error: ${err.message}`);
    failed++;
  }

  // Test 6: Get All Appointments
  try {
    log(colors.blue, "📋", "Test 6: Get All Appointments");
    const res = await makeRequest("GET", "/api/admin/appointments");

    if (res.status === 200 && res.data.data !== undefined) {
      log(
        colors.green,
        "✓",
        `Appointments fetched (${res.data.data.length} appointments)`,
      );
      if (res.data.data.length > 0) {
        const apt = res.data.data[0];
        log(
          colors.yellow,
          "   ",
          `Sample: ${apt.patient.fullname} → ${apt.doctor.fullname}, Status: ${apt.status}`,
        );
      }
      passed++;
    } else {
      log(colors.red, "✗", `Appointments fetch failed: ${res.status}`);
      failed++;
    }
  } catch (err) {
    log(colors.red, "✗", `Appointments fetch error: ${err.message}`);
    failed++;
  }

  // Test 7: Get All Payments
  try {
    log(colors.blue, "📋", "Test 7: Get All Payments");
    const res = await makeRequest("GET", "/api/admin/payments");

    if (res.status === 200 && res.data.data !== undefined) {
      log(
        colors.green,
        "✓",
        `Payments fetched (${res.data.data.length} payments)`,
      );
      if (res.data.data.length > 0) {
        const payment = res.data.data[0];
        log(
          colors.yellow,
          "   ",
          `Sample: ₹${payment.amount}, Status: ${payment.status}, Method: ${payment.paymentMethod}`,
        );
      }
      passed++;
    } else {
      log(colors.red, "✗", `Payments fetch failed: ${res.status}`);
      failed++;
    }
  } catch (err) {
    log(colors.red, "✗", `Payments fetch error: ${err.message}`);
    failed++;
  }

  // Test 8: API Response Structure Validation
  try {
    log(colors.blue, "📋", "Test 8: Response Structure Validation");
    const userRes = await makeRequest("GET", "/api/admin/users");

    if (userRes.data.data && userRes.data.data.length > 0) {
      const user = userRes.data.data[0];
      const requiredFields = [
        "_id",
        "fullname",
        "email",
        "phone",
        "isVerified",
        "createdAt",
      ];
      const missingFields = requiredFields.filter((f) => !(f in user));

      if (missingFields.length === 0) {
        log(colors.green, "✓", `User response structure valid`);
        passed++;
      } else {
        log(
          colors.red,
          "✗",
          `Missing fields in user: ${missingFields.join(", ")}`,
        );
        failed++;
      }
    }
  } catch (err) {
    log(colors.red, "✗", `Response validation error: ${err.message}`);
    failed++;
  }

  // Summary
  console.log(
    `\n${colors.bright}${colors.blue}═══════════════════════════════════${colors.reset}`,
  );
  console.log(`${colors.bright}Test Results:${colors.reset}`);
  log(colors.green, `✓`, `${passed} tests passed`);
  log(colors.red, `✗`, `${failed} tests failed`);
  console.log(
    `${colors.bright}${colors.blue}═══════════════════════════════════${colors.reset}\n`,
  );

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  log(colors.red, "✗", `Test suite error: ${err.message}`);
  process.exit(1);
});
