const express = require("express");
const { protect } = require("../middleware/auth");
const {
  registerDoctor,
  registerUser,
  login,
  adminLogin,
  getCurrentUser,
  logout,
  setupAdmin,
} = require("../controllers/authController");

const router = express.Router();

// Auth routes
router.post("/register/doctor", registerDoctor);
router.post("/register/user", registerUser);
router.post("/login", login);
router.post("/admin-login", adminLogin);
router.post("/setup-admin", setupAdmin);
router.get("/me", protect, getCurrentUser);
router.post("/logout", protect, logout);

module.exports = router;
