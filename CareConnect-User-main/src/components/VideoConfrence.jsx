import React, { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

function generateID(len = 6) {
  const chars =
    "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
  let result = "";
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getRoomID() {
  const params = new URLSearchParams(window.location.search);
  return params.get("roomID") || `careconnect-${generateID(5)}`;
}

const VideoCall = () => {
  const containerRef = useRef(null);
  const hasJoinedRef = useRef(false); // Prevent duplicate joins

  useEffect(() => {
    if (hasJoinedRef.current) return;
    hasJoinedRef.current = true;

    const startCall = async () => {
      try {
        const roomID = getRoomID();

        // Safely get user data
        let userName = "Guest";
        let userID = generateID(8);

        try {
          const storedUser = JSON.parse(sessionStorage.getItem("user"));
          userName = storedUser?.fullname || "Guest";
          userID = storedUser?._id || storedUser?.id || generateID(8);
        } catch (error) {
          console.warn("User parsing error:", error);
        }

        // Load credentials from .env
        const appID = Number(import.meta.env.VITE_ZEGO_APP_ID);
        const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

        if (!appID || !serverSecret) {
          console.error(
            "ZEGOCLOUD credentials are missing. Check your .env file.",
          );
          return;
        }

        // Generate Token
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomID,
          String(userID),
          userName,
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);

        // Join Room
        zp.joinRoom({
          container: containerRef.current,
          sharedLinks: [
            {
              name: "Join Link",
              url: `${window.location.origin}/video?roomID=${roomID}`,
            },
          ],
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },
          showScreenSharingButton: true,
          showTextChat: true,
          showUserList: true,
          maxUsers: 2,
        });
      } catch (error) {
        console.error("ZEGOCLOUD Error:", error);
      }
    };

    startCall();

    // Cleanup on component unmount
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-gray-100 dark:bg-gray-900">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default VideoCall;
