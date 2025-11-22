import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  BookmarkIcon,
  ChatBubbleLeftIcon,
  AcademicCapIcon,
  ClockIcon,
  TrophyIcon,
  FireIcon,
  LightBulbIcon,
  QuestionMarkCircleIcon,
  ArrowPathIcon,
  SparklesIcon,
  HandThumbUpIcon,
  ShareIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolid,
  BookmarkIcon as BookmarkSolid,
  FireIcon as FireSolid,
  StarIcon
} from '@heroicons/react/24/solid';
import YouTubeVideoPlayer from '../../components/common/YouTubeVideoPlayer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const InteractiveCoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [completedLectures, setCompletedLectures] = useState(new Set());
  const [bookmarkedLectures, setBookmarkedLectures] = useState(new Set());
  
  // Interactive features
  const [activeTab, setActiveTab] = useState('content'); // content, notes, discussion, resources
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [learningStreak, setLearningStreak] = useState(0);
  const [todayLearningTime, setTodayLearningTime] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showAchievement, setShowAchievement] = useState(null);

  // Timer for tracking learning time
  const learningTimerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    fetchCourseAndEnrollment();
    startLearningTimer();

    return () => {
      if (learningTimerRef.current) {
        clearInterval(learningTimerRef.current);
      }
    };
  }, [courseId]);

  const startLearningTimer = () => {
    learningTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
      setTodayLearningTime(elapsed);
    }, 60000); // Update every minute
  };

  const fetchCourseAndEnrollment = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching course and enrollment data for courseId:', courseId);

      // Fetch course data
      const courseResponse = await api.get(`/courses/public/${courseId}`);
      console.log('📚 Course data received:', courseResponse.data);

      if (courseResponse.data.success) {
        setCourse(courseResponse.data.data);

        if (courseResponse.data.data.sections && courseResponse.data.data.sections.length > 0) {
          const firstSection = courseResponse.data.data.sections[0];
          if (firstSection.lectures && firstSection.lectures.length > 0) {
            const firstLecture = {
              ...firstSection.lectures[0],
              sectionTitle: firstSection.title
            };
            console.log('🎬 Setting first lecture:', firstLecture);
            setCurrentLecture(firstLecture);
          }
        }

        const expanded = {};
        courseResponse.data.data.sections.forEach((section, index) => {
          expanded[index] = true;
        });
        setExpandedSections(expanded);
      }

      // Fetch enrollment data
      try {
        const enrollmentResponse = await api.get('/enrollments');
        console.log('📝 Enrollment data received:', enrollmentResponse.data);

        if (enrollmentResponse.data.success && enrollmentResponse.data.data.enrollments) {
          const courseEnrollment = enrollmentResponse.data.data.enrollments.find(
            e => e.course._id === courseId || e.course === courseId
          );
          
          if (courseEnrollment) {
            console.log('✅ Found enrollment for course:', courseEnrollment);
            setEnrollment(courseEnrollment);
            if (courseEnrollment.completedLectures) {
              setCompletedLectures(new Set(courseEnrollment.completedLectures));
            }
          } else {
            console.warn('⚠️ No enrollment found for this course');
          }
        }
      } catch (enrollmentError) {
        console.warn('⚠️ Could not fetch enrollment data (user may not be enrolled):', enrollmentError);
      }

    } catch (error) {
      console.error('❌ Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markLectureComplete = async (lectureId) => {
    if (!enrollment) return;

    try {
      const response = await fetch(`/api/enrollments/${enrollment._id}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ lectureId, completed: true })
      });

      if (response.ok) {
        setCompletedLectures(prev => new Set([...prev, lectureId]));
        
        // Show celebration animation
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);

        // Check for achievements
        const newCompletedCount = completedLectures.size + 1;
        if (newCompletedCount === 1) {
          showAchievementNotification('🎯 First Step!', 'Completed your first lecture!');
        } else if (newCompletedCount === 10) {
          showAchievementNotification('🔥 On Fire!', 'Completed 10 lectures!');
        } else if (newCompletedCount === course?.totalLectures) {
          showAchievementNotification('🏆 Course Master!', 'Completed all lectures!');
        }
      }
    } catch (error) {
      console.error('Error marking lecture complete:', error);
    }
  };

  const showAchievementNotification = (title, message) => {
    setShowAchievement({ title, message });
    setTimeout(() => setShowAchievement(null), 5000);
  };

  const toggleBookmark = (lectureId) => {
    setBookmarkedLectures(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lectureId)) {
        newSet.delete(lectureId);
      } else {
        newSet.add(lectureId);
      }
      return newSet;
    });
  };

  const selectLecture = (lecture, sectionTitle) => {
    setCurrentLecture({ ...lecture, sectionTitle });
    // Save last watched position
    localStorage.setItem(`lastLecture_${courseId}`, lecture._id);
  };

  const toggleSection = (index) => {
    setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const getNextLecture = () => {
    if (!course || !currentLecture) return null;
    let foundCurrent = false;
    for (const section of course.sections) {
      for (const lecture of section.lectures) {
        if (foundCurrent) return { ...lecture, sectionTitle: section.title };
        if (lecture._id === currentLecture._id) foundCurrent = true;
      }
    }
    return null;
  };

  const goToNextLecture = () => {
    const nextLecture = getNextLecture();
    if (nextLecture) {
      setCurrentLecture(nextLecture);
      if (currentLecture) markLectureComplete(currentLecture._id);
    }
  };

  const addNote = () => {
    if (currentNote.trim()) {
      const newNote = {
        id: Date.now(),
        lectureId: currentLecture._id,
        lectureTitle: currentLecture.title,
        content: currentNote,
        timestamp: new Date().toISOString()
      };
      setNotes(prev => [newNote, ...prev]);
      setCurrentNote('');
    }
  };

  const deleteNote = (noteId) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const getProgressPercentage = () => {
    if (!course?.totalLectures) return 0;
    return Math.round((completedLectures.size / course.totalLectures) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-bg-primary">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-bg-primary">
        <div className="text-center">
          <h2 className="text-2xl font-bold theme-text-primary mb-4">Course not found</h2>
          <button onClick={() => navigate('/courses')} className="theme-button-primary">
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg-primary">
      {/* Achievement Notification */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 20, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white px-8 py-4 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-3">
                <TrophyIcon className="h-8 w-8 animate-bounce" />
                <div>
                  <p className="font-bold text-lg">{showAchievement.title}</p>
                  <p className="text-sm opacity-90">{showAchievement.message}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Confetti Effect */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: window.innerWidth / 2, 
                  y: window.innerHeight / 2,
                  scale: 0 
                }}
                animate={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  scale: [0, 1.5, 0],
                  rotate: Math.random() * 360
                }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute w-4 h-4 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Header with Stats */}
      <div className="theme-bg-card border-b theme-border-primary sticky top-0 z-30">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-lg hover:theme-bg-secondary transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 theme-text-primary" />
              </button>
              <div className="flex-1">
                <h1 className="text-lg font-bold theme-text-primary truncate">{course.title}</h1>
                <div className="flex items-center gap-4 mt-1">
                  {/* Progress Bar */}
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgressPercentage()}%` }}
                        className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                      />
                    </div>
                    <span className="text-sm font-semibold theme-text-secondary">
                      {getProgressPercentage()}%
                    </span>
                  </div>
                  
                  {/* Learning Streak */}
                  <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                    <FireSolid className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                      {learningStreak} day streak
                    </span>
                  </div>

                  {/* Today's Learning Time */}
                  <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <ClockIcon className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {todayLearningTime} min today
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <ShareIcon className="h-5 w-5 theme-text-tertiary" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <ChartBarIcon className="h-5 w-5 theme-text-tertiary" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-100px)]">
        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'mr-12' : 'mr-0'}`}>
          {/* Video Player */}
          <div className="flex-1 bg-black relative group">
            {currentLecture?.videoData?.videoId ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <div className="w-full max-w-6xl aspect-video">
                  <YouTubeVideoPlayer
                    videoId={currentLecture.videoData.videoId}
                    title={currentLecture.title}
                    height="100%"
                    autoplay={true}
                    allowFullscreen={true}
                    className="w-full h-full"
                    courseId={courseId}
                    isPaid={course?.isPaid || false}
                    enableSecurity={true}
                  />
                </div>
                
                {/* Floating Quick Actions on Video */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleBookmark(currentLecture._id)}
                    className={`p-3 rounded-full shadow-lg backdrop-blur-sm ${
                      bookmarkedLectures.has(currentLecture._id)
                        ? 'bg-yellow-500 text-white'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {bookmarkedLectures.has(currentLecture._id) ? (
                      <BookmarkSolid className="h-5 w-5" />
                    ) : (
                      <BookmarkIcon className="h-5 w-5" />
                    )}
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="text-center text-white p-8">
                <DocumentTextIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No video available for this lecture</p>
              </div>
            )}
          </div>

          {/* Enhanced Lecture Info & Interactive Controls */}
          <div className="theme-bg-card border-t theme-border-primary">
            <div className="p-6">
              {/* Lecture Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {currentLecture && (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full">
                          {currentLecture.sectionTitle}
                        </span>
                        {completedLectures.has(currentLecture._id) && (
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full flex items-center gap-1">
                            <CheckCircleSolid className="h-3 w-3" />
                            Completed
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold theme-text-primary mb-2">
                        {currentLecture.title}
                      </h2>
                      {currentLecture.description && (
                        <p className="theme-text-secondary">{currentLecture.description}</p>
                      )}
                    </>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 ml-4">
                  {currentLecture && !completedLectures.has(currentLecture._id) && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => markLectureComplete(currentLecture._id)}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold shadow-lg flex items-center gap-2"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      Mark Complete
                    </motion.button>
                  )}
                  {getNextLecture() && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={goToNextLecture}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg flex items-center gap-2"
                    >
                      Next Lecture
                      <ArrowPathIcon className="h-5 w-5" />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Interactive Tabs */}
              <div className="border-t theme-border-primary pt-4">
                <div className="flex gap-2 mb-4">
                  {[
                    { id: 'notes', label: 'Notes', icon: DocumentTextIcon },
                    { id: 'discussion', label: 'Discussion', icon: ChatBubbleLeftIcon },
                    { id: 'resources', label: 'Resources', icon: AcademicCapIcon },
                    { id: 'quiz', label: 'Quiz', icon: QuestionMarkCircleIcon },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        activeTab === tab.id
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'theme-bg-secondary theme-text-tertiary hover:theme-bg-card'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[200px]">
                  {activeTab === 'notes' && (
                    <div className="space-y-4">
                      {/* Add Note */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={currentNote}
                          onChange={(e) => setCurrentNote(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addNote()}
                          placeholder="Add a note for this lecture..."
                          className="flex-1 px-4 py-3 theme-bg-secondary border theme-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 theme-text-primary"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={addNote}
                          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold"
                        >
                          Add Note
                        </motion.button>
                      </div>

                      {/* Notes List */}
                      <div className="space-y-2">
                        {notes.filter(note => note.lectureId === currentLecture?._id).map(note => (
                          <motion.div
                            key={note.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 theme-bg-secondary rounded-lg border theme-border-primary"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="theme-text-primary mb-1">{note.content}</p>
                                <p className="text-xs theme-text-tertiary">
                                  {new Date(note.timestamp).toLocaleString()}
                                </p>
                              </div>
                              <button
                                onClick={() => deleteNote(note.id)}
                                className="text-red-500 hover:text-red-600 ml-2"
                              >
                                ✕
                              </button>
                            </div>
                          </motion.div>
                        ))}
                        {notes.filter(note => note.lectureId === currentLecture?._id).length === 0 && (
                          <div className="text-center py-8 theme-text-tertiary">
                            <LightBulbIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No notes yet. Start taking notes!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'discussion' && (
                    <div className="text-center py-12 theme-text-tertiary">
                      <ChatBubbleLeftIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Discussion Coming Soon</p>
                      <p className="text-sm">Connect with other learners and instructors</p>
                    </div>
                  )}

                  {activeTab === 'resources' && (
                    <div className="space-y-2">
                      {currentLecture?.resources?.length > 0 ? (
                        currentLecture.resources.map((resource, idx) => (
                          <div key={idx} className="p-4 theme-bg-secondary rounded-lg border theme-border-primary flex items-center justify-between">
                            <div>
                              <p className="font-medium theme-text-primary">{resource.title}</p>
                              <p className="text-sm theme-text-tertiary">{resource.type}</p>
                            </div>
                            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold">
                              Download
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 theme-text-tertiary">
                          <AcademicCapIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p>No resources available for this lecture</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'quiz' && (
                    <div className="text-center py-12 theme-text-tertiary">
                      <QuestionMarkCircleIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Quiz Coming Soon</p>
                      <p className="text-sm">Test your knowledge with interactive quizzes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Sidebar - Course Content */}
        <motion.div
          animate={{ width: sidebarCollapsed ? 48 : 384 }}
          className="theme-bg-card border-l theme-border-primary overflow-hidden flex flex-col"
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b theme-border-primary flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h3 className="font-bold theme-text-primary">Course Content</h3>
                <p className="text-sm theme-text-tertiary mt-1">
                  {completedLectures.size} of {course.totalLectures || 0} completed
                </p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:theme-bg-secondary transition-colors"
            >
              <ChevronDownIcon 
                className={`h-5 w-5 theme-text-tertiary transform transition-transform ${
                  sidebarCollapsed ? 'rotate-90' : '-rotate-90'
                }`} 
              />
            </button>
          </div>

          {/* Sidebar Content */}
          {!sidebarCollapsed && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="divide-y theme-divide-primary">
                {course.sections?.map((section, sectionIndex) => (
                  <div key={section._id || sectionIndex}>
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(sectionIndex)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:theme-bg-secondary transition-colors"
                    >
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold theme-text-primary">{section.title}</h4>
                        <p className="text-sm theme-text-tertiary mt-1">
                          {section.lectures?.filter(l => completedLectures.has(l._id)).length}/{section.lectures?.length || 0} completed
                        </p>
                      </div>
                      {expandedSections[sectionIndex] ? (
                        <ChevronUpIcon className="h-5 w-5 theme-text-tertiary flex-shrink-0" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 theme-text-tertiary flex-shrink-0" />
                      )}
                    </button>

                    {/* Lectures List */}
                    <AnimatePresence>
                      {expandedSections[sectionIndex] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="theme-bg-primary"
                        >
                          {section.lectures?.map((lecture, lectureIndex) => {
                            const isCompleted = completedLectures.has(lecture._id);
                            const isCurrent = currentLecture?._id === lecture._id;
                            const isBookmarked = bookmarkedLectures.has(lecture._id);

                            return (
                              <motion.button
                                key={lecture._id || lectureIndex}
                                whileHover={{ x: 4 }}
                                onClick={() => selectLecture(lecture, section.title)}
                                className={`w-full px-6 py-3 flex items-center gap-3 hover:theme-bg-card transition-all ${
                                  isCurrent ? 'theme-bg-card border-l-4 border-blue-500 shadow-lg' : ''
                                }`}
                              >
                                <div className="flex-shrink-0">
                                  {isCompleted ? (
                                    <CheckCircleSolid className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <div className="h-5 w-5 rounded-full border-2 theme-border-primary" />
                                  )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className={`text-sm font-medium truncate ${
                                      isCurrent ? 'text-blue-500' : 'theme-text-primary'
                                    }`}>
                                      {lecture.title}
                                    </p>
                                    {isBookmarked && (
                                      <BookmarkSolid className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                                    )}
                                  </div>
                                  {lecture.duration && (
                                    <p className="text-xs theme-text-tertiary mt-1">
                                      {lecture.duration} min
                                    </p>
                                  )}
                                </div>
                                {lecture.videoData?.videoId && (
                                  <PlayIcon className={`h-4 w-4 flex-shrink-0 ${
                                    isCurrent ? 'text-blue-500' : 'theme-text-tertiary'
                                  }`} />
                                )}
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDarkMode ? '#1f2937' : '#f3f4f6'};
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? '#4b5563' : '#d1d5db'};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? '#6b7280' : '#9ca3af'};
        }
      `}</style>
    </div>
  );
};

export default InteractiveCoursePlayer;
