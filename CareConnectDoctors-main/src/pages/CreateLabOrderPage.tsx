import React, { useState, useEffect } from "react";
import {
  Beaker,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Plus,
  X,
} from "lucide-react";
import apiService from "../services/apiService";

interface Patient {
  _id: string;
  fullname: string;
  email: string;
}

interface Test {
  name: string;
  code?: string;
}

const commonTests = [
  { name: "Complete Blood Count (CBC)", code: "CBC" },
  { name: "Liver Function Test (LFT)", code: "LFT" },
  { name: "Kidney Function Test (KFT)", code: "KFT" },
  { name: "Thyroid Function Test (TFT)", code: "TFT" },
  { name: "Glucose Fasting", code: "GLU-F" },
  { name: "Lipid Profile", code: "LIP" },
  { name: "Cardiac Markers (Troponin)", code: "TROPO" },
  { name: "COVID-19 RT-PCR", code: "COVID" },
  { name: "Urinalysis", code: "UA" },
  { name: "Stool Test", code: "STOOL" },
  { name: "Blood Culture", code: "BC" },
  { name: "Chest X-Ray", code: "CXR" },
];

export default function DoctorCreateLabOrderPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState({
    patientId: "",
    tests: [] as Test[],
    clinicalNotes: "",
    urgency: "normal" as "normal" | "urgent",
  });

  const [currentTest, setCurrentTest] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMyPatients();
      setPatients(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addTest = () => {
    if (!currentTest.trim()) {
      setError("Please select or enter a test name");
      return;
    }

    const selectedTest = commonTests.find((t) => t.name === currentTest);
    const newTest = selectedTest || { name: currentTest };

    if (formData.tests.some((t) => t.name === newTest.name)) {
      setError("This test is already added");
      return;
    }

    setFormData({
      ...formData,
      tests: [...formData.tests, newTest],
    });
    setCurrentTest("");
    setError("");
  };

  const removeTest = (index: number) => {
    setFormData({
      ...formData,
      tests: formData.tests.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId) {
      setError("Please select a patient");
      return;
    }

    if (formData.tests.length === 0) {
      setError("Please add at least one test");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const orderData = {
        patientId: formData.patientId,
        tests: formData.tests,
        clinicalNotes: formData.clinicalNotes,
        urgency: formData.urgency,
      };

      await apiService.createLabOrder(orderData);

      setSuccess(true);
      setFormData({
        patientId: "",
        tests: [],
        clinicalNotes: "",
        urgency: "normal",
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create lab order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Beaker className="w-10 h-10 text-blue-600" />
            Order Laboratory Tests
          </h1>
          <p className="text-gray-600 mt-2">
            Create lab test orders for patient diagnosis and monitoring
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 flex gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">Success</p>
              <p className="text-sm text-emerald-700 mt-1">
                Lab order created successfully. Hospital admin will process the
                order shortly.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          {/* Patient Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Patient *
            </label>
            {loading ? (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading patients...
              </div>
            ) : (
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose a patient...</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.fullname} ({patient.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Test Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Tests *
            </label>
            <div className="flex gap-3">
              <select
                value={currentTest}
                onChange={(e) => setCurrentTest(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTest();
                  }
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Search or select a test...</option>
                {commonTests.map((test) => (
                  <option key={test.code} value={test.name}>
                    {test.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addTest}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </div>
          </div>

          {/* Selected Tests */}
          {formData.tests.length > 0 && (
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Selected Tests ({formData.tests.length})
              </p>
              <div className="space-y-2">
                {formData.tests.map((test, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-3 rounded border border-gray-200"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{test.name}</p>
                      {test.code && (
                        <p className="text-xs text-gray-500">
                          Code: {test.code}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTest(index)}
                      className="p-2 hover:bg-red-50 rounded transition text-red-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Urgency */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Urgency
            </label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Clinical Notes */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Clinical Notes / Indication
            </label>
            <textarea
              name="clinicalNotes"
              value={formData.clinicalNotes}
              onChange={handleInputChange}
              placeholder="Provide clinical indication for these tests..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting || loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Lab Order
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  patientId: "",
                  tests: [],
                  clinicalNotes: "",
                  urgency: "normal",
                })
              }
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Clear Form
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Lab Order Workflow:</strong> Hospital admin will review and
            approve your lab order. Once approved, the lab will process the
            tests and results will be available for viewing in the patient's
            record.
          </p>
        </div>
      </div>
    </div>
  );
}
