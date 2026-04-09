import React, { useState, useEffect } from "react";
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
        credentials: "include", // Important for cookies
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const user = data.data.user || data.data;
        const token = data.data.token;
        sessionStorage.setItem("user", JSON.stringify(user)); // Store user details in session only
        sessionStorage.setItem("token", token); // Store token in session only
        const userName = user.fullname
          ? encodeURIComponent(user.fullname)
          : "profile";
        navigate(`/user-dashboard/${userName}`);
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
    <div className="min-h-screen flex items-center justify-center px-4 mt-11 mb-11">
      <div className="ring-1 ring-gray-300 w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Login
        </h1>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <input
            className="w-full p-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <div className="relative">
            <input
              className="w-full p-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5 text-gray-600" />
              ) : (
                <EyeIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          {/* <button 
            type="submit" 
            className={`w-full py-3 rounded-lg font-medium text-white ${
              loading ? "bg-gradient-to-r from-orange-500 to-red-800 cursor-not-allowed" : "bg-gradient-to-r from-orange-500 to-red-800"
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
          </button> */}
          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 ${
              loading
                ? "bg-gray-300 text-black cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 to-red-800"
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader />
                <span>Logging in</span>
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <p>
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-blue-600 hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
        <div className="text-center mt-4">
          <p>
            Continue as Doctor?{" "}
            <a href="https://doctor-booking-appointment-bsgv.vercel.app/">
              <button className="text-blue-600 hover:underline">Log in</button>
            </a>{" "}
          </p>
          <p></p>
        </div>
        <div className="text-center mt-4">
          <p>
            Continue as Admin?{" "}
            <a href="https://doctor-booking-appointment-fd5x.vercel.app/">
              <button className="text-blue-600 hover:underline">Log in</button>
            </a>{" "}
          </p>
          <p></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
