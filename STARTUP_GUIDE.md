# 🚀 NexEd Quick Startup Guide

## Current Project Status

✅ **Database Configuration Fixed**
- All services now use the same database: `nexed`
- Backend → `mongodb://localhost:27017/nexed`
- Course Service → `mongodb://localhost:27017/nexed`

✅ **Dependencies Updated**
- Stripe package added to backend
- All packages up to date

## How to Start the Application

### Method 1: Using Batch Files (Windows - Easiest)

Double-click these files in order:

1. **start-backend.bat** - Starts main API server (Port 5000)
2. **start-course-service.bat** - Starts course service (Port 5001)
3. **start-frontend.bat** - Starts React frontend (Port 3000)

### Method 2: Using Terminals

Open 3 separate terminals:

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Course Service
```bash
npm run dev
```

#### Terminal 3 - Frontend
```bash
cd frontend
npm start
```

## First Time Setup Checklist

### ✅ Prerequisites
- [ ] MongoDB installed and running
- [ ] Node.js >= 14.0.0 installed
- [ ] All dependencies installed

### ✅ Environment Configuration

#### 1. Backend Environment (`backend/.env`)
- [ ] `MONGODB_URI=mongodb://localhost:27017/nexed` ✓ Configured
- [ ] `EMAIL_USER` - Set your Gmail address
- [ ] `EMAIL_PASS` - Set your Gmail App Password
- [ ] `JWT_SECRET` - Update with secure random string
- [ ] `STRIPE_SECRET_KEY` - Add your Stripe secret key
- [ ] `STRIPE_WEBHOOK_SECRET` - Add webhook secret

#### 2. Course Service (`.env` at root)
- [ ] `MONGO_URI=mongodb://localhost:27017/nexed` ✓ Configured

#### 3. Frontend (`frontend/.env`)
- [ ] `REACT_APP_STRIPE_PUBLISHABLE_KEY` - Add Stripe publishable key

## Verify Installation

### 1. Check MongoDB Connection
```bash
mongosh
use nexed
db.stats()
```

### 2. Test Backend API
Open browser: http://localhost:5000/api/health

Should return:
```json
{
  "success": true,
  "status": "OK",
  "database": "connected"
}
```

### 3. Test Course Service
Open browser: http://localhost:5001/health

### 4. Test Frontend
Open browser: http://localhost:3000

## Common Startup Issues

### MongoDB Not Running
**Error:** `MongooseError: Operation buffering timed out`

**Solution:**
```bash
# Windows
net start MongoDB

# Or start MongoDB manually
mongod --dbpath="C:\data\db"
```

### Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### Missing Dependencies
**Error:** `Cannot find module 'stripe'`

**Solution:**
```bash
cd backend
npm install
```

## Environment Variables to Configure

### Critical (Required)
1. **MONGODB_URI** - ✅ Already set to `nexed` database
2. **JWT_SECRET** - Generate a secure random string
3. **EMAIL_USER** - Your Gmail address
4. **EMAIL_PASS** - Gmail App Password ([Get it here](https://myaccount.google.com/apppasswords))

### Payment (Optional for development)
5. **STRIPE_SECRET_KEY** - From Stripe Dashboard
6. **STRIPE_PUBLISHABLE_KEY** - From Stripe Dashboard
7. **STRIPE_WEBHOOK_SECRET** - For webhooks

## Testing Email Configuration

Run this to test email service:
```bash
cd backend
node scripts/testEmail.js
```

## Project Structure Summary

```
📁 NexEd/
├── 🔧 backend/              → Main API (Port 5000)
│   ├── .env                 → Backend configuration
│   └── server.js            → Entry point
│
├── 🎓 src/                  → Course Service (Port 5001)
│   └── server.js            → Entry point
│
├── 🎨 frontend/             → React App (Port 3000)
│   ├── .env                 → Frontend configuration
│   └── src/App.jsx          → Entry point
│
├── .env                     → Course service config
└── 📚 README.md             → Full documentation
```

## Access URLs

After starting all services:

- **Frontend UI:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Course Service:** http://localhost:5001
- **API Health:** http://localhost:5000/api/health

## Database Schema

The `nexed` database contains:
- users (authentication, profiles)
- courses (course data)
- enrollments (student enrollments)
- reviews (course reviews)
- payments (payment history)
- carts (shopping carts)
- wishlists (user wishlists)

## Next Steps After Startup

1. Register a new user account
2. Verify email with OTP
3. Browse courses
4. Test enrollment flow
5. Configure Stripe for payments (optional)

## Need Help?

Check the main [README.md](README.md) for:
- Complete API documentation
- Detailed configuration guide
- Troubleshooting section
- Development workflow

---

**Last Updated:** Project restructured with unified `nexed` database
**Status:** Ready for development ✅
