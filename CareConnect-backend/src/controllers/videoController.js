// Backend: src/controllers/videoController.js
const videoService = require("../services/videoService");
const VideoSession = require("../models/VideoSession");
const Appointment = require("../models/Appointment");

const formatPrescriptionData = (prescriptionData) => {
  if (typeof prescriptionData === "string") {
    return prescriptionData;
  }

  return JSON.stringify(
    prescriptionData ?? { summary: "Consultation completed" },
  );
};

const getPrescriptionFile = (prescriptionData) => {
  if (!prescriptionData || typeof prescriptionData === "string") return null;

  return (
    prescriptionData.prescriptionFile ||
    prescriptionData.prescriptionFileName ||
    prescriptionData.prescriptionFileUrl ||
    prescriptionData.fileUrl ||
    prescriptionData.url ||
    null
  );
};

const canDoctorUpdateAppointment = (user, appointment) => {
  if (user.role === "admin") return true;
  if (user.role !== "doctor") return false;

  const doctorId = appointment.doctor || appointment.doctorId;
  return doctorId?.toString() === user._id.toString();
};

// Create video room
exports.createVideoRoom = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res
        .status(400)
        .json({ success: false, message: "Appointment ID required" });
    }

    const result = await videoService.createVideoRoom(appointmentId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Video room creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Join video session
exports.joinVideoSession = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.user.id;
    const userType = req.user.role === "doctor" ? "doctor" : "patient";

    if (!appointmentId) {
      return res
        .status(400)
        .json({ success: false, message: "Appointment ID required" });
    }

    const result = await videoService.joinVideoSession(
      appointmentId,
      userId,
      userType,
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Join session error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// End video session
exports.endVideoSession = async (req, res) => {
  try {
    const { videoSessionId } = req.body;
    const userId = req.user.id;

    if (!videoSessionId) {
      return res
        .status(400)
        .json({ success: false, message: "Video Session ID required" });
    }

    const result = await videoService.endVideoSession(videoSessionId, userId);
    res.status(200).json(result);
  } catch (error) {
    console.error("End session error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get session history
exports.getSessionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { page = 1, limit = 10 } = req.query;

    const result = await videoService.getSessionHistory(
      userId,
      userRole,
      parseInt(page),
      parseInt(limit),
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Session history error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Save prescription (video session or direct appointment notes)
exports.savePrescription = async (req, res) => {
  try {
    const { videoSessionId, prescriptionData, appointmentId } = req.body;

    if (appointmentId && !videoSessionId) {
      const appointment = await Appointment.findById(appointmentId);

      if (!appointment) {
        return res
          .status(404)
          .json({ success: false, message: "Appointment not found" });
      }

      if (!canDoctorUpdateAppointment(req.user, appointment)) {
        return res.status(403).json({
          success: false,
          message: "Only the assigned doctor can save this prescription",
        });
      }

      const update = {
        prescription: formatPrescriptionData(prescriptionData),
        status: "completed",
      };
      const prescriptionFile = getPrescriptionFile(prescriptionData);
      if (prescriptionFile) {
        update.prescriptionFile = prescriptionFile;
      }

      await Appointment.findByIdAndUpdate(appointmentId, update);

      return res.status(200).json({
        success: true,
        message: "Prescription saved to appointment",
      });
    }

    if (!videoSessionId || !prescriptionData) {
      return res.status(400).json({
        success: false,
        message:
          "Provide appointmentId + prescriptionData, or videoSessionId + prescriptionData",
      });
    }

    const videoSession = await VideoSession.findById(videoSessionId);

    if (!videoSession) {
      return res
        .status(404)
        .json({ success: false, message: "Video session not found" });
    }

    if (!canDoctorUpdateAppointment(req.user, videoSession)) {
      return res.status(403).json({
        success: false,
        message: "Only the assigned doctor can save this prescription",
      });
    }

    const result = await videoService.savePrescription(
      videoSessionId,
      prescriptionData,
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Prescription save error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get session details
exports.getSessionDetails = async (req, res) => {
  try {
    const { videoSessionId } = req.params;

    const videoSession = await VideoSession.findById(videoSessionId)
      .populate("appointmentId")
      .populate("patientId", "fullname email")
      .populate("doctorId", "fullname specialization");

    if (!videoSession) {
      return res
        .status(404)
        .json({ success: false, message: "Video session not found" });
    }

    res.status(200).json({
      success: true,
      data: videoSession,
    });
  } catch (error) {
    console.error("Get session error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
