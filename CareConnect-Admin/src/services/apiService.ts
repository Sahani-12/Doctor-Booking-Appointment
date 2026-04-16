import axios, { AxiosInstance } from "axios";
import { API_BASE } from "../constants/api";

const API_BASE_URL = API_BASE;

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.token = localStorage.getItem("adminToken");

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("adminToken");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      },
    );
  }

  setToken(token: string) {
    this.token = token;
  }

  // Auth endpoints
  async loginAdmin(email: string, password: string) {
    const response = await this.client.post("/auth/admin-login", {
      email,
      password,
    });
    return response.data;
  }

  // Dashboard endpoints
  async getDashboard() {
    const response = await this.client.get("/admin/dashboard");
    return response.data;
  }

  // Doctor endpoints
  async getDoctors(filters?: any) {
    const response = await this.client.get("/admin/doctors", {
      params: filters,
    });
    return response.data;
  }

  async getPendingDoctors() {
    const response = await this.client.get("/admin/doctors/pending");
    return response.data;
  }

  async approveDoctor(doctorId: string, status: "approved" | "rejected") {
    const response = await this.client.put(
      `/admin/doctors/${doctorId}/approve`,
      {
        status,
      },
    );
    return response.data;
  }

  async deleteDoctor(doctorId: string) {
    const response = await this.client.delete(`/admin/doctors/${doctorId}`);
    return response.data;
  }

  // User endpoints
  async getUsers(filters?: any) {
    const response = await this.client.get("/admin/users", { params: filters });
    return response.data;
  }

  async deleteUser(userId: string) {
    const response = await this.client.delete(`/admin/users/${userId}`);
    return response.data;
  }

  // Appointment endpoints
  async getAppointments(filters?: any) {
    const response = await this.client.get("/admin/appointments", {
      params: filters,
    });
    return response.data;
  }

  // Payment endpoints
  async getPayments(filters?: any) {
    const response = await this.client.get("/admin/payments", {
      params: filters,
    });
    return response.data;
  }

  // Hospital Management Endpoints
  // Patient Management
  async getHospitalPatients(filters?: any) {
    const response = await this.client.get("/hospital/patients", {
      params: filters,
    });
    return response.data;
  }

  async getPatientDetails(patientId: string) {
    const response = await this.client.get(`/hospital/patients/${patientId}`);
    return response.data;
  }

  // Medical Records Management
  async getHospitalMedicalRecords(filters?: any) {
    const response = await this.client.get("/hospital/medical-records", {
      params: filters,
    });
    return response.data;
  }

  async approveMedicalRecord(
    recordId: string,
    status: "approved" | "rejected",
  ) {
    const response = await this.client.put(
      `/hospital/medical-records/${recordId}/approve`,
      { status },
    );
    return response.data;
  }

  async getMedicalRecordDetails(recordId: string) {
    const response = await this.client.get(
      `/hospital/medical-records/${recordId}`,
    );
    return response.data;
  }

  // Lab Orders Management
  async getHospitalLabOrders(filters?: any) {
    const response = await this.client.get("/hospital/lab-orders", {
      params: filters,
    });
    return response.data;
  }

  async approveLabOrder(orderId: string, status: "approved" | "rejected") {
    const response = await this.client.put(
      `/hospital/lab-orders/${orderId}/approve`,
      { status },
    );
    return response.data;
  }

  async updateLabOrderStatus(orderId: string, status: string) {
    const response = await this.client.put(
      `/hospital/lab-orders/${orderId}/status`,
      { status },
    );
    return response.data;
  }

  // Admissions Management
  async getHospitalAdmissions(filters?: any) {
    const response = await this.client.get("/hospital/admissions", {
      params: filters,
    });
    return response.data;
  }

  async approveAdmission(admissionId: string, status: "approved" | "rejected") {
    const response = await this.client.put(
      `/hospital/admissions/${admissionId}/approve`,
      { status },
    );
    return response.data;
  }

  async dischargePatient(admissionId: string, dischargeSummary: string) {
    const response = await this.client.put(
      `/hospital/admissions/${admissionId}/discharge`,
      { dischargeSummary },
    );
    return response.data;
  }

  // Bills Management
  async getHospitalBills(filters?: any) {
    const response = await this.client.get("/hospital/bills", {
      params: filters,
    });
    return response.data;
  }

  async generateBill(
    patientId: string,
    items: Array<{ description: string; amount: number }>,
  ) {
    const response = await this.client.post("/hospital/bills", {
      patientId,
      items,
    });
    return response.data;
  }

  async approveBill(billId: string) {
    const response = await this.client.put(`/hospital/bills/${billId}/approve`);
    return response.data;
  }

  // Pending Approvals (Dashboard Overview)
  async getPendingApprovals() {
    const response = await this.client.get("/hospital/pending-approvals");
    return response.data;
  }

  async getApprovalStats() {
    const response = await this.client.get("/hospital/approval-stats");
    return response.data;
  }
}

export default new ApiService();
