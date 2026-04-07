const http = require("http");

// First, get a token by logging in
const loginOptions = {
  hostname: "localhost",
  port: 3001,
  path: "/api/auth/admin-login",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
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
      console.log("✅ Login successful, got token");
      console.log("Token:", token.substring(0, 20) + "...\n");

      // Now test dashboard endpoint with token
      testDashboard(token);
    } else {
      console.log("❌ Login failed:", res.statusCode);
    }
  });
});

loginReq.on("error", (e) => {
  console.error(`Problem: ${e.message}`);
});

loginReq.write(
  JSON.stringify({
    email: "admin@careconnect.com",
    password: "admin123",
  }),
);
loginReq.end();

// Test dashboard endpoint
function testDashboard(token) {
  const dashboardOptions = {
    hostname: "localhost",
    port: 3001,
    path: "/api/admin/dashboard",
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const dashReq = http.request(dashboardOptions, (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      console.log("Dashboard Response:");
      console.log("Status:", res.statusCode);
      console.log("Data:", data);

      if (res.statusCode === 404) {
        console.log("\n❌ 404 ERROR - Endpoint not found!");
      } else if (res.statusCode === 200) {
        console.log("\n✅ Dashboard endpoint works!");
      }
    });
  });

  dashReq.on("error", (e) => {
    console.error(`Problem: ${e.message}`);
  });

  dashReq.end();
}
