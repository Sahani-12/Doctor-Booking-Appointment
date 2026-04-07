# Data Flow Architecture - CareConnect System

## 🔄 Complete Data Flow with MongoDB

```
┌─────────────────────────────────────────────────┐
│                                                 │
│          🌐 THREE FRONTEND APPLICATIONS         │
│                                                 │
├────────────────┬────────────────┬───────────────┤
│                │                │               │
│  👨‍⚕️ Doctor App  │  👤 Patient App │ 👨‍💼 Admin Panel│
│  (React TS)    │  (React JS)    │ (React TS)    │
│                │                │               │
└────────┬───────┴────────┬───────┴───────┬───────┘
         │                │               │
         │ HTTP REST API  │ HTTP REST API │ HTTP REST API
         │                │               │
         └────────────────┼───────────────┘
                          │
                    ┌─────▼─────────────────┐
                    │                       │
                    │  🛠️  BACKEND SERVER   │
                    │  Express.js + Node.js │
                    │                       │
                    │  ✅ Auth Routes      │
                    │  ✅ User Routes      │
                    │  ✅ Doctor Routes    │
                    │  ✅ Admin Routes     │
                    │  ✅ Appointment      │
                    │  ✅ Payment Routes   │
                    │  ✅ Chat Routes      │
                    │  ✅ Video Routes     │
                    │                       │
                    └─────┬─────────────────┘
                          │
                    ┌─────▼──────────────┐
                    │                    │
                    │  🗄️  MONGODB 🔐   │
                    │  Database          │
                    │                    │
                    │  Collections:      │
                    │  • Users           │
                    │  • Doctors         │
                    │  • Appointments    │
                    │  • Transactions    │
                    │  • Documents       │
                    │  • Stories         │
                    │  • VideoSessions   │
                    │                    │
                    └────────────────────┘
```

---

## 📊 Data Collections & What Stores What

### 1. **Users Collection** (👤 Patient Data)

**Data Stored:**

- Patient profile info (name, email, age, gender, etc.)
- Medical history
- Appointments they booked
- Documents uploaded
- Payment records

**Access:**

- ✅ Patient App - Read/Update own profile
- ✅ Admin Panel - Read/Manage all users
- ✅ Doctor App - Read patient info (for appointments)

**Critical Field:** `role: "user"`

---

### 2. **Doctors Collection** (👨‍⚕️ Doctor Data)

**Data Stored:**

- Doctor profile (name, specialization, fees)
- Qualifications & certificates
- Experience level
- License number
- **`isApproved: Boolean` ⭐ CRITICAL FOR ADMIN**
- Appointments they accepted

**Access:**

- ✅ Doctor App - Read/Update own profile
- ✅ Patient App - Search doctors
- ✅ Admin Panel - **Approve/Reject doctors**

**Critical Field:** `isApproved: true/false`

---

### 3. **Appointments Collection** (📅 Booking Data)

**Data Stored:**

- Patient ID (reference)
- Doctor ID (reference)
- Appointment date & time
- Status (scheduled, completed, cancelled)
- Fees

**Access:**

- ✅ Patient App - Book & view appointments
- ✅ Doctor App - View & accept appointments
- ✅ Admin Panel - Monitor all appointments

---

### 4. **Transactions Collection** (💳 Payment Data)

**Data Stored:**

- Appointment ID (reference)
- Amount paid
- Payment method (Stripe, Razorpay, Demo)
- Status (completed, failed)
- Transaction ID

**Access:**

- ✅ Patient App - View payment history
- ✅ Doctor App - View earnings
- ✅ Admin Panel - **Track all revenue**

---

### 5. **Documents Collection** (📄 Medical Records)

**Data Stored:**

- User ID (reference)
- Document title
- File URL
- Upload date

**Access:**

- ✅ Patient App - Upload & manage docs
- ✅ Doctor App - View patient documents

---

### 6. **Stories Collection** (📖 Blog/Articles)

**Data Stored:**

- Article title
- Description
- Image URL

**Access:**

- ✅ All apps - Read-only

---

### 7. **VideoSessions Collection** (🎥 Consultations)

**Data Stored:**

- Appointment ID
- Patient & Doctor IDs
- Room ID (for video conference)
- Recording URL

**Access:**

- ✅ Patient & Doctor - Join video call
- ✅ Admin - Monitor sessions

---

## 🔄 Complete User Journey with Database

### 👤 **Patient Registration & Booking Flow**

```
1. PATIENT REGISTERS IN APP
   ↓
   POST /api/auth/register/user
   {
     fullname: "John Doe",
     email: "john@example.com",
     password: "hashed_password"
   }
   ↓
   ✅ NEW DOCUMENT CREATED IN users COLLECTION

2. PATIENT SEARCHES DOCTORS
   ↓
   GET /api/doctors?city=Mumbai&specialization=Cardiology
   ↓
   ✅ QUERY FETCHES FROM doctors COLLECTION
   ✅ ONLY SHOWS isApproved: true DOCTORS

3. PATIENT BOOKS APPOINTMENT
   ↓
   POST /api/appointments
   {
     patient: "patient_id",
     doctor: "doctor_id",
     appointmentDate: "2026-04-15",
     timeSlot: "10:00 AM",
     fees: 500
   }
   ↓
   ✅ NEW DOCUMENT CREATED IN appointments COLLECTION

4. PATIENT MAKES PAYMENT
   ↓
   POST /api/payments/create
   {
     appointment: "appointment_id",
     amount: 500,
     paymentMethod: "stripe"
   }
   ↓
   ✅ NEW DOCUMENT CREATED IN transactions COLLECTION

5. APPOINTMENT SCHEDULED
   ✅ User can see in Patient App
   ✅ Doctor can see in Doctor App
   ✅ Admin can monitor in Admin Panel
```

---

### 👨‍⚕️ **Doctor Registration & Approval Flow**

```
1. DOCTOR REGISTERS IN APP
   ↓
   POST /api/auth/register/doctor
   {
     fullname: "Dr. Smith",
     email: "dr@example.com",
     specialization: "Cardiology",
     qualification: "MBBS, MD",
     isApproved: false  ⭐
   }
   ↓
   ✅ NEW DOCUMENT CREATED IN doctors COLLECTION
   ✅ isApproved SET TO false (PENDING)

2. ADMIN SEES PENDING DOCTOR
   ↓
   GET /api/admin/doctors/pending
   ↓
   ✅ FETCHES ALL WHERE isApproved: false

3. ADMIN REVIEWS QUALIFICATIONS
   ✅ Views in Admin Panel
   ✅ Checks credentials, license, documents

4. ADMIN APPROVES DOCTOR
   ↓
   PUT /api/admin/doctors/:id/approve
   {
     status: "approved"
   }
   ↓
   ✅ doctors COLLECTION UPDATED: isApproved: true

5. DOCTOR ACTIVATED
   ✅ Doctor can now accept appointments
   ✅ Doctor appears in patient search
   ✅ Patients can book with doctor
```

---

### 👨‍💼 **Admin Panel Dashboard Flow**

```
ADMIN LOGS IN
   ↓
   POST /api/auth/admin-login
   ↓
   ✅ JWT TOKEN GENERATED

ADMIN VIEWS DASHBOARD
   ↓
   GET /api/admin/dashboard
   ↓
   QUERIES EXECUTE:

   1. SELECT COUNT(*) FROM users
      → displays: 150 total users

   2. SELECT COUNT(*) FROM doctors WHERE isApproved = true
      → displays: 45 approved doctors

   3. SELECT COUNT(*) FROM doctors WHERE isApproved = false
      → displays: 5 pending approvals

   4. SELECT COUNT(*) FROM appointments
      → displays: 320 total appointments

   5. SELECT SUM(amount) FROM transactions WHERE status = "completed"
      → displays: ₹150,000 total revenue

ADMIN REVIEWS PENDING DOCTORS
   ↓
   GET /api/admin/doctors/pending
   ↓
   ✅ FETCHES doctors WHERE isApproved = false

ADMIN APPROVES/REJECTS DOCTOR
   ↓
   PUT /api/admin/doctors/:id/approve
   {
     status: "approved" OR "rejected"
   }
   ↓
   ✅ doctors COLLECTION UPDATED

ADMIN VIEWS PAYMENTS
   ↓
   GET /api/admin/payments
   ↓
   ✅ DISPLAYS ALL transactions WITH status, amount, date
```

---

## 💾 Sample Data in MongoDB

### Sample User Document:

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  fullname: "John Doe",
  email: "john@example.com",
  password: "$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3hjLWd...", // hashed
  phone: "+91-9876543210",
  age: 30,
  gender: "Male",
  city: "Mumbai",
  role: "user",
  isVerified: false,
  bloodGroup: "O+",
  createdAt: ISODate("2026-03-01T10:00:00Z"),
  updatedAt: ISODate("2026-03-15T14:30:00Z")
}
```

### Sample Doctor Document:

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  fullname: "Dr. Rajesh Kumar",
  email: "dr.rajesh@example.com",
  password: "$2a$10$...", // hashed
  specialization: ["Cardiology", "Internal Medicine"],
  experience: 8,
  qualification: "MBBS, MD",
  licenseNumber: "MED2025001234",
  fee: 500,
  hospital: "Apollo Hospital",
  city: "Mumbai",
  isApproved: false,  // ⭐ PENDING APPROVAL
  role: "doctor",
  createdAt: ISODate("2026-03-10T10:00:00Z"),
  updatedAt: ISODate("2026-03-15T14:30:00Z")
}
```

### Sample Appointment Document:

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439013"),
  patient: ObjectId("507f1f77bcf86cd799439011"),  // Links to User
  doctor: ObjectId("507f1f77bcf86cd799439012"),   // Links to Doctor
  appointmentDate: ISODate("2026-04-15T10:00:00Z"),
  timeSlot: "10:00 AM",
  status: "scheduled",
  fees: 500,
  notes: "Annual checkup",
  createdAt: ISODate("2026-03-15T14:30:00Z"),
  updatedAt: ISODate("2026-03-15T14:30:00Z")
}
```

### Sample Transaction Document:

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439014"),
  appointment: ObjectId("507f1f77bcf86cd799439013"),  // Links to Appointment
  patient: ObjectId("507f1f77bcf86cd799439011"),      // Links to Patient
  amount: 500,
  status: "completed",
  paymentMethod: "stripe",
  transactionId: "pi_1A2B3C4D5E6F7G8H",
  createdAt: ISODate("2026-03-18T16:45:00Z"),
  updatedAt: ISODate("2026-03-18T16:45:00Z")
}
```

---

## 🔗 Relationship Diagram

```
User (Patient)
├── Created Through → /api/auth/register/user
├── Updated Through → /api/users/:id
├── Stores In → users collection
└── Referenced By:
    ├── Appointment.patient
    ├── Transaction.patient
    ├── Document.user
    └── VideoSession.patient

Doctor
├── Created Through → /api/auth/register/doctor
├── Approved By → Admin (PUT /api/admin/doctors/:id/approve)
├── Stores In → doctors collection
│   └── CRITICAL FIELD: isApproved (true/false)
└── Referenced By:
    ├── Appointment.doctor
    └── VideoSession.doctor

Appointment
├── Created By → Patient (POST /api/appointments)
├── References → Patient & Doctor
├── Stores In → appointments collection
└── Referenced By:
    ├── Transaction.appointment
    ├── VideoSession.appointment
    └── Admin monitoring

Transaction
├── Created By → Payment Service
├── References → Appointment & Patient
├── Stores In → transactions collection
└── Viewed By:
    ├── Patient (View receipts)
    ├── Doctor (View earnings)
    └── Admin (Track revenue)
```

---

## 📈 Data Growth Projections

```
After 1 Month:
├── Users: ~500
├── Doctors: ~50 (with 10 pending)
├── Appointments: ~800
└── Revenue: ~₹400,000

After 6 Months:
├── Users: ~5,000
├── Doctors: ~300 (with 20 pending)
├── Appointments: ~8,000
└── Revenue: ~₹4,000,000

After 1 Year:
├── Users: ~15,000
├── Doctors: ~800 (with 50 pending)
├── Appointments: ~25,000
└── Revenue: ~₹12,500,000
```

---

## ✅ Complete Data Verification

Test that everything works:

```bash
# 1. Backend running
curl http://localhost:3000

# 2. MongoDB connected
# Should see "MongoDB connected" in logs

# 3. Create test user
curl -X POST http://localhost:3000/api/auth/register/user \
  -H "Content-Type: application/json" \
  -d '{"fullname":"Test","email":"test@example.com","password":"test123"}'

# 4. Check in MongoDB
mongosh
> use careconnect
> db.users.find()

# 5. Admin login
curl -X POST http://localhost:3000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@careconnect.com","password":"admin123"}'

# 6. View dashboard stats
curl http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Summary

✅ **All 3 Apps** → All data flows to **MongoDB**  
✅ **Backend** → Manages all database operations  
✅ **Admin Panel** → Monitors & controls database  
✅ **Secure** → Passwords hashed, JWT secured  
✅ **Scalable** → MongoDB handles millions of records  
✅ **Real-time** → Dashboard syncs instantly

**Your complete healthcare platform is connected and ready!** 🚀
