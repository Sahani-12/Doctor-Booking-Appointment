# Admin Panel - Action Checklist & Setup Verification

## Pre-Startup Checklist

### ✅ Prerequisites

- [ ] Node.js installed (v14+)
- [ ] npm installed
- [ ] MongoDB installed or MongoDB Atlas account ready
- [ ] Git (optional, for version control)
- [ ] VS Code or preferred code editor

### ✅ Environment Files

- [ ] Backend .env created with:
  ```
  MONGO_URI=your_mongodb_url
  PORT=3001
  JWT_SECRET=your_secret_key
  TOKEN_EXPIRES_IN=7d
  NODE_ENV=development
  ```
- [ ] Frontend API URL configured (apiService.ts)
  ```
  API_BASE_URL = "https://doctor-booking-appointment-i137.onrender.com/api"
  ```

### ✅ Dependencies

- [ ] Run `npm install` in CareConnect-backend
- [ ] Run `npm install` in CareConnect-Admin
- [ ] All packages installed successfully (no errors)

---

## Step-by-Step Setup Instructions

### 1️⃣ Start Backend Server

**Location**: `CareConnect-backend` folder

```bash
# Navigate to backend folder
cd CareConnect-backend

# Verify .env file exists
# Should contain: MONGO_URI, PORT=3001, JWT_SECRET

# Check if MongoDB is accessible
# (Test MONGO_URI if using Atlas)

# Start the backend
npm start

# ✅ Expected output:
# √ Server running on port 3001 in development mode
# √ MongoDB connected successfully
# √ All routes registered
```

**Verification**:

```bash
# In another terminal, test backend is running:
curl https://doctor-booking-appointment-i137.onrender.com

# Expected response:
# {"success": true, "message": "CareConnect Backend API running", "version": "1.0.0"}
```

**Troubleshooting Backend**:

- [ ] Port 3001 already in use? Change PORT in .env to 4001
- [ ] MongoDB connection error? Check MONGO_URI in .env
- [ ] Module not found? Run `npm install` again
- [ ] Check backend console for any error messages

✅ **Only proceed to step 2 after backend is running!**

---

### 2️⃣ Create Admin User

**While backend is running**, create the admin account:

```bash
# Option A: Using curl (Windows/Mac/Linux)
curl -X POST https://doctor-booking-appointment-i137.onrender.com/api/auth/setup-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@careconnect.com", "password": "admin123", "fullname": "Admin"}'

# ✅ Expected response:
# {"success": true, "message": "Admin setup successful", "data": {"token": "...", "admin": {...}}}
```

**Verification - Check if admin was created**:

```bash
# Try to login with the credentials
curl -X POST https://doctor-booking-appointment-i137.onrender.com/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@careconnect.com", "password": "admin123"}'

# ✅ Expected response:
# {"success": true, "message": "Admin login successful", "data": {"token": "...", "admin": {...}}}
```

**Troubleshooting Admin Creation**:

- [ ] Getting error response? Check backend logs
- [ ] User already exists? Try different email
- [ ] MONGO_URI wrong? Backend should show error
- [ ] Can't connect to backend? Is backend running on 3001?

✅ **Only proceed to step 3 after admin is created!**

---

### 3️⃣ Start Admin Frontend

**Location**: `CareConnect-Admin` folder

**In a new terminal**:

```bash
# Navigate to admin frontend folder
cd CareConnect-Admin

# Verify node_modules exists (from npm install)
# If not, run: npm install

# Start the development server
npm run dev

# ✅ Expected output:
# VITE v4.5.0  ready in 500 ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

**Verification**:

```bash
# In another terminal:
curl http://localhost:5173

# Should return HTML (admin panel page)
```

**Troubleshooting Frontend**:

- [ ] Port 5173 already in use? Vite will use next available (5174, 5175...)
- [ ] Module not found? Run `npm install` again
- [ ] Build errors? Check console for details
- [ ] Hot reload not working? Try stopping and restarting

✅ **Proceed to step 4 after frontend starts!**

---

### 4️⃣ Test Admin Login

**Open browser**: `http://localhost:5173`

You should see:

- [ ] CareConnect logo
- [ ] "Admin Panel" subtitle
- [ ] Email input field
- [ ] Password input field
- [ ] "Sign In" button
- [ ] Demo credentials info box

**Enter Credentials**:

- [ ] Email: `admin@careconnect.com`
- [ ] Password: `admin123`

**Click Sign In**:

- [ ] Loading spinner appears
- [ ] No error message
- [ ] Page redirects to dashboard
- [ ] Sidebar appears with menu items
- [ ] Header shows "Welcome, Anand"

**Dashboard Should Display**:

- [ ] Total Users (number)
- [ ] Total Doctors (number)
- [ ] Pending Doctors (number)
- [ ] Total Appointments (number)
- [ ] Total Revenue (amount)

**Troubleshooting Login Issues**:

- [ ] "Login failed" error? Check admin user exists in database
- [ ] "Invalid credentials" error? Verify email/password are exactly: admin@careconnect.com / admin123
- [ ] Blank response? Check backend console for errors
- [ ] CORS error in console? Backend CORS not working - restart backend
- [ ] Network error? Make sure backend is running on 3001

✅ **If login successful, proceed to testing!**

---

## Advanced Verification Tests

### Test 1: Dashboard Data Loading

```bash
• Expected: Dashboard stats show actual numbers
• Look for: User count, Doctor count, Appointment count
• Should load within 2-3 seconds
• If blank: Backend endpoint not working properly
```

### Test 2: Navigation Menu

```bash
• Sidebar should have items:
  - Dashboard
  - Doctors
  - Doctor Approvals
  - Users
  - Appointments
  - Payments
  - Settings
• Clicking each should navigate without errors
```

### Test 3: Logout Function

```bash
• Click logout button in top right
• Should return to login page
• localStorage should be cleared
• Manual navigation to "/" should redirect to "/login"
```

### Test 4: Token Persistence

```bash
• Login to dashboard
• Refresh page (F5 or Cmd+R)
• Should stay logged in
• No redirect to login
• Dashboard data should reload
```

### Test 5: Protected Route - Token Required

```bash
# In new browser tab/window:
curl https://doctor-booking-appointment-i137.onrender.com/api/admin/dashboard \
  -H "Authorization: Bearer invalid_token"

# Expected: 401 error
# Actual backend should return: "Not authorized, token failed"
```

### Test 6: Protected Route - Valid Token

```bash
# Get token from login response or localStorage

curl https://doctor-booking-appointment-i137.onrender.com/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Expected: Dashboard data with stats
```

---

## Database Connection Verification

### Check MongoDB Connection

**Option A: MongoDB Compass (UI)**

1. Open MongoDB Compass
2. Connect to your MongoDB URI
3. Navigate to `careconnect` database
4. Should see collections: users, doctors, appointments, etc.
5. In `users` collection, find document with `role: "admin"`
6. Should show your admin user created in Step 2

**Option B: MongoDB Shell**

```bash
# Connect to database
mongo mongodb+srv://username:password@cluster.mongodb.net/careconnect

# Check admin user exists
db.users.findOne({email: "admin@careconnect.com"})

# Should return document with:
# {
#   "_id": ObjectId("..."),
#   "fullname": "Admin",
#   "email": "admin@careconnect.com",
#   "role": "admin",
#   "password": "$2a$10$...", // hashed
#   ...
# }
```

---

## Port Verification

### Ensure All Ports Are Correct

```bash
# 1. Backend Port (3001)
netstat -ano | findstr :3001
# Should show: backend process running

# 2. Frontend Port (5173)
netstat -ano | findstr :5173
# Should show: vite dev server running

# 3. MongoDB Port (27017 for local)
netstat -ano | findstr :27017
# Should show: mongod process (if local MongoDB)
```

### Change Ports If Conflict

**Backend** (if can't use 3001):

```
1. Open CareConnect-backend/.env
2. Change: PORT=3001 to PORT=4001
3. Restart backend
4. Also update admin frontend:
   - Open CareConnect-Admin/src/services/apiService.ts
   - Change baseURL to "http://localhost:4001/api"
   - Restart frontend
```

---

## Security Checklist

Before Production Deployment:

- [ ] Change default admin password from "admin123" to strong password
- [ ] Add more admin users:
  ```
  curl -X POST https://doctor-booking-appointment-i137.onrender.com/api/auth/setup-admin \
    -d '{"email": "another@admin.com", "password": "strong_password", "fullname": "Another Admin"}'
  ```
- [ ] Update JWT_SECRET to random long string (min 32 characters)
- [ ] Set NODE_ENV=production (not development)
- [ ] Enable HTTPS/SSL for frontend and backend
- [ ] Use environment-specific API URLs
- [ ] Setup database backups
- [ ] Implement logging for admin actions
- [ ] Add rate limiting to login endpoint
- [ ] Consider implementing 2FA for admin accounts

---

## Common Issues & Solutions Reference

| Problem                | Solution                                        |
| ---------------------- | ----------------------------------------------- |
| Backend won't start    | Check `.env` file exists and MONGO_URI is valid |
| Can't login            | Verify admin user exists in database            |
| "Cannot reach server"  | Ensure backend is running on port 3001          |
| CORS errors            | Restart backend server                          |
| Dashboard blank        | Check browser console for network errors        |
| Token not saving       | Check localStorage is enabled in browser        |
| Port already in use    | Change PORT in .env and restart                 |
| Vite not hot reloading | Try stopping and restarting normally            |
| Blank page after login | Check apiService.ts has correct API URL         |

---

## Post-Setup Configuration

### 1. Update Logo/Branding

- [ ] Update company name in Header.tsx
- [ ] Add custom logo in public folder
- [ ] Update favicon

### 2. Customize Dashboard

- [ ] Add more statistics
- [ ] Add charts/graphs
- [ ] Add recent activity feed

### 3. Configure Additional Settings

- [ ] Add platform settings page
- [ ] Configure email notifications
- [ ] Setup payment processing

### 4. Testing

- [ ] Test with sample data
- [ ] Test all user operations
- [ ] Test all doctor operations
- [ ] Test appointment listings
- [ ] Test payment history

---

## Performance & Optimization

- [ ] Browser DevTools - Check Network tab for slow requests
- [ ] Check database query performance
- [ ] Implement pagination for large lists
- [ ] Add caching for frequently accessed data
- [ ] Monitor server resources (CPU, Memory, Disk)

---

## Debugging Tools

### Browser DevTools (F12)

1. **Console Tab**
   - Shows JavaScript errors
   - Check for CORS errors
   - Check API error responses

2. **Network Tab**
   - Monitor API requests
   - Check response status codes
   - Verify Authorization headers are being sent

3. **Application Tab**
   - View localStorage content
   - Check token is being stored
   - Clear storage to test re-login

### Backend Console

- Monitors all server requests
- Shows database operations
- Displays errors and warnings
- Watch for performance issues

### MongoDB Compass

- Visual database explorer
- Check data consistency
- Monitor query performance
- Backup management

---

## Final Verification Checklist

Before considering setup complete:

### Backend ✅

- [ ] Running on port 3001
- [ ] MongoDB connected
- [ ] All routes registered
- [ ] Admin user created
- [ ] Health check endpoint working

### Frontend ✅

- [ ] Running on port 5173
- [ ] Loads successfully
- [ ] Can login with admin credentials
- [ ] Dashboard displays stats
- [ ] Navigation works
- [ ] Logout works
- [ ] Token persists on refresh

### Database ✅

- [ ] Connected to MongoDB
- [ ] Collections exist
- [ ] Admin user with role="admin" exists
- [ ] Can query and read data

### API Connection ✅

- [ ] Frontend can reach backend
- [ ] Authorization headers sent correctly
- [ ] Protected routes require valid token
- [ ] 401 errors returned for invalid tokens

---

## Support Resources

### Documentation Files Created

- [x] ADMIN_INTEGRATION_COMPLETE_GUIDE.md
- [x] ADMIN_QUICK_START_TESTING.md
- [x] ADMIN_FOLDER_INTEGRATION_MAP.md
- [x] ADMIN_ACTION_CHECKLIST.md (this file)

### Learning Resources

- JWT Tokens: https://jwt.io
- Express.js: https://expressjs.com
- React Context: https://react.dev/use-context
- Tailwind CSS: https://tailwindcss.com

---

## Completion Verification

✅ **Setup Complete When**:

1. Backend running on port 3001
2. Admin user created and can login
3. Frontend running on port 5173
4. Dashboard loads with stats
5. All navigation works
6. Logout clears session
7. Protected routes require token
8. No console errors

---

## Next Steps After Setup

1. **Testing**
   - Test all admin features
   - Verify data accuracy
   - Test edge cases

2. **Customization**
   - Add custom branding
   - Configure settings
   - Add custom features

3. **Production**
   - Build frontend: `npm run build`
   - Deploy to hosting
   - Setup SSL/HTTPS
   - Use environment-specific variables

4. **Maintenance**
   - Monitor server health
   - Regular backups
   - Update dependencies
   - Security patches

---

**Created**: April 2, 2026
**Status**: ✅ ADMIN PANEL FULLY INTEGRATED
**Ready for**: Development, Testing, Deployment

**Questions?** Check the other documentation files in the root directory!
