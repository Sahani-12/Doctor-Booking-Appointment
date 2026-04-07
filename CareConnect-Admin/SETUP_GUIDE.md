# CareConnect Admin Panel - Complete Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
cd CareConnect-Admin
npm install
```

### Step 2: Ensure Backend is Running

Make sure your backend server is running on port 3000:

```bash
cd CareConnect-backend
npm start
```

Backend should show: `✓ Server running on port 3000`

### Step 3: Start Admin Panel

```bash
cd CareConnect-Admin
npm run dev
```

Admin panel will open at: **http://localhost:5173**

### Step 4: Login

Use the demo credentials:

- **Email:** admin@careconnect.com
- **Password:** admin123

---

## 📋 Detailed Setup Instructions

### Backend Configuration (Important!)

Before starting the admin panel, ensure your backend has the following admin routes:

#### 1. **Admin Authentication Route**

```
POST /api/auth/admin-login
```

**Request:**

```json
{
  "email": "admin@careconnect.com",
  "password": "admin123"
}
```

**Response:**

```json
{
  "token": "jwt_token_here",
  "admin": {
    "id": "admin_id",
    "name": "Admin Name",
    "email": "admin@careconnect.com",
    "role": "admin"
  }
}
```

**Backend Code Example (Node.js):**

```javascript
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin user
    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
```

#### 2. **Required Admin API Endpoints**

Create these routes in your backend:

##### Dashboard Stats

```
GET /api/admin/dashboard
Headers: Authorization: Bearer <token>

Response:
{
  "data": {
    "totalUsers": 150,
    "totalDoctors": 45,
    "pendingDoctors": 5,
    "totalAppointments": 320,
    "totalRevenue": 150000
  }
}
```

##### Doctor Management

```
GET /api/admin/doctors
GET /api/admin/doctors/pending
PUT /api/admin/doctors/:id/approve (body: { status: 'approved' | 'rejected' })
DELETE /api/admin/doctors/:id
```

##### User Management

```
GET /api/admin/users
DELETE /api/admin/users/:id
```

##### Appointment & Payment

```
GET /api/admin/appointments
GET /api/admin/payments
```

---

## 🔑 Creating Admin User in Backend

Run this in your backend to create the first admin:

```javascript
// scripts/createAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function createAdmin() {
  const admin = new User({
    name: "Admin User",
    email: "admin@careconnect.com",
    password: await bcrypt.hash("admin123", 10),
    role: "admin",
  });

  await admin.save();
  console.log("✓ Admin user created!");
  process.exit();
}

mongoose
  .connect("mongodb://localhost:27017/careconnect")
  .then(createAdmin)
  .catch(console.error);
```

Run:

```bash
node scripts/createAdmin.js
```

---

## 🔗 API Integration Checklist

Before deploying, ensure:

- [ ] Admin authentication endpoint is working
- [ ] Dashboard stats endpoint returns data
- [ ] Doctor approval endpoints work
- [ ] User management endpoints work
- [ ] Appointment endpoints return data
- [ ] Payment endpoints return data
- [ ] JWT token validation is working
- [ ] CORS is configured for frontend URLs

---

## 🌐 Environment Configuration

### Development (.env.local)

```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENABLE_MOCK_DATA=false
```

### Production

Update `src/services/apiService.ts`:

```typescript
const API_BASE_URL = "https://your-production-api.com/api";
```

---

## 🚀 Building for Production

### Step 1: Build

```bash
npm run build
```

### Step 2: Output

Files will be in `dist/` folder

### Step 3: Deploy

- Upload `dist/` folder to your hosting
- Update API base URL
- Ensure backend CORS allows your domain

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name admin.careconnect.com;

    root /var/www/careconnect-admin/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🐛 Troubleshooting

### Issue: Login fails with "Invalid credentials"

**Solution:**

1. Check backend is running: `ps aux | grep node`
2. Verify admin user exists in database
3. Check MongoDB connection
4. Verify JWT_SECRET is set in .env

### Issue: Blank dashboard

**Solution:**

1. Check browser console for errors (F12)
2. Verify token is being sent: `localStorage.getItem('adminToken')`
3. Check backend response: Visit `http://localhost:3000/api/admin/dashboard` directly

### Issue: CORS errors

**Solution:**

Update backend cors.js:

```javascript
const cors = require("cors");

app.use(
  cors({
    origin: ["http://localhost:5173", "https://yourdomain.com"],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
```

### Issue: Doctors can't be approved

**Solution:**

1. Check `/api/admin/doctors/pending` endpoint
2. Verify doctor status is "pending" in database
3. Check backend has doctor approval route

---

## 📊 Database Queries (MongoDB)

Useful queries for testing:

```javascript
// Check admin user exists
db.users.findOne({ email: "admin@careconnect.com" });

// Count pending doctors
db.doctors.countDocuments({ status: "pending" });

// List all doctors
db.doctors.find();

// Update doctor status
db.doctors.updateOne(
  { _id: ObjectId("...") },
  { $set: { status: "approved" } },
);
```

---

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Enable HTTPS in production
- [ ] Add rate limiting to login endpoint
- [ ] Implement refresh token mechanism
- [ ] Add audit logging for actions
- [ ] Validate all user inputs
- [ ] Use environment variables for secrets
- [ ] Implement role-based access control

---

## 📱 Features Overview

| Feature           | Status | Notes                                 |
| ----------------- | ------ | ------------------------------------- |
| Admin Login       | ✅     | Demo credentials included             |
| Dashboard         | ✅     | Real-time stats                       |
| Doctor Approvals  | ✅     | **CRITICAL** - Most important feature |
| Doctor Management | ✅     | List, search, delete                  |
| User Management   | ✅     | List, search, delete                  |
| Appointments      | ✅     | View & monitor                        |
| Payments          | ✅     | Transaction tracking                  |
| Settings          | ✅     | App configuration                     |
| Dark Mode         | ✅     | UI preference                         |
| Mobile Responsive | ✅     | Works on all sizes                    |

---

## 📞 Support

For integration issues:

1. Check logs: `npm run dev` console
2. Browser DevTools (F12)
3. Backend logs: `cd CareConnect-backend && npm start`
4. Database: Check MongoDB directly

---

## ✅ Testing Workflow

1. **Start Backend:** `npm start` in backend folder
2. **Start Admin:** `npm run dev` in admin folder
3. **Login:** admin@careconnect.com / admin123
4. **Test Features:**
   - ✅ View dashboard
   - ✅ Navigate to each page
   - ✅ Try to approve a doctor
   - ✅ Try to delete a user
   - ✅ Check real-time updates

---

## 🎉 You're Ready!

The admin panel is now fully set up and ready to use. Start managing your platform!

**Next Steps:**

1. Create admin account in backend
2. Implement approval workflows
3. Set up admin notifications
4. Configure production deployment

---

**Last Updated:** March 2026  
**Version:** 1.0.0
