import React from "react";

const DoctorCardSkeletonLoader = () => {
  return (
    <div className="bg-card text-card-foreground shadow-md rounded-xl border border-border p-6 animate-pulse w-full max-w-md mx-auto transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-muted rounded" />
          <div className="h-3 w-2/3 bg-muted rounded" />
          <div className="h-3 w-1/3 bg-muted rounded" />
        </div>
      </div>

      {/* Description */}
      <div className="mt-4 h-4 w-full bg-muted rounded" />
      <div className="mt-2 h-4 w-5/6 bg-muted rounded" />

      {/* Location */}
      <div className="mt-4 bg-muted p-3 rounded-md border border-border">
        <div className="h-4 w-2/3 bg-muted-foreground/30 rounded" />
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        {[1, 2, 3].map((_, index) => (
          <div key={index} className="space-y-1">
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-3 w-2/3 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="mt-4 flex justify-between">
        <div className="h-9 w-36 bg-muted rounded-md" />
        <div className="h-9 w-28 bg-muted rounded-md" />
      </div>
    </div>
  );
};

export default DoctorCardSkeletonLoader;
