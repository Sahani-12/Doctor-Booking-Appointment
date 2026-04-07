# Database Schema & Data Models Reference

## Complete MongoDB Schema Definitions

### 1. User Model (Patients)

```javascript
{
  _id: ObjectId,
  fullname: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (default: "user"),
  phone: String,
  city: String,
  DOB: String,
  image: String,
  age: Number,
  gender: String,
  isVerified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- email (for fast lookups)
- city (for filtering by location)

**Role:** "user"

---

### 2. Doctor Model

```javascript
{
  _id: ObjectId,
  fullname: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (default: "doctor"),
  phone: String,
  gender: String,
  DOB: String,
  age: Number,
  experience: String,
  description: String,
  specialization: [String],          // e.g., ["Cardiology", "Internal Medicine"]
  subspecialization: [String],       // e.g., ["Interventional Cardiology"]
  degrees: [String],                 // e.g., ["MBBS", "MD Cardiology"]
  certification: [String],           // e.g., ["Board Certified"]
  educationHistory: [String],        // e.g., ["St. John Medical College"]
  fee: Number,                       // Consultation fee
  emergencyFee: Number,
  location: String,
  city: String,
  profileImage: String,
  languagesSpoken: [String],         // e.g., ["English", "Hindi"]
  stories: [ObjectId],               // References to Story documents
  rating: Number (default: 0),
  isApproved: Boolean (default: true),  // ⭐ Admin approval status
  isVerified: Boolean (default: false), // Email/document verification
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- specialization (for search by specialty)
- city (for location-based search)
- email (for authentication)

**Role:** "doctor"

**⭐ Admin Control Field:** `isApproved` - Determines if doctor can accept appointments

---

### 3. Appointment Model

```javascript
{
  _id: ObjectId,
  patient: ObjectId (ref: User, required),
  doctor: ObjectId (ref: Doctor, required),
  date: Date (required),
  slot: String (required),           // Format: "HH:MM" e.g., "14:30"
  status: String (enum, default: "pending"),
    // Values: "pending" | "accepted" | "completed" | "cancelled"
  notes: String,                     // Patient's reason for visit
  consultationType: String (enum, default: "online"),
    // Values: "online" | "offline"
  rating: Number,                    // 1-5 stars (after completion)
  feedback: String,                  // Patient feedback
  prescription: String,              // Doctor's notes/prescription
  prescriptionFile: String,          // URL to prescription document
  isPaid: Boolean (default: false),
  paymentId: ObjectId (ref: Transaction),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- patient + date (for patient's appointments)
- doctor + date (for doctor's appointments)
- status (for filtering)
- date (for sorting)

**Status Lifecycle:**

```
Creation → pending → accepted → completed → rating/feedback given
                  ↘ cancelled (by patient or doctor)
```

---

### 4. Transaction Model

```javascript
{
  _id: ObjectId,
  appointmentId: ObjectId (ref: Appointment, required),
  userId: ObjectId (ref: User, required),        // Patient ID
  doctorId: ObjectId (ref: Doctor, required),
  amount: Number (required, min: 0),
  currency: String (default: "INR", enum: ["INR", "USD", "EUR"]),
  paymentMethod: String (required),
    // Values: "card" | "upi" | "netbanking" | "wallet" | "razorpay"
  gateway: String (required),
    // Values: "stripe" | "razorpay" | "demo"
  status: String (enum, default: "pending"),
    // Values: "pending" | "success" | "failed" | "refunded"

  // Payment Gateway References
  stripePaymentIntentId: String,     // From Stripe
  razorpayOrderId: String,           // From Razorpay
  razorpayPaymentId: String,         // From Razorpay

  // Metadata
  metadata: {
    description: String,
    receipt: String,
    notes: String
  },

  // Refund Info
  refundAmount: Number,
  refundStatus: String,              // "pending" | "success" | "failed"
  refundId: String,
  refundReason: String,

  createdAt: Date,
  updatedAt: Date
}
```

**Status Lifecycle:**

```
pending → success → [optionally] → refunded
       ↘ failed
```

---

### 5. Document Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),      // Patient owning document
  appointmentId: ObjectId (ref: Appointment),
  fileName: String (required),
  fileUrl: String (required),        // URL to stored file
  fileType: String,                  // e.g., "application/pdf"
  documentType: String,              // e.g., "prescription", "medical_record"
  uploadedBy: ObjectId,              // User who uploaded
  createdAt: Date,
  updatedAt: Date
}
```

---

### 6. Story Model

```javascript
{
  _id: ObjectId,
  doctorId: ObjectId (ref: Doctor, required),
  title: String,                     // Story title
  content: String,                   // Story content
  image: String,                     // Story image URL
  likes: Number (default: 0),
  comments: [{
    userId: ObjectId (ref: User),
    text: String,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

### 7. VideoSession Model

```javascript
{
  _id: ObjectId,
  appointmentId: ObjectId (ref: Appointment, required),
  patient: ObjectId (ref: User, required),
  doctor: ObjectId (ref: Doctor, required),
  roomId: String,                    // Video room identifier
  roomUrl: String,                   // Room URL/link
  status: String (enum, default: "scheduled"),
    // Values: "scheduled" | "ongoing" | "completed" | "cancelled"
  startTime: Date,
  endTime: Date,
  duration: Number,                  // In minutes
  recordingUrl: String,              // If recorded
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Role-Based Data Access Patterns

### Patient (role: "user")

```
Can Read:
  - Own User document
  - Own Appointments
  - Doctor profiles (public info)
  - Own Transactions

Can Write:
  - Own User document
  - Own Appointments (create, update status to cancel)
  - Own Transactions (create)
  - Add ratings/feedback to own appointments
```

### Doctor (role: "doctor")

```
Can Read:
  - Own Doctor document
  - Own Appointments
  - Own Transactions (earnings)
  - Patient profiles (appointment-related only)
  - Own ratings/feedback

Can Write:
  - Own Doctor document (profile updates)
  - Own Appointments (update status: accept/complete)
  - Add prescriptions to own appointments
  - Cannot delete users or other doctors' appointments
```

### Admin (role: "admin")

```
Can Read:
  - ALL User documents
  - ALL Doctor documents
  - ALL Appointments
  - ALL Transactions
  - ALL Documents
  - System statistics

Can Write:
  - Update User documents
  - Update Doctor documents (especially isApproved)
  - Update Appointment status (for management)
  - Delete User documents
  - Delete Doctor documents
  - View all analytics
```

---

## Key Statistics Queries

### For Admin Dashboard

```javascript
// Total Users
db.users.countDocuments({ role: "user" });

// Total Doctors
db.doctors.countDocuments({ role: "doctor" });

// Pending Doctor Approvals ⭐ IMPORTANT
db.doctors.countDocuments({ isApproved: false });

// Total Appointments This Month
db.appointments.countDocuments({
  date: { $gte: ISODate("2024-03-01"), $lt: ISODate("2024-04-01") },
});

// Total Revenue This Month
db.transactions.aggregate([
  {
    $match: {
      status: "success",
      createdAt: { $gte: ISODate("2024-03-01"), $lt: ISODate("2024-04-01") },
    },
  },
  { $group: { _id: null, total: { $sum: "$amount" } } },
]);

// Appointments by Status
db.appointments.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

// Top Specializations
db.doctors.aggregate([
  { $unwind: "$specialization" },
  { $group: { _id: "$specialization", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);

// Top Rated Doctors
db.doctors.find().sort({ rating: -1 }).limit(10);
```

---

## Search & Filter Patterns

### User Search (Admin)

```javascript
db.users
  .find({
    $or: [
      { fullname: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } },
    ],
  })
  .sort({ createdAt: -1 })
  .limit(20)
  .skip(page * 20);
```

### Doctor Search (Admin)

```javascript
db.doctors
  .find({
    $and: [
      {
        $or: [
          { fullname: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
          { specialization: { $regex: searchTerm, $options: "i" } },
        ],
      },
      { isApproved: true }, // Only approved doctors
    ],
  })
  .sort({ rating: -1 })
  .limit(20)
  .skip(page * 20);
```

### Appointment Filters (Admin)

```javascript
db.appointments
  .find({
    $and: [
      { status: filterStatus }, // "pending", "accepted", etc.
      { consultationType: filterType }, // "online", "offline"
      { isPaid: filterPaid }, // true/false
      {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    ],
  })
  .sort({ date: -1 })
  .limit(25)
  .skip(page * 25);
```

---

## Important Notes for Admin Backend Usage

1. **Doctor Approval is Critical**
   - When doctor registers, `isApproved` defaults to `true`
   - But backend allows admin to control this via `PUT /api/admin/doctors/:id/approve`
   - Need to verify current default behavior and potentially adjust

2. **Payment Status Tracking**
   - Appointment has `isPaid` boolean
   - Separate Transaction document tracks full payment details
   - Always check both for completeness

3. **Role Isolation**
   - Never allow doctor/user to see other users' data
   - Enforce role checks on all endpoints
   - Use `req.user.role` to validate access

4. **Audit Trail & Logging**
   - Admin actions should be logged for compliance
   - Consider adding audit collection for admin actions
   - Track who approved which doctor, when, etc.
