import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import Calendar from "./pages/Calendar";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import HospitalHome from "./pages/HospitalHome";
import Consult from "./pages/Consult";
import AppointmentsManagement from "./pages/AppointmentsManagement";
import DoctorProfilePage from "./pages/DoctorProfilePage";
import PatientsHubPage from "./pages/PatientsHubPage";
import CreateMedicalRecordPage from "./pages/CreateMedicalRecordPage";
import AdmitPatientPage from "./pages/AdmitPatientPage";
import CreateLabOrderPage from "./pages/CreateLabOrderPage";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            {/* 1. Overview */}
            <Route path="/home" element={<HospitalHome />} />
            <Route path="/calendar" element={<Calendar />} />

            {/* 2. Clinical Practice */}
            <Route path="/patients-hub" element={<PatientsHubPage />} />
            <Route path="/consult" element={<Consult />} />

            {/* 3. Management */}
            <Route path="/appointments" element={<AppointmentsManagement />} />
            <Route path="/profile" element={<DoctorProfilePage />} />

            {/* 4. Hospital Operations */}
            <Route
              path="/create-record"
              element={<CreateMedicalRecordPage />}
            />
            <Route path="/admit-patient" element={<AdmitPatientPage />} />
            <Route path="/create-lab-order" element={<CreateLabOrderPage />} />

            {/* 5. Miscellaneous / System */}
            <Route path="/blank" element={<Blank />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
