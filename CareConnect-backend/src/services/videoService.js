// Backend: src/services/videoService.js
const axios = require("axios");
const VideoSession = require("../models/VideoSession");
const Appointment = require("../models/Appointment");

// Using Daily.co for video conferencing (alternative: Twilio, Jitsi)
// Sign up and get API key from https://dashboard.daily.co

class VideoService {
  constructor() {
    this.dailyApiUrl = "https://api.daily.co/v1";
    this.dailyApiKey = process.env.DAILY_API_KEY || "your_daily_api_key";
    this.dailyOrgId = process.env.DAILY_ORG_ID || "your_org_id";
  }

  // =====================================================
  // CREATE VIDEO ROOM
  // =====================================================

  async createVideoRoom(appointmentId) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    const patientId = appointment.patient;
    const doctorId = appointment.doctor;
    const roomName = `careconnect-${appointmentId}-${Date.now()}`;

    const dailyConfigured =
      process.env.DAILY_API_KEY &&
      !String(process.env.DAILY_API_KEY).includes("your_daily");

    if (!dailyConfigured) {
      const videoSession = await VideoSession.create({
        appointmentId,
        patientId,
        doctorId,
        roomId: `local-${appointmentId}`,
        roomName,
        status: "scheduled",
      });
      return {
        success: true,
        mock: true,
        roomId: videoSession.roomId,
        roomName: videoSession.roomName,
        roomUrl: null,
        videoSessionId: videoSession._id,
        message:
          "Video session created (local mock). Set DAILY_API_KEY for Daily.co rooms.",
      };
    }

    try {
      const response = await axios.post(
        `${this.dailyApiUrl}/rooms`,
        {
          name: roomName,
          privacy: "private",
          properties: {
            max_participants: 2,
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.dailyApiKey}`,
          },
        },
      );

      if (!response.data?.url) {
        throw new Error("Failed to create video room");
      }

      const videoSession = await VideoSession.create({
        appointmentId,
        patientId,
        doctorId,
        roomId: response.data.id,
        roomName: response.data.name,
        status: "scheduled",
      });

      return {
        success: true,
        roomId: response.data.id,
        roomName: response.data.name,
        roomUrl: response.data.url,
        videoSessionId: videoSession._id,
      };
    } catch (error) {
      console.error("Video room creation error:", error);
      const videoSession = await VideoSession.create({
        appointmentId,
        patientId,
        doctorId,
        roomId: `local-${appointmentId}`,
        roomName,
        status: "scheduled",
      });
      return {
        success: true,
        mock: true,
        roomId: videoSession.roomId,
        roomName: videoSession.roomName,
        roomUrl: null,
        videoSessionId: videoSession._id,
        message: `Daily.co unavailable (${error.message}). Using local session record.`,
      };
    }
  }

  // =====================================================
  // GET ACCESS TOKEN
  // =====================================================

  async getAccessToken(roomName, userId, userName) {
    try {
      const response = await axios.post(
        `${this.dailyApiUrl}/meeting-tokens`,
        {
          room_name: roomName,
          user_name: userName,
          user_id: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${this.dailyApiKey}`,
          },
        },
      );

      return {
        success: true,
        token: response.data.token,
      };
    } catch (error) {
      console.error("Access token error:", error);
      throw new Error(`Failed to get access token: ${error.message}`);
    }
  }

  // =====================================================
  // JOIN VIDEO SESSION
  // =====================================================

  async joinVideoSession(appointmentId, userId, userType) {
    try {
      // Get or create video session
      let videoSession = await VideoSession.findOne({
        appointmentId,
        status: { $in: ["scheduled", "active"] },
      });

      if (!videoSession) {
        const roomResult = await this.createVideoRoom(appointmentId);
        videoSession = await VideoSession.findById(roomResult.videoSessionId);
      }

      // Update session status
      if (videoSession.status === "scheduled") {
        videoSession.status = "active";
        videoSession.startTime = new Date();
      }

      // Track participant
      if (userType === "patient") {
        videoSession.participantStatus = {
          ...videoSession.participantStatus,
          patientJoined: true,
        };
      } else if (userType === "doctor") {
        videoSession.participantStatus = {
          ...videoSession.participantStatus,
          doctorJoined: true,
        };
      }

      const dailyConfigured =
        process.env.DAILY_API_KEY &&
        !String(process.env.DAILY_API_KEY).includes("your_daily");

      let accessToken = "mock-token";
      if (dailyConfigured && !videoSession.roomId?.startsWith("local-")) {
        const tokenResult = await this.getAccessToken(
          videoSession.roomName,
          userId,
          `${userType}-${userId}`,
        );
        accessToken = tokenResult.token;
        videoSession.accessToken = accessToken;
      } else {
        videoSession.accessToken = accessToken;
      }

      await videoSession.save();

      return {
        success: true,
        mock: !dailyConfigured || videoSession.roomId?.startsWith("local-"),
        roomUrl: null,
        token: accessToken,
        roomName: videoSession.roomName,
        videoSessionId: videoSession._id,
      };
    } catch (error) {
      console.error("Join video session error:", error);
      throw new Error(`Failed to join video session: ${error.message}`);
    }
  }

  // =====================================================
  // END VIDEO SESSION
  // =====================================================

  async endVideoSession(videoSessionId, userId) {
    try {
      const videoSession = await VideoSession.findById(videoSessionId);

      if (!videoSession) {
        throw new Error("Video session not found");
      }

      // Update end time
      videoSession.status = "completed";
      videoSession.endTime = new Date();
      videoSession.duration = Math.floor(
        (videoSession.endTime - videoSession.startTime) / 1000,
      );

      const uid = userId.toString();
      if (videoSession.patientId?.toString() === uid) {
        videoSession.participantStatus = {
          ...videoSession.participantStatus,
          patientLeftAt: new Date(),
        };
      }
      if (videoSession.doctorId?.toString() === uid) {
        videoSession.participantStatus = {
          ...videoSession.participantStatus,
          doctorLeftAt: new Date(),
        };
      }

      await videoSession.save();

      await Appointment.findByIdAndUpdate(videoSession.appointmentId, {
        status: "completed",
      });

      return {
        success: true,
        message: "Video session ended",
        duration: videoSession.duration,
      };
    } catch (error) {
      console.error("End video session error:", error);
      throw new Error(`Failed to end video session: ${error.message}`);
    }
  }

  // =====================================================
  // GET SESSION HISTORY
  // =====================================================

  async getSessionHistory(userId, role, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      let query = {};

      if (role === "patient" || role === "user") {
        query.patientId = userId;
      } else if (role === "doctor") {
        query.doctorId = userId;
      }

      const sessions = await VideoSession.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("appointmentId", "date slot")
        .populate("patientId", "fullname email")
        .populate("doctorId", "fullname specialization");

      const total = await VideoSession.countDocuments(query);

      return {
        success: true,
        data: sessions,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Session history error:", error);
      throw new Error(`Failed to fetch session history: ${error.message}`);
    }
  }

  // =====================================================
  // SAVE PRESCRIPTION
  // =====================================================

  async savePrescription(videoSessionId, prescriptionData) {
    try {
      const videoSession = await VideoSession.findById(videoSessionId);

      if (!videoSession) {
        throw new Error("Video session not found");
      }

      const prescriptionFile =
        prescriptionData?.prescriptionFile ||
        prescriptionData?.prescriptionFileName ||
        prescriptionData?.prescriptionFileUrl ||
        prescriptionData?.fileUrl ||
        prescriptionData?.url ||
        null;
      const prescriptionText =
        typeof prescriptionData === "string"
          ? prescriptionData
          : JSON.stringify(
              prescriptionData ?? { summary: "Consultation completed" },
            );

      videoSession.prescriptionShared = {
        name:
          prescriptionData?.name ||
          prescriptionData?.prescriptionFileName ||
          "Prescription",
        url: prescriptionFile,
        sharedAt: new Date(),
      };

      await videoSession.save();

      await Appointment.findByIdAndUpdate(videoSession.appointmentId, {
        prescription: prescriptionText,
        ...(prescriptionFile ? { prescriptionFile } : {}),
        status: "completed",
      });

      return {
        success: true,
        message: "Prescription saved",
      };
    } catch (error) {
      console.error("Prescription save error:", error);
      throw new Error(`Failed to save prescription: ${error.message}`);
    }
  }

  // =====================================================
  // ADD SESSION MESSAGE
  // =====================================================

  async addMessage(videoSessionId, senderId, message) {
    try {
      const videoSession = await VideoSession.findById(videoSessionId);

      if (!videoSession) {
        throw new Error("Video session not found");
      }

      videoSession.messages.push({
        senderId,
        message,
        timestamp: new Date(),
      });

      await videoSession.save();

      return {
        success: true,
        message: "Message added",
      };
    } catch (error) {
      console.error("Message add error:", error);
      throw new Error(`Failed to add message: ${error.message}`);
    }
  }

  // =====================================================
  // GET VIDEO RECORDING
  // =====================================================

  async getRecording(roomName) {
    try {
      // Fetch recordings from Daily.co
      const response = await axios.get(`${this.dailyApiUrl}/recordings`, {
        headers: {
          Authorization: `Bearer ${this.dailyApiKey}`,
        },
        params: {
          room_name: roomName,
        },
      });

      if (response.data.data && response.data.data.length > 0) {
        return {
          success: true,
          recordings: response.data.data,
        };
      }

      return {
        success: false,
        message: "No recordings found",
      };
    } catch (error) {
      console.error("Recording fetch error:", error);
      throw new Error(`Failed to fetch recording: ${error.message}`);
    }
  }
}

module.exports = new VideoService();
