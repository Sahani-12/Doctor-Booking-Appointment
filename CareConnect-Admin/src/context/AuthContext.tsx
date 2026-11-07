import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { API_BASE } from "../constants/api";

interface AuthContextType {
  token: string | null;
  admin: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem("adminToken");
        const savedAdmin = localStorage.getItem("admin");

        if (savedToken) {
          // Verify token against backend to ensure active valid admin session
          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${savedToken}` },
          });

          if (res.ok) {
            const data = await res.json();
            const currentUser = data?.data;
            const role = currentUser?.role?.toLowerCase();
            if (role === "admin" || role === "doctor") {
              setToken(savedToken);
              setAdmin(currentUser);
              localStorage.setItem("admin", JSON.stringify(currentUser));
            } else {
              console.warn(
                "⚠️ Non-staff token in Admin Portal. Role:",
                currentUser?.role,
              );
              localStorage.removeItem("adminToken");
              localStorage.removeItem("admin");
              setToken(null);
              setAdmin(null);
            }
          } else {
            console.warn("⚠️ Admin token verification failed, clearing session.");
            localStorage.removeItem("adminToken");
            localStorage.removeItem("admin");
            setToken(null);
            setAdmin(null);
          }
        } else {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("admin");
          setToken(null);
          setAdmin(null);
        }
      } catch (error) {
        console.error("Error verifying admin auth:", error);
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        setToken(null);
        setAdmin(null);
      } finally {
        setIsLoading(false);
      }
    };

    void initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("🔄 AuthContext: Sending login request...");
      const response = await fetch(`${API_BASE}/auth/admin-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("📨 AuthContext: Got response, status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ AuthContext: Response not OK", errorData);
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      const adminData = data.data.admin || data.data.user;

      if (adminData?.role !== "admin") {
        throw new Error("Access denied: You are not authorized as an Administrator.");
      }

      console.log("✅ AuthContext: Got login data successfully");
      setToken(data.data.token);
      setAdmin(adminData);

      localStorage.setItem("adminToken", data.data.token);
      localStorage.setItem("admin", JSON.stringify(adminData));

      console.log("💾 AuthContext: Saved to localStorage");
    } catch (error) {
      console.error("❌ AuthContext: Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
  };

  return (
    <AuthContext.Provider value={{ token, admin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
