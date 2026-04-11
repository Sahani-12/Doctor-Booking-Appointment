const mongoose = require("mongoose");
//Schema for application settings and configurations

const settingsSchema = new mongoose.Schema(
  {
    appName: {
      type: String,
      default: "CareConnect",
    },
    supportEmail: {
      type: String,
      default: "support@careconnect.com",
    },
    supportPhone: {
      type: String,
      default: "+91-9876543210",
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMessage: {
      type: String,
      default: "App under maintenance. Please try again later.",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Settings", settingsSchema);
