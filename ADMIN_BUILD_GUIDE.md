# ADMIN PANEL BUILD GUIDE - Quick Start

## ⚡ 5-Minute Overview

**What you need to build:** Admin frontend - a React/TypeScript dashboard  
**Where:** `CareConnect-Admin-main/` folder (currently empty)  
**Backend:** Already ready - all APIs exist  
**Timeline:** 5-7 days for MVP  
**Priority #1:** Doctor approval system

---

## 🎯 PHASE 1: PROJECT SETUP (1-2 hours)

### Step 1: Create base structure

```bash
cd CareConnect-Admin-main

# Create folders
mkdir src
mkdir src/pages
mkdir src/components
mkdir src/services
mkdir src/hooks
mkdir src/context
mkdir src/types
mkdir src/utils
mkdir public
```

### Step 2: Initialize project (copy from doctor frontend)

```bash
npm init -y

npm install \
  react@18 \
  react-dom@18 \
  react-router@latest \
  axios \
  recharts \
  date-fns \
  react-hot-toast \
  lucide-react

npm install -D \
  vite \
  @vitejs/plugin-react \
  typescript \
  @types/react \
  @types/react-dom \
  @types/node \
  tailwindcss \
  postcss \
  autoprefixer \
  eslint
```

### Step 3: Setup configuration files

Create `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tailwind.config.js`:

```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

---

## 🏗 PHASE 2: CORE STRUCTURE (2-3 hours)

### Step 1: Create context for auth

File: `src/context/AdminContext.tsx`

```typescript
import { createContext, useState, useContext } from 'react'

interface AdminContextType {
  user: any | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('adminToken'))

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await response.json()
      if (data.token) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('adminToken', data.token)
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('adminToken')
  }

  return (
    <AdminContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) throw new Error('useAdmin must be used within AdminProvider')
  return context
}
```

### Step 2: Create API service

File: `src/services/api.ts`

```typescript
import axios from "axios";

const API_URL = "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminAPI = {
  // Auth
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  // Users
  getUsers: (page = 1, limit = 20, search = "") =>
    api.get(`/admin/users?page=${page}&limit=${limit}&search=${search}`),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),

  // Doctors
  getDoctors: (page = 1, limit = 20, search = "") =>
    api.get(`/admin/doctors?page=${page}&limit=${limit}&search=${search}`),
  approveDoctor: (id: string, isApproved: boolean) =>
    api.put(`/admin/doctors/${id}/approve`, { isApproved }),
  deleteDoctor: (id: string) => api.delete(`/admin/doctors/${id}`),

  // Appointments
  getAppointments: (page = 1, limit = 25, status = "") =>
    api.get(`/admin/appointments?page=${page}&limit=${limit}&status=${status}`),

  // Stats & Analytics
  getStats: () => api.get("/admin/stats"),
  getUsersAnalytics: () => api.get("/admin/analytics/users-report"),
};

export default api;
```

### Step 3: Create ProtectedRoute component

File: `src/components/ProtectedRoute.tsx`

```typescript
import { Navigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdmin()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
```

---

## 📄 PHASE 3A: LOGIN PAGE (30 minutes)

File: `src/pages/Login.tsx`

```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'

export default function Login() {
  const [email, setEmail] = useState('admin@careconnect.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAdmin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

---

## 📊 PHASE 3B: DASHBOARD (1-2 hours) - PRIORITY

File: `src/pages/Dashboard.tsx`

```typescript
import { useEffect, useState } from 'react'
import { adminAPI } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats()
      setStats(response.data.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users" value={stats?.totalUsers || 0} icon="👥" />
        <StatCard title="Total Doctors" value={stats?.totalDoctors || 0} icon="👨‍⚕️" />
        <StatCard
          title="Pending Approvals"
          value={stats?.pendingDoctors || 0}
          icon="⏳"
          highlight={stats?.pendingDoctors > 0}
        />
        <StatCard title="Appointments" value={stats?.totalAppointments || 0} icon="📅" />
      </div>

      {/* Charts */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Appointments Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats?.appointmentsByStatus || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  highlight
}: {
  title: string
  value: number
  icon: string
  highlight?: boolean
}) {
  return (
    <div className={`rounded shadow p-6 ${highlight ? 'bg-red-50' : 'bg-white'}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}
```

---

## ⭐ PHASE 3C: DOCTOR APPROVAL (CRITICAL) (1-2 hours)

File: `src/pages/DoctorApprovals.tsx`

```typescript
import { useEffect, useState } from 'react'
import { adminAPI } from '../services/api'

export default function DoctorApprovals() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingDoctors()
  }, [])

  const fetchPendingDoctors = async () => {
    try {
      // Filter for isApproved: false
      const response = await adminAPI.getDoctors(1, 100)
      const pending = response.data.data.filter((d: any) => !d.isApproved)
      setDoctors(pending)
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (doctorId: string) => {
    try {
      await adminAPI.approveDoctor(doctorId, true)
      setDoctors(doctors.filter((d) => d._id !== doctorId))
      alert('Doctor approved!')
    } catch (error) {
      alert('Error approving doctor')
    }
  }

  const handleReject = async (doctorId: string) => {
    try {
      await adminAPI.approveDoctor(doctorId, false)
      setDoctors(doctors.filter((d) => d._id !== doctorId))
      alert('Doctor rejected')
    } catch (error) {
      alert('Error rejecting doctor')
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Doctor Approvals ({doctors.length})</h1>

      {doctors.length === 0 ? (
        <div className="bg-green-100 text-green-700 p-4 rounded">
          ✅ No pending approvals
        </div>
      ) : (
        <div className="space-y-4">
          {doctors.map((doctor: any) => (
            <div key={doctor._id} className="bg-white rounded shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{doctor.fullname}</h3>
                  <p className="text-gray-600">{doctor.email}</p>
                  <p className="text-sm text-gray-500">
                    Specialization: {doctor.specialization?.join(', ')}
                  </p>
                  <p className="text-sm text-gray-500">
                    Degrees: {doctor.degrees?.join(', ')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(doctor._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(doctor._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 🚀 PHASE 4: ROUTING & APP STRUCTURE (30 minutes)

File: `src/App.tsx`

```typescript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AdminProvider } from './context/AdminContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DoctorApprovals from './pages/DoctorApprovals'
import UsersList from './pages/UsersList'
import DoctorsList from './pages/DoctorsList'
import AppointmentsList from './pages/AppointmentsList'

export default function App() {
  return (
    <AdminProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/doctors/approvals" element={<DoctorApprovals />} />
            <Route path="/users" element={<UsersList />} />
            <Route path="/doctors" element={<DoctorsList />} />
            <Route path="/appointments" element={<AppointmentsList />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Route>
        </Routes>
      </Router>
    </AdminProvider>
  )
}
```

File: `src/main.tsx`

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## 🎨 PHASE 5: LAYOUT COMPONENT (1 hour)

File: `src/components/Layout.tsx`

```typescript
import { Outlet, useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'

export default function Layout() {
  const { logout } = useAdmin()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">CareConnect Admin</h1>

        <nav className="space-y-4">
          <NavLink to="/dashboard" label="Dashboard" />
          <NavLink to="/doctors/approvals" label="Doctor Approvals" />
          <NavLink to="/doctors" label="Doctors" />
          <NavLink to="/users" label="Users" />
          <NavLink to="/appointments" label="Appointments" />
        </nav>

        <button
          onClick={handleLogout}
          className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}

function NavLink({ to, label }: { to: string; label: string }) {
  return (
    <a
      href={to}
      className="block px-4 py-2 rounded hover:bg-slate-800 transition"
    >
      {label}
    </a>
  )
}
```

---

## 🎯 REMAINING PAGES (Can be built incrementally)

### UsersList.tsx (Similar structure to DoctorApprovals)

```typescript
// GET /api/admin/users
// Display table with: name, email, phone, city
// Actions: View, Edit, Delete
```

### DoctorsList.tsx

```typescript
// GET /api/admin/doctors
// Display table with: name, email, specialization, fee, approval status
// Actions: View, Approve, Edit, Delete
```

### AppointmentsList.tsx

```typescript
// GET /api/admin/appointments
// Display table with: patient, doctor, date, status
// Filters: status, type, paid
```

---

## 📋 MINIMAL API TEST CREDENTIALS

To test, you need an admin account in the database.

**Option 1: Create manually in MongoDB**

```javascript
db.users.insertOne({
  fullname: "Admin User",
  email: "admin@careconnect.com",
  password: "hashed_password", // Use bcryptjs to hash
  role: "admin",
});
```

**Option 2: Register as admin (if backend allows)**

```bash
POST http://localhost:4000/api/auth/register/user
Body: {
  "fullname": "Admin",
  "email": "admin@careconnect.com",
  "password": "adminpass123"
}

# Then manually update in DB to set role: "admin"
```

---

## 🚀 QUICK START COMMANDS

```bash
# 1. Setup
cd CareConnect-Admin-main
npm install

# 2. Start development
npm run dev

# 3. Open browser
# http://localhost:3002

# 4. Login with admin credentials
```

---

## ✅ PRIORITY COMPLETION ORDER

1. **Login + Context** - 30 min
2. **Dashboard** - 1 hour (CRITICAL - shows you're alive)
3. **Doctor Approvals** - 1.5 hours (⭐CRITICAL - unlocks doctor onboarding)
4. **Layout/Routing** - 30 min
5. **Users List** - 1 hour
6. **Doctors List** - 1 hour
7. **Appointments List** - 1 hour
8. **Analytics Pages** - 2+ hours

**Total for MVP: ~7 hours of dedicated work**

---

## 🧪 TESTING CHECKLIST

- [ ] Admin can login
- [ ] Dashboard loads with stats
- [ ] Can see pending doctors
- [ ] Can approve each doctor
- [ ] Approved doctor disappears from list
- [ ] Can view users list
- [ ] Can search users
- [ ] Can delete users
- [ ] Can view doctors list
- [ ] Can view appointments
- [ ] Logout works
- [ ] Responsive on mobile

---

## 🆘 COMMON ISSUES & FIXES

### Issue: CORS errors

**Fix:** Backend has CORS enabled, make sure API URLs match

### Issue: Token invalid

**Fix:** Check localStorage has token, verify token format (Bearer {token})

### Issue: API returns 401

**Fix:** Token may have expired or admin role missing, check backend

### Issue: Doctor approvals not working

**Fix:** Check if `isApproved` field exists in doctor document

---

## 📞 REFERENCE

**Backend Running:** http://localhost:4000  
**Admin Running:** http://localhost:3002  
**Backend Code:** `CareConnect-backend/src/`  
**Admin Routes:** `CareConnect-backend/src/routes/admin.js`  
**Doctor Frontend Reference:** `CareConnectDoctors-main/` (use as pattern)

---

**You're ready to build! Start with Login + Dashboard + Doctor Approvals first.** ✅
