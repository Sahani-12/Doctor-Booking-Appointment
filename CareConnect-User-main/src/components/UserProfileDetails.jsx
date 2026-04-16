import React, { useEffect, useState } from "react";
import BASE_URL from "@/constants/api";
import { patientAvatarUrl } from "@/utils/mediaUrl";
import PatientProfileEditModal from "./PatientProfileEditModal";
import { User, Mail, ShieldCheck, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserProfileDetails = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const navigate = useNavigate();

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
          sessionStorage.setItem("user", JSON.stringify(j.data));
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-pulse text-muted-foreground">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-6 px-4">
      {/* Edit Modal */}
      <PatientProfileEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialUser={user}
        onSaved={(u) => setUser(u)}
      />

      {/* Profile Card */}
      <div className="w-full max-w-sm bg-card border border-border shadow-xl rounded-3xl p-6 text-center transition-all duration-300 hover:shadow-2xl">
        {/* Avatar */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden ring-4 ring-primary/20">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-muted-foreground" />
            )}
          </div>

          {/* Edit Icon */}
          <button
            onClick={() => navigate("/profile")}
            className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md hover:scale-110 transition"
          >
            <Pencil size={14} />
          </button>
        </div>

        {/* Name */}
        <h2 className="mt-4 text-xl font-bold text-foreground">
          {user?.fullname || "User Name"}
        </h2>

        {/* Email */}
        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-1">
          <Mail size={14} />
          {user?.email || "user@email.com"}
        </p>

        {/* Role Badge */}
        <span className="inline-flex items-center gap-1 mt-3 px-4 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
          <ShieldCheck size={14} />
          {user?.role === "user" ? "Patient" : user?.role || "Patient"}
        </span>

        {/* Divider */}
        <div className="border-t border-border my-5"></div>

        {/* Edit Button */}
        <button
          type="button"
          onClick={() => navigate("/profile")}
          disabled={!user}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 rounded-xl font-semibold shadow-md hover:opacity-95 transition disabled:opacity-50"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default UserProfileDetails;
