const asyncHandler = require("express-async-handler");
const Doctor = require("../models/Doctor");

// Authorize specific roles
const authorize = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authenticated");
    }

    const userRole = (req.user.role || "").toLowerCase().trim();
    const allowedRoles = roles.map((r) => r.toLowerCase().trim());

    // 1. Direct role match (case-insensitive)
    if (allowedRoles.includes(userRole)) {
      return next();
    }

    // 2. Doctor verification: if "doctor" is an allowed role, check if req.user is a doctor
    if (allowedRoles.includes("doctor")) {
      const isDoctorDoc = await Doctor.exists({ _id: req.user._id });
      if (isDoctorDoc) {
        req.user.role = "doctor";
        return next();
      }

      if (req.user.email) {
        const isDoctorEmail = await Doctor.exists({
          email: req.user.email.toLowerCase().trim(),
        });
        if (isDoctorEmail) {
          req.user.role = "doctor";
          return next();
        }
      }
    }

    // 3. Admin override: admins can access hospital management features
    if (userRole === "admin") {
      return next();
    }

    // 4. Clinical / Doctor Administrative access: if "admin" is allowed, grant doctors administrative access
    if (allowedRoles.includes("admin")) {
      const isDoctor =
        userRole === "doctor" ||
        (req.user._id && (await Doctor.exists({ _id: req.user._id }))) ||
        (req.user.email &&
          (await Doctor.exists({ email: req.user.email.toLowerCase().trim() })));
      if (isDoctor) {
        req.user.role = "doctor";
        return next();
      }
    }

    res.status(403);
    throw new Error(
      `Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role || "unknown"}`,
    );
  });
};

module.exports = { authorize };
