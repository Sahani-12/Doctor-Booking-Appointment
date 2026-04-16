const asyncHandler = require("express-async-handler");
const Department = require("../models/Department");
const MedicalRecord = require("../models/MedicalRecord");
const Admission = require("../models/Admission");
const LabOrder = require("../models/LabOrder");
const Bill = require("../models/Bill");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const { calculatePagination } = require("../utils/response");

const DEFAULT_DEPARTMENTS = [
  {
    name: "Cardiology",
    code: "CARD",
    description:
      "Comprehensive heart care, ECG diagnostics, recovery, and cardiac follow-up.",
    location: "North Wing",
    floor: "3rd Floor",
    bedCapacity: 24,
    wardCount: 3,
    color: "#dc2626",
    services: ["ECG", "Echo", "Cardiac ICU", "Preventive heart screening"],
    facilities: ["Monitoring beds", "Cath lab access", "Rapid response team"],
  },
  {
    name: "Neurology",
    code: "NEUR",
    description:
      "Stroke response, neuro-evaluation, headache care, and rehabilitation support.",
    location: "East Wing",
    floor: "4th Floor",
    bedCapacity: 18,
    wardCount: 2,
    color: "#7c3aed",
    services: ["EEG", "Neuro consults", "Stroke pathway", "Neuro rehab"],
    facilities: ["Step-down beds", "Observation suites"],
  },
  {
    name: "Orthopedics",
    code: "ORTH",
    description:
      "Fracture management, sports injury treatment, and post-surgical follow-up.",
    location: "South Wing",
    floor: "2nd Floor",
    bedCapacity: 20,
    wardCount: 2,
    color: "#0f766e",
    services: ["Joint care", "Fracture clinic", "Physio support"],
    facilities: ["Procedure rooms", "Rehab support"],
  },
  {
    name: "Emergency",
    code: "EMRG",
    description:
      "24/7 emergency intake, trauma support, triage, and urgent stabilization.",
    location: "Ground Floor",
    floor: "Ground Floor",
    bedCapacity: 12,
    wardCount: 1,
    color: "#ea580c",
    services: [
      "Triage",
      "Trauma",
      "Emergency observation",
      "Critical care support",
    ],
    facilities: ["Ambulance bay", "Rapid diagnostics"],
  },
];

const OPEN_ADMISSION_STATUSES = [
  "admitted",
  "under-treatment",
  "ready-for-discharge",
];

const toArray = (value) => {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const toDate = (value) => (value ? new Date(value) : undefined);

const generateRef = (prefix) => {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${Date.now().toString().slice(-6)}-${random}`;
};

const getAuthDoctorId = async (user) => {
  if (!user || user.role !== "doctor") return null;

  const byId = await Doctor.findById(user._id).select("_id");
  if (byId) return byId._id;

  if (!user.email) return null;

  const byEmail = await Doctor.findOne({ email: user.email }).select("_id");
  return byEmail?._id || null;
};

const ensureDefaultDepartments = async () => {
  const count = await Department.countDocuments();
  if (count > 0) return;
  await Department.insertMany(DEFAULT_DEPARTMENTS);
};

const computeBillTotals = (
  lineItems = [],
  taxAmount = 0,
  discountAmount = 0,
  paidAmount = 0,
) => {
  const normalizedLineItems = lineItems.map((item) => {
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
    return {
      description: item.description,
      category: item.category || "",
      quantity,
      unitPrice,
      amount: quantity * unitPrice,
    };
  });

  const subtotal = normalizedLineItems.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const totalAmount = Math.max(
    0,
    subtotal + (Number(taxAmount) || 0) - (Number(discountAmount) || 0),
  );
  const safePaidAmount = Math.max(0, Number(paidAmount) || 0);
  const balanceDue = Math.max(0, totalAmount - safePaidAmount);

  let status = "pending";
  if (totalAmount === 0) {
    status = "draft";
  } else if (safePaidAmount === 0) {
    status = "pending";
  } else if (safePaidAmount >= totalAmount) {
    status = "paid";
  } else {
    status = "partially-paid";
  }

  return {
    lineItems: normalizedLineItems,
    subtotal,
    taxAmount: Number(taxAmount) || 0,
    discountAmount: Number(discountAmount) || 0,
    totalAmount,
    paidAmount: safePaidAmount,
    balanceDue,
    status,
  };
};

const canAccessPatient = async (reqUser, patientId) => {
  if (!reqUser || !patientId) return false;
  if (reqUser.role === "admin") return true;
  if (reqUser.role === "user") {
    return reqUser._id.toString() === String(patientId);
  }

  const doctorId = await getAuthDoctorId(reqUser);
  if (!doctorId) return false;

  const related = await Promise.all([
    Appointment.exists({ doctor: doctorId, patient: patientId }),
    MedicalRecord.exists({ doctor: doctorId, patient: patientId }),
    Admission.exists({ doctor: doctorId, patient: patientId }),
    LabOrder.exists({ doctor: doctorId, patient: patientId }),
  ]);

  return related.some(Boolean);
};

const buildRoleFilter = async (
  reqUser,
  patientField = "patient",
  doctorField = "doctor",
) => {
  if (reqUser.role === "admin") return {};
  if (reqUser.role === "user") return { [patientField]: reqUser._id };

  const doctorId = await getAuthDoctorId(reqUser);
  return doctorId ? { [doctorField]: doctorId } : { [doctorField]: null };
};

const getOccupancyByDepartment = async () => {
  const rows = await Admission.aggregate([
    {
      $match: {
        status: { $in: OPEN_ADMISSION_STATUSES },
      },
    },
    {
      $group: {
        _id: "$department",
        occupiedBeds: { $sum: 1 },
      },
    },
  ]);

  return new Map(rows.map((row) => [String(row._id), row.occupiedBeds]));
};

const getDepartments = asyncHandler(async (req, res) => {
  await ensureDefaultDepartments();
  const departments = await Department.find()
    .populate("headDoctor", "fullname specialization")
    .sort({ name: 1 });

  const occupancyMap = await getOccupancyByDepartment();

  const data = departments.map((department) => {
    const occupiedBeds = occupancyMap.get(String(department._id)) || 0;
    const bedCapacity = department.bedCapacity || 0;
    return {
      ...department.toObject(),
      occupiedBeds,
      availableBeds: Math.max(0, bedCapacity - occupiedBeds),
      occupancyRate: bedCapacity
        ? Math.round((occupiedBeds / bedCapacity) * 100)
        : 0,
    };
  });

  res.json({
    success: true,
    data,
  });
});

const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create({
    name: req.body.name,
    code: req.body.code,
    description: req.body.description || "",
    location: req.body.location || "",
    floor: req.body.floor || "",
    contactNumber: req.body.contactNumber || "",
    email: req.body.email || "",
    operatingHours: req.body.operatingHours || undefined,
    services: toArray(req.body.services),
    facilities: toArray(req.body.facilities),
    headDoctor: req.body.headDoctor || undefined,
    bedCapacity: Number(req.body.bedCapacity) || 0,
    wardCount: Number(req.body.wardCount) || 0,
    color: req.body.color || "#0f766e",
    isActive: req.body.isActive !== false,
  });

  res.status(201).json({
    success: true,
    message: "Department created successfully",
    data: department,
  });
});

const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) {
    res.status(404);
    throw new Error("Department not found");
  }

  [
    "name",
    "code",
    "description",
    "location",
    "floor",
    "contactNumber",
    "email",
    "headDoctor",
    "color",
  ].forEach((field) => {
    if (req.body[field] !== undefined) {
      department[field] = req.body[field];
    }
  });

  if (req.body.operatingHours !== undefined) {
    department.operatingHours = req.body.operatingHours;
  }
  if (req.body.services !== undefined) {
    department.services = toArray(req.body.services);
  }
  if (req.body.facilities !== undefined) {
    department.facilities = toArray(req.body.facilities);
  }
  if (req.body.bedCapacity !== undefined) {
    department.bedCapacity = Number(req.body.bedCapacity) || 0;
  }
  if (req.body.wardCount !== undefined) {
    department.wardCount = Number(req.body.wardCount) || 0;
  }
  if (req.body.isActive !== undefined) {
    department.isActive = Boolean(req.body.isActive);
  }

  await department.save();

  res.json({
    success: true,
    message: "Department updated successfully",
    data: department,
  });
});

const getPatients = asyncHandler(async (req, res) => {
  const { page, limit, skip } = calculatePagination(
    req.query.page,
    req.query.limit,
  );
  const search = req.query.search ? String(req.query.search).trim() : "";

  let patientIds = null;
  if (req.user.role === "doctor") {
    const doctorId = await getAuthDoctorId(req.user);
    const [appointments, records, admissions, labs] = await Promise.all([
      Appointment.distinct("patient", { doctor: doctorId }),
      MedicalRecord.distinct("patient", { doctor: doctorId }),
      Admission.distinct("patient", { doctor: doctorId }),
      LabOrder.distinct("patient", { doctor: doctorId }),
    ]);

    patientIds = [
      ...new Set(
        [...appointments, ...records, ...admissions, ...labs].map(String),
      ),
    ];

    if (patientIds.length === 0) {
      return res.json({
        success: true,
        pagination: { page, limit, total: 0, totalPages: 0 },
        data: [],
      });
    }
  }

  const filter = { role: "user" };
  if (patientIds) {
    filter._id = { $in: patientIds };
  }
  if (search) {
    filter.$or = [
      { fullname: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { city: { $regex: search, $options: "i" } },
    ];
  }

  const total = await User.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);
  const patients = await User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const patientIdsForStats = patients.map((patient) => patient._id);
  const [appointmentStats, activeAdmissions, outstandingBills] =
    await Promise.all([
      Appointment.aggregate([
        { $match: { patient: { $in: patientIdsForStats } } },
        { $group: { _id: "$patient", appointments: { $sum: 1 } } },
      ]),
      Admission.aggregate([
        {
          $match: {
            patient: { $in: patientIdsForStats },
            status: { $in: OPEN_ADMISSION_STATUSES },
          },
        },
        { $group: { _id: "$patient", activeAdmissions: { $sum: 1 } } },
      ]),
      Bill.aggregate([
        {
          $match: {
            patient: { $in: patientIdsForStats },
            balanceDue: { $gt: 0 },
          },
        },
        {
          $group: {
            _id: "$patient",
            dueAmount: { $sum: "$balanceDue" },
          },
        },
      ]),
    ]);

  const appointmentMap = new Map(
    appointmentStats.map((row) => [String(row._id), row.appointments]),
  );
  const admissionMap = new Map(
    activeAdmissions.map((row) => [String(row._id), row.activeAdmissions]),
  );
  const billMap = new Map(
    outstandingBills.map((row) => [String(row._id), row.dueAmount]),
  );

  res.json({
    success: true,
    pagination: { page, limit, total, totalPages },
    data: patients.map((patient) => ({
      ...patient.toObject(),
      appointmentsCount: appointmentMap.get(String(patient._id)) || 0,
      activeAdmissions: admissionMap.get(String(patient._id)) || 0,
      outstandingBalance: billMap.get(String(patient._id)) || 0,
    })),
  });
});

const getPatientSummary = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const hasAccess = await canAccessPatient(req.user, patientId);
  if (!hasAccess) {
    res.status(403);
    throw new Error("Not authorized to view this patient");
  }

  const patient = await User.findById(patientId).select("-password");
  if (!patient) {
    res.status(404);
    throw new Error("Patient not found");
  }

  const [
    appointmentsCount,
    recordsCount,
    admissionsCount,
    labOrdersCount,
    outstandingBalanceRows,
    appointments,
    records,
    admissions,
    labOrders,
    bills,
  ] = await Promise.all([
    Appointment.countDocuments({ patient: patientId }),
    MedicalRecord.countDocuments({ patient: patientId }),
    Admission.countDocuments({ patient: patientId }),
    LabOrder.countDocuments({ patient: patientId }),
    Bill.aggregate([
      {
        $match: {
          patient: patient._id,
          balanceDue: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          dueAmount: { $sum: "$balanceDue" },
        },
      },
    ]),
    Appointment.find({ patient: patientId })
      .populate("doctor", "fullname specialization city")
      .sort({ date: -1 })
      .limit(6),
    MedicalRecord.find({ patient: patientId })
      .populate("doctor", "fullname specialization")
      .populate("department", "name code color")
      .sort({ createdAt: -1 })
      .limit(6),
    Admission.find({ patient: patientId })
      .populate("doctor", "fullname specialization")
      .populate("department", "name code color")
      .sort({ admissionDate: -1 })
      .limit(6),
    LabOrder.find({ patient: patientId })
      .populate("doctor", "fullname specialization")
      .populate("department", "name code color")
      .sort({ orderedAt: -1 })
      .limit(6),
    Bill.find({ patient: patientId })
      .populate("doctor", "fullname specialization")
      .populate("department", "name code color")
      .sort({ issuedAt: -1 })
      .limit(6),
  ]);

  res.json({
    success: true,
    data: {
      patient,
      stats: {
        appointments: appointmentsCount,
        records: recordsCount,
        admissions: admissionsCount,
        labOrders: labOrdersCount,
        outstandingBalance: outstandingBalanceRows[0]?.dueAmount || 0,
      },
      appointments,
      records,
      admissions,
      labOrders,
      bills,
    },
  });
});

const getMedicalRecords = asyncHandler(async (req, res) => {
  const { page, limit, skip } = calculatePagination(
    req.query.page,
    req.query.limit,
  );
  const filter = await buildRoleFilter(req.user);

  if (req.query.patientId) {
    const hasAccess = await canAccessPatient(req.user, req.query.patientId);
    if (!hasAccess) {
      res.status(403);
      throw new Error("Not authorized to view this patient's records");
    }
    filter.patient = req.query.patientId;
  }
  if (req.query.doctorId && req.user.role === "admin") {
    filter.doctor = req.query.doctorId;
  }
  if (req.query.departmentId) {
    filter.department = req.query.departmentId;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const total = await MedicalRecord.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  const records = await MedicalRecord.find(filter)
    .populate("patient", "fullname email phone gender age city")
    .populate("doctor", "fullname specialization")
    .populate("department", "name code color")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    pagination: { page, limit, total, totalPages },
    data: records,
  });
});

const createMedicalRecord = asyncHandler(async (req, res) => {
  const doctorId =
    req.user.role === "admin"
      ? req.body.doctorId
      : await getAuthDoctorId(req.user);

  if (!doctorId) {
    res.status(400);
    throw new Error("Doctor is required to create a medical record");
  }

  const patient = await User.findById(req.body.patientId);
  if (!patient) {
    res.status(404);
    throw new Error("Patient not found");
  }

  const record = await MedicalRecord.create({
    patient: req.body.patientId,
    doctor: doctorId,
    appointment: req.body.appointmentId || undefined,
    admission: req.body.admissionId || undefined,
    department: req.body.departmentId || undefined,
    visitType: req.body.visitType || "opd",
    chiefComplaint: req.body.chiefComplaint || "",
    diagnosis: req.body.diagnosis || "",
    symptoms: toArray(req.body.symptoms),
    allergies: toArray(req.body.allergies),
    vitals: req.body.vitals || {},
    medications: Array.isArray(req.body.medications)
      ? req.body.medications
      : [],
    treatmentPlan: req.body.treatmentPlan || "",
    notes: req.body.notes || "",
    followUpDate: toDate(req.body.followUpDate),
    attachments: toArray(req.body.attachments),
    status: req.body.status || "open",
  });

  const populated = await MedicalRecord.findById(record._id)
    .populate("patient", "fullname email phone gender age city")
    .populate("doctor", "fullname specialization")
    .populate("department", "name code color");

  res.status(201).json({
    success: true,
    message: "Medical record created successfully",
    data: populated,
  });
});

const updateMedicalRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findById(req.params.id);
  if (!record) {
    res.status(404);
    throw new Error("Medical record not found");
  }

  if (req.user.role !== "admin") {
    const doctorId = await getAuthDoctorId(req.user);
    if (!doctorId || String(record.doctor) !== String(doctorId)) {
      res.status(403);
      throw new Error("Not authorized to update this medical record");
    }
  }

  [
    "visitType",
    "chiefComplaint",
    "diagnosis",
    "treatmentPlan",
    "notes",
    "status",
  ].forEach((field) => {
    if (req.body[field] !== undefined) {
      record[field] = req.body[field];
    }
  });

  if (req.body.symptoms !== undefined) {
    record.symptoms = toArray(req.body.symptoms);
  }
  if (req.body.allergies !== undefined) {
    record.allergies = toArray(req.body.allergies);
  }
  if (req.body.vitals !== undefined) {
    record.vitals = req.body.vitals;
  }
  if (
    req.body.medications !== undefined &&
    Array.isArray(req.body.medications)
  ) {
    record.medications = req.body.medications;
  }
  if (req.body.followUpDate !== undefined) {
    record.followUpDate = toDate(req.body.followUpDate);
  }
  if (req.body.attachments !== undefined) {
    record.attachments = toArray(req.body.attachments);
  }
  if (req.body.departmentId !== undefined) {
    record.department = req.body.departmentId || undefined;
  }
  if (req.body.admissionId !== undefined) {
    record.admission = req.body.admissionId || undefined;
  }
  if (req.body.appointmentId !== undefined) {
    record.appointment = req.body.appointmentId || undefined;
  }

  await record.save();

  const populated = await MedicalRecord.findById(record._id)
    .populate("patient", "fullname email phone gender age city")
    .populate("doctor", "fullname specialization")
    .populate("department", "name code color");

  res.json({
    success: true,
    message: "Medical record updated successfully",
    data: populated,
  });
});

const getAdmissions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = calculatePagination(
    req.query.page,
    req.query.limit,
  );
  const filter = await buildRoleFilter(req.user);

  if (req.query.patientId) {
    const hasAccess = await canAccessPatient(req.user, req.query.patientId);
    if (!hasAccess) {
      res.status(403);
      throw new Error("Not authorized to view this patient's admissions");
    }
    filter.patient = req.query.patientId;
  }
  if (req.query.departmentId) {
    filter.department = req.query.departmentId;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const total = await Admission.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  const admissions = await Admission.find(filter)
    .populate("patient", "fullname email phone gender age city")
    .populate("doctor", "fullname specialization")
    .populate("department", "name code color floor location")
    .sort({ admissionDate: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    pagination: { page, limit, total, totalPages },
    data: admissions,
  });
});

const createAdmission = asyncHandler(async (req, res) => {
  const doctorId =
    req.user.role === "admin"
      ? req.body.doctorId
      : await getAuthDoctorId(req.user);

  if (!doctorId) {
    res.status(400);
    throw new Error("Doctor is required to create an admission");
  }

  const [patient, department] = await Promise.all([
    User.findById(req.body.patientId),
    Department.findById(req.body.departmentId),
  ]);

  if (!patient) {
    res.status(404);
    throw new Error("Patient not found");
  }
  if (!department) {
    res.status(404);
    throw new Error("Department not found");
  }

  const admission = await Admission.create({
    admissionNumber: generateRef("ADM"),
    patient: req.body.patientId,
    doctor: doctorId,
    department: req.body.departmentId,
    reason: req.body.reason || "",
    diagnosis: req.body.diagnosis || "",
    roomNumber: req.body.roomNumber || "",
    bedNumber: req.body.bedNumber || "",
    wardType: req.body.wardType || "general",
    admissionDate: toDate(req.body.admissionDate) || new Date(),
    expectedDischargeDate: toDate(req.body.expectedDischargeDate),
    status: req.body.status || "admitted",
    priority: req.body.priority || "routine",
    treatmentPlan: req.body.treatmentPlan || "",
    notes: Array.isArray(req.body.notes)
      ? req.body.notes.map((entry) => ({ note: entry.note || entry }))
      : req.body.notes
        ? [{ note: String(req.body.notes) }]
        : [],
  });

  const populated = await Admission.findById(admission._id)
    .populate("patient", "fullname email phone gender age city")
    .populate("doctor", "fullname specialization")
    .populate("department", "name code color floor location");

  res.status(201).json({
    success: true,
    message: "Admission created successfully",
    data: populated,
  });
});

const updateAdmission = asyncHandler(async (req, res) => {
  const admission = await Admission.findById(req.params.id);
  if (!admission) {
    res.status(404);
    throw new Error("Admission not found");
  }

  if (req.user.role !== "admin") {
    const doctorId = await getAuthDoctorId(req.user);
    if (!doctorId || String(admission.doctor) !== String(doctorId)) {
      res.status(403);
      throw new Error("Not authorized to update this admission");
    }
  }

  [
    "reason",
    "diagnosis",
    "roomNumber",
    "bedNumber",
    "wardType",
    "status",
    "priority",
    "treatmentPlan",
  ].forEach((field) => {
    if (req.body[field] !== undefined) {
      admission[field] = req.body[field];
    }
  });

  if (req.body.departmentId !== undefined) {
    admission.department = req.body.departmentId;
  }
  if (req.body.expectedDischargeDate !== undefined) {
    admission.expectedDischargeDate = toDate(req.body.expectedDischargeDate);
  }
  if (req.body.actualDischargeDate !== undefined) {
    admission.actualDischargeDate = toDate(req.body.actualDischargeDate);
  }
  if (req.body.status === "discharged" && !admission.actualDischargeDate) {
    admission.actualDischargeDate = new Date();
  }
  if (req.body.notes !== undefined) {
    admission.notes = Array.isArray(req.body.notes)
      ? req.body.notes.map((entry) => ({ note: entry.note || entry }))
      : req.body.notes
        ? [{ note: String(req.body.notes) }]
        : [];
  }

  await admission.save();

  const populated = await Admission.findById(admission._id)
    .populate("patient", "fullname email phone gender age city")
    .populate("doctor", "fullname specialization")
    .populate("department", "name code color floor location");

  res.json({
    success: true,
    message: "Admission updated successfully",
    data: populated,
  });
});

const getLabOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = calculatePagination(
    req.query.page,
    req.query.limit,
  );
  const filter = await buildRoleFilter(req.user);

  if (req.query.patientId) {
    const hasAccess = await canAccessPatient(req.user, req.query.patientId);
    if (!hasAccess) {
      res.status(403);
      throw new Error("Not authorized to view this patient's lab orders");
    }
    filter.patient = req.query.patientId;
  }
  if (req.query.departmentId) {
    filter.department = req.query.departmentId;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.priority) {
    filter.priority = req.query.priority;
  }

  const total = await LabOrder.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  const labOrders = await LabOrder.find(filter)
    .populate("patient", "fullname email phone gender age city")
    .populate("doctor", "fullname specialization")
    .populate("department", "name code color")
    .sort({ orderedAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    pagination: { page, limit, total, totalPages },
    data: labOrders,
  });
});

const createLabOrder = asyncHandler(async (req, res) => {
  const doctorId =
    req.user.role === "admin"
      ? req.body.doctorId
      : await getAuthDoctorId(req.user);

  if (!doctorId) {
    res.status(400);
    throw new Error("Doctor is required to create a lab order");
  }

  const patient = await User.findById(req.body.patientId);
  if (!patient) {
    res.status(404);
    throw new Error("Patient not found");
  }

  const tests = Array.isArray(req.body.tests) ? req.body.tests : [];
  if (tests.length === 0) {
    res.status(400);
    throw new Error("At least one test is required");
  }

  const order = await LabOrder.create({
    orderNumber: generateRef("LAB"),
    patient: req.body.patientId,
    doctor: doctorId,
    department: req.body.departmentId || undefined,
    appointment: req.body.appointmentId || undefined,
    admission: req.body.admissionId || undefined,
    priority: req.body.priority || "routine",
    status: req.body.status || "ordered",
    tests: tests.map((test) => ({
      name: test.name,
      category: test.category || "",
      status: test.status || "ordered",
      result: test.result || "",
      unit: test.unit || "",
      referenceRange: test.referenceRange || "",
      remarks: test.remarks || "",
    })),
    clinicalNotes: req.body.clinicalNotes || "",
    orderedAt: toDate(req.body.orderedAt) || new Date(),
  });

  const populated = await LabOrder.findById(order._id)
    .populate("patient", "fullname email phone gender age city")
    .populate("doctor", "fullname specialization")
    .populate("department", "name code color");

  res.status(201).json({
    success: true,
    message: "Lab order created successfully",
    data: populated,
  });
});

const updateLabOrder = asyncHandler(async (req, res) => {
  const order = await LabOrder.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Lab order not found");
  }

  if (req.user.role !== "admin") {
    const doctorId = await getAuthDoctorId(req.user);
    if (!doctorId || String(order.doctor) !== String(doctorId)) {
      res.status(403);
      throw new Error("Not authorized to update this lab order");
    }
  }

  ["priority", "status", "clinicalNotes"].forEach((field) => {
    if (req.body[field] !== undefined) {
      order[field] = req.body[field];
    }
  });

  if (req.body.tests !== undefined && Array.isArray(req.body.tests)) {
    order.tests = req.body.tests.map((test) => ({
      name: test.name,
      category: test.category || "",
      status: test.status || "ordered",
      result: test.result || "",
      unit: test.unit || "",
      referenceRange: test.referenceRange || "",
      remarks: test.remarks || "",
    }));
  }

  if (
    (req.body.status === "completed" ||
      order.tests.every((test) => test.status === "completed")) &&
    !order.completedAt
  ) {
    order.completedAt = new Date();
  }

  await order.save();

  const populated = await LabOrder.findById(order._id)
    .populate("patient", "fullname email phone gender age city")
    .populate("doctor", "fullname specialization")
    .populate("department", "name code color");

  res.json({
    success: true,
    message: "Lab order updated successfully",
    data: populated,
  });
});

const getBills = asyncHandler(async (req, res) => {
  const { page, limit, skip } = calculatePagination(
    req.query.page,
    req.query.limit,
  );
  const filter = await buildRoleFilter(req.user);

  if (req.query.patientId) {
    const hasAccess = await canAccessPatient(req.user, req.query.patientId);
    if (!hasAccess) {
      res.status(403);
      throw new Error("Not authorized to view this patient's bills");
    }
    filter.patient = req.query.patientId;
  }
  if (req.query.departmentId) {
    filter.department = req.query.departmentId;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const total = await Bill.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  const bills = await Bill.find(filter)
    .populate("patient", "fullname email phone city")
    .populate("doctor", "fullname specialization")
    .populate("department", "name code color")
    .sort({ issuedAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    pagination: { page, limit, total, totalPages },
    data: bills,
  });
});

const createBill = asyncHandler(async (req, res) => {
  const patient = await User.findById(req.body.patientId);
  if (!patient) {
    res.status(404);
    throw new Error("Patient not found");
  }

  const totals = computeBillTotals(
    Array.isArray(req.body.lineItems) ? req.body.lineItems : [],
    req.body.taxAmount,
    req.body.discountAmount,
    req.body.paidAmount,
  );

  const bill = await Bill.create({
    billNumber: generateRef("BILL"),
    patient: req.body.patientId,
    doctor: req.body.doctorId || undefined,
    department: req.body.departmentId || undefined,
    appointment: req.body.appointmentId || undefined,
    admission: req.body.admissionId || undefined,
    ...totals,
    status: req.body.status || totals.status,
    dueDate: toDate(req.body.dueDate),
    issuedAt: toDate(req.body.issuedAt) || new Date(),
    paidAt:
      (req.body.status === "paid" || totals.status === "paid") &&
      totals.paidAmount > 0
        ? toDate(req.body.paidAt) || new Date()
        : undefined,
    paymentMethod: req.body.paymentMethod || "",
    notes: req.body.notes || "",
  });

  const populated = await Bill.findById(bill._id)
    .populate("patient", "fullname email phone city")
    .populate("doctor", "fullname specialization")
    .populate("department", "name code color");

  res.status(201).json({
    success: true,
    message: "Bill created successfully",
    data: populated,
  });
});

const updateBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);
  if (!bill) {
    res.status(404);
    throw new Error("Bill not found");
  }

  if (req.body.doctorId !== undefined) {
    bill.doctor = req.body.doctorId || undefined;
  }
  if (req.body.departmentId !== undefined) {
    bill.department = req.body.departmentId || undefined;
  }
  if (req.body.appointmentId !== undefined) {
    bill.appointment = req.body.appointmentId || undefined;
  }
  if (req.body.admissionId !== undefined) {
    bill.admission = req.body.admissionId || undefined;
  }
  if (req.body.paymentMethod !== undefined) {
    bill.paymentMethod = req.body.paymentMethod || "";
  }
  if (req.body.notes !== undefined) {
    bill.notes = req.body.notes || "";
  }
  if (req.body.dueDate !== undefined) {
    bill.dueDate = toDate(req.body.dueDate);
  }
  if (req.body.issuedAt !== undefined) {
    bill.issuedAt = toDate(req.body.issuedAt);
  }

  if (
    req.body.lineItems !== undefined ||
    req.body.taxAmount !== undefined ||
    req.body.discountAmount !== undefined ||
    req.body.paidAmount !== undefined
  ) {
    const totals = computeBillTotals(
      req.body.lineItems !== undefined ? req.body.lineItems : bill.lineItems,
      req.body.taxAmount !== undefined ? req.body.taxAmount : bill.taxAmount,
      req.body.discountAmount !== undefined
        ? req.body.discountAmount
        : bill.discountAmount,
      req.body.paidAmount !== undefined ? req.body.paidAmount : bill.paidAmount,
    );

    Object.assign(bill, totals);
  }

  if (req.body.status !== undefined) {
    bill.status = req.body.status;
  }

  if ((bill.status === "paid" || bill.balanceDue === 0) && !bill.paidAt) {
    bill.paidAt = toDate(req.body.paidAt) || new Date();
  }

  await bill.save();

  const populated = await Bill.findById(bill._id)
    .populate("patient", "fullname email phone city")
    .populate("doctor", "fullname specialization")
    .populate("department", "name code color");

  res.json({
    success: true,
    message: "Bill updated successfully",
    data: populated,
  });
});

const getHospitalDashboard = asyncHandler(async (req, res) => {
  await ensureDefaultDepartments();
  const doctorId = await getAuthDoctorId(req.user);

  if (req.user.role === "admin") {
    const [
      departments,
      activeAdmissions,
      pendingLabs,
      totalBills,
      pendingBills,
      appointmentsToday,
    ] = await Promise.all([
      Department.find().sort({ name: 1 }),
      Admission.countDocuments({ status: { $in: OPEN_ADMISSION_STATUSES } }),
      LabOrder.countDocuments({
        status: { $in: ["ordered", "sample-collected", "processing"] },
      }),
      Bill.aggregate([
        { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
      ]),
      Bill.aggregate([
        { $match: { balanceDue: { $gt: 0 } } },
        { $group: { _id: null, dueAmount: { $sum: "$balanceDue" } } },
      ]),
      Appointment.countDocuments({
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
    ]);

    const occupancyMap = await getOccupancyByDepartment();
    const departmentSummaries = departments.map((department) => {
      const occupiedBeds = occupancyMap.get(String(department._id)) || 0;
      const bedCapacity = department.bedCapacity || 0;
      return {
        _id: department._id,
        name: department.name,
        code: department.code,
        color: department.color,
        occupiedBeds,
        bedCapacity,
        occupancyRate: bedCapacity
          ? Math.round((occupiedBeds / bedCapacity) * 100)
          : 0,
      };
    });

    const recentAdmissions = await Admission.find()
      .populate("patient", "fullname")
      .populate("doctor", "fullname")
      .populate("department", "name code color")
      .sort({ admissionDate: -1 })
      .limit(5);

    return res.json({
      success: true,
      data: {
        role: "admin",
        stats: {
          departments: departments.length,
          activeAdmissions,
          pendingLabOrders: pendingLabs,
          todayAppointments: appointmentsToday,
          grossBilling: totalBills[0]?.totalAmount || 0,
          pendingCollections: pendingBills[0]?.dueAmount || 0,
        },
        departments: departmentSummaries,
        recentAdmissions,
      },
    });
  }

  if (req.user.role === "doctor") {
    const [appointmentPatientIds, recordPatientIds, admissionPatientIds, labPatientIds] =
      await Promise.all([
        Appointment.distinct("patient", {
          doctor: doctorId,
        }),
        MedicalRecord.distinct("patient", {
          doctor: doctorId,
        }),
        Admission.distinct("patient", {
          doctor: doctorId,
        }),
        LabOrder.distinct("patient", {
          doctor: doctorId,
        }),
      ]);

    const trackedPatientIds = [
      ...new Set(
        [
          ...appointmentPatientIds,
          ...recordPatientIds,
          ...admissionPatientIds,
          ...labPatientIds,
        ].map(String),
      ),
    ];

    const [
      todayAppointments,
      activeAdmissions,
      openRecords,
      pendingLabs,
      recentPatients,
      upcomingAppointments,
    ] = await Promise.all([
      Appointment.countDocuments({
        doctor: doctorId,
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
      Admission.countDocuments({
        doctor: doctorId,
        status: { $in: OPEN_ADMISSION_STATUSES },
      }),
      MedicalRecord.countDocuments({
        doctor: doctorId,
        status: { $in: ["open", "under-observation"] },
      }),
      LabOrder.countDocuments({
        doctor: doctorId,
        status: { $in: ["ordered", "sample-collected", "processing"] },
      }),
      User.find({
        _id: { $in: trackedPatientIds },
      })
        .select("-password")
        .sort({ updatedAt: -1 })
        .limit(5),
      Appointment.find({
        doctor: doctorId,
        date: { $gte: new Date() },
      })
        .populate("patient", "fullname email phone city")
        .sort({ date: 1 })
        .limit(5),
    ]);

    return res.json({
      success: true,
      data: {
        role: "doctor",
        stats: {
          todayAppointments,
          activeAdmissions,
          openRecords,
          pendingLabOrders: pendingLabs,
          totalPatients: trackedPatientIds.length,
        },
        upcomingAppointments,
        recentPatients,
      },
    });
  }

  const [
    upcomingAppointmentsCount,
    recordsCount,
    pendingLabOrdersCount,
    outstandingBalanceRows,
    upcomingAppointments,
    activeAdmission,
    recentRecords,
    labOrders,
    bills,
    departments,
  ] = await Promise.all([
    Appointment.countDocuments({
      patient: req.user._id,
      date: { $gte: new Date() },
    }),
    MedicalRecord.countDocuments({ patient: req.user._id }),
    LabOrder.countDocuments({
      patient: req.user._id,
      status: { $ne: "completed" },
    }),
    Bill.aggregate([
      {
        $match: {
          patient: req.user._id,
          balanceDue: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          dueAmount: { $sum: "$balanceDue" },
        },
      },
    ]),
    Appointment.find({
      patient: req.user._id,
      date: { $gte: new Date() },
    })
      .populate("doctor", "fullname specialization city")
      .sort({ date: 1 })
      .limit(5),
    Admission.findOne({
      patient: req.user._id,
      status: { $in: OPEN_ADMISSION_STATUSES },
    })
      .populate("doctor", "fullname specialization")
      .populate("department", "name code color floor location")
      .sort({ admissionDate: -1 }),
    MedicalRecord.find({ patient: req.user._id })
      .populate("doctor", "fullname specialization")
      .populate("department", "name code color")
      .sort({ createdAt: -1 })
      .limit(5),
    LabOrder.find({ patient: req.user._id })
      .populate("doctor", "fullname specialization")
      .populate("department", "name code color")
      .sort({ orderedAt: -1 })
      .limit(5),
    Bill.find({ patient: req.user._id })
      .populate("department", "name code color")
      .sort({ issuedAt: -1 })
      .limit(5),
    Department.find().sort({ name: 1 }).limit(6),
  ]);

  res.json({
    success: true,
    data: {
      role: "user",
      stats: {
        upcomingAppointments: upcomingAppointmentsCount,
        records: recordsCount,
        pendingLabOrders: pendingLabOrdersCount,
        outstandingBalance: outstandingBalanceRows[0]?.dueAmount || 0,
        activeAdmission: activeAdmission ? 1 : 0,
      },
      activeAdmission,
      upcomingAppointments,
      recentRecords,
      labOrders,
      bills,
      departments,
    },
  });
});

module.exports = {
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
};
