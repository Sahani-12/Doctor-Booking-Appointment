require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const doctorRoutes = require("./routes/doctors");
const appointmentRoutes = require("./routes/appointments");
const adminRoutes = require("./routes/admin");
const storiesRoutes = require("./routes/stories");
const paymentRoutes = require("./routes/payments");
const chatRoutes = require("./routes/chat");
const videoRoutes = require("./routes/video");
const notificationRoutes = require("./routes/notifications");
const { notFound, errorHandler } = require("./middleware/error");
const aiRoute = require("./routes/aiRoute");

const app = express();

// Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
app.use("/api/ai", aiRoute);

// Database connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI || mongoURI.includes("xxx")) {
  console.error("Set valid MONGO_URI in .env");
  process.exit(1);
}
connectDB(mongoURI);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user", userRoutes); // Legacy support
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CareConnect Backend API running",
    version: "1.0.0",
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(
    `Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`,
  ),
);
