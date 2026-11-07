import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Receipt,
  Calendar,
  ShieldCheck,
  Search,
  RefreshCw,
  Users,
} from "lucide-react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import apiService from "../services/apiService";

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
  patient?: Patient | string;
  patientId?: string;
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

export default function Consult() {
  const navigate = useNavigate();
  const location = useLocation();

  // Active appointment state
  const [appointment, setAppointment] = useState<Appointment | null>(
    (location.state?.appointment as Appointment) || null,
  );

  // Queue of appointments if accessed directly
  const [appointmentsQueue, setAppointmentsQueue] = useState<Appointment[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [manualRoomInput, setManualRoomInput] = useState("");

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

  const zpInstanceRef = useRef<any>(null);

  const appointmentId = appointment?._id ?? "";
  const draftStorageKey = appointmentId
    ? `consultation-draft-${appointmentId}`
    : "consultation-draft-general";

  const patientName =
    (typeof appointment?.patient === "object"
      ? appointment?.patient?.fullname
      : null) ||
    appointment?.patientName ||
    "Patient";

  const patientEmail =
    (typeof appointment?.patient === "object"
      ? appointment?.patient?.email
      : null) ||
    appointment?.patientEmail ||
    "Not provided";

  const patientPhone =
    (typeof appointment?.patient === "object"
      ? appointment?.patient?.phone
      : null) ||
    appointment?.patientPhone ||
    "Not provided";

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

  // Check URL query parameters for appointmentId or roomId
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qId =
      params.get("appointmentId") ||
      params.get("roomID") ||
      params.get("roomId");

    if (qId && !appointment) {
      apiService
        .getAppointmentDetails(qId)
        .then((res: any) => {
          const item = res?.data || res?.appointment || res;
          if (item?._id) {
            setAppointment(item);
          }
        })
        .catch((err) => console.debug("Could not fetch appointment by query:", err));
    }
  }, [location.search, appointment]);

  // Load appointments queue if no appointment is active
  useEffect(() => {
    if (appointment) return;

    let isMounted = true;
    const fetchQueue = async () => {
      setLoadingQueue(true);
      try {
        const res: any = await apiService.getMyAppointments();
        const list = Array.isArray(res)
          ? res
          : res?.data || res?.appointments || [];
        if (isMounted) {
          setAppointmentsQueue(list);
        }
      } catch (err) {
        console.error("Failed to load appointment queue:", err);
      } finally {
        if (isMounted) setLoadingQueue(false);
      }
    };

    fetchQueue();
    return () => {
      isMounted = false;
    };
  }, [appointment]);

  // Load draft on mount / appointment change
  useEffect(() => {
    if (!appointmentId) return;
    const savedDraft = localStorage.getItem(draftStorageKey);
    if (!savedDraft) return;

    try {
      const data = JSON.parse(savedDraft);
      if (data?.consultationData) {
        setConsultationData(data.consultationData);
      }
      if (Array.isArray(data?.medications) && data.medications.length > 0) {
        setMedications(data.medications);
      }
    } catch (err) {
      console.error("Failed to load consult draft:", err);
    }
  }, [appointmentId, draftStorageKey]);

  // Save draft automatically
  useEffect(() => {
    if (!appointmentId) return;
    const draft = {
      consultationData,
      medications,
      videoStarted,
    };
    localStorage.setItem(draftStorageKey, JSON.stringify(draft));
  }, [
    appointmentId,
    consultationData,
    medications,
    videoStarted,
    draftStorageKey,
  ]);

  const clearDraft = () => {
    if (appointmentId) {
      localStorage.removeItem(draftStorageKey);
    }
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

      // Notify backend to create or join session
      try {
        if (appointmentId) {
          await apiService.createVideoRoom(appointmentId);
        }
      } catch (e) {
        console.debug("Backend room notify note:", e);
      }

      setVideoStarted(true);
      setSuccess("✅ Connected to live video consultation");
    } catch (error: any) {
      console.error("Error starting consultation:", error);
      setError(error.message || "Failed to start consultation");
      setVideoStarted(false);
    } finally {
      setLoading(false);
    }
  };

  const myMeeting = async (element: HTMLDivElement | null) => {
    if (!element || !appointmentId) return;

    const rawAppId = String(
      import.meta.env.VITE_ZEGO_APP_ID ||
        process.env.REACT_APP_ZEGO_APP_ID ||
        "",
    ).trim();

    // Guard against stale/expired AppID 1529041076 and ensure fallback to active Zego project
    const appID =
      !rawAppId || rawAppId === "0" || rawAppId === "1529041076"
        ? 138511367
        : Number(rawAppId);

    const rawSecret = String(
      import.meta.env.VITE_ZEGO_SERVER_SECRET ||
        process.env.REACT_APP_ZEGO_SERVER_SECRET ||
        "",
    ).trim();

    const serverSecret =
      !rawSecret || rawAppId === "1529041076"
        ? "9d89b6b960ebb7a9ecfcb538a259345a"
        : rawSecret;

    if (!appID || !serverSecret) {
      setError(
        "ZegoCloud credentials missing in .env (VITE_ZEGO_APP_ID & VITE_ZEGO_SERVER_SECRET).",
      );
      return;
    }

    try {
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        appointmentId,
        Date.now().toString(),
        doctorName,
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zpInstanceRef.current = zp;

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
        showUserList: true,
        showRoomTimer: true,
        showRoomDetailsButton: true,
        showLayoutButton: true,
        layout: "Auto",
        showNonVideoUser: true,
        showOnlyAudioUser: true,
        showLeaveRoomConfirmDialog: false,
        lowerLeftNotification: {
          showUserJoinAndLeave: true,
          showTextChat: true,
        },
        onLeaveRoom: () => {
          setVideoStarted(false);
        },
      });
    } catch (err: any) {
      console.error("Zego error:", err);
      setError(err?.message || "Failed to load video stream.");
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
        setSuccess("✅ Consultation ended and prescription saved to patient record");
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

  const handleQuickBill = async () => {
    const patId =
      (appointment?.patient as any)?._id ||
      (typeof appointment?.patient === "string" ? appointment.patient : null) ||
      (appointment as any)?.patientId;

    if (!patId) {
      setError("Patient ID not found for this consultation");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await apiService.createBill({
        patientId: patId,
        appointmentId: appointment?._id,
        lineItems: [
          {
            description: "Doctor Consultation Fee",
            category: "Consultation",
            quantity: 1,
            unitPrice: 500,
            amount: 500,
          },
        ],
        notes: `Consultation on ${new Date().toLocaleDateString()}`,
        status: "pending",
      });

      if (res?.success || res?.data) {
        setSuccess(
          `✅ Consultation Bill #${res.data?.billNumber || ""} issued to patient!`,
        );
      } else {
        throw new Error(res?.message || "Failed to generate bill");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to issue consultation bill",
      );
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

  // Filtered queue
  const filteredQueue = useMemo(() => {
    if (!searchQuery.trim()) return appointmentsQueue;
    const q = searchQuery.toLowerCase();
    return appointmentsQueue.filter((appt) => {
      const name =
        (typeof appt.patient === "object" ? appt.patient?.fullname : "") ||
        appt.patientName ||
        "";
      const notes = appt.notes || appt.reason || "";
      return name.toLowerCase().includes(q) || notes.toLowerCase().includes(q);
    });
  }, [appointmentsQueue, searchQuery]);

  // If no appointment is selected, render the Consultation Patient Selector
  if (!appointment) {
    return (
      <>
        <PageMeta
          title="Consultation Desk | CareConnect"
          description="Doctor Live Video Consultation Desk"
        />
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Top Navigation Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <span className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Video size={28} />
                  </span>
                  Clinical Consultation Desk
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Select a booked patient from your queue or enter an appointment ID to start live video consultation.
                </p>
              </div>

              <button
                onClick={() => navigate("/home")}
                className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition"
              >
                Back to Dashboard
              </button>
            </div>

            {/* Quick Connect by Room ID */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <ShieldCheck size={18} className="text-blue-600 dark:text-blue-400" />
                Quick Launch by Appointment ID
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                If the patient shared an appointment link or ID, enter it directly:
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualRoomInput.trim()) {
                    setLoading(true);
                    apiService
                      .getAppointmentDetails(manualRoomInput.trim())
                      .then((res: any) => {
                        const item = res?.data || res?.appointment || res;
                        if (item?._id) {
                          setAppointment(item);
                        } else {
                          setAppointment({
                            _id: manualRoomInput.trim(),
                            patientName: "Patient",
                            status: "in-progress",
                          });
                        }
                      })
                      .catch(() => {
                        setAppointment({
                          _id: manualRoomInput.trim(),
                          patientName: "Patient",
                          status: "in-progress",
                        });
                      })
                      .finally(() => setLoading(false));
                  }
                }}
                className="flex gap-2 max-w-lg"
              >
                <input
                  type="text"
                  placeholder="Enter Appointment ID (e.g. 672cf...)"
                  value={manualRoomInput}
                  onChange={(e) => setManualRoomInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!manualRoomInput.trim() || loading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm transition cursor-pointer"
                >
                  {loading ? "Opening..." : "Launch Desk"}
                </button>
              </form>
            </div>

            {/* Patients Queue */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users size={20} className="text-blue-600 dark:text-blue-400" />
                    Scheduled Patient Consultations
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Appointments booked with you available for video consultation
                  </p>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search patient..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {loadingQueue ? (
                <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw size={20} className="animate-spin text-blue-600" />
                  <span>Loading patient appointments...</span>
                </div>
              ) : filteredQueue.length > 0 ? (
                <div className="grid gap-3">
                  {filteredQueue.map((appt) => {
                    const patName =
                      (typeof appt.patient === "object"
                        ? appt.patient?.fullname
                        : null) ||
                      appt.patientName ||
                      "Patient";
                    const email =
                      (typeof appt.patient === "object"
                        ? appt.patient?.email
                        : null) ||
                      appt.patientEmail ||
                      "";
                    const isConfirmed = appt.status === "confirmed";

                    return (
                      <div
                        key={appt._id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg flex-shrink-0">
                            {patName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-base">
                              {patName}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {appt.notes || appt.reason || "Routine Consultation"}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar size={13} className="text-blue-500" />
                                {appt.date || "Today"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={13} className="text-blue-500" />
                                {appt.slot || "Consultation slot"}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                  isConfirmed
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                                }`}
                              >
                                {appt.status || "Pending"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setAppointment(appt)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition cursor-pointer shadow-sm"
                        >
                          <Video size={16} />
                          Open Consultation
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500">
                  <p className="text-sm mb-4">No scheduled patients found in queue.</p>
                  <button
                    onClick={() => navigate("/appointments")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
                  >
                    View All Appointments
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Active Live Consultation Desk
  return (
    <>
      <PageMeta
        title={`Live Consultation with ${patientName} | CareConnect`}
        description="Professional real-time video consultation with patient"
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAppointment(null)}
                className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition"
                title="Switch patient"
              >
                <ArrowLeft
                  size={20}
                  className="text-slate-600 dark:text-slate-400"
                />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Live Video Consultation</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-normal">
                    Dr. {doctorName}
                  </span>
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Consulting: <strong className="text-slate-900 dark:text-white">{patientName}</strong> • Room #{appointmentId.slice(-6)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAppointment(null)}
                className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Switch Patient
              </button>

              <div
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 ${
                  videoStarted
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-800"
                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    videoStarted ? "bg-green-500 animate-pulse" : "bg-amber-500"
                  }`}
                />
                {videoStarted ? "LIVE CONSULTATION" : "READY TO CALL"}
              </div>
            </div>
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-300 animate-in">
              <AlertCircle size={20} className="flex-shrink-0" />
              <span className="text-sm">{error}</span>
              <button onClick={() => setError("")} className="ml-auto">
                <X size={18} />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 rounded-xl flex items-center gap-3 text-green-700 dark:text-green-300 animate-in">
              <CheckCircle size={20} className="flex-shrink-0" />
              <span className="text-sm">{success}</span>
              <button onClick={() => setSuccess("")} className="ml-auto">
                <X size={18} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-12 gap-6">
            {/* Main Video Area */}
            <div className="col-span-12 lg:col-span-8">
              {/* Video Container */}
              <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-800 h-[480px] sm:h-[580px] lg:h-[640px] flex items-center justify-center relative">
                {videoStarted ? (
                  <div
                    className="h-full w-full bg-slate-950"
                    ref={myMeeting}
                  />
                ) : (
                  <div className="text-center p-8 max-w-md mx-auto">
                    <div className="w-20 h-20 rounded-3xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-5 border border-blue-500/20 shadow-inner">
                      <Video size={40} />
                    </div>
                    <h3 className="text-white text-xl font-bold mb-2">
                      Ready for Patient Consultation
                    </h3>
                    <p className="text-slate-400 text-sm mb-6">
                      Click below to activate your camera and microphone. The patient can join this exact consultation room simultaneously from their portal.
                    </p>
                    <button
                      type="button"
                      onClick={handleStartConsultation}
                      disabled={loading}
                      className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 mx-auto transition-all shadow-lg shadow-emerald-950 cursor-pointer"
                    >
                      <Phone size={20} />
                      {loading ? "Connecting Video..." : "Start Video Call"}
                    </button>

                    <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500 border-t border-slate-800 pt-6">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-emerald-400" />
                        HD Encrypted WebRTC
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle size={14} className="text-blue-400" />
                        Screen Sharing Ready
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Patient Info Card */}
              <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-bold text-xl flex items-center justify-center border-2 border-blue-500/30">
                      {patientName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {patientName}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                        <Mail size={13} /> {patientEmail}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                        <Phone size={13} /> {patientPhone}
                      </p>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 sm:justify-end">
                      <Clock size={13} /> Scheduled Slot
                    </p>
                    <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {appointmentDate
                        ? new Date(appointmentDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Today"}
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 text-xs font-semibold">
                      {appointmentTime || "Standard Slot"}
                    </p>
                  </div>
                </div>

                {/* Patient Concern */}
                {appointmentNotes && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-xs flex items-center gap-2 mb-1">
                      <AlertCircle
                        size={14}
                        className="text-blue-600 dark:text-blue-400"
                      />
                      Chief Complaint / Patient Notes
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm">
                      {appointmentNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Consultation Form Sidebar */}
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 max-h-[calc(100vh-140px)] overflow-y-auto">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📋 Clinical Notes</span>
                  </h2>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-md">
                    Auto-saved
                  </span>
                </div>

                {/* Symptoms */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
                    Symptoms
                  </label>
                  <textarea
                    name="symptoms"
                    value={consultationData.symptoms}
                    onChange={handleInputChange}
                    placeholder="Describe presented symptoms..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                {/* Diagnosis */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
                    Clinical Diagnosis
                  </label>
                  <textarea
                    name="diagnosis"
                    value={consultationData.diagnosis}
                    onChange={handleInputChange}
                    placeholder="Enter diagnosis..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                {/* Prescription Instructions */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
                    Prescription Instructions
                  </label>
                  <textarea
                    name="prescription"
                    value={consultationData.prescription}
                    onChange={handleInputChange}
                    placeholder="Dietary, lifestyle or rest instructions..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                {/* Medicines */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      💊 Prescribed Medications
                    </label>
                    <button
                      type="button"
                      onClick={addMedication}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                  <div className="space-y-2.5 mb-2">
                    {medications.map((med, index) => (
                      <div
                        key={index}
                        className="p-3 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-xl space-y-2"
                      >
                        <input
                          type="text"
                          placeholder="Medicine name (e.g. Paracetamol 500mg)"
                          value={med.name}
                          onChange={(e) =>
                            handleMedicationChange(index, "name", e.target.value)
                          }
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Dosage (e.g. 1-0-1)"
                            value={med.dosage}
                            onChange={(e) =>
                              handleMedicationChange(index, "dosage", e.target.value)
                            }
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            placeholder="Duration (e.g. 5 days)"
                            value={med.duration}
                            onChange={(e) =>
                              handleMedicationChange(
                                index,
                                "duration",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        {medications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedication(index)}
                            className="text-red-600 dark:text-red-400 text-xs hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={12} /> Remove Medicine
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Follow-up */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
                    📅 Next Follow-up Date
                  </label>
                  <input
                    type="date"
                    name="followUpDate"
                    value={consultationData.followUpDate}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
                    Internal Clinical Notes
                  </label>
                  <textarea
                    name="notes"
                    value={consultationData.notes}
                    onChange={handleInputChange}
                    placeholder="Doctor private observations..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                {/* File Upload */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
                    📎 Attach Prescription / Lab File
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.png,.jpeg"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  {prescriptionFile && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1.5 flex items-center gap-1">
                      <CheckCircle size={12} /> {prescriptionFile.name}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <button
                    type="button"
                    onClick={handleEndConsultation}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm text-sm"
                  >
                    <PhoneOff size={16} />
                    {loading ? "Finalizing..." : "End & Save to Patient Record"}
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickBill}
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <Receipt size={16} />
                    Issue Consultation Bill (₹500)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const draft = {
                        consultationData,
                        medications,
                        videoStarted,
                      };
                      localStorage.setItem(draftStorageKey, JSON.stringify(draft));
                      setSuccess("✅ Draft saved locally");
                    }}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <Save size={14} />
                    Save Draft
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
