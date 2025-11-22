import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlayIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowLeftIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import YouTubeVideoPlayer from '../../components/common/YouTubeVideoPlayer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CourseLearning = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [completedLectures, setCompletedLectures] = useState(new Set());

  useEffect(() => {
    fetchCourseAndEnrollment();
  }, [courseId]);

  const fetchCourseAndEnrollment = async () => {
    try {
      setLoading(true);

      // Fetch course details
      const courseResponse = await fetch(`/api/courses/public/${courseId}`, {
        credentials: 'include'
      });
      const courseData = await courseResponse.json();

      if (courseResponse.ok && courseData.success) {
        setCourse(courseData.data);

        // Find first lecture to play
        if (courseData.data.sections && courseData.data.sections.length > 0) {
          const firstSection = courseData.data.sections[0];
          if (firstSection.lectures && firstSection.lectures.length > 0) {
            setCurrentLecture({
              ...firstSection.lectures[0],
              sectionTitle: firstSection.title
            });
          }
        }

        // Expand all sections by default
        const expanded = {};
        courseData.data.sections.forEach((section, index) => {
          expanded[index] = true;
        });
        setExpandedSections(expanded);
      }

      // Fetch enrollment to check progress
      const enrollmentResponse = await fetch('/api/enrollments', {
        credentials: 'include'
      });
      const enrollmentData = await enrollmentResponse.json();

      if (enrollmentResponse.ok && enrollmentData.success) {
        const courseEnrollment = enrollmentData.enrollments.find(
          e => e.course._id === courseId || e.course === courseId
        );
        
        if (courseEnrollment) {
          setEnrollment(courseEnrollment);
          // Set completed lectures
          if (courseEnrollment.completedLectures) {
            setCompletedLectures(new Set(courseEnrollment.completedLectures));
          }
        }
      }

    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const markLectureComplete = async (lectureId) => {
    if (!enrollment) return;

    try {
      const response = await fetch(`/api/enrollments/${enrollment._id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          lectureId,
          completed: true
        })
      });

      if (response.ok) {
        setCompletedLectures(prev => {
          // ✅ SAFE: Validate Set before spreading
          const safePrev = prev instanceof Set ? prev : new Set();
          return new Set([...safePrev, lectureId]);
        });
      }
    } catch (error) {
      console.error('Error marking lecture complete:', error);
    }
  };

  const selectLecture = (lecture, sectionTitle) => {
    // ✅ SAFE: Validate lecture before spreading
    const safeLecture = lecture && typeof lecture === 'object' ? lecture : {};
    setCurrentLecture({
      ...safeLecture,
      sectionTitle
    });
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

  const getNextLecture = () => {
    if (!course || !currentLecture) return null;

    let foundCurrent = false;
    for (const section of course.sections) {
      for (const lecture of section.lectures) {
        if (foundCurrent) {
          return { ...lecture, sectionTitle: section.title };
        }
        if (lecture._id === currentLecture._id) {
          foundCurrent = true;
        }
      }
    }
    return null;
  };

  const goToNextLecture = () => {
    const nextLecture = getNextLecture();
    if (nextLecture) {
      setCurrentLecture(nextLecture);
      // Auto-mark current as complete
      if (currentLecture) {
        markLectureComplete(currentLecture._id);
      }
    }
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
          <button
            onClick={() => navigate('/courses')}
            className="theme-button-primary"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg-primary">
      {/* Header */}
      <div className="theme-bg-card border-b theme-border-primary">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg hover:theme-bg-secondary transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 theme-text-primary" />
            </button>
            <div>
              <h1 className="text-xl font-bold theme-text-primary">{course.title}</h1>
              {enrollment && (
                <p className="text-sm theme-text-tertiary mt-1">
                  {Math.round(enrollment.progressPercentage || 0)}% Complete
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Main Video Player */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-black flex items-center justify-center p-4">
            {currentLecture ? (
              currentLecture.videoData?.videoId ? (
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
              ) : (
                <div className="text-center text-white p-8">
                  <DocumentTextIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No video available for this lecture</p>
                </div>
              )
            ) : (
              <div className="text-center text-white p-8">
                <PlayIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a lecture to start learning</p>
              </div>
            )}
          </div>

          {/* Lecture Info & Controls */}
          <div className="theme-bg-card border-t theme-border-primary p-6">
            <div className="flex items-center justify-between">
              <div>
                {currentLecture && (
                  <>
                    <p className="text-sm theme-text-tertiary mb-1">{currentLecture.sectionTitle}</p>
                    <h2 className="text-2xl font-bold theme-text-primary">
                      {currentLecture.title}
                    </h2>
                    {currentLecture.description && (
                      <p className="theme-text-secondary mt-2">{currentLecture.description}</p>
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-3">
                {currentLecture && !completedLectures.has(currentLecture._id) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => markLectureComplete(currentLecture._id)}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Mark Complete
                  </motion.button>
                )}
                {getNextLecture() && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToNextLecture}
                    className="theme-button-primary"
                  >
                    Next Lecture
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Course Content */}
        <div className="w-96 theme-bg-card border-l theme-border-primary overflow-y-auto">
          <div className="p-4 border-b theme-border-primary">
            <h3 className="font-bold theme-text-primary">Course Content</h3>
            <p className="text-sm theme-text-tertiary mt-1">
              {course.sections?.length || 0} sections • {course.totalLectures || 0} lectures
            </p>
          </div>

          <div className="divide-y theme-divide-primary">
            {course.sections?.map((section, sectionIndex) => (
              <div key={section._id || sectionIndex} className="theme-bg-card">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(sectionIndex)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:theme-bg-secondary transition-colors"
                >
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold theme-text-primary">{section.title}</h4>
                    <p className="text-sm theme-text-tertiary mt-1">
                      {section.lectures?.length || 0} lectures
                    </p>
                  </div>
                  {expandedSections[sectionIndex] ? (
                    <ChevronUpIcon className="h-5 w-5 theme-text-tertiary" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 theme-text-tertiary" />
                  )}
                </button>

                {/* Lectures List */}
                {expandedSections[sectionIndex] && (
                  <div className="theme-bg-primary">
                    {section.lectures?.map((lecture, lectureIndex) => {
                      const isCompleted = completedLectures.has(lecture._id);
                      const isCurrent = currentLecture?._id === lecture._id;

                      return (
                        <button
                          key={lecture._id || lectureIndex}
                          onClick={() => selectLecture(lecture, section.title)}
                          className={`w-full px-6 py-3 flex items-center gap-3 hover:theme-bg-card transition-colors ${
                            isCurrent ? 'theme-bg-card border-l-4 border-blue-500' : ''
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircleSolid className="h-5 w-5 text-green-500" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 theme-border-primary" />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className={`text-sm font-medium ${
                              isCurrent ? 'text-blue-500' : 'theme-text-primary'
                            }`}>
                              {lecture.title}
                            </p>
                            {lecture.duration && (
                              <p className="text-xs theme-text-tertiary mt-1">
                                {lecture.duration} min
                              </p>
                            )}
                          </div>
                          {lecture.videoData?.videoId && (
                            <PlayIcon className="h-4 w-4 theme-text-tertiary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearning;
