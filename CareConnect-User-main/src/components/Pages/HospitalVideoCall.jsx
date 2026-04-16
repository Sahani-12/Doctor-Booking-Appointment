import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  MessageCircle,
  Loader2,
  AlertCircle,
  Clock,
  User,
} from "lucide-react";
import { videoAPI, appointmentAPI } from "@/services/api";
import Navbar from "../Navbar";
import Footer from "../Footer";

// Zego Cloud Configuration - Replace with your AppID and Server
const ZEGO_APP_ID = parseInt(import.meta.env.VITE_ZEGO_APP_ID || "0");
const ZEGO_SERVER_SECRET = import.meta.env.VITE_ZEGO_SERVER_SECRET || "";

// Placeholder Component - Replace this with actual ZegoUIKitPrebuilt when SDK is fully configured
const ZegoVideoContainer = ({ roomId, userId, userName, onReady, onLeave }) => {
  const containerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !roomId) return;

    // Initialize Zego Cloud UI Kit Prebuilt
    // This requires: npm install @zegocloud/zego-uikit-prebuilt
    const initializeZego = async () => {
      try {
        // Dynamic import to handle SDK availability
        const { ZegoUIKitPrebuilt } =
          await import("@zegocloud/zego-uikit-prebuilt");

        // Initialize Zego environment
        const zp = ZegoUIKitPrebuilt.create(
          new ZegoUIKitPrebuilt.ZegoExpresseEngine({
            appID: ZEGO_APP_ID,
            server: ZEGO_SERVER_SECRET,
          }),
        );

        // Join room with configuration
        zp.addPlugin(
          new ZegoUIKitPrebuilt.ZegoSuperBoardManager("zego-whiteboard"),
        );

        zp.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.ScenarioModel.OneOnOneCall, // or GroupCall for multiple participants
          },
          sharedLinks: [
            {
              name: "Copy link",
              url: `${window.location.origin}/hospital/video-call/${roomId}?token=${ZEGO_SERVER_SECRET}`,
            },
          ],
          onLeaveRoom: () => {
            setIsReady(false);
            onLeave?.();
          },
        });

        setIsReady(true);
        onReady?.();
      } catch (error) {
        console.warn(
          "ZegoCloud SDK not configured. Using placeholder interface.",
          error,
        );
        // Use placeholder if SDK is not available
        createPlaceholderVideo(roomId, userId, userName);
        setIsReady(true);
        onReady?.();
      }
    };

    initializeZego();
  }, [roomId, userId, userName, onReady, onLeave]);

  // Fallback placeholder video interface
  const createPlaceholderVideo = (roomId, userId, userName) => {
    if (!containerRef.current) return;

    const placeholder = document.createElement("div");
    placeholder.className =
      "flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-gray-900 to-black";
    placeholder.innerHTML = `
      <div class="text-center">
        <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
          <span class="text-4xl font-bold text-white">${userName?.charAt(0).toUpperCase()}</span>
        </div>
        <p class="text-white text-xl font-semibold mt-4">${userName}</p>
        <p class="text-gray-400 text-sm mt-2">Room ID: ${roomId?.slice(-6)}</p>
        <p class="text-gray-500 text-xs mt-4">
          <em>Video feed will appear here once connection is established</em>
        </p>
      </div>
    `;

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(placeholder);
  };

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-black"
      id="zego-video-container"
    />
  );
};

export default function VideoCallPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const [appointment, setAppointment] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState("");

  const callStartTimeRef = useRef(null);
  const callTimerRef = useRef(null);

  useEffect(() => {
    if (!token || !appointmentId) {
      navigate("/login");
      return;
    }

    loadAppointmentAndInitializeCall();

    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      endCall();
    };
  }, [token, appointmentId]);

  const loadAppointmentAndInitializeCall = async () => {
    try {
      setLoading(true);
      setError("");

      // Get appointment details
      const appointmentData =
        await appointmentAPI.getAppointmentDetails(appointmentId);
      setAppointment(appointmentData.data);

      // Create video room
      const roomData = await videoAPI.createRoom(appointmentId);
      setRoomId(roomData.data.roomId);

      // Join session
      const sessionData = await videoAPI.joinSession(roomData.data.roomId);
      console.log("Joined video session:", sessionData);

      setIsConnected(true);
      callStartTimeRef.current = new Date();

      // Start call timer
      callTimerRef.current = setInterval(() => {
        if (callStartTimeRef.current) {
          const duration = Math.floor(
            (new Date() - callStartTimeRef.current) / 1000,
          );
          setCallDuration(duration);
        }
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to initialize video call");
      console.error("Error initializing call:", err);
    } finally {
      setLoading(false);
    }
  };

  const endCall = async () => {
    try {
      if (roomId) {
        await videoAPI.endSession(roomId);
      }

      // Clear timer
      if (callTimerRef.current) clearInterval(callTimerRef.current);

      // Redirect after a delay
      setTimeout(() => {
        navigate(`/hospital/appointments`);
      }, 1000);
    } catch (err) {
      console.error("Error ending call:", err);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: user.fullname,
      text: chatMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setChatMessage("");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen items-center justify-center bg-gray-950">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-white" />
            <p className="mt-4 text-lg text-gray-400">
              Initializing video call...
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen items-center justify-center bg-gray-950">
          <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-2xl font-bold text-white">
              Video Call Failed
            </h2>
            <p className="mt-2 text-gray-300">{error}</p>
            <button
              onClick={() => navigate("/hospital/appointments")}
              className="mt-6 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-6 py-3 font-semibold text-white hover:shadow-lg"
            >
              Back to Appointments
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex h-screen flex-col bg-black">
        {/* Header */}
        <div className="border-b border-gray-800 bg-gray-950 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600" />
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Dr. {appointment?.doctor?.fullname || "Doctor"}
                </h2>
                <p className="text-sm text-gray-400">
                  {appointment?.doctor?.specialization?.[0] ||
                    "General Consultation"}
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="font-mono text-lg text-white">
                {formatDuration(callDuration)}
              </span>
            </div>
          </div>
        </div>

        {/* Video Area */}
        <div className="relative flex flex-1 overflow-hidden">
          {/* Main Video */}
          <div className="flex-1 bg-black">
            {roomId && (
              <ZegoVideoContainer
                roomId={roomId}
                userId={user._id}
                userName={user.fullname}
                onReady={() => console.log("Video ready")}
                onLeave={() => endCall()}
              />
            )}

            {/* Local Video Preview (Corner) */}
            <div className="absolute bottom-4 right-4 h-32 w-40 rounded-lg border-2 border-orange-500 bg-gray-900 p-2">
              <div className="h-full w-full rounded-lg bg-black flex items-center justify-center">
                <User className="h-8 w-8 text-gray-600" />
                <p className="mt-2 text-xs text-gray-400 text-center">
                  Your Video
                </p>
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          {showChat && (
            <div className="w-80 border-l border-gray-800 bg-gray-950 flex flex-col">
              <div className="border-b border-gray-800 p-4">
                <h3 className="font-semibold text-white">Chat</h3>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 p-4">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-8">
                    No messages yet
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id}>
                      <p className="text-xs text-gray-400">{msg.sender}</p>
                      <p className="mt-1 rounded-lg bg-gray-800 px-3 py-2 text-sm text-white">
                        {msg.text}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-gray-800 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") sendChatMessage();
                    }}
                    className="flex-1 rounded-lg bg-gray-800 px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={sendChatMessage}
                    className="rounded-lg bg-orange-500 p-2 text-white hover:bg-orange-600"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="border-t border-gray-800 bg-gray-950 px-6 py-4">
          <div className="flex items-center justify-center gap-4">
            {/* Mic Toggle */}
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`rounded-full p-4 transition ${
                isMicOn
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {isMicOn ? (
                <Mic className="h-6 w-6" />
              ) : (
                <MicOff className="h-6 w-6" />
              )}
            </button>

            {/* Video Toggle */}
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`rounded-full p-4 transition ${
                isVideoOn
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {isVideoOn ? (
                <Video className="h-6 w-6" />
              ) : (
                <VideoOff className="h-6 w-6" />
              )}
            </button>

            {/* Share Screen */}
            <button className="rounded-full bg-gray-800 p-4 text-white transition hover:bg-gray-700">
              <Share2 className="h-6 w-6" />
            </button>

            {/* Chat Toggle */}
            <button
              onClick={() => setShowChat(!showChat)}
              className={`rounded-full p-4 transition ${
                showChat
                  ? "bg-orange-600 text-white"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              <MessageCircle className="h-6 w-6" />
            </button>

            {/* End Call */}
            <button
              onClick={endCall}
              className="rounded-full bg-red-600 p-4 text-white transition hover:bg-red-700"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
