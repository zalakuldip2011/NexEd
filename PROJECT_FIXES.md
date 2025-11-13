# 🎯 NexEd Project - Database & Configuration Fixes

## ✅ Issues Fixed

### 1. **Database Configuration Inconsistency**
**Problem:** Different services were using different databases
- Backend was using `NexEd` database
- Course service was using `nexed_courses` database

**Solution:** Unified all services to use `nexed` database
- ✅ `backend/.env` → `MONGODB_URI=mongodb://localhost:27017/nexed`
- ✅ `.env` (root) → `MONGO_URI=mongodb://localhost:27017/nexed`
- ✅ `src/server.js` → Default database changed to `nexed`

### 2. **Missing Stripe Package**
**Problem:** Backend was importing Stripe but package wasn't in dependencies

**Solution:** Added Stripe to backend dependencies
- ✅ Added `"stripe": "^14.10.0"` to `backend/package.json`
- ✅ Ran `npm install` in backend folder

### 3. **Port Configuration Issues**
**Problem:** Course service was using wrong port variable

**Solution:** Updated course service to use correct port
- ✅ Changed from `process.env.PORT` to `process.env.COURSE_SERVICE_PORT`
- ✅ Default port set to 5001 (backend uses 5000)

### 4. **Test Database Naming**
**Problem:** Test database had inconsistent naming

**Solution:** Standardized test database
- ✅ Changed from `nexed-test` to `nexed_test`

### 5. **Missing Documentation**
**Problem:** No clear instructions on how to run the project

**Solution:** Created comprehensive documentation
- ✅ `README.md` - Full project documentation
- ✅ `STARTUP_GUIDE.md` - Quick startup instructions
- ✅ Batch scripts for easy startup

## 📊 Project Structure (Clarified)

```
NexEd/
│
├── 🔵 backend/                    [Main API Server - Port 5000]
│   ├── .env                       → Configuration (nexed database)
│   ├── server.js                  → Entry point
│   ├── config/
│   │   ├── db.js                 → MongoDB connection
│   │   └── stripe.js             → Stripe configuration
│   ├── controllers/              → Business logic
│   ├── models/                   → MongoDB schemas
│   ├── routes/                   → API routes
│   └── package.json              → Dependencies (includes stripe)
│
├── 🟢 src/                        [Course Service - Port 5001]
│   ├── server.js                 → Entry point
│   ├── app.js                    → Express app
│   └── courses/                  → Course-specific logic
│
├── 🟡 frontend/                   [React App - Port 3000]
│   ├── .env                      → Configuration
│   ├── src/
│   │   ├── App.jsx              → Main component
│   │   ├── components/          → React components
│   │   ├── pages/               → Page components
│   │   └── services/            → API services
│   └── package.json             → Dependencies
│
├── .env                          → Course service config (nexed database)
├── package.json                  → Course service dependencies
└── 📚 Documentation files
    ├── README.md
    ├── STARTUP_GUIDE.md
    └── PROJECT_FIXES.md (this file)
```

## 🗄️ Database Architecture

### Single Database: `nexed`

All services now connect to the same MongoDB database for consistency:

**Collections:**
- `users` - User accounts, authentication
- `courses` - Course data, content
- `enrollments` - Student enrollments
- `reviews` - Course reviews and ratings
- `payments` - Payment transactions
- `carts` - Shopping cart items
- `wishlists` - User wishlists

**Test Database:** `nexed_test` (used for integration tests)

## 🚀 How to Start the Project

### Quick Start (Windows)

1. **Install Dependencies:**
   ```bash
   # Double-click or run:
   install-all.bat
   ```

2. **Check Environment:**
   ```bash
   # Double-click or run:
   check-environment.bat
   ```

3. **Start Services** (in order):
   - Double-click `start-backend.bat` (Port 5000)
   - Double-click `start-course-service.bat` (Port 5001)
   - Double-click `start-frontend.bat` (Port 3000)

### Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Course Service:**
```bash
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm start
```

## 🔧 Environment Variables Reference

### backend/.env
```env
# Database
MONGODB_URI=mongodb://localhost:27017/nexed        ✅ FIXED

# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRES_IN=30

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-email@gmail.com                    ⚠️ CONFIGURE
EMAIL_PASS=your-app-password                       ⚠️ CONFIGURE
EMAIL_FROM=your-email@gmail.com

# OTP
OTP_EXPIRE_MINUTES=10
OTP_LENGTH=6

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key           ⚠️ CONFIGURE
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### .env (root - Course Service)
```env
NODE_ENV=development
COURSE_SERVICE_PORT=5001
MONGO_URI=mongodb://localhost:27017/nexed          ✅ FIXED
```

### frontend/.env
```env
HOST=0.0.0.0
HTTPS=false
DANGEROUSLY_DISABLE_HOST_CHECK=true

REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FRONTEND_URL=http://localhost:3000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...      ⚠️ CONFIGURE
```

## ✅ Verification Checklist

### Prerequisites
- [x] Node.js >= 14.0.0 installed
- [x] MongoDB installed
- [ ] MongoDB running on port 27017
- [x] All dependencies installed

### Configuration
- [x] Database unified to `nexed`
- [x] Stripe package added to backend
- [x] Port configurations corrected
- [ ] Email credentials configured (optional)
- [ ] Stripe keys configured (optional)

### Files Created
- [x] README.md - Full documentation
- [x] STARTUP_GUIDE.md - Quick start guide
- [x] PROJECT_FIXES.md - This file
- [x] install-all.bat - Install script
- [x] check-environment.bat - Environment checker
- [x] start-backend.bat - Backend launcher
- [x] start-course-service.bat - Course service launcher
- [x] start-frontend.bat - Frontend launcher

## 🔍 Testing the Fix

### 1. Check MongoDB Connection
```bash
# Start MongoDB
net start MongoDB

# Connect to verify database
mongosh
use nexed
show collections
```

### 2. Test Backend API
```bash
# Start backend
cd backend
npm run dev

# In browser, visit:
http://localhost:5000/api/health

# Should return:
{
  "success": true,
  "status": "OK",
  "database": "connected"
}
```

### 3. Test Course Service
```bash
# Start course service
npm run dev

# In browser, visit:
http://localhost:5001/health
```

### 4. Test Frontend
```bash
# Start frontend
cd frontend
npm start

# Browser should auto-open to:
http://localhost:3000
```

## 🐛 Common Issues After Fix

### Issue: MongoDB Connection Error
**Error:** `MongooseError: Operation buffering timed out`

**Solutions:**
1. Start MongoDB: `net start MongoDB`
2. Verify port: `netstat -an | findstr "27017"`
3. Check .env files have correct URI

### Issue: Port Already in Use
**Error:** `EADDRINUSE: address already in use`

**Solutions:**
```bash
# Find process
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

### Issue: Stripe Not Working
**Error:** `Stripe not configured`

**Solutions:**
1. Get keys from https://dashboard.stripe.com/test/apikeys
2. Update `STRIPE_SECRET_KEY` in `backend/.env`
3. Update `REACT_APP_STRIPE_PUBLISHABLE_KEY` in `frontend/.env`
4. Restart backend server

## 📈 Performance Improvements

1. **Single Database Connection** - Reduced connection overhead
2. **Proper Port Isolation** - No port conflicts
3. **Organized Structure** - Clear separation of concerns
4. **Added Batch Scripts** - Faster development startup

## 🎯 Next Steps

### For Development
1. Configure email service for OTP verification
2. Set up Stripe for payment testing
3. Create test user accounts
4. Add sample courses

### For Production
1. Update JWT_SECRET to secure random string
2. Enable MongoDB authentication
3. Set up MongoDB Atlas (cloud database)
4. Configure production Stripe keys
5. Set NODE_ENV=production
6. Enable HTTPS
7. Configure CORS for production domain

## 📝 Changes Summary

| File | Change | Status |
|------|--------|--------|
| `backend/.env` | Changed database to `nexed` | ✅ Fixed |
| `.env` | Changed database to `nexed` | ✅ Fixed |
| `src/server.js` | Updated port and database | ✅ Fixed |
| `backend/package.json` | Added Stripe dependency | ✅ Fixed |
| `tests/payment.integration.test.js` | Updated test database | ✅ Fixed |
| `README.md` | Created full documentation | ✅ Created |
| `STARTUP_GUIDE.md` | Created quick start guide | ✅ Created |
| `*.bat` scripts | Created startup scripts | ✅ Created |

## 🎉 Result

The project now has:
- ✅ Consistent database configuration across all services
- ✅ All required dependencies properly installed
- ✅ Clear documentation and startup instructions
- ✅ Easy-to-use batch scripts for Windows
- ✅ Proper port configuration (no conflicts)
- ✅ Ready for development and testing

## 📞 Support

If you encounter any issues:
1. Run `check-environment.bat` to verify setup
2. Check this document for common issues
3. Review `README.md` for detailed API documentation
4. Check `STARTUP_GUIDE.md` for configuration help

---

**Date Fixed:** November 14, 2025
**Status:** ✅ All issues resolved and documented
