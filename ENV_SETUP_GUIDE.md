# 🔧 ENVIRONMENT VARIABLES SETUP

Create a `.env` file in `Medconnect-backend/` directory with the following variables:

## Database

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/medconnect
```

## JWT & Security

```
JWT_SECRET=your_long_random_secret_key_min_32_characters
JWT_EXPIRE=7d
NODE_ENV=development
PORT=4001
```

## Email Service (for notifications)

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SENDER_EMAIL_ADDRESS=noreply@medconnect.com
```

## =====================================================

## PAYMENT INTEGRATION

## =====================================================

### Stripe

```
# Get from: https://dashboard.stripe.com/apikeys
STRIPE_PUBLIC_KEY=pk_live_your_key_here
STRIPE_SECRET_KEY=sk_live_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### RazorPay

```
# Get from: https://dashboard.razorpay.com/
RAZORPAY_KEY_ID=rzp_live_your_key_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

## =====================================================

## VIDEO CONSULTATION

## =====================================================

### Daily.co (Recommended - Free tier available)

```
# Get from: https://dashboard.daily.co/
DAILY_API_KEY=your_daily_api_key
DAILY_ORG_ID=your_org_id

# Alternative providers:
# Twilio: https://www.twilio.com/console
# Jitsi: https://jitsi.org
```

## =====================================================

## PUSH NOTIFICATIONS

## =====================================================

### Firebase Cloud Messaging

```
# Download from: https://console.firebase.google.com/
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_SERVICE_ACCOUNT_KEY=path/to/serviceAccountKey.json
```

## =====================================================

## FRONTEND VARIABLES

## =====================================================

Create a `.env` file in each frontend folder (`Medconnect-User-main/` & `Medconnect-Doctors-main/`):

```
# API
VITE_API_URL=http://localhost:4001

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key_here

# RazorPay
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_here

# Firebase
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id

# Daily.co
VITE_DAILY_API_KEY=your_daily_key
```

---

## 📝 STEP-BY-STEP SETUP

### 1. Generate Stripe Keys (Optional payment)

```
1. Go to: https://dashboard.stripe.com/apikeys
2. Copy "Publishable key" → STRIPE_PUBLIC_KEY
3. Copy "Secret key" → STRIPE_SECRET_KEY
```

### 2. Generate RazorPay Keys (Indian payments)

```
1. Go to: https://dashboard.razorpay.com/
2. Settings → API Keys
3. Copy "Key ID" → RAZORPAY_KEY_ID
4. Copy "Key Secret" → RAZORPAY_KEY_SECRET
```

### 3. Setup Daily.co (Video calls)

```
1. Go to: https://dashboard.daily.co/
2. Sign up and create account
3. Copy API Key → DAILY_API_KEY
4. Copy Org ID → DAILY_ORG_ID
```

### 4. Setup Firebase (Push notifications)

```
1. Go to: https://console.firebase.google.com/
2. Create new project
3. Settings → Service Accounts
4. Generate new private key (JSON)
5. Download and save as `serviceAccountKey.json`
```

---

## 🔐 SECURITY TIPS

- ✅ Never commit `.env` file to git
- ✅ Use `.env.example` for template
- ✅ Keep secrets secure in production
- ✅ Use environment-specific keys (test vs production)
- ✅ Rotate secrets regularly
- ✅ Use strong JWT secret (min 32 characters)

---

## ✅ VERIFICATION

After setting up, verify by:

```bash
# Backend
npm start
# Should show: Server running on port 4001

# Check if routes are available:
curl http://localhost:4001/api/payments
curl http://localhost:4001/api/video
```

---

## 🆘 TROUBLESHOOTING

**"Cannot find module 'stripe'"**

```bash
npm install stripe razorpay firebase-admin socket.io
```

**"ECONNREFUSED MongoDB"**

- Check MONGO_URI is correct
- Ensure MongoDB is running
- Check internet connection

**"Payment gateway not working"**

- Verify API keys are correct
- Check if in test/sandbox mode
- Ensure CORS is enabled

**"Video not loading"**

- Check DAILY_API_KEY is set
- Verify internet connection
- Clear browser cache

---

**All environment variables are optional initially. Add them as you implement each feature!**
