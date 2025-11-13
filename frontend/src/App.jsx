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
import EnhancedUserProfile from './pages/profile/EnhancedUserProfile';
import MyLearning from './pages/MyLearning';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import AuthenticatedHome from './pages/AuthenticatedHome';
// About Pages
import AboutNexEd from './pages/about/AboutNexEd';
import OurMission from './pages/about/OurMission';
import Team from './pages/about/Team';
// Teach Pages
import BecomeInstructor from './pages/teach/BecomeInstructor';
import TeachingGuidelines from './pages/teach/TeachingGuidelines';
// Legal Pages
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import CommunityGuidelines from './pages/legal/CommunityGuidelines';
// Support Pages
import HelpCenter from './pages/support/HelpCenter';
import Contact from './pages/support/Contact';
import './App.css';
import './styles/theme-global.css';

const AnimatedRoutes = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Home Route - Different based on auth status */}
        <Route path="/" element={isAuthenticated ? <AuthenticatedHome /> : <LandingPage />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* About Pages - Public Access */}
        <Route path="/about" element={<AboutNexEd />} />
        <Route path="/mission" element={<OurMission />} />
        <Route path="/team" element={<Team />} />
        
        {/* Teach Pages - Public Access */}
        <Route path="/teach" element={<BecomeInstructor />} />
        <Route path="/teach/guidelines" element={<TeachingGuidelines />} />
        
        {/* Legal Pages - Public Access */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/community-guidelines" element={<CommunityGuidelines />} />
        
        {/* Support Pages - Public Access */}
        <Route path="/support" element={<HelpCenter />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Course Explorer - Public Access */}
        <Route path="/courses/*" element={<CoursesRoutes />} />
        
        {/* My Learning - Student Access */}
        <Route path="/my-learning" element={
          <ProtectedRoute allowedRoles={['student']}>
            <MyLearning />
          </ProtectedRoute>
        } />
        
        {/* Wishlist */}
        <Route path="/wishlist" element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        } />
        
        {/* Cart */}
        <Route path="/cart" element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        } />
        
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
            <EnhancedUserProfile />
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