import { useState, useEffect } from "react";
import { Save, AlertCircle, Loader } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://doctor-booking-appointment-i137.onrender.com";

export default function SettingsPage() {
  const { token } = useAuth();

  const [appName, setAppName] = useState("CareConnect");
  const [supportEmail, setSupportEmail] = useState("support@careconnect.com");
  const [supportPhone, setSupportPhone] = useState("+91-9876543210");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLocalSettings();
    if (token) {
      fetchSettings();
    }
  }, [token]);

  // 🔹 Load from localStorage first
  const loadLocalSettings = () => {
    const saved = localStorage.getItem("appSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAppName(parsed.appName || "CareConnect");
        setSupportEmail(parsed.supportEmail || "support@careconnect.com");
        setSupportPhone(parsed.supportPhone || "+91-9876543210");
      } catch {
        console.log("Invalid local storage data");
      }
    }
  };

  // 🔹 Fetch from backend
  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.data) {
        setAppName(data.data.appName || "CareConnect");
        setSupportEmail(data.data.supportEmail || "support@careconnect.com");
        setSupportPhone(data.data.supportPhone || "+91-9876543210");
      }
    } catch (err) {
      console.log("Backend not reachable");
    }
  };

  // 🔹 Save Settings
  const handleSave = async () => {
    // ✅ Validation
    if (!appName || !supportEmail || !supportPhone) {
      return setError("All fields are required");
    }

    if (!supportEmail.includes("@")) {
      return setError("Invalid email format");
    }

    try {
      setLoading(true);
      setSuccess(false);
      setError("");

      const response = await fetch(`${API_URL}/api/admin/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appName,
          supportEmail,
          supportPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save settings");
      }

      // ✅ Save locally
      localStorage.setItem(
        "appSettings",
        JSON.stringify({ appName, supportEmail, supportPhone }),
      );

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl shadow-xl">
            <div className="text-3xl">⚙️</div>
          </div>
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-violet-700 dark:from-violet-400 dark:to-violet-300 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg mt-1">
              Manage application configuration
            </p>
          </div>
        </div>
      </div>

      {/* Success */}
      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex gap-3">
          <div className="text-green-400">✓</div>
          <p className="text-green-300 font-medium">
            Settings saved successfully!
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              App Name
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              Support Email
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              Support Phone
            </label>
            <input
              type="tel"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading || !appName || !supportEmail || !supportPhone}
            className="w-full flex justify-center items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 rounded-lg"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <p className="text-blue-800 dark:text-blue-300 text-sm">
            Admin panel for CareConnect Doctor Booking System.
          </p>
        </div>
      </div>
    </div>
  );
}
