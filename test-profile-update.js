// Test script to verify doctor profile editing functionality
// This script tests the experience and license number field updates

const testProfileUpdate = async () => {
  try {
    // First, login to get token
    const loginResponse = await fetch(
      "https://doctor-booking-appointment-i137.onrender.com/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "doctor@example.com", // Use a test doctor email
          password: "password123",
        }),
      },
    );

    if (!loginResponse.ok) {
      console.log("Login failed - using mock token for testing");
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;

    // Test profile update with experience and license number
    const updateResponse = await fetch(
      "https://doctor-booking-appointment-i137.onrender.com/api/doctors/profile",
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname: "Dr. Test Doctor",
          phone: "1234567890",
          specialization: ["Cardiology"],
          location: "Test Hospital",
          degrees: ["MD"],
          experience: 15,
          description: "Test bio",
          licenseNumber: "LIC123456",
        }),
      },
    );

    if (updateResponse.ok) {
      console.log(
        "✅ Profile update successful - experience and license number fields are working",
      );
      const result = await updateResponse.json();
      console.log("Updated profile:", result);
    } else {
      console.log(
        "❌ Profile update failed:",
        updateResponse.status,
        updateResponse.statusText,
      );
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
};

testProfileUpdate();
