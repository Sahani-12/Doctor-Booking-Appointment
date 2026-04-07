# CareConnect Admin Panel

Complete admin panel for the CareConnect Doctor Booking System built with React, TypeScript, and Tailwind CSS.

## Features

✅ **Admin Authentication** - Secure login system  
✅ **Doctor Approval Workflow** - Review and approve/reject pending doctors  
✅ **User Management** - View and manage patient accounts  
✅ **Doctor Management** - Manage doctor profiles and status  
✅ **Appointment Monitoring** - Track all appointments  
✅ **Payment Gateway** - Monitor all transactions  
✅ **Dashboard Statistics** - Real-time system metrics  
✅ **Dark Mode Support** - Beautiful dark/light theme  
✅ **Responsive Design** - Works on all devices

## Project Structure

```
CareConnect-Admin/
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── DoctorApprovalsPage.tsx
│   │   ├── DoctorsPage.tsx
│   │   ├── UsersPage.tsx
│   │   ├── AppointmentsPage.tsx
│   │   ├── PaymentsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── services/
│   ├── utils/
│   ├── App.tsx
│   ├── routes.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## Installation

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend server running on http://localhost:3000

### Step 1: Install Dependencies

```bash
cd CareConnect-Admin
npm install
```

### Step 2: Setup Environment

Create a `.env.local` file (optional):

```
VITE_API_BASE_URL=http://localhost:3000/api
```

### Step 3: Start Development Server

```bash
npm run dev
```

The admin panel will be available at: **http://localhost:5173**

## Building for Production

```bash
npm run build
npm run preview
```

## Login Credentials

**Test Admin Account:**

```
Email: admin@careconnect.com
Password: admin123
```

**Note:** Update these credentials in your backend before deployment.

## Key API Endpoints Used

### Authentication

- `POST /api/auth/admin-login` - Admin login

### Dashboard

- `GET /api/admin/dashboard` - Get dashboard statistics

### Doctor Management

- `GET /api/admin/doctors` - List all doctors
- `GET /api/admin/doctors/pending` - List pending approvals
- `PUT /api/admin/doctors/:id/approve` - Approve/reject doctor
- `DELETE /api/admin/doctors/:id` - Delete doctor

### User Management

- `GET /api/admin/users` - List all users
- `DELETE /api/admin/users/:id` - Delete user

### Appointment Management

- `GET /api/admin/appointments` - List all appointments

### Payment Gateway

- `GET /api/admin/payments` - List all transactions

## Features Breakdown

### 1. Doctor Approval System ⭐ CRITICAL

The most important feature - allows admins to:

- View pending doctor registrations
- Review doctor qualifications and credentials
- Approve qualified doctors
- Reject unqualified doctors
- Manage all doctor accounts

### 2. Dashboard

- Total users count
- Total approved doctors
- Pending doctor approvals
- Total appointments scheduled
- Total revenue generated

### 3. User Management

- View all registered patients
- Search users by name/email/phone
- Delete user accounts
- View user details

### 4. Doctor Management

- View all doctors (approved/pending/rejected)
- Search doctors by name/specialization
- Delete doctor accounts
- Status filtering

### 5. Appointment Tracking

- View all appointments
- Monitor appointment status
- See patient-doctor mappings
- Track appointment dates

### 6. Payment Monitoring

- View all transactions
- Track payment status
- Monitor revenue
- Payment method tracking

## Customization

### Adding New Pages

1. Create page component in `src/pages/YourPage.tsx`
2. Add route in `src/routes.tsx`
3. Add menu item in `src/layout/Sidebar.tsx`

### Styling

- Tailwind CSS classes are used throughout
- Customize theme in `tailwind.config.js`
- Both light and dark modes are supported

### API Integration

All API calls are made with JWT token authentication:

```typescript
const response = await fetch("http://localhost:3000/api/admin/route", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## Troubleshooting

### Port Already in Use

```bash
# Use a different port
npm run dev -- --port 5174
```

### CORS Errors

- Ensure backend is running on port 3000
- Update proxy in vite.config.ts if needed

### Login Failed

- Verify backend is running
- Check admin credentials
- Ensure JWT token is being saved

## Tech Stack

- **Frontend Framework:** React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Icons:** Lucide React
- **State Management:** React Context API
- **HTTP Client:** Fetch API

## Performance Optimization

- Code splitting with React.lazy()
- Lazy loaded routes
- Optimized re-renders with useCallback
- Memoized components

## Security

- JWT-based authentication
- Protected routes with ProtectedRoute component
- Token stored in localStorage
- Logout clears all sensitive data
- HTTPS recommended for production

## Browser Support

- Chrome/Edge (Latest)
- Firefox (Latest)
- Safari (Latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit pull request

## License

All rights reserved. CareConnect System

## Support

For issues and feature requests, contact the development team.

---

**Last Updated:** March 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
