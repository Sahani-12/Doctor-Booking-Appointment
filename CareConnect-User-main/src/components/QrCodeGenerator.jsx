import { useState, useEffect, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import favicon from "../assets/logo.png";

export default function QrCodeGenerator() {
  const [qrList, setQrList] = useState([]);
  const qrRefs = useRef([]);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");

    let userId = null;
    try {
      const user = storedUser ? JSON.parse(storedUser) : null;
      userId = user?._id ?? user?.id ?? null;
    } catch {
      userId = null;
    }

    if (!userId) return;

    const now = new Date();
    const dateTimeString = now.toLocaleString();

    // ✅ IMPORTANT: localhost replace karo
    const qrText = `${window.location.origin}/#/User-page/${userId}`;

    setQrList([
      {
        id: Date.now(),
        date: dateTimeString,
        qrText,
      },
    ]);
  }, []);

  const downloadQR = (id) => {
    const canvas = qrRefs.current[id];
    if (canvas) {
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `QRCode-${id}.png`;
      link.click();
    }
  };

  return (
    <div className="p-4 flex justify-center">
      {qrList.map((qr, index) => (
        <div
          key={qr.id}
          className="bg-white p-4 rounded shadow flex flex-col items-center"
        >
          <QRCodeCanvas
            value={qr.qrText}
            size={250}
            level="H"
            ref={(el) => (qrRefs.current[qr.id] = el)}
            imageSettings={{
              src: favicon,
              height: 40,
              width: 40,
              excavate: true,
            }}
          />

          <p className="text-xs text-gray-500 mt-2">{qr.date}</p>

          <button
            onClick={() => downloadQR(qr.id)}
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
          >
            Download QR
          </button>
        </div>
      ))}
    </div>
  );
}
