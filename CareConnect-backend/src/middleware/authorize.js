const asyncHandler = require("express-async-handler");

// Authorize specific roles
const authorize = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authenticated");
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}`,
      );
    }

    next();
  });
};

module.exports = { authorize };
