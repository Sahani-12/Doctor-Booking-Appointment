import type { DoctorProfile } from "../../pages/UserProfiles";

function joinField(v: string[] | undefined) {
  return v && v.length ? v.join(", ") : "—";
}

export default function UserInfoCard({ doctor }: { doctor: DoctorProfile }) {
  const degrees = Array.isArray(doctor.degrees)
    ? doctor.degrees.join(", ")
    : "—";
  const certification = joinField(doctor.certification);
  const educationHistory = joinField(doctor.educationHistory);

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
        Professional details
      </h4>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7">
        <div>
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Email</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {doctor.email}
          </p>
        </div>
        <div>
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Phone</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {doctor.phone || "—"}
          </p>
        </div>
        <div>
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            Experience
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {doctor.experience || "—"}
          </p>
        </div>
        <div>
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Gender</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {doctor.gender || "—"}
          </p>
        </div>
        <div className="lg:col-span-2">
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            Degrees
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {degrees}
          </p>
        </div>
        <div className="lg:col-span-2">
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            Certifications
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {certification}
          </p>
        </div>
        <div className="lg:col-span-2">
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            Education history
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {educationHistory}
          </p>
        </div>
        <div className="lg:col-span-2">
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">About</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {doctor.description || "Add a short bio from Edit profile."}
          </p>
        </div>
      </div>
    </div>
  );
}
