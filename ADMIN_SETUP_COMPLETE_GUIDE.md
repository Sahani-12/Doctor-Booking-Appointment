# Admin Panel Complete Setup Guide

## ✅ सभी Issues Fix हो गए हैं

### Fixed Issues:

1. ✅ **DoctorApprovalsPage API Port** - 3000 से 3001 में बदला गया
2. ✅ **SettingsPage Backend Integration** - अब backend के साथ sync होता है
3. ✅ **Settings Model & Routes** - नए Settings endpoints जोड़े गए
4. ✅ **Admin Console Configuration** - पूरी तरह configured है
5. ✅ **Environment Files** - सही comments के साथ updated

---

## 🚀 Project को चलाने के Steps

### Step 1: Backend Server Start करें

```bash
# Terminal 1 में
cd "C:\Users\anand\OneDrive\Desktop\DoctorBookingSystem - Copy\CareConnect-backend"
npm install
npm start
```

यह server **port 3001** पर चलेगा।

**Success Message:**

```
Server running on port 3001 in development mode
```

---

### Step 2: Admin Panel Start करें

```bash
# Terminal 2 में
cd "C:\Users\anand\OneDrive\Desktop\DoctorBookingSystem - Copy\CareConnect-Admin"
npm install
npm run dev
```

यह admin panel **port 5173** पर चलेगा।

---

## 📋 Project Architecture

```
┌─────────────────────────────────────────┐
│        Admin Panel (React/Vite)         │
│        Running on :5173                 │
└──────────────┬──────────────────────────┘
               │
               │ API Requests
               │ (https://doctor-booking-appointment-i137.onrender.com/api)
               ▼
┌─────────────────────────────────────────┐
│     Backend Server (Node/Express)       │
│        Running on :3001                 │
└──────────────┬──────────────────────────┘
               │
               │ Database Queries
               │
               ▼
┌─────────────────────────────────────────┐
│   MongoDB Atlas (Cloud Database)        │
└─────────────────────────────────────────┘
```

---

## 🔑 Admin Login Credentials

### पहली बार Setup करते समय:

```bash
cd CareConnect-backend
node seedAdminUser.js
```

यह एक default admin account बनाएगा।

### Or Create Admin via API:

```bash
cd CareConnect-backend
node createAdminAtlas.js
```

---

## 📁 Environment Configuration

### ✅ CareConnect-Admin/.env (Frontend)

```env
VITE_API_URL=https://doctor-booking-appointment-i137.onrender.com/api
VITE_APP_NAME=CareConnect Admin
NODE_ENV=development
```

### ✅ CareConnect-backend/.env (Backend)

```env
PORT=3001
NODE_ENV=development
MONGO_URI=mongodb+srv://anandsahani617_db_user:anand121@cluster0.aq1naoq.mongodb.net/?appName=Cluster0
JWT_SECRET=anandsahani617_secret_key
TOKEN_EXPIRES_IN=7d
```

---

## 🔧 Available Admin Routes

### Dashboard

- `GET /api/admin/dashboard` - Dashboard statistics

### User Management

- `GET /api/admin/users` - All users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Doctor Management

- `GET /api/admin/doctors` - All doctors
- `GET /api/admin/doctors/pending` - Pending approvals
- `PUT /api/admin/doctors/:id/approve` - Approve/Reject doctor
- `DELETE /api/admin/doctors/:id` - Delete doctor

### Appointments

- `GET /api/admin/appointments` - All appointments

### Payments

- `GET /api/admin/payments` - All transactions

### Settings (NEW)

- `GET /api/admin/settings` - Get app settings
- `POST /api/admin/settings` - Update app settings

### Statistics

- `GET /api/admin/stats` - Admin statistics
- `GET /api/admin/analytics/users-report` - User analytics

---

## 🔐 Authentication Flow

```
1. Admin Email + Password
        ↓
2. POST /api/auth/admin-login
        ↓
3. Backend Validate & Return JWT Token
        ↓
4. Frontend Store Token in localStorage
        ↓
5. All Requests Include Authorization Header
   Header: Authorization: Bearer <token>
```

---

## 🛠️ Admin Panel Pages

| Page             | Path                | Status     |
| ---------------- | ------------------- | ---------- |
| Login            | `/login`            | ✅ Working |
| Dashboard        | `/`                 | ✅ Working |
| Doctors          | `/doctors`          | ✅ Working |
| Doctor Approvals | `/doctor-approvals` | ✅ Fixed   |
| Users            | `/users`            | ✅ Working |
| Appointments     | `/appointments`     | ✅ Working |
| Payments         | `/payments`         | ✅ Working |
| Settings         | `/settings`         | ✅ Fixed   |

---

## 🧪 Testing Guide

### Test 1: Backend Health Check

```bash
curl https://doctor-booking-appointment-i137.onrender.com/
```

Expected Response:

```json
{
  "success": true,
  "message": "CareConnect Backend API running",
  "version": "1.0.0"
}
```

### Test 2: Admin Login

```bash
curl -X POST https://doctor-booking-appointment-i137.onrender.com/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@careconnect.com","password":"password"}'
```

### Test 3: Get Dashboard Data

```bash
curl https://doctor-booking-appointment-i137.onrender.com/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Cannot GET /api/auth/admin-login"

- ❌ Backend server not running
- ✅ Solution: `npm start` करें backend में

### Issue 2: "CORS Error"

- ❌ Backend CORS configure नहीं है
- ✅ Solution: पहले से ही `cors({ origin: true, credentials: true })` है

### Issue 3: "MongoDB Connection Error"

- ❌ MONGO_URI invalid है
- ✅ Solution: `.env` में सही URI डालें

### Issue 4: "Doctor approval not working"

- ❌ पहले API port 3000 था, अब 3001 है
- ✅ Solution: ✅ Already Fixed!

### Issue 5: "Settings not saving"

- ❌ Settings API endpoint नहीं थी
- ✅ Solution: ✅ Already Added!

---

## 📊 Performance Checklist

- ✅ Backend running on port 3001
- ✅ Admin panel accessible on port 5173
- ✅ API calls working correctly
- ✅ Authentication working
- ✅ Doctor approvals working
- ✅ Settings page working
- ✅ Database connected (MongoDB Atlas)
- ✅ All routes implemented
- ✅ Error handling in place
- ✅ Authorization middleware active

---

## 🔄 Quick Restart Commands

```bash
# Terminal 1 (Backend)
cd "C:\Users\anand\OneDrive\Desktop\DoctorBookingSystem - Copy\CareConnect-backend"
npm start

# Terminal 2 (Admin)
cd "C:\Users\anand\OneDrive\Desktop\DoctorBookingSystem - Copy\CareConnect-Admin"
npm run dev
```

---

## 📞 Support

किसी भी error के लिए:

1. Backend logs check करें (Terminal 1)
2. Admin console logs check करें (Browser Dev Tools)
3. Network tab में API calls देखें
4. MongoDB Atlas connection verify करें

---

## 🎯 Next Steps

1. ✅ Admin panel पूरी तरह working
2. ✅ सभी errors fix
3. ✅ सभी routes implemented
4. ✅ Settings functionality added
5. Ready for production deployment!
