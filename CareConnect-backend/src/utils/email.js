// Email templates and mock email service
// In production, use nodemailer with SMTP configuration

const emailTemplates = {
  appointmentBooked: (patientName, doctorName, date, time) => ({
    subject: "Appointment Confirmed with Dr. " + doctorName,
    text: `
Dear ${patientName},

Your appointment has been successfully booked with Dr. ${doctorName}.

Date: ${date}
Time: ${time}

Please arrive 10 minutes early. If you need to cancel or reschedule, please contact us at least 24 hours in advance.

Best regards,
CareConnect Team
    `,
    html: `
<h2>Appointment Confirmed</h2>
<p>Dear ${patientName},</p>
<p>Your appointment has been successfully booked with <strong>Dr. ${doctorName}</strong>.</p>
<p><strong>Date:</strong> ${date}</p>
<p><strong>Time:</strong> ${time}</p>
<p>Please arrive 10 minutes early. If you need to cancel or reschedule, please contact us at least 24 hours in advance.</p>
<p>Best regards,<br/>CareConnect Team</p>
    `,
  }),

  appointmentCancelled: (patientName, doctorName, date) => ({
    subject: "Appointment Cancelled",
    text: `
Dear ${patientName},

Your appointment with Dr. ${doctorName} on ${date} has been cancelled.

If you have any questions, please contact us.

Best regards,
CareConnect Team
    `,
    html: `
<h2>Appointment Cancelled</h2>
<p>Dear ${patientName},</p>
<p>Your appointment with <strong>Dr. ${doctorName}</strong> on <strong>${date}</strong> has been cancelled.</p>
<p>If you have any questions, please contact us.</p>
<p>Best regards,<br/>CareConnect Team</p>
    `,
  }),

  doctorReviewRequest: (doctorName, patientName) => ({
    subject: "Patient Feedback Request from " + patientName,
    text: `
Dear Dr. ${doctorName},

${patientName} has completed their appointment with you. Please rate their experience to help us improve our service.

Best regards,
CareConnect Team
    `,
    html: `
<h2>Feedback Request</h2>
<p>Dear Dr. ${doctorName},</p>
<p><strong>${patientName}</strong> has completed their appointment with you. Please rate their experience to help us improve our service.</p>
<p>Best regards,<br/>CareConnect Team</p>
    `,
  }),
};

// Mock email sending function (in production, use nodemailer)
const sendEmail = async (to, template) => {
  try {
    // In production implementation:
    // const transporter = nodemailer.createTransport({
    //   service: process.env.EMAIL_SERVICE,
    //   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }
    // });
    // await transporter.sendMail({ from: process.env.EMAIL_USER, to, ...template });

    console.log(`[EMAIL] To: ${to}`);
    console.log(`[EMAIL] Subject: ${template.subject}`);
    console.log(`[EMAIL] Body:\n${template.text}`);

    return { success: true, message: "Email queued for sending" };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, message: "Failed to send email" };
  }
};

module.exports = {
  emailTemplates,
  sendEmail,
};
