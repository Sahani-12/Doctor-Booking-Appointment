import axios, { AxiosInstance } from "axios";
import { API_BASE } from "../constants/api";

const API_BASE_URL = API_BASE;

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

    const getStoredToken = () =>
      localStorage.getItem("doctorToken") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("token");

    this.token = getStoredToken();

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const currentToken = getStoredToken() || this.token;
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
          localStorage.removeItem("token");
          localStorage.removeItem("doctorToken");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          window.location.href = "/";
        }
        return Promise.reject(error);
      },
    );
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("token", token);
    localStorage.setItem("doctorToken", token);
    sessionStorage.setItem("token", token);
  }

  // Auth endpoints
  async loginDoctor(email: string, password: string) {
    const response = await this.client.post("/auth/login", {
      email,
      password,
      role: "doctor",
    });
    return response.data;
  }

  // Dashboard endpoints
  async getDoctorDashboard() {
    const response = await this.client.get("/hospital/dashboard/overview");
    return response.data;
  }

  // My Appointments
  async getMyAppointments(filters?: any) {
    const response = await this.client.get("/appointments/my", {
      params: filters,
    });
    return response.data;
  }

  async getAppointmentDetails(appointmentId: string) {
    const response = await this.client.get(
      `/appointments/${appointmentId}`,
    );
    return response.data;
  }

  // My Patients
  async getMyPatients(filters?: any) {
    const response = await this.client.get("/hospital/patients", {
      params: filters,
    });
    return response.data;
  }

  // All Hospital Patients (for issuing bills, lab orders, admissions)
  async getHospitalPatientsForBilling(search?: string) {
    const response = await this.client.get("/hospital/patients", {
      params: {
        scope: "all",
        limit: 200,
        search: search || undefined,
      },
    });
    return response.data;
  }

  async getPatientDetails(patientId: string) {
    const response = await this.client.get(`/hospital/patients/${patientId}/summary`);
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
      "/hospital/medical-records",
      recordData,
    );
    return response.data;
  }

  async getMedicalRecords(filters?: any) {
    const response = await this.client.get("/hospital/medical-records", {
      params: filters,
    });
    return response.data;
  }

  async updateMedicalRecord(recordId: string, recordData: any) {
    const response = await this.client.put(
      `/hospital/medical-records/${recordId}`,
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
    const response = await this.client.post("/hospital/lab-orders", orderData);
    return response.data;
  }

  async getLabOrders(filters?: any) {
    const response = await this.client.get("/hospital/lab-orders", {
      params: filters,
    });
    return response.data;
  }

  async updateLabOrder(orderId: string, orderData: any) {
    const response = await this.client.put(
      `/hospital/lab-orders/${orderId}`,
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
      "/hospital/admissions",
      admissionData,
    );
    return response.data;
  }

  async getAdmissions(filters?: any) {
    const response = await this.client.get("/hospital/admissions", {
      params: filters,
    });
    return response.data;
  }

  async updateAdmission(admissionId: string, admissionData: any) {
    const response = await this.client.put(
      `/hospital/admissions/${admissionId}`,
      admissionData,
    );
    return response.data;
  }

  async dischargePatient(admissionId: string, dischargeSummary: string) {
    const response = await this.client.put(
      `/hospital/admissions/${admissionId}`,
      { status: "discharged", dischargeSummary },
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
      "/hospital/medical-records",
      {
        patientId: prescriptionData.patientId,
        diagnosis: "Prescription",
        medications: prescriptionData.medications,
        notes: prescriptionData.notes,
      },
    );
    return response.data;
  }

  async getPrescriptions(filters?: any) {
    const response = await this.client.get("/hospital/medical-records", {
      params: filters,
    });
    return response.data;
  }

  // Profile
  async getDoctorProfile() {
    const response = await this.client.get("/doctors/profile");
    return response.data;
  }

  async updateDoctorProfile(profileData: any) {
    const response = await this.client.put("/doctors/profile", profileData);
    return response.data;
  }

  // Availability & Schedule
  async getAvailableSlots() {
    const response = await this.client.get("/doctors/available-slots");
    return response.data;
  }

  async setAvailability(availabilityData: any) {
    const response = await this.client.post(
      "/doctors/availability",
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
    const response = await this.client.get("/appointments/stats");
    return response.data;
  }

  // Billing & Invoices
  async getBills(filters?: any) {
    const response = await this.client.get("/hospital/bills", {
      params: filters,
    });
    return response.data;
  }

  async createBill(billData: {
    patientId: string;
    lineItems: Array<{
      description: string;
      category?: string;
      quantity: number;
      unitPrice: number;
      amount: number;
    }>;
    taxAmount?: number;
    discountAmount?: number;
    paidAmount?: number;
    paymentMethod?: string;
    status?: string;
    notes?: string;
    dueDate?: string;
    appointmentId?: string;
  }) {
    const response = await this.client.post("/hospital/bills", billData);
    return response.data;
  }

  async updateBill(billId: string, updateData: any) {
    const response = await this.client.put(
      `/hospital/bills/${billId}`,
      updateData,
    );
    return response.data;
  }
}

export default new DoctorApiService();
