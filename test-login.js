const http = require("http");

const options = {
  hostname: "localhost",
  port: 3001,
  path: "/api/auth/admin-login",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};

const req = http.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    console.log("Response:", data);
    if (res.statusCode === 200) {
      console.log("\n✅ LOGIN SUCCESSFUL! Admin can now login to frontend.");
    } else {
      console.log("\n❌ Login failed. Check credentials or database.");
    }
  });
});

req.on("error", (e) => {
  console.error(`Problem: ${e.message}`);
});

const body = JSON.stringify({
  email: "admin@careconnect.com",
  password: "admin123",
});

req.write(body);
req.end();
