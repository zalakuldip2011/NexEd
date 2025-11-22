import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { openRazorpayCheckout, formatAmount } from '../../utils/razorpay';
import paymentService from '../../services/paymentService';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import {
  PlayIcon,
  ClockIcon,
  UsersIcon,
  StarIcon,
  BookOpenIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid, HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const toast = useToast();
  const { wishlistItems, toggleWishlist: toggleWishlistContext } = useWishlist();
  const { cartItems, addToCart: addToCartContext } = useCart();
  
  const [course, setCourse] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Compute state from contexts
  const isInWishlist = wishlistItems.some(item => (item.course?._id || item.course) === courseId);
  const isInCart = cartItems.some(item => (item.course?._id || item.course) === courseId);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId, user]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseRes = await fetch(`/api/courses/public/${courseId}`);
      const courseData = await courseRes.json();
      
      if (!courseData.success) {
        throw new Error('Course not found');
      }
      
      setCourse(courseData.data.course);
      
      // Fetch related courses (same category, limit 6)
      if (courseData.data.course.category) {
        const relatedRes = await fetch(
          `/api/courses?category=${courseData.data.course.category}&limit=6`
        );
        const relatedData = await relatedRes.json();
        
        if (relatedData.success) {
          // Filter out current course from related courses
          const filtered = relatedData.data.courses.filter(
            c => c._id !== courseId
          );
          setRelatedCourses(filtered.slice(0, 4)); // Show max 4 related courses
        }
      }
      
      // Check enrollment status if user is logged in
      if (user) {
        try {
          const enrollmentRes = await fetch(`/api/enroll/check/${courseId}`, {
            credentials: 'include'
          });
          
          if (enrollmentRes.ok) {
            const enrollmentData = await enrollmentRes.json();
            setIsEnrolled(enrollmentData.enrolled || false);
          }
        } catch (error) {
          console.error('Error checking enrollment:', error);
          setIsEnrolled(false);
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      alert('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${courseId}` } });
      return;
    }

    try {
      setEnrolling(true);
      
      // ✅ FIRST: Check if already enrolled
      const enrollmentCheck = await fetch(`/api/enroll/check/${courseId}`, {
        credentials: 'include'
      });
      
      if (enrollmentCheck.ok) {
        const enrollmentData = await enrollmentCheck.json();
        if (enrollmentData.enrolled) {
          // User is already enrolled - redirect to course
          toast.success('You are already enrolled in this course!');
          navigate(`/learn/${courseId}`);
          return;
        }
      }
      
      // Check if course is free or paid
      if (!course.price || course.price === 0) {
        // Free course - direct enrollment
        const orderResponse = await paymentService.createOrder({ courseId });
        
        if (orderResponse.success && orderResponse.isFree) {
          setIsEnrolled(true);
          toast.success('Successfully enrolled in free course!');
          navigate(`/learn/${courseId}`);
        } else {
          toast.error(orderResponse.message || 'Failed to enroll');
        }
      } else {
        // Paid course - show payment modal
        setShowPaymentModal(true);
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      toast.error('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const handlePayment = async () => {
    try {
      setProcessingPayment(true);
      
      // ✅ DOUBLE CHECK: Verify not enrolled before payment
      const enrollmentCheck = await fetch(`/api/enroll/check/${courseId}`, {
        credentials: 'include'
      });
      
      if (enrollmentCheck.ok) {
        const enrollmentData = await enrollmentCheck.json();
        if (enrollmentData.enrolled) {
          toast.success('You are already enrolled in this course!');
          setShowPaymentModal(false);
          navigate(`/learn/${courseId}`);
          return;
        }
      }
      
      toast.info('Creating payment order...');

      // Step 1: Create Razorpay order
      const orderResponse = await paymentService.createOrder({ courseId });
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      const { order, razorpayKeyId, courseDetails } = orderResponse;

      // Step 2: Open Razorpay checkout
      const paymentResult = await openRazorpayCheckout({
        keyId: razorpayKeyId,
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'NexEd',
        description: courseDetails[0]?.title || 'Course Purchase',
        image: '/logo192.png',
        prefill: {
          name: user.username || user.email?.split('@')[0],
          email: user.email,
          contact: user.phone || ''
        },
        theme: {
          color: isDarkMode ? '#6366f1' : '#3b82f6'
        },
        notes: {
          courseId: courseId,
          userId: user.id
        }
      });

      // Step 3: Verify payment on backend
      toast.info('Verifying payment...');
      
      const verifyResponse = await paymentService.verifyPayment({
        razorpay_order_id: paymentResult.razorpay_order_id,
        razorpay_payment_id: paymentResult.razorpay_payment_id,
        razorpay_signature: paymentResult.razorpay_signature,
        courseIds: [courseId]
      });

      if (verifyResponse.success && verifyResponse.verified) {
        setIsEnrolled(true);
        setShowPaymentModal(false);
        toast.success('Payment successful! Enrollment completed.');
        
        // Redirect to course player after 1 second
        setTimeout(() => {
          navigate(`/learn/${courseId}`);
        }, 1000);
      } else {
        throw new Error('Payment verification failed');
      }

    } catch (error) {
      console.error('Payment error:', error);
      
      if (error.message === 'Payment cancelled by user') {
        toast.info('Payment cancelled');
      } else {
        toast.error(error.message || 'Payment failed. Please try again.');
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setTogglingWishlist(true);
      await toggleWishlistContext(courseId);
      toast.success('Wishlist updated!');
    } catch (error) {
      console.error('[CourseDetails] Error toggling wishlist:', error);
      toast.error(error.message || 'Failed to update wishlist');
    } finally {
      setTogglingWishlist(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      await addToCartContext(courseId);
      toast.success('Course added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleSection = (index) => {
    setExpandedSections(prev => {
      // ✅ SAFE: Validate prev before spreading
      const safePrev = prev && typeof prev === 'object' ? prev : {};
      return {
        ...safePrev,
        [index]: !safePrev[index]
      };
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const openLectureModal = (lecture) => {
    setSelectedLecture(lecture);
    setShowLectureModal(true);
  };

  const closeLectureModal = () => {
    setShowLectureModal(false);
    setSelectedLecture(null);
  };

  const nextCourse = () => {
    setCarouselIndex((prev) => 
      prev === relatedCourses.length - 1 ? 0 : prev + 1
    );
  };

  const prevCourse = () => {
    setCarouselIndex((prev) => 
      prev === 0 ? relatedCourses.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? 'bg-slate-900' : 'bg-gray-50'
        }`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Loading course...</p>
          </div>
        </div>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Header />
        <div className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? 'bg-slate-900' : 'bg-gray-50'
        }`}>
          <div className="text-center">
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Course Not Found
            </h2>
            <Link 
              to="/courses" 
              className="text-purple-600 hover:text-purple-700"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        {/* Hero Section */}
        <div className={`${
          isDarkMode ? 'bg-slate-800' : 'bg-gradient-to-r from-purple-900 to-indigo-900'
        } text-white`}>
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Course Info */}
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 bg-yellow-500 text-yellow-900 rounded-full text-sm font-medium">
                    {course.category}
                  </span>
                  <span className="px-3 py-1 bg-purple-500 bg-opacity-20 backdrop-blur-sm rounded-full text-sm">
                    {course.level}
                  </span>
                </div>

                <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                {course.subtitle && (
                  <p className="text-xl text-gray-300 mb-6">{course.subtitle}</p>
                )}

                <div className="flex flex-wrap items-center gap-6 mb-6">
                  {course.averageRating > 0 && (
                    <div className="flex items-center">
                      <div className="flex items-center mr-2">
                        {[...Array(5)].map((_, i) => (
                          <StarSolid
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(course.averageRating)
                                ? 'text-yellow-400'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{course.averageRating.toFixed(1)}</span>
                      <span className="text-gray-300 ml-2">
                        ({course.totalReviews} reviews)
                      </span>
                    </div>
                  )}

                  <div className="flex items-center">
                    <UsersIcon className="h-5 w-5 mr-2" />
                    <span>{course.totalEnrollments || 0} students enrolled</span>
                  </div>

                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    <span>{formatDuration(course.totalDuration)}</span>
                  </div>

                  <div className="flex items-center">
                    <BookOpenIcon className="h-5 w-5 mr-2" />
                    <span>{course.totalLectures || 0} lectures</span>
                  </div>
                </div>

                {course.instructor && (
                  <div className="flex items-center">
                    <span className="text-gray-300">Created by</span>
                    <span className="ml-2 font-semibold">{course.instructor.name}</span>
                  </div>
                )}
              </div>

              {/* Right Column - Price Card */}
              <div className="lg:col-span-1">
                <div className={`rounded-xl shadow-2xl overflow-hidden ${
                  isDarkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-white'
                }`}>
                  {course.thumbnail && (
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="mb-6">
                      {course.price === 0 ? (
                        <div className="text-3xl font-bold text-green-600">FREE</div>
                      ) : (
                        <div>
                          <div className={`text-3xl font-bold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            ₹{course.price}
                          </div>
                          {course.originalPrice > course.price && (
                            <div className="flex items-center mt-2">
                              <span className={`text-lg line-through ${
                                isDarkMode ? 'text-slate-400' : 'text-gray-400'
                              }`}>
                                ₹{course.originalPrice}
                              </span>
                              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded">
                                {course.discount}% OFF
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {isEnrolled ? (
                      <Link
                        to={`/learn/${courseId}`}
                        className="block w-full py-3 px-6 text-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg transition-all"
                      >
                        🎓 Go to Course
                      </Link>
                    ) : (
                      <div className="space-y-3">
                        {/* Wishlist Button */}
                        <button
                          onClick={toggleWishlist}
                          disabled={togglingWishlist}
                          className={`w-full py-3 px-6 border-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                            isDarkMode
                              ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          } disabled:opacity-50`}
                        >
                          {isInWishlist ? (
                            <><HeartSolid className="h-5 w-5 text-red-500" /> Remove from Wishlist</>
                          ) : (
                            <><HeartIcon className="h-5 w-5" /> Add to Wishlist</>
                          )}
                        </button>

                        {course.price > 0 ? (
                          <>
                            {/* Add to Cart Button */}
                            {!isInCart ? (
                              <button
                                onClick={addToCart}
                                disabled={addingToCart}
                                className={`w-full py-3 px-6 border-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                                  isDarkMode
                                    ? 'border-purple-500 text-purple-300 hover:bg-purple-500/20'
                                    : 'border-purple-600 text-purple-600 hover:bg-purple-50'
                                } disabled:opacity-50`}
                              >
                                {addingToCart ? (
                                  <ShoppingCartIcon className="h-5 w-5 animate-pulse" />
                                ) : (
                                  <><ShoppingCartIcon className="h-5 w-5" /> Add to Cart</>
                                )}
                              </button>
                            ) : (
                              <Link
                                to="/cart"
                                className="block w-full py-3 px-6 text-center bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                              >
                                Go to Cart
                              </Link>
                            )}
                            {/* Buy Now Button */}
                            <button
                              onClick={handleEnroll}
                              disabled={enrolling}
                              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {enrolling ? 'Processing...' : 'Buy Now'}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={handleEnroll}
                            disabled={enrolling}
                            className="w-full py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {enrolling ? 'Enrolling...' : 'Enroll Free'}
                          </button>
                        )}
                      </div>
                    )}

                    <div className={`mt-6 pt-6 border-t space-y-3 ${
                      isDarkMode ? 'border-slate-700' : 'border-gray-200'
                    }`}>
                      <div className="flex items-center">
                        <CheckCircleIcon className={`h-5 w-5 mr-3 ${
                          isDarkMode ? 'text-green-400' : 'text-green-600'
                        }`} />
                        <span className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                          Full lifetime access
                        </span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className={`h-5 w-5 mr-3 ${
                          isDarkMode ? 'text-green-400' : 'text-green-600'
                        }`} />
                        <span className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                          Access on mobile and desktop
                        </span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className={`h-5 w-5 mr-3 ${
                          isDarkMode ? 'text-green-400' : 'text-green-600'
                        }`} />
                        <span className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                          Certificate of completion
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className={`rounded-xl shadow-lg p-6 ${
                isDarkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-white'
              }`}>
                <h2 className={`text-2xl font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  About this course
                </h2>
                <p className={`whitespace-pre-wrap ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  {course.description}
                </p>
              </div>

              {/* Learning Outcomes */}
              {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                <div className={`rounded-xl shadow-lg p-6 ${
                  isDarkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-white'
                }`}>
                  <h2 className={`text-2xl font-bold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    What you'll learn
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.learningOutcomes.map((outcome, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircleIcon className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${
                          isDarkMode ? 'text-purple-400' : 'text-purple-600'
                        }`} />
                        <span className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                          {outcome}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Content */}
              <div className={`rounded-xl shadow-lg p-6 ${
                isDarkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-white'
              }`}>
                <h2 className={`text-2xl font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Course Content
                </h2>
                <div className="space-y-2">
                  {course.sections && course.sections.map((section, index) => (
                    <div 
                      key={section._id}
                      className={`border rounded-lg ${
                        isDarkMode ? 'border-slate-700' : 'border-gray-200'
                      }`}
                    >
                      <button
                        onClick={() => toggleSection(index)}
                        className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
                          isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex-1 text-left">
                          <h3 className={`font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {section.title}
                          </h3>
                          <p className={`text-sm mt-1 ${
                            isDarkMode ? 'text-slate-400' : 'text-gray-600'
                          }`}>
                            {section.lectures.length} lectures
                          </p>
                        </div>
                        {expandedSections[index] ? (
                          <ChevronUpIcon className={`h-5 w-5 ${
                            isDarkMode ? 'text-slate-400' : 'text-gray-400'
                          }`} />
                        ) : (
                          <ChevronDownIcon className={`h-5 w-5 ${
                            isDarkMode ? 'text-slate-400' : 'text-gray-400'
                          }`} />
                        )}
                      </button>
                      
                      {expandedSections[index] && (
                        <div className={`border-t px-4 py-2 ${
                          isDarkMode ? 'border-slate-700 bg-slate-700/20' : 'border-gray-200 bg-gray-50'
                        }`}>
                          {section.lectures.map((lecture) => (
                            <button
                              key={lecture._id}
                              onClick={() => openLectureModal(lecture)}
                              className={`w-full py-3 flex items-center justify-between hover:bg-opacity-50 transition-all duration-200 ${
                                isDarkMode ? 'hover:bg-slate-600/30' : 'hover:bg-gray-100'
                              }`}
                            >
                              <div className="flex items-center">
                                <PlayIcon className={`h-4 w-4 mr-3 ${
                                  isDarkMode ? 'text-slate-400' : 'text-gray-400'
                                }`} />
                                <span className={`text-left ${
                                  isDarkMode ? 'text-slate-300' : 'text-gray-700'
                                }`}>
                                  {lecture.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                {lecture.isFree && (
                                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full font-medium">
                                    Preview
                                  </span>
                                )}
                                {lecture.duration > 0 && (
                                  <span className={`text-sm ${
                                    isDarkMode ? 'text-slate-500' : 'text-gray-500'
                                  }`}>
                                    {Math.floor(lecture.duration / 60)}:{(lecture.duration % 60).toString().padStart(2, '0')}
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <div className={`rounded-xl shadow-lg p-6 ${
                  isDarkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-white'
                }`}>
                  <h2 className={`text-2xl font-bold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Requirements
                  </h2>
                  <ul className="space-y-2">
                    {course.requirements.map((req, index) => (
                      <li 
                        key={index}
                        className={`flex items-start ${
                          isDarkMode ? 'text-slate-300' : 'text-gray-700'
                        }`}
                      >
                        <span className="mr-2">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Instructor Bio */}
              {course.instructor && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`rounded-xl shadow-lg p-6 ${
                    isDarkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-white'
                  }`}
                >
                  <h2 className={`text-2xl font-bold mb-6 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Instructor
                  </h2>
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      {course.instructor.avatar ? (
                        <img
                          src={course.instructor.avatar}
                          alt={course.instructor.name}
                          className="w-24 h-24 rounded-full object-cover border-4 border-purple-500"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center border-4 border-purple-500">
                          <UserCircleIcon className="w-16 h-16 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {course.instructor.name}
                      </h3>
                      {course.instructor.title && (
                        <p className={`text-sm mb-3 ${
                          isDarkMode ? 'text-purple-400' : 'text-purple-600'
                        }`}>
                          {course.instructor.title}
                        </p>
                      )}
                      {course.instructor.bio && (
                        <p className={`mb-4 ${
                          isDarkMode ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                          {course.instructor.bio}
                        </p>
                      )}
                      {course.instructor.email && (
                        <p className={`text-sm ${
                          isDarkMode ? 'text-slate-400' : 'text-gray-600'
                        }`}>
                          Contact: {course.instructor.email}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Related Courses */}
              {relatedCourses.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={`rounded-xl shadow-lg p-6 ${
                    isDarkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-white'
                  }`}
                >
                  <h2 className={`text-2xl font-bold mb-6 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Related Courses
                  </h2>
                  
                  {/* Carousel */}
                  <div className="relative">
                    {relatedCourses.length > 1 && (
                      <>
                        <button
                          onClick={prevCourse}
                          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
                            isDarkMode 
                              ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                              : 'bg-white hover:bg-gray-50 text-gray-900'
                          }`}
                          aria-label="Previous course"
                        >
                          <ChevronLeftIcon className="h-6 w-6" />
                        </button>
                        <button
                          onClick={nextCourse}
                          className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
                            isDarkMode 
                              ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                              : 'bg-white hover:bg-gray-50 text-gray-900'
                          }`}
                          aria-label="Next course"
                        >
                          <ChevronRightIcon className="h-6 w-6" />
                        </button>
                      </>
                    )}
                    
                    <div className="overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={carouselIndex}
                          initial={{ opacity: 0, x: 100 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Link
                            to={`/courses/${relatedCourses[carouselIndex]._id}`}
                            className={`block rounded-lg border transition-all duration-200 hover:shadow-xl ${
                              isDarkMode 
                                ? 'border-slate-700 hover:border-purple-500' 
                                : 'border-gray-200 hover:border-purple-400'
                            }`}
                          >
                            <div className="flex flex-col md:flex-row gap-4">
                              {/* Course Thumbnail */}
                              <div className="md:w-1/3 flex-shrink-0">
                                {relatedCourses[carouselIndex].thumbnail ? (
                                  <img
                                    src={relatedCourses[carouselIndex].thumbnail}
                                    alt={relatedCourses[carouselIndex].title}
                                    className="w-full h-48 md:h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                                  />
                                ) : (
                                  <div className="w-full h-48 md:h-full bg-gradient-to-br from-purple-600 to-pink-600 rounded-t-lg md:rounded-l-lg md:rounded-tr-none flex items-center justify-center">
                                    <span className="text-white text-4xl font-bold">
                                      {relatedCourses[carouselIndex].title?.charAt(0) || 'C'}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Course Info */}
                              <div className="flex-1 p-4">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                                  isDarkMode 
                                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
                                    : 'bg-purple-100 text-purple-700'
                                }`}>
                                  {relatedCourses[carouselIndex].category}
                                </span>
                                <h3 className={`text-xl font-bold mb-2 ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {relatedCourses[carouselIndex].title}
                                </h3>
                                <p className={`text-sm mb-3 line-clamp-2 ${
                                  isDarkMode ? 'text-slate-400' : 'text-gray-600'
                                }`}>
                                  {relatedCourses[carouselIndex].description}
                                </p>
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <StarSolid className="h-4 w-4 text-yellow-400" />
                                    <span className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                                      {relatedCourses[carouselIndex].averageRating || 0}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <UsersIcon className={`h-4 w-4 ${
                                      isDarkMode ? 'text-slate-400' : 'text-gray-500'
                                    }`} />
                                    <span className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                                      {relatedCourses[carouselIndex].enrollmentCount || 0} students
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <span className={`text-2xl font-bold ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    {relatedCourses[carouselIndex].price === 0 
                                      ? 'Free' 
                                      : `₹${relatedCourses[carouselIndex].price}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    
                    {/* Carousel Indicators */}
                    {relatedCourses.length > 1 && (
                      <div className="flex justify-center gap-2 mt-4">
                        {relatedCourses.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCarouselIndex(index)}
                            className={`h-2 rounded-full transition-all duration-200 ${
                              index === carouselIndex
                                ? 'w-8 bg-purple-600'
                                : 'w-2 bg-slate-400 hover:bg-slate-500'
                            }`}
                            aria-label={`Go to course ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className={`rounded-xl shadow-lg p-6 sticky top-4 ${
                isDarkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-white'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Course Features
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <GlobeAltIcon className={`h-5 w-5 mr-3 ${
                      isDarkMode ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                    <span className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                      Language: {course.language}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <AcademicCapIcon className={`h-5 w-5 mr-3 ${
                      isDarkMode ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                    <span className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                      Level: {course.level}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <BookOpenIcon className={`h-5 w-5 mr-3 ${
                      isDarkMode ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                    <span className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                      {course.totalLectures} Lectures
                    </span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className={`h-5 w-5 mr-3 ${
                      isDarkMode ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                    <span className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                      {formatDuration(course.totalDuration)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lecture Preview Modal */}
      <AnimatePresence>
        {showLectureModal && selectedLecture && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLectureModal}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl ${
                isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
              }`}>
                {/* Close Button */}
                <button
                  onClick={closeLectureModal}
                  className={`absolute -top-4 -right-4 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10 ${
                    isDarkMode 
                      ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                      : 'bg-white hover:bg-gray-50 text-gray-900'
                  }`}
                  aria-label="Close modal"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>

                {/* Modal Content */}
                <div className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
                      <PlayIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-2xl font-bold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {selectedLecture.title}
                      </h3>
                      {selectedLecture.duration > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <ClockIcon className={`h-4 w-4 ${
                            isDarkMode ? 'text-slate-400' : 'text-gray-500'
                          }`} />
                          <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                            {Math.floor(selectedLecture.duration / 60)}:{(selectedLecture.duration % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedLecture.description && (
                    <div className="mb-6">
                      <h4 className={`text-sm font-semibold mb-2 uppercase tracking-wide ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}>
                        Description
                      </h4>
                      <p className={`${
                        isDarkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>
                        {selectedLecture.description}
                      </p>
                    </div>
                  )}

                  {selectedLecture.resources && selectedLecture.resources.length > 0 && (
                    <div className="mb-6">
                      <h4 className={`text-sm font-semibold mb-3 uppercase tracking-wide ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}>
                        Resources
                      </h4>
                      <div className="space-y-2">
                        {selectedLecture.resources.map((resource, index) => (
                          <div 
                            key={index}
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'
                            }`}
                          >
                            <DocumentTextIcon className={`h-5 w-5 ${
                              isDarkMode ? 'text-purple-400' : 'text-purple-600'
                            }`} />
                            <span className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                              {resource.title || `Resource ${index + 1}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isEnrolled && (
                    <div className={`p-4 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-purple-600/10 border-purple-500/30' 
                        : 'bg-purple-50 border-purple-200'
                    }`}>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-purple-300' : 'text-purple-700'
                      }`}>
                        {selectedLecture.isFree 
                          ? '✨ This is a free preview lecture. Enroll to access all lectures!'
                          : '🔒 Enroll in this course to access this lecture and all other course content.'}
                      </p>
                    </div>
                  )}

                  {isEnrolled && (
                    <button
                      onClick={() => navigate(`/learn/${courseId}`)}
                      className="w-full mt-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      Go to Course Player
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !processingPayment && setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              className={`relative w-full max-w-md rounded-2xl shadow-2xl ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              {!processingPayment && (
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              )}

              {/* Header */}
              <div className={`p-6 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h3 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Complete Payment
                </h3>
                <p className={`mt-2 text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Secure payment powered by Razorpay
                </p>
              </div>

              {/* Course Details */}
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className={`font-semibold line-clamp-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {course.title}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      By {course.instructor?.username || 'Instructor'}
                    </p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Course Price
                      </span>
                      <span className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        ₹{course.price}
                      </span>
                    </div>
                    {course.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          Discount ({course.discount}%)
                        </span>
                        <span className="text-green-500 font-medium">
                          - ₹{(course.price * course.discount / 100).toFixed(0)}
                        </span>
                      </div>
                    )}
                    <div className={`pt-2 border-t flex justify-between ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      <span className={`font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Total Amount
                      </span>
                      <span className="text-2xl font-bold text-blue-500">
                        ₹{course.discount > 0 
                          ? (course.price * (1 - course.discount / 100)).toFixed(0)
                          : course.price}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={processingPayment}
                  className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 ${
                    processingPayment
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {processingPayment ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CreditCardIcon className="h-5 w-5" />
                      Pay Now with Razorpay
                    </span>
                  )}
                </button>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-sm">
                  <ShieldCheckIcon className={`h-5 w-5 ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Secure payment by Razorpay
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
};

export default CourseDetails;
