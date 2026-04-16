import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Pages/Home";
import Login from "./components/LoginSignup/Login";
import Signup from "./components/LoginSignup/SignUp";
import DoctorSearch from "./components/Pages/DoctorSearch";
import UserDashboard from "./components/Pages/UserDashboard";
import AppointmentSchedule from "./components/Pages/AppointmentSchedule";
import ShareQr from "./components/ShareQrCode";
import DoctorProfile from "./components/Pages/DoctorsProfile";
import UserProfile from "./components/Pages/UserProfile";
import VideoConfrence from "./components/VideoConfrence";
import Consult from "./components/Pages/Consult";
import Help from "./components/Pages/Help";
import About from "./components/Pages/About";
import Services from "./components/Pages/Services";
import SymptomChecker from "./components/Pages/SymptomChecker";
import VideoConsultation from "./VideoConsultation";
import PatientProfile from "./UserProfile";
import UserAppointmentsPage from "./components/Pages/UserAppointmentsPage";
import MedicalRecordsPage from "./components/Pages/MedicalRecordsPage";
import DepartmentsPage from "./components/Pages/DepartmentsPage";
import HospitalBillsPage from "./components/Pages/HospitalBillsPage";
import ActiveAdmissionPage from "./components/Pages/ActiveAdmissionPage";
import LabReportsPage from "./components/Pages/LabReportsPage";
import AdmissionHistoryPage from "./components/Pages/AdmissionHistoryPage";
import VideoCallPage from "./components/Pages/VideoCallPage";
// New Hospital Portal Pages
import HospitalAppointments from "./components/Pages/HospitalAppointments";
import HospitalMedicalRecords from "./components/Pages/HospitalMedicalRecords";
import HospitalVideoCall from "./components/Pages/HospitalVideoCall";
import HospitalLabReports from "./components/Pages/HospitalLabReports";
import HospitalBills from "./components/Pages/HospitalBills";
import HospitalAdmissions from "./components/Pages/HospitalAdmissions";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Doctor Routes */}
      <Route path="/doctor-search" element={<DoctorSearch />} />
      <Route path="/doctors" element={<DoctorSearch />} />

      <Route path="/user-dashboard/:username" element={<UserDashboard />} />
      <Route path="/appointment" element={<AppointmentSchedule />} />
      <Route path="/qr-code-sharing" element={<ShareQr />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/doctors-page/:id" element={<DoctorProfile />} />
      <Route path="/User-page/:id" element={<UserProfile />} />
      <Route path="/video" element={<VideoConfrence />} />
      <Route path="/consult" element={<Consult />} />
      <Route path="/help" element={<Help />} />
      <Route path="/symptom-checker" element={<SymptomChecker />} />
      <Route path="/video-consultation" element={<VideoConsultation />} />
      <Route path="/profile" element={<PatientProfile />} />
      <Route path="/appointments" element={<UserAppointmentsPage />} />
      <Route path="/medical-records" element={<MedicalRecordsPage />} />
      <Route path="/departments" element={<DepartmentsPage />} />
      <Route path="/hospital-bills" element={<HospitalBillsPage />} />
      <Route path="/active-admission" element={<ActiveAdmissionPage />} />
      <Route path="/lab-reports" element={<LabReportsPage />} />
      <Route path="/admission-history" element={<AdmissionHistoryPage />} />
      <Route path="/video-call/:roomId" element={<VideoCallPage />} />

      {/* Hospital Portal Routes */}
      <Route
        path="/hospital"
        element={<Navigate to="/hospital/appointments" replace />}
      />
      <Route path="/hospital/appointments" element={<HospitalAppointments />} />
      <Route
        path="/hospital/medical-records"
        element={<HospitalMedicalRecords />}
      />
      <Route
        path="/hospital/video-call/:appointmentId"
        element={<HospitalVideoCall />}
      />
      <Route path="/hospital/lab-reports" element={<HospitalLabReports />} />
      <Route path="/hospital/bills" element={<HospitalBills />} />
      <Route path="/hospital/admissions" element={<HospitalAdmissions />} />

      {/* Catch old links and redirect to the new Dashboard */}
      <Route
        path="/hospital-portal"
        element={<Navigate to="/hospital/appointments" replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
