import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Loader from "../../ui/Loader1"; // Ensure correct import path
import BASE_URL from "@/constants/api";

const SignUp = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    userID: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    age: "",
    DOB: "",
    gender: "",
    location: "",
    govid: "",
    medicalHistory: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${BASE_URL}/auth/register/user`, {
        fullname: formData.fullname,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        age: formData.age,
        city: formData.location, // Backend uses 'city' not 'location'
      });
      if (response.data.success) {
        alert("Registration successful! Redirecting to login...");
        navigate("/login");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Registration failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 mt-11 mb-11">
      <div className="ring-1 ring-gray-300 w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Sign Up
        </h1>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          {/* User ID */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              User ID
            </label>
            <input
              type="text"
              name="userId"
              // value={formData.userID}
              onChange={handleChange}
              placeholder="Please choose user name."
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@example.com"
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Phone
            </label>
            <input
              type="number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="1234567890"
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter your age"
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              name="DOB"
              value={formData.DOB}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              required
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, State"
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full p-3 pr-12 border rounded-lg"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {showNewPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full p-3 pr-12 border rounded-lg"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gradient-to-r from-orange-500 to-red-800 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-red-800"
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader />
                  <span>Registering</span>
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center mt-4">
            <p className="text-gray-700">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:underline font-medium"
              >
                Login
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
