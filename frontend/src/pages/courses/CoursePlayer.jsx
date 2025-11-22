/**
 * Course Player - Main Learning Page
 * Features: Video player, curriculum sidebar, progress tracking, notes, bookmarks
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YouTubeVideoPlayer from '../../components/common/YouTubeVideoPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import enrollmentService from '../../services/enrollmentService';
import {
  PlayIcon,
  PauseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  BookmarkIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ClockIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolid,
  BookmarkIcon as BookmarkSolid
} from '@heroicons/react/24/solid';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const toast = useToast();

  // State
  const [enrollment, setEnrollment] = useState(null);
  const [course, setCourse] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, notes, resources
  const [completedLectures, setCompletedLectures] = useState(new Set());
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Refs
  const playerRef = useRef(null);
  const progressSaveIntervalRef = useRef(null);
  const watchTimeRef = useRef(0);

  // Load enrollment data
  useEffect(() => {
    if (!user) {
      toast.error('Please login to access this course');
      navigate('/login');
      return;
    }

    fetchEnrollmentData();

    return () => {
      // Cleanup: Save progress before unmount
      if (progressSaveIntervalRef.current) {
        clearInterval(progressSaveIntervalRef.current);
        saveProgress();
      }
    };
  }, [courseId, user]);

  // Fetch enrollment and course data
  const fetchEnrollmentData = async () => {
    try {
      setLoading(true);
      
      // Check if enrolled
      const enrollData = await enrollmentService.getEnrollmentByCourse(courseId);
      
      if (!enrollData.enrolled || !enrollData.enrollment) {
        toast.error('You are not enrolled in this course');
        navigate(`/courses/${courseId}`);
        return;
      }

      // Get detailed enrollment data
      const detailedEnrollment = await enrollmentService.getEnrollment(enrollData.enrollment._id);
      
      if (detailedEnrollment.success && detailedEnrollment.data?.enrollment) {
        const enrollmentData = detailedEnrollment.data.enrollment;
        setEnrollment(enrollmentData);
        
        // Safely access course data
        const courseData = enrollmentData.course;
        if (!courseData) {
          throw new Error('Course data not found in enrollment');
        }
        
        setCourse(courseData);
        setNotes(enrollmentData.notes || []);
        
        // Set completed lectures - handle both direct array and progress.completedLectures
        const completedLectures = enrollmentData.completedLectures || enrollmentData.progress?.completedLectures || [];
        const completed = new Set(
          completedLectures.map(cl => {
            // Handle different data structures
            if (typeof cl === 'string') return cl; // Simple lecture ID
            if (cl.lecture) return typeof cl.lecture === 'object' ? cl.lecture._id : cl.lecture;
            if (cl._id) return cl._id; // Direct lecture object
            return cl; // Fallback
          })
        );
        setCompletedLectures(completed);
        
        // Find and set current lecture (last accessed or first lecture)
        let targetLecture = null;
        let targetSection = null;

        // Get last accessed lecture from different possible locations
        const lastAccessedLecture = enrollmentData.lastAccessedLecture || 
                                   enrollmentData.progress?.lastAccessedLecture;

        if (lastAccessedLecture && courseData.sections) {
          // Resume from last position
          for (const section of courseData.sections) {
            if (!section.lectures) continue;
            const lecture = section.lectures.find(l => 
              l._id === lastAccessedLecture
            );
            if (lecture) {
              targetLecture = lecture;
              targetSection = section;
              break;
            }
          }
        }

        // Fallback to first lecture if no last accessed
        if (!targetLecture && courseData.sections?.length > 0) {
          const firstSection = courseData.sections[0];
          if (firstSection.lectures && firstSection.lectures.length > 0) {
            targetSection = firstSection;
            targetLecture = firstSection.lectures[0];
          }
        }

        if (targetLecture && targetSection) {
          setCurrentLecture(targetLecture);
          setCurrentSection(targetSection);
        } else {
          throw new Error('No lectures found in course');
        }
      } else {
        throw new Error('Failed to get enrollment details');
      }

    } catch (error) {
      console.error('Error fetching enrollment:', error);
      toast.error(`Failed to load course data: ${error.message}`);
      
      // Navigate back to course page on error
      setTimeout(() => {
        navigate(`/courses/${courseId}`);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (enrollment && currentLecture && playing) {
      progressSaveIntervalRef.current = setInterval(() => {
        saveProgress();
      }, 30000); // 30 seconds

      return () => {
        if (progressSaveIntervalRef.current) {
          clearInterval(progressSaveIntervalRef.current);
        }
      };
    }
  }, [enrollment, currentLecture, playing]);

  // Save progress to backend
  const saveProgress = async () => {
    if (!enrollment || !currentLecture || watchTimeRef.current === 0) return;

    try {
      await enrollmentService.updateProgress(
        enrollment._id,
        currentLecture._id,
        watchTimeRef.current,
        completedLectures.has(currentLecture._id)
      );
      console.log('Progress saved:', watchTimeRef.current, 'seconds');
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Handle video progress
  const handleProgress = (state) => {
    setPlayedSeconds(state.playedSeconds);
    watchTimeRef.current = Math.floor(state.playedSeconds);
  };

  // Handle video ready
  const handleReady = () => {
    // Resume from saved position if available
    // TODO: Implement seeking to saved timestamp
  };

  // Mark lecture as complete
  const handleCompleteLecture = async () => {
    if (!enrollment || !currentLecture) return;

    try {
      await enrollmentService.completeLecture(enrollment._id, currentLecture._id);
      
      setCompletedLectures(prev => new Set([...prev, currentLecture._id]));
      toast.success('Lecture marked as complete!');
      
      // Auto-navigate to next lecture
      const nextLecture = getNextLecture();
      if (nextLecture) {
        setTimeout(() => {
          handleLectureSelect(nextLecture.lecture, nextLecture.section);
        }, 1000);
      } else {
        // Course completed
        toast.success('🎉 Congratulations! You completed the course!');
        // TODO: Show certificate modal
      }

      // Refresh enrollment to get updated progress
      fetchEnrollmentData();

    } catch (error) {
      console.error('Error completing lecture:', error);
      toast.error('Failed to mark lecture as complete');
    }
  };

  // Get next lecture
  const getNextLecture = () => {
    if (!course || !currentLecture || !currentSection) return null;

    const sectionIndex = course.sections.findIndex(s => s._id === currentSection._id);
    const lectureIndex = currentSection.lectures.findIndex(l => l._id === currentLecture._id);

    // Next lecture in same section
    if (lectureIndex < currentSection.lectures.length - 1) {
      return {
        lecture: currentSection.lectures[lectureIndex + 1],
        section: currentSection
      };
    }

    // First lecture of next section
    if (sectionIndex < course.sections.length - 1) {
      const nextSection = course.sections[sectionIndex + 1];
      return {
        lecture: nextSection.lectures[0],
        section: nextSection
      };
    }

    return null; // No more lectures
  };

  // Get previous lecture
  const getPreviousLecture = () => {
    if (!course || !currentLecture || !currentSection) return null;

    const sectionIndex = course.sections.findIndex(s => s._id === currentSection._id);
    const lectureIndex = currentSection.lectures.findIndex(l => l._id === currentLecture._id);

    // Previous lecture in same section
    if (lectureIndex > 0) {
      return {
        lecture: currentSection.lectures[lectureIndex - 1],
        section: currentSection
      };
    }

    // Last lecture of previous section
    if (sectionIndex > 0) {
      const prevSection = course.sections[sectionIndex - 1];
      return {
        lecture: prevSection.lectures[prevSection.lectures.length - 1],
        section: prevSection
      };
    }

    return null; // No previous lectures
  };

  // Navigate to next lecture
  const goToNextLecture = () => {
    const next = getNextLecture();
    if (next) {
      handleLectureSelect(next.lecture, next.section);
    } else {
      toast.info('You are at the last lecture');
    }
  };

  // Navigate to previous lecture
  const goToPreviousLecture = () => {
    const prev = getPreviousLecture();
    if (prev) {
      handleLectureSelect(prev.lecture, prev.section);
    } else {
      toast.info('You are at the first lecture');
    }
  };

  // Handle lecture selection
  const handleLectureSelect = (lecture, section) => {
    // Save current progress before switching
    if (currentLecture && enrollment) {
      saveProgress();
    }

    setCurrentLecture(lecture);
    setCurrentSection(section);
    setPlaying(false);
    watchTimeRef.current = 0;
    setPlayedSeconds(0);

    // Update last accessed lecture in backend
    if (enrollment) {
      enrollmentService.updateProgress(enrollment._id, lecture._id, 0, false)
        .catch(err => console.error('Error updating last accessed:', err));
    }
  };

  // Add note
  const handleAddNote = async () => {
    if (!newNote.trim() || !enrollment || !currentLecture) return;

    try {
      setAddingNote(true);
      const result = await enrollmentService.addNote(
        enrollment._id,
        currentLecture._id,
        newNote.trim()
      );
      
      if (result.success) {
        setNotes(result.notes || []);
        setNewNote('');
        toast.success('Note added successfully');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId) => {
    if (!enrollment) return;

    try {
      await enrollmentService.deleteNote(enrollment._id, noteId);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      toast.success('Note deleted');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-slate-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
            Loading course...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (!enrollment || !course || !currentLecture) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-slate-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <p className={`text-xl mb-4 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
            Could not load course content
          </p>
          <button
            onClick={() => navigate('/my-learning')}
            className="btn-primary"
          >
            Back to My Learning
          </button>
        </div>
      </div>
    );
  }

  // Calculate progress percentage
  const progress = enrollment.progress || 0;
  const completedCount = completedLectures.size;
  const totalLectures = course.totalLectures || 0;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Top Progress Bar */}
      <div className={`sticky top-0 z-40 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-md`}>
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/my-learning')}
              className={`p-2 rounded-lg hover:bg-opacity-10 ${
                isDarkMode ? 'hover:bg-white' : 'hover:bg-black'
              }`}
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <h1 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {course.title}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              {completedCount} / {totalLectures} lectures completed ({Math.round(progress)}%)
            </span>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-opacity-10"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Curriculum */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className={`w-80 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border-r ${
                isDarkMode ? 'border-slate-700' : 'border-gray-200'
              } overflow-y-auto h-[calc(100vh-65px)] sticky top-[65px]`}
            >
              <div className="p-4">
                <h2 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Course Content
                </h2>
                
                <div className="space-y-2">
                  {course.sections?.map((section, sectionIdx) => (
                    <div key={section._id}>
                      <div className={`p-3 rounded-lg ${
                        isDarkMode ? 'bg-slate-700' : 'bg-gray-100'
                      }`}>
                        <h3 className={`font-medium text-sm ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          Section {sectionIdx + 1}: {section.title}
                        </h3>
                      </div>
                      
                      <div className="mt-1 space-y-1">
                        {section.lectures?.map((lecture, lectureIdx) => {
                          const isCompleted = completedLectures.has(lecture._id);
                          const isCurrent = currentLecture?._id === lecture._id;
                          
                          return (
                            <button
                              key={lecture._id}
                              onClick={() => handleLectureSelect(lecture, section)}
                              className={`w-full text-left p-3 rounded-lg transition-all ${
                                isCurrent
                                  ? isDarkMode
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-purple-100 text-purple-900'
                                  : isDarkMode
                                  ? 'hover:bg-slate-700 text-slate-300'
                                  : 'hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isCompleted ? (
                                  <CheckCircleSolid className="h-5 w-5 text-green-500 flex-shrink-0" />
                                ) : (
                                  <div className={`h-5 w-5 rounded-full border-2 flex-shrink-0 ${
                                    isCurrent ? 'border-white' : 'border-gray-400'
                                  }`} />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {lectureIdx + 1}. {lecture.title}
                                  </p>
                                  {lecture.duration && (
                                    <p className="text-xs opacity-70">
                                      {Math.floor(lecture.duration / 60)}:{(lecture.duration % 60).toString().padStart(2, '0')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content - Video Player */}
        <div className="flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            {/* Video Player */}
            <div className="bg-black rounded-xl overflow-hidden mb-6 p-4">
              <div className="aspect-video max-w-6xl mx-auto">
                {currentLecture.videoData?.videoId ? (
                  <YouTubeVideoPlayer
                    videoId={currentLecture.videoData.videoId}
                    title={currentLecture.title}
                    height="100%"
                    autoplay={playing}
                    allowFullscreen={true}
                    className="w-full h-full"
                    courseId={enrollment?.courseId}
                    isPaid={enrollment?.course?.isPaid || false}
                    enableSecurity={true}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-white">
                    <p>No video available for this lecture</p>
                  </div>
                )}
              </div>
            </div>

            {/* Lecture Info and Controls */}
            <div className={`rounded-xl p-6 mb-6 ${
              isDarkMode ? 'bg-slate-800' : 'bg-white'
            } shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentLecture.title}
                </h2>
                {!completedLectures.has(currentLecture._id) && (
                  <button
                    onClick={handleCompleteLecture}
                    className="btn-primary flex items-center gap-2"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    Mark as Complete
                  </button>
                )}
              </div>

              {currentLecture.description && (
                <p className={`mb-4 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  {currentLecture.description}
                </p>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={goToPreviousLecture}
                  disabled={!getPreviousLecture()}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                  Previous Lecture
                </button>
                <button
                  onClick={goToNextLecture}
                  disabled={!getNextLecture()}
                  className="btn-primary flex items-center gap-2"
                >
                  Next Lecture
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Tabs: Overview, Notes, Resources */}
            <div className={`rounded-xl overflow-hidden ${
              isDarkMode ? 'bg-slate-800' : 'bg-white'
            } shadow-lg`}>
              {/* Tab Headers */}
              <div className={`flex border-b ${
                isDarkMode ? 'border-slate-700' : 'border-gray-200'
              }`}>
                {['overview', 'notes', 'resources'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? isDarkMode
                          ? 'text-purple-400 border-b-2 border-purple-400'
                          : 'text-purple-600 border-b-2 border-purple-600'
                        : isDarkMode
                        ? 'text-slate-400 hover:text-slate-300'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-3 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      About this lecture
                    </h3>
                    <p className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                      {currentLecture.description || 'No description available.'}
                    </p>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Your Notes
                    </h3>
                    
                    {/* Add Note */}
                    <div className="mb-6">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note..."
                        className={`w-full p-3 rounded-lg border ${
                          isDarkMode
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } resize-none`}
                        rows="3"
                      />
                      <button
                        onClick={handleAddNote}
                        disabled={!newNote.trim() || addingNote}
                        className="mt-2 btn-primary"
                      >
                        {addingNote ? 'Adding...' : 'Add Note'}
                      </button>
                    </div>

                    {/* Notes List */}
                    <div className="space-y-3">
                      {notes.length === 0 ? (
                        <p className={`text-center py-8 ${
                          isDarkMode ? 'text-slate-400' : 'text-gray-500'
                        }`}>
                          No notes yet. Add your first note above!
                        </p>
                      ) : (
                        notes.map(note => (
                          <div
                            key={note._id}
                            className={`p-4 rounded-lg ${
                              isDarkMode ? 'bg-slate-700' : 'bg-gray-50'
                            }`}
                          >
                            <p className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                              {note.content}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className={`text-xs ${
                                isDarkMode ? 'text-slate-500' : 'text-gray-500'
                              }`}>
                                {new Date(note.createdAt).toLocaleDateString()}
                              </span>
                              <button
                                onClick={() => handleDeleteNote(note._id)}
                                className="text-xs text-red-500 hover:text-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Lecture Resources
                    </h3>
                    
                    {currentLecture.resources && currentLecture.resources.length > 0 ? (
                      <div className="space-y-2">
                        {currentLecture.resources.map((resource, idx) => (
                          <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-3 p-3 rounded-lg hover:bg-opacity-50 transition-colors ${
                              isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                            }`}
                          >
                            <DocumentTextIcon className="h-5 w-5 text-purple-500" />
                            <span className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                              {resource.title}
                            </span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-center py-8 ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}>
                        No resources available for this lecture.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
