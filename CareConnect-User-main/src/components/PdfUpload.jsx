import React, { useState } from "react";
import BASE_URL from "@/constants/api";

const Input = () => {
  const [pdfs, setPdfs] = useState([]);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  // ✅ File Change
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setSelectedFileName(selected.name);
    }
  };

  // ✅ Upload Function
  const uploadFile = async () => {
    if (!file || !message) {
      alert("File + message required");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("message", message);

    try {
      const res = await fetch(`${BASE_URL}/users/documents/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      const now = new Date().toLocaleString();

      setPdfs((prev) => [
        { name: message, url: data.url, date: now, type: file.type },
        ...prev,
      ]);

      // reset
      setFile(null);
      setMessage("");
      setSelectedFileName("");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Upload Box */}
      <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
        <input type="file" onChange={handleFileChange} />

        <input
          type="text"
          placeholder="Enter message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-2 border rounded"
        />

        <button
          onClick={uploadFile}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Upload
        </button>
      </div>

      {/* Selected File */}
      {selectedFileName && (
        <p className="mt-2 text-sm text-gray-600">
          Selected: {selectedFileName}
        </p>
      )}

      {/* File List */}
      <div className="mt-4 space-y-3">
        {pdfs.map((file, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row md:items-center justify-between gap-2 border p-4 rounded shadow"
          >
            <div>
              <p className="text-sm text-gray-500">{file.date}</p>
              <p className="font-semibold">{file.name}</p>
              <p className="text-xs text-gray-400">
                {file.type || "Medical Report"}
              </p>
            </div>

            <div className="flex gap-2">
              <a href={file.url} target="_blank">
                <button className="bg-gray-500 text-white px-3 py-1 rounded">
                  View
                </button>
              </a>

              <a href={file.url} download>
                <button className="bg-blue-500 text-white px-3 py-1 rounded">
                  Download
                </button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Input;
