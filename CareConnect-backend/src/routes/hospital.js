const express = require("express");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  getPatients,
  getPatientSummary,
  getMedicalRecords,
  createMedicalRecord,
  updateMedicalRecord,
  getAdmissions,
  createAdmission,
  updateAdmission,
  getLabOrders,
  createLabOrder,
  updateLabOrder,
  getBills,
  createBill,
  updateBill,
  payBillDemo,
  createRazorpayBillOrder,
  verifyRazorpayBillPayment,
  getHospitalDashboard,
} = require("../controllers/hospitalController");

const router = express.Router();

router.get("/departments", getDepartments);

router.use(protect);

router.get("/dashboard/overview", getHospitalDashboard);
router.get("/dashboard", getHospitalDashboard);
router.get("/patients/:patientId/summary", getPatientSummary);
router.get("/patients", getPatients);

router.get("/medical-records", getMedicalRecords);
router.post("/medical-records", createMedicalRecord);
router.put("/medical-records/:id", updateMedicalRecord);

router.get("/admissions", getAdmissions);
router.post("/admissions", createAdmission);
router.put("/admissions/:id", updateAdmission);

router.get("/lab-orders", getLabOrders);
router.post("/lab-orders", createLabOrder);
router.put("/lab-orders/:id", updateLabOrder);

router.get("/bills", getBills);
router.post("/bills/pay", payBillDemo);
router.post("/bills/razorpay-order", createRazorpayBillOrder);
router.post("/bills/verify-razorpay", verifyRazorpayBillPayment);
router.post("/bills", createBill);
router.put("/bills/:id", updateBill);

router.post("/departments", authorize("admin", "doctor"), createDepartment);
router.put("/departments/:id", authorize("admin", "doctor"), updateDepartment);

module.exports = router;
