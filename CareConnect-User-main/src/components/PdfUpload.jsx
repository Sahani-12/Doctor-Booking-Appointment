import React, { useState } from "react";
import BASE_URL from "@/constants/api";
import { UploadCloud, Loader2 } from "lucide-react";

const PdfUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setFileName(selected.name);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file");
      return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("message", message);

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/users/documents/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Upload failed");
      }

      alert("Document uploaded successfully!");

      setFile(null);
      setMessage("");
      setFileName("");

      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleUpload}
      className="bg-card border border-border rounded-xl p-5 shadow-md"
    >
      <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
        <UploadCloud className="text-primary" size={20} />
        Upload Medical Document
      </h2>

      <div className="flex flex-col md:flex-row gap-3">
        {/* File Input */}
        <input
          type="file"
          onChange={handleFileChange}
          className="flex-1 text-sm border border-border rounded-lg px-3 py-2
                     bg-background text-foreground
                     file:mr-3 file:py-2 file:px-4 file:rounded-lg
                     file:border-0 file:bg-orange-500 file:text-white
                     hover:file:bg-orange-600"
        />

        {/* Message Input */}
        <input
          type="text"
          placeholder="Enter document title..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 px-3 py-2 border border-border rounded-lg
                     bg-background text-foreground"
        />

        {/* Upload Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2
                     bg-orange-500 text-white px-5 py-2 rounded-lg
                     hover:bg-orange-600 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Uploading...
            </>
          ) : (
            "Upload"
          )}
        </button>
      </div>

      {fileName && (
        <p className="mt-2 text-sm text-muted-foreground">
          Selected: {fileName}
        </p>
      )}
    </form>
  );
};

export default PdfUpload;
