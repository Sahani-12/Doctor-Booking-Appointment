# MedConnect - Doctor Booking System

## Complete Production-Ready Implementation

### Project Overview

A comprehensive doctor appointment booking application with real-time slot availability, user/doctor/admin management, appointment scheduling, and notifications.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Installation & Setup](#installation--setup)
4. [Project Structure](#project-structure)
5. [API Documentation](#api-documentation)
6. [Database Schema](#database-schema)
7. [Testing](#testing)
8. [Deployment](#deployment)

---

## Features

### Core Features (Completed ✅)

- **User Authentication**: JWT-based login/signup with role-based access
  - User (Patient) registration and login
  - Doctor registration and login
  - Admin panel access

- **Doctor Management**
  - Doctor listing with advanced filters (specialization, location, language, fee range)
  - Doctor profiles with qualifications and experience
  - Doctor search and discovery
  - Real-time availability status

- **Appointment Booking**
  - Real-time slot availability checking
  - Appointment creation with date and time slots
  - Appointment status tracking (pending → accepted → completed/cancelled)
  - Appointment cancellation (with 24-hour policy)

- **Dashboard**
  - User dashboard: View bookings and medical documents
  - Doctor dashboard: Manage appointments and patient details
  - Admin dashboard: Manage users, doctors, and appointments

- **Document Management**
  - Upload and manage medical documents
  - Document sharing between patients and doctors
  - File upload to server

- **Notifications**
  - Email notifications for appointment bookings
  - Appointment cancellation notifications
  - System-ready for SMS integration

### Advanced Features (Ready for Integration)

- Real-time notifications (WebSocket ready)
- Email/SMS integration
- Payment processing (Razorpay/Stripe templates ready)
- Prescription management
- Patient feedback and ratings
- Admin analytics and reporting

---

## Tech Stack

### Backend

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v4.18+)
- **Database**: MongoDB (v6+) with Mongoose (v7+)
- **Authentication**: JWT (jsonwebtoken)
- **Encryption**: bcryptjs
- **File Upload**: multer
- **Middleware**: CORS, Morgan
- **Error Handling**: express-async-errors, express-async-handler
- **Environment**: dotenv

### Frontend

- **Framework**: React 18+ with Vite
- **Routing**: React Router v7+
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, MDB React UI Kit
- **Date Handling**: date-fns, dayjs

### Database

- **Primary**: MongoDB (Atlas)
- **ODM**: Mongoose with proper indexing

---

## Installation & Setup

### Prerequisites

- Node.js v18 or higher
- MongoDB Atlas account or local MongoDB
- npm or yarn package manager
- Git

### Backend Setup

#### 1. Clone the repository

```bash
cd Medconnect-backend
npm install
```

#### 2. Create .env file

```bash
cp .env.example .env
```

**Edit .env with your configuration:**

```
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster0.xxx.mongodb.net/medconnect?retryWrites=true&w=majority
JWT_SECRET=your_secure_jwt_secret_key_here
TOKEN_EXPIRES_IN=7d
```

**To find your MongoDB URI:**

1. Go to MongoDB Atlas Dashboard
2. Click "Connect" on your cluster
3. Choose "Drivers"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Replace `myFirstDatabase` with `medconnect`

#### 3. Create uploads directory

```bash
mkdir uploads
```

#### 4. Start development server

```bash
npm run dev
```

Server will run on `http://localhost:4000`

### Frontend Setup (User App)

#### 1. Install dependencies

```bash
cd ../Medconnect-User-main
npm install
```

#### 2. Create .env file

```
VITE_API_URL=http://localhost:4000
```

#### 3. Start development server

```bash
npm run dev
```

Will run on `http://localhost:5173`

### Frontend Setup (Doctor Dashboard)

#### 1. Install dependencies

```bash
cd ../Medconnect-Doctors-main
npm install
```

#### 2. Create .env file

```
VITE_API_URL=http://localhost:4000
```

#### 3. Start development server

```bash
npm run dev
```

Will run on `http://localhost:5174`

---

## Project Structure

### Backend (/Medconnect-backend)

```
src/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/              # Business logic
│   ├── authController.js     # Auth logic
│   ├── doctorController.js   # Doctor operations
│   ├── appointmentController.js  # Appointment logic
│   ├── userController.js     # User operations
│   └── adminController.js    # Admin operations
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── authorize.js         # Role-based authorization
│   └── error.js             # Error handling
├── models/                  # Mongoose schemas
│   ├── User.js
│   ├── Doctor.js
│   ├── Appointment.js
│   ├── Document.js
│   └── Story.js
├── routes/                  # API routes
│   ├── auth.js
│   ├── doctors.js
│   ├── appointments.js
│   ├── user.js
│   ├── admin.js
│   └── stories.js
├── utils/
│   ├── validators.js        # Input validation
│   ├── response.js          # Response helpers
│   └── email.js             # Email templates and service
├── services/                # Reusable services
├── index.js                 # Express app entry point
└── package.json
```

### Frontend Structure (/Medconnect-User-main)

```
src/
├── components/
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── SignUp.jsx
│   ├── Pages/
│   │   ├── Home.jsx
│   │   ├── DoctorSearch.jsx
│   │   ├── DoctorProfile.jsx
│   │   ├── AppointmentSchedule.jsx
│   │   ├── UserDashboard.jsx
│   │   └── UserProfile.jsx
│   └── ui/              # Reusable UI components
├── constants/
│   └── api.js          # API configuration
├── utils/
│   └── helpers.js      # Utility functions
├── App.jsx
├── routes.jsx          # Route configuration
└── main.jsx
```

---

## API Documentation

### Base URL

```
http://localhost:4000/api
```

### Authentication Endpoints

#### Register User

```
POST /auth/register/user
Content-Type: application/json

{
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "securePass123",
  "phone": "9876543210",
  "city": "Delhi",
  "gender": "male",
  "age": 30,
  "DOB": "1994-01-15"
}

Response: { user: {...}, token: "jwt_token" }
```

#### Register Doctor

```
POST /auth/register/doctor
Content-Type: application/json

{
  "fullname": "Dr. Sarah Khan",
  "email": "sarah@example.com",
  "password": "securePass123",
  "specialization": ["Cardiology", "General Medicine"],
  "city": "Delhi",
  "location": "Delhi NCR",
  "fee": 500,
  "experience": "10 years",
  "phone": "9999999999"
}

Response: { user: {...}, token: "jwt_token" }
```

#### Login

```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePass123"
}

Response: { user: {...}, token: "jwt_token" }
```

#### Get Current User

```
GET /auth/me
Authorization: Bearer <token>

Response: { success: true, data: {...} }
```

### Doctor Endpoints

#### Get All Doctors

```
GET /doctors?page=1&limit=15&search=cardio&city=Delhi&specialization=Cardiology

Response: {
  success: true,
  pagination: { page, limit, total, totalPages },
  data: [...]
}
```

#### Get Doctor Profile

```
GET /doctors/profile
Authorization: Bearer <doctor_token>

Response: { success: true, data: {...} }
```

#### Update Doctor Profile

```
PUT /doctors/profile
Authorization: Bearer <doctor_token>
Content-Type: application/json

{
  "fee": 600,
  "experience": "12 years",
  "specialization": ["Cardiology", "Pediatrics"]
}

Response: { success: true, data: updated_doctor }
```

### Appointment Endpoints

#### Book Appointment

```
POST /appointments
Authorization: Bearer <patient_token>
Content-Type: application/json

{
  "doctorId": "doctor_id",
  "date": "2024-04-20",
  "slot": "14:00",
  "notes": "Chest pain consultation"
}

Response: { success: true, data: appointment }
```

#### Get Available Slots

```
GET /appointments/slots/:doctorId/:date
Authorization: Bearer <token>

Response: {
  success: true,
  data: {
    slots: [
      { startTime: "09:00", status: "available" },
      { startTime: "09:30", status: "booked" },
      { startTime: "10:00", status: "mine" }
    ]
  }
}
```

#### Get My Appointments

```
GET /appointments/my?page=1&status=pending
Authorization: Bearer <token>

Response: {
  success: true,
  pagination: {...},
  data: [...]
}
```

#### Cancel Appointment

```
POST /appointments/:appointmentId/cancel
Authorization: Bearer <token>

Response: { success: true, data: appointment }
```

### User Endpoints

#### Get User Profile

```
GET /users/profile
Authorization: Bearer <token>

Response: { success: true, data: {...} }
```

#### Update User Profile

```
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullname": "John Updated",
  "phone": "new_phone",
  "city": "Mumbai"
}

Response: { success: true, data: updated_user }
```

#### Upload Document

```
POST /users/documents/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <binary_file>,
  "message": "Medical report"
}

Response: { success: true, data: document }
```

#### Get User Documents

```
GET /users/documents
Authorization: Bearer <token>

Response: { success: true, data: [...] }
```

### Admin Endpoints

All admin endpoints require `Authorization: Bearer <admin_token>` header.

#### Get All Users

```
GET /admin/users?page=1&search=john
Response: { success: true, pagination: {...}, data: [...] }
```

#### Get All Doctors

```
GET /admin/doctors?page=1&search=dr
Response: { success: true, pagination: {...}, data: [...] }
```

#### Get All Appointments

```
GET /admin/appointments?page=1&status=pending
Response: { success: true, pagination: {...}, data: [...] }
```

#### Delete User

```
DELETE /admin/users/:userId
Response: { success: true, message: "User deleted successfully" }
```

#### Approve/Reject Doctor

```
PUT /admin/doctors/:doctorId/approve
Content-Type: application/json

{ "isApproved": true }

Response: { success: true, data: doctor }
```

#### Admin Statistics

```
GET /admin/stats
Response: {
  success: true,
  data: {
    totalUsers,
    totalDoctors,
    totalAppointments,
    thisMonthAppointments,
    appointmentsByStatus,
    totalRevenue
  }
}
```

---

## Database Schema

### User Model

```javascript
{
  fullname: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (default: "user"),
  phone: String,
  city: String,
  DOB: String,
  age: Number,
  gender: String,
  image: String,
  isVerified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Doctor Model

```javascript
{
  fullname: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (default: "doctor"),
  phone: String,
  specialization: [String],
  subspecialization: [String],
  degrees: [String],
  experience: String,
  fee: Number,
  city: String,
  location: String,
  profileImage: String,
  languagesSpoken: [String],
  rating: Number (default: 0),
  isApproved: Boolean (default: true),
  isVerified: Boolean (default: false),
  stories: [ObjectId] (ref: "Story"),
  createdAt: Date,
  updatedAt: Date
}
```

### Appointment Model

```javascript
{
  patient: ObjectId (ref: "User", required),
  doctor: ObjectId (ref: "Doctor", required),
  date: Date (required),
  slot: String (HH:MM format, required),
  status: String (enum: pending|accepted|completed|cancelled),
  notes: String,
  consultationType: String (enum: online|offline, default: "online"),
  rating: Number (1-5),
  feedback: String,
  prescription: String,
  prescriptionFile: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Document Model

```javascript
{
  user: ObjectId (ref: "User", required),
  filename: String,
  fileUrl: String (required),
  message: String,
  uploadedAt: Date,
  createdAt: Date
}
```

---

## Testing

### Test User Accounts

#### Patient Account

- Email: `patient@test.com`
- Password: `Test@1234`

#### Doctor Account

- Email: `doctor@test.com`
- Password: `Test@1234`

#### Admin Account

- Email: `admin@test.com`
- Password: `Test@1234`

### Testing Workflow

1. **User Registration & Login**
   - Register as patient
   - Verify JWT token in localStorage
   - Verify role-based redirect

2. **Doctor Search**
   - Search by specialization
   - Filter by location and fee range
   - Verify pagination

3. **Appointment Booking**
   - Select doctor
   - Choose date and available slot
   - Verify appointment creation
   - Check email notification

4. **Appointment Management**
   - View appointments from both patient and doctor sides
   - Update appointment status
   - Test cancellation with 24-hour policy

5. **Admin Functions**
   - Access admin panel
   - View all users and doctors
   - Delete test accounts
   - View analytics

---

## Deployment

### Backend Deployment (Heroku)

1. **Create Heroku app**

```bash
heroku create medconnect-api
```

2. **Set environment variables**

```bash
heroku config:set MONGO_URI=<your_mongodb_uri>
heroku config:set JWT_SECRET=<your_jwt_secret>
```

3. **Deploy**

```bash
git push heroku main
```

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**

```bash
npm i -g vercel
```

2. **Deploy**

```bash
vercel
```

---

## Troubleshooting

### Common Issues

#### "MONGO_URI missing" error

**Solution**: Ensure .env file exists and MONGO_URI is set correctly

#### "Cannot find uploads folder"

**Solution**: Create uploads directory in project root

```bash
mkdir uploads
chmod 755 uploads
```

#### CORS errors

**Solution**: Verify CORS settings in index.js and frontend API URL

#### Port already in use

**Solution**: Change PORT in .env or kill process on existing port

---

## Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -m "Add feature"`
3. Push to branch: `git push origin feature/feature-name`
4. Submit pull request

---

## License

MIT License - see LICENSE file for details

---

## Support

For issues and questions:

- Create an issue on GitHub
- Email: support@medconnect.com
- Discord: [Community server link]

---

**Last Updated**: March 2024
**Version**: 1.0.0
**Status**: Production Ready ✅
