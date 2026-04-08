#!/usr/bin/env node

const http = require("http");

const BASE_URL = "https://doctor-booking-appointment-i137.onrender.com";

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

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

async function test() {
  console.log("Testing admin login...\n");

  const res = await makeRequest("POST", "/api/auth/admin-login", {
    email: "admin@careconnect.com",
    password: "admin123",
  });

  console.log("Status:", res.status);
  console.log("Response:", JSON.stringify(res.data, null, 2));
}

test().catch((err) => console.error("Error:", err));
