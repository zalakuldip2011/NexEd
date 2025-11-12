import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import EmailVerification from './pages/auth/EmailVerification';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyResetOTP from './pages/auth/VerifyResetOTP';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/dashboard/Dashboard';
import BecomeEducator from './pages/educator/BecomeEducator';
import InstructorDashboard from './pages/instructor/Dashboard';
import InstructorCourses from './pages/instructor/Courses';
import CourseCreate from './pages/instructor/CourseCreate';
import CourseAnalytics from './pages/instructor/CourseAnalytics';
import CoursesRoutes from './pages/courses';
import CourseLearning from './pages/courses/CourseLearning';
import InteractiveCoursePlayer from './pages/courses/InteractiveCoursePlayer';
import UserProfile from './pages/profile/UserProfile';
import './App.css';
import './styles/theme-global.css';

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Course Explorer - Public Access */}
        <Route path="/courses/*" element={<CoursesRoutes />} />
        
        {/* Course Learning - Student Access */}
        <Route path="/learn/:courseId" element={
          <ProtectedRoute allowedRoles={['student']}>
            <InteractiveCoursePlayer />
          </ProtectedRoute>
        } />
        
        {/* Legacy Course Learning Route */}
        <Route path="/course/learn/:courseId" element={
          <ProtectedRoute allowedRoles={['student']}>
            <CourseLearning />
          </ProtectedRoute>
        } />
        
        {/* User Profile */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        
        {/* Student Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['student']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Educator Onboarding */}
        <Route path="/become-educator" element={
          <ProtectedRoute>
            <BecomeEducator />
          </ProtectedRoute>
        } />
        
        {/* Instructor Dashboard */}
        <Route path="/instructor/dashboard" element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/instructor" element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/instructor/courses" element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorCourses />
          </ProtectedRoute>
        } />
        <Route path="/instructor/courses/create" element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <CourseCreate />
          </ProtectedRoute>
        } />
        <Route path="/instructor/courses/edit/:id" element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <CourseCreate />
          </ProtectedRoute>
        } />
        <Route path="/instructor/courses/:id/analytics" element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <CourseAnalytics />
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
};

const AppContent = () => {
  const { isDarkMode } = useTheme();
  const { isLoading } = useAuth();
  
  React.useEffect(() => {
    // Apply theme to document element for CSS variables
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
  }, [isDarkMode]);
  
  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading...
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`App theme-page ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <AnimatedRoutes />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <AppContent />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;