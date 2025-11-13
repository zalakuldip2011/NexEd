# NexEd - Next Generation E-Learning Platform

A comprehensive MERN stack e-learning platform with course management, payments, and student enrollment features.

## 🏗️ Project Structure

```
NexEd/
├── backend/              # Main API Server (Port 5000)
│   ├── config/          # Database & Stripe configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth, validation, upload
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── utils/           # Email service
│   └── server.js        # Backend entry point
│
├── src/                 # Course Service (Port 5001)
│   ├── app.js           # Express app
│   ├── server.js        # Course service entry point
│   └── courses/         # Course-specific logic
│
├── frontend/            # React Frontend (Port 3000)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
└── tests/               # Integration tests
```

## 🗄️ Database Structure

**Database Name:** `nexed`

All services connect to the same MongoDB database for data consistency:
- Main Backend API → `nexed` database
- Course Service → `nexed` database

## 🚀 Getting Started

### Prerequisites

- Node.js >= 14.0.0
- MongoDB (local or cloud)
- npm or yarn

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install course service dependencies (root level)
npm install

# Install frontend dependencies
cd frontend
npm install
```

### 2. Configure Environment Variables

#### Backend Configuration (`backend/.env`)

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/nexed

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRES_IN=30

# Email Configuration (Gmail with App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# OTP Configuration
OTP_EXPIRE_MINUTES=10
OTP_LENGTH=6

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Frontend URL
CLIENT_URL=http://localhost:3000

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

#### Course Service Configuration (`.env` at root)

```env
NODE_ENV=development
COURSE_SERVICE_PORT=5001
MONGO_URI=mongodb://localhost:27017/nexed
```

#### Frontend Configuration (`frontend/.env`)

```env
HOST=0.0.0.0
HTTPS=false
DANGEROUSLY_DISABLE_HOST_CHECK=true

REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FRONTEND_URL=http://localhost:3000
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongodb
# or
brew services start mongodb-community
```

### 4. Run the Application

You need to run all three services:

#### Terminal 1 - Backend API (Port 5000)
```bash
cd backend
npm run dev
# or
npm start
```

#### Terminal 2 - Course Service (Port 5001)
```bash
# From project root
npm run dev
# or
npm start
```

#### Terminal 3 - Frontend (Port 3000)
```bash
cd frontend
npm start
```

## 🌐 Accessing the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Course Service:** http://localhost:5001
- **API Health Check:** http://localhost:5000/api/health

## 📚 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-otp` - Verify email OTP
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Courses (`/api/courses`)
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (instructor)
- `PUT /api/courses/:id` - Update course (instructor)
- `DELETE /api/courses/:id` - Delete course (instructor)

### Enrollments (`/api/enrollments`)
- `GET /api/enrollments` - Get user enrollments
- `POST /api/enrollments` - Enroll in course
- `PUT /api/enrollments/:id/progress` - Update progress

### Reviews (`/api/reviews`)
- `GET /api/reviews/course/:courseId` - Get course reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Payments (`/api/payments`)
- `POST /api/payments/create-checkout-session` - Create Stripe checkout
- `POST /api/payments/webhook` - Stripe webhook handler
- `GET /api/payments/history` - Payment history

### Cart (`/api/cart`)
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `DELETE /api/cart/:courseId` - Remove from cart

### Wishlist (`/api/wishlist`)
- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:courseId` - Remove from wishlist

## 🔧 Common Issues & Solutions

### Database Connection Error

**Error:** `MongooseError: Operation buffering timed out`

**Solution:**
1. Ensure MongoDB is running: `mongod --version`
2. Check if port 27017 is available
3. Verify connection string in `.env` files

### Port Already in Use

**Error:** `EADDRINUSE: address already in use`

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Stripe Not Configured

**Error:** `Stripe not configured`

**Solution:**
1. Get API keys from https://dashboard.stripe.com/test/apikeys
2. Update `STRIPE_SECRET_KEY` in `backend/.env`
3. Update `REACT_APP_STRIPE_PUBLISHABLE_KEY` in `frontend/.env`

### Email Service Error

**Error:** `Email authentication failed`

**Solution:**
1. Enable 2-Factor Authentication on Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password in `EMAIL_PASS`

## 📦 Installing Missing Stripe Package

If you get Stripe-related errors, install it:

```bash
cd backend
npm install stripe
```

## 🧪 Testing

```bash
# Run integration tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🐳 Docker Support

```bash
# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 👥 User Roles

1. **Student** - Browse courses, enroll, learn, review
2. **Instructor** - Create courses, manage content, view analytics
3. **Admin** - Manage users, courses, system settings

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- XSS protection

## 📧 Email Features

- OTP verification for registration
- Password reset emails
- Welcome emails
- Account deletion notifications
- Beautiful HTML email templates

## 💳 Payment Integration

- Stripe Checkout Sessions
- Secure payment processing
- Webhook handling
- Payment history
- Refund support

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For issues and questions:
- Email: support@nexed.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/nexed/issues)

---

Made with ❤️ by the NexEd Team
