import React from "react";
import { Check, X } from "lucide-react";
import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

interface Doctor {
  _id: string;
  fullname: string;
  email: string;
  specialization: string[];
  fee?: number;
  experience?: string;
  isApproved: boolean;
  isVerified?: boolean;
  createdAt: string;
  phone?: string;
  city?: string;
}

interface DoctorDetailsModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (doctorId: string, currentStatus: boolean) => Promise<void>;
  onDelete: (doctorId: string) => Promise<void>;
  isApproving: boolean;
  isDeleting: boolean;
}

export default function DoctorDetailsModal({
  doctor,
  isOpen,
  onClose,
  onApprove,
  onDelete,
  isApproving,
  isDeleting,
}: DoctorDetailsModalProps) {
  if (!doctor) return null;

  const handleApprove = async () => {
    await onApprove(doctor._id, doctor.isApproved);
  };

  const handleDelete = async () => {
    if (
      window.confirm("Are you sure you want to delete this doctor permanently?")
    ) {
      await onDelete(doctor._id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Doctor Details"
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
          <Button
            variant={doctor.isApproved ? "warning" : "success"}
            size="md"
            isLoading={isApproving}
            onClick={handleApprove}
          >
            {doctor.isApproved ? "Reject" : "Approve"}
          </Button>
          <Button
            variant="danger"
            size="md"
            isLoading={isDeleting}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Header with Name and Status */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {doctor.fullname}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {Array.isArray(doctor.specialization)
                ? doctor.specialization.join(", ")
                : doctor.specialization}
            </p>
          </div>
          <Badge
            variant={doctor.isApproved ? "success" : "warning"}
            size="lg"
            icon={
              doctor.isApproved ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )
            }
          >
            {doctor.isApproved ? "Approved" : "Pending"}
          </Badge>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Email Address
            </label>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 break-all">
              {doctor.email}
            </p>
          </div>

          {doctor.phone && (
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Phone Number
              </label>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {doctor.phone}
              </p>
            </div>
          )}

          {doctor.city && (
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                City
              </label>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {doctor.city}
              </p>
            </div>
          )}

          {doctor.experience && (
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Experience
              </label>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {doctor.experience}
              </p>
            </div>
          )}

          {doctor.fee && (
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Consultation Fee
              </label>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                ₹{doctor.fee}
              </p>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Member Since
            </label>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
              {new Date(doctor.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Specialization
            </label>
            <div className="mt-1 flex flex-wrap gap-2">
              {Array.isArray(doctor.specialization)
                ? doctor.specialization.map((spec, idx) => (
                    <Badge key={idx} variant="info" size="sm">
                      {spec}
                    </Badge>
                  ))
                : null}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
