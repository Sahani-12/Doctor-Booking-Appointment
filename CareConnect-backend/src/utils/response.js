// Standardized response helper
const sendSuccess = (res, data, message = "Success", status = 200) => {
  res.status(status).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, message, status = 400, details = null) => {
  res.status(status).json({
    success: false,
    message,
    ...(details && { details }),
  });
};

// Calculate pagination
const calculatePagination = (page = 1, limit = 15) => {
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;
  return { pageNum, limitNum, skip };
};

// Generate slots for a doctor
const generateDailySlots = () => {
  return [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ];
};

module.exports = {
  sendSuccess,
  sendError,
  calculatePagination,
  generateDailySlots,
};
