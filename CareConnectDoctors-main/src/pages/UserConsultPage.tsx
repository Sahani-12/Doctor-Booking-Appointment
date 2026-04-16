import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import {
  ArrowLeft,
  Video,
  Phone,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";

// Interfaces (can be shared in a types file)
interface Doctor {
  _id: string;
  fullname: string;
  specialization?: string | string[];
  profileImage?: string;
}

interface Appointment {
  _id: string;
  doctor?: Doctor;
  doctorName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  date?: string;
  slot?: string;
  status: string;
}

// Component
export default function UserConsultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const appointment = location.state?.appointment as Appointment;

  const [videoStarted, setVideoStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const appointmentId = appointment?._id ?? "new-consult";
  const doctorName =
    appointment?.doctor?.fullname || appointment?.doctorName || "Doctor";
  const appointmentDate = appointment?.date || appointment?.appointmentDate;
  const appointmentTime = appointment?.slot || appointment?.appointmentTime;

  // Get patient name from local storage
  const patientName = useMemo(() => {
    try {
      const stored =
        localStorage.getItem("user") || sessionStorage.getItem("user") || "{}";
      const user = JSON.parse(stored);
      return user?.fullname || user?.name || "Patient";
    } catch {
      return "Patient";
    }
  }, []);

  const handleJoinCall = () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to join the call.");
      navigate("/login");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("✅ Connecting to video call...");
    setVideoStarted(true);
    setLoading(false);
  };

  const myMeeting = async (element: HTMLDivElement) => {
    if (!element) return;

    const appID = Number(import.meta.env.VITE_ZEGO_APP_ID || 0);
    const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET || "";

    if (!appID || !serverSecret) {
      setError("Video call service is not configured. Please contact support.");
      return;
    }

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      appointmentId, // Room ID - MUST be same as doctor's
      Date.now().toString(), // User ID - must be unique
      patientName, // User Name
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zp.joinRoom({
      container: element,
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      showPreJoinView: false,
      turnOnCameraWhenJoining: true,
      turnOnMicrophoneWhenJoining: true,
      showMyCameraToggleButton: true,
      showMyMicrophoneToggleButton: true,
      showAudioVideoSettingsButton: true,
      showScreenSharingButton: true,
      showTextChat: true,
      showLeaveRoomConfirmDialog: true, // Good for users to confirm leaving
      onLeaveRoom: () => {
        // Redirect back to appointments page after leaving the call
        navigate("/my-appointments"); // Adjust this path if needed
      },
    });
  };

  if (!appointment) {
    // Handle case where no appointment is passed
    return (
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        <div>
          <h2 className="text-xl font-bold mb-2">No Appointment Found</h2>
          <p className="text-gray-600 mb-4">
            Please go back to your appointments and select one to join the call.
          </p>
          <button
            onClick={() => navigate("/my-appointments")} // Adjust this path if needed
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Go to My Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Video Consultation
              </h1>
              <p className="text-gray-600">with Dr. {doctorName}</p>
            </div>
          </div>
          <div
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              videoStarted
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {videoStarted ? "🔴 LIVE" : "⏱️ Ready to Join"}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-auto">
              <X size={18} />
            </button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-lg flex items-center gap-3 text-green-700">
            <CheckCircle size={20} />
            <span>{success}</span>
            <button onClick={() => setSuccess("")} className="ml-auto">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Area */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-2xl overflow-hidden shadow-lg border border-gray-200 h-96 sm:h-[500px] flex items-center justify-center relative">
              {videoStarted ? (
                <div className="h-full w-full bg-black" ref={myMeeting} />
              ) : (
                <div className="text-center">
                  <Video
                    size={64}
                    className="text-white opacity-30 mx-auto mb-4"
                  />
                  <p className="text-white mb-6 text-lg">
                    Your consultation will start here.
                  </p>
                  <button
                    onClick={handleJoinCall}
                    disabled={loading}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold rounded-lg flex items-center gap-2 mx-auto transition-transform hover:scale-105"
                  >
                    <Phone size={20} />
                    {loading ? "Connecting..." : "Join Video Call"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Appointment Details
              </h3>
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={
                    appointment.doctor?.profileImage ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${doctorName}`
                  }
                  alt={doctorName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                />
                <div>
                  <h4 className="font-bold text-lg">Dr. {doctorName}</h4>
                  <p className="text-gray-600 text-sm">
                    {Array.isArray(appointment.doctor?.specialization)
                      ? appointment.doctor.specialization.join(", ")
                      : appointment.doctor?.specialization ||
                        "General Physician"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Clock size={16} /> Date & Time
                  </span>
                  <span className="font-semibold text-gray-800">
                    {appointmentDate
                      ? new Date(appointmentDate).toLocaleDateString()
                      : "-"}{" "}
                    at {appointmentTime || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-2">
                    <User size={16} /> Status
                  </span>
                  <span
                    className={`font-semibold px-2 py-1 rounded-full text-xs ${
                      appointment.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {appointment.status.charAt(0).toUpperCase() +
                      appointment.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2">Instructions</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Ensure you have a stable internet connection.</li>
                  <li>Find a quiet, well-lit area for the call.</li>
                  <li>Allow browser access to your camera and microphone.</li>
                  <li>If the call drops, you can rejoin from this page.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
