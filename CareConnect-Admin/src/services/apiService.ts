import axios, { AxiosInstance } from "axios";

const API_BASE_URL = "https://doctor-booking-appointment-i137.onrender.com/api";

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
}

export default new ApiService();
