# CareConnect Admin Panel - Complete Integration Guide

## Overview

The CareConnect Admin Panel is fully integrated with the backend. This guide ensures login/signup works completely for the admin panel.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   CareConnect Admin Panel                   │
│                  (React/TypeScript - Port 5173)            │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/API Calls
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                CareConnect Backend API                      │
│                (Node.js/Express - Port 3001)               │
├─────────────────────────────────────────────────────────────┤
│ /api/auth/admin-login ────────► Admin Authentication       │
│ /api/admin/dashboard ─────────► Dashboard Stats            │
│ /api/admin/users ─────────────► User Management            │
│ /api/admin/doctors ───────────► Doctor Management          │
│ /api/admin/appointments ──────► Appointment Management     │
│ /api/admin/payments ──────────► Payment Management         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
            ┌─────────────────────────────┐
            │     MongoDB Database        │
            │  (Users, Doctors, Admin)    │
            └─────────────────────────────┘
```

---

## 2. Admin Authentication Flow

### Login Process

1. **Admin submits credentials** (email, password) at `/login` page
2. **Frontend validation** - Email and password checked
3. **API Request** - POST to `/api/auth/admin-login`
4. **Backend validation** - Checks if user exists with role "admin"
5. **Password verification** - Bcrypt compare password hash
6. **Token generation** - JWT token created (7 days expiry)
7. **Response** - Returns token and admin data
8. **Storage** - Token saved in localStorage
9. **Redirect** - User redirected to dashboard

### Key Components

```
Authentication Flow:
┌────────────────────────────────────────────────────┐
│   LoginPage (Frontend)                             │
│   - Email input                                    │
│   - Password input                                 │
│   - Form submission                                │
└─────────────────┬──────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────┐
│   AuthContext (Global State)                       │
│   - login() function                               │
│   - Fetch to /api/auth/admin-login                │
│   - Set token in localStorage                      │
└─────────────────┬──────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────┐
│   Backend: POST /api/auth/admin-login             │
│   - adminLogin() controller                        │
│   - Verify admin exists (role: "admin")          │
│   - Compare password with bcrypt                  │
│   - Generate JWT token                            │
│   - Return token + admin data                      │
└────────────────────────────────────────────────────┘
```

---

## 3. Current System Status

### ✅ Completed Components

#### Frontend (CareConnect-Admin)

- **Login Page** (`src/pages/LoginPage.tsx`)
  - Email and password inputs
  - Error handling and status messages
  - Loading state with spinner
  - Demo credentials display

- **Authentication Context** (`src/context/AuthContext.tsx`)
  - Token storage with localStorage
  - Admin data persistence
  - Login/logout functions
  - Auto-load on page refresh

- **Routes** (`src/routes.tsx`)
  - Protected routes with token check
  - Redirect to login if unauthorized
  - Layout with Sidebar + Header

- **API Service** (`src/services/apiService.ts`)
  - Axios instance with baseURL
  - Authorization token injection
  - Error handling (401 redirects to login)
  - Endpoints for all admin operations

- **Pages**
  - Dashboard
  - Doctors
  - Doctor Approvals
  - Users
  - Appointments
  - Payments
  - Settings

#### Backend (CareConnect-backend)

- **Auth Controller** (`src/controllers/authController.js`)
  - `adminLogin()` - Admin authentication
  - JWT token generation
  - Password hashing with bcrypt

- **Auth Routes** (`src/routes/auth.js`)
  - POST `/api/auth/admin-login`
  - POST `/api/auth/setup-admin` (initial setup)
  - Other auth endpoints

- **Admin Routes** (`src/routes/admin.js`)
  - GET `/api/admin/dashboard` - Dashboard stats
  - GET `/api/admin/users` - List users
  - GET `/api/admin/doctors` - List doctors
  - GET `/api/admin/doctors/pending` - Pending approvals
  - PUT `/api/admin/doctors/:id/approve` - Approve doctors
  - GET `/api/admin/appointments` - List appointments
  - GET `/api/admin/payments` - List payments

- **Admin Controller** (`src/controllers/adminController.js`)
  - Dashboard stats
  - User management
  - Doctor management
  - Appointment listing
  - Doctor approval system

- **Middleware**
  - `protect` - JWT authentication
  - `authorize("admin")` - Role-based access control

- **CORS Configuration**
  - Enabled for all origins
  - Credentials support enabled

---

## 4. Setup Instructions

### 4.1 Environment Setup

#### Backend (.env)

```bash
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/careconnect

# JWT
JWT_SECRET=your_secret_key_here
TOKEN_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# Optional APIs
STRIPE_SECRET_KEY=your_stripe_key
RAZORPAY_KEY_ID=your_razorpay_key
```

#### Frontend (.env)

```bash
# Already configured in apiService.ts
VITE_API_URL=https://doctor-booking-appointment-i137.onrender.com/api
```

### 4.2 Database Setup

#### Create Admin User (Initial Setup)

**Option 1: Using Setup Endpoint**

```bash
curl -X POST https://doctor-booking-appointment-i137.onrender.com/api/auth/setup-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@careconnect.com",
    "password": "admin123",
    "fullname": "Admin User"
  }'
```

**Option 2: Using Script** (`seedAdminUser.js`)

```bash
node seedAdminUser.js
```

### 4.3 Running the Application

**Terminal 1 - Backend**

```bash
cd CareConnect-backend
npm install
npm start
# Server runs on https://doctor-booking-appointment-i137.onrender.com
```

**Terminal 2 - Admin Frontend**

```bash
cd CareConnect-Admin
npm install
npm run dev
# Admin panel runs on http://localhost:5173
```

---

## 5. Testing Admin Login/Signup

### 5.1 Login Test

**URL**: `http://localhost:5173/login`

**Demo Credentials**:

```
Email: admin@careconnect.com
Password: admin123
```

**Expected Behavior**:

1. Enter credentials and click "Sign In"
2. Loading spinner appears
3. System validates against `/api/auth/admin-login`
4. Token stored in localStorage as `adminToken`
5. Admin data stored as `admin` JSON
6. Redirected to dashboard (`/`)

### 5.2 API Test

**Test Admin Login Endpoint**:

```bash
curl -X POST https://doctor-booking-appointment-i137.onrender.com/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@careconnect.com",
    "password": "admin123"
  }'
```

**Expected Response**:

```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "admin": {
      "id": "user_id",
      "name": "Admin User",
      "email": "admin@careconnect.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 5.3 Dashboard Access Test

**With Valid Token**:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  https://doctor-booking-appointment-i137.onrender.com/api/admin/dashboard
```

**Without Token**:

```bash
curl https://doctor-booking-appointment-i137.onrender.com/api/admin/dashboard
# Returns: 401 Unauthorized
```

---

## 6. Key Files Structure

```
CareConnect-Admin/
├── src/
│   ├── App.tsx              # Main app with auth check
│   ├── main.tsx             # Entry point
│   ├── context/
│   │   └── AuthContext.tsx  # Auth state management
│   ├── hooks/
│   │   └── useAuth.ts      # Auth hook
│   ├── pages/
│   │   ├── LoginPage.tsx   # Login UI
│   │   ├── DashboardPage.tsx
│   │   ├── DoctorsPage.tsx
│   │   ├── DoctorApprovalsPage.tsx
│   │   ├── UsersPage.tsx
│   │   ├── AppointmentsPage.tsx
│   │   ├── PaymentsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── layout/
│   │   ├── Header.tsx      # Top bar with logout
│   │   └── Sidebar.tsx     # Navigation menu
│   ├── routes.tsx          # Route configuration
│   ├── services/
│   │   └── apiService.ts   # API calls
│   └── utils/
├── vite.config.ts          # Dev server config
├── tailwind.config.js      # Styling
└── package.json            # Dependencies

CareConnect-backend/
├── src/
│   ├── index.js            # Server setup
│   ├── controllers/
│   │   ├── authController.js      # adminLogin function
│   │   └── adminController.js     # Admin operations
│   ├── routes/
│   │   ├── auth.js         # Auth endpoints
│   │   └── admin.js        # Admin endpoints
│   ├── middleware/
│   │   ├── auth.js         # JWT protect middleware
│   │   └── authorize.js    # Role-based authorize
│   ├── models/
│   │   ├── User.js         # User schema
│   │   └── Doctor.js       # Doctor schema
│   └── config/
│       └── db.js           # MongoDB connection
└── package.json
```

---

## 7. Important Endpoints Reference

### Authentication Endpoints

| Method | Endpoint                | Purpose              | Auth Required |
| ------ | ----------------------- | -------------------- | ------------- |
| POST   | `/api/auth/admin-login` | Admin login          | No            |
| POST   | `/api/auth/setup-admin` | Create admin user    | No (initial)  |
| GET    | `/api/auth/me`          | Get current user     | Yes           |
| POST   | `/api/auth/logout`      | Logout (client-side) | Yes           |

### Admin Dashboard Endpoints

| Method | Endpoint                         | Purpose                | Auth Required |
| ------ | -------------------------------- | ---------------------- | ------------- |
| GET    | `/api/admin/dashboard`           | Dashboard stats        | Yes           |
| GET    | `/api/admin/users`               | List all users         | Yes           |
| DELETE | `/api/admin/users/:id`           | Delete user            | Yes           |
| GET    | `/api/admin/doctors`             | List all doctors       | Yes           |
| GET    | `/api/admin/doctors/pending`     | List pending approvals | Yes           |
| PUT    | `/api/admin/doctors/:id/approve` | Approve/reject doctor  | Yes           |
| DELETE | `/api/admin/doctors/:id`         | Delete doctor          | Yes           |
| GET    | `/api/admin/appointments`        | List appointments      | Yes           |
| GET    | `/api/admin/payments`            | List payments          | Yes           |

---

## 8. Troubleshooting

### Issue 1: Login Returns "Invalid Credentials"

**Possible Causes**:

- Admin user doesn't exist in database
- Incorrect email or password
- MongoDB connection failed

**Solution**:

1. Verify MongoDB is running
2. Run `node seedAdminUser.js` or use setup endpoint
3. Check credentials match what's in database
4. Check `.env` file MONGO_URI is correct

### Issue 2: Token Not Being Saved

**Possible Causes**:

- localStorage disabled in browser
- CORS blocking the response

**Solution**:

1. Check browser console for CORS errors
2. Verify backend CORS config includes frontend origin
3. Check localStorage is enabled

### Issue 3: 401 Unauthorized on Protected Routes

**Possible Causes**:

- Token expired (7 days)
- Token not being sent in headers
- User doesn't have admin role

**Solution**:

1. Clear localStorage and login again
2. Verify Authorization header is set correctly
3. Check user role in database is "admin"

### Issue 4: CORS Errors

**Possible Causes**:

- Backend CORS not properly configured
- Frontend making requests to wrong URL

**Solution**:

1. Check backend `index.js` has `cors()` middleware
2. Verify frontend API URL is `https://doctor-booking-appointment-i137.onrender.com`
3. Ensure both services are running

### Issue 5: Dashboard Shows Empty Stats

**Possible Causes**:

- Admin doesn't have permission
- Backend endpoint failing silently
- Database query error

**Solution**:

1. Check browser console for errors
2. Test API directly with curl
3. Check backend logs for errors
4. Verify admin has role "admin" in database

---

## 9. Security Considerations

### ✅ Implemented

- Password hashing with bcrypt (10 salt rounds)
- JWT authentication with 7-day expiry
- Role-based authorization (admin role required)
- Token validation on protected routes
- CORS protection
- Secure token storage in localStorage

### ⚠️ Additional Recommendations

- Add password reset functionality
- Implement 2FA (Two-Factor Authentication)
- Add login audit logs
- Rate limiting on login attempts
- Refresh token mechanism
- Environment-based API URLs

---

## 10. Integration Checklist

- [x] Admin login page created
- [x] Authentication context setup
- [x] Backend adminLogin endpoint working
- [x] JWT token generation
- [x] Token storage in localStorage
- [x] Protected route implementation
- [x] CORS configured
- [x] Admin dashboard page created
- [x] Admin pages (doctors, users, appointments, payments)
- [x] Admin authorization middleware
- [x] Admin controller with all operations
- [x] Error handling and loading states
- [x] Logout functionality
- [x] Demo credentials

---

## 11. Quick Start Commands

```bash
# Setup Backend
cd CareConnect-backend
npm install
# Create .env with MONGO_URI and JWT_SECRET
npm start

# Setup Admin Frontend
cd CareConnect-Admin
npm install
npm run dev

# Create admin user (choose one)
# Option 1: Via API
curl -X POST https://doctor-booking-appointment-i137.onrender.com/api/auth/setup-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@careconnect.com", "password": "admin123", "fullname": "Admin"}'

# Option 2: Via script
cd CareConnect-backend
node seedAdminUser.js

# Access admin panel
# Open browser: http://localhost:5173
# Login with admin@careconnect.com / admin123
```

---

## 12. Next Steps

1. **Test the complete flow**:
   - Start backend server
   - Start admin frontend
   - Login with demo credentials
   - Verify dashboard loads

2. **Customize admin**:
   - Add your logo/branding
   - Customize dashboard stats
   - Add more admin pages as needed

3. **Security hardening**:
   - Implement password reset
   - Add 2FA/MFA
   - Setup audit logging
   - Add rate limiting

4. **Deployment**:
   - Build admin frontend: `npm run build`
   - Deploy to hosting platform
   - Use environment-specific API URLs
   - Setup SSL/HTTPS

---

## Support & Documentation

For more information:

- Backend routes: See `CareConnect-backend/src/routes/`
- Frontend components: See `CareConnect-Admin/src/pages/`
- API contracts: See endpoint responses in PostMan or similar tools
- Database schema: See `CareConnect-backend/src/models/`

**Admin Panel Status**: ✅ **FULLY INTEGRATED AND READY TO USE**
