
import React from 'react';

const DoctorCardSkeletonLoader = () => {
  return (
    <div className="bg-white shadow-md rounded-lg border border-gray-100 p-6 animate-pulse w-full max-w-md mx-auto">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-slate-300" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-slate-300 rounded" />
          <div className="h-3 w-2/3 bg-slate-300 rounded" />
          <div className="h-3 w-1/3 bg-slate-300 rounded" />
        </div>
      </div>

      <div className="mt-4 h-4 w-full bg-slate-300 rounded" />
      <div className="mt-2 h-4 w-5/6 bg-slate-300 rounded" />

      <div className="mt-4 bg-emerald-50 p-3 rounded-md border border-emerald-100">
        <div className="h-4 w-2/3 bg-slate-300 rounded" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <div className="h-4 w-3/4 bg-slate-300 rounded" />
          <div className="h-3 w-2/3 bg-slate-300 rounded" />
        </div>
        <div className="space-y-1">
          <div className="h-4 w-1/2 bg-slate-300 rounded" />
          <div className="h-3 w-2/3 bg-slate-300 rounded" />
        </div>
        <div className="space-y-1">
          <div className="h-4 w-1/2 bg-slate-300 rounded" />
          <div className="h-3 w-1/2 bg-slate-300 rounded" />
        </div>
      </div>

      <div className="mt-4 flex justify-between">
        <div className="h-9 w-36 bg-slate-300 rounded-md" />
        <div className="h-9 w-28 bg-slate-300 rounded-md" />
      </div>
    </div>
  );
};

export default DoctorCardSkeletonLoader;
