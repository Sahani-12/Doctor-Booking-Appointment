const Document = require("../models/Document");

// Upload Document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const document = await Document.create({
      file: fileUrl,
      message: req.body.message || "Medical Document",
      author: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
    });
  }
};

// Get Documents
exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      author: req.user._id,
    }).populate("author", "fullname");

    res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
    });
  }
};

// Delete Document
exports.deleteDocument = async (req, res) => {
  try {
    await Document.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};
