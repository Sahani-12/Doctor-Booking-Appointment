/**
 * Unified API Service for HMS
 * Centralized API calls for all features
 */

import BASE_URL from "@/constants/api";

// Helper: Get token from session
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Helper: Parse response safely
const parseResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      window.location.href = "/login";
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return await response.json();
};

// ==================== HOSPITAL PORTAL ====================
export const hospitalAPI = {
  // Dashboard overview
  getDashboardOverview: async () => {
    const response = await fetch(
      `${BASE_URL}/api/hospital/dashboard/overview`,
      {
        headers: getAuthHeaders(),
      },
    );
    return parseResponse(response);
  },

  // Patient summary with all data
  getPatientSummary: async (patientId) => {
    const response = await fetch(
      `${BASE_URL}/api/hospital/patients/${patientId}/summary`,
      { headers: getAuthHeaders() },
    );
    return parseResponse(response);
  },

  // Appointments
  getAppointments: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(
      `${BASE_URL}/api/appointments${query ? "?" + query : ""}`,
      { headers: getAuthHeaders() },
    );
    return parseResponse(response);
  },

  getMyAppointments: async () => {
    const response = await fetch(`${BASE_URL}/api/appointments/my`, {
      headers: getAuthHeaders(),
    });
    return parseResponse(response);
  },

  getAppointmentById: async (appointmentId) => {
    const response = await fetch(
      `${BASE_URL}/api/appointments/${appointmentId}`,
      { headers: getAuthHeaders() },
    );
    return parseResponse(response);
  },

  updateAppointmentStatus: async (appointmentId, status) => {
    const response = await fetch(
      `${BASE_URL}/api/appointments/${appointmentId}/status`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      },
    );
    return parseResponse(response);
  },

  cancelAppointment: async (appointmentId, reason = "") => {
    const response = await fetch(
      `${BASE_URL}/api/appointments/${appointmentId}/cancel`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
      },
    );
    return parseResponse(response);
  },

  // Medical Records
  getMedicalRecords: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(
      `${BASE_URL}/api/hospital/medical-records${query ? "?" + query : ""}`,
      { headers: getAuthHeaders() },
    );
    return parseResponse(response);
  },

  getMedicalRecordById: async (recordId) => {
    const response = await fetch(
      `${BASE_URL}/api/hospital/medical-records/${recordId}`,
      { headers: getAuthHeaders() },
    );
    return parseResponse(response);
  },

  // Admissions
  getAdmissions: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(
      `${BASE_URL}/api/hospital/admissions${query ? "?" + query : ""}`,
      { headers: getAuthHeaders() },
    );
    return parseResponse(response);
  },

  getAdmissionById: async (admissionId) => {
    const response = await fetch(
      `${BASE_URL}/api/hospital/admissions/${admissionId}`,
      { headers: getAuthHeaders() },
    );
    return parseResponse(response);
  },

  // Lab Orders
  getLabOrders: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(
      `${BASE_URL}/api/hospital/lab-orders${query ? "?" + query : ""}`,
      { headers: getAuthHeaders() },
    );
    return parseResponse(response);
  },

  getLabOrderById: async (labOrderId) => {
    const response = await fetch(
      `${BASE_URL}/api/hospital/lab-orders/${labOrderId}`,
      { headers: getAuthHeaders() },
    );
    return parseResponse(response);
  },

  // Bills
  getBills: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(
      `${BASE_URL}/api/hospital/bills${query ? "?" + query : ""}`,
      { headers: getAuthHeaders() },
    );
    return parseResponse(response);
  },

  getBillById: async (billId) => {
    const response = await fetch(`${BASE_URL}/api/hospital/bills/${billId}`, {
      headers: getAuthHeaders(),
    });
    return parseResponse(response);
  },

  // Departments
  getDepartments: async () => {
    const response = await fetch(`${BASE_URL}/api/hospital/departments`, {
      headers: getAuthHeaders(),
    });
    return parseResponse(response);
  },
};

// ==================== VIDEO CALLS ====================
export const videoAPI = {
  // Create video room
  createRoom: async (appointmentId) => {
    const response = await fetch(`${BASE_URL}/api/video/create-room`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ appointmentId }),
    });
    return parseResponse(response);
  },

  // Join video session
  joinSession: async (roomId) => {
    const response = await fetch(`${BASE_URL}/api/video/join-session`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ roomId }),
    });
    return parseResponse(response);
  },

  // End video session
  endSession: async (sessionId) => {
    const response = await fetch(`${BASE_URL}/api/video/end-session`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ sessionId }),
    });
    return parseResponse(response);
  },

  // Get session history
  getHistory: async () => {
    const response = await fetch(`${BASE_URL}/api/video/history`, {
      headers: getAuthHeaders(),
    });
    return parseResponse(response);
  },

  // Get specific session details
  getSessionDetails: async (sessionId) => {
    const response = await fetch(`${BASE_URL}/api/video/session/${sessionId}`, {
      headers: getAuthHeaders(),
    });
    return parseResponse(response);
  },

  // Save prescription after video call
  savePrescription: async (prescriptionData) => {
    const response = await fetch(`${BASE_URL}/api/video/save-prescription`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(prescriptionData),
    });
    return parseResponse(response);
  },
};

// ==================== USER PROFILE ====================
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    const response = await fetch(`${BASE_URL}/api/users/profile`, {
      headers: getAuthHeaders(),
    });
    return parseResponse(response);
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await fetch(`${BASE_URL}/api/users/profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return parseResponse(response);
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const token = sessionStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/users/profile/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return parseResponse(response);
  },

  // Get user documents
  getDocuments: async () => {
    const response = await fetch(`${BASE_URL}/api/users/documents`, {
      headers: getAuthHeaders(),
    });
    return parseResponse(response);
  },

  // Upload document
  uploadDocument: async (file, message = "") => {
    const formData = new FormData();
    formData.append("file", file);
    if (message) formData.append("message", message);

    const token = sessionStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/users/documents`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return parseResponse(response);
  },

  // Delete document
  deleteDocument: async (documentId) => {
    const response = await fetch(
      `${BASE_URL}/api/users/documents/${documentId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      },
    );
    return parseResponse(response);
  },
};

// ==================== DOCTORS ====================
export const doctorAPI = {
  // Get all doctors with filters
  getAllDoctors: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(
      `${BASE_URL}/api/doctors${query ? "?" + query : ""}`,
      { headers: getAuthHeaders() },
    );
    return parseResponse(response);
  },

  // Get doctor by ID
  getDoctorById: async (doctorId) => {
    const response = await fetch(`${BASE_URL}/api/doctors/${doctorId}`, {
      headers: getAuthHeaders(),
    });
    return parseResponse(response);
  },

  // Get doctor availability
  getDoctorAvailability: async (doctorId, date) => {
    const response = await fetch(
      `${BASE_URL}/api/appointments/slots/${doctorId}/${date}`,
      { headers: getAuthHeaders() },
    );
    return parseResponse(response);
  },
};

// ==================== APPOINTMENTS ====================
export const appointmentAPI = {
  // Create appointment
  createAppointment: async (appointmentData) => {
    const response = await fetch(`${BASE_URL}/api/appointments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(appointmentData),
    });
    return parseResponse(response);
  },

  // Get appointment details
  getAppointmentDetails: async (appointmentId) => {
    const response = await fetch(
      `${BASE_URL}/api/appointments/${appointmentId}`,
      { headers: getAuthHeaders() },
    );
    return parseResponse(response);
  },

  // Rate appointment
  rateAppointment: async (appointmentId, rating, feedback) => {
    const response = await fetch(
      `${BASE_URL}/api/appointments/${appointmentId}/rate`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ rating, feedback }),
      },
    );
    return parseResponse(response);
  },
};

// ==================== REAL-TIME POLLING HELPER ====================
/**
 * Poll API endpoint at regular intervals
 * @param {Function} apiCall - The API call to make
 * @param {Function} onSuccess - Callback when data is fetched
 * @param {Function} onError - Callback on error
 * @param {number} interval - Polling interval in milliseconds (default: 5000)
 * @returns {Function} Cleanup function to stop polling
 */
export const pollAPI = (apiCall, onSuccess, onError, interval = 5000) => {
  let timeoutId;

  const poll = async () => {
    try {
      const data = await apiCall();
      onSuccess(data);
    } catch (error) {
      onError(error);
    } finally {
      timeoutId = setTimeout(poll, interval);
    }
  };

  // Start polling immediately
  poll();

  // Return cleanup function
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
};

export default {
  hospital: hospitalAPI,
  video: videoAPI,
  user: userAPI,
  doctor: doctorAPI,
  appointment: appointmentAPI,
  pollAPI,
};
