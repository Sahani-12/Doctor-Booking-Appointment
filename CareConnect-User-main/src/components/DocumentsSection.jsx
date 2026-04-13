import React, { useEffect, useState } from "react";
import Pdfupload from "./PdfUpload";
import BASE_URL from "@/constants/api";
import {
  FileText,
  FileImage,
  Trash2,
  Download,
  Eye,
  UploadCloud,
  Loader2,
} from "lucide-react";

const DocumentsSection = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch Documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/users/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch documents");

      const data = await res.json();
      const list = data.data ?? data.documents ?? [];
      setDocuments(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Delete Document
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document?")) return;

    try {
      setDeletingId(id);
      const token = sessionStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/users/documents/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      setDocuments((prev) =>
        prev.filter((doc) => doc._id !== id)
      );
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const isImageFile = (url) =>
    /\.(jpeg|jpg|png|gif|webp)$/i.test(url);

  const getFileTypeLabel = (url) => {
    if (url.endsWith(".pdf")) return "PDF Document";
    if (url.endsWith(".doc") || url.endsWith(".docx"))
      return "Word Document";
    if (url.endsWith(".ppt") || url.endsWith(".pptx"))
      return "PowerPoint";
    if (url.endsWith(".xls") || url.endsWith(".xlsx"))
      return "Excel File";
    return "File";
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-lg">
      {/* Upload Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <UploadCloud className="text-primary" size={22} />
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            Upload Medical Documents
          </h2>
        </div>
        <Pdfupload onUploadSuccess={fetchDocuments} />
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold mb-4 text-foreground">
        Your Medical Documents
      </h2>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <FileText size={40} className="mx-auto mb-2 opacity-50" />
          <p>No documents found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="bg-background border border-border rounded-xl overflow-hidden shadow-md hover:shadow-xl transition"
            >
              {/* Preview */}
              <a href={doc.file} target="_blank" rel="noopener noreferrer">
                {isImageFile(doc.file) ? (
                  <img
                    src={doc.file}
                    alt="Document"
                    className="w-full h-44 object-cover"
                  />
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center bg-muted text-muted-foreground">
                    <FileImage size={40} />
                    <span className="text-xs mt-2 px-2 text-center">
                      {getFileTypeLabel(doc.file)}
                    </span>
                  </div>
                )}
              </a>

              {/* Footer */}
              <div className="p-3 flex justify-between items-center">
                <span className="truncate text-sm text-foreground">
                  {doc.author?.fullname || "Unknown"}
                </span>

                <div className="flex gap-2">
                  <a
                    href={doc.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Eye size={18} />
                  </a>

                  <a
                    href={doc.file}
                    download
                    className="text-green-500 hover:text-green-700"
                  >
                    <Download size={18} />
                  </a>

                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="text-red-500 hover:text-red-700"
                    disabled={deletingId === doc._id}
                  >
                    {deletingId === doc._id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsSection;