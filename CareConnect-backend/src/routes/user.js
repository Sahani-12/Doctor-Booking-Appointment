const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");
const {
  uploadDocument,
  getDocuments,
  deleteDocument,
} = require("../controllers/documentController");

// Upload Document
router.post(
  "/documents",
  authMiddleware,
  upload.single("file"),
  uploadDocument
);

// Get All Documents
router.get("/documents", authMiddleware, getDocuments);

// Delete Document
router.delete(
  "/documents/:id",
  authMiddleware,
  deleteDocument
);

module.exports = router;