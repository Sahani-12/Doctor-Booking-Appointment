import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Eye,
  Loader2,
} from "lucide-react";
import apiService from "../services/apiService";

interface MedicalRecord {
  _id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  diagnosis: string;
  chiefComplaint: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  notes?: string;
}

interface Admission {
  _id: string;
  patientName: string;
  wardType: string;
  primaryDiagnosis: string;
  status: "pending" | "approved" | "discharged" | "rejected";
  admissionDate: string;
  estimatedDuration?: number;
  doctorName: string;
}

export default function AdminApprovalWorkflows() {
  const [activeTab, setActiveTab] = useState("medical-records");
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null,
  );
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(
    null,
  );
  const [approvalNotes, setApprovalNotes] = useState("");

  useEffect(() => {
    if (activeTab === "medical-records") {
      loadMedicalRecords();
    } else {
      loadAdmissions();
    }
  }, [activeTab]);

  const loadMedicalRecords = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.getHospitalMedicalRecords({
        status: "pending",
      });
      setMedicalRecords(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load medical records");
    } finally {
      setLoading(false);
    }
  };

  const loadAdmissions = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.getHospitalAdmissions({
        status: "pending",
      });
      setAdmissions(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load admissions");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMedicalRecord = async (
    recordId: string,
    status: "approved" | "rejected",
  ) => {
    try {
      await apiService.approveMedicalRecord(recordId, status);
      loadMedicalRecords();
      setSelectedRecord(null);
      setApprovalNotes("");
    } catch (err: any) {
      setError(err.message || "Failed to update record");
    }
  };

  const handleApproveAdmission = async (
    admissionId: string,
    status: "approved" | "rejected",
  ) => {
    try {
      await apiService.approveAdmission(admissionId, status);
      loadAdmissions();
      setSelectedAdmission(null);
      setApprovalNotes("");
    } catch (err: any) {
      setError(err.message || "Failed to update admission");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { bg: string; text: string; icon: React.ReactNode }
    > = {
      pending: {
        bg: "bg-amber-100",
        text: "text-amber-700",
        icon: <Clock className="w-4 h-4" />,
      },
      approved: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: <XCircle className="w-4 h-4" />,
      },
      discharged: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: <CheckCircle className="w-4 h-4" />,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}
      >
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Hospital Approvals & Workflows
          </h1>
          <p className="text-gray-600 mt-2">
            Manage patient admissions, medical records, and lab orders
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("medical-records")}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === "medical-records"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileText className="inline w-5 h-5 mr-2" />
            Medical Records
          </button>
          <button
            onClick={() => setActiveTab("admissions")}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === "admissions"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <AlertCircle className="inline w-5 h-5 mr-2" />
            Admissions
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Medical Records Tab */}
        {activeTab === "medical-records" && (
          <div>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : medicalRecords.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No pending medical records for approval
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {medicalRecords.map((record) => (
                  <div
                    key={record._id}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {record.patientName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          By Dr. {record.doctorName}
                        </p>
                      </div>
                      {getStatusBadge(record.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">
                          Diagnosis
                        </p>
                        <p className="text-sm text-gray-900 mt-1">
                          {record.diagnosis}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">
                          Chief Complaint
                        </p>
                        <p className="text-sm text-gray-900 mt-1">
                          {record.chiefComplaint}
                        </p>
                      </div>
                    </div>

                    {record.notes && (
                      <div className="bg-gray-50 rounded p-3 mb-4">
                        <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                          Doctor Notes
                        </p>
                        <p className="text-sm text-gray-700">{record.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="flex-1 px-4 py-2 border border-blue-300 rounded-lg text-blue-700 font-semibold hover:bg-blue-50 transition"
                      >
                        <Eye className="inline w-4 h-4 mr-2" />
                        View Details
                      </button>
                      <button
                        onClick={() =>
                          handleApproveMedicalRecord(record._id, "approved")
                        }
                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
                      >
                        <CheckCircle className="inline w-4 h-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleApproveMedicalRecord(record._id, "rejected")
                        }
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                      >
                        <XCircle className="inline w-4 h-4 mr-2" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Admissions Tab */}
        {activeTab === "admissions" && (
          <div>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : admissions.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No pending admissions for approval
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {admissions.map((admission) => (
                  <div
                    key={admission._id}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {admission.patientName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Dr. {admission.doctorName} - {admission.wardType}
                        </p>
                      </div>
                      {getStatusBadge(admission.status)}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">
                          Primary Diagnosis
                        </p>
                        <p className="text-sm text-gray-900 mt-1">
                          {admission.primaryDiagnosis}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">
                          Admission Date
                        </p>
                        <p className="text-sm text-gray-900 mt-1">
                          {new Date(
                            admission.admissionDate,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">
                          Estimated Duration
                        </p>
                        <p className="text-sm text-gray-900 mt-1">
                          {admission.estimatedDuration || "TBD"} days
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedAdmission(admission)}
                        className="flex-1 px-4 py-2 border border-blue-300 rounded-lg text-blue-700 font-semibold hover:bg-blue-50 transition"
                      >
                        <Eye className="inline w-4 h-4 mr-2" />
                        View Details
                      </button>
                      <button
                        onClick={() =>
                          handleApproveAdmission(admission._id, "approved")
                        }
                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
                      >
                        <CheckCircle className="inline w-4 h-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleApproveAdmission(admission._id, "rejected")
                        }
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                      >
                        <XCircle className="inline w-4 h-4 mr-2" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
