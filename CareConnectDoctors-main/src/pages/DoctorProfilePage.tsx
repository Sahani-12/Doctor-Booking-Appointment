import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Stethoscope,
  Building2,
  Award,
  Save,
  AlertCircle,
  CheckCircle,
  FileText,
  Clock,
  Settings,
  Edit2,
} from "lucide-react";
import { Button } from "../components/ui/modern/Button";
import { Modal } from "../components/ui/modern/Modal";
import { Badge } from "../components/ui/modern/Badge";

interface DoctorProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  hospital: string;
  licenseNumber: string;
  experience: number;
  qualifications: string;
  availability: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  bio: string;
  isApproved: boolean;
  createdAt: string;
}

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [updateKey, setUpdateKey] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    specialization: "",
    hospital: "",
    qualifications: "",
    experience: "",
    licenseNumber: "",
    bio: "",
  });

  const token = localStorage.getItem("token");
  const doctorId = localStorage.getItem("doctorId");

  useEffect(() => {
    if (token && doctorId) {
      fetchProfile();
    }
  }, [token, doctorId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `https://doctor-booking-appointment-i137.onrender.com/api/doctors/${doctorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile({ ...data.data, _fetched: Date.now() });
      setFormData({
        name: data.data.fullname || data.data.name || "",
        phone: data.data.phone || "",
        specialization: Array.isArray(data.data.specialization)
          ? data.data.specialization.join(", ")
          : data.data.specialization || "",
        hospital: data.data.location || data.data.hospital || "",
        qualifications: Array.isArray(data.data.degrees)
          ? data.data.degrees.join(", ")
          : data.data.degrees || "",
        experience: data.data.experience || "",
        licenseNumber: data.data.licenseNumber || "",
        bio: data.data.description || data.data.bio || "",
      });
      console.log("✅ Fetched doctor profile");
    } catch (err: any) {
      console.error("❌ Fetch error:", err.message);
      setError(err.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      setError("");

      const updateData = {
        fullname: formData.name,
        phone: formData.phone,
        specialization: formData.specialization
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        location: formData.hospital,
        degrees: formData.qualifications
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        experience: formData.experience,
        description: formData.bio,
        licenseNumber: formData.licenseNumber,
      };

      const response = await fetch(
        `https://doctor-booking-appointment-i137.onrender.com/api/doctors/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      setProfile({ ...data.data, _updated: Date.now() });
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setUpdateKey((prev) => prev + 1);
      console.log("✅ Profile updated");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("❌ Update error:", err.message);
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (!token || !doctorId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Please login to view your profile</p>
      </div>
    );
  }

  return (
    <div
      key={updateKey}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-slate-400">Manage your professional information</p>
        </div>

        {/* Error & Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-200">
            <CheckCircle size={20} />
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-center text-slate-400">
            <div className="inline-block animate-spin">
              <Settings size={32} />
            </div>
            <p className="mt-4">Loading profile...</p>
          </div>
        ) : profile ? (
          <>
            {/* Profile Card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 mb-6">
              {/* Approval Status */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {profile.fullname || profile.name}
                  </h2>
                  <p className="text-slate-400">
                    {Array.isArray(profile.specialization)
                      ? profile.specialization.join(", ")
                      : profile.specialization}
                  </p>
                </div>
                <Badge
                  variant={profile.isApproved ? "success" : "warning"}
                  size="lg"
                  icon
                >
                  {profile.isApproved ? "Approved" : "Pending Approval"}
                </Badge>
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <Mail size={20} className="text-blue-400 mt-1" />
                    <div>
                      <p className="text-slate-400 text-sm">Email</p>
                      <p className="text-white font-medium">{profile.email}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <Phone size={20} className="text-green-400 mt-1" />
                    <div>
                      <p className="text-slate-400 text-sm">Phone</p>
                      <p className="text-white font-medium">
                        {isEditing ? (
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                            className="w-full px-3 py-1 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          profile.phone || "Not provided"
                        )}
                      </p>
                    </div>
                  </div>

                  {/* License Number */}
                  <div className="flex items-start gap-3">
                    <Award size={20} className="text-purple-400 mt-1" />
                    <div>
                      <p className="text-slate-400 text-sm">License Number</p>
                      <p className="text-white font-medium">
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.licenseNumber}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                licenseNumber: e.target.value,
                              })
                            }
                            className="w-full px-3 py-1 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          profile.licenseNumber
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="flex items-start gap-3">
                    <Clock size={20} className="text-amber-400 mt-1" />
                    <div>
                      <p className="text-slate-400 text-sm">Experience</p>
                      <p className="text-white font-medium">
                        {isEditing ? (
                          <input
                            type="number"
                            value={formData.experience}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                experience: e.target.value,
                              })
                            }
                            className="w-full px-3 py-1 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          `${profile.experience} years`
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Specialization */}
                  <div className="flex items-start gap-3">
                    <Stethoscope size={20} className="text-red-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-slate-400 text-sm">Specialization</p>
                      <p className="text-white font-medium">
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.specialization}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                specialization: e.target.value,
                              })
                            }
                            className="w-full px-3 py-1 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          profile.specialization
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Hospital */}
                  <div className="flex items-start gap-3">
                    <Building2 size={20} className="text-cyan-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-slate-400 text-sm">Hospital</p>
                      <p className="text-white font-medium">
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.hospital}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                hospital: e.target.value,
                              })
                            }
                            className="w-full px-3 py-1 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          profile.location || profile.hospital || "Not provided"
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Qualifications */}
                  <div className="flex items-start gap-3">
                    <Award size={20} className="text-pink-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-slate-400 text-sm">Qualifications</p>
                      <p className="text-white font-medium">
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.qualifications}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                qualifications: e.target.value,
                              })
                            }
                            className="w-full px-3 py-1 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                          />
                        ) : Array.isArray(profile.degrees) ? (
                          profile.degrees.join(", ")
                        ) : (
                          profile.degrees || "Not provided"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={20} className="text-indigo-400" />
                  <p className="text-slate-400 text-sm">Bio</p>
                </div>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <p className="text-white">
                    {profile.description || profile.bio || "No bio provided"}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!isEditing ? (
                  <Button variant="primary" onClick={() => setIsEditing(true)}>
                    <Edit2 size={18} />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="success"
                      onClick={handleUpdate}
                      isLoading={updating}
                    >
                      <Save size={18} />
                      Save Changes
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: profile.fullname || profile.name || "",
                          phone: profile.phone || "",
                          specialization: Array.isArray(profile.specialization)
                            ? profile.specialization.join(", ")
                            : profile.specialization || "",
                          hospital: profile.location || profile.hospital || "",
                          qualifications: Array.isArray(profile.degrees)
                            ? profile.degrees.join(", ")
                            : profile.degrees || "",
                          experience: profile.experience || "",
                          licenseNumber: profile.licenseNumber || "",
                          bio: profile.description || profile.bio || "",
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Additional Info Card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-400 text-sm">Member Since</p>
                  <p className="text-white font-medium">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Profile Status</p>
                  <Badge
                    variant={profile.isApproved ? "success" : "warning"}
                    size="md"
                  >
                    {profile.isApproved ? "Complete" : "Under Review"}
                  </Badge>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-slate-400">
            <p>Failed to load profile</p>
          </div>
        )}
      </div>
    </div>
  );
}
