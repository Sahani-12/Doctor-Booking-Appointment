# 🧪 Real-Time Update Testing Guide

## ✅ पहले यह verify करो:

### 1. Backend Running है?

```bash
https://doctor-booking-appointment-i137.onrender.com
```

✅ देखो - should show: "Cannot GET /" (यह OK है, server चल रहा है)

### 2. Admin Panel Running है?

```bash
http://localhost:5178
```

✅ देखो - Login page दिखना चाहिए

### 3. MongoDB Connected है?

```bash
node fetch-from-api.js
```

✅ Output में दिखना चाहिए:

```
✅ Users fetched successfully!
   Total: 1 user(s)
✅ Doctors fetched successfully!
   Total: 0 doctor(s)
```

---

## 🔄 TEST #1: Auto-Refresh (हर 5 सेकंड)

### Step 1: Browser Console खोलो

```
1. Admin panel जाओ: http://localhost:5178
2. Login करो: admin@careconnect.com / admin123
3. F12 दबाओ (DevTools खोल)
4. Console tab जाओ
```

### Step 2: Users Page जाओ

- Sidebar में "Users" click करो
- Console देखो - ये messages दिखेंगे:

```
✅ 👥 UsersPage: Fetching users...
✅ 📡 UsersPage: Fetching from API...
✅ 📨 UsersPage: Got response, status: 200
✅ ✅ UsersPage: Got users: 1

(5 सेकंड बाद ये फिर दिखेंगे:)
✅ 🔄 Auto-refreshing users list...
✅ 📡 UsersPage: Fetching from API...
✅ 📨 UsersPage: Got response, status: 200
✅ ✅ UsersPage: Got users: 1
```

✅ **TEST PASS**: Auto-refresh हर 5 सेकंड काम कर रहा है!

---

## 🔘 TEST #2: Manual Refresh Button

### Step 1: Users Page पर जाओ

- देखो - top-right में "Refresh" button है

### Step 2: Refresh Button दबाओ

- Button पर "Refreshing..." message आएगा
- Spinner animate होगा
- Few seconds में normal हो जाएगा
- Console में fetch logs दिखेंगी

### Step 3: Verify करो

```
✅ Button disabled हो जाता है refresh के दौरान
✅ Spinner animate होता है
✅ Data re-fetch होता है
✅ Last updated time update होता है
```

✅ **TEST PASS**: Manual refresh काम कर रहा है!

---

## ✔️ TEST #3: Verify/Unverify Toggle (Real-time)

### Step 1: Admin Panel खोलो

- **URL**: http://localhost:5178
- **Login**: admin@careconnect.com / admin123

### Step 2: Users Page

- Sidebar → "Users" click करो
- Table में "Admin User" दिखेगा
- Status: "✓ Verified" (green)

### Step 3: Verify Toggle करो

- Actions column में "✓" icon (checkmark) है
- उस पर click करो (unverify करने के लिए)

### Step 4: देखो क्या होता है:

```
INSTANTLY:
✅ Icon में Loader spinner दिखेगा
✅ Status color change होगा (green → yellow)
✅ Status text change होगा ("✓ Verified" → "⏳ Pending")
✅ Console में success message आएगी
✅ Modal (अगर open है) भी update होगा

AFTER:
✅ Button 5 sec में normal हो जाएगा
✅ Data refresh होगा और status confirm होगी
```

✅ **TEST PASS**: Real-time verify/unverify काम कर रहा है!

---

## 🗑️ TEST #4: Delete User

### Step 1: Users Page खोलो

- हर user के Actions में "Trash" icon है

### Step 2: Delete Click करो

- Confirm dialog आएगा: "Are you sure you want to delete this user?"
- Click: Confirm

### Step 3: देखो क्या होता है:

```
INSTANTLY:
✅ Trash icon में Loader spinner दिखेगा
✅ उस row से user disappear हो जाएगा
✅ Total count घट जाएगी
✅ Console में success message आएगी

AFTER:
✅ Database से delete confirm होगा
✅ 5 sec में auto-refresh होगा
✅ Delete permanent होगा
```

✅ **TEST PASS**: Delete काम कर रहा है!

---

## 👁️ TEST #5: View Details Modal

### Step 1: Users Page खोलो

- हर user के Actions में "Eye" icon है

### Step 2: Eye Icon दबाओ

- Modal खुलेगा with user details:
  - Name
  - Email
  - Phone
  - Verified Status
  - ID
  - Created Date

### Step 3: अब Verify Toggle करो (modal में रहते हुए)

- Modal के inside Toggle करो
- देखो - Modal में status instantly update होगी

✅ **TEST PASS**: Modal details real-time sync हो रहे हैं!

---

## 👨‍⚕️ TEST #6: Doctors Page (Same Tests)

### Same process:

1. **Auto-Refresh** - हर 5 sec data fetch होता है
2. **Manual Refresh** - Button काम करता है
3. **Approve Toggle** - Real-time काम करता है
4. **Delete** - User disappear होगा
5. **View Details** - Modal instant update होगा

Console logs दिखेंगी:

```
✅ 🔄 Auto-refreshing doctors list...
✅ 👨‍⚕️ DoctorsPage: Fetching from API...
```

---

## 📊 TEST #7: Real-time Cross-Tab Sync

### Advanced Test (2 browsers use करो):

#### Browser 1:

```
1. Admin Panel खुला रखो
2. Users page पर रहो
```

#### Browser 2:

```
1. दूसरा browser खोलो
2. Admin Panel खोलो
3. User को verify करो
4. Delete करो
```

#### Browser 1 पर देखो:

```
✅ 5 सेकंड में list update हो जाएगी
✅ Change दोनों browsers में sync होगा!
```

✅ **TEST PASS**: Cross-browser real-time sync काम कर रहा है!

---

## 🔄 TEST #8: Last Updated Timestamp

### Step 1: Users/Doctors Page खोलो

- Top में देखो - "🔄 Last updated: HH:MM:SS" दिखेगा

### Step 2: Refresh Button दबाओ

- Last updated time change होगा (नया time दिखेगा)

### Step 3: 5 सेकंड wait करो (auto-refresh के लिए)

- Last updated time फिर change होगा

✅ **TEST PASS**: Timestamp tracking काम कर रहा है!

---

## 📝 Complete Test Checklist

### ✅ USERS PAGE:

- [ ] Auto-refresh हर 5 sec काम करता है
- [ ] Manual Refresh button काम करता है
- [ ] Verify/Unverify toggle real-time काम करता है
- [ ] Delete button user remove करता है
- [ ] Modal details instant update होती हैं
- [ ] Last updated timestamp changes होता है
- [ ] Search काम करता है
- [ ] Filter buttons काम करते हैं
- [ ] Console errors नहीं हैं

### ✅ DOCTORS PAGE:

- [ ] Auto-refresh हर 5 sec काम करता है
- [ ] Manual Refresh button काम करता है
- [ ] Approve/Reject toggle real-time काम करता है
- [ ] Delete button doctor remove करता है
- [ ] Modal details instant update होती हैं
- [ ] Last updated timestamp changes होता है
- [ ] Search काम करता है
- [ ] Filter buttons काम करते हैं

### ✅ BACKEND:

- [ ] MongoDB connected है
- [ ] Login API काम कर रहा है
- [ ] Users API data return कर रहा है
- [ ] Doctors API data return कर रहा है
- [ ] PUT endpoint verify/approve update करता है
- [ ] DELETE endpoint user/doctor delete करता है

---

## 🔍 Troubleshooting

### ❌ Auto-refresh नहीं हो रहा है?

```bash
# Check console for errors
F12 → Console tab

# Possible issues:
1. Token expired - logout करके login करो
2. Backend down - npm start दोबारा चला
3. CORS issue - backend restart करो
```

### ❌ Real-time update नहीं हो रहा है?

```bash
# Hard refresh करो
Ctrl+Shift+R

# Clear storage
F12 → Application → Clear Storage
```

### ❌ Toggle काम नहीं कर रहा है?

```bash
# Check API response
F12 → Network tab → देखो requests/responses

# Verify करो backend काम कर रहा है:
node fetch-from-api.js
```

---

## 📊 Expected Console Output

### Healthy System:

```
👥 UsersPage: Fetching users...
📡 UsersPage: Fetching from API...
📨 UsersPage: Got response, status: 200
✅ UsersPage: Got users: 1
```

---

## 🎯 Success Indicators

✅ **All systems working if:**

1. Auto-refresh हर 5 seconds में होता है
2. Manual Refresh button काम करता है
3. Verify/Unverify toggle 1-2 seconds में काम करता है
4. Delete instantly काम करता है
5. Modal details sync रहती हैं
6. Console errors नहीं हैं
7. Last updated time changes होता है

describe("POST /api/auth/register/user", () => {
it("should register a new user", async () => {
const response = await request(app)
.post("/api/auth/register/user")
.send({
fullname: "John Doe",
email: "john@test.com",
password: "Test@1234",
city: "Delhi",
})
.expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe("john@test.com");
      expect(response.body.data.token).toBeDefined();
    });

    it("should reject duplicate email", async () => {
      await User.create({
        fullname: "Jane Doe",
        email: "jane@test.com",
        password: "hashed",
        role: "user",
      });

      const response = await request(app)
        .post("/api/auth/register/user")
        .send({
          fullname: "John Doe",
          email: "jane@test.com",
          password: "Test@1234",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

});

describe("POST /api/auth/login", () => {
beforeEach(async () => {
const hashedPass = await require("bcryptjs").hash("Test@1234", 10);
await User.create({
fullname: "Test User",
email: "test@test.com",
password: hashedPass,
role: "user",
});
});

    it("should login user with correct credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@test.com",
          password: "Test@1234",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it("should reject wrong password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@test.com",
          password: "WrongPassword",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

});
});

````

### Run Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.js

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
````

---

## Integration Testing

### Test Workflow Example

```javascript
describe("Appointment Booking Flow", () => {
  let patientToken, doctorToken, doctorId;

  beforeAll(async () => {
    // Register doctor
    const doctorRes = await request(app)
      .post("/api/auth/register/doctor")
      .send({
        fullname: "Dr. Smith",
        email: "doctor@test.com",
        password: "Test@1234",
        specialization: ["Cardiology"],
        fee: 500,
      });
    doctorToken = doctorRes.body.data.token;
    doctorId = doctorRes.body.data.user.id;

    // Register patient
    const patientRes = await request(app).post("/api/auth/register/user").send({
      fullname: "John Doe",
      email: "patient@test.com",
      password: "Test@1234",
    });
    patientToken = patientRes.body.data.token;
  });

  it("should complete appointment booking workflow", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split("T")[0];

    // Check slots
    const slotsRes = await request(app)
      .get(`/api/appointments/slots/${doctorId}/${dateString}`)
      .set("Authorization", `Bearer ${patientToken}`)
      .expect(200);

    const availableSlot = slotsRes.body.data.slots.find(
      (s) => s.status === "available",
    );
    expect(availableSlot).toBeDefined();

    // Book appointment
    const bookRes = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        doctorId,
        date: dateString,
        slot: availableSlot.startTime,
        notes: "Heart checkup",
      })
      .expect(201);

    expect(bookRes.body.data.status).toBe("pending");

    // View appointment from doctor side
    const docApptsRes = await request(app)
      .get("/api/appointments/my")
      .set("Authorization", `Bearer ${doctorToken}`)
      .expect(200);

    expect(docApptsRes.body.data).toHaveLength(1);
  });
});
```

---

## Manual API Testing with Postman

### Import Collection

Create `postman-collection.json`:

```json
{
  "info": {
    "name": "MedConnect API",
    "version": "1.0.0"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register User",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/auth/register/user",
            "body": {
              "mode": "raw",
              "raw": "{\"fullname\": \"John Doe\", \"email\": \"john@test.com\", \"password\": \"Test@1234\", \"city\": \"Delhi\"}"
            }
          }
        }
      ]
    }
  ]
}
```

### Environment Setup

```json
{
  "token": "your_jwt_token_here",
  "base_url": "http://localhost:4000/api",
  "doctor_id": "doctor_id_here",
  "patient_id": "patient_id_here"
}
```

---

## Performance Testing with LoadImpact

### Test Script

```javascript
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 10,
  duration: "30s",
};

export default function () {
  const response = http.get(
    "http://localhost:4000/api/doctors?page=1&limit=10",
  );
  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
    "body has doctors": (r) => r.body.includes("specialization"),
  });
  sleep(1);
}
```

Run:

```bash
k6 run test-script.js
```

---

## Debugging Tips

### Enable Debug Logging

Add to `index.js`:

```javascript
if (process.env.DEBUG) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}
```

Run:

```bash
DEBUG=true npm run dev
```

### MongoDB Monitoring

```bash
# View real-time queries
mongosh admin
db.setProfilingLevel(1)
db.system.profile.find().limit(5).sort({ ts: -1 }).pretty()
```

### Response Time Analysis

```javascript
// Add to middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (duration > 1000) console.warn(`Slow route ${req.path}: ${duration}ms`);
  });
  next();
});
```

---

## Continuous Integration

### GitHub Actions (.github/workflows/test.yml)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:6
        options: >-
          --health-cmd mongosh
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - run: npm ci
      - run: npm run test
      - run: npm run test -- --coverage

      - uses: codecov/codecov-action@v3
```

---

**Last Updated**: March 2024
