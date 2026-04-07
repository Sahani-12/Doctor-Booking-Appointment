import { Routes, Route } from "react-router-dom";
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

const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />
        <Route path="/doctor-search" element={<DoctorSearch />} />
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
      </Routes>
    </>
  );
};

export default AppRoutes;
