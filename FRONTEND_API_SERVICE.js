// API Service Layer - Frontend Integration
// Place this file in frontend: src/services/api.js

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 - token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ========== AUTH ENDPOINTS ==========
export const authAPI = {
  registerUser: (data) => apiClient.post("/auth/register/user", data),
  registerDoctor: (data) => apiClient.post("/auth/register/doctor", data),
  login: (email, password) =>
    apiClient.post("/auth/login", { email, password }),
  getCurrentUser: () => apiClient.get("/auth/me"),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return Promise.resolve();
  },
};

// ========== DOCTOR ENDPOINTS ==========
export const doctorAPI = {
  getAllDoctors: (params) => apiClient.get("/doctors", { params }),
  getDoctorById: (id) => apiClient.get(`/doctors/${id}`),
  getDoctorProfile: () => apiClient.get("/doctors/profile"),
  updateProfile: (data) => apiClient.put("/doctors/profile", data),
  getStats: () => apiClient.get("/doctors/stats"),
};

// ========== APPOINTMENT ENDPOINTS ==========
export const appointmentAPI = {
  bookAppointment: (data) => apiClient.post("/appointments", data),
  getMyAppointments: (params) => apiClient.get("/appointments/my", { params }),
  getAvailableSlots: (doctorId, date) =>
    apiClient.get(`/appointments/slots/${doctorId}/${date}`),
  updateStatus: (id, status) =>
    apiClient.put(`/appointments/${id}/status`, { status }),
  cancelAppointment: (id) => apiClient.post(`/appointments/${id}/cancel`),
  getStats: () => apiClient.get("/appointments/stats"),
};

// ========== USER ENDPOINTS ==========
export const userAPI = {
  getProfile: () => apiClient.get("/users/profile"),
  updateProfile: (data) => apiClient.put("/users/profile", data),
  getUserById: (id) => apiClient.get(`/users/${id}`),
  getAppointments: (params) => apiClient.get("/users/appointments", { params }),
  getDocuments: (params) => apiClient.get("/users/documents", { params }),
  uploadDocument: (formData) =>
    apiClient.post("/users/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteDocument: (id) => apiClient.delete(`/users/documents/${id}`),
  getDashboard: () => apiClient.get("/users/dashboard/overview"),
};

// ========== ADMIN ENDPOINTS ==========
export const adminAPI = {
  getAllUsers: (params) => apiClient.get("/admin/users", { params }),
  getAllDoctors: (params) => apiClient.get("/admin/doctors", { params }),
  getAllAppointments: (params) =>
    apiClient.get("/admin/appointments", { params }),
  updateUser: (id, data) => apiClient.put(`/admin/users/${id}`, data),
  approveDoctor: (id, isApproved) =>
    apiClient.put(`/admin/doctors/${id}/approve`, { isApproved }),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  deleteDoctor: (id) => apiClient.delete(`/admin/doctors/${id}`),
  getStats: () => apiClient.get("/admin/stats"),
};

// ========== HELPER FUNCTIONS ==========
export const handleApiError = (error) => {
  if (error.response) {
    return error.response.data?.message || "An error occurred";
  }
  return error.message || "Network error";
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export default apiClient;
