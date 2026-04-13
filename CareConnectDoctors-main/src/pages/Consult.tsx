import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import PageMeta from "../components/common/PageMeta";
import { API_BASE } from "../constants/api";
import {
  Phone,
  PhoneOff,
  Video,
  Clock,
  User,
  Mail,
  AlertCircle,
  CheckCircle,
  Download,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  X,
} from "lucide-react";

interface Patient {
  _id: string;
  fullname: string;
  email: string;
  phone?: string;
  age?: number;
  city?: string;
  profileImage?: string;
}

interface Appointment {
  _id: string;
  patient?: Patient;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  date?: string;
  slot?: string;
  status: string;
  notes?: string;
  reason?: string;
  reasonForVisit?: string;
  visitedFor?: string;
  prescription?: string;
  prescriptionFile?: string;
}

interface ConsultationData {
  symptoms: string;
  diagnosis: string;
  prescription: string;
  medications: Array<{ name: string; dosage: string; duration: string }>;
  followUpDate: string;
  notes: string;
}

const safeRoomName = (roomID: string) =>
  `careconnect-${String(roomID).replace(/[^a-zA-Z0-9_-]/g, "-")}`;

const buildMeetingUrl = (roomID: string, displayName: string) =>
  `https://meet.jit.si/${safeRoomName(
    roomID,
  )}#config.prejoinPageEnabled=false&userInfo.displayName=${encodeURIComponent(
    displayName || "Doctor",
  )}`;

export default function Consult() {
  const navigate = useNavigate();
  const location = useLocation();
  const appointment = location.state?.appointment as Appointment;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [consultationData, setConsultationData] = useState<ConsultationData>({
    symptoms: "",
    diagnosis: "",
    prescription: "",
    medications: [{ name: "", dosage: "", duration: "" }],
    followUpDate: "",
    notes: "",
  });

  const [medications, setMedications] = useState([
    { name: "", dosage: "", duration: "" },
  ]);

  const [videoStarted, setVideoStarted] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);

  const appointmentId = appointment?._id ?? "new-consult";
  const draftStorageKey = `consultation-draft-${appointmentId}`;
  const patientName =
    appointment?.patient?.fullname || appointment?.patientName || "Patient";
  const patientEmail =
    appointment?.patient?.email || appointment?.patientEmail || "Not provided";
  const patientPhone =
    appointment?.patient?.phone || appointment?.patientPhone || "Not provided";
  const appointmentDate = appointment?.date || appointment?.appointmentDate;
  const appointmentTime = appointment?.slot || appointment?.appointmentTime;
  const appointmentNotes =
    appointment?.notes ||
    appointment?.reason ||
    appointment?.reasonForVisit ||
    appointment?.visitedFor;
  const doctorName = useMemo(() => {
    try {
      const stored =
        localStorage.getItem("user") || sessionStorage.getItem("user") || "{}";
      const user = JSON.parse(stored);
      return user?.fullname || user?.name || "Doctor";
    } catch {
      return "Doctor";
    }
  }, []);
  const meetingUrl = useMemo(
    () => buildMeetingUrl(appointmentId, doctorName),
    [appointmentId, doctorName],
  );

  // Load draft on mount
  useEffect(() => {
    if (!appointment) return;
    const savedDraft = localStorage.getItem(draftStorageKey);
    if (!savedDraft) return;

    try {
      const data = JSON.parse(savedDraft) as {
        consultationData: ConsultationData;
        medications: Array<{ name: string; dosage: string; duration: string }>;
        videoStarted: boolean;
      };

      if (data?.consultationData) {
        setConsultationData(data.consultationData);
      }
      if (Array.isArray(data?.medications) && data.medications.length > 0) {
        setMedications(data.medications);
      }
    } catch (err) {
      console.error("Failed to load consult draft:", err);
    }
  }, [appointment, draftStorageKey]);

  // Save draft automatically
  useEffect(() => {
    if (!appointment) return;
    const draft = {
      consultationData,
      medications,
      videoStarted,
    };
    localStorage.setItem(draftStorageKey, JSON.stringify(draft));
  }, [
    appointment,
    consultationData,
    medications,
    videoStarted,
    draftStorageKey,
  ]);

  const clearDraft = () => {
    localStorage.removeItem(draftStorageKey);
  };

  // Initialize Jitsi Meet using iframe
  const initJitsiMeet = () => {
    setSuccess("Connected to video call");
    return;
    /*
    if (!jitsiContainerRef.current) {
      console.error("❌ Container not found");
      setError("Video container not found. Please refresh the page.");
      return;
    }

    try {
      // Clear container
      jitsiContainerRef.current.innerHTML = "";

      // Create a mock video interface (simulates video call)
      const mockVideoDiv = document.createElement("div");
      mockVideoDiv.style.width = "100%";
      mockVideoDiv.style.height = "100%";
      mockVideoDiv.style.backgroundColor = "#000";
      mockVideoDiv.style.display = "flex";
      mockVideoDiv.style.alignItems = "center";
      mockVideoDiv.style.justifyContent = "center";
      mockVideoDiv.style.position = "relative";
      mockVideoDiv.style.overflow = "hidden";

      // Add gradient background to simulate video
      mockVideoDiv.style.background =
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";

      // Create main video area (patient)
      const mainVideo = document.createElement("div");
      mainVideo.style.width = "100%";
      mainVideo.style.height = "100%";
      mainVideo.style.backgroundColor = "#1a1a1a";
      mainVideo.style.display = "flex";
      mainVideo.style.alignItems = "center";
      mainVideo.style.justifyContent = "center";
      mainVideo.style.position = "relative";

      const patientName = appointment.patient?.fullname || "Patient";
      const videoContent = `
        <div style="text-align: center; color: white;">
          <div style="font-size: 64px; margin-bottom: 16px;">👤</div>
          <div style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">${patientName}</div>
          <div style="font-size: 14px; color: #aaa;">Connected</div>
          <div style="margin-top: 24px; display: flex; gap: 12px; justify-content: center;">
            <div style="width: 12px; height: 12px; background: #4ade80; border-radius: 50%; animation: pulse 2s infinite;"></div>
            <span style="font-size: 12px;">Video Active</span>
          </div>
        </div>
      `;

      mainVideo.innerHTML = videoContent;

      // Add pulse animation
      const style = document.createElement("style");
      style.textContent = `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `;
      document.head.appendChild(style);

      jitsiContainerRef.current.appendChild(mainVideo);

      console.log("✅ Video call interface initialized");
      setSuccess("✅ Connected to video call - Mock Mode");
    } catch (err: any) {
      console.error("❌ Error initializing video:", err);
      setError(err.message || "Failed to initialize video conference");
    }
    */
  };

  const handleStartConsultation = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");

      if (!token) {
        setError("Please login first");
        navigate("/");
        return;
      }

      setVideoStarted(true);
      setSuccess("✅ Connecting to video call...");

      // Initialize Jitsi meet with a small delay to ensure DOM is ready
      setTimeout(() => {
        initJitsiMeet();
      }, 100);
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message || "Failed to start consultation");
      setVideoStarted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEndConsultation = async () => {
    try {
      setLoading(true);
      setError("");
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");

      const prescriptionPayload = {
        symptoms: consultationData.symptoms,
        diagnosis: consultationData.diagnosis,
        prescription: consultationData.prescription,
        medications,
        followUpDate: consultationData.followUpDate,
        notes: consultationData.notes,
        prescriptionFileName: prescriptionFile?.name || null,
      };

      const response = await fetch(`${API_BASE}/video/save-prescription`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
          prescriptionData: prescriptionPayload,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setSuccess("✅ Consultation ended and prescription saved");
        clearDraft();
        setVideoStarted(false);
        setTimeout(() => navigate("/appointments"), 1500);
      } else {
        setError(data.message || "Failed to save consultation");
      }
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message || "Failed to save consultation");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setConsultationData({ ...consultationData, [name]: value });
  };

  const handleMedicationChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const newMedications = [...medications];
    newMedications[index] = {
      ...newMedications[index],
      [field]: value,
    };
    setMedications(newMedications);
  };

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", duration: "" }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPrescriptionFile(e.target.files[0]);
    }
  };

  // Load Jitsi Meet script
  useEffect(() => {
    // Using iframe-based approach, no script loading needed
    console.log("✅ Video system ready (iframe-based)");
  }, []);

  if (!appointment) {
    return (
      <>
        <PageMeta
          title="Consultation | CareConnect"
          description="Select an appointment from your dashboard"
        />
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 text-center max-w-lg mx-auto mt-8 px-4">
          <p className="text-gray-700 mb-4">
            Choose a patient from <strong>Recent Appointments</strong> on the
            dashboard and tap <strong>Open</strong> to start a consultation.
          </p>
          <button
            type="button"
            className="rounded-lg bg-brand-500 px-4 py-2.5 text-white text-sm font-medium hover:bg-brand-600"
            onClick={() => navigate("/home")}
          >
            Back to dashboard
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Live Consultation | CareConnect"
        description="Professional video consultation with patient"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/appointments")}
                className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition"
              >
                <ArrowLeft
                  size={20}
                  className="text-slate-600 dark:text-slate-400"
                />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  📞 Live Consultation
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  with {patientName}
                </p>
              </div>
            </div>
            <div
              className={`px-4 py-2 rounded-lg font-medium text-sm ${videoStarted ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"}`}
            >
              {videoStarted ? "🔴 LIVE" : "⏱️ Ready"}
            </div>
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-300 animate-in">
              <AlertCircle size={20} className="flex-shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError("")} className="ml-auto">
                <X size={18} />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 rounded-lg flex items-center gap-3 text-green-700 dark:text-green-300 animate-in">
              <CheckCircle size={20} className="flex-shrink-0" />
              <span>{success}</span>
              <button onClick={() => setSuccess("")} className="ml-auto">
                <X size={18} />
              </button>
            </div>
          )}

          {/* Info Banner for Video Mode */}
          {videoStarted && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-lg flex items-center gap-3 text-blue-700 dark:text-blue-300">
              <AlertCircle size={20} className="flex-shrink-0" />
              <span className="text-sm">
                Patient can join the same room from their appointment dashboard.
              </span>
            </div>
          )}

          <div className="grid grid-cols-12 gap-6">
            {/* Main Video Area */}
            <div className="col-span-12 lg:col-span-8">
              {/* Video Container */}
              <div className="bg-black rounded-2xl overflow-hidden shadow-xl border border-slate-300 dark:border-slate-700 h-96 sm:h-[500px] flex items-center justify-center relative">
                {videoStarted ? (
                  <iframe
                    title={`Video consultation with ${patientName}`}
                    src={meetingUrl}
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    className="h-full w-full border-0 bg-black"
                  />
                ) : (
                  <div className="text-center">
                    <Video
                      size={64}
                      className="text-white opacity-30 mx-auto mb-4"
                    />
                    <p className="text-white mb-6 text-lg">
                      Ready to start consultation
                    </p>
                    <button
                      onClick={handleStartConsultation}
                      disabled={loading}
                      className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold rounded-lg flex items-center gap-2 mx-auto transition-all transform hover:scale-105"
                    >
                      <Phone size={20} />
                      {loading ? "Connecting..." : "Start Video Call"}
                    </button>
                  </div>
                )}
              </div>

              {/* Patient Info Card */}
              <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        appointment.patient?.profileImage ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${patientName}&scale=80`
                      }
                      alt={patientName}
                      className="w-16 h-16 rounded-full object-cover border-4 border-blue-500"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {patientName}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Mail size={14} /> {patientEmail}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Phone size={14} /> {patientPhone}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 justify-end">
                      <Clock size={14} /> Appointment Time
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {appointmentDate
                        ? new Date(appointmentDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : "-"}
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 font-semibold">
                      {appointmentTime || "-"}
                    </p>
                  </div>
                </div>

                {/* Patient Concern */}
                {appointmentNotes && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                      <AlertCircle
                        size={16}
                        className="text-blue-600 dark:text-blue-400"
                      />
                      Chief Complaint
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300">
                      {appointmentNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Consultation Form Sidebar */}
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  📋 Consultation Notes
                </h2>

                {/* Symptoms */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Symptoms
                  </label>
                  <textarea
                    name="symptoms"
                    value={consultationData.symptoms}
                    onChange={handleInputChange}
                    placeholder="Describe patient symptoms..."
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    disabled={!videoStarted}
                  />
                </div>

                {/* Diagnosis */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Diagnosis
                  </label>
                  <textarea
                    name="diagnosis"
                    value={consultationData.diagnosis}
                    onChange={handleInputChange}
                    placeholder="Enter your diagnosis..."
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    disabled={!videoStarted}
                  />
                </div>

                {/* Prescription */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Prescription
                  </label>
                  <textarea
                    name="prescription"
                    value={consultationData.prescription}
                    onChange={handleInputChange}
                    placeholder="Write prescription instructions..."
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    disabled={!videoStarted}
                  />
                </div>

                {/* Medicines */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    💊 Medications
                  </label>
                  <div className="space-y-3 mb-3">
                    {medications.map((med, index) => (
                      <div
                        key={index}
                        className="p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg space-y-2"
                      >
                        <input
                          type="text"
                          placeholder="Medicine name"
                          value={med.name}
                          onChange={(e) =>
                            handleMedicationChange(
                              index,
                              "name",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                          disabled={!videoStarted}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Dosage"
                            value={med.dosage}
                            onChange={(e) =>
                              handleMedicationChange(
                                index,
                                "dosage",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                            disabled={!videoStarted}
                          />
                          <input
                            type="text"
                            placeholder="Duration"
                            value={med.duration}
                            onChange={(e) =>
                              handleMedicationChange(
                                index,
                                "duration",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                            disabled={!videoStarted}
                          />
                        </div>
                        {medications.length > 1 && (
                          <button
                            onClick={() => removeMedication(index)}
                            className="text-red-600 dark:text-red-400 text-sm hover:underline flex items-center gap-1 mt-2"
                            disabled={!videoStarted}
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addMedication}
                    className="w-full px-4 py-2 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm font-semibold flex items-center justify-center gap-2 transition"
                    disabled={!videoStarted}
                  >
                    <Plus size={16} /> Add Medicine
                  </button>
                </div>

                {/* Follow-up */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    📅 Follow-up Date
                  </label>
                  <input
                    type="date"
                    name="followUpDate"
                    value={consultationData.followUpDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!videoStarted}
                  />
                </div>

                {/* Notes */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={consultationData.notes}
                    onChange={handleInputChange}
                    placeholder="Any additional notes..."
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    disabled={!videoStarted}
                  />
                </div>

                {/* File Upload */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    📎 Prescription File
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.png,.jpeg"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    disabled={!videoStarted}
                  />
                  {prescriptionFile && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                      <CheckCircle size={14} /> {prescriptionFile.name}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-5 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  {videoStarted ? (
                    <>
                      <button
                        onClick={handleEndConsultation}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <PhoneOff size={18} />
                        {loading ? "Saving..." : "End & Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const draft = {
                            consultationData,
                            medications,
                            videoStarted,
                          };
                          localStorage.setItem(
                            draftStorageKey,
                            JSON.stringify(draft),
                          );
                          setSuccess("✅ Draft saved");
                        }}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <Save size={18} />
                        Save Draft
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate("/appointments")}
                        className="w-full px-4 py-3 bg-slate-400 hover:bg-slate-500 text-white font-bold rounded-lg transition"
                      >
                        Back
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
