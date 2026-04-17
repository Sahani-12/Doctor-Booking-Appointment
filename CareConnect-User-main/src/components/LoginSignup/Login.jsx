import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Loader from "../../ui/Loader1";
import BASE_URL from "@/constants/api";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const user = data.data.user || data.data;
        const token = data.data.token;

        // Clear previous user's data from localStorage
        localStorage.removeItem("userProfile");
        sessionStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("token", token);
        // Save to localStorage for persistence across sessions
        localStorage.setItem("userProfile", JSON.stringify(user));

        // Fetch full profile to get latest image/avatar
        try {
          const profileResponse = await fetch(`${BASE_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const profileData = await profileResponse.json();
          if (profileData.success && profileData.data) {
            const fullUserData = {
              ...user,
              image:
                profileData.data.profileImage ||
                profileData.data.image ||
                profileData.data.avatar ||
                user.profileImage ||
                user.image,
              avatar: profileData.data.avatar || user.avatar,
            };
            sessionStorage.setItem("user", JSON.stringify(fullUserData));
            localStorage.setItem("userProfile", JSON.stringify(fullUserData));
          }
        } catch (profileError) {
          console.log("Profile fetch failed, using login data", profileError);
        }

        const userName = user.fullname
          ? encodeURIComponent(user.fullname)
          : "profile";

        navigate(`/`);
      } else {
        alert(data.message || data.error || "Login failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
      {/* Login Card */}
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8 backdrop-blur-lg">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">
          Welcome Back 👋
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
          Login to your CareConnect account
        </p>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <input
            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 dark:text-white placeholder-gray-400"
            type="email"
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
            required
          />

          {/* Password */}
          <div className="relative">
            <input
              className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10 text-gray-800 dark:text-white placeholder-gray-400"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90"
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader />
                <span>Logging in...</span>
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Signup */}
        <div className="text-center mt-6 text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-orange-600 hover:underline font-medium"
            >
              Sign Up
            </button>
          </p>
        </div>

        {/* Doctor Login */}
        <div className="text-center mt-3 text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Continue as Doctor?{" "}
            <a
              href="https://doctor-booking-appointment-bsgv.vercel.app/"
              className="text-blue-600 hover:underline font-medium"
            >
              Log in
            </a>
          </p>
        </div>

        {/* Admin Login */}
        <div className="text-center mt-2 text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Continue as Admin?{" "}
            <a
              href="https://doctor-booking-appointment-fd5x.vercel.app/"
              className="text-blue-600 hover:underline font-medium"
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
