import React, { useEffect, useState } from "react";
import Pdfupload from "./PdfUpload";
import BASE_URL from "@/constants/api";

const DocumentsSection = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${BASE_URL}/users/documents`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error();

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

  // ✅ DELETE FUNCTION
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document?")) return;

    try {
      const res = await fetch(`${BASE_URL}/users/documents/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error();

      // UI update
      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const isImageFile = (url) => /\.(jpeg|jpg|png|gif|webp)$/i.test(url);

  const getFileTypeLabel = (url) => {
    if (url.endsWith(".pdf")) return "📄 PDF";
    if (url.endsWith(".doc") || url.endsWith(".docx")) return "📝 Word";
    if (url.endsWith(".ppt") || url.endsWith(".pptx")) return "📊 PPT";
    if (url.endsWith(".xls") || url.endsWith(".xlsx")) return "📈 Excel";
    return "📁 File";
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow">
      {/* Upload */}
      <Pdfupload onUploadSuccess={fetchDocuments} />

      <h2 className="text-xl font-semibold mb-4">Your Medical Documents</h2>

      {loading ? (
        <p>Loading...</p>
      ) : documents.length === 0 ? (
        <p>No documents found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="border rounded-lg overflow-hidden shadow hover:shadow-md transition"
            >
              <a href={doc.file} target="_blank">
                {isImageFile(doc.file) ? (
                  <img src={doc.file} className="w-full h-52 object-cover" />
                ) : (
                  <div className="h-52 flex items-center justify-center bg-gray-100">
                    {getFileTypeLabel(doc.file)}
                  </div>
                )}
              </a>

              <div className="p-3 flex justify-between items-center text-sm">
                <span>{doc.author?.fullname || "Unknown"}</span>

                <button
                  onClick={() => handleDelete(doc._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsSection;
