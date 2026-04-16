import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

const VideoCall = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  // Make it robust: check for roomID or roomId, just in case.
  const roomID = params.get("roomID") || params.get("roomId");

  const myMeeting = async (element) => {
    if (!element || !roomID || roomID === "undefined") {
      return; // Don't initialize if roomID is invalid
    }

    let userName = "Patient";
    let userId = Date.now().toString();

    try {
      const storedUser =
        sessionStorage.getItem("user") || localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        userName = parsed.fullname || parsed.name || "Patient";
        userId = parsed._id || parsed.id || Date.now().toString();
      }
    } catch (e) {
      console.error("Error parsing user data:", e);
    }

    // Apne .env file me Zego Keys add karna na bhoolein
    const appID = Number(import.meta.env.VITE_ZEGO_APP_ID || 0);
    const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET || "";

    if (!appID || !serverSecret) {
      console.error("ZegoCloud credentials missing in .env file");
      alert("Video call service is not configured properly. Missing API keys.");
      return;
    }

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID, // URL se aane wala appointment ID
      String(userId),
      String(userName),
    );

    const zc = ZegoUIKitPrebuilt.create(kitToken);
    zc.joinRoom({
      container: element,
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      showPreJoinView: false,
      turnOnCameraWhenJoining: true,
      turnOnMicrophoneWhenJoining: true,
      showLeaveRoomConfirmDialog: true,
      onLeaveRoom: () => {
        navigate(-1); // Call cut hone par wapas appointment page pe bhej dega
      },
    });
  };

  return (
    <div className="w-screen h-screen bg-gray-950 text-white flex flex-col">
      {roomID && roomID !== "undefined" ? (
        <div ref={myMeeting} className="w-full h-full bg-black"></div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-xl font-semibold">
            Invalid Room ID. Please join from your appointments list.
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
