import { useEffect, useState } from "react";
import BASE_URL from "@/constants/api";
import { X, Save } from "lucide-react";

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
      DOB: initialUser.DOB
        ? new Date(initialUser.DOB).toISOString().split("T")[0]
        : "",
      age:
        initialUser.age != null && initialUser.age !== ""
          ? String(initialUser.age)
          : "",
      gender: initialUser.gender || "",
      image: initialUser.image || initialUser.avatar || "",
    });
  }, [initialUser, open]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = sessionStorage.getItem("token");

      const body = {
        fullname: form.fullname.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        DOB: form.DOB,
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

      // Update session storage
      try {
        const prev = JSON.parse(sessionStorage.getItem("user") || "{}");
        sessionStorage.setItem("user", JSON.stringify({ ...prev, ...updated }));
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && !saving && onClose()}
    >
      <div
        className="bg-card text-card-foreground border border-border rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Edit Profile</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Input
            label="Full Name"
            name="fullname"
            value={form.fullname}
            onChange={handleChange}
          />
          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
          <Input
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
          />
          <Input
            label="Date of Birth"
            name="DOB"
            type="date"
            value={form.DOB}
            onChange={handleChange}
          />
          <Input
            label="Age"
            name="age"
            type="number"
            value={form.age}
            onChange={handleChange}
          />

          {/* Gender */}
          <div>
            <label className="text-muted-foreground">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="mt-1 w-full border border-border rounded-lg px-3 py-2 bg-background"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <Input
            label="Photo URL"
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="https://example.com/photo.jpg"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 rounded-lg border border-border hover:bg-muted"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable Input Component
const Input = ({ label, name, ...props }) => (
  <div>
    <label className="text-muted-foreground">{label}</label>
    <input
      name={name}
      {...props}
      className="mt-1 w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
    />
  </div>
);
