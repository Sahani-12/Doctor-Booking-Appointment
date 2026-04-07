import React, { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

function generateID(len = 5) {
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
  return params.get("roomID") || generateID();
}

const VideoCall = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const startCall = async () => {
      const roomID = getRoomID();

      // ✅ user from session
      const storedUser = JSON.parse(sessionStorage.getItem("user"));
      const userName = storedUser?.fullname || "Guest";

      const appID = 1225683379;
      const serverSecret = "YOUR_SECRET_HERE"; // ❗ move to backend later

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        generateID(),
        userName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);

      zp.joinRoom({
        container: containerRef.current,
        sharedLinks: [
          {
            name: "Join Link",
            url: `${window.location.origin}?roomID=${roomID}`,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        showScreenSharingButton: true,
      });
    };

    startCall();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen"
    ></div>
  );
};

export default VideoCall;