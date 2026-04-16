import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Video, PhoneOff, ArrowLeft } from "lucide-react";

export default function VideoConsultation() {
  const location = useLocation();
  const navigate = useNavigate();
  const appointment = location.state?.appointment;

  const [userName, setUserName] = useState("Patient");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.fullname) {
      setUserName(user.fullname);
    }
  }, []);

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
          Invalid Video Session
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Exactly matches the doctor's room logic
  const safeRoomName = `careconnect-${String(appointment._id).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const meetingUrl = `https://meet.jit.si/${safeRoomName}#config.prejoinPageEnabled=false&userInfo.displayName=${encodeURIComponent(userName)}`;

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 text-white shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-700 rounded-full transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Video size={20} className="text-green-400" />
              Consultation with Dr. {appointment.doctor?.fullname || "Doctor"}
            </h1>
            <p className="text-sm text-gray-400">
              Secure End-to-End Encrypted Call
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition"
        >
          <PhoneOff size={18} /> End Call
        </button>
      </div>
      <div className="flex-1 w-full bg-black">
        <iframe
          src={meetingUrl}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="w-full h-full border-0"
          title="Video Consultation"
        ></iframe>
      </div>
    </div>
  );
}
