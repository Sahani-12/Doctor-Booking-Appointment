#!/usr/bin/env node

const http = require("http");

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║             🔍 CHECKING ALL SERVICES STATUS                  ║
╚═══════════════════════════════════════════════════════════════╝
`);

const services = [
  {
    name: "Backend API",
    url: "https://doctor-booking-appointment-i137.onrender.com",
    port: 3001,
  },
  { name: "Admin Panel Frontend", url: "http://localhost:5178", port: 5178 },
];

let completed = 0;

services.forEach((service, index) => {
  console.log(`\n⏳ Checking ${service.name}...`);

  http
    .get(service.url, { timeout: 2000 }, (res) => {
      console.log(`   ✅ ${service.name} is RUNNING on port ${service.port}`);
      console.log(`   Status: ${res.statusCode}`);
      completed++;

      if (completed === services.length) {
        printSummary();
      }
    })
    .on("error", (err) => {
      console.log(
        `   ❌ ${service.name} is NOT RUNNING on port ${service.port}`,
      );
      console.log(
        `   Reason: ${err.code === "ECONNREFUSED" ? "Connection refused" : err.message}`,
      );
      completed++;

      if (completed === services.length) {
        printSummary();
      }
    });
});

function printSummary() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                        NEXT STEPS                            ║
╚═══════════════════════════════════════════════════════════════╝

If Backend is RUNNING but Admin Panel is NOT:
  1. Open NEW terminal
  2. cd CareConnect-Admin
  3. npm run dev
  4. Wait for "Local: http://localhost:5178"

If Admin Panel is RUNNING:
  1. Open http://localhost:5178 in browser
  2. Press Ctrl+Shift+R to hard refresh
  3. Clear storage: F12 → Application → Clear storage
  4. Login with: admin@careconnect.com / admin123
  5. Data should appear!

If BOTH are NOT RUNNING:
  See TROUBLESHOOTING_GUIDE.js for full restart instructions
  
`);
}
