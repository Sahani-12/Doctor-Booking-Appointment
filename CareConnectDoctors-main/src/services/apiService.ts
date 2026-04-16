import axios, { AxiosInstance } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

class DoctorApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.token =
      localStorage.getItem("doctorToken") || sessionStorage.getItem("token");

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const currentToken =
        localStorage.getItem("doctorToken") || sessionStorage.getItem("token");
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("doctorToken");
          sessionStorage.removeItem("token");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      },
    );
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("doctorToken", token);
  }

  // Auth endpoints
  async loginDoctor(email: string, password: string) {
    const response = await this.client.post("/auth/doctor-login", {
      email,
      password,
    });
    return response.data;
  }

  // Dashboard endpoints
  async getDoctorDashboard() {
    const response = await this.client.get("/doctor/dashboard");
    return response.data;
  }

  // My Appointments
  async getMyAppointments(filters?: any) {
    const response = await this.client.get("/doctor/appointments", {
      params: filters,
    });
    return response.data;
  }

  async getAppointmentDetails(appointmentId: string) {
    const response = await this.client.get(
      `/doctor/appointments/${appointmentId}`,
    );
    return response.data;
  }

  // My Patients
  async getMyPatients(filters?: any) {
    const response = await this.client.get("/doctor/patients", {
      params: filters,
    });
    return response.data;
  }

  async getPatientDetails(patientId: string) {
    const response = await this.client.get(`/doctor/patients/${patientId}`);
    return response.data;
  }

  // Medical Records - Create & Manage
  async createMedicalRecord(recordData: {
    patientId: string;
    diagnosis: string;
    chiefComplaint: string;
    symptoms?: string[];
    medications?: Record<string, string>;
    vitals?: Record<string, any>;
    notes?: string;
    treatmentPlan?: string;
  }) {
    const response = await this.client.post(
      "/doctor/medical-records",
      recordData,
    );
    return response.data;
  }

  async getMedicalRecords(filters?: any) {
    const response = await this.client.get("/doctor/medical-records", {
      params: filters,
    });
    return response.data;
  }

  async updateMedicalRecord(recordId: string, recordData: any) {
    const response = await this.client.put(
      `/doctor/medical-records/${recordId}`,
      recordData,
    );
    return response.data;
  }

  // Lab Orders - Create & Manage
  async createLabOrder(orderData: {
    patientId: string;
    tests: Array<{ name: string; code?: string }>;
    clinicalNotes?: string;
    urgency?: "normal" | "urgent";
  }) {
    const response = await this.client.post("/doctor/lab-orders", orderData);
    return response.data;
  }

  async getLabOrders(filters?: any) {
    const response = await this.client.get("/doctor/lab-orders", {
      params: filters,
    });
    return response.data;
  }

  async updateLabOrder(orderId: string, orderData: any) {
    const response = await this.client.put(
      `/doctor/lab-orders/${orderId}`,
      orderData,
    );
    return response.data;
  }

  // Admissions - Create & Manage
  async createAdmission(admissionData: {
    patientId: string;
    wardType: string;
    primaryDiagnosis: string;
    secondaryDiagnosis?: string;
    treatmentPlan?: string;
    medications?: Record<string, string>;
    estimatedDuration?: number;
  }) {
    const response = await this.client.post(
      "/doctor/admissions",
      admissionData,
    );
    return response.data;
  }

  async getAdmissions(filters?: any) {
    const response = await this.client.get("/doctor/admissions", {
      params: filters,
    });
    return response.data;
  }

  async updateAdmission(admissionId: string, admissionData: any) {
    const response = await this.client.put(
      `/doctor/admissions/${admissionId}`,
      admissionData,
    );
    return response.data;
  }

  async dischargePatient(admissionId: string, dischargeSummary: string) {
    const response = await this.client.put(
      `/doctor/admissions/${admissionId}/discharge`,
      { dischargeSummary },
    );
    return response.data;
  }

  // Prescriptions
  async createPrescription(prescriptionData: {
    patientId: string;
    appointmentId?: string;
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      notes?: string;
    }>;
    notes?: string;
  }) {
    const response = await this.client.post(
      "/doctor/prescriptions",
      prescriptionData,
    );
    return response.data;
  }

  async getPrescriptions(filters?: any) {
    const response = await this.client.get("/doctor/prescriptions", {
      params: filters,
    });
    return response.data;
  }

  // Profile
  async getDoctorProfile() {
    const response = await this.client.get("/doctor/profile");
    return response.data;
  }

  async updateDoctorProfile(profileData: any) {
    const response = await this.client.put("/doctor/profile", profileData);
    return response.data;
  }

  // Availability & Schedule
  async getAvailableSlots() {
    const response = await this.client.get("/doctor/available-slots");
    return response.data;
  }

  async setAvailability(availabilityData: any) {
    const response = await this.client.post(
      "/doctor/availability",
      availabilityData,
    );
    return response.data;
  }

  // Video Calls
  async createVideoRoom(appointmentId: string) {
    const response = await this.client.post("/video/create-room", {
      appointmentId,
    });
    return response.data;
  }

  async joinVideoSession(roomId: string) {
    const response = await this.client.post("/video/join-session", {
      roomId,
    });
    return response.data;
  }

  async endVideoSession(roomId: string) {
    const response = await this.client.post("/video/end-session", {
      roomId,
    });
    return response.data;
  }

  // Statistics
  async getDoctorStats() {
    const response = await this.client.get("/doctor/stats");
    return response.data;
  }
}

export default new DoctorApiService();
