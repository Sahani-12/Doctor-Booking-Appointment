import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import BASE_URL from "@/constants/api";
import { formatSpecialization } from "@/utils/mediaUrl";
import { Building } from "lucide-react";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoadingDepartments(true);
    fetch(`${BASE_URL}/doctors`)
      .then((r) => r.json())
      .then((d) => {
        const doctors = d.data || [];
        const specializations = doctors.flatMap((doc) => doc.specialization);
        const uniqueSpecializations = [...new Set(specializations)];
        const departmentData = uniqueSpecializations.map((spec) => ({
          name: formatSpecialization(spec),
          id: spec,
          desc: `Find top doctors in ${formatSpecialization(spec)}.`,
        }));
        setDepartments(departmentData);
      })
      .catch(() => setDepartments([]))
      .finally(() => setLoadingDepartments(false));
  }, []);

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="p-5 border border-border rounded-xl bg-background animate-pulse"
        >
          <div className="w-12 h-12 bg-muted rounded-lg mb-4"></div>
          <div className="h-5 w-3/4 bg-muted rounded mb-2"></div>
          <div className="h-3 w-full bg-muted rounded"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4 lg:p-6 mt-4">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Hospital Departments
        </h1>
        <p className="text-muted-foreground mb-8">
          Click on a department to find and consult with our expert doctors.
        </p>
        {loadingDepartments ? (
          renderSkeleton()
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {departments.map((d, i) => (
              <div
                key={i}
                onClick={() =>
                  navigate(`/doctor-search?specialization=${d.id}`)
                }
                className="p-5 border border-border rounded-xl bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Building size={24} />
                </div>
                <h3 className="font-bold text-foreground text-lg">{d.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{d.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
