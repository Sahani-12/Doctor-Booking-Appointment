import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

export default function VideoCallPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const myMeeting = async (element) => {
    // 1. Get User Info
    let userName = "Patient";
    let userId = Date.now().toString();

    try {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        userName = parsed.fullname || "Patient";
        userId = parsed._id || parsed.id || Date.now().toString();
      }
    } catch (e) {
      console.error("Error parsing user data:", e);
    }

    // 2. Setup ZegoCloud credentials from .env
    const appID = Number(import.meta.env.VITE_ZEGO_APP_ID);
    const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

    if (!appID || !serverSecret) {
      console.error("ZegoCloud credentials missing in .env file");
      return;
    }

    // 3. Generate Kit Token
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomId,
      String(userId),
      String(userName),
    );

    // 4. Create instance and join room
    const zc = ZegoUIKitPrebuilt.create(kitToken);
    zc.joinRoom({
      container: element,
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall, // Best for Doctor-Patient Consultation
      },
      showPreJoinView: true,
      onLeaveRoom: () => {
        // Automatically redirect back to appointments when call ends
        navigate("/appointments");
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Navbar />
      <div ref={myMeeting} className="flex-1 w-full h-full bg-black"></div>
    </div>
  );
}
