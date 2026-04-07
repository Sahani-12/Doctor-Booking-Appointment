// Backend: src/models/VideoSession.js
const mongoose = require("mongoose");

const videoSessionSchema = new mongoose.Schema(
  {
    // Reference to appointment
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },

    // Participants
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // Room information
    roomId: String,
    roomName: String,
    accessToken: String,

    // Session details
    startTime: Date,
    endTime: Date,
    duration: Number, // in seconds

    // Recording details
    recordingId: String,
    recordingUrl: String,
    isRecorded: {
      type: Boolean,
      default: false,
    },

    // Session status
    status: {
      type: String,
      enum: ["scheduled", "active", "completed", "cancelled"],
      default: "scheduled",
    },

    // Participants status
    participantStatus: {
      patientJoined: Boolean,
      patientLeftAt: Date,
      doctorJoined: Boolean,
      doctorLeftAt: Date,
    },

    // Quality metrics
    videoQuality: {
      minBitrate: Number,
      maxBitrate: Number,
      latency: Number,
    },

    // Chat during session
    messages: [
      {
        senderId: mongoose.Schema.Types.ObjectId,
        message: String,
        timestamp: Date,
      },
    ],

    // Prescription shared during call
    prescriptionShared: {
      name: String,
      url: String,
      sharedAt: Date,
    },

    // Session notes
    notes: String,

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Index
videoSessionSchema.index({ appointmentId: 1 });
videoSessionSchema.index({ patientId: 1, createdAt: -1 });
videoSessionSchema.index({ doctorId: 1, createdAt: -1 });
videoSessionSchema.index({ status: 1 });

module.exports = mongoose.model("VideoSession", videoSessionSchema);
