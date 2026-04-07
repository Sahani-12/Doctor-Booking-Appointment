# Admin Panel Requirements - Detailed Specification

## CRITICAL ITEMS FOR ADMIN PANEL

### 🔴 Priority 1: Doctor Approval System

**Why Critical:** New doctors cannot practice without admin approval. This blocks doctor onboarding.

**Backend Ready:** ✅ `PUT /api/admin/doctors/:id/approve`

**Frontend Needed:**

1. **Pending Doctors Queue**
   - Filter: Status = "isApproved: false"
   - Show all awaiting-approval doctors
   - Display: Name, Email, Phone, Specialization, Application Date

2. **Doctor Detail for Approval**
   - Full profile view
   - Credentials verification (degrees, certifications)
   - Experience & specializations
   - Two buttons: **Approve** | **Reject**
   - Optional rejection reason

3. **Batch Approval**
   - Select multiple doctors
   - Approve/reject multiple at once

---

### 🔴 Priority 2: Dashboard with Statistics

**Why Critical:** Admin needs overview of system health

**Backend Ready:** ✅ `GET /api/admin/stats`

**Frontend Needed:**

#### Stat Cards:

- Total Users (Patients)
- Total Doctors (Active)
- Total Appointments (This Month)
- Total Revenue (This Month)
- Pending Doctor Approvals (Alert if > 0)

#### Charts:

- Appointments over time (line chart)
- Appointments by specialization (pie/bar chart)
- User growth (line chart)
- Revenue trend (line chart)

#### Quick Actions:

- View pending approvals
- Recent appointments
- Recent transactions

---

### 🟠 Priority 3: User Management

**Backend Ready:** ✅ `GET/PUT/DELETE /api/admin/users`

**Frontend Needed:**

#### Users List Page

| Column  | Data             | Searchable |
| ------- | ---------------- | ---------- |
| Name    | fullname         | ✅         |
| Email   | email            | ✅         |
| Phone   | phone            | ✅         |
| City    | city             | ✅         |
| Joined  | createdAt        | ❌         |
| Status  | isVerified       | ✅         |
| Actions | View/Edit/Delete | -          |

**Features:**

- Search by name/email
- Pagination (20 per page)
- Sort by name/date
- Bulk delete option
- Status filters (verified/unverified)

#### User Detail Page

- Full profile data
- Edit fields
- View appointment history
- Delete user confirmation
- Last login info

---

### 🟠 Priority 4: Doctor Management

**Backend Ready:** ✅ `GET/PUT/DELETE /api/admin/doctors`

**Frontend Needed:**

#### Doctors List Page

| Column         | Data                     | Searchable |
| -------------- | ------------------------ | ---------- |
| Name           | fullname                 | ✅         |
| Email          | email                    | ✅         |
| Specialization | specialization[0]        | ✅         |
| Fee            | fee                      | ❌         |
| Status         | isApproved               | ✅         |
| Rating         | rating                   | ❌         |
| Actions        | View/Approve/Edit/Delete | -          |

**Features:**

- Search by name/email/specialization
- Filter: Approved/Pending/Rejected
- Filter: Verified/Unverified
- Pagination
- Bulk approve/delete
- Sort by rating, fee, date

#### Doctor Detail Page

- Full profile with credentials
- Edit specialization, fee, etc.
- Approval toggle if pending
- View ratings/feedback
- View appointments handled
- Delete with confirmation

---

### 🟡 Priority 5: Appointment Management

**Backend Ready:** ✅ `GET /api/admin/appointments`

**Frontend Needed:**

#### Appointments List Page

| Column  | Data             | Filterable |
| ------- | ---------------- | ---------- |
| Patient | patient.fullname | ✅         |
| Doctor  | doctor.fullname  | ✅         |
| Date    | date             | ✅         |
| Time    | slot             | ✅         |
| Status  | status enum      | ✅         |
| Type    | consultationType | ✅         |
| Paid    | isPaid           | ✅         |
| Actions | View/Cancel      | -          |

**Filters:**

- Status: pending/accepted/completed/cancelled
- Consultation type: online/offline
- Payment status: paid/unpaid
- Date range

**Pagination:** 25 per page

#### Appointment Detail Page

- Patient details + link
- Doctor details + link
- Full appointment info
- Patient notes
- Feedback (if completed)
- Prescription (if provided)
- Payment details
- Cancel option if pending

---

### 🟡 Priority 6: Payment/Transaction Management

**Backend Ready:** ⚠️ Partial (need to verify all payment endpoints)

**Frontend Needed:**

#### Transactions List Page

| Column         | Data                | Filterable |
| -------------- | ------------------- | ---------- |
| Transaction ID | transactionId       | ✅         |
| Patient        | userId.fullname     | ✅         |
| Doctor         | doctorId.fullname   | ✅         |
| Amount         | amount              | ✅         |
| Method         | paymentMethod       | ✅         |
| Gateway        | gateway             | ✅         |
| Status         | status              | ✅         |
| Date           | createdAt           | ✅         |
| Actions        | View/Receipt/Refund | -          |

**Filters:**

- Status: pending/success/failed/refunded
- Payment method: card/UPI/netbanking
- Gateway: stripe/razorpay/demo
- Date range
- Amount range

#### Transaction Detail Page

- Full transaction info
- Linked appointment
- Linked patient
- Linked doctor
- Receipt generation
- Refund capability (if eligible)
- Edit notes

---

### 🟢 Priority 7: Analytics & Reports

**Backend Ready:** ✅ `GET /api/admin/analytics/users-report`

**Frontend Needed:**

#### User Analytics

- Total users over time (line chart)
- Users by city (bar chart)
- Users by gender (pie chart)
- New users (daily/weekly/monthly)
- Active users percentage

#### Appointment Analytics

- Total appointments over time
- Appointments by specialization
- Appointment success rate %
- Average delay time
- Appointments by doctor (top performers)

#### Revenue Analytics

- Total revenue by time period
- Revenue by payment method
- Revenue by doctor
- Revenue by specialization
- Average transaction value

---

## ADMIN PANEL PAGES STRUCTURE

```
Admin Frontend (React + TypeScript)
│
├── Public Pages
│   └── /login (Admin login)
│
└── Protected Pages (Admin role only)
    ├── /dashboard (Statistics overview)
    ├── /users (User management)
    ├── /users/:id (User detail)
    ├── /doctors (Doctor management)
    ├── /doctors/pending (Pending approvals - CRITICAL)
    ├── /doctors/:id (Doctor detail)
    ├── /appointments (Appointment list)
    ├── /appointments/:id (Appointment detail)
    ├── /payments (Transaction list)
    ├── /payments/:id (Transaction detail)
    ├── /analytics
    │   ├── /users
    │   ├── /appointments
    │   └── /revenue
    └── /settings
        ├── /notifications
        ├── /email-templates
        └── /system-config
```

---

## KEY BACKEND ENDPOINTS FOR ADMIN

```javascript
// Authentication
POST   /api/auth/login              // Admin login
GET    /api/auth/me                 // Get current admin user
POST   /api/auth/logout             // Logout

// User Management
GET    /api/admin/users?page=1&limit=20&search=  // List users
GET    /api/admin/users/:id                       // Get user detail
PUT    /api/admin/users/:id                       // Update user
DELETE /api/admin/users/:id                       // Delete user

// Doctor Management
GET    /api/admin/doctors?page=1&limit=20&search=  // List doctors
GET    /api/admin/doctors/:id                       // Get doctor detail
PUT    /api/admin/doctors/:id/approve              // APPROVE DOCTOR ⭐
DELETE /api/admin/doctors/:id                      // Delete doctor

// Appointment Management
GET    /api/admin/appointments?status=&page=1&limit=25  // List appointments
GET    /api/admin/appointments/:id                       // Get appointment detail

// Statistics & Analytics
GET    /api/admin/stats                           // Dashboard stats
GET    /api/admin/analytics/users-report          // User analytics
```

---

## COMPONENTS NEEDED FOR ADMIN FRONTEND

```
components/
├── common/
│   ├── Sidebar.tsx          # Admin sidebar navigation
│   ├── Navbar.tsx           # Top navbar
│   ├── ProtectedRoute.tsx   # Route protection component
│   └── LoadingSkeleton.tsx  # Loading state
├── Dashboard/
│   ├── StatsCard.tsx        # Stat card component
│   ├── Chart.tsx            # Chart wrapper
│   └── QuickActions.tsx     # Quick action buttons
├── Users/
│   ├── UsersTable.tsx       # Users list table
│   ├── UserDetailModal.tsx  # User detail modal
│   └── UserForm.tsx         # User edit form
├── Doctors/
│   ├── DoctorsTable.tsx     # Doctors list table
│   ├── DoctorDetailModal.tsx # Doctor detail modal
│   ├── DoctorApprovalForm.tsx # Approval form
│   └── PendingDoctorsCard.tsx # Pending count card
├── Appointments/
│   ├── AppointmentsTable.tsx # Appointments list
│   ├── AppointmentFilters.tsx # Filter controls
│   └── AppointmentDetail.tsx # Detail view
├── Payments/
│   ├── TransactionsTable.tsx # Transactions list
│   ├── TransactionDetail.tsx # Detail view
│   └── RefundForm.tsx        # Refund process
└── ui/
    ├── Button.tsx
    ├── Modal.tsx
    ├── DataTable.tsx
    ├── Pagination.tsx
    ├── SearchInput.tsx
    └── Select.tsx
```

---

## SUCCESS CRITERIA FOR ADMIN PANEL

The admin panel is complete when:

- [ ] Admin can login with admin credentials
- [ ] Dashboard shows real-time stats from backend
- [ ] Admin can view all users with search/filter
- [ ] Admin can delete users
- [ ] Admin can view all doctors with search/filter
- [ ] **Admin can approve pending doctors** ⭐ CRITICAL
- [ ] Admin can reject/delete doctors
- [ ] Admin can view all appointments
- [ ] Admin can filter appointments by status
- [ ] Admin can view payment transactions
- [ ] Admin can process refunds
- [ ] Admin can view user analytics
- [ ] Admin can view appointment analytics
- [ ] Admin can view revenue analytics
- [ ] All data tables are paginated
- [ ] All lists are searchable/filterable
- [ ] Responsive design on mobile

---

## IMMEDIATE ACTION ITEMS

1. **Create project structure** - Setup same as Doctor frontend
2. **Setup authentication** - Copy auth pattern from user/doctor frontends
3. **Create Dashboard page** - First page, shows all key stats
4. **Create Doctor Approval page** - **DO THIS SECOND** (highest business value)
5. **Create User Management** - List, search, delete
6. **Create Doctor Management** - Full CRUD
7. **Create Appointments view** - Read-only listing
8. **Create Analytics pages** - Charts and reports

---

## COMPARISON: What Each Frontend Has

| Feature            | User Frontend   | Doctor Frontend | Admin Frontend            |
| ------------------ | --------------- | --------------- | ------------------------- |
| Auth               | ✅ Yes          | ✅ Yes          | ❌ NEEDED                 |
| Dashboard          | ✅ Yes          | ✅ Yes          | ❌ NEEDED                 |
| Profile Management | ✅ Own only     | ✅ Own only     | ❌ NEEDED (All users)     |
| Search/Filter      | ✅ Doctors      | ✅ Patients     | ❌ NEEDED (Users/Doctors) |
| Data Tables        | ✅ Appointments | ✅ Tables       | ❌ NEEDED                 |
| Charts/Analytics   | ✅ Partial      | ✅ Yes          | ❌ NEEDED                 |
| Approval System    | ❌ N/A          | ❌ N/A          | ❌ **CRITICAL - NEEDED**  |
| Payment Interface  | ✅ Yes          | ❌ No           | ❌ NEEDED                 |
