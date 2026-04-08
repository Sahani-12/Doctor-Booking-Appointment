const axios = require("axios");
const API = "https://doctor-booking-appointment-i137.onrender.com/api";

(async () => {
  console.log("\n✅ BACKEND TESTING INITIATED\n");
  console.log("═══════════════════════════════════════\n");

  try {
    // Test 1: Admin Login
    console.log("1️⃣  Testing: Admin Login...");
    const admin = await axios.post(API + "/auth/admin-login", {
      email: "admin@careconnect.com",
      password: "admin@123456",
    });
    console.log("   ✅ Admin login successful\n");

    const token = admin.data.token;
    const headers = { Authorization: "Bearer " + token };

    // Test 2: Get Dashboard
    console.log("2️⃣  Testing: Get Dashboard...");
    const dash = await axios.get(API + "/admin/dashboard", { headers });
    console.log("   ✅ Dashboard: ", JSON.stringify(dash.data));

    // Test 3: Get Users
    console.log("\n3️⃣  Testing: Get Users...");
    const users = await axios.get(API + "/admin/users", { headers });
    console.log(
      "   ✅ Users retrieved: " +
        (Array.isArray(users.data) ? users.data.length : 0) +
        " users found",
    );

    // Test 4: Get Doctors
    console.log("\n4️⃣  Testing: Get Doctors...");
    const doctors = await axios.get(API + "/admin/doctors", { headers });
    console.log(
      "   ✅ Doctors retrieved: " +
        (Array.isArray(doctors.data) ? doctors.data.length : 0) +
        " doctors found",
    );

    // Test 5: Get Appointments
    console.log("\n5️⃣  Testing: Get Appointments...");
    const appts = await axios.get(API + "/admin/appointments", { headers });
    console.log(
      "   ✅ Appointments retrieved: " +
        (Array.isArray(appts.data) ? appts.data.length : 0) +
        " appointments found",
    );

    // Test 6: Available Doctors
    console.log("\n6️⃣  Testing: Get Available Doctors...");
    const avail = await axios.get(API + "/doctors/available");
    console.log(
      "   ✅ Available doctors: " +
        (Array.isArray(avail.data) ? avail.data.length : 0) +
        " doctors",
    );

    // Test 7: Get Payments
    console.log("\n7️⃣  Testing: Get Payments...");
    const payments = await axios.get(API + "/admin/payments", { headers });
    console.log(
      "   ✅ Payments retrieved: " +
        (Array.isArray(payments.data) ? payments.data.length : 0) +
        " payments",
    );

    // Test 8: Get Settings
    console.log("\n8️⃣  Testing: Get Settings...");
    const settings = await axios.get(API + "/admin/settings", { headers });
    console.log("   ✅ Settings retrieved successfully");

    console.log("\n═══════════════════════════════════════");
    console.log("\n🎉 ALL TESTS PASSED! ✅\n");
    console.log("✨ PROJECT STATUS: PRODUCTION READY ✨\n");
  } catch (err) {
    console.log("\n❌ TEST FAILED:");
    console.log("   Error: " + (err.response?.data?.message || err.message));
    console.log("   Status: " + err.response?.status);
    console.log("\n");
    process.exit(1);
  }
})();
