import React from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import PdfUpload from "../PdfUpload";
import ProfilePhoto from "../UserProfileDetails";
import { qrCode } from "../../constants/index";
import SiderData from "../Slider";

const UserDashboard = () => {
  const { username } = useParams();
  const decodedUsername = username ? decodeURIComponent(username) : "User";
  return (
    <>
      <Navbar />
      <div className="w-full max-w-full overflow-x-hidden mx-auto">
        <ProfilePhoto />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="mt-6 mb-4">
          <h1 className="text-2xl font-semibold">Welcome, {decodedUsername}</h1>
        </div>
        <SiderData />
        <Footer />
      </div>
    </>
  );
};

export default UserDashboard;
