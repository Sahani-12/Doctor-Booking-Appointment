import React, { useEffect, useState } from "react";
import BASE_URL from "@/constants/api";
import { patientAvatarUrl } from "@/utils/mediaUrl";
import PatientProfileEditModal from "./PatientProfileEditModal";

const UserProfileDetails = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      const stored = sessionStorage.getItem("user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/users/profile`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const j = await res.json();
        if (!cancelled && res.ok && j.success && j.data) {
          setUser(j.data);
          try {
            const prev = JSON.parse(sessionStorage.getItem("user") || "{}");
            sessionStorage.setItem(
              "user",
              JSON.stringify({ ...prev, ...j.data }),
            );
          } catch {
            sessionStorage.setItem("user", JSON.stringify(j.data));
          }
        } else if (!cancelled) {
          const stored = sessionStorage.getItem("user");
          if (stored) setUser(JSON.parse(stored));
        }
      } catch {
        const stored = sessionStorage.getItem("user");
        if (stored && !cancelled) {
          try {
            setUser(JSON.parse(stored));
          } catch {
            setUser(null);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const avatarSrc = user ? patientAvatarUrl(user) : "";

  return (
    <div className="flex justify-center items-center">
      <PatientProfileEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialUser={user}
        onSaved={(u) => setUser(u)}
      />

      <div className="bg-white shadow-lg rounded-2xl p-6 w-72 text-center hover:shadow-xl transition">
        <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-gray-600">
              {user?.fullname?.charAt(0) || "U"}
            </span>
          )}
        </div>

        <h2 className="mt-4 text-lg font-semibold">
          {loading ? "…" : user?.fullname || "User Name"}
        </h2>

        <p className="text-sm text-gray-500">
          {user?.email || "user@email.com"}
        </p>

        <span className="inline-block mt-2 px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full capitalize">
          {user?.role === "user" ? "Patient" : user?.role || "Patient"}
        </span>

        <button
          type="button"
          className="mt-4 w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
          onClick={() => setEditOpen(true)}
          disabled={loading || !user}
        >
          Edit profile
        </button>
      </div>
    </div>
  );
};

export default UserProfileDetails;
