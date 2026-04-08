#!/usr/bin/env node

/**
 * Doctor Panel Appointments Diagnostic
 * Debugs why appointments aren't showing on doctor panel
 */

const http = require("http");

const BASE_URL = "https://doctor-booking-appointment-i137.onrender.com/api";

// Test credentials
const TEST_DOCTOR_EMAIL = "doctor@test.com";
const TEST_DOCTOR_PASSWORD = "password123";
const TEST_USER_EMAIL = "user@test.com";
const TEST_USER_PASSWORD = "password123";

let doctorToken = null;
let doctorId = null;
let doctorRole = null;
let userToken = null;
let userId = null;

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

async function runDiagnostics() {
  console.log("🔍 Doctor Panel Appointments Diagnostic\n");
  console.log("=".repeat(60));

  try {
    // 1. Doctor Login
    console.log("\n1️⃣  Doctor Login...");
    const loginRes = await makeRequest("POST", "/auth/login", {
      email: TEST_DOCTOR_EMAIL,
      password: TEST_DOCTOR_PASSWORD,
    });

    if (loginRes.status !== 200) {
      console.error("❌ Doctor login failed");
      console.error("   Status:", loginRes.status);
      console.error("   Response:", loginRes.data);
      return;
    }

    const doctorData = loginRes.data.data;
    doctorToken = doctorData.token;
    doctorId = doctorData.user.id;
    doctorRole = doctorData.user.role;

    console.log("✅ Doctor logged in");
    console.log(`   ID: ${doctorId}`);
    console.log(`   Email: ${doctorData.user.email}`);
    console.log(`   Role: ${doctorRole}`);
    if (!doctorRole) {
      console.error("   ⚠️  WARNING: Role is undefined!");
    }

    // 2. User Login (for booking appointment)
    console.log("\n2️⃣  User Login...");
    const userLoginRes = await makeRequest("POST", "/auth/login", {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });

    if (userLoginRes.status !== 200) {
      console.error("❌ User login failed");
      console.error("   Status:", userLoginRes.status);
      return;
    }

    const userData = userLoginRes.data.data;
    userToken = userData.token;
    userId = userData.user.id;

    console.log("✅ User logged in");
    console.log(`   ID: ${userId}`);

    // 3. Get available slots
    console.log("\n3️⃣  Check available slots for doctor...");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];

    const slotsRes = await makeRequest(
      "GET",
      `/appointments/slots/${doctorId}/${dateStr}`,
      null,
      userToken,
    );

    if (slotsRes.status !== 200) {
      console.error("❌ Failed to get slots");
      console.error("   Status:", slotsRes.status);
      console.error("   Response:", slotsRes.data);
      return;
    }

    const availableSlots = slotsRes.data.data.slots.filter(
      (s) => s.status === "available",
    );
    console.log("✅ Got available slots");
    console.log(`   Available slots: ${availableSlots.length}`);
    if (availableSlots.length === 0) {
      console.warn("   ⚠️  No available slots!");
      return;
    }

    const firstSlot = availableSlots[0].startTime;
    console.log(`   First available: ${firstSlot}`);

    // 4. Book an appointment
    console.log("\n4️⃣  User books appointment with doctor...");
    const bookRes = await makeRequest(
      "POST",
      "/appointments",
      {
        doctorId: doctorId,
        date: dateStr,
        slot: firstSlot,
        notes: "Test appointment for diagnostic",
      },
      userToken,
    );

    if (bookRes.status !== 200 && bookRes.status !== 201) {
      console.error("❌ Failed to book appointment");
      console.error("   Status:", bookRes.status);
      console.error("   Response:", bookRes.data);
      return;
    }

    const appointmentId = bookRes.data.data?._id || bookRes.data.appointmentId;
    console.log("✅ Appointment created");
    console.log(`   ID: ${appointmentId}`);

    // 5. Doctor fetches appointments
    console.log(
      "\n5️⃣  Doctor fetches appointments from /api/appointments/my...",
    );
    const myApptsRes = await makeRequest(
      "GET",
      "/appointments/my",
      null,
      doctorToken,
    );

    console.log(`   Status: ${myApptsRes.status}`);
    console.log(`   Response body:`, JSON.stringify(myApptsRes.data, null, 2));

    if (myApptsRes.status !== 200) {
      console.error("❌ Failed to fetch appointments");
      console.error("   Status:", myApptsRes.status);
      return;
    }

    const appointments = myApptsRes.data.data || [];
    console.log(
      `✅ Doctor appointments endpoint returned: ${appointments.length} appointments`,
    );

    if (appointments.length === 0) {
      console.error("❌ No appointments returned!");
      console.error("   Check:");
      console.log("   [ ] Doctor role is set to 'doctor'");
      console.log("   [ ] Appointment has doctor._id matching current doctor");
      console.log("   [ ] Database connection is working");

      // Do additional debugging
      console.log("\n📋 Additional Debugging:");
      console.log(`   Doctor ID in DB: ${doctorId}`);
      console.log(`   Doctor Role: ${doctorRole}`);

      // Check if we can fetch all appointments as admin
      console.log("\n   Trying to fetch via admin endpoint...");
      const adminApptsRes = await makeRequest(
        "GET",
        "/admin/appointments",
        null,
        doctorToken, // This will fail but let's see
      );
      console.log(`   Admin endpoint status: ${adminApptsRes.status}`);
    } else {
      console.log("✅ Appointments found!");
      appointments.forEach((apt, i) => {
        console.log(`\n   Appointment ${i + 1}:`);
        console.log(`     ID: ${apt._id}`);
        console.log(
          `     Patient: ${apt.patientName || apt.patient?.fullname || "Unknown"}`,
        );
        console.log(`     Date: ${apt.appointmentDate || apt.date}`);
        console.log(`     Time: ${apt.appointmentTime || apt.slot}`);
        console.log(`     Status: ${apt.status}`);
      });
    }

    console.log("\n" + "=".repeat(60));
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
  }
}

runDiagnostics()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
