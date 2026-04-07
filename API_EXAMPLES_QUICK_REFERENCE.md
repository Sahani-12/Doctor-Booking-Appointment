# MedConnect API - Complete Examples & Quick Reference

## Authentication Flow

### 1. Patient Registration

```javascript
// Request
POST http://localhost:4000/api/auth/register/user
Content-Type: application/json

{
  "fullname": "Rajesh Kumar",
  "email": "rajesh.kumar@email.com",
  "password": "SecurePass@123",
  "phone": "9876543210",
  "city": "Delhi",
  "gender": "male",
  "age": 35,
  "DOB": "1989-03-15"
}

// Response (201 Created)
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullname": "Rajesh Kumar",
      "email": "rajesh.kumar@email.com",
      "role": "user",
      "city": "Delhi"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Doctor Registration

```javascript
// Request
POST http://localhost:4000/api/auth/register/doctor
Content-Type: application/json

{
  "fullname": "Dr. Priya Sharma",
  "email": "priya.sharma@medical.com",
  "password": "DocPass@123",
  "phone": "9123456789",
  "gender": "female",
  "DOB": "1985-06-20",
  "age": 39,
  "experience": "15 years",
  "specialization": ["Cardiology", "Internal Medicine"],
  "degrees": ["MBBS", "MD Cardiology"],
  "city": "Delhi",
  "location": "Delhi NCR",
  "fee": 800,
  "profileImage": "https://example.com/photo.jpg",
  "languagesSpoken": ["English", "Hindi"]
}

// Response (201 Created)
{
  "success": true,
  "message": "Doctor registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "fullname": "Dr. Priya Sharma",
      "email": "priya.sharma@medical.com",
      "role": "doctor",
      "city": "Delhi"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Login

```javascript
// Request
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "rajesh.kumar@email.com",
  "password": "SecurePass@123"
}

// Response (200 OK)
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullname": "Rajesh Kumar",
      "email": "rajesh.kumar@email.com",
      "role": "user",
      "city": "Delhi"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

// Save token to localStorage in frontend:
localStorage.setItem('token', response.data.token);
```

### 4. Get Current User

```javascript
// Request
GET http://localhost:4000/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Response (200 OK)
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "fullname": "Rajesh Kumar",
    "email": "rajesh.kumar@email.com",
    "role": "user",
    "phone": "9876543210",
    "city": "Delhi",
    "gender": "male",
    "age": 35,
    "createdAt": "2024-03-15T10:30:00Z"
  }
}
```

---

## Doctor Operations

### 1. Search Doctors

```javascript
// Request - Basic
GET http://localhost:4000/api/doctors?page=1&limit=15

// Request - With Filters
GET http://localhost:4000/api/doctors?
  page=1&
  limit=15&
  search=cardio&
  city=Delhi&
  specialization=Cardiology&
  language=English&
  minFee=500&
  maxFee=1500

// Response (200 OK)
{
  "success": true,
  "pagination": {
    "page": 1,
    "limit": 15,
    "total": 45,
    "totalPages": 3
  },
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "fullname": "Dr. Priya Sharma",
      "email": "priya.sharma@medical.com",
      "specialization": ["Cardiology", "Internal Medicine"],
      "fee": 800,
      "city": "Delhi",
      "rating": 4.8,
      "experience": "15 years"
    }
  ]
}
```

### 2. Get Doctor Details

```javascript
// Request
GET http://localhost:4000/api/doctors/507f1f77bcf86cd799439012
Authorization: Bearer token

// Response (200 OK)
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "fullname": "Dr. Priya Sharma",
    "email": "priya.sharma@medical.com",
    "specialization": ["Cardiology"],
    "subspecialization": ["Interventional Cardiology"],
    "degrees": ["MBBS", "MD Cardiology"],
    "experience": "15 years",
    "fee": 800,
    "city": "Delhi",
    "location": "Fortis Hospital, Delhi",
    "rating": 4.8,
    "profileImage": "https://example.com/photo.jpg",
    "languagesSpoken": ["English", "Hindi"],
    "stories": []
  }
}
```

### 3. Doctor Profile (Authenticated Doctor)

```javascript
// Request
GET http://localhost:4000/api/doctors/profile
Authorization: Bearer doctor_token

// Response (200 OK)
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "fullname": "Dr. Priya Sharma",
    "email": "priya.sharma@medical.com",
    // ... all doctor details
  }
}
```

### 4. Update Doctor Profile

```javascript
// Request
PUT http://localhost:4000/api/doctors/profile
Authorization: Bearer doctor_token
Content-Type: application/json

{
  "fee": 900,
  "experience": "16 years",
  "description": "Highly experienced cardiologist"
}

// Response (200 OK)
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    // ... updated doctor data
  }
}
```

---

## Appointment Management

### 1. Check Available Slots

```javascript
// Request
GET http://localhost:4000/api/appointments/slots/507f1f77bcf86cd799439012/2024-04-20
Authorization: Bearer patient_token

// Response (200 OK)
{
  "success": true,
  "data": {
    "doctorId": "507f1f77bcf86cd799439012",
    "date": "2024-04-20",
    "slots": [
      { "startTime": "09:00", "status": "available" },
      { "startTime": "09:30", "status": "booked" },
      { "startTime": "10:00", "status": "available" },
      { "startTime": "10:30", "status": "mine" },
      { "startTime": "11:00", "status": "available" },
      // ... more slots
    ]
  }
}

// Status values:
// - "available": Slot is free
// - "booked": Someone else booked it
// - "mine": You already booked this slot
```

### 2. Book Appointment

```javascript
// Request
POST http://localhost:4000/api/appointments
Authorization: Bearer patient_token
Content-Type: application/json

{
  "doctorId": "507f1f77bcf86cd799439012",
  "date": "2024-04-20",
  "slot": "10:00",
  "notes": "Chest pain and shortness of breath"
}

// Response (201 Created)
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "patient": "507f1f77bcf86cd799439011",
    "doctor": {
      "_id": "507f1f77bcf86cd799439012",
      "fullname": "Dr. Priya Sharma",
      "email": "priya@email.com",
      "city": "Delhi"
    },
    "date": "2024-04-20T00:00:00Z",
    "slot": "10:00",
    "status": "pending",
    "notes": "Chest pain and shortness of breath",
    "createdAt": "2024-03-18T14:25:00Z"
  }
}

// Email sent to patient: Appointment confirmation
```

### 3. Get My Appointments

```javascript
// Patient Request
GET http://localhost:4000/api/appointments/my?page=1&status=pending
Authorization: Bearer patient_token

// Doctor Request
GET http://localhost:4000/api/appointments/my?page=1&status=pending
Authorization: Bearer doctor_token

// Response (200 OK)
{
  "success": true,
  "pagination": {
    "page": 1,
    "limit": 15,
    "total": 8,
    "totalPages": 1
  },
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "patient": {
        "_id": "507f1f77bcf86cd799439011",
        "fullname": "Rajesh Kumar",
        "email": "rajesh@email.com"
      },
      "doctor": {
        "_id": "507f1f77bcf86cd799439012",
        "fullname": "Dr. Priya Sharma",
        "specialization": ["Cardiology"]
      },
      "date": "2024-04-20T00:00:00Z",
      "slot": "10:00",
      "status": "pending",
      "notes": "Chest pain",
      "submissionDate": "2024-03-18T14:25:00Z",
      "time": "10:00",
      "doctorName": "Dr. Priya Sharma",
      "visitedFor": "Chest pain"
    }
  ]
}
```

### 4. Update Appointment Status

```javascript
// Doctor accepting appointment
PUT http://localhost:4000/api/appointments/507f1f77bcf86cd799439013/status
Authorization: Bearer doctor_token
Content-Type: application/json

{
  "status": "accepted"
}

// Response (200 OK)
{
  "success": true,
  "message": "Appointment status updated successfully",
  "data": {
    // ... updated appointment with status: "accepted"
  }
}

// Valid status values: "pending" | "accepted" | "completed" | "cancelled"
```

### 5. Cancel Appointment

```javascript
// Request
POST http://localhost:4000/api/appointments/507f1f77bcf86cd799439013/cancel
Authorization: Bearer patient_token

// Note: Can only cancel 24+ hours before appointment

// Response (200 OK)
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    // ... appointment with status: "cancelled"
  }
}

// Response (400 Bad Request - Within 24 hours)
{
  "success": false,
  "message": "Cannot cancel appointment within 24 hours of appointment time"
}
```

---

## User Dashboard

### 1. Get User Profile

```javascript
// Request
GET http://localhost:4000/api/users/profile
Authorization: Bearer user_token

// Response (200 OK)
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "fullname": "Rajesh Kumar",
    "email": "rajesh.kumar@email.com",
    "phone": "9876543210",
    "city": "Delhi",
    "gender": "male",
    "age": 35,
    "image": "https://example.com/profile.jpg",
    "role": "user"
  }
}
```

### 2. Update User Profile

```javascript
// Request
PUT http://localhost:4000/api/users/profile
Authorization: Bearer user_token
Content-Type: application/json

{
  "phone": "9999999999",
  "city": "Mumbai",
  "age": 36
}

// Response (200 OK)
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    // ... updated user data
  }
}
```

### 3. Upload Document

```javascript
// Request
POST http://localhost:4000/api/users/documents/upload
Authorization: Bearer user_token
Content-Type: multipart/form-data

FormData:
  file: <binary_file>
  message: "Medical report"

// Response (201 Created)
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "user": "507f1f77bcf86cd799439011",
    "filename": "medical-report.pdf",
    "fileUrl": "http://localhost:4000/uploads/1234567890-medical-report.pdf",
    "file": "http://localhost:4000/uploads/1234567890-medical-report.pdf"
  }
}
```

### 4. Get User Documents

```javascript
// Request
GET http://localhost:4000/api/users/documents
Authorization: Bearer user_token

// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "filename": "medical-report.pdf",
      "file": "http://localhost:4000/uploads/1234567890-medical-report.pdf",
      "author": {
        "_id": "507f1f77bcf86cd799439011",
        "fullname": "Rajesh Kumar"
      },
      "createdAt": "2024-03-18T14:30:00Z"
    }
  ]
}
```

---

## Admin Operations

### 1. Get All Users

```javascript
// Request
GET http://localhost:4000/api/admin/users?page=1&search=rajesh
Authorization: Bearer admin_token

// Response (200 OK)
{
  "success": true,
  "pagination": {
    "page": 1,
    "limit": 15,
    "total": 156,
    "totalPages": 11
  },
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "fullname": "Rajesh Kumar",
      "email": "rajesh@email.com",
      "city": "Delhi",
      "role": "user",
      "createdAt": "2024-03-15T10:30:00Z"
    }
  ]
}
```

### 2. Delete User

```javascript
// Request
DELETE http://localhost:4000/api/admin/users/507f1f77bcf86cd799439011
Authorization: Bearer admin_token

// Response (200 OK)
{
  "success": true,
  "message": "User deleted successfully"
}
```

### 3. Approve Doctor

```javascript
// Request
PUT http://localhost:4000/api/admin/doctors/507f1f77bcf86cd799439012/approve
Authorization: Bearer admin_token
Content-Type: application/json

{
  "isApproved": true
}

// Response (200 OK)
{
  "success": true,
  "message": "Doctor approved successfully",
  "data": {
    // ... doctor data with isApproved: true
  }
}
```

### 4. Get Admin Statistics

```javascript
// Request
GET http://localhost:4000/api/admin/stats
Authorization: Bearer admin_token

// Response (200 OK)
{
  "success": true,
  "data": {
    "totalUsers": 234,
    "totalDoctors": 45,
    "totalAppointments": 1250,
    "thisMonthAppointments": 180,
    "appointmentsByStatus": [
      { "_id": "completed", "count": 800 },
      { "_id": "accepted", "count": 300 },
      { "_id": "pending", "count": 100 },
      { "_id": "cancelled", "count": 50 }
    ],
    "totalRevenue": 562500
  }
}
```

---

## Error Handling

### Common Error Responses

```javascript
// 400 Bad Request
{
  "success": false,
  "message": "Email and password are required"
}

// 401 Unauthorized
{
  "success": false,
  "message": "Not authorized, token failed"
}

// 403 Forbidden
{
  "success": false,
  "message": "Access denied. Required role: admin. Your role: user"
}

// 404 Not Found
{
  "success": false,
  "message": "Doctor not found"
}

// 409 Conflict
{
  "success": false,
  "message": "Email already registered"
}

// 500 Server Error
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Tips for Frontend Integration

1. **Always include token in Authorization header**

```javascript
const headers = {
  Authorization: `Bearer ${localStorage.getItem("token")}`,
};
```

2. **Handle token expiry**

```javascript
if (error.response?.status === 401) {
  localStorage.removeItem("token");
  window.location.href = "/login";
}
```

3. **Use date picker for appointment dates**
   - Only allow future dates
   - Disable weekends if needed

4. **Show loading states**
   - Disable buttons during API calls
   - Show spinners for user feedback

5. **Validate forms before submit**
   - Email format
   - Password strength (min 6 chars)
   - Phone number format

---

**Last Updated**: March 2024
