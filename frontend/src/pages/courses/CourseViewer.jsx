import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  PlayIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import YouTubeVideoPlayer from '../../components/common/YouTubeVideoPlayer';
import api from '../../services/api';

const CourseViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user, isAuthenticated } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentLecture, setCurrentLecture] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [completedLectures, setCompletedLectures] = useState(new Set());

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching course data for courseId:', courseId);
      
      const response = await api.get(`/courses/public/${courseId}`);
      console.log('📚 Course data received:', response.data);

      if (response.data.success) {
        setCourse(response.data.data);
        
        // Load completed lectures from localStorage or API
        const completed = localStorage.getItem(`completed_${courseId}`);
        if (completed) {
          setCompletedLectures(new Set(JSON.parse(completed)));
        }
      } else {
        setError('Course not found or access denied');
      }
    } catch (error) {
      console.error('❌ Error fetching course data:', error);
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const markLectureCompleted = (sectionIndex, lectureIndex) => {
    const lectureId = `${sectionIndex}-${lectureIndex}`;
    const newCompleted = new Set(completedLectures);
    newCompleted.add(lectureId);
    setCompletedLectures(newCompleted);
    
    // Save to localStorage
    // ✅ SAFE: Validate Set before spreading
    const safeCompleted = newCompleted instanceof Set ? newCompleted : new Set();
    localStorage.setItem(`completed_${courseId}`, JSON.stringify([...safeCompleted]));
  };

  const isLectureCompleted = (sectionIndex, lectureIndex) => {
    return completedLectures.has(`${sectionIndex}-${lectureIndex}`);
  };

  const goToNextLecture = () => {
    if (!course) return;
    
    const currentSectionData = course.sections[currentSection];
    if (currentLecture < currentSectionData.lectures.length - 1) {
      setCurrentLecture(currentLecture + 1);
    } else if (currentSection < course.sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentLecture(0);
    }
  };

  const goToPreviousLecture = () => {
    if (currentLecture > 0) {
      setCurrentLecture(currentLecture - 1);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setCurrentLecture(course.sections[currentSection - 1].lectures.length - 1);
    }
  };

  const selectLecture = (sectionIndex, lectureIndex) => {
    setCurrentSection(sectionIndex);
    setCurrentLecture(lectureIndex);
  };

  const calculateProgress = () => {
    if (!course) return 0;
    
    let totalLectures = 0;
    course.sections.forEach(section => {
      totalLectures += section.lectures.length;
    });
    
    return totalLectures > 0 ? (completedLectures.size / totalLectures) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="theme-page flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 theme-border-accent mx-auto mb-4"></div>
          <p className="theme-text-secondary">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="theme-page">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="theme-text-accent mb-4">
              <AcademicCapIcon className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold theme-text-primary mb-2">Course Not Available</h2>
            <p className="theme-text-secondary mb-4">{error}</p>
            <button
              onClick={() => navigate('/courses')}
              className="theme-button-primary px-6 py-3 text-white rounded-lg"
            >
              Browse Courses
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return null;
  }

  const currentSectionData = course.sections[currentSection];
  const currentLectureData = currentSectionData?.lectures[currentLecture];

  return (
    <div className="theme-page min-h-screen">
      <Header />
      
      <div className="flex h-screen pt-16"> {/* Account for header height */}
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-80 theme-bg-card border-r theme-border-primary overflow-y-auto">
            <div className="p-4 border-b theme-border-primary">
              <h2 className="font-bold theme-text-primary text-lg truncate">{course.title}</h2>
              <div className="flex items-center mt-2">
                <div className="flex-1 theme-bg-secondary rounded-full h-2">
                  <div 
                    className="theme-bg-accent h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm theme-text-tertiary">
                  {Math.round(calculateProgress())}%
                </span>
              </div>
            </div>

            <div className="p-4">
              {course.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-4">
                  <h3 className="font-semibold theme-text-primary mb-2 text-sm">
                    Section {sectionIndex + 1}: {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.lectures.map((lecture, lectureIndex) => (
                      <button
                        key={lectureIndex}
                        onClick={() => selectLecture(sectionIndex, lectureIndex)}
                        className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                          currentSection === sectionIndex && currentLecture === lectureIndex
                            ? 'theme-bg-accent text-white'
                            : 'theme-bg-secondary hover:theme-bg-tertiary theme-text-secondary'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            {isLectureCompleted(sectionIndex, lectureIndex) ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            ) : lecture.type === 'video' ? (
                              <PlayIcon className="h-5 w-5" />
                            ) : (
                              <DocumentTextIcon className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-medium">{lecture.title}</p>
                            {lecture.duration && (
                              <p className="text-xs opacity-75 flex items-center mt-1">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                {lecture.duration} min
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Video/Content Area */}
          <div className="flex-1 theme-bg-primary">
            {currentLectureData ? (
              <div className="h-full flex flex-col">
                {/* Video Player */}
                {currentLectureData.type === 'video' && currentLectureData.videoData?.videoId && (
                  <div className="bg-black flex-1 flex items-center justify-center p-4">
                    <div className="w-full max-w-6xl aspect-video">
                      <YouTubeVideoPlayer
                        videoId={currentLectureData.videoData.videoId}
                        title={currentLectureData.title}
                        height="100%"
                        className="w-full h-full"
                        onEnded={() => markLectureCompleted(currentSection, currentLecture)}
                        courseId={courseId}
                        isPaid={course?.isPaid || false}
                        enableSecurity={true}
                      />
                    </div>
                  </div>
                )}

                {/* Lecture Info */}
                <div className="p-6 theme-bg-card border-t theme-border-primary">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold theme-text-primary">
                        {currentLectureData.title}
                      </h1>
                      <p className="theme-text-secondary mt-1">
                        Section {currentSection + 1}, Lecture {currentLecture + 1}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={goToPreviousLecture}
                        disabled={currentSection === 0 && currentLecture === 0}
                        className="theme-button-secondary px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => markLectureCompleted(currentSection, currentLecture)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          isLectureCompleted(currentSection, currentLecture)
                            ? 'bg-green-500 text-white'
                            : 'theme-button-primary text-white'
                        }`}
                      >
                        {isLectureCompleted(currentSection, currentLecture) ? (
                          <CheckCircleIcon className="h-5 w-5" />
                        ) : (
                          'Mark Complete'
                        )}
                      </button>
                      <button
                        onClick={goToNextLecture}
                        disabled={
                          currentSection === course.sections.length - 1 &&
                          currentLecture === currentSectionData.lectures.length - 1
                        }
                        className="theme-button-secondary px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {currentLectureData.description && (
                    <div className="prose max-w-none theme-text-secondary">
                      <p>{currentLectureData.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center theme-text-tertiary">
                  <BookOpenIcon className="h-16 w-16 mx-auto mb-4" />
                  <p>Select a lecture to start learning</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed left-4 bottom-4 theme-button-primary p-3 rounded-full shadow-lg z-50"
      >
        <ListBulletIcon className="h-6 w-6 text-white" />
      </button>
    </div>
  );
};

export default CourseViewer;