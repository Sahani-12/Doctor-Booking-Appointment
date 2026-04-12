import React from "react";
import { useNavigate } from "react-router-dom";
import { doctorAvatarUrl, formatSpecialization } from "@/utils/mediaUrl";

const DoctorProfileCardClean = ({ doctor }) => {
  const navigate = useNavigate();

  const shortDesc = doctor?.description
    ? doctor.description.split(" ").slice(0, 10).join(" ") +
      (doctor.description.split(" ").length > 10 ? "..." : "")
    : "No description provided.";

  const handleConsult = () => {
    navigate("/consult", {
      state: { doctor },
    });
  };

  return (
    <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Top Section */}
      <div className="p-5">
        <div className="flex items-center gap-4">
          {/* Doctor Image */}
          <img
            src={doctorAvatarUrl(doctor)}
            alt={doctor?.fullname || "doctor"}
            className="w-16 h-16 rounded-full object-cover border border-border"
          />

          {/* Doctor Info */}
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {doctor?.fullname || "Doctor"}
            </h3>

            <p className="text-sm text-muted-foreground">
              {formatSpecialization(doctor?.specialization)}
              {doctor?.clinicName && ` • ${doctor.clinicName}`}
            </p>

            <p className="text-xs text-muted-foreground">
              {doctor?.experience
                ? `${doctor.experience} yrs exp`
                : "Experience N/A"}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-sm text-muted-foreground">{shortDesc}</p>

        {/* Location */}
        <div className="mt-3 bg-muted px-3 py-2 rounded-md text-sm text-muted-foreground">
          📍 {doctor?.location || "Location not provided"}
        </div>

        {/* Stats */}
        <div className="mt-4 flex justify-between text-center">
          <div>
            <p className="text-primary font-semibold">
              {doctor?.stories?.length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Stories</p>
          </div>

          <div>
            <p className="text-yellow-500 font-semibold">
              {doctor?.rating || "N/A"} ⭐
            </p>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="flex gap-2 p-4 bg-muted border-t border-border">
        <button
          onClick={handleConsult}
          className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          Consult Now
        </button>

        <button
          onClick={() => navigate(`/doctors-page/${doctor._id}`)}
          className="flex-1 border border-border text-foreground py-2 rounded-lg hover:bg-accent transition"
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default DoctorProfileCardClean;
