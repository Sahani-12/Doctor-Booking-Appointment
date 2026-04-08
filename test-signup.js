const axios = require("axios");

const testSignup = async () => {
  try {
    console.log("🧪 Testing User Signup...\n");

    const userData = {
      fullname: "Test User",
      email: "testuser" + Date.now() + "@example.com",
      password: "password123",
      phone: "9999999999",
      age: 25,
      city: "Mumbai",
    };

    console.log("📤 Sending signup request with data:");
    console.log(userData);
    console.log("\n");

    const response = await axios.post(
      "https://doctor-booking-appointment-i137.onrender.com/api/auth/register/user",
      userData,
    );

    console.log("✅ Signup successful!");
    console.log("Response:", response.data);
  } catch (error) {
    console.log("❌ Signup failed!");
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Error:", error.response.data);
    } else if (error.request) {
      console.log("No response from server");
      console.log("Request:", error.request);
    } else {
      console.log("Error:", error.message);
    }
  }
};

testSignup();
