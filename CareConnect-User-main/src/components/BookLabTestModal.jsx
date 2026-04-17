import React, { useState } from "react";
import { X, Loader2, Beaker, Clock, AlertCircle } from "lucide-react";
import BASE_URL from "@/constants/api";

const labTests = [
  {
    category: "Blood Tests",
    tests: [
      "Complete Blood Count (CBC)",
      "Lipid Profile",
      "Liver Function Test (LFT)",
      "Kidney Function Test (KFT)",
      "Blood Sugar (Fasting/Random)",
    ],
  },
  {
    category: "Thyroid",
    tests: ["Thyroid Profile (T3, T4, TSH)", "Free T3", "Free T4"],
  },
  { category: "Urine & Stool", tests: ["Urine Analysis", "Stool Test"] },
  { category: "Cardiac", tests: ["Troponin", "BNP", "D-Dimer"] },
  {
    category: "Hormones",
    tests: ["Testosterone", "Estrogen", "Progesterone", "Cortisol"],
  },
];

export default function BookLabTestModal({ open, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState("Blood Tests");
  const [test, setTest] = useState("Complete Blood Count (CBC)");
  const [priority, setPriority] = useState("routine");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  if (!open) return null;

  const currentCategory = labTests.find(
    (cat) => cat.category === selectedCategory,
  );

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
        body: JSON.stringify({
          testName: test,
          notes,
          priority,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Lab test ordered successfully! You will be contacted shortly.",
        });
        setTimeout(() => {
          onClose();
          setMessage({ type: "", text: "" });
          setTest("Complete Blood Count (CBC)");
          setNotes("");
          setPriority("routine");
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
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-background to-muted rounded-2xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 relative animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:bg-muted transition"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Beaker className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">
              Book Lab Test
            </h2>
          </div>
          <p className="text-muted-foreground">
            Schedule your laboratory test with comprehensive options
          </p>
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`p-4 mb-6 rounded-xl flex items-start gap-3 ${
              message.type === "success"
                ? "bg-green-100/50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30"
                : "bg-red-100/50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30"
            }`}
          >
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Test Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              Select Test Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {labTests.map((cat) => (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.category);
                    setTest(cat.tests[0]);
                  }}
                  className={`p-3 rounded-lg font-medium text-sm transition ${
                    selectedCategory === cat.category
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  {cat.category}
                </button>
              ))}
            </div>
          </div>

          {/* Specific Test Selection */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Select Specific Test
            </label>
            <select
              value={test}
              onChange={(e) => setTest(e.target.value)}
              className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary transition"
            >
              {currentCategory?.tests.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "routine", label: "Routine", desc: "3-5 days" },
                { value: "urgent", label: "Urgent", desc: "1-2 days" },
                { value: "stat", label: "Stat (ASAP)", desc: "Same day" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={`p-3 rounded-lg text-center transition ${
                    priority === opt.value
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted hover:bg-muted/80 text-foreground border border-border"
                  }`}
                >
                  <div className="font-semibold text-sm">{opt.label}</div>
                  <div className="text-xs opacity-80 flex items-center justify-center gap-1 mt-1">
                    <Clock size={12} /> {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              placeholder="Any special instructions, symptoms, or doctor's reference..."
              className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary transition resize-none"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition disabled:opacity-60 flex justify-center items-center gap-2 shadow-md"
            >
              {submitting && <Loader2 className="animate-spin" size={18} />}
              {submitting ? "Booking..." : "Confirm & Book Test"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
