console.log("=".repeat(60));
console.log("🔍 CareConnect Admin API Endpoint Test");
console.log("=".repeat(60));

const http = require("http");

// List of all admin endpoints to test
const endpoints = [
  { method: "GET", path: "/api/admin/dashboard", name: "Dashboard" },
  { method: "GET", path: "/api/admin/users", name: "Get Users" },
  { method: "GET", path: "/api/admin/doctors", name: "Get Doctors" },
  {
    method: "GET",
    path: "/api/admin/doctors/pending",
    name: "Get Pending Doctors",
  },
  { method: "GET", path: "/api/admin/appointments", name: "Get Appointments" },
  { method: "GET", path: "/api/admin/payments", name: "Get Payments" },
  { method: "GET", path: "/api/admin/settings", name: "Get Settings" },
  { method: "GET", path: "/api/admin/stats", name: "Get Stats" },
];

// First login to get token
const loginOptions = {
  hostname: "localhost",
  port: 3001,
  path: "/api/auth/admin-login",
  method: "POST",
  headers: { "Content-Type": "application/json" },
};

const loginReq = http.request(loginOptions, (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });
  res.on("end", () => {
    if (res.statusCode === 200) {
      const loginResponse = JSON.parse(data);
      const token = loginResponse.data.token;
      console.log("✅ Login successful\n");
      testAllEndpoints(token);
    } else {
      console.log("❌ Login failed\n");
    }
  });
});

loginReq.write(
  JSON.stringify({
    email: "admin@careconnect.com",
    password: "admin123",
  }),
);
loginReq.end();

// Test all endpoints
function testAllEndpoints(token) {
  let completed = 0;
  const results = [];

  endpoints.forEach((endpoint) => {
    const options = {
      hostname: "localhost",
      port: 3001,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        const status = res.statusCode;
        const icon = status === 200 ? "✅" : "❌";
        results.push({
          name: endpoint.name,
          method: endpoint.method,
          path: endpoint.path,
          status: status,
          icon: icon,
        });

        completed++;
        if (completed === endpoints.length) {
          displayResults(results);
        }
      });
    });

    req.on("error", (e) => {
      completed++;
      results.push({
        name: endpoint.name,
        method: endpoint.method,
        path: endpoint.path,
        status: "ERROR",
        icon: "❌",
      });
      if (completed === endpoints.length) {
        displayResults(results);
      }
    });

    req.end();
  });
}

function displayResults(results) {
  console.log("Endpoint Test Results:");
  console.log("-".repeat(80));
  console.log(
    "Method".padEnd(8) + "Status".padEnd(12) + "Name".padEnd(30) + "Path",
  );
  console.log("-".repeat(80));

  results.forEach((r) => {
    const status =
      r.status === 200 ? "✅ 200".padEnd(12) : `❌ ${r.status}`.padEnd(12);
    console.log(r.method.padEnd(8) + status + r.name.padEnd(30) + r.path);
  });

  console.log("-".repeat(80));
  const working = results.filter((r) => r.status === 200).length;
  const total = results.length;
  console.log(`\nResult: ${working}/${total} endpoints working\n`);

  if (working === total) {
    console.log(
      "✅ All endpoints are working! 404 error must be from frontend or static files.",
    );
  } else {
    console.log("❌ Some endpoints are failing. Check which ones above.");
  }
}
