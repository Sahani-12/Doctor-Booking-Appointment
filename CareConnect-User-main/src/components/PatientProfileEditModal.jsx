import { useEffect, useState } from "react";
import BASE_URL from "@/constants/api";

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {object | null} props.initialUser
 * @param {(u: object) => void} props.onSaved
 */
export default function PatientProfileEditModal({
  open,
  onClose,
  initialUser,
  onSaved,
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullname: "",
    phone: "",
    city: "",
    DOB: "",
    age: "",
    gender: "",
    image: "",
  });

  useEffect(() => {
    if (!initialUser) return;
    setForm({
      fullname: initialUser.fullname || "",
      phone: initialUser.phone || "",
      city: initialUser.city || "",
      DOB: initialUser.DOB || "",
      age:
        initialUser.age != null && initialUser.age !== ""
          ? String(initialUser.age)
          : "",
      gender: initialUser.gender || "",
      image: initialUser.image || initialUser.avatar || "",
    });
  }, [initialUser, open]);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = sessionStorage.getItem("token");
      const body = {
        fullname: form.fullname.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        DOB: form.DOB.trim(),
        gender: form.gender.trim(),
        image: form.image.trim() || undefined,
      };
      if (form.age.trim() === "") body.age = null;
      else {
        const n = Number(form.age);
        body.age = Number.isFinite(n) ? n : undefined;
      }

      const res = await fetch(`${BASE_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!res.ok || !j.success) {
        alert(j.message || "Could not save profile");
        return;
      }
      const updated = j.data;
      try {
        const prev = JSON.parse(sessionStorage.getItem("user") || "{}");
        sessionStorage.setItem(
          "user",
          JSON.stringify({ ...prev, ...updated }),
        );
      } catch {
        sessionStorage.setItem("user", JSON.stringify(updated));
      }
      onSaved(updated);
      onClose();
    } catch {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && !saving && onClose()}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Edit profile
        </h3>
        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="text-gray-600">Full name</span>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.fullname}
              onChange={(e) =>
                setForm((f) => ({ ...f, fullname: e.target.value }))
              }
            />
          </label>
          <label className="block">
            <span className="text-gray-600">Phone</span>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
            />
          </label>
          <label className="block">
            <span className="text-gray-600">City</span>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.city}
              onChange={(e) =>
                setForm((f) => ({ ...f, city: e.target.value }))
              }
            />
          </label>
          <label className="block">
            <span className="text-gray-600">Date of birth</span>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="e.g. 1990-05-15"
              value={form.DOB}
              onChange={(e) =>
                setForm((f) => ({ ...f, DOB: e.target.value }))
              }
            />
          </label>
          <label className="block">
            <span className="text-gray-600">Age</span>
            <input
              type="number"
              min={0}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.age}
              onChange={(e) =>
                setForm((f) => ({ ...f, age: e.target.value }))
              }
            />
          </label>
          <label className="block">
            <span className="text-gray-600">Gender</span>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.gender}
              onChange={(e) =>
                setForm((f) => ({ ...f, gender: e.target.value }))
              }
            />
          </label>
          <label className="block">
            <span className="text-gray-600">
              Photo URL (https or /uploads/…)
            </span>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="https://… or /uploads/file.jpg"
              value={form.image}
              onChange={(e) =>
                setForm((f) => ({ ...f, image: e.target.value }))
              }
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-gray-300"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
