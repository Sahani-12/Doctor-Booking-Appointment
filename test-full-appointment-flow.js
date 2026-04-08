#!/usr/bin/env node

/**
 * Full Appointment Flow Test
 * Tests the complete appointment workflow:
 * 1. User login
 * 2. Check available slots for a doctor
 * 3. Book an appointment
 * 4. Doctor login
 * 5. Fetch doctor's appointments
 * 6. Verify appointment fields match frontend expectations
 */

const http = require("http");
const assert = require("assert");

const BASE_URL = "https://doctor-booking-appointment-i137.onrender.com/api";

// Test credentials (change these if needed)
const TEST_USER_EMAIL = "user@test.com";
const TEST_USER_PASSWORD = "password123";
const TEST_DOCTOR_EMAIL = "doctor@test.com";
const TEST_DOCTOR_PASSWORD = "password123";

let userToken = null;
let doctorToken = null;
let doctorId = null;
let userId = null;
let appointmentId = null;

// Helper to make HTTP requests
function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 3001,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
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

async function test(name, fn) {
  try {
    console.log(`\n${name}...`);
    await fn();
    console.log(`✅ ${name} - PASSED`);
  } catch (error) {
    console.error(`❌ ${name} - FAILED`);
    console.error(`   Error: ${error.message}`);
    throw error;
  }
}

async function runTests() {
  console.log("🧪 Full Appointment Flow Test Suite\n");
  console.log("=".repeat(60));

  try {
    // Test 1: User Login
    await test("User Login", async () => {
      const res = await makeRequest("POST", "/auth/login", {
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      });

      assert(
        res.status === 200 || res.status === 201,
        `Expected status 200/201, got ${res.status}`,
      );
      assert(res.data.token, "No token returned");

      userToken = res.data.token;
      userId = res.data.data?._id || res.data.user?._id;
      console.log(`   User ID: ${userId}`);
    });

    // Test 2: Doctor Login
    await test("Doctor Login", async () => {
      const res = await makeRequest("POST", "/auth/login", {
        email: TEST_DOCTOR_EMAIL,
        password: TEST_DOCTOR_PASSWORD,
      });

      assert(
        res.status === 200 || res.status === 201,
        `Expected status 200/201, got ${res.status}`,
      );
      assert(res.data.token, "No token returned");

      doctorToken = res.data.token;
      doctorId = res.data.data?._id || res.data.user?._id;
      console.log(`   Doctor ID: ${doctorId}`);
    });

    // Test 3: Get Available Slots
    await test("Get Available Doctor Slots", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split("T")[0];

      const res = await makeRequest(
        "GET",
        `/appointments/slots/${doctorId}/${dateStr}`,
        null,
        userToken,
      );

      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(Array.isArray(res.data.data), "Slots should be an array");
      console.log(`   Available slots: ${res.data.data.length}`);
    });

    // Test 4: Book Appointment
    await test("Book Appointment", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split("T")[0];

      const res = await makeRequest(
        "POST",
        "/appointments",
        {
          doctorId: doctorId,
          date: dateStr,
          slot: "10:00",
          notes: "Regular checkup",
        },
        userToken,
      );

      assert(
        res.status === 200 || res.status === 201,
        `Expected status 200/201, got ${res.status}`,
      );
      assert(res.data.data?._id, "No appointment ID returned");

      appointmentId = res.data.data._id;
      console.log(`   Appointment ID: ${appointmentId}`);
    });

    // Test 5: Doctor Fetches Appointments
    await test("Doctor Fetches Appointments", async () => {
      const res = await makeRequest(
        "GET",
        "/appointments/my",
        null,
        doctorToken,
      );

      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(Array.isArray(res.data.data), "Appointments should be an array");
      console.log(`   Doctor has ${res.data.data.length} appointments`);

      if (res.data.data.length === 0) {
        console.warn("   ⚠️  Warning: No appointments found for doctor");
      }
    });

    // Test 6: Verify Appointment Data Structure
    await test("Verify Appointment Data Structure", async () => {
      const res = await makeRequest(
        "GET",
        "/appointments/my",
        null,
        doctorToken,
      );

      assert(res.status === 200);
      assert(res.data.data.length > 0, "No appointments to verify");

      const appt = res.data.data[0];
      console.log("\n   Checking appointment fields:");

      // Check required fields
      const requiredFields = [
        "_id",
        "patientId",
        "patientName",
        "patientEmail",
        "appointmentDate",
        "appointmentTime",
        "status",
      ];

      requiredFields.forEach((field) => {
        const hasField = field in appt;
        const status = hasField ? "✅" : "❌";
        console.log(
          `     ${status} ${field}: ${hasField ? appt[field] : "MISSING"}`,
        );
        assert(hasField, `Missing required field: ${field}`);
      });

      // Verify status values are NOT "accepted"
      assert(
        appt.status !== "accepted",
        'Status should not be "accepted", got: ' + appt.status,
      );
      assert(
        ["pending", "confirmed", "completed", "cancelled"].includes(
          appt.status,
        ),
        `Invalid status value: ${appt.status}`,
      );

      console.log(`\n     Status value: "${appt.status}" ✅`);
    });

    // Test 7: Update Appointment Status (Confirm)
    if (appointmentId) {
      await test("Doctor Confirms Appointment", async () => {
        const res = await makeRequest(
          "PUT",
          `/appointments/${appointmentId}/status`,
          { status: "confirmed" },
          doctorToken,
        );

        assert(
          res.status === 200 || res.status === 201,
          `Expected status 200/201, got ${res.status}`,
        );
        console.log(`   Appointment status updated to: confirmed`);
      });
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ All tests passed!\n");

    console.log("📊 Summary:");
    console.log("   ✓ User can login");
    console.log("   ✓ Doctor can login");
    console.log("   ✓ User can see available slots");
    console.log("   ✓ User can book appointment");
    console.log("   ✓ Doctor can fetch appointments");
    console.log("   ✓ Appointment data structure is correct");
    console.log("   ✓ Status values are 'confirmed' not 'accepted'");
    console.log("   ✓ Doctor can confirm appointment");

    console.log("\n🚀 You should now be able to:");
    console.log("   1. Book appointments from the User app");
    console.log("   2. See them on the Doctor panel");
    console.log("   3. Confirm/cancel appointments");
  } catch (error) {
    console.error("\n❌ Test suite failed!");
    process.exit(1);
  }
}

// Run tests
runTests().then(() => {
  process.exit(0);
});
