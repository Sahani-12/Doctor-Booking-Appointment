import React, { useState, useEffect } from "react";
import {
  FileText,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import apiService from "../services/apiService";

interface Patient {
  _id: string;
  fullname: string;
  email: string;
  phone: string;
}

export default function DoctorCreateMedicalRecord() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState({
    patientId: "",
    diagnosis: "",
    chiefComplaint: "",
    symptoms: "",
    medications: "",
    vitals: {
      bloodPressure: "",
      temperature: "",
      heartRate: "",
      respiratoryRate: "",
    },
    treatmentPlan: "",
    notes: "",
  });

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
    if (name.startsWith("vitals.")) {
      const key = name.replace("vitals.", "");
      setFormData({
        ...formData,
        vitals: { ...formData.vitals, [key]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.patientId ||
      !formData.diagnosis ||
      !formData.chiefComplaint
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const recordData = {
        patientId: formData.patientId,
        diagnosis: formData.diagnosis,
        chiefComplaint: formData.chiefComplaint,
        symptoms: formData.symptoms
          ? formData.symptoms.split(",").map((s) => s.trim())
          : [],
        medications: formData.medications
          ? formData.medications.split("|").reduce((acc: any, med: any) => {
              const [name, dosage] = med.split(":").map((s: any) => s.trim());
              if (name && dosage) acc[name] = dosage;
              return acc;
            }, {})
          : {},
        vitals: {
          bloodPressure: formData.vitals.bloodPressure,
          temperature: formData.vitals.temperature,
          heartRate: formData.vitals.heartRate,
          respiratoryRate: formData.vitals.respiratoryRate,
        },
        treatmentPlan: formData.treatmentPlan,
        notes: formData.notes,
      };

      await apiService.createMedicalRecord(recordData);

      setSuccess(true);
      setFormData({
        patientId: "",
        diagnosis: "",
        chiefComplaint: "",
        symptoms: "",
        medications: "",
        vitals: {
          bloodPressure: "",
          temperature: "",
          heartRate: "",
          respiratoryRate: "",
        },
        treatmentPlan: "",
        notes: "",
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create medical record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Create Medical Record
          </h1>
          <p className="text-gray-600 mt-2">
            Document patient medical records for hospital management
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
                Medical record created successfully and sent for admin approval
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

          {/* Chief Complaint and Diagnosis */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Chief Complaint *
              </label>
              <input
                type="text"
                name="chiefComplaint"
                value={formData.chiefComplaint}
                onChange={handleInputChange}
                placeholder="e.g., Severe headache"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Diagnosis *
              </label>
              <input
                type="text"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleInputChange}
                placeholder="e.g., Migraine"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Symptoms */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Symptoms (comma-separated)
            </label>
            <input
              type="text"
              name="symptoms"
              value={formData.symptoms}
              onChange={handleInputChange}
              placeholder="e.g., Pain, Nausea, Dizziness"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Vitals Grid */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vital Signs
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Blood Pressure (mmHg)
                </label>
                <input
                  type="text"
                  name="vitals.bloodPressure"
                  value={formData.vitals.bloodPressure}
                  onChange={handleInputChange}
                  placeholder="e.g., 120/80"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Temperature (°C)
                </label>
                <input
                  type="text"
                  name="vitals.temperature"
                  value={formData.vitals.temperature}
                  onChange={handleInputChange}
                  placeholder="e.g., 98.6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Heart Rate (bpm)
                </label>
                <input
                  type="text"
                  name="vitals.heartRate"
                  value={formData.vitals.heartRate}
                  onChange={handleInputChange}
                  placeholder="e.g., 72"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Respiratory Rate (breaths/min)
                </label>
                <input
                  type="text"
                  name="vitals.respiratoryRate"
                  value={formData.vitals.respiratoryRate}
                  onChange={handleInputChange}
                  placeholder="e.g., 16"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
              placeholder="e.g., Paracetamol: 500mg | Ibuprofen: 200mg"
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
              placeholder="Describe the treatment plan..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional clinical notes..."
              rows={3}
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
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Medical Record
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  patientId: "",
                  diagnosis: "",
                  chiefComplaint: "",
                  symptoms: "",
                  medications: "",
                  vitals: {
                    bloodPressure: "",
                    temperature: "",
                    heartRate: "",
                    respiratoryRate: "",
                  },
                  treatmentPlan: "",
                  notes: "",
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
            <strong>Note:</strong> Medical records you create will be reviewed
            by hospital admins before being added to the patient file. This
            workflow ensures data quality and patient safety.
          </p>
        </div>
      </div>
    </div>
  );
}
