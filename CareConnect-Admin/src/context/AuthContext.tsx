import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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
    // Load token from localStorage on mount
    try {
      const savedToken = localStorage.getItem("adminToken");
      const savedAdmin = localStorage.getItem("admin");

      if (savedToken && savedAdmin && savedAdmin !== "undefined") {
        setToken(savedToken);
        setAdmin(JSON.parse(savedAdmin));
      } else {
        // Clear corrupted data
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
      }
    } catch (error) {
      console.error("Error loading auth from localStorage:", error);
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("🔄 AuthContext: Sending login request...");
      const response = await fetch(
        "http://localhost:3001/api/auth/admin-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );

      console.log("📨 AuthContext: Got response, status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ AuthContext: Response not OK", errorData);
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      console.log("✅ AuthContext: Got login data successfully");
      console.log("   Token:", data.data.token?.substring(0, 20) + "...");
      console.log("   Admin:", data.data.admin);

      setToken(data.data.token);
      setAdmin(data.data.admin);

      localStorage.setItem("adminToken", data.data.token);
      localStorage.setItem("admin", JSON.stringify(data.data.admin));

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
