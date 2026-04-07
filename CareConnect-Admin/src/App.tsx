import { useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useEffect } from "react";
import AppRoutes from "./routes";
import Sidebar from "./layout/Sidebar";
import Header from "./layout/Header";

function App() {
  const { token, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(
      "🎨 App: State changed - isLoading:",
      isLoading,
      "token:",
      token?.substring(0, 20) + "..." || "NO TOKEN",
    );
    if (!isLoading && !token) {
      console.log("⚠️  App: No token, redirecting to login...");
      navigate("/login");
    }
  }, [token, isLoading, navigate]);

  if (isLoading) {
    console.log("⏳ App: Still loading...");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    console.log("🔑 App: Showing login page");
    return <AppRoutes />;
  }

  console.log("✅ App: Showing dashboard with token");
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto">
          <AppRoutes />
        </div>
      </div>
    </div>
  );
}

export default App;
