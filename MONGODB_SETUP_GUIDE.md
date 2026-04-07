# MongoDB Database Setup Guide - CareConnect

## ✅ Database Status: FULLY CONFIGURED

Your backend is already set up to use MongoDB with all necessary models and connections.

---

## 📋 MongoDB Collections (Models)

Your system uses **7 main collections**:

### 1. **Users** (Patients)

```javascript
{
  _id: ObjectId,
  fullname: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  city: String,
  age: Number,
  gender: String,
  DOB: Date,
  image: String,
  role: "user" (default),
  isVerified: Boolean,
  bloodGroup: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** email, city

---

### 2. **Doctors**

```javascript
{
  _id: ObjectId,
  fullname: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  age: Number,
  gender: String,
  DOB: Date,
  profileImage: String,
  specialization: [String],
  subspecialization: [String],
  experience: Number,
  description: String,
  fee: Number,
  emergencyFee: Number,
  qualification: String,
  licenseNumber: String,
  hospital: String,
  city: String,
  location: String,
  degrees: [String],
  certification: [String],
  educationHistory: [Object],
  languagesSpoken: [String],
  isApproved: Boolean (default: false),  // ⭐ CRITICAL FOR ADMIN
  role: "doctor" (default),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** email, city, isApproved

---

### 3. **Appointments**

```javascript
{
  _id: ObjectId,
  patient: ObjectId (ref: User),
  doctor: ObjectId (ref: Doctor),
  appointmentDate: Date,
  timeSlot: String,
  status: String ("scheduled", "completed", "cancelled"),
  notes: String,
  fees: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** patient, doctor, appointmentDate, status

---

### 4. **Transactions** (Payments)

```javascript
{
  _id: ObjectId,
  appointment: ObjectId (ref: Appointment),
  patient: ObjectId (ref: User),
  amount: Number,
  status: String ("pending", "completed", "failed"),
  paymentMethod: String ("stripe", "razorpay", "demo"),
  transactionId: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** appointment, patient, status

---

### 5. **Documents** (Medical Files)

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  title: String,
  description: String,
  fileUrl: String,
  fileType: String,
  uploadedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 6. **Stories** (Medical Records)

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  imageUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 7. **VideoSessions** (Video Consultations)

```javascript
{
  _id: ObjectId,
  appointment: ObjectId (ref: Appointment),
  patient: ObjectId (ref: User),
  doctor: ObjectId (ref: Doctor),
  roomId: String,
  startTime: Date,
  endTime: Date,
  status: String ("scheduled", "ongoing", "completed"),
  recordingUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔧 MongoDB Connection

### Your Current Setup:

**File:** `src/config/db.js`

```javascript
const mongoose = require("mongoose");

const connectDB = async (uri) => {
  if (!uri) throw new Error("MONGO_URI missing");
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

**File:** `.env`

```
MONGO_URI=mongodb://localhost:27017/careconnect
```

---

## 🚀 Setup Options

### Option 1: MongoDB Local (Development)

**Requirements:**

- MongoDB Desktop installed

**Steps:**

1. **Install MongoDB Community Edition**
   - Windows: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Mac: `brew install mongodb-community`
   - Linux: Follow official docs

2. **Start MongoDB Service**

   ```bash
   # Windows
   net start MongoDB

   # Mac
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod
   ```

3. **Configure .env**

   ```
   MONGO_URI=mongodb://localhost:27017/careconnect
   ```

4. **Test Connection**
   ```bash
   cd CareConnect-backend
   npm start
   # Should show: "MongoDB connected"
   ```

---

### Option 2: MongoDB Atlas (Cloud - Recommended)

**Best for Production & Scaling**

**Steps:**

1. **Create Account**
   - Go to [atlas.mongodb.com](https://www.mongodb.com/cloud/atlas)
   - Sign up free

2. **Create Cluster**
   - Click "Create" → "Shared" (Free tier)
   - Choose region
   - Wait for cluster to be created

3. **Create Database User**
   - Go to "Database Access"
   - Add username: `careconnect_admin`
   - Add strong password

4. **Allow IP Access**
   - Go to "Network Access"
   - Add your IP or allow "0.0.0.0/0" (development only)

5. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string

6. **Update .env**

   ```
   MONGO_URI=mongodb+srv://careconnect_admin:PASSWORD@cluster.mongodb.net/careconnect?retryWrites=true&w=majority
   ```

7. **Replace PASSWORD** with your actual password

---

## 📊 Database Statistics Query

### Check Total Records:

```javascript
// In MongoDB Shell or Compass

// Count users
db.users.countDocuments();

// Count doctors
db.doctors.countDocuments();

// Count pending doctors
db.doctors.countDocuments({ isApproved: false });

// Count appointments
db.appointments.countDocuments();

// Total revenue
db.transactions.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: null, total: { $sum: "$amount" } } },
]);
```

---

## 🔑 Important Collections for Admin Panel

### For Doctor Approvals:

```javascript
// Find pending doctors
db.doctors.find({ isApproved: false });

// Approve a doctor
db.doctors.updateOne({ _id: ObjectId("...") }, { $set: { isApproved: true } });

// Reject a doctor
db.doctors.deleteOne({ _id: ObjectId("...") });
```

### For Dashboard Stats:

```javascript
// Total users
db.users.countDocuments();

// Total approved doctors
db.doctors.countDocuments({ isApproved: true });

// Pending approvals
db.doctors.countDocuments({ isApproved: false });

// Appointments this month
db.appointments.countDocuments({
  createdAt: {
    $gte: new Date(new Date().setDate(1)),
  },
});

// Total revenue
db.transactions.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
]);
```

---

## 📈 Database Indexing

**Indexes are already created in models** for fast queries:

```javascript
// User indexes
userSchema.index({ email: 1 });
userSchema.index({ city: 1 });

// Doctor indexes
doctorSchema.index({ email: 1 });
doctorSchema.index({ isApproved: 1 });

// Appointment indexes
appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ doctor: 1 });
appointmentSchema.index({ status: 1 });

// Transaction indexes
transactionSchema.index({ appointment: 1 });
transactionSchema.index({ status: 1 });
```

---

## 🔒 Backup Strategy

### Manual Backup (MongoDB Local):

```bash
# Backup
mongodump --db careconnect --out ./backups

# Restore
mongorestore --db careconnect ./backups/careconnect
```

### Cloud Backup (MongoDB Atlas):

- ✅ Automatic daily backups (included free)
- ✅ Point-in-time recovery
- ✅ No manual work needed

---

## 🛡️ Security Best Practices

### 1. **Production .env Setup**

```
# Never expose in code
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/careconnect
```

### 2. **Password Security**

- Use strong passwords (16+ characters)
- Special characters: !@#$%^&\*
- Different for dev and production

### 3. **Access Control**

- Create read-only user for analytics
- Create admin user for management
- Restrict IP access in production

### 4. **Data Validation**

- All models validate input
- Email uniqueness enforced
- Password hashing with bcrypt

---

## 📊 Monitoring

### Check MongoDB Status:

```bash
# Local MongoDB
mongosh
> show databases
> db.version()

# Atlas MongoDB
# Use MongoDB Compass or Atlas UI
```

### Admin Panel Dashboard Shows:

- ✅ Total Users
- ✅ Total Doctors (Approved)
- ✅ Pending Doctor Approvals
- ✅ Total Appointments
- ✅ Total Revenue

---

## 🔄 Data Flow

```
User/Doctor App
    ↓
    (API Request)
    ↓
Backend Server (Express.js)
    ↓
    (Mongoose Query)
    ↓
MongoDB Database
    ↓
    (Return Data)
    ↓
Admin Panel
```

---

## ✅ Verification Checklist

- [ ] MongoDB is running locally or Atlas is connected
- [ ] `MONGO_URI` is set in `.env`
- [ ] Backend starts without errors
- [ ] Backend shows "MongoDB connected"
- [ ] Admin panel loads
- [ ] Admin can view dashboard
- [ ] Backend can query doctors
- [ ] Backend can approve doctors

---

## 🐛 Troubleshooting

### "MongoDB connection failed"

**Solution:**

```bash
# Check if MongoDB is running
mongosh

# If not, start it:
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### "MONGO_URI missing"

**Solution:**

1. Create `.env` file in backend root
2. Add: `MONGO_URI=mongodb://localhost:27017/careconnect`
3. Restart backend

### "Cannot connect to MongoDB Atlas"

**Solution:**

1. Check connection string is correct
2. Verify IP is whitelisted
3. Check password has no special characters (or use % encoding)
4. Try simpler password for testing

---

## 📝 Data Examples

### New User Registration:

```javascript
{
  fullname: "John Doe",
  email: "john@example.com",
  password: "$2a$10$... (hashed)",
  phone: "+91-9876543210",
  age: 30,
  gender: "Male",
  city: "Mumbai",
  role: "user",
  isVerified: false
}
```

### New Doctor Registration:

```javascript
{
  fullname: "Dr. Smith",
  email: "dr.smith@example.com",
  password: "$2a$10$... (hashed)",
  specialization: ["Cardiology"],
  experience: 5,
  qualification: "MBBS, MD",
  licenseNumber: "MED123456",
  fee: 500,
  isApproved: false,  // Waiting for admin approval
  role: "doctor"
}
```

### Appointment:

```javascript
{
  patient: ObjectId("user_id"),
  doctor: ObjectId("doctor_id"),
  appointmentDate: "2026-04-15",
  timeSlot: "10:00 AM",
  status: "scheduled",
  fees: 500
}
```

### Transaction:

```javascript
{
  appointment: ObjectId("appointment_id"),
  patient: ObjectId("user_id"),
  amount: 500,
  status: "completed",
  paymentMethod: "stripe",
  transactionId: "pi_1A2B3C4D5E6F7G8H"
}
```

---

## 🎯 Next Steps

1. **Setup MongoDB** (Local or Atlas)
2. **Configure .env** with MONGO_URI
3. **Start Backend** - should connect to DB
4. **Test Admin Panel** - should load data
5. **Register Test Users** from patient/doctor apps
6. **Verify Data** appears in MongoDB
7. **Test Admin Functions** (approve doctors, manage users, etc.)

---

## 📚 Resources

- **MongoDB Official Docs:** https://docs.mongodb.com/
- **MongoDB Compass (GUI):** https://www.mongodb.com/products/tools/compass
- **MongoDB Atlas Console:** https://www.mongodb.com/cloud/atlas
- **Mongoose Docs:** https://mongoosejs.com/

---

## 💡 Pro Tips

✅ Use MongoDB Compass for visual data management  
✅ Enable authentication in production  
✅ Regular backups (daily)  
✅ Monitor database size  
✅ Use connection pooling for scalability  
✅ Archive old data periodically

---

**Your database is fully ready for production!** 🚀

All data from your Patient App, Doctor App, and Admin Panel will be stored in MongoDB automatically.
