const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Doctor = require("../models/Doctor");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // doctor first, fallback to user
      const doctor = await Doctor.findById(decoded.id).select("-password");
      const user = doctor
        ? null
        : await User.findById(decoded.id).select("-password");

      if (!doctor && !user) {
        res.status(401);
        throw new Error("Not authorized, user not found");
      }

      const account = doctor || user;

      // Ensure role is set
      if (!account.role && doctor) {
        account.role = "doctor";
      }

      req.user = account;
      console.log("🔐 Auth: User authenticated");
      console.log("   ID:", account._id);
      console.log("   Role:", account.role);
      console.log("   Is Doctor:", !!doctor);
      next();
    } catch (error) {
      console.error("JWT auth error", error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };
