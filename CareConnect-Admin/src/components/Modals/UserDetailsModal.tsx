import React from "react";
import { Check, X } from "lucide-react";
import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

interface User {
  _id: string;
  fullname: string;
  email: string;
  phone?: string;
  age?: number;
  city?: string;
  isVerified?: boolean;
  createdAt: string;
  role?: string;
}

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (userId: string, currentStatus: boolean) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
  isVerifying: boolean;
  isDeleting: boolean;
}

export default function UserDetailsModal({
  user,
  isOpen,
  onClose,
  onVerify,
  onDelete,
  isVerifying,
  isDeleting,
}: UserDetailsModalProps) {
  if (!user) return null;

  const handleVerify = async () => {
    await onVerify(user._id, user.isVerified || false);
  };

  const handleDelete = async () => {
    if (
      window.confirm("Are you sure you want to delete this user permanently?")
    ) {
      await onDelete(user._id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Details"
      size="md"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
          <Button
            variant={user.isVerified ? "warning" : "success"}
            size="md"
            isLoading={isVerifying}
            onClick={handleVerify}
          >
            {user.isVerified ? "Unverify" : "Verify"}
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
              {user.fullname}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {user.role || "User"}
            </p>
          </div>
          <Badge
            variant={user.isVerified ? "success" : "warning"}
            size="lg"
            icon={
              user.isVerified ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )
            }
          >
            {user.isVerified ? "Verified" : "Pending"}
          </Badge>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Email Address
            </label>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 break-all">
              {user.email}
            </p>
          </div>

          {user.phone && (
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Phone Number
              </label>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {user.phone}
              </p>
            </div>
          )}

          {user.age && (
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Age
              </label>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {user.age} years
              </p>
            </div>
          )}

          {user.city && (
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                City
              </label>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {user.city}
              </p>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Member Since
            </label>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
