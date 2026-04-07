import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { doctorAvatarUrl, resolveMediaUrl } from "../../utils/mediaUrl";
import { API_BASE } from "../../constants/api";
import type { DoctorProfile } from "../../pages/UserProfiles";
import { useState, useEffect } from "react";

type Props = {
  doctor: DoctorProfile;
  onSaved: () => void;
};

function joinList(
  v: string | string[] | undefined,
): string {
  if (v == null) return "";
  if (Array.isArray(v)) return v.filter(Boolean).join(", ");
  return String(v);
}

export default function UserMetaCard({ doctor, onSaved }: Props) {
  const { isOpen, openModal, closeModal } = useModal();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullname: doctor.fullname || "",
    phone: doctor.phone || "",
    fee: doctor.fee != null ? String(doctor.fee) : "",
    emergencyFee: doctor.emergencyFee != null ? String(doctor.emergencyFee) : "",
    description: doctor.description || "",
    profileImage: doctor.profileImage || "",
    gender: doctor.gender || "",
    DOB: doctor.DOB || "",
    age: doctor.age != null ? String(doctor.age) : "",
    experience: doctor.experience || "",
    specialization: joinList(doctor.specialization),
    subspecialization: joinList(doctor.subspecialization),
    degrees: joinList(doctor.degrees),
    certification: joinList(doctor.certification),
    educationHistory: joinList(doctor.educationHistory),
  });

  useEffect(() => {
    setForm({
      fullname: doctor.fullname || "",
      phone: doctor.phone || "",
      fee: doctor.fee != null ? String(doctor.fee) : "",
      emergencyFee:
        doctor.emergencyFee != null ? String(doctor.emergencyFee) : "",
      description: doctor.description || "",
      profileImage: doctor.profileImage || "",
      gender: doctor.gender || "",
      DOB: doctor.DOB || "",
      age: doctor.age != null ? String(doctor.age) : "",
      experience: doctor.experience || "",
      specialization: joinList(doctor.specialization),
      subspecialization: joinList(doctor.subspecialization),
      degrees: joinList(doctor.degrees),
      certification: joinList(doctor.certification),
      educationHistory: joinList(doctor.educationHistory),
    });
  }, [doctor]);

  const specLabel = Array.isArray(doctor.specialization)
    ? doctor.specialization.join(", ")
    : doctor.specialization || "—";

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = sessionStorage.getItem("token");
      const payload: Record<string, unknown> = {
        fullname: form.fullname,
        phone: form.phone,
        fee: form.fee === "" ? undefined : Number(form.fee),
        emergencyFee:
          form.emergencyFee === "" ? undefined : Number(form.emergencyFee),
        description: form.description,
        profileImage: form.profileImage.trim() || undefined,
        gender: form.gender.trim() || undefined,
        DOB: form.DOB.trim() || undefined,
        experience: form.experience.trim() || undefined,
        specialization: form.specialization.trim(),
        subspecialization: form.subspecialization.trim(),
        degrees: form.degrees.trim(),
        certification: form.certification.trim(),
        educationHistory: form.educationHistory.trim(),
      };
      if (form.age.trim() === "") payload.age = null;
      else {
        const n = Number(form.age);
        payload.age = Number.isFinite(n) ? n : undefined;
      }

      const res = await fetch(`${API_BASE}/doctors/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (j.success) {
        onSaved();
        closeModal();
      } else alert(j.message || "Save failed");
    } catch {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 sm:flex-row">
            <div className="w-24 h-24 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 ring-2 ring-emerald-500/20">
              <img
                className="w-full h-full object-cover"
                src={resolveMediaUrl(doctor.profileImage) || doctorAvatarUrl(doctor)}
                alt={doctor.fullname}
              />
            </div>
            <div className="order-3 sm:order-2 text-center sm:text-left flex-1">
              <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
                {doctor.fullname}
              </h4>
              <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">
                {specLabel}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {doctor.city || doctor.location || "Location not set"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                {doctor.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 xl:w-auto"
          >
            Edit profile
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[560px] m-4">
        <div className="relative w-full p-4 overflow-y-auto max-h-[90vh] bg-white rounded-2xl dark:bg-gray-900 lg:p-8">
          <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
            Update profile
          </h4>
          <div className="space-y-4">
            <div>
              <Label>Full name</Label>
              <Input
                value={form.fullname}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, fullname: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Photo URL (https or /uploads/... after upload)</Label>
              <Input
                placeholder="https://... or /uploads/file.jpg"
                value={form.profileImage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, profileImage: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Gender</Label>
                <Input
                  value={form.gender}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm((f) => ({ ...f, gender: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Date of birth</Label>
                <Input
                  placeholder="e.g. 1985-03-20"
                  value={form.DOB}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm((f) => ({ ...f, DOB: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Age</Label>
              <Input
                type="number"
                min="0"
                value={form.age}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, age: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Experience</Label>
              <Input
                placeholder="e.g. 12 years"
                value={form.experience}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, experience: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Specialization (comma-separated)</Label>
              <Input
                value={form.specialization}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, specialization: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Sub-specialization (comma-separated)</Label>
              <Input
                value={form.subspecialization}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, subspecialization: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Degrees (comma-separated)</Label>
              <Input
                value={form.degrees}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, degrees: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Certifications (comma-separated)</Label>
              <Input
                value={form.certification}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, certification: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Education history (comma-separated)</Label>
              <Input
                value={form.educationHistory}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, educationHistory: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Consultation fee (₹)</Label>
                <Input
                  type="number"
                  value={form.fee}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm((f) => ({ ...f, fee: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Emergency fee (₹)</Label>
                <Input
                  type="number"
                  value={form.emergencyFee}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm((f) => ({ ...f, emergencyFee: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Bio / description</Label>
              <textarea
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm min-h-[100px]"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button size="sm" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
