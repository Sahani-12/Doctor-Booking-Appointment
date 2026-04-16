import React, { useState, useEffect } from "react";
import {
  User,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileText,
  Upload,
  Trash2,
} from "lucide-react";
import BASE_URL from "@/constants/api";
import Navbar from "./components/Navbar";

export default function UserProfile() {
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    city: "",
    age: "",
    gender: "",
    image: "",
  });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [docMessage, setDocMessage] = useState("");
  const [fileToUpload, setFileToUpload] = useState(null);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
    fetchDocuments();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setFormData({
          fullname: data.data.fullname || "",
          phone: data.data.phone || "",
          city: data.data.city || "",
          age: data.data.age || "",
          gender: data.data.gender || "male",
          image: data.data.image || data.data.avatar || "",
        });
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${BASE_URL}/users/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDocuments(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${BASE_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        const user = JSON.parse(sessionStorage.getItem("user") || "{}");
        sessionStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            fullname: formData.fullname,
            image: formData.image,
          }),
        );
        window.dispatchEvent(new Event("userUpdated"));
      } else {
        setMessage({ type: "error", text: data.message || "Update failed." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error occurred." });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileToUpload) return;

    setUploading(true);
    setDocMessage("");

    const uploadData = new FormData();
    uploadData.append("file", fileToUpload);
    uploadData.append("message", fileToUpload.name);

    try {
      const res = await fetch(`${BASE_URL}/users/documents/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });

      const data = await res.json();

      if (data.success) {
        setDocMessage("Document uploaded successfully!");
        setFileToUpload(null);
        fetchDocuments(); // Refresh list
      } else {
        setDocMessage(data.message || "Upload failed.");
      }
    } catch (err) {
      setDocMessage("Network error during upload.");
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 mt-6 mb-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Edit Section */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <User className="text-primary" /> Personal Details
          </h2>

          {message.text && (
            <div
              className={`p-4 mb-6 rounded-xl flex items-center gap-2 ${message.type === "success" ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"}`}
            >
              {message.type === "success" ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-5 mb-8">
            <div className="w-20 h-20 shrink-0 rounded-full bg-muted overflow-hidden border-2 border-primary/20 flex items-center justify-center">
              {formData.image ? (
                <img
                  src={formData.image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
                Profile Photo URL
              </label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="Paste image URL here..."
                className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary transition"
              />
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                className="w-full p-3.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary transition"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
                  City/Location
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full p-3.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full p-3.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-3.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary transition appearance-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 rounded-xl mt-6 transition disabled:opacity-70 shadow-md hover:shadow-lg"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saving ? "Updating..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Document Upload Section */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <FileText className="text-primary" /> Medical Documents
          </h2>

          {docMessage && (
            <div className="p-4 mb-5 text-sm font-medium rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center gap-2">
              <CheckCircle size={18} /> {docMessage}
            </div>
          )}

          {/* Upload Box */}
          <form
            onSubmit={handleUpload}
            className="mb-8 p-6 border-2 border-dashed border-border rounded-2xl bg-muted/50 hover:bg-muted transition relative group"
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="p-4 bg-background rounded-full shadow-sm group-hover:scale-105 transition">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="text-sm text-muted-foreground text-center mt-2">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-primary font-semibold hover:underline"
                >
                  Click to browse
                </label>{" "}
                or drag & drop files
                <p className="text-xs mt-1.5">
                  Supported: PDF, JPG, PNG (Max 5MB)
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />

              {fileToUpload && (
                <div className="w-full mt-4 p-3 bg-background border border-border rounded-xl flex justify-between items-center shadow-sm">
                  <span className="text-sm font-medium text-foreground truncate px-2">
                    {fileToUpload.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFileToUpload(null)}
                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || !fileToUpload}
                className="w-full mt-3 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
              >
                {uploading ? "Uploading Securely..." : "Upload Document"}
              </button>
            </div>
          </form>

          {/* Uploaded Files List */}
          <div className="flex-1">
            <h3 className="font-bold text-foreground mb-4 text-lg border-b border-border pb-2">
              Your Uploaded Files
            </h3>
            {documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <FileText size={48} className="mb-3 opacity-20" />
                <p className="text-sm font-medium">
                  No medical documents found.
                </p>
                <p className="text-xs mt-1">
                  Upload prescriptions or lab reports above.
                </p>
              </div>
            ) : (
              <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {documents.map((doc, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between p-4 border border-border rounded-xl bg-background shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="p-2.5 bg-primary/10 text-primary rounded-lg shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-foreground truncate">
                          {doc.message || "Medical Document"}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground mt-0.5">
                          {new Date(
                            doc.uploadedAt || doc.createdAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-semibold shrink-0 transition"
                    >
                      View
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
