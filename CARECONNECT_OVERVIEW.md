# CareConnect Hospital Management System - Bills & Lab Orders Overview

## Project Summary

CareConnect is a comprehensive hospital management system with three main applications:

1. **CareConnect-Admin** - Hospital administration panel
2. **CareConnectDoctors-main** - Doctor portal
3. **CareConnect-User-main** - Patient portal

---

## 1. ADMIN PANEL (CareConnect-Admin)

### Pages & Components

#### 1.1 Billing Management

- **File**: [src/pages/AdminBilling.tsx](CareConnect-Admin/src/pages/AdminBilling.tsx)
- **Route**: `/admin/billing`
- **Features**:
  - View all bills with pagination and filtering
  - Create new bills
  - Update bill status (paid, partially-paid, pending, cancelled)
  - Settle bills (mark as fully paid)
  - Cancel bills
  - Filter by status: all, pending, partially-paid, paid, cancelled
  - Display: Bill number, amount, due date, status, patient/doctor/department

#### 1.2 Lab Orders Management

- **File**: [src/pages/AdminLabOrders.tsx](CareConnect-Admin/src/pages/AdminLabOrders.tsx)
- **Route**: `/admin/lab-orders`
- **Features**:
  - View all lab orders
  - Create new lab orders
  - Edit existing lab orders
  - Update order status through workflow: ordered → sample-collected → processing → completed
  - Manage priority levels (routine, urgent, critical)
  - Filter by status
  - Display: Order number, patient, tests, status, priority, clinical notes

### API Endpoints Used

| Method | Endpoint                   | Purpose                                 | Auth   |
| ------ | -------------------------- | --------------------------------------- | ------ |
| GET    | `/hospital/bills`          | Fetch all bills                         | Admin  |
| POST   | `/hospital/bills`          | Create new bill                         | Admin  |
| PUT    | `/hospital/bills/:id`      | Update bill status/payment              | Admin  |
| GET    | `/hospital/lab-orders`     | Fetch all lab orders                    | Admin  |
| POST   | `/hospital/lab-orders`     | Create new lab order                    | Admin  |
| PUT    | `/hospital/lab-orders/:id` | Update lab order (status, tests, notes) | Admin  |
| GET    | `/hospital/patients`       | Fetch patients for dropdowns            | Admin  |
| GET    | `/admin/doctors`           | Fetch doctors for dropdowns             | Admin  |
| GET    | `/hospital/departments`    | Fetch departments for dropdowns         | Public |

### Data Model Examples

**Bill Object**:

```typescript
type Bill = {
  _id: string;
  billNumber: string;
  status: "pending" | "partially-paid" | "paid" | "cancelled";
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  dueDate?: string;
  issuedAt?: string;
  paymentMethod?: string;
  notes?: string;
  patient?: { _id: string; fullname: string };
  doctor?: { _id: string; fullname: string };
  department?: { _id: string; name: string };
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
};
```

**Lab Order Object**:

```typescript
type LabOrder = {
  _id: string;
  orderNumber: string;
  status: "ordered" | "sample-collected" | "processing" | "completed";
  priority: "routine" | "urgent" | "critical";
  clinicalNotes?: string;
  orderedAt?: string;
  patient?: { _id: string; fullname: string };
  doctor?: { _id: string; fullname: string };
  department?: { _id: string; name: string };
  tests?: Array<{ name: string; category?: string; status?: string }>;
};
```

### Data Loading Strategy

**Real-time Updates**: ❌ **NOT IMPLEMENTED**

- Data loads once on component mount via `useEffect`
- No automatic polling or WebSocket connections
- Manual refresh required after state changes
- After creating/updating data, component calls `loadAll()` to refresh

**Code Pattern**:

```typescript
useEffect(() => {
  void loadAll();
}, []);

const loadAll = async () => {
  try {
    setLoading(true);
    const [billPayload, patientPayload, doctorPayload, deptPayload] =
      await Promise.all([
        request("/hospital/bills"),
        request("/hospital/patients"),
        request("/admin/doctors"),
        fetch(`${API_BASE}/hospital/departments`).then((r) => r.json()),
      ]);
    // Update state...
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Failed to load billing data",
    );
  } finally {
    setLoading(false);
  }
};
```

### API Service Configuration

- **File**: [src/services/apiService.ts](CareConnect-Admin/src/services/apiService.ts)
- **Client**: Axios instance with interceptors
- **Base URL Configuration**:
  - Local development: `http://localhost:4000/api`
  - Production: `https://doctor-booking-appointment-i137.onrender.com/api`
  - Auto-configured based on environment

---

## 2. DOCTOR PANEL (CareConnectDoctors-main)

### Pages & Components

#### 2.1 Lab Orders - Creation

- **File**: [src/pages/CreateLabOrderPage.tsx](CareConnectDoctors-main/src/pages/CreateLabOrderPage.tsx)
- **Route**: `/create-lab-order`
- **Features**:
  - Select patient from their patient list
  - Add multiple lab tests from predefined list or custom tests
  - Set urgency level (normal/urgent)
  - Add clinical notes
  - Submit lab order for hospital processing
  - Success/error messaging

**Available Lab Tests** (predefined):

- Complete Blood Count (CBC)
- Liver Function Test (LFT)
- Kidney Function Test (KFT)
- Thyroid Function Test (TFT)
- Glucose Fasting
- Lipid Profile
- Cardiac Markers (Troponin)
- COVID-19 RT-PCR
- Urinalysis
- Stool Test
- Blood Culture
- Chest X-Ray

#### 2.2 Bills & Lab Orders - Viewing

- **File**: [src/pages/PatientsHubPage.tsx](CareConnectDoctors-main/src/pages/PatientsHubPage.tsx)
- **Route**: `/patients-hub`
- **Features**:
  - View list of all patients
  - Select a patient to view detailed summary
  - View patient's bills with amounts and due dates
  - View patient's lab orders with tests and status
  - View medical records
  - View admissions
  - View appointments
  - Dashboard stats: total appointments, records, admissions, lab orders, outstanding balance

**Patient Summary Data Structure**:

```typescript
type Summary = {
  patient: Patient;
  stats: {
    appointments: number;
    records: number;
    admissions: number;
    labOrders: number;
    outstandingBalance: number;
  };
  appointments: AppointmentItem[];
  records: RecordItem[];
  admissions: AdmissionItem[];
  labOrders: LabOrderItem[];
  bills: BillItem[];
};
```

### API Endpoints Used

| Method | Endpoint                                | Purpose                                                    | Auth   |
| ------ | --------------------------------------- | ---------------------------------------------------------- | ------ |
| POST   | `/doctor/lab-orders`                    | Create new lab order                                       | Doctor |
| GET    | `/doctor/lab-orders`                    | Fetch doctor's lab orders                                  | Doctor |
| PUT    | `/doctor/lab-orders/:id`                | Update lab order                                           | Doctor |
| GET    | `/hospital/patients/:patientId/summary` | Get patient complete summary (includes bills & lab orders) | Doctor |
| GET    | `/hospital/patients`                    | Fetch all patients (doctor's patients)                     | Doctor |
| GET    | `/hospital/departments`                 | Fetch departments                                          | Public |

### API Service

- **File**: [src/services/apiService.ts](CareConnectDoctors-main/src/services/apiService.ts)
- **Client**: Axios instance with interceptors
- **Token Storage**: localStorage (doctorToken) or sessionStorage
- **Base URL**: `http://localhost:4000/api` (development) or configured via VITE_API_URL

### Data Loading Strategy

**Real-time Updates**: ❌ **NOT IMPLEMENTED**

- Initial load on component mount via `useEffect`
- Loads patients list and departments on page entry
- Loads patient summary when a patient is selected
- No automatic polling or WebSocket connections
- Manual refresh after creating new records

**Code Pattern**:

```typescript
const loadSummary = async (patientId: string) => {
  if (!patientId || !token) return;
  try {
    setSummaryLoading(true);
    const payload = await request(`/hospital/patients/${patientId}/summary`);
    setSummary(payload.data as Summary);
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Failed to load patient summary",
    );
  } finally {
    setSummaryLoading(false);
  }
};

useEffect(() => {
  // Load patients and departments on mount
  void load();
}, [token, queryPatientId]);
```

---

## 3. BACKEND API STRUCTURE (CareConnect-backend)

### Bills Endpoints

**Route File**: [src/routes/hospital.js](CareConnect-backend/src/routes/hospital.js)

```javascript
router.get("/bills", getBills); // GET - No auth required
router.post("/bills", authorize("admin"), createBill); // POST - Admin only
router.put("/bills/:id", authorize("admin"), updateBill); // PUT - Admin only
```

### Lab Orders Endpoints

```javascript
router.get("/lab-orders", getLabOrders); // GET - No auth required
router.post("/lab-orders", authorize("doctor", "admin"), createLabOrder); // POST - Doctor/Admin
router.put("/lab-orders/:id", authorize("doctor", "admin"), updateLabOrder); // PUT - Doctor/Admin
```

### Patient Summary Endpoint

```javascript
router.get("/patients/:patientId/summary", getPatientSummary); // GET - Protected by protect middleware
```

**This endpoint returns complete patient data including:**

- Patient info
- Appointments
- Medical records
- Admissions
- Lab orders
- Bills
- Statistics

### Database Models

- **Bill Model**: [src/models/Bill.js](CareConnect-backend/src/models/Bill)
- **LabOrder Model**: [src/models/LabOrder.js](CareConnect-backend/src/models/LabOrder)
- **User Model**: [src/models/User.js](CareConnect-backend/src/models/User)
- **Doctor Model**: [src/models/Doctor.js](CareConnect-backend/src/models/Doctor)

---

## 4. REAL-TIME DATA UPDATES ANALYSIS

### Current Implementation

**Admin Panel**:

- ❌ No automatic polling or WebSocket
- Manual refresh pattern: Load on mount → Update on action → Reload full list

**Doctor Panel**:

- ❌ No automatic polling or WebSocket
- Manual refresh pattern: Load patient summary → Update after action → Reload summary

**Patient Portal** (CareConnect-User-main):

- ✅ **Uses Polling with setInterval**
  - HospitalPortal.jsx: Polls every 10 seconds (`setInterval(loadDashboard, 10000)`)
  - LabReportsPage.jsx: Polls every 5 seconds (`setInterval(fetchReports, 5000)`)
  - ActiveAdmissionPage.jsx: Polls every 10 seconds (`setInterval(fetchAdmission, 10000)`)
  - Uses custom hook: [useRealTime.js](CareConnect-User-main/src/hooks/useRealTime.js)

### Real-Time Polling Hook

**File**: [src/hooks/useRealTime.js](CareConnect-User-main/src/hooks/useRealTime.js)

Features:

- `useRealTimePolling()` - Polling-based real-time updates
- `useWebSocketConnection()` - WebSocket support (defined but not actively used in billing/lab orders)
- Automatic reconnection with exponential backoff
- Prevents overlapping requests
- Cleanup on unmount

**Usage Example**:

```javascript
const intervalId = setInterval(() => fetchReports(true), 5000); // Poll every 5 seconds
```

### Recommendations for Real-Time Updates

1. **Option 1: Add Polling to Admin/Doctor Panels**
   - Use similar pattern to patient portal
   - Poll every 10-30 seconds for bill/lab order updates
   - Disable polling when tab is not visible

2. **Option 2: Implement WebSocket**
   - Already has WebSocket hook infrastructure in patient portal
   - Extend to admin and doctor panels
   - Real-time push updates instead of polling

3. **Option 3: Use Server-Sent Events (SSE)**
   - Lightweight alternative to WebSocket
   - Good for one-way server-to-client updates

---

## 5. COMPONENT HIERARCHY & FLOW

### Admin Panel - Bill Management Flow

```
AdminBilling.tsx (Page)
├── Load bills, patients, doctors, departments
├── Display bills table
├── Filter by status
├── Actions: Create, Settle, Cancel
└── Refresh on state changes
```

### Admin Panel - Lab Orders Flow

```
AdminLabOrders.tsx (Page)
├── Load lab orders, patients, doctors, departments
├── Display orders table
├── Filter by status
├── Manage workflow status transitions
├── Actions: Create, Edit, Update Status
└── Refresh on state changes
```

### Doctor Panel - Patient Hub Flow

```
PatientsHubPage.tsx (Page)
├── Load patient list
├── Load departments
├── Select patient
├── Fetch patient summary (includes bills & lab orders)
├── Display: appointments, records, admissions, lab orders, bills
└── Actions: Create records, admissions, lab orders
```

---

## 6. API CONFIGURATION & ENVIRONMENT

### Environment Variables

**Admin Panel** - [src/constants/api.ts](CareConnect-Admin/src/constants/api.ts):

```typescript
const LOCAL_API_ORIGIN = "http://localhost:4000";
const REMOTE_API_ORIGIN = "https://doctor-booking-appointment-i137.onrender.com";

export const API_BASE = ...normalize to /api path
```

**Doctor Panel** - [src/constants/api.ts](CareConnectDoctors-main/src/constants/api.ts):

```typescript
const LOCAL_API_ORIGIN = "http://localhost:4000";
const REMOTE_API_ORIGIN = "https://doctor-booking-appointment-i137.onrender.com";

export const API_BASE = ...normalize to /api path
```

### VITE Configuration

- Can be overridden via `VITE_API_URL` environment variable
- Auto-detects local vs production based on frontend hostname
- Normalizes API base to always end with `/api`

---

## 7. STATUS COLORS & STYLING

### Bill Statuses

- **Paid**: Emerald (green)
- **Partially-Paid**: Sky (blue)
- **Pending**: Amber (yellow)
- **Cancelled**: Rose (red)
- **Other**: Slate (gray)

### Lab Order Statuses

- **Completed**: Emerald (green)
- **Processing**: Sky (blue)
- **Sample-Collected**: Violet (purple)
- **Ordered**: Amber (yellow)
- **Other**: Slate (gray)

### Lab Order Priority

- **Urgent**: Orange
- **Critical**: Rose (red)
- **Routine**: Slate (gray)

---

## 8. AUTHENTICATION & AUTHORIZATION

### Token Management

**Admin Panel**:

- Token stored in localStorage as `adminToken`
- Passed in Authorization header: `Bearer ${token}`
- 401 response triggers logout and redirect to `/login`

**Doctor Panel**:

- Token stored in localStorage as `doctorToken` or sessionStorage
- Passed in Authorization header: `Bearer ${token}`
- 401 response triggers logout and redirect to `/`

### Authorization Levels

| Endpoint                  | Public | Doctor | Admin | Patient |
| ------------------------- | ------ | ------ | ----- | ------- |
| GET /bills                | ✓      | ✓      | ✓     | ✓       |
| POST /bills               | ✗      | ✗      | ✓     | ✗       |
| PUT /bills/:id            | ✗      | ✗      | ✓     | ✗       |
| GET /lab-orders           | ✓      | ✓      | ✓     | ✓       |
| POST /lab-orders          | ✗      | ✓      | ✓     | ✗       |
| PUT /lab-orders/:id       | ✗      | ✓      | ✓     | ✗       |
| GET /patients/:id/summary | ✓      | ✓      | ✓     | ✓       |

---

## Summary Table

| Aspect                   | Admin Panel                           | Doctor Panel                         |
| ------------------------ | ------------------------------------- | ------------------------------------ |
| **Bill Management**      | View, Create, Update, Settle, Cancel  | View only (in patient summary)       |
| **Lab Order Management** | View, Create, Edit, Update Status     | Create, View, Edit                   |
| **Real-time Updates**    | Manual refresh only                   | Manual refresh only                  |
| **Patient Access**       | All hospital patients                 | Own patient list only                |
| **API Client**           | Axios + apiService                    | Axios + apiService                   |
| **Data Refresh**         | On mount, after actions               | On mount, after actions              |
| **Key Routes**           | `/admin/billing`, `/admin/lab-orders` | `/patients-hub`, `/create-lab-order` |

---

**Document Generated**: April 18, 2026  
**Last Updated**: Current Session  
**Projects Analyzed**: CareConnect-Admin, CareConnectDoctors-main, CareConnect-backend
