const express = require("express");
const { analyzeSymptoms } = require("../controllers/symptomController");

const router = express.Router();

router.post("/analyze", analyzeSymptoms);

module.exports = router;
