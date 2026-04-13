const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Absolute path for uploads directory
const uploadDir = path.join(__dirname, "../../uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const sanitizedName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${sanitizedName}`);
  },
});

// File filter (optional but recommended)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|ppt|pptx|xls|xlsx/;

  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );

  if (extname) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"));
  }
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
