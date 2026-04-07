# CareConnect System - Complete Folder Integration Map

## 📦 System Architecture Overview

```
CareConnect Multi-Application System
│
├── CareConnect-backend (Node.js/Express)
│   └── Shared API for all frontends
│
├── CareConnect-Admin (React - Admin Dashboard)
│   └── Connects to backend on port 3001
│
├── CareConnect-User-main (React - Patient App)
│   └── Connects to backend on port 3001
│
└── CareConnectDoctors-main (React - Doctor App)
    └── Connects to backend on port 3001
```

---

## 🔗 Folder Connections & Dependencies

### 1. Backend (CareConnect-backend) - The API Server

**Purpose**: Central API server handling all business logic
**Port**: 3001 (MUST be configured)
**Technology**: Node.js + Express + MongoDB

```
CareConnect-backend/
├── src/
│   ├── index.js                    # Entry point - Server setup
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── models/                     # Database schemas
│   │   ├── User.js                 # Patient users
│   │   ├── Doctor.js               # Doctor profiles
│   │   ├── Admin.js                # Admin data (in User model with role)
│   │   ├── Appointment.js          # Booking data
│   │   └── Transaction.js          # Payment records
│   ├── routes/
│   │   ├── auth.js                 # Auth endpoints (used by ALL apps)
│   │   ├── admin.js                # Admin-only endpoints ← ADMIN PANEL USES THIS
│   │   ├── doctors.js              # Doctor endpoints
│   │   ├── appointments.js         # Booking endpoints
│   │   └── user.js                 # User endpoints
│   ├── controllers/
│   │   ├── authController.js       # adminLogin() ← ADMIN FRONTEND CALLS THIS
│   │   ├── adminController.js      # Admin operations ← ADMIN FRONTEND CALLS THIS
│   │   ├── doctorController.js     # Doctor operations
│   │   └── userController.js       # User operations
│   └── middleware/
│       ├── auth.js                 # JWT validation (protect middleware)
│       └── authorize.js            # Role checking
└── .env                             # PORT=3001 ← CRITICAL CONFIG
```

**Environment Setup** (`.env` file):

```env
# Connection
MONGO_URI=mongodb+srv://username:password@cluster.com/careconnect
PORT=3001                              # ← MUST BE 3001 for admin panel
NODE_ENV=development

# Authentication
JWT_SECRET=your_secret_key_here_minimum_32_chars
TOKEN_EXPIRES_IN=7d

# Payment (Optional)
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=rzp_test_...
```

---

### 2. Admin Panel (CareConnect-Admin) - Management Dashboard

**Purpose**: Admin system for managing users, doctors, appointments
**Port**: 5173 (Vite dev server)
**Technology**: React 18 + TypeScript + Tailwind CSS

```
CareConnect-Admin/
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Root component with auth check
│   ├── context/
│   │   └── AuthContext.tsx         # Global auth state
│   │       └── login() ────────────→ POST /api/auth/admin-login
│   │       └── Stores: token, admin data
│   ├── hooks/
│   │   └── useAuth.ts              # Auth hook
│   ├── services/
│   │   └── apiService.ts           # API client
│   │       └── API calls to backend
│   │       ├── loginAdmin() ────────────→ POST /api/auth/admin-login
│   │       ├── getDashboard() ─────────→ GET /api/admin/dashboard
│   │       ├── getDoctors() ───────────→ GET /api/admin/doctors
│   │       ├── getUsers() ─────────────→ GET /api/admin/users
│   │       ├── approveDoctor() ────────→ PUT /api/admin/doctors/:id/approve
│   │       └── [more API methods]
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx           # ← Admin enters credentials here
│   │   │   └── Calls useAuth.login()
│   │   │   └── Calls POST /api/auth/admin-login
│   │   │   └── Redirects to Dashboard on success
│   │   │
│   │   ├── DashboardPage.tsx       # Main dashboard
│   │   │   └── Calls GET /api/admin/dashboard
│   │   │   └── Displays: Stats, Recent Activity
│   │   │
│   │   ├── DoctorsPage.tsx         # Doctor management
│   │   │   └── Calls GET /api/admin/doctors
│   │   │   └── Shows: All doctors, List, Search, Edit
│   │   │
│   │   ├── DoctorApprovalsPage.tsx # Doctor verification
│   │   │   └── Calls GET /api/admin/doctors/pending
│   │   │   └── Calls PUT /api/admin/doctors/:id/approve
│   │   │   └── Shows: Pending doctors for review
│   │   │
│   │   ├── UsersPage.tsx           # Patient management
│   │   │   └── Calls GET /api/admin/users
│   │   │   └── Shows: All patients, Profiles
│   │   │
│   │   ├── AppointmentsPage.tsx    # Booking management
│   │   │   └── Calls GET /api/admin/appointments
│   │   │   └── Shows: All bookings, Status, Details
│   │   │
│   │   ├── PaymentsPage.tsx        # Payment tracking
│   │   │   └── Calls GET /api/admin/payments
│   │   │   └── Shows: Transactions, Revenue
│   │   │
│   │   └── SettingsPage.tsx        # System settings
│   │       └── Platform configuration
│   │
│   ├── layout/
│   │   ├── Header.tsx              # Top navigation bar
│   │   │   └── Admin name, Logout button
│   │   │
│   │   └── Sidebar.tsx             # Left navigation menu
│   │       └── Links to all pages
│   │
│   └── routes.tsx                  # Route configuration
│       └── Protected routes
│       └── Redirects to login if no token
│
├── vite.config.ts                  # Dev server config
│   └── Proxy: /api → http://localhost:3001
│   └── Port: 5173
│
└── package.json
    └── Dependencies: axios, react-router-dom, tailwindcss
```

**Connection to Backend**:

```typescript
// In apiService.ts
const API_BASE_URL = "http://localhost:3001/api"
                     └─────────────────────────┘
                     Must match backend PORT!
```

---

### 3. Patient App (CareConnect-User-main) - Patient Interface

**Purpose**: App for patients to book appointments
**Port**: 5174 or auto (Vite)
**Technology**: React + JavaScript + Tailwind CSS

```
CareConnect-User-main/
└── Uses same backend API
    └── Different endpoints focus:
        ├── Auth: POST /api/auth/register/user, POST /api/auth/login
        ├── Doctors: GET /api/doctors (to search & filter)
        ├── Appointments: POST /api/appointments (to book)
        └── User: GET/PUT /api/users/:id (profile management)
```

---

### 4. Doctor App (CareConnectDoctors-main) - Doctor Interface

**Purpose**: App for doctors to manage their practice
**Port**: 5175 or auto (Vite)
**Technology**: React + TypeScript + Tailwind CSS

```
CareConnectDoctors-main/
└── Uses same backend API
    └── Different endpoints focus:
        ├── Auth: POST /api/auth/register/doctor, POST /api/auth/login
        ├── Doctors: GET/PUT /api/doctors/:id (profile)
        ├── Appointments: GET /api/appointments (view bookings)
        └── Services: Doctor-specific features
```

---

## 🔄 Authentication Flow (Admin Panel Focus)

```
┌───────────────────────────────────────────────────────────────┐
│ ADMIN LOGIN FLOW                                              │
└───────────────────────────────────────────────────────────────┘

1. USER OPENS ADMIN PANEL
   ↓
   http://localhost:5173

2. CHECK IF LOGGED IN
   ↓
   App.tsx checks: Is token in localStorage?
   ├─ YES → Show Dashboard Layout
   └─ NO → Show LoginPage

3. ADMIN ENTERS CREDENTIALS
   ↓
   LoginPage.tsx
   ├─ Email: admin@careconnect.com
   └─ Password: admin123

4. SUBMIT FORM
   ↓
   AuthContext.login(email, password)

5. API CALL
   ↓
   POST http://localhost:3001/api/auth/admin-login
   {
     "email": "admin@careconnect.com",
     "password": "admin123"
   }

6. BACKEND PROCESSING
   ↓
   Backend: src/controllers/authController.js
   └─ adminLogin() function:
      ├─ Find user with email AND role="admin"
      ├─ Compare password with bcrypt
      ├─ Generate JWT token
      └─ Return token + admin data

7. RESPONSE
   ↓
   {
     "success": true,
     "data": {
       "admin": {
         "id": "user_id",
         "name": "Admin Name",
         "email": "admin@careconnect.com",
         "role": "admin"
       },
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     }
   }

8. SAVE TOKEN
   ↓
   localStorage.setItem("adminToken", token)
   localStorage.setItem("admin", JSON.stringify(admin))

9. REDIRECT
   ↓
   Navigate to Dashboard (/)

10. LOAD DASHBOARD
    ↓
    DashboardPage.tsx
    GET http://localhost:3001/api/admin/dashboard
    Headers: Authorization: Bearer <token>

11. DISPLAY DATA
    ↓
    Show stats with users, doctors, appointments, revenue count
```

---

## 🔐 Token & Authorization Flow

```
Each Protected Request:

1. Frontend makes API call
2. apiService intercepts request
3. Attaches token to header:
   Authorization: Bearer <token>
4. Backend middleware (protect) receives request
5. Validates JWT token
6. Extract user ID from token
7. Load user from database
8. Check user role with authorize("admin")
9. If pass → Execute controller function
10. If fail → Return 403 Forbidden or 401 Unauthorized
```

---

## 📝 Required Configuration Files

### Backend .env

```env
# CRITICAL for Admin Panel to work
PORT=3001
MONGO_URI=mongodb+srv://username:password@cluster/careconnect
JWT_SECRET=your_secret_key_minimum_32_chars
TOKEN_EXPIRES_IN=7d
NODE_ENV=development
```

### Frontend (apiService.ts - Already Configured)

```typescript
const API_BASE_URL = "http://localhost:3001/api";
// This MUST match backend PORT
```

---

## ✅ Startup Sequence (IMPORTANT ORDER)

### Step 1: Start MongoDB

```bash
# Make sure MongoDB is running
# On Windows: MongoDB should auto-start or use MongoDB Compass/Atlas
```

### Step 2: Start Backend (Port 3001)

```bash
cd CareConnect-backend
npm install
npm start
# Wait for: "Server running on port 3001"
# AND: "MongoDB connected successfully"
```

### Step 3: Create Admin User

```bash
# While backend is running, in another terminal:
curl -X POST http://localhost:3001/api/auth/setup-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@careconnect.com", "password": "admin123", "fullname": "Admin"}'
```

### Step 4: Start Admin Frontend (Port 5173)

```bash
cd CareConnect-Admin
npm install
npm run dev
# Wait for: "Local:   http://localhost:5173"
```

### Step 5: Login to Admin Panel

```
Open: http://localhost:5173
Email: admin@careconnect.com
Password: admin123
```

---

## 🚨 Common Connection Issues

| Issue                     | Cause                | Solution                                          |
| ------------------------- | -------------------- | ------------------------------------------------- |
| "Cannot reach server"     | Backend not running  | Start backend: `npm start` in CareConnect-backend |
| "Connection refused 3001" | PORT not set in .env | Add `PORT=3001` to .env                           |
| CORS error                | Wrong API URL        | Check apiService.ts has correct baseURL           |
| Login blank response      | Backend crashed      | Check backend console for errors                  |
| Unauthorized after login  | Token not being sent | Check Authorization header in Network tab         |
| Admin doesn't exist       | Not created yet      | Run setup-admin curl command                      |
| Wrong port used           | PORT not 3001        | Update .env: PORT=3001                            |

---

## 📊 API Endpoint Map

### Authentication Endpoints

```
POST   /api/auth/admin-login          ← Admin login
POST   /api/auth/setup-admin          ← Create admin user (initial)
POST   /api/auth/register/doctor      ← Doctor signup
POST   /api/auth/register/user        ← Patient signup
POST   /api/auth/login                ← General login
GET    /api/auth/me                   ← Current user info
POST   /api/auth/logout               ← Logout (client-side)
```

### Admin Endpoints (Protected - Admin Role Required)

```
GET    /api/admin/dashboard           ← Stats
GET    /api/admin/users               ← Patients list
GET    /api/admin/doctors             ← Doctors list
GET    /api/admin/doctors/pending     ← Pending approvals
PUT    /api/admin/doctors/:id/approve ← Approve doctor
DELETE /api/admin/doctors/:id         ← Delete doctor
DELETE /api/admin/users/:id           ← Delete user
GET    /api/admin/appointments        ← Bookings list
GET    /api/admin/payments            ← Payment list
GET    /api/admin/settings            ← System settings
POST   /api/admin/settings            ← Update settings
```

---

## 📂 File Dependencies Summary

```
Frontend Login
      ↓
CareConnect-Admin/src/pages/LoginPage.tsx
      ↓
CareConnect-Admin/src/context/AuthContext.tsx (login function)
      ↓
CareConnect-Admin/src/services/apiService.ts (API call)
      ↓
Backend: POST /api/auth/admin-login
      ↓
CareConnect-backend/src/controllers/authController.js (adminLogin)
      ↓
Database: Check User collection for email with role="admin"
      ↓
Return Token
      ↓
Frontend stores in localStorage
      ↓
Display Dashboard
```

---

## 🎯 Quick Verification

After setup, verify everything works:

```bash
# 1. Backend running?
curl http://localhost:3001
# Should return: {"success": true, "message": "CareConnect Backend API running"}

# 2. Admin exists?
curl -X POST http://localhost:3001/api/auth/admin-login \
  -d '{"email": "admin@careconnect.com", "password": "admin123"}' \
  -H "Content-Type: application/json"
# Should return: token and admin data

# 3. Frontend running?
curl http://localhost:5173
# Should return: HTML page

# 4. Full login test?
# Open http://localhost:5173 in browser
# Try login
# Should see Dashboard with stats
```

---

## ✨ Summary

| Folder              | Purpose         | Port | Tech Stack   |
| ------------------- | --------------- | ---- | ------------ |
| CareConnect-backend | API Server      | 3001 | Node/Express |
| CareConnect-Admin   | Admin Dashboard | 5173 | React/TS     |
| CareConnect-User    | Patient App     | 5174 | React/JS     |
| CareConnectDoctors  | Doctor App      | 5175 | React/TS     |

**All frontends** → Connect to **backend on 3001**

---

## Status Report

✅ **Backend**: Fully configured with admin endpoints
✅ **Admin Frontend**: Fully configured for admin login
✅ **Integration**: Complete - all connections in place
✅ **Authentication**: JWT-based security implemented
✅ **Authorization**: Role-based access control working
✅ **Database**: Schema ready for admin operations

**Admin Panel is READY for use!**

See `ADMIN_QUICK_START_TESTING.md` for quick setup instructions.
