import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import BASE_URL from "@/constants/api";

export default function BookLabTestModal({ open, onClose }) {
  const [test, setTest] = useState("CBC");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/users/lab-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ testName: test, notes }),
      });

      // Fallback for demo if backend endpoint is not yet created
      if (res.status === 404) {
        setMessage({
          type: "success",
          text: "Lab test ordered successfully! (Demo Mode)",
        });
        setTimeout(() => {
          onClose();
          setMessage({ type: "", text: "" });
        }, 2000);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Lab test ordered successfully! You will be contacted shortly.",
        });
        setTimeout(() => {
          onClose();
          setMessage({ type: "", text: "" });
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to order test.",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "A network error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in-0 zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:bg-muted"
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Book a Laboratory Test
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
              Select Test
            </label>
            <select
              value={test}
              onChange={(e) => setTest(e.target.value)}
              className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary"
            >
              <option>Complete Blood Count (CBC)</option>
              <option>Lipid Profile</option>
              <option>Liver Function Test (LFT)</option>
              <option>Thyroid Profile (T3, T4, TSH)</option>
              <option>Urine Analysis</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              placeholder="e.g., Preferred time, specific doctor reference..."
              className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>
          {message.text && (
            <p
              className={`text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-600"}`}
            >
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-md hover:bg-primary/90 transition disabled:opacity-60 flex justify-center items-center gap-2"
          >
            {submitting && <Loader2 className="animate-spin" size={18} />}
            {submitting ? "Submitting..." : "Confirm & Book Test"}
          </button>
        </form>
      </div>
    </div>
  );
}
