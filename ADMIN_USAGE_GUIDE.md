# 🚀 How to Use Admin Panel - Quick Start

## Login Credentials
- **Email:** admin@careconnect.com
- **Password:** admin123
- **URL:** http://localhost:5178

---

## Users Page Quick Guide

### 👥 View Users
- Shows all users from database
- Each row has: Name, Email, Phone, City, Verification Status

### 🔍 Search Users
- Type in search box to find users
- Searches: Name, Email
- Updates in real-time

### 🎯 Filter Users
- **All (X)** - All users total
- **Verified ✓ (X)** - Verified users count
- **Pending ⏳ (X)** - Pending users count

### 👁️ View User Details
- Click user row to open modal
- See: Name, Email, Phone, City, Status, Joined Date
- Buttons: Verify/Unverify, Delete, Close

### ✓ Verify User
- Click ✓ icon next to user
- Changes from Pending → Verified
- No page reload
- Instant update

### ✗ Unverify User
- Click ✗ icon next to verified user
- Changes from Verified → Pending
- No page reload

### 🗑️ Delete User
- Click trash icon
- Confirm in popup
- User removed from database

---

## Doctors Page Quick Guide

### 👨‍⚕️ View Doctors
- Shows all doctors from database
- Each row has: Name, Email, Specialization, Experience, Status

### 🔍 Search Doctors
- Type in search box to find doctors
- Searches: Name, Email, Specialization
- Updates in real-time

### 🎯 Filter Doctors
- **All (X)** - All doctors total
- **Approved ✓ (X)** - Approved doctors count
- **Pending ⏳ (X)** - Pending doctors count

### 👁️ View Doctor Details
- Click doctor row to open modal
- See: Name, Email, Phone, City, Specialization, Experience, Status
- Buttons: Approve/Reject, Delete, Close

### ✓ Approve Doctor
- Click ✓ icon next to pending doctor
- Changes from Pending → Approved
- No page reload
- Instant update

### ✗ Reject Doctor
- Click ✗ icon next to approved doctor
- Changes from Approved → Pending
- No page reload

### 🗑️ Delete Doctor
- Click trash icon
- Confirm in popup
- Doctor removed from database

---

## Icon Reference

| Icon | Meaning | Click to |
|------|---------|----------|
| 👁️ | View | Open details modal |
| ✓ | Verify/Approve | Toggle status (change to green) |
| ✗ | Unverify/Reject | Toggle status (change to yellow) |
| 🗑️ | Delete | Remove from database |
| ⏳ | Loading | Wait... operation in progress |

---

## Status Colors

**Users:**
- 🟢 **Verified** (✓) - Green badge, verified user
- 🟡 **Pending** (⏳) - Yellow badge, awaiting verification

**Doctors:**
- 🟢 **Approved** (✓) - Green badge, approved doctor
- 🟡 **Pending** (⏳) - Yellow badge, awaiting approval

---

## Common Tasks

### Verify 1 User
1. Go to Users page
2. Click ✓ icon next to user
3. Done! Status updated to Verified ✓

### Approve 1 Doctor
1. Go to Doctors page
2. Click ✓ icon next to doctor
3. Done! Status updated to Approved ✓

### Find Specific User
1. Go to Users page
2. Type name/email in search box
3. Table filters automatically

### See All Pending Users
1. Go to Users page
2. Click "Pending (X)" filter button
3. See only users awaiting verification

### See All Pending Doctors
1. Go to Doctors page
2. Click "Pending (X)" filter button
3. See only doctors awaiting approval

### Delete a User
1. Find user in table
2. Click 🗑️ icon
3. Confirm deletion
4. User removed

---

## Real-Time Features

✅ **No Page Reload** - Changes happen instantly
✅ **Live Counts** - Filter counts update automatically
✅ **Instant Modal** - Details popup opens immediately
✅ **Status Badges** - Colors change right away
✅ **Error Messages** - Problems show instantly

---

## What Each Page Does

| Page | Purpose | Features |
|------|---------|----------|
| Users | Manage users | Search, Filter, Verify, Delete |
| Doctors | Manage doctors | Search, Filter, Approve, Delete |
| Appointments | View bookings | See all appointments |
| Payments | Track revenue | See all transactions |
| Doctor Approvals | Approve pending | Workflow for new doctors |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't login | Check credentials: admin@careconnect.com / admin123 |
| Page won't load | Start backend: npm start in CareConnect-backend |
| No data shows | Check MongoDB connection |
| Changes don't update | Refresh page |
| Modal won't close | Click Close button |
| Filter shows 0 | Check if users/doctors exist in database |

---

## Admin Workflow Example

```
1. Admin logs in (admin@careconnect.com / admin123)
2. Sees dashboard with statistics
3. Clicks Users page
4. Types user name in search box to find user
5. Clicks user row to view details in modal
6. Clicks ✓ icon to verify user
7. Sees status change to Verified immediately
8. Clicks Close to close modal
9. Clicks Doctors page
10. Clicks "Pending" filter to see doctors awaiting approval
11. Clicks doctor row to view specialization and experience
12. Clicks ✓ icon to approve doctor
13. Status changes to Approved immediately
14. Can click ✓ again to reject if needed
```

---

## Key Features

### Users Page
- ✅ View all users
- ✅ Search by name/email
- ✅ Filter by verification status
- ✅ Verify/Unverify with one click
- ✅ View full user details
- ✅ Delete users
- ✅ Live count updates

### Doctors Page
- ✅ View all doctors
- ✅ Search by name/email/specialization
- ✅ Filter by approval status
- ✅ Approve/Reject with one click
- ✅ View full doctor details
- ✅ Delete doctors
- ✅ Live count updates

---

## Performance

- ⚡ Instant status updates (no reload)
- ⚡ Real-time search filtering
- ⚡ Smooth animations
- ⚡ Fast modal opening
- ⚡ Responsive design

---

## Get Started

1. **Go to:** http://localhost:5178
2. **Login with:** admin@careconnect.com / admin123
3. **Click:** Users or Doctors
4. **Start:** Searching, filtering, and managing!

---

**That's it! You now have full control over all user and doctor data from the admin panel.** 🎉
