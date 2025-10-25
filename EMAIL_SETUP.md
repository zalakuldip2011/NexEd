# Email Verification Setup Instructions

## 📧 Email Service Configuration

The Edemy platform now includes email verification with OTP (One-Time Password) for secure user registration.

### 🔧 Backend Setup

1. **Configure Email Settings in `.env`**:
   ```bash
   # Email Configuration for OTP Verification
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@edemy.com
   
   # OTP Configuration
   OTP_EXPIRE_MINUTES=10
   OTP_LENGTH=6
   ```

2. **Gmail App Password Setup** (Recommended):
   - Enable 2-Factor Authentication on your Gmail account
   - Go to Google Account Settings → Security → App passwords
   - Generate a new app password for "Mail"
   - Use this app password in `EMAIL_PASS` (not your regular Gmail password)

3. **Alternative Email Providers**:
   ```bash
   # Outlook/Hotmail
   EMAIL_HOST=smtp-mail.outlook.com
   EMAIL_PORT=587
   
   # Yahoo
   EMAIL_HOST=smtp.mail.yahoo.com
   EMAIL_PORT=587
   
   # Custom SMTP
   EMAIL_HOST=your-smtp-server.com
   EMAIL_PORT=587
   ```

### 📱 Email Verification Flow

1. **User Registration**:
   - User fills signup form with username, email, password
   - Backend creates unverified user account
   - 6-digit OTP sent to user's email
   - User redirected to email verification page

2. **Email Verification**:
   - User enters email and 6-digit OTP
   - Backend validates OTP and expiration (10 minutes)
   - Account marked as verified
   - User automatically logged in and redirected to dashboard

3. **Login Protection**:
   - Unverified users cannot login
   - Redirected to email verification page
   - Can request new OTP if needed

### 🔒 Security Features

- **OTP Expiration**: Codes expire after 10 minutes
- **Rate Limiting**: Max 5 OTP requests per 15 minutes per IP
- **Attempt Limiting**: Max 5 verification attempts per OTP
- **Resend Cooldown**: 1-minute wait between OTP resends
- **Email Templates**: Professional HTML emails with branding

### 🛠️ Testing Without Email Service

For development/testing without real email service:

1. **Console Logging** (Development):
   ```bash
   # Set invalid email credentials to trigger console logging
   EMAIL_USER=test@example.com
   EMAIL_PASS=invalid_password
   ```
   OTP will be logged to console instead of sending emails.

2. **Test Mode** (Add to .env):
   ```bash
   NODE_ENV=development
   EMAIL_TEST_MODE=true
   ```

### 📁 File Structure

```
backend/
├── models/User.js              # Updated with OTP fields and methods
├── controllers/authController.js   # Added verifyEmail and resendOTP
├── utils/emailService.js       # Email sending service with templates
├── middleware/validation.js    # OTP validation rules
├── routes/auth.js             # New verification routes
└── .env                       # Email configuration

frontend/
├── src/
│   ├── pages/auth/
│   │   ├── EmailVerification.jsx  # OTP verification page
│   │   ├── Login.jsx              # Updated with verification handling
│   │   └── Signup.jsx             # Updated to redirect to verification
│   ├── pages/dashboard/
│   │   └── Dashboard.jsx          # Welcome page after verification
│   ├── context/AuthContext.jsx    # Added verification methods
│   └── App.jsx                    # Added verification routes
```

### 🎨 UI Components

- **Beautiful Email Verification Page**: Dark theme, OTP input field, timer
- **Professional Email Templates**: Branded HTML emails with security notes
- **Dashboard Welcome**: Celebration page after successful verification
- **Error Handling**: Clear error messages and redirects

### 🧪 Testing the Flow

1. **Start the servers**:
   ```bash
   # Backend
   cd backend && npm start
   
   # Frontend
   cd frontend && npm start
   ```

2. **Test signup flow**:
   - Go to `http://localhost:3000/signup`
   - Fill form with valid email
   - Check email for OTP code
   - Enter OTP on verification page
   - Should redirect to dashboard

3. **Test login protection**:
   - Try logging in with unverified account
   - Should redirect to verification page

### 🚀 Production Deployment

1. **Environment Variables**:
   - Set production email credentials
   - Use secure SMTP service (SendGrid, AWS SES, etc.)
   - Enable HTTPS for secure cookie handling

2. **Email Service Recommendations**:
   - **SendGrid**: Free tier with 100 emails/day
   - **AWS SES**: Pay-per-use, highly reliable
   - **Mailgun**: Good for transactional emails
   - **Gmail**: Works but has sending limits

3. **Security Considerations**:
   - Use strong JWT secrets
   - Enable CORS properly
   - Set secure cookie flags in production
   - Monitor for email sending failures

### 📋 API Endpoints

```
POST /api/auth/signup          # Register with email verification
POST /api/auth/verify-email    # Verify OTP code
POST /api/auth/resend-otp      # Request new OTP
POST /api/auth/login           # Login (requires verified email)
```

### 🐛 Troubleshooting

1. **Emails not sending**:
   - Check email credentials
   - Verify SMTP settings
   - Check firewall/network restrictions
   - Look at server console for error logs

2. **OTP validation failing**:
   - Check system time synchronization
   - Verify OTP expiration settings
   - Check for typos in OTP input

3. **Rate limiting issues**:
   - Clear browser cache/cookies
   - Try from different IP/device
   - Check rate limit configurations

### 📧 Email Templates Preview

The system sends two types of emails:

1. **OTP Verification Email**: 
   - 6-digit code prominently displayed
   - 10-minute expiration warning
   - Security reminder
   - Branded Edemy design

2. **Welcome Email** (after verification):
   - Congratulations message
   - Platform feature highlights
   - Quick start guide
   - Dashboard link

Both emails use responsive HTML design with dark theme matching the application.
