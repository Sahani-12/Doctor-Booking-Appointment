# 📌 MongoDB Admin Panel - Quick Reference Card

## 🚀 Quick Start (30 Seconds)

### Step 1: Start Backend

```bash
cd CareConnect-backend
npm start
# Runs on https://doctor-booking-appointment-i137.onrender.com
```

### Step 2: Start Admin Panel

```bash
cd CareConnect-Admin
npm run dev
# Runs on http://localhost:5178
```

### Step 3: Login

```
URL: http://localhost:5178
Email: admin@careconnect.com
Password: admin123
```

### Step 4: View Your MongoDB Data

```
✓ Users Page → See users from database
✓ Doctors Page → See doctors from database
✓ Changes sync to MongoDB instantly
```

---

## 🎯 What You Have

| Feature        | Status | Connected To               |
| -------------- | ------ | -------------------------- |
| View Users     | ✅     | MongoDB Users Collection   |
| Search Users   | ✅     | Frontend Local (Instant)   |
| Filter Users   | ✅     | Frontend Local (Instant)   |
| Verify User    | ✅     | MongoDB (Updates DB)       |
| Delete User    | ✅     | MongoDB (Removes from DB)  |
| View Doctors   | ✅     | MongoDB Doctors Collection |
| Search Doctors | ✅     | Frontend Local (Instant)   |
| Filter Doctors | ✅     | Frontend Local (Instant)   |
| Approve Doctor | ✅     | MongoDB (Updates DB)       |
| Delete Doctor  | ✅     | MongoDB (Removes from DB)  |

---

## 📊 Current MongoDB Data

```
USERS
├─ Total: 1
├─ Verified: 1 ✓
└─ Pending: 0

DOCTORS
├─ Total: 0
├─ Approved: 0
└─ Pending: 0
```

---

## 🎨 UI Controls

### Users Page

```
🔍 Search → Type name/email
🎯 Filters → All | Verified | Pending
👁️  View → Click user row → See modal
✓  Verify → Click ✓ icon → Updates MongoDB
✗  Unverify → Click ✗ icon → Updates MongoDB
🗑️  Delete → Click trash → Removes from DB
```

### Doctors Page

```
🔍 Search → Type name/email/specialization
🎯 Filters → All | Approved | Pending
👁️  View → Click doctor row → See modal
✓  Approve → Click ✓ icon → Updates MongoDB
✗  Reject → Click ✗ icon → Updates MongoDB
🗑️  Delete → Click trash → Removes from DB
```

---

## ⚡ Key Features

✅ **Real-Time Updates** - No page reload
✅ **Database Connected** - MongoDB Atlas
✅ **Secure** - JWT + Bearer Token
✅ **Fast** - Instant search & filter
✅ **Live Counts** - Filter buttons show counts
✅ **Modal Details** - Full information display

---

## 🔐 Login Credentials

```
Email:    admin@careconnect.com
Password: admin123
```

---

## 🌐 URLs

| Service     | URL                                                  |
| ----------- | ---------------------------------------------------- |
| Admin Panel | http://localhost:5178                                |
| Backend API | https://doctor-booking-appointment-i137.onrender.com |
| MongoDB     | Atlas (Cloud)                                        |

---

## 📝 Common Tasks

### Search for User

1. Go to Users page
2. Type name/email in search box
3. Table filters instantly

### Verify a User

1. Find user in table
2. Click ✓ icon
3. Status changes Yellow → Green
4. MongoDB updated

### View User Details

1. Click user row
2. Modal opens with info
3. Can verify/delete from modal
4. Click Close to dismiss

### Delete a User

1. Click 🗑️ icon
2. Confirm deletion
3. User removed from table
4. Removed from MongoDB

### Approve Doctor

1. Go to Doctors page
2. Find doctor
3. Click ✓ icon
4. Status changes Yellow → Green
5. MongoDB updated

---

## 🧪 Verify Connection

### Run Test

```bash
cd "C:\Users\anand\OneDrive\Desktop\DoctorBookingSystem - Copy"
node verify-mongodb-connection.js
```

### Expected Output

```
✅ Login successful!
✅ Database Connected! Found 1 users
✅ Found 0 doctors in database
✅ DATABASE CONNECTION VERIFIED!
```

---

## ❌ Troubleshooting

### Can't see data?

```
1. Check backend running (npm start)
2. Check MongoDB connected
3. Refresh page
4. Check browser console for errors
```

### Can't login?

```
1. Check email: admin@careconnect.com
2. Check password: admin123
3. Check backend is running
4. Try clearing browser cache
```

### Changes not saving?

```
1. Check API response in console
2. Verify MongoDB connection
3. Restart backend server
4. Check network in DevTools
```

---

## 📚 Documentation Files

| File                            | Purpose            |
| ------------------------------- | ------------------ |
| MONGODB_CONNECTION_STATUS.md    | Connection details |
| MONGODB_DATA_FLOW_GUIDE.md      | How data flows     |
| MONGODB_INTEGRATION_COMPLETE.md | Complete overview  |
| verify-mongodb-connection.js    | Test script        |

---

## ✅ Checklist

```
□ Backend started (npm start)
□ Admin panel loaded (http://localhost:5178)
□ Logged in with admin credentials
□ Can see 1 user in Users page
□ Can see 0 doctors in Doctors page
□ Can search users
□ Can filter by status
□ Can verify/unverify users
□ Can delete users
□ All changes sync to MongoDB
□ No page reload needed
```

---

## 🎉 Status

```
✅ MongoDB Connected
✅ Backend Running
✅ Admin Panel Live
✅ All Features Working
✅ Real-Time Sync Active
✅ Ready to Use
```

---

## 💬 Quick Commands

```bash
# Start backend
cd CareConnect-backend && npm start

# Start admin panel
cd CareConnect-Admin && npm run dev

# Test MongoDB connection
node verify-mongodb-connection.js

# View logs
# Check browser console (F12 in Chrome)
```

---

## 🎯 What's Next?

1. ✅ Use admin panel to manage users/doctors
2. ✅ Register new users in User Frontend
3. ✅ Register new doctors in Doctor Frontend
4. ✅ Approve doctors in admin panel
5. ✅ Monitor system from dashboard

---

## 📞 Help

**Everything is connected and working!**

If you have questions:

1. Check documentation files
2. Run verify-mongodb-connection.js
3. Look at browser console (F12)
4. Check backend logs
5. Verify MongoDB is connected

---

## 🚀 You're All Set!

**Your admin panel is fully connected to MongoDB with real-time data synchronization.**

**Go to http://localhost:5178 and start managing your data!**

---

_Quick Reference • April 2, 2026 • MongoDB Fully Connected ✅_
