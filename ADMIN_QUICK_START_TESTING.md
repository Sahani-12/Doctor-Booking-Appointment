# Admin Panel - Quick Setup & Testing Guide

## 🚀 5-Minute Quick Start

### Step 1: Backend Setup (2 minutes)

```bash
cd CareConnect-backend

# Install dependencies
npm install

# Create .env file with these values:
echo "MONGO_URI=mongodb://localhost:27017/careconnect" > .env
echo "JWT_SECRET=your_secret_key_12345" >> .env
echo "TOKEN_EXPIRES_IN=7d" >> .env
echo "PORT=3001" >> .env
echo "NODE_ENV=development" >> .env

# Ensure MongoDB is running
# Then start backend
npm start
```

**Expected Output**:

```
Server running on port 3001 in development mode
MongoDB connected successfully
```

### Step 2: Create Admin User (1 minute)

```bash
# Option A: Using Setup API
curl -X POST https://doctor-booking-appointment-i137.onrender.com/api/auth/setup-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@careconnect.com",
    "password": "admin123",
    "fullname": "Admin User"
  }'

# Response should be:
# {"success": true, "message": "Admin setup successful", "data": {...}}
```

### Step 3: Frontend Setup (2 minutes)

```bash
cd CareConnect-Admin

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected Output**:

```
  VITE v4.5.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 4: Test Login (1 minute)

1. Open browser: `http://localhost:5173`
2. You'll be redirected to `/login`
3. Enter credentials:
   - Email: `admin@careconnect.com`
   - Password: `admin123`
4. Click "Sign In"
5. Should see dashboard with stats

---

## ✅ Manual Testing Checklist

### Test 1: Login with Valid Credentials

```bash
✓ Navigate to http://localhost:5173/login
✓ Enter admin@careconnect.com
✓ Enter admin123
✓ Click Sign In
✓ Verify redirect to dashboard
✓ Check browser console - no errors
✓ Check localStorage for adminToken
```

### Test 2: Login with Invalid Credentials

```bash
✓ Navigate to http://localhost:5173/login
✓ Enter wrong-email@test.com
✓ Enter wrongpassword
✓ Click Sign In
✓ Verify error message displayed
✓ Should stay on login page
```

### Test 3: Protected Route Access

```bash
✓ Login successfully
✓ Navigate to http://localhost:5173/doctors
✓ Should see doctors list
✓ Logout button appears in header
```

### Test 4: Logout Functionality

```bash
✓ Click logout button in header
✓ Should redirect to /login
✓ localStorage should be cleared
✓ Manually navigating to / should redirect to /login
```

### Test 5: Token Persistence

```bash
✓ Login successfully
✓ Refresh page (F5)
✓ Should stay logged in (no redirect to /login)
✓ Dashboard data should load
```

### Test 6: Dashboard Stats

```bash
✓ Dashboard page loads
✓ 5 stat cards visible:
   - Total Users
   - Total Doctors
   - Pending Doctors
   - Total Appointments
   - Total Revenue
✓ No error messages
✓ Stats display valid numbers
```

---

## 🔧 API Testing with Curl

### Test Admin Login Endpoint

```bash
# Test login
curl -X POST https://doctor-booking-appointment-i137.onrender.com/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@careconnect.com",
    "password": "admin123"
  }'

# Response:
# {"success": true, "message": "Admin login successful", "data": {"admin": {...}, "token": "..."}}
```

### Test Protected Dashboard Endpoint

```bash
# First get token from login
TOKEN=$(curl -s -X POST https://doctor-booking-appointment-i137.onrender.com/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@careconnect.com", "password": "admin123"}' \
  | jq -r '.data.token')

# Then access protected endpoint
curl -X GET https://doctor-booking-appointment-i137.onrender.com/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"

# Response:
# {"success": true, "data": {"totalUsers": 0, "totalDoctors": 0, ...}}
```

### Test Without Token (Should Fail)

```bash
curl -X GET https://doctor-booking-appointment-i137.onrender.com/api/admin/dashboard

# Response:
# 401 - Not authorized, no token
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Login failed" Error

**Problem**: Error message when trying to login
**Solution**:

```bash
# Check if admin user exists in MongoDB
# Connect to MongoDB:
mongo mongodb://localhost:27017/careconnect

# Run in MongoDB shell:
db.users.find({email: "admin@careconnect.com", role: "admin"})

# If no results, create admin:
curl -X POST https://doctor-booking-appointment-i137.onrender.com/api/auth/setup-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@careconnect.com", "password": "admin123", "fullname": "Admin"}'
```

### Issue 2: Dashboard Shows Empty Stats

**Problem**: All stat cards show 0
**Solution**:

```bash
# 1. Check MongoDB connection
# 2. Check backend logs for errors
# 3. Verify database has collections:

# In MongoDB shell:
db.collections()  # Should show: users, doctors, appointments, transactions

# 4. Check if token is being sent correctly
# Open browser DevTools → Network tab
# Check admin/dashboard request headers for: "Authorization: Bearer ..."
```

### Issue 3: CORS Error in Console

**Problem**: "Access to XMLHttpRequest blocked by CORS policy"
**Solution**:

```bash
# Backend already has CORS enabled, but verify in src/index.js:
# Check line: app.use(cors({ origin: true, credentials: true }));

# If still failing, restart backend after checking CORS
npm start
```

### Issue 4: "Token failed" Error

**Problem**: JWT token not being validated
**Solution**:

```bash
# Check .env JWT_SECRET matches on both:
# 1. Backend .env
# 2. Used in token generation (src/controllers/authController.js)

# Verify token is correct format in localStorage:
# Open browser DevTools → Application → localStorage
# Look for: adminToken (should be long string starting with eyJ...)

# If corrupted, clear and re-login:
localStorage.removeItem('adminToken')
# Then login again
```

### Issue 5: Port Already in Use

**Problem**: "Port 3001 already in use" or "Port 5173 already in use"
**Solution**:

```bash
# Kill process using port 3001 (Windows)
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or change port in .env
PORT=4001

# For frontend, Vite will auto-use next available port
```

---

## 📊 Database Schema Verification

### Expected MongoDB Collections

#### Users Collection (with admin role)

```json
{
  "_id": ObjectId("..."),
  "fullname": "Admin User",
  "email": "admin@careconnect.com",
  "password": "$2a$10$...", // bcrypt hash
  "role": "admin",          // This is IMPORTANT
  "isVerified": true,
  "createdAt": ISODate("2024-01-01T00:00:00Z"),
  "updatedAt": ISODate("2024-01-01T00:00:00Z")
}
```

#### Check Admin User Exists

```bash
# In MongoDB shell
use careconnect
db.users.findOne({email: "admin@careconnect.com"})

# Should return user document with role: "admin"
```

---

## 🔐 Security Checklist

- [x] Passwords are hashed with bcrypt
- [x] JWT tokens have expiration (7 days)
- [x] Protected routes check for valid token
- [x] Admin role is required for admin endpoints
- [x] CORS is enabled with proper headers
- [x] Token stored in localStorage (not perfect, but acceptable)

**Optional Improvements**:

- [ ] Use `HttpOnly` cookies instead of localStorage
- [ ] Implement refresh token mechanism
- [ ] Add login attempt rate limiting
- [ ] Add audit logging for admin actions
- [ ] Implement 2FA/MFA for admin accounts

---

## 📁 Key Files to Know

| File                                                    | Purpose               |
| ------------------------------------------------------- | --------------------- |
| `CareConnect-Admin/src/pages/LoginPage.tsx`             | Admin login form      |
| `CareConnect-Admin/src/context/AuthContext.tsx`         | Auth state management |
| `CareConnect-Admin/src/services/apiService.ts`          | API client            |
| `CareConnect-backend/src/routes/auth.js`                | Auth endpoints        |
| `CareConnect-backend/src/controllers/authController.js` | adminLogin logic      |
| `CareConnect-backend/src/middleware/auth.js`            | JWT validation        |
| `CareConnect-backend/src/middleware/authorize.js`       | Role checking         |

---

## 🎯 Expected Workflow

```
User Opens http://localhost:5173
        ↓
Is token in localStorage?
├─ YES → Load Dashboard
└─ NO → Redirect to /login

User enters credentials & clicks Sign In
        ↓
Frontend validates inputs
        ↓
POST to /api/auth/admin-login
        ↓
Backend finds user with role="admin"
        ↓
Verify password with bcrypt
        ↓
Generate JWT token
        ↓
Return token to frontend
        ↓
Frontend stores in localStorage
        ↓
Redirect to Dashboard
        ↓
All future API calls include Authorization header with token
        ↓
Backend validates token before responding
        ↓
If invalid/expired → 401 → Frontend clears token & redirects to login
```

---

## 📞 Support Commands

```bash
# Check if backend is running
curl https://doctor-booking-appointment-i137.onrender.com

# Check if frontend is running
curl http://localhost:5173

# View backend logs
# (depends on how you started - should be visible in terminal)

# View frontend logs
# Open browser DevTools → Console tab

# Test database connection
mongo mongodb://localhost:27017/careconnect

# Kill background processes
# If anything is stuck, check Task Manager or Activity Monitor
```

---

## ✨ What's Included

✅ Complete admin authentication system
✅ JWT token-based security
✅ Role-based access control
✅ Protected admin routes
✅ Dashboard with statistics
✅ Admin pages (Users, Doctors, Appointments, etc.)
✅ Logout functionality
✅ Token persistence
✅ Error handling
✅ Loading states
✅ Responsive UI with Tailwind CSS

---

## 🎓 Learning Resources

For understanding the authentication flow better:

- JWT Guide: https://jwt.io
- Express Middleware: https://expressjs.com/guide/using-middleware.html
- React Context API: https://react.dev/reference/react/useContext
- Bcrypt: https://en.wikipedia.org/wiki/Bcrypt

---

## Status

**Admin Panel Authentication**: ✅ **FULLY FUNCTIONAL**

Your admin panel is **completely integrated** with the backend and ready to use!

Just follow the Quick Start guide above to get it running.

---

**Last Updated**: April 2, 2026
**Version**: 1.0.0
