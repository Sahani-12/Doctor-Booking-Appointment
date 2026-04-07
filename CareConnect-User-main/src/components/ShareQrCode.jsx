import React from "react";
import QrCode from "../components/QrCodeGenerator";

const ShareQrCode = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col md:flex-row">

      {/* Left Section */}
      <div className="md:w-1/2 w-full flex flex-col justify-center items-center p-6 border-b md:border-b-0 md:border-r border-gray-700">
        
        <h1 className="text-3xl font-bold mb-4 text-center">
          Share Your QR Code
        </h1>

        <p className="text-gray-400 text-center max-w-md">
          Scan this QR code to quickly access your profile or consultation page.
          This makes appointment booking faster and easier.
        </p>

        {/* Optional Illustration */}
        <div className="mt-6 text-center text-sm text-gray-500">
          📱 Scan using any mobile device
        </div>
      </div>

      {/* Right Section */}
      <div className="md:w-1/2 w-full flex justify-center items-center p-6">
        <div className="bg-white text-black rounded-xl p-4 shadow-lg">
          <QrCode />
        </div>
      </div>

    </div>
  );
};

export default ShareQrCode;