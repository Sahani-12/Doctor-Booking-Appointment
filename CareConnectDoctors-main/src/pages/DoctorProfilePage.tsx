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
  Camera,
} from "lucide-react";
import { Button } from "../components/ui/modern/Button";
import { Modal } from "../components/ui/modern/Modal";
import { Badge } from "../components/ui/modern/Badge";
import { API_BASE } from "../constants/api";
import { resolveMediaUrl } from "../utils/mediaUrl";

interface DoctorProfile {
  _id: string;
  name?: string;
  fullname?: string;
  email: string;
  phone: string;
  specialization: string | string[];
  hospital?: string;
  location?: string;
  licenseNumber: string;
  experience: number | string;
  qualifications?: string | string[];
  degrees?: string | string[];
  profileImage?: string;
  availability?: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  bio?: string;
  description?: string;
  isApproved?: boolean;
  createdAt?: string;
}

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [updateKey, setUpdateKey] = useState(0);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("doctorToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("doctorToken");
  const [doctorId, setDoctorId] = useState(
    localStorage.getItem("doctorId") || "",
  );

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const populateForm = (data: any) => {
    if (!data) return;
    if (data._id) {
      setDoctorId(data._id);
      localStorage.setItem("doctorId", data._id);
    }
    setProfile({ ...data, _fetched: Date.now() });
    setPreviewImage(data.profileImage || "");
    setFormData({
      name: data.fullname || data.name || "",
      phone: data.phone || "",
      specialization: Array.isArray(data.specialization)
        ? data.specialization.join(", ")
        : data.specialization || "",
      hospital: data.location || data.hospital || "",
      qualifications: Array.isArray(data.degrees)
        ? data.degrees.join(", ")
        : Array.isArray(data.qualifications)
          ? data.qualifications.join(", ")
          : data.degrees || data.qualifications || "",
      experience: String(data.experience || ""),
      licenseNumber: data.licenseNumber || "",
      bio: data.description || data.bio || "",
    });
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      // Try GET /doctors/profile first (uses auth token directly)
      let response = await fetch(`${API_BASE}/doctors/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Fallback to /doctors/:id if profile route is not found
      if (!response.ok && doctorId) {
        response = await fetch(`${API_BASE}/doctors/${doctorId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch profile");
      }

      const data = await response.json();
      populateForm(data.data || data);
      console.log("✅ Fetched doctor profile");
    } catch (err: any) {
      console.error("❌ Fetch error:", err.message);
      setError(err.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 1000;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.85));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      try {
        const compressed = await compressImage(file);
        setPreviewImage(compressed);
      } catch {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreviewImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    // 1. Try uploading to backend multer endpoint
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);
      const res = await fetch(`${API_BASE}/doctors/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });
      if (res.ok) {
        const json = await res.json();
        if (json.url || json.data?.url) {
          return json.url || json.data.url;
        }
      }
    } catch (uploadErr) {
      console.warn("Upload via multipart endpoint failed, falling back to compressed base64", uploadErr);
    }

    // 2. Fallback to previewImage (compressed base64)
    return previewImage;
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      setError("");

      let profileImageUrl = previewImage;

      // Upload image if a new file was selected
      if (selectedFile) {
        profileImageUrl = await uploadImage(selectedFile);
      }

      const updateData = {
        fullname: formData.name,
        name: formData.name,
        phone: formData.phone,
        specialization: formData.specialization
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        location: formData.hospital,
        hospital: formData.hospital,
        degrees: formData.qualifications
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        qualifications: formData.qualifications
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        experience: formData.experience,
        description: formData.bio,
        bio: formData.bio,
        licenseNumber: formData.licenseNumber,
        profileImage: profileImageUrl,
      };

      const response = await fetch(`${API_BASE}/doctors/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorData.error || "Failed to update profile",
        );
      }

      const data = await response.json();
      const updatedDoctor = data.data || data;

      setProfile({ ...updatedDoctor, _updated: Date.now() });
      setSelectedFile(null);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setUpdateKey((prev) => prev + 1);

      // Synchronize updated user profile and image across localStorage & sessionStorage
      const savedImage = updatedDoctor.profileImage || profileImageUrl;
      const syncStorage = (storage: Storage) => {
        const raw = storage.getItem("user");
        let parsed = raw ? JSON.parse(raw) : {};
        parsed = {
          ...parsed,
          ...updatedDoctor,
          fullname: updatedDoctor.fullname || formData.name,
          profileImage: savedImage,
        };
        storage.setItem("user", JSON.stringify(parsed));
      };
      try {
        syncStorage(localStorage);
        syncStorage(sessionStorage);
      } catch (e) {
        console.error("Failed to update user storage", e);
      }

      // Trigger header and dropdown re-render across the entire doctor portal
      window.dispatchEvent(new Event("profileUpdated"));
      window.dispatchEvent(
        new CustomEvent("profileUpdated", {
          detail: { profileImage: savedImage },
        }),
      );
      console.log("✅ Profile updated successfully");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("❌ Update error:", err.message);
      setError(err.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (!token) {
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
              {/* Profile Image Section */}
              <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-end gap-6">
                  {/* Profile Image Display */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      {previewImage ? (
                        <img
                          src={resolveMediaUrl(previewImage) || previewImage}
                          alt="Doctor Profile"
                          className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center border-4 border-blue-500">
                          <User size={64} className="text-white" />
                        </div>
                      )}
                      {isEditing && (
                        <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-2 rounded-full cursor-pointer transition">
                          <Camera size={20} className="text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    {isEditing && (
                      <p className="text-xs text-slate-400 mt-2">
                        Click camera to upload
                      </p>
                    )}
                  </div>

                  {/* Approval Status */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">
                      {profile.fullname || profile.name}
                    </h2>
                    <p className="text-slate-400 mb-4">
                      {Array.isArray(profile.specialization)
                        ? profile.specialization.join(", ")
                        : profile.specialization}
                    </p>
                    <Badge
                      variant={profile.isApproved ? "success" : "warning"}
                      size="lg"
                      icon
                    >
                      {profile.isApproved ? "Approved" : "Pending Approval"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Approval Status */}
              <div className="mb-6 flex items-center justify-between hidden">
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
