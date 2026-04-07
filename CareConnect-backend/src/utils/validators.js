// Email validation
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Password validation (min 6 characters)
const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Phone number validation (basic)
const validatePhone = (phone) => {
  const re = /^[0-9]{10,15}$/;
  return !phone || re.test(phone);
};

// Validate date format and future date
const validateFutureDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return date >= now;
};

// Validate time slot format (HH:MM)
const validateTimeSlot = (slot) => {
  const re = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return re.test(slot);
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateFutureDate,
  validateTimeSlot,
};
