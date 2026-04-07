import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import DoctorFeesCard from "../components/UserProfile/DoctorFeesCard";
import PageMeta from "../components/common/PageMeta";
import { API_BASE } from "../constants/api";

export type DoctorProfile = {
  _id: string;
  fullname: string;
  email: string;
  phone?: string;
  profileImage?: string;
  specialization?: string | string[];
  subspecialization?: string | string[];
  description?: string;
  experience?: string;
  fee?: number;
  emergencyFee?: number;
  location?: string;
  city?: string;
  languagesSpoken?: string[];
  degrees?: string[];
  certification?: string[];
  educationHistory?: string[];
  gender?: string;
  DOB?: string;
  age?: number;
};

export default function UserProfiles() {
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setError("Not signed in");
      return;
    }
    setLoading(true);
    fetch(`${API_BASE}/doctors/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data) setDoctor(j.data);
        else setError(j.message || "Could not load profile");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <PageMeta
        title="CareConnect | Doctor profile"
        description="Your professional profile, fees, and practice details."
      />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Doctor profile
        </h3>
        {loading && (
          <p className="text-sm text-gray-500 py-8 text-center">Loading…</p>
        )}
        {!loading && error && (
          <p className="text-sm text-red-600 py-4">{error}</p>
        )}
        {!loading && doctor && (
          <div className="space-y-6">
            <UserMetaCard doctor={doctor} onSaved={load} />
            <DoctorFeesCard doctor={doctor} />
            <UserInfoCard doctor={doctor} />
            <UserAddressCard doctor={doctor} onSaved={load} />
          </div>
        )}
      </div>
    </>
  );
}
