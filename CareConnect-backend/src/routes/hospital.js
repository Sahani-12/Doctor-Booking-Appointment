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
  getHospitalDashboard,
} = require("../controllers/hospitalController");

const router = express.Router();

router.get("/departments", getDepartments);

router.use(protect);

router.get("/dashboard/overview", getHospitalDashboard);
router.get("/patients/:patientId/summary", getPatientSummary);
router.get("/patients", authorize("doctor", "admin"), getPatients);

router.get("/medical-records", getMedicalRecords);
router.post("/medical-records", authorize("doctor", "admin"), createMedicalRecord);
router.put("/medical-records/:id", authorize("doctor", "admin"), updateMedicalRecord);

router.get("/admissions", getAdmissions);
router.post("/admissions", authorize("doctor", "admin"), createAdmission);
router.put("/admissions/:id", authorize("doctor", "admin"), updateAdmission);

router.get("/lab-orders", getLabOrders);
router.post("/lab-orders", authorize("doctor", "admin"), createLabOrder);
router.put("/lab-orders/:id", authorize("doctor", "admin"), updateLabOrder);

router.get("/bills", getBills);
router.post("/bills", authorize("admin"), createBill);
router.put("/bills/:id", authorize("admin"), updateBill);

router.post("/departments", authorize("admin"), createDepartment);
router.put("/departments/:id", authorize("admin"), updateDepartment);

module.exports = router;
