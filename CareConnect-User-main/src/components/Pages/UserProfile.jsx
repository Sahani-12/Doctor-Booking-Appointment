import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BASE_URL from "@/constants/api";
import Navbar from "../Navbar";
import Footer from "../Footer";
import {
  FileText,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Download,
  Eye,
} from "lucide-react";

const UserProfile = () => {
  const { id: userId } = useParams();
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docLoading, setDocLoading] = useState(true);
  const [error, setError] = useState("");
  const [docError, setDocError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(`${BASE_URL}/users/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        setUser(data.data || data);
      } catch {
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    const fetchDocuments = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/users/documents`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch documents");
        const data = await res.json();
        const list = data.data ?? [];
        setDocuments(Array.isArray(list) ? list : []);
      } catch {
        setDocError("No documents available");
      } finally {
        setDocLoading(false);
      }
    };

    fetchUserData();
    fetchDocuments();
  }, [userId]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Loading user data...
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-red-500">
        {error}
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted py-10 px-4">
        {/* Profile Card */}
        <div className="max-w-5xl mx-auto bg-card border border-border shadow-xl rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-600 h-32"></div>

          <div className="px-6 pb-6 -mt-16">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage
                  src={user.image || "/placeholder.svg"}
                  alt={user.fullname}
                />
                <AvatarFallback>
                  {user.fullname?.slice(0, 2) || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-foreground">
                  {user.fullname}
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Mail size={16} className="text-primary" />
                    {user.email || "Not provided"}
                  </p>

                  <p className="flex items-center gap-2">
                    <Phone size={16} className="text-primary" />
                    {user.phone || "Not provided"}
                  </p>

                  <p className="flex items-center gap-2">
                    <Calendar size={16} className="text-primary" />
                    {user.DOB ? new Date(user.DOB).toLocaleDateString() : "—"}
                  </p>

                  <p className="flex items-center gap-2">
                    <User size={16} className="text-primary" />
                    Age: {user.age || "—"}
                  </p>

                  <p className="flex items-center gap-2">
                    <MapPin size={16} className="text-primary" />
                    {user.address || "Location not provided"}
                  </p>
                </div>

                <span className="inline-block mt-4 px-4 py-1 text-sm bg-primary/10 text-primary rounded-full font-medium">
                  {user.role === "user" ? "Patient" : user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="max-w-5xl mx-auto mt-10">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-4">
            <FileText className="text-primary" /> Medical Documents
          </h2>

          {docLoading ? (
            <p className="text-muted-foreground">Loading documents...</p>
          ) : docError ? (
            <p className="text-red-500">{docError}</p>
          ) : documents.length === 0 ? (
            <p className="text-muted-foreground">No documents available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-card border border-border rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden"
                >
                  {doc.file.endsWith(".pdf") ? (
                    <div className="flex items-center justify-center h-40 bg-muted text-muted-foreground">
                      <FileText size={40} />
                    </div>
                  ) : (
                    <img
                      src={doc.file}
                      alt="Document"
                      className="w-full h-40 object-cover"
                    />
                  )}

                  <div className="p-4 flex justify-between items-center">
                    <a
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Eye size={16} /> View
                    </a>

                    <a
                      href={doc.file}
                      download
                      className="flex items-center gap-2 text-emerald-600 hover:underline"
                    >
                      <Download size={16} /> Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default UserProfile;
