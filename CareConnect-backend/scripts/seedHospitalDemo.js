const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const Doctor = require("../src/models/Doctor");
const Department = require("../src/models/Department");
const Appointment = require("../src/models/Appointment");
const MedicalRecord = require("../src/models/MedicalRecord");
const Admission = require("../src/models/Admission");
const LabOrder = require("../src/models/LabOrder");
const Bill = require("../src/models/Bill");

dotenv.config();

const mongoUri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/careconnect";

const toStartOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toStartOfDay(date);
};

const hashPassword = async (password) => bcrypt.hash(password, 10);

const ensureUser = async ({ password, ...payload }) => {
  const existing = await User.findOne({ email: payload.email });
  if (existing) {
    existing.password = await hashPassword(password);
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }

  return User.create({
    ...payload,
    password: await hashPassword(password),
  });
};

const ensureDoctor = async ({ password, ...payload }) => {
  const existing = await Doctor.findOne({ email: payload.email });
  if (existing) {
    existing.password = await hashPassword(password);
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }

  return Doctor.create({
    ...payload,
    password: await hashPassword(password),
  });
};

const ensureDepartment = async (payload) =>
  Department.findOneAndUpdate({ code: payload.code }, payload, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  });

const ensureAppointment = async (payload) => {
  const existing = await Appointment.findOne({
    patient: payload.patient,
    doctor: payload.doctor,
    date: payload.date,
    slot: payload.slot,
    notes: payload.notes,
  });

  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }

  return Appointment.create(payload);
};

const seed = async () => {
  await connectDB(mongoUri);

  const admin = await ensureUser({
    fullname: "CareConnect Admin",
    email: "admin@careconnect.com",
    password: "Admin@123",
    role: "admin",
    phone: "9999999999",
    city: "Bengaluru",
    isVerified: true,
  });

  const [doctorA, doctorB] = await Promise.all([
    ensureDoctor({
      fullname: "Dr. Ananya Rao",
      email: "ananya.rao@careconnect.com",
      password: "Doctor@123",
      role: "doctor",
      phone: "9876543210",
      city: "Bengaluru",
      gender: "female",
      experience: "11 years",
      description:
        "Consultant cardiologist focused on OPD, follow-ups, and inpatient care.",
      specialization: ["Cardiology"],
      degrees: ["MBBS", "MD", "DM Cardiology"],
      fee: 900,
      emergencyFee: 1500,
      location: "North Wing",
      languagesSpoken: ["English", "Hindi", "Kannada"],
      isApproved: true,
      isVerified: true,
    }),
    ensureDoctor({
      fullname: "Dr. Vikram Nair",
      email: "vikram.nair@careconnect.com",
      password: "Doctor@123",
      role: "doctor",
      phone: "9876543211",
      city: "Bengaluru",
      gender: "male",
      experience: "8 years",
      description:
        "Internal medicine specialist coordinating admissions and diagnostics.",
      specialization: ["General Medicine"],
      degrees: ["MBBS", "MD Internal Medicine"],
      fee: 700,
      emergencyFee: 1300,
      location: "Central Block",
      languagesSpoken: ["English", "Hindi", "Malayalam"],
      isApproved: true,
      isVerified: true,
    }),
  ]);

  const [patientA, patientB] = await Promise.all([
    ensureUser({
      fullname: "Riya Sharma",
      email: "riya.sharma@careconnect.com",
      password: "Patient@123",
      role: "user",
      phone: "9123456780",
      city: "Bengaluru",
      gender: "female",
      age: 31,
      DOB: "1994-02-14",
      isVerified: true,
    }),
    ensureUser({
      fullname: "Arjun Mehta",
      email: "arjun.mehta@careconnect.com",
      password: "Patient@123",
      role: "user",
      phone: "9123456781",
      city: "Bengaluru",
      gender: "male",
      age: 42,
      DOB: "1983-09-01",
      isVerified: true,
    }),
  ]);

  const [cardiology, generalMedicine, diagnostics] = await Promise.all([
    ensureDepartment({
      name: "Cardiology",
      code: "CARD",
      description: "Heart clinic, echo, and cardiac observation beds.",
      location: "North Wing",
      floor: "3rd Floor",
      bedCapacity: 24,
      wardCount: 3,
      color: "#dc2626",
      services: ["OPD", "Cardiac evaluation", "Inpatient monitoring"],
      facilities: ["Echo lab", "Telemetry beds"],
      headDoctor: doctorA._id,
      isActive: true,
    }),
    ensureDepartment({
      name: "General Medicine",
      code: "GMED",
      description: "Primary physician care, inpatient rounds, and follow-up.",
      location: "Central Block",
      floor: "2nd Floor",
      bedCapacity: 30,
      wardCount: 4,
      color: "#0f766e",
      services: ["OPD", "Inpatient care", "Preventive care"],
      facilities: ["Step-down beds", "Day-care area"],
      headDoctor: doctorB._id,
      isActive: true,
    }),
    ensureDepartment({
      name: "Diagnostics",
      code: "LABS",
      description: "Clinical pathology and sample processing services.",
      location: "East Wing",
      floor: "1st Floor",
      bedCapacity: 0,
      wardCount: 0,
      color: "#2563eb",
      services: ["Blood tests", "Profiles", "Reports"],
      facilities: ["Sample collection", "Processing lab"],
      isActive: true,
    }),
  ]);

  const [futureAppointment, completedAppointment, followUpAppointment] =
    await Promise.all([
      ensureAppointment({
        patient: patientA._id,
        doctor: doctorA._id,
        date: daysFromNow(2),
        slot: "10:30",
        status: "confirmed",
        notes: "[DEMO] Cardiology follow-up for chest discomfort",
        consultationType: "offline",
      }),
      ensureAppointment({
        patient: patientA._id,
        doctor: doctorA._id,
        date: daysFromNow(-4),
        slot: "11:00",
        status: "completed",
        notes: "[DEMO] Review after ER visit",
        consultationType: "offline",
        prescription: "Continue BP monitoring and review lab reports.",
      }),
      ensureAppointment({
        patient: patientB._id,
        doctor: doctorB._id,
        date: daysFromNow(1),
        slot: "09:30",
        status: "pending",
        notes: "[DEMO] General medicine fever consult",
        consultationType: "online",
      }),
    ]);

  await MedicalRecord.findOneAndUpdate(
    { notes: "[DEMO] Cardiology OPD record" },
    {
      patient: patientA._id,
      doctor: doctorA._id,
      appointment: completedAppointment._id,
      department: cardiology._id,
      visitType: "opd",
      chiefComplaint: "Chest tightness and fatigue after exertion",
      diagnosis: "Hypertension review and cardiac risk assessment",
      symptoms: ["Chest discomfort", "Fatigue"],
      allergies: ["Penicillin"],
      vitals: {
        bloodPressure: "138/90",
        pulse: "84",
        temperature: "98.4",
        oxygenSaturation: "98%",
        weight: "64 kg",
        height: "168 cm",
        bmi: "22.7",
      },
      medications: [
        {
          name: "Amlodipine",
          dosage: "5 mg",
          frequency: "Once daily",
          duration: "30 days",
          instructions: "Take after breakfast",
        },
      ],
      treatmentPlan:
        "Review lipid profile, continue home BP log, follow up in one week.",
      notes: "[DEMO] Cardiology OPD record",
      followUpDate: daysFromNow(7),
      status: "open",
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  await Admission.findOneAndUpdate(
    { admissionNumber: "ADM-DEMO-001" },
    {
      admissionNumber: "ADM-DEMO-001",
      patient: patientA._id,
      doctor: doctorB._id,
      department: generalMedicine._id,
      reason: "Observation for persistent fever and dehydration",
      diagnosis: "Viral fever with dehydration",
      roomNumber: "A-204",
      bedNumber: "2",
      wardType: "semi-private",
      admissionDate: daysFromNow(-1),
      expectedDischargeDate: daysFromNow(2),
      status: "under-treatment",
      priority: "urgent",
      treatmentPlan: "IV fluids, blood work, and twice daily physician review.",
      notes: [
        { note: "Patient admitted from OPD for observation." },
        { note: "Hydration improving after first IV cycle." },
      ],
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  await LabOrder.findOneAndUpdate(
    { orderNumber: "LAB-DEMO-001" },
    {
      orderNumber: "LAB-DEMO-001",
      patient: patientA._id,
      doctor: doctorA._id,
      department: diagnostics._id,
      appointment: futureAppointment._id,
      priority: "urgent",
      status: "processing",
      tests: [
        {
          name: "Lipid Profile",
          category: "Biochemistry",
          status: "processing",
          referenceRange: "As per adult female standard range",
        },
        {
          name: "Troponin I",
          category: "Cardiac Marker",
          status: "sample-collected",
          referenceRange: "0.00 - 0.04 ng/mL",
        },
      ],
      clinicalNotes: "Cardiology workup for follow-up visit.",
      orderedAt: daysFromNow(0),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  await Bill.findOneAndUpdate(
    { billNumber: "BILL-DEMO-001" },
    {
      billNumber: "BILL-DEMO-001",
      patient: patientA._id,
      doctor: doctorB._id,
      department: generalMedicine._id,
      appointment: futureAppointment._id,
      lineItems: [
        {
          description: "Admission advance",
          category: "Admission",
          quantity: 1,
          unitPrice: 5000,
          amount: 5000,
        },
        {
          description: "Lab diagnostics",
          category: "Diagnostics",
          quantity: 1,
          unitPrice: 1800,
          amount: 1800,
        },
      ],
      subtotal: 6800,
      taxAmount: 200,
      discountAmount: 0,
      totalAmount: 7000,
      paidAmount: 2500,
      balanceDue: 4500,
      status: "partially-paid",
      dueDate: daysFromNow(5),
      issuedAt: daysFromNow(0),
      paymentMethod: "Hospital Desk",
      notes: "Demo inpatient bill generated for hospital workflow testing.",
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  console.log("");
  console.log("Demo hospital data is ready.");
  console.log("");
  console.log("Admin:");
  console.log("  admin@careconnect.com / Admin@123");
  console.log("");
  console.log("Doctors:");
  console.log("  ananya.rao@careconnect.com / Doctor@123");
  console.log("  vikram.nair@careconnect.com / Doctor@123");
  console.log("");
  console.log("Patients:");
  console.log("  riya.sharma@careconnect.com / Patient@123");
  console.log("  arjun.mehta@careconnect.com / Patient@123");
  console.log("");
  console.log("Seeded departments:");
  console.log(
    `  ${cardiology.name}, ${generalMedicine.name}, ${diagnostics.name}`,
  );
  console.log("");
  console.log("Use `npm run seed:demo` after setting MONGO_URI to reload demo records.");
  console.log("");

  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error("Failed to seed demo hospital data:", error);
  await mongoose.disconnect();
  process.exit(1);
});
