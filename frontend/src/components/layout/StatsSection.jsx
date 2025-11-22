import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  UserGroupIcon, 
  AcademicCapIcon, 
  GlobeAltIcon, 
  StarIcon 
} from '@heroicons/react/24/solid';

const StatsSection = () => {
  const { isDarkMode } = useTheme();
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef(null);

  const stats = [
    {
      icon: UserGroupIcon,
      value: 50000,
      suffix: '+',
      label: 'Active Students',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: AcademicCapIcon,
      value: 1000,
      suffix: '+',
      label: 'Courses Available',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: GlobeAltIcon,
      value: 120,
      suffix: '+',
      label: 'Countries Reached',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: StarIcon,
      value: 4.8,
      suffix: '/5',
      label: 'Average Rating',
      color: 'from-yellow-500 to-orange-500',
      decimal: true
    }
  ];

  // Intersection Observer for scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [hasAnimated]);

  // Counter state for each stat (moved to top level)
  const [counters, setCounters] = useState(stats.map(() => 0));

  // Counter animation effect
  useEffect(() => {
    if (!hasAnimated) return;

    const duration = 2000;
    let startTime;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setCounters(stats.map((stat) => {
        const isDecimal = stat.value % 1 !== 0;
        const currentValue = stat.value * easeOutQuart;
        return isDecimal ? currentValue.toFixed(1) : Math.floor(currentValue);
      }));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [hasAnimated]);

  return (
    <section 
      ref={sectionRef}
      className={`py-20 relative overflow-hidden ${
        isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-blue-600 to-purple-700'
      }`}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center group"
              style={{
                animation: hasAnimated ? `slideInUp 0.6s ease-out ${index * 0.15}s both` : 'none'
              }}
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Counter */}
              <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                {counters[index]}{stat.suffix}
              </div>

              {/* Label */}
              <div className="text-lg text-gray-200 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default StatsSection;
