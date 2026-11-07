import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import BASE_URL from "../constants/api";
import {
  ArrowLeft,
  Video,
  VideoOff,
  PhoneOff,
  User,
  Clock,
  Calendar,
  AlertCircle,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export default function VideoConfrence() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeParams = useParams();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  // Extract room ID from all possible parameter sources
  const roomID =
    searchParams.get("roomID") ||
    searchParams.get("roomId") ||
    searchParams.get("appointmentId") ||
    routeParams?.roomId ||
    routeParams?.appointmentId ||
    location.state?.appointmentId ||
    location.state?.appointment?._id ||
    "";

  const [appointment, setAppointment] = useState(
    location.state?.appointment || null,
  );
  const [myAppointments, setMyAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [customRoomInput, setCustomRoomInput] = useState("");
  const [zegoError, setZegoError] = useState("");
  const meetingContainerRef = useRef(null);
  const zpInstanceRef = useRef(null);

  // User details
  const userInfo = useMemo(() => {
    try {
      const stored =
        sessionStorage.getItem("user") || localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        return {
          id: u._id || u.id || String(Date.now()),
          name: u.fullname || u.name || "Patient",
        };
      }
    } catch (e) {
      console.warn("Could not parse user from storage:", e);
    }
    return {
      id: String(Date.now()),
      name: "Patient",
    };
  }, []);

  // If appointment wasn't provided in state, fetch details if roomID looks like an appointment ID
  useEffect(() => {
    if (!roomID || appointment) return;

    let isMounted = true;
    const fetchAppointmentDetails = async () => {
      try {
        const token =
          sessionStorage.getItem("token") || localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(`${BASE_URL}/appointments/${roomID}`, {
          headers,
        });
        if (!res.ok) return;

        const json = await res.json();
        const data = json.data || json.appointment || json;
        if (isMounted && data?._id) {
          setAppointment(data);
        }
      } catch (err) {
        console.debug("Could not fetch appointment details for room:", err);
      }
    };

    fetchAppointmentDetails();
    return () => {
      isMounted = false;
    };
  }, [roomID, appointment]);

  // If no roomID is provided, fetch user's active appointments so they can pick one
  useEffect(() => {
    if (roomID) return;

    let isMounted = true;
    const fetchMyAppointments = async () => {
      setLoadingAppts(true);
      try {
        const token =
          sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) {
          setLoadingAppts(false);
          return;
        }

        const res = await fetch(`${BASE_URL}/appointments/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch appointments");

        const json = await res.json();
        const list = Array.isArray(json)
          ? json
          : json.data || json.appointments || [];

        if (isMounted) {
          setMyAppointments(list);
        }
      } catch (err) {
        console.error("Failed to load appointments for video list:", err);
      } finally {
        if (isMounted) setLoadingAppts(false);
      }
    };

    fetchMyAppointments();
    return () => {
      isMounted = false;
    };
  }, [roomID]);

  // Initialize ZegoCloud video room
  useEffect(() => {
    if (!roomID || !meetingContainerRef.current) return;

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
      setZegoError(
        "ZegoCloud credentials missing. Please verify VITE_ZEGO_APP_ID and VITE_ZEGO_SERVER_SECRET in your environment file.",
      );
      return;
    }

    try {
      setZegoError("");
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        String(userInfo.id),
        String(userInfo.name),
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zpInstanceRef.current = zp;

      zp.joinRoom({
        container: meetingContainerRef.current,
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
        showLeaveRoomConfirmDialog: true,
        lowerLeftNotification: {
          showUserJoinAndLeave: true,
          showTextChat: true,
        },
        onLeaveRoom: () => {
          navigate("/appointments");
        },
      });
    } catch (err) {
      console.error("Zego initialization error:", err);
      setZegoError(err.message || "Failed to initialize video room.");
    }

    return () => {
      if (zpInstanceRef.current?.destroy) {
        try {
          zpInstanceRef.current.destroy();
        } catch {}
      }
    };
  }, [roomID, userInfo]);

  const doctorName =
    appointment?.doctor?.fullname ||
    appointment?.doctorName ||
    "Specialist Doctor";
  const doctorSpec = Array.isArray(appointment?.doctor?.specialization)
    ? appointment.doctor.specialization.join(", ")
    : appointment?.doctor?.specialization || "Clinical Specialist";

  // If no room is specified, show the Appointment Selection Desk
  if (!roomID) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        {/* Top bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
              title="Go Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Video size={20} />
              </span>
              <div>
                <h1 className="text-base font-bold text-white leading-tight">
                  CareConnect Telehealth
                </h1>
                <p className="text-xs text-slate-400">
                  Doctor & Patient Video Consultation
                </p>
              </div>
            </div>
          </div>
          <Link
            to="/appointments"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            My Appointments
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-center">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl mb-8">
            <div className="text-center max-w-xl mx-auto mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
                <Video size={32} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Join Video Consultation
              </h2>
              <p className="text-sm text-slate-400">
                Connect directly with your doctor in real time. Choose an
                appointment below or enter your consultation room ID.
              </p>
            </div>

            {/* Quick manual entry */}
            <div className="max-w-md mx-auto mb-10">
              <label className="block text-xs font-medium text-slate-300 mb-2 text-center">
                Have a Consultation Room ID or Appointment ID?
              </label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customRoomInput.trim()) {
                    navigate(`/video?roomID=${encodeURIComponent(customRoomInput.trim())}`);
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Paste Appointment ID here..."
                  value={customRoomInput}
                  onChange={(e) => setCustomRoomInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!customRoomInput.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition"
                >
                  Join
                </button>
              </form>
            </div>

            {/* Appointment list */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Calendar size={16} className="text-emerald-400" />
                  Your Scheduled Appointments
                </h3>
                <span className="text-xs text-slate-500">
                  {myAppointments.length} Available
                </span>
              </div>

              {loadingAppts ? (
                <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw size={18} className="animate-spin text-emerald-400" />
                  <span>Loading appointments...</span>
                </div>
              ) : myAppointments.length > 0 ? (
                <div className="space-y-3">
                  {myAppointments.map((appt) => {
                    const id = appt._id || appt.id;
                    const doc = appt.doctor?.fullname || appt.doctorName || "Doctor";
                    const isConfirmed = appt.status === "confirmed";

                    return (
                      <div
                        key={id}
                        className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition"
                      >
                        <div>
                          <p className="font-semibold text-white text-base">
                            Dr. {doc}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar size={13} /> {appt.date || "Scheduled"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={13} /> {appt.slot || appt.appointmentTime || "Standard Slot"}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                isConfirmed
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              {appt.status || "Pending"}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/video?roomID=${id}`, {
                              state: { appointment: appt },
                            })
                          }
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-lg shadow-emerald-950/50 cursor-pointer"
                        >
                          <Video size={16} />
                          Join Video Call
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                  <p className="text-sm mb-3">No active appointments found.</p>
                  <Link
                    to="/doctor-search"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition"
                  >
                    <Sparkles size={14} /> Book an Appointment
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Active Video Consultation View
  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* Consultation Header */}
      <header className="h-16 px-4 sm:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/appointments")}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            title="Leave consultation"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                Consultation with Dr. {doctorName}
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {doctorSpec} • Patient: {userInfo.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>End-to-End Encrypted</span>
          </div>

          <div className="text-xs px-2.5 py-1 bg-slate-800 rounded-md font-mono text-slate-300 border border-slate-700">
            Room: {roomID.slice(-6)}
          </div>

          <button
            onClick={() => navigate("/appointments")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition"
          >
            <PhoneOff size={14} />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </header>

      {/* Zego Error Notification */}
      {zegoError && (
        <div className="p-3 bg-red-900/50 border-b border-red-800 text-red-200 text-xs sm:text-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
            <span>{zegoError}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-red-700 hover:bg-red-600 rounded-lg text-xs font-semibold text-white transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Video Meeting Container */}
      <div className="flex-1 w-full h-[calc(100vh-4rem)] bg-black relative">
        <div
          ref={meetingContainerRef}
          className="w-full h-full bg-black flex items-center justify-center"
        />
      </div>
    </div>
  );
}
