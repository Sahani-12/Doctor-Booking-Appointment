const http = require("http");

// Login first
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
      console.log("✅ Logged in\n");

      // Get users
      const usersOptions = {
        hostname: "localhost",
        port: 3001,
        path: "/api/admin/users",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const usersReq = http.request(usersOptions, (res) => {
        let usersData = "";
        res.on("data", (chunk) => {
          usersData += chunk;
        });
        res.on("end", () => {
          console.log("Users API Response:");
          console.log("Status:", res.statusCode);
          console.log("Data:", JSON.stringify(JSON.parse(usersData), null, 2));
        });
      });

      usersReq.on("error", (e) => {
        console.error("Error:", e.message);
      });

      usersReq.end();
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
