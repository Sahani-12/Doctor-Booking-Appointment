# Developer Quick Reference Guide

## Backend File Navigation

### Controllers (`src/controllers/`)

**Purpose**: Handle business logic and request/response

| File                       | Purpose                | Key Functions                                                                    |
| -------------------------- | ---------------------- | -------------------------------------------------------------------------------- |
| `authController.js`        | Authentication logic   | registerDoctor, registerUser, login, getCurrentUser, logout                      |
| `doctorController.js`      | Doctor operations      | getAllDoctors, getDoctorById, getProfile, updateProfile, getStats                |
| `appointmentController.js` | Appointment management | createAppointment, getMyAppointments, getAvailableSlots, updateStatus, cancel    |
| `userController.js`        | User operations        | getProfile, updateProfile, getAppointments, getDocuments, uploadDocument         |
| `adminController.js`       | Admin functions        | getAllUsers, getAllDoctors, getAllAppointments, deleteUser, approveDoctor, stats |

### Routes (`src/routes/`)

**Purpose**: Define API endpoints

| File              | Base Path           | HTTP Methods                                                             |
| ----------------- | ------------------- | ------------------------------------------------------------------------ |
| `auth.js`         | `/api/auth`         | POST (register, login), GET (me)                                         |
| `doctors.js`      | `/api/doctors`      | GET (listing, profile), PUT (update profile)                             |
| `appointments.js` | `/api/appointments` | POST (book), GET (my, slots), PUT (status), POST (cancel)                |
| `user.js`         | `/api/users`        | GET (profile, docs), PUT (profile), POST (upload doc), DELETE (doc)      |
| `admin.js`        | `/api/admin`        | GET (users, doctors, appointments, stats), PUT (update), DELETE (delete) |
| `stories.js`      | `/api/stories`      | GET, POST (doctor stories/reviews)                                       |

### Models (`src/models/`)

**Purpose**: Define database schemas

| File             | Purpose                    | Key Fields                                                           |
| ---------------- | -------------------------- | -------------------------------------------------------------------- |
| `User.js`        | Patient/User schema        | fullname, email, password, role, phone, city, DOB, image             |
| `Doctor.js`      | Doctor schema              | fullname, email, specialization, fee, experience, rating, isApproved |
| `Appointment.js` | Appointment schema         | patient (ref), doctor (ref), date, slot, status, notes, rating       |
| `Document.js`    | Medical document schema    | user (ref), filename, fileUrl, message                               |
| `Story.js`       | Doctor story/review schema | doctor (ref), user (ref), story, rating                              |

### Middleware (`src/middleware/`)

**Purpose**: Request processing and validation

| File           | Purpose                                    |
| -------------- | ------------------------------------------ |
| `auth.js`      | JWT token verification and user extraction |
| `authorize.js` | Role-based access control (NEW)            |
| `error.js`     | Global error handling                      |

### Services (`src/services/`)

**Purpose**: Business logic and reusable functions

| File                    | Purpose             | Key Functions                                                       |
| ----------------------- | ------------------- | ------------------------------------------------------------------- |
| `appointmentService.js` | Appointment helpers | isSlotAvailable, getAvailableSlotsForDate, getAppointmentStatistics |
| `doctorService.js`      | Doctor helpers      | searchDoctors, getDoctorProfileWithStats, getDoctorWeeklySchedule   |

### Utilities (`src/utils/`)

**Purpose**: Helper functions

| File            | Purpose          | Key Functions                                                         |
| --------------- | ---------------- | --------------------------------------------------------------------- |
| `validators.js` | Input validation | validateEmail, validatePassword, validateFutureDate, validateTimeSlot |
| `response.js`   | Response helpers | sendSuccess, sendError, calculatePagination, generateDailySlots       |
| `email.js`      | Email templates  | emailTemplates, sendEmail (mock ready for production)                 |

### Configuration (`src/config/`)

**Purpose**: App configuration

| File    | Purpose                  |
| ------- | ------------------------ |
| `db.js` | MongoDB connection setup |

---

## Common Development Workflows

### Adding a New Feature

1. **Create Model** (if needed)

```
src/models/NewFeature.js
```

2. **Create Controller**

```
src/controllers/newFeatureController.js
```

3. **Create Routes**

```
Add routes to src/routes/newFeature.js
```

4. **Register Routes**

```
Add to src/index.js: app.use('/api/newFeature', newFeatureRoutes);
```

5. **Add Tests**

```
src/__tests__/newFeature.test.js
```

### Adding Validation

1. Add validation function to `src/utils/validators.js`
2. Import in controller
3. Call before processing: `if (!validate(...)) throw new Error(...)`

### Adding Email Notification

1. Add template to `src/utils/email.js` in `emailTemplates`
2. Call in controller: `await sendEmail(recipient, emailTemplates.templateName(...))`

### Adding Admin Feature

1. Create endpoint in `adminController.js`
2. Add route to `src/routes/admin.js`
3. Add `authorize("admin")` middleware to route

---

## API Development Checklist

Before committing a new endpoint:

- [ ] Controller function created and exported
- [ ] Route registered in routes file
- [ ] Input validation implemented
- [ ] Authorization checks added (if needed)
- [ ] Error handling with try-catch
- [ ] Response uses consistent format (success, data, message)
- [ ] Async/await syntax used throughout
- [ ] Database queries optimized with .select()
- [ ] Pagination added (if returns many results)
- [ ] Tests written
- [ ] API documentation updated
- [ ] Endpoint added to API_EXAMPLES_QUICK_REFERENCE.md

---

## Key Configuration Values

### Port

```
.env: PORT=4000
```

### Database

```
.env: MONGO_URI=mongodb+srv://...
```

### JWT

```
.env: JWT_SECRET=your_secret
.env: TOKEN_EXPIRES_IN=7d
```

### Available Roles

```
"user" (patient)
"doctor"
"admin"
```

### Appointment Status Values

```
"pending" → Initial booking
"accepted" → Doctor accepted
"completed" → Appointment done
"cancelled" → Cancelled
```

### Available Slots

```
[09:00, 09:30, 10:00, 10:30, 11:00, 11:30,
 14:00, 14:30, 15:00, 15:30, 16:00, 16:30]
```

---

## Database Query Patterns

### Find with Populate

```javascript
const appointments = await Appointment.find({})
  .populate("doctor", "fullname email specialization")
  .populate("patient", "fullname email city");
```

### Pagination

```javascript
const { calculatePagination } = require("../utils/response");
const { pageNum, limitNum, skip } = calculatePagination(page, limit);
const data = await Model.find().skip(skip).limit(limitNum);
```

### Aggregation

```javascript
const stats = await Appointment.aggregate([
  { $match: { doctor: doctorId } },
  { $group: { _id: "$status", count: { $sum: 1 } } },
]);
```

### Index Queries

```javascript
// Doctor by specialization (indexed)
await Doctor.find({ specialization: { $in: ["Cardiology"] } });

// Appointment by date (indexed)
await Appointment.find({ date: { $gte: startDate, $lte: endDate } });
```

---

## Error Handling Patterns

### Try-Catch with Error Status

```javascript
try {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
} catch (error) {
  // Handled by global error handler
  throw error;
}
```

### Validation Error

```javascript
if (!email || !password) {
  res.status(400);
  throw new Error("Email and password are required");
}
```

### Authorization Error

```javascript
if (req.user.role !== "admin") {
  res.status(403);
  throw new Error("Admin access required");
}
```

---

## Frontend Integration

### Setup API Service (in frontend)

```javascript
// Copy FRONTEND_API_SERVICE.js to frontend/src/services/api.js
import { authAPI, doctorAPI, appointmentAPI } from "./services/api";

// Use in components
const { data } = await authAPI.login(email, password);
localStorage.setItem("token", data.token);
```

### Store Token

```javascript
// After login
localStorage.setItem("token", response.data.token);
localStorage.setItem("user", JSON.stringify(response.data.user));
```

### Add to Requests

```javascript
// Axios instance in api.js adds token automatically via interceptor
const config = {
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
};
```

---

## Testing Commands

```bash
# Run server in development
npm run dev

# Check syntax
node -c src/index.js

# Run tests (when setup)
npm test

# Run with coverage
npm test -- --coverage

# Lint code (if ESLint configured)
npm run lint
```

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/doctor-ratings

# Make changes and test
npm run dev

# Commit
git add .
git commit -m "Add doctor rating feature"

# Push
git push origin feature/doctor-ratings

# Create pull request
```

---

## Debugging Tips

### View Request Body

```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

### View Database Queries (if using mongoose debug)

```bash
DEBUG=mongoose:* npm run dev
```

### Check Token

```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
console.log("Decoded token:", decoded);
```

### Test API Endpoint

```bash
curl -X GET http://localhost:4000/api/doctors \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Performance Monitoring

### Slow Query Logs

```javascript
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    if (ms > 1000) console.warn(`⚠️ Slow: ${req.path} took ${ms}ms`);
  });
  next();
});
```

### Request Count

```javascript
let requestCount = 0;
app.use((req, res, next) => {
  requestCount++;
  console.log(`Request #${requestCount}: ${req.method} ${req.path}`);
  next();
});
```

---

## Useful npm Scripts to Add

Add to `package.json` scripts:

```json
{
  "dev": "nodemon src/index.js",
  "start": "node src/index.js",
  "test": "jest",
  "test:watch": "jest --watch",
  "lint": "eslint src/",
  "format": "prettier --write \"src/**/*.js\""
}
```

---

## Common Issues & Solutions

| Issue                    | Solution                            |
| ------------------------ | ----------------------------------- |
| "Cannot find module X"   | Run `npm install`                   |
| Port 4000 in use         | Change PORT in .env or kill process |
| MongoDB connection error | Check MONGO_URI in .env             |
| Token invalid            | User needs to login again           |
| Slot already booked      | Refresh page to get latest slots    |
| Email not sending        | Check email.js, setup SMTP provider |
| CORS error               | Verify cors config in index.js      |

---

## Resources & Documentation

- **Backend Setup**: COMPLETE_SETUP_GUIDE.md
- **API Examples**: API_EXAMPLES_QUICK_REFERENCE.md
- **Docker Setup**: DOCKER_DEPLOYMENT_GUIDE.md
- **Testing**: TESTING_GUIDE.md
- **Project Status**: PROJECT_COMPLETION_SUMMARY.md

---

**Last Updated**: March 2024
**Version**: 1.0.0
