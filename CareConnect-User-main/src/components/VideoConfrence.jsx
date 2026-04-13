import React, { useMemo } from "react";

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

function getStoredUser() {
  try {
    return JSON.parse(
      sessionStorage.getItem("user") || localStorage.getItem("user") || "{}",
    );
  } catch (error) {
    console.warn("User parsing error:", error);
    return {};
  }
}

function safeRoomName(roomID) {
  return `careconnect-${String(roomID).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

const VideoCall = () => {
  const { roomID, userName, meetingUrl } = useMemo(() => {
    const roomID = getRoomID();
    const storedUser = getStoredUser();
    const userName = storedUser?.fullname || storedUser?.name || "Patient";
    const roomName = safeRoomName(roomID);
    const displayName = encodeURIComponent(userName);
    const meetingUrl = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&userInfo.displayName=${displayName}`;

    return { roomID, userName, meetingUrl };
  }, []);

  const joinLink = `${window.location.origin}/video?roomID=${encodeURIComponent(
    roomID,
  )}`;

  return (
    <div className="w-screen h-screen bg-gray-950 text-white">
      <div className="absolute left-4 top-4 z-10 max-w-[calc(100vw-2rem)] rounded-lg bg-black/70 px-4 py-3 text-sm shadow-lg backdrop-blur">
        <p className="font-semibold">CareConnect video call</p>
        <p className="text-white/75">Room: {roomID}</p>
        <button
          type="button"
          className="mt-2 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-700"
          onClick={() => navigator.clipboard?.writeText(joinLink)}
        >
          Copy join link
        </button>
      </div>
      <iframe
        title={`Video consultation for ${userName}`}
        src={meetingUrl}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        className="h-full w-full border-0"
      />
    </div>
  );
};

export default VideoCall;
