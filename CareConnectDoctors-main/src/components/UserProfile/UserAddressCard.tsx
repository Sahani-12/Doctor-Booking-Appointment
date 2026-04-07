import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { API_BASE } from "../../constants/api";
import type { DoctorProfile } from "../../pages/UserProfiles";
import { useState, useEffect } from "react";

type Props = {
  doctor: DoctorProfile;
  onSaved: () => void;
};

export default function UserAddressCard({ doctor, onSaved }: Props) {
  const { isOpen, openModal, closeModal } = useModal();
  const [saving, setSaving] = useState(false);
  const [city, setCity] = useState(doctor.city || "");
  const [location, setLocation] = useState(doctor.location || "");
  const [langStr, setLangStr] = useState(
    Array.isArray(doctor.languagesSpoken)
      ? doctor.languagesSpoken.join(", ")
      : "",
  );

  useEffect(() => {
    setCity(doctor.city || "");
    setLocation(doctor.location || "");
    setLangStr(
      Array.isArray(doctor.languagesSpoken)
        ? doctor.languagesSpoken.join(", ")
        : "",
    );
  }, [doctor]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = sessionStorage.getItem("token");
      const languagesSpoken = langStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch(`${API_BASE}/doctors/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city, location, languagesSpoken }),
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
              Practice location &amp; languages
            </h4>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  City
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {doctor.city || "—"}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Address / clinic
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {doctor.location || "—"}
                </p>
              </div>
              <div className="lg:col-span-2">
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Languages
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {Array.isArray(doctor.languagesSpoken) &&
                  doctor.languagesSpoken.length
                    ? doctor.languagesSpoken.join(", ")
                    : "—"}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 lg:w-auto lg:self-start"
          >
            Edit
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[560px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white rounded-2xl dark:bg-gray-900 lg:p-8">
          <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
            Update location
          </h4>
          <div className="space-y-4">
            <div>
              <Label>City</Label>
              <Input
                value={city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCity(e.target.value)
                }
              />
            </div>
            <div>
              <Label>Clinic address</Label>
              <Input
                value={location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLocation(e.target.value)
                }
              />
            </div>
            <div>
              <Label>Languages (comma-separated)</Label>
              <Input
                value={langStr}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLangStr(e.target.value)
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
