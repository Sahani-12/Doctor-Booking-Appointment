import React, { useState, useEffect } from "react";
import {
  Play,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Plus,
} from "lucide-react";
import apiService from "../services/apiService";

interface Patient {
  _id: string;
  fullname: string;
  email: string;
  age?: number;
}

export default function DoctorAdmitPatientPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState({
    patientId: "",
    wardType: "General Ward",
    primaryDiagnosis: "",
    secondaryDiagnosis: "",
    treatmentPlan: "",
    medications: "",
    estimatedDuration: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const wardTypes = [
    "General Ward",
    "ICU",
    "CCU",
    "Isolation Ward",
    "Pediatric Ward",
    "Maternity Ward",
    "Surgical Ward",
  ];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.patientId ||
      !formData.primaryDiagnosis ||
      !formData.wardType
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const admissionData = {
        patientId: formData.patientId,
        wardType: formData.wardType,
        primaryDiagnosis: formData.primaryDiagnosis,
        secondaryDiagnosis: formData.secondaryDiagnosis,
        treatmentPlan: formData.treatmentPlan,
        medications: formData.medications
          ? formData.medications.split("|").reduce((acc: any, med: any) => {
              const [name, dosage] = med.split(":").map((s: any) => s.trim());
              if (name && dosage) acc[name] = dosage;
              return acc;
            }, {})
          : {},
        estimatedDuration: formData.estimatedDuration
          ? parseInt(formData.estimatedDuration)
          : undefined,
      };

      await apiService.createAdmission(admissionData);

      setSuccess(true);
      setFormData({
        patientId: "",
        wardType: "General Ward",
        primaryDiagnosis: "",
        secondaryDiagnosis: "",
        treatmentPlan: "",
        medications: "",
        estimatedDuration: "",
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create admission");
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
            <Play className="w-10 h-10 text-blue-600" />
            Admit Patient to Hospital
          </h1>
          <p className="text-gray-600 mt-2">
            Create a new hospital admission for a patient
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
                Admission request created successfully. Hospital admin will
                review and approve shortly.
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
                    {patient.fullname}
                    {patient.age && ` (Age: ${patient.age})`} - {patient.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Ward Type and Duration */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ward Type *
              </label>
              <select
                name="wardType"
                value={formData.wardType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {wardTypes.map((ward) => (
                  <option key={ward} value={ward}>
                    {ward}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estimated Duration (days)
              </label>
              <input
                type="number"
                name="estimatedDuration"
                value={formData.estimatedDuration}
                onChange={handleInputChange}
                placeholder="e.g., 5"
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Diagnosis */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Primary Diagnosis *
              </label>
              <input
                type="text"
                name="primaryDiagnosis"
                value={formData.primaryDiagnosis}
                onChange={handleInputChange}
                placeholder="e.g., Pneumonia"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Secondary Diagnosis (optional)
              </label>
              <input
                type="text"
                name="secondaryDiagnosis"
                value={formData.secondaryDiagnosis}
                onChange={handleInputChange}
                placeholder="e.g., Asthma"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Medications */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Medications (name: dosage | name: dosage)
            </label>
            <textarea
              name="medications"
              value={formData.medications}
              onChange={handleInputChange}
              placeholder="e.g., Amoxicillin: 500mg | Paracetamol: 1000mg"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Treatment Plan */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Treatment Plan
            </label>
            <textarea
              name="treatmentPlan"
              value={formData.treatmentPlan}
              onChange={handleInputChange}
              placeholder="Describe the treatment plan for this admission..."
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
                  <Plus className="w-5 h-5" />
                  Create Admission
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  patientId: "",
                  wardType: "General Ward",
                  primaryDiagnosis: "",
                  secondaryDiagnosis: "",
                  treatmentPlan: "",
                  medications: "",
                  estimatedDuration: "",
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
            <strong>Admission Workflow:</strong> Hospital admin will review and
            approve your admission request. Once approved, the patient will be
            officially admitted and assigned to the specified ward.
          </p>
        </div>
      </div>
    </div>
  );
}
