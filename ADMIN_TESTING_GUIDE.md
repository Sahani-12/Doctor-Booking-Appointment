# 🧪 Admin Panel Testing Guide - Complete Step-by-Step

## 📋 Testing Checklist

```
✅ Backend Setup
✅ MongoDB Connection
✅ Admin Login
✅ Dashboard Stats
✅ Doctor Approval Workflow
✅ User Management
✅ Appointments Monitoring
✅ Payment Tracking
✅ All Features
```

---

## 🚀 Step 1: Start Everything (4 Terminals)

### Terminal 1: Start MongoDB

**Windows:**

```bash
# Check MongoDB is running
mongosh
# Should connect successfully
exit
```

**If MongoDB not running:**

```bash
# Start MongoDB service
net start MongoDB
```

**Verify connection:**

```bash
mongosh
> show databases
> use careconnect
> show collections
```

✅ **Should see:** careconnect database with collections

---

### Terminal 2: Start Backend

```bash
cd CareConnect-backend

# Install dependencies (if not done)
npm install

# Start server
npm start
```

✅ **Should see:**

```
✓ Server running on port 3000
✓ MongoDB connected
```

**Test backend is running:**

```bash
curl http://localhost:3000
# Should return JSON: { success: true, message: "CareConnect Backend API running" }
```

---

### Terminal 3: Start Admin Panel

```bash
cd CareConnect-Admin

# Install dependencies (if not done)
npm install

# Start dev server
npm run dev
```

✅ **Should see:**

```
✓ VITE v4.5.0 ready in XXX ms
✓ ➜ Local: http://localhost:5173
```

**Open in browser:** http://localhost:5173

---

### Terminal 4: Optional - Start One of Other Apps (To Generate Test Data)

```bash
# Option A: Patient App (to generate test bookings)
cd CareConnect-User-main
npm run dev
# Will run on http://localhost:5174

# Option B: Doctor App (to generate test doctor registrations)
cd CareConnectDoctors-main
npm run dev
# Will run on different port
```

---

## 🔐 Step 2: Test Admin Login

### Admin Login Page

**URL:** http://localhost:5173/login

**Use Credentials:**

```
Email: admin@careconnect.com
Password: admin123
```

**What Should Happen:**

1. ✅ Login form displays
2. ✅ Enter credentials
3. ✅ Click "Sign In"
4. ✅ Loading spinner shows
5. ✅ Redirects to dashboard
6. ✅ URL changes to http://localhost:5173/

### If Login Fails:

**Problem 1: "Invalid credentials"**

```bash
# Check if admin user exists in MongoDB
mongosh
> use careconnect
> db.users.findOne({ email: "admin@careconnect.com", role: "admin" })

# If no result, create admin
> db.users.insertOne({
    fullname: "Admin User",
    email: "admin@careconnect.com",
    password: "$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3hjLWd...",
    role: "admin",
    createdAt: new Date()
  })
```

**Problem 2: "Cannot reach backend"**

```bash
# Check backend is running
curl http://localhost:3000

# Check if backend shows "MongoDB connected"
# Re-run: npm start in backend folder
```

**Problem 3: "CORS error"**

```bash
# This means frontend blocked by backend CORS
# Check backend has cors enabled (should be in index.js)
```

---

## 📊 Step 3: Test Dashboard

### What You Should See

After successful login, dashboard shows:

```
📊 5 Stat Cards:
├── Total Users: [Number]
├── Total Doctors: [Number]
├── Pending Approvals: [Number]
├── Total Appointments: [Number]
└── Total Revenue: ₹[Number]

🎯 Quick Action Cards:
├── Review Doctor Approvals
├── Manage Users
├── Manage Doctors
└── View Payments
```

### Test Dashboard Data

**Click on each stat card and verify:**

1. **Total Users** - Should match count in database

   ```bash
   mongosh
   > db.users.countDocuments({ role: "user" })
   ```

2. **Total Doctors** - Should match approved doctors

   ```bash
   mongosh
   > db.doctors.countDocuments({ isApproved: true })
   ```

3. **Pending Approvals** - Should show pending doctors

   ```bash
   mongosh
   > db.doctors.countDocuments({ isApproved: false })
   ```

4. **Total Appointments** - Should match appointments count

   ```bash
   mongosh
   > db.appointments.countDocuments()
   ```

5. **Total Revenue** - Should match completed transactions
   ```bash
   mongosh
   > db.transactions.aggregate([
       { $match: { status: "completed" } },
       { $group: { _id: null, total: { $sum: "$amount" } } }
     ])
   ```

✅ **All numbers should match!**

---

## 👨‍⚕️ Step 4: Test Doctor Approval Workflow (MOST IMPORTANT)

### Part 1: Create Test Data

**Option A: Register a test doctor**

1. Open Doctor App: http://localhost:5173 (if running)
2. Click "Register as Doctor"
3. Fill form:
   ```
   Name: Dr. Test Kumar
   Email: drtest@example.com
   Specialization: Cardiology
   Experience: 5 years
   Qualification: MBBS, MD
   License: LIC123456
   Fee: 500
   ```
4. Submit
5. ✅ Doctor registered with `isApproved: false`

**Option B: Manually create test doctor in MongoDB**

```bash
mongosh
> use careconnect
> db.doctors.insertOne({
    fullname: "Dr. Test Kumar",
    email: "drtest@example.com",
    specialization: ["Cardiology"],
    experience: 5,
    qualification: "MBBS, MD",
    licenseNumber: "LIC123456",
    fee: 500,
    hospital: "City Hospital",
    isApproved: false,
    role: "doctor",
    createdAt: new Date(),
    updatedAt: new Date()
  })
```

### Part 2: Check Admin Panel

1. **Go to Admin Dashboard**
   - You should see "Pending Approvals: 1" (or more)

2. **Click "Review Doctor Approvals" button**
   - URL: http://localhost:5173/doctor-approvals
   - ✅ Should see pending doctor card

3. **Verify Doctor Details Show:**
   - ✅ Doctor name
   - ✅ Email
   - ✅ Specialization
   - ✅ Experience
   - ✅ Qualification
   - ✅ License number
   - ✅ Hospital name
   - ✅ Status: "Pending"

### Part 3: Approve Doctor

1. **Click "Approve" Button**
   - Should see loading spinner
   - Button disabled temporarily
   - ✅ Should complete after 1-2 seconds

2. **Verify Approval**

   ```bash
   mongosh
   > db.doctors.findOne({ email: "drtest@example.com" })

   # Should show: isApproved: true ✅
   ```

3. **Check Dashboard**
   - "Pending Approvals" should decrease
   - "Total Doctors" should increase

### Part 4: Test Rejection

1. **Create another test doctor**

   ```bash
   mongosh
   > db.doctors.insertOne({
       fullname: "Dr. Reject Test",
       email: "drreject@example.com",
       specialization: ["Surgery"],
       experience: 1,
       qualification: "MBBS only",
       isApproved: false,
       role: "doctor",
       createdAt: new Date()
     })
   ```

2. **Go to Doctor Approvals page**
   - Should see new pending doctor

3. **Click "Reject" Button**
   - Should update status

---

## 👤 Step 5: Test User Management

### Navigate to Users

**URL:** http://localhost:5173/users

### What You Should See

1. **Table with columns:**
   - Name
   - Email
   - Phone
   - Age
   - Blood Group
   - Actions (Delete button)

2. **Search functionality:**
   - Type a patient name
   - Should filter list

3. **Test Search:**
   ```
   Search for: "john" or any patient name
   ✅ Should show only matching users
   ```

### Test Delete User

1. **Create test user:**

   ```bash
   mongosh
   > db.users.insertOne({
       fullname: "TestUser123",
       email: "testuser@example.com",
       phone: "9999999999",
       age: 25,
       bloodGroup: "O+",
       role: "user",
       createdAt: new Date()
     })
   ```

2. **In Admin Panel:**
   - Find the test user
   - Click delete icon (trash can)
   - Confirm deletion (popup)
   - ✅ User should disappear from list

3. **Verify in MongoDB:**
   ```bash
   mongosh
   > db.users.findOne({ email: "testuser@example.com" })
   # Should return: null (deleted)
   ```

---

## 📅 Step 6: Test Appointment Monitoring

### Navigate to Appointments

**URL:** http://localhost:5173/appointments

### What You Should See

**Table with columns:**

- Patient Name
- Doctor Name
- Date
- Time
- Status (color-coded)
- Fees

### Generate Test Appointment Data

```bash
mongosh
> use careconnect

# Get a user and doctor ID
> const user = db.users.findOne({ role: "user" })
> const doctor = db.doctors.findOne({ isApproved: true })

# Create appointment
> db.appointments.insertOne({
    patient: user._id,
    doctor: doctor._id,
    appointmentDate: new Date("2026-04-15"),
    timeSlot: "10:00 AM",
    status: "scheduled",
    fees: 500,
    createdAt: new Date()
  })
```

### Verify in Admin Panel

1. **Refresh or revisit:**
   - http://localhost:5173/appointments

2. ✅ **Should show new appointment:**
   - Patient name
   - Doctor name
   - Correct date
   - Status "scheduled" (blue badge)
   - Fees: 500

---

## 💳 Step 7: Test Payment Tracking

### Navigate to Payments

**URL:** http://localhost:5173/payments

### What You Should See

**Table with columns:**

- Patient Name
- Amount
- Payment Method
- Status
- Date

**Top shows:** "Total Revenue: ₹[Amount]"

### Generate Test Payment

```bash
mongosh
> use careconnect

# Get appointment and user ID
> const apt = db.appointments.findOne()
> const user = db.users.findOne({ role: "user" })

# Create transaction
> db.transactions.insertOne({
    appointment: apt._id,
    patient: user._id,
    amount: 500,
    status: "completed",
    paymentMethod: "stripe",
    transactionId: "pi_test123",
    createdAt: new Date()
  })
```

### Verify in Admin Panel

1. **Refresh page:**
   - http://localhost:5173/payments

2. ✅ **Should show:**
   - Patient name
   - Amount: 500
   - Payment Method: stripe
   - Status: completed (green badge)
   - Total Revenue increased

---

## 🔧 Step 8: Test Doctors Management

### Navigate to Doctors

**URL:** http://localhost:5173/doctors

### What You Should See

**Table with columns:**

- Name
- Email
- Specialization
- Experience
- Status (approved/pending/rejected)
- Actions (Delete)

### Test Search

```
Search: "cardiology" or doctor name
✅ Should filter doctors
```

### Test Delete Doctor

1. **Go to Doctors page**
2. **Find a test doctor**
3. **Click delete button**
4. **Confirm action**
5. ✅ **Doctor removed from list**

---

## 🎨 Step 9: Test UI Features

### Test Dark Mode

1. **Click moon/sun icon** in header
2. ✅ **UI should toggle theme**
3. ✅ **Colors should change accordingly**

### Test Responsive Design

1. **Resize browser window:**
   - Desktop: 1920px
   - Tablet: 768px
   - Mobile: 375px

2. ✅ **All pages should work on each size**

### Test Navigation

1. **Click each sidebar item:**
   - Dashboard
   - Doctor Approvals
   - Doctors
   - Users
   - Appointments
   - Payments
   - Settings

2. ✅ **Each page should load**

### Test Logout

1. **Click "Logout" button** in header
2. ✅ **Should redirect to login page**
3. ✅ **Token should be cleared**

---

## 🔍 Step 10: Test API Endpoints (Using CURL)

### Step 1: Get Admin Token

```bash
curl -X POST http://localhost:3000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@careconnect.com",
    "password": "admin123"
  }'
```

**Response should look like:**

```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "admin": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Admin User",
      "email": "admin@careconnect.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token:** `your_token_here`

### Step 2: Test Dashboard Endpoint

```bash
curl http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalDoctors": 45,
    "pendingDoctors": 5,
    "totalAppointments": 320,
    "totalRevenue": 150000
  }
}
```

✅ **If you see JSON data, API is working!**

### Step 3: Test Get Pending Doctors

```bash
curl http://localhost:3000/api/admin/doctors/pending \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "fullname": "Dr. Test",
      "email": "drtest@example.com",
      "isApproved": false,
      ...
    }
  ]
}
```

### Step 4: Test Approve Doctor

```bash
curl -X PUT http://localhost:3000/api/admin/doctors/DOCTOR_ID/approve \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{ "isApproved": true }'
```

✅ **Doctor should be approved**

### Step 5: Test Get All Users

```bash
curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

✅ **Should return list of users**

### Step 6: Test Get Appointments

```bash
curl http://localhost:3000/api/admin/appointments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

✅ **Should return list of appointments**

### Step 7: Test Get Payments

```bash
curl http://localhost:3000/api/admin/payments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

✅ **Should return list of transactions**

---

## 📊 Step 11: Verify Database Syncing

### Check That All Data Is In MongoDB

```bash
mongosh
> use careconnect

# Show all collections
> show collections

# Count documents in each
> db.users.countDocuments()
> db.doctors.countDocuments()
> db.appointments.countDocuments()
> db.transactions.countDocuments()

# View sample data
> db.doctors.findOne({ isApproved: false })
> db.appointments.findOne()
> db.transactions.findOne()
```

✅ **Everything should appear in MongoDB!**

---

## 🎯 Complete Testing Checklist

Print this out and check off as you go:

```
✅ SETUP
  □ MongoDB running
  □ Backend running on port 3000
  □ Admin panel running on port 5173

✅ AUTHENTICATION
  □ Admin login works
  □ Dashboard loads after login
  □ Logout works
  □ Redirects to login when not authenticated

✅ DASHBOARD
  □ Total Users shows correct count
  □ Total Doctors shows correct count
  □ Pending Approvals shows correct count
  □ Total Appointments shows correct count
  □ Total Revenue shows correct amount
  □ Quick action buttons work

✅ DOCTOR APPROVALS (⭐ CRITICAL)
  □ Can view pending doctors
  □ Doctor details display correctly
  □ Approve button works
  □ Doctor status updates in DB
  □ Reject button works
  □ Pending count updates

✅ USER MANAGEMENT
  □ Can view all users
  □ Search filters users
  □ Can delete users
  □ Users removed from DB

✅ DOCTOR MANAGEMENT
  □ Can view all doctors
  □ Search filters doctors
  □ Status shows correctly
  □ Can delete doctors

✅ APPOINTMENT MONITORING
  □ Can view all appointments
  □ Patient names show
  □ Doctor names show
  □ Dates display correctly
  □ Status shows with colors

✅ PAYMENT TRACKING
  □ Can view all payments
  □ Total revenue shows
  □ Payment methods show
  □ Status shows correctly

✅ UI/UX
  □ Dark mode works
  □ Responsive on mobile
  □ Responsive on tablet
  □ Responsive on desktop
  □ Navigation works
  □ Loading states show
  □ Error messages show

✅ API ENDPOINTS
  □ Admin login returns token
  □ Dashboard endpoint works
  □ Pending doctors endpoint works
  □ All users endpoint works
  □ All doctors endpoint works
  □ All appointments endpoint works
  □ All payments endpoint works

✅ DATABASE
  □ Users in MongoDB
  □ Doctors in MongoDB
  □ Appointments in MongoDB
  □ Transactions in MongoDB
  □ All data synced correctly
```

---

## 🚨 Common Issues & Fixes

### Issue 1: "Cannot GET /api/admin/dashboard"

**Fix:**

```bash
# Backend not running
cd CareConnect-backend
npm start
```

### Issue 2: Dashboard shows 0 for all stats

**Fix:**

```bash
# No test data in MongoDB
# Create some test data manually using MongoDB examples above
```

### Issue 3: Login button doesn't work

**Fix:**

```bash
# Check browser console (F12)
# Check network tab to see API response
# Verify backend is returning token
```

### Issue 4: Pending doctors not showing up

**Fix:**

```bash
# Create test doctor with isApproved: false
mongosh
> db.doctors.insertOne({ isApproved: false, ... })
```

### Issue 5: "MongoDB connected" not showing

**Fix:**

```bash
# MongoDB service not running
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

---

## 📈 Test Data Generation Script

**Save as `seed.js` in backend root:**

```javascript
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./src/models/User");
const Doctor = require("./src/models/Doctor");
const Appointment = require("./src/models/Appointment");
const Transaction = require("./src/models/Transaction");

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Create test user
    const user = await User.create({
      fullname: "Test User",
      email: "testuser@example.com",
      password: "hashed_password",
      role: "user",
      age: 30,
      bloodGroup: "O+",
    });
    console.log("✓ User created");

    // Create test doctor (pending)
    const doctor = await Doctor.create({
      fullname: "Dr. Test",
      email: "drtest@example.com",
      password: "hashed_password",
      specialization: ["Cardiology"],
      experience: 5,
      isApproved: false,
      role: "doctor",
    });
    console.log("✓ Pending Doctor created");

    // Create appointment
    const appointment = await Appointment.create({
      patient: user._id,
      doctor: doctor._id,
      appointmentDate: new Date("2026-04-15"),
      timeSlot: "10:00 AM",
      status: "scheduled",
      fees: 500,
    });
    console.log("✓ Appointment created");

    // Create transaction
    const transaction = await Transaction.create({
      appointment: appointment._id,
      patient: user._id,
      amount: 500,
      status: "completed",
      paymentMethod: "stripe",
    });
    console.log("✓ Transaction created");

    console.log("✓ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

seedDatabase();
```

**Run it:**

```bash
node seed.js
```

---

## ✅ Success Indicators

**Your testing is successful when:**

✅ All pages load without errors  
✅ Dashboard shows real numbers  
✅ Doctor approval works  
✅ Data persists in MongoDB  
✅ API endpoints respond  
✅ UI is responsive  
✅ Dark mode works  
✅ Search filtering works  
✅ Delete operations work  
✅ No console errors

---

**You're ready to test!** 🚀
