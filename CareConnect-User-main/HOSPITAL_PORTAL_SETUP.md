# Hospital Portal Implementation - Quick Setup Guide

## Overview

This document provides step-by-step instructions to get the Hospital Portal fully operational with real-time data fetching and video calling capabilities.

## Project Structure

```
src/
├── components/
│   ├── Pages/
│   │   ├── HospitalAppointments.jsx        ✅ Real-time polling enabled
│   │   ├── HospitalMedicalRecords.jsx       ✅ Real-time polling enabled
│   │   ├── HospitalLabReports.jsx           ✅ Real-time polling enabled
│   │   ├── HospitalAdmissions.jsx           ✅ Real-time polling enabled
│   │   ├── HospitalVideoCall.jsx            ⚙️ ZegoCloud integration ready
│   │   ├── HospitalBills.jsx                ✅ Completed (single load)
│   ├── HospitalPortalNav.jsx                ✅ Navigation component
│   ├── Navbar.jsx                           ✅ Main navigation
│   ├── Footer.jsx                           ✅ Footer
├── services/
│   ├── api.js                               ✅ Unified API service
├── hooks/
│   ├── useRealTime.js                       ✅ Real-time polling hooks
├── routes.jsx                               ✅ Route configuration
└── .env.example                             ✅ Environment variables
```

## What Has Been Completed ✅

### 1. Hospital Portal Pages (6 Complete Components)

- **HospitalAppointments** - View and manage appointments with video call integration
- **HospitalMedicalRecords** - Search and view medical history
- **HospitalLabReports** - Track lab test orders and download reports
- **HospitalAdmissions** - View admission history with medical details
- **HospitalBills** - View bills and payment status
- **HospitalVideoCall** - Video call interface (ZegoCloud ready)

### 2. Unified API Service Layer

- Centralized API calls for all hospital operations
- Proper error handling and authentication
- Automatic logout on 401 errors
- Support for real-time polling infrastructure

### 3. Real-time Data Polling

- **HospitalAppointments**: Polls every 5 seconds for live appointment updates
- **HospitalMedicalRecords**: Polls every 10 seconds for new records
- **HospitalLabReports**: Polls every 10 seconds for test status updates
- **HospitalAdmissions**: Polls every 10 seconds for admission changes

### 4. Navigation & Routing

- All hospital portal routes configured
- Responsive sidebar navigation (desktop & mobile)
- Quick navigation between portal sections

---

## Setup Instructions

### Step 1: Install Required Packages

```bash
# Install ZegoCloud SDK (Required for Video Calling)
npm install @zegocloud/zego-uikit-prebuilt

# Verify installation
npm list @zegocloud/zego-uikit-prebuilt
```

### Step 2: Configure ZegoCloud

1. Go to [ZegoCloud Console](https://console.zegocloud.com)
2. Create a new project or use existing one
3. Copy your **App ID** and **Server Secret**
4. Add to `.env.local`:

```env
REACT_APP_ZEGO_APP_ID=your_zego_app_id
REACT_APP_ZEGO_SERVER_SECRET=your_zego_server_secret
```

5. Restart dev server: `npm run dev`

### Step 3: Verify Backend Endpoints

The following endpoints must be available in your backend:

```
GET  /api/hospital/appointments              - User's appointments
GET  /api/hospital/medical-records           - Medical records list
GET  /api/hospital/lab-orders                - Lab orders
GET  /api/hospital/admissions                - Admissions
GET  /api/hospital/bills                     - Bills
POST /api/video/create-room                  - Create video room
POST /api/video/join-session                 - Join video call
POST /api/video/end-session                  - End video call
GET  /api/appointments/:id                   - Get appointment details
```

**Check backend status:**

```bash
curl http://localhost:5000/api/hospital/appointments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Step 4: Test Features

#### Test Real-time Polling

1. Open [http://localhost:3000/hospital/appointments](http://localhost:3000/hospital/appointments)
2. Create/update an appointment in another tab/window
3. Appointment should appear automatically within 5 seconds ✅

#### Test Medical Records

1. Open [http://localhost:3000/hospital/medical-records](http://localhost:3000/hospital/medical-records)
2. Add a new medical record in backend
3. Record appears within 10 seconds ✅

#### Test Video Calling

1. Open appointment with "confirmed" status
2. Click "Join Video Call" button
3. ZegoCloud interface should load
4. If SDK not configured: Placeholder interface shows
5. Video call ends → redirects to appointments

### Step 5: Configure Polling Intervals (Optional)

Edit `.env.local` to adjust polling frequencies:

```env
# In milliseconds - increase for slower updates, decrease for more frequent
REACT_APP_APPOINTMENT_POLL_INTERVAL=5000        # 5 seconds
REACT_APP_MEDICAL_RECORDS_POLL_INTERVAL=10000   # 10 seconds
REACT_APP_LAB_ORDERS_POLL_INTERVAL=10000        # 10 seconds
REACT_APP_ADMISSIONS_POLL_INTERVAL=10000        # 10 seconds
```

---

## Feature Details

### Real-time Polling Hook

Located at: `src/hooks/useRealTime.js`

**Usage in components:**

```javascript
import { useRealTimePolling } from "@/hooks/useRealTime";

useRealTimePolling(
  () => hospitalAPI.getAppointments(), // Fetch function
  (data) => setAppointments(data), // On success callback
  (error) => setError(error), // On error callback
  5000, // Polling interval (ms)
  !!token, // Enable/disable
);
```

### Video Call Integration

Located at: `src/components/Pages/HospitalVideoCall.jsx`

**Features:**

- ✅ ZegoCloud UI Kit Prebuilt integration
- ✅ Placeholder fallback if SDK unavailable
- ✅ Call duration tracking
- ✅ In-call messaging
- ✅ Mic/video toggle (when SDK active)
- ✅ Screen sharing ready (when SDK active)

**Environment Configuration:**

```javascript
const ZEGO_APP_ID = parseInt(process.env.REACT_APP_ZEGO_APP_ID || "0");
const ZEGO_SERVER_SECRET = process.env.REACT_APP_ZEGO_SERVER_SECRET || "";
```

---

## Common Issues & Solutions

### Issue: "ZegoCloud SDK not configured"

**Solution:** Ensure `.env.local` has `REACT_APP_ZEGO_APP_ID` and `REACT_APP_ZEGO_SERVER_SECRET`

### Issue: Polling not updating data

**Solution:** Check network tab → verify backend endpoint returns data with Bearer token

### Issue: Video call shows blank screen

**Solution:**

1. Verify ZegoCloud SDK installed: `npm list @zegocloud/zego-uikit-prebuilt`
2. Check console for SDK initialization errors
3. Verify App ID and Server Secret correct in `.env.local`

### Issue: CORS errors from backend

**Solution:** Backend needs to have CORS configured:

```javascript
// In backend express app
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
```

---

## Next Steps for Full Integration

### Immediate (High Priority)

1. **✅ DONE** - Create hospital portal pages
2. **✅ DONE** - Implement real-time polling
3. **⚙️ IN PROGRESS** - Configure ZegoCloud video SDK
4. **TODO** - Test all features with actual backend

### Short Term (Admin Portal)

1. Connect admin dashboard to hospital endpoints
2. Add patient/admission approval workflows
3. Create doctor management interface
4. Implement record approval system

### Short Term (Doctor Portal)

1. Enable doctors to create medical records
2. Enable doctors to order lab tests
3. Enable doctors to admit patients
4. Add prescription management

### Long Term (Enhancement)

1. WebSocket for real-time updates (replace polling)
2. Offline data caching
3. PDF export for bills/records
4. Appointment rescheduling
5. Prescription refill system

---

## API Service Reference

### Appointment Operations

```javascript
import { hospitalAPI } from "@/services/api";

// Get all user appointments
const data = await hospitalAPI.getMyAppointments();

// Get specific appointment
const appt = await hospitalAPI.getAppointmentDetails(appointmentId);

// Update appointment
const updated = await hospitalAPI.updateAppointment(appointmentId, data);
```

### Medical Records

```javascript
// Get all records
const records = await hospitalAPI.getMedicalRecords();

// Create new record
const newRecord = await hospitalAPI.createMedicalRecord(recordData);
```

### Video Calls

```javascript
import { videoAPI } from "@/services/api";

// Create room
const room = await videoAPI.createRoom(appointmentId);

// Join session
const session = await videoAPI.joinSession(roomId);

// End session
await videoAPI.endSession(roomId);
```

---

## Environment Variables Summary

```env
# REQUIRED
REACT_APP_ZEGO_APP_ID=your_zego_app_id
REACT_APP_ZEGO_SERVER_SECRET=your_zego_server_secret

# OPTIONAL (adjust polling speeds)
REACT_APP_APPOINTMENT_POLL_INTERVAL=5000
REACT_APP_MEDICAL_RECORDS_POLL_INTERVAL=10000
REACT_APP_LAB_ORDERS_POLL_INTERVAL=10000
REACT_APP_ADMISSIONS_POLL_INTERVAL=10000
```

---

## Support & Troubleshooting

For issues or questions:

1. Check console logs (F12 → Console tab)
2. Check network requests (F12 → Network tab)
3. Verify backend is running on correct port
4. Verify environment variables are set
5. Clear browser cache (`Ctrl+Shift+Delete`)

---

## Conclusion

Your Hospital Portal is now ready for:

- ✅ Real-time appointment tracking
- ✅ Medical records management
- ✅ Lab order tracking
- ✅ Admission history
- ✅ Bill management
- ⚙️ Video calling (pending ZegoCloud setup)

Configure ZegoCloud and you have a fully functional hospital patient portal!
