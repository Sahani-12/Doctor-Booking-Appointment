import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Loader from "../../ui/Loader1";
import BASE_URL from "@/constants/api";

const SignUp = () => {
  const navigate = useNavigate();

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
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

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
        city: formData.location,
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
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
          Create an Account
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mt-2 mb-6">
          Join CareConnect and manage your healthcare seamlessly
        </p>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Form */}
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={handleSubmit}
        >
          {/* Full Name */}
          <InputField
            label="Full Name"
            name="fullname"
            value={formData.fullname}
            handleChange={handleChange}
          />

          {/* User ID */}
          <InputField
            label="User ID"
            name="userID"
            value={formData.userID}
            handleChange={handleChange}
          />

          {/* Email */}
          <InputField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            handleChange={handleChange}
          />

          {/* Phone */}
          <InputField
            label="Phone"
            name="phone"
            type="number"
            value={formData.phone}
            handleChange={handleChange}
          />

          {/* Age */}
          <InputField
            label="Age"
            name="age"
            type="number"
            value={formData.age}
            handleChange={handleChange}
          />

          {/* Date of Birth */}
          <InputField
            label="Date of Birth"
            name="DOB"
            type="date"
            value={formData.DOB}
            handleChange={handleChange}
          />

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              required
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Location */}
          <InputField
            label="Location"
            name="location"
            value={formData.location}
            handleChange={handleChange}
          />

          {/* Password */}
          <PasswordField
            label="Password"
            name="password"
            value={formData.password}
            showPassword={showNewPassword}
            setShowPassword={setShowNewPassword}
            handleChange={handleChange}
          />

          {/* Confirm Password */}
          <PasswordField
            label="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            showPassword={showConfirmPassword}
            setShowPassword={setShowConfirmPassword}
            handleChange={handleChange}
          />

          {/* Submit Button */}
          <div className="md:col-span-2">
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
                  <span>Registering...</span>
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </div>

          {/* Login Link */}
          <div className="md:col-span-2 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-orange-600 hover:underline font-medium"
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

/* Reusable Input Component */
const InputField = ({ label, name, type = "text", value, handleChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={handleChange}
      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
      required
    />
  </div>
);

/* Reusable Password Component */
const PasswordField = ({
  label,
  name,
  value,
  showPassword,
  setShowPassword,
  handleChange,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={handleChange}
        className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
        required
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
      >
        {showPassword ? (
          <EyeSlashIcon className="w-5 h-5" />
        ) : (
          <EyeIcon className="w-5 h-5" />
        )}
      </button>
    </div>
  </div>
);

export default SignUp;
