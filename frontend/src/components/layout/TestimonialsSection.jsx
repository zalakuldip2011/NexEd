import React, { useState, useEffect } from 'react';
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Software Engineer at Google",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b5e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      quote: "NexEd completely transformed my career. The React course helped me land my dream job at Google. The instructors are world-class and the content is always up-to-date.",
      course: "Complete React Developer Course"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Data Scientist at Microsoft",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      quote: "The Machine Learning course exceeded my expectations. I went from complete beginner to building production ML models in just 3 months. Highly recommended!",
      course: "Machine Learning A-Z"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "UX Designer at Adobe",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      quote: "Amazing platform! The UI/UX course was incredibly detailed and practical. I was able to apply everything I learned immediately in my work projects.",
      course: "UI/UX Design Fundamentals"
    },
    {
      id: 4,
      name: "David Kim",
      role: "Full Stack Developer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      quote: "The MERN stack course is phenomenal. Clear explanations, real-world projects, and excellent support from instructors. Worth every penny!",
      course: "Full Stack MERN Development"
    },
    {
      id: 5,
      name: "Lisa Wang",
      role: "Product Manager at Amazon",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      quote: "NexEd's business courses helped me transition from developer to product manager. The content is practical and the community is supportive.",
      course: "Product Management Essentials"
    },
    {
      id: 6,
      name: "James Wilson",
      role: "Marketing Director",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      quote: "The digital marketing course gave me the skills to grow our startup from 0 to 100k users. The ROI strategies are game-changing!",
      course: "Digital Marketing Mastery"
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(testimonials.length / 3));
    }, 4000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(testimonials.length / 3));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(testimonials.length / 3)) % Math.ceil(testimonials.length / 3));
  };

  const getVisibleTestimonials = () => {
    const start = currentIndex * 3;
    return testimonials.slice(start, start + 3);
  };

  const TestimonialCard = ({ testimonial }) => (
    <div className="bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-700">
      <div className="flex items-center mb-4">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-blue-500"
        />
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-white">{testimonial.name}</h4>
          <p className="text-blue-400 text-sm">{testimonial.role}</p>
        </div>
        <div className="flex">
          {[...Array(testimonial.rating)].map((_, i) => (
            <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
          ))}
        </div>
      </div>
      
      <blockquote className="text-gray-300 mb-4 leading-relaxed">
        "{testimonial.quote}"
      </blockquote>
      
      <div className="text-sm text-gray-500">
        Course: <span className="text-blue-400">{testimonial.course}</span>
      </div>
    </div>
  );

  return (
    <section className="py-20 bg-gray-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            What Our Students Say
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join thousands of successful learners who have transformed their careers with NexEd
          </p>
        </div>

        {/* Testimonials Slider */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors shadow-lg"
          >
            <ChevronLeftIcon className="h-6 w-6 text-white" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors shadow-lg"
          >
            <ChevronRightIcon className="h-6 w-6 text-white" />
          </button>

          {/* Testimonials Grid */}
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getVisibleTestimonials().map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-blue-500 scale-125' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="text-3xl font-bold text-blue-400 mb-2">50K+</div>
            <div className="text-gray-400">Happy Students</div>
          </div>
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="text-3xl font-bold text-green-400 mb-2">1000+</div>
            <div className="text-gray-400">Courses Available</div>
          </div>
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="text-3xl font-bold text-purple-400 mb-2">200+</div>
            <div className="text-gray-400">Expert Instructors</div>
          </div>
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="text-3xl font-bold text-yellow-400 mb-2">4.8</div>
            <div className="text-gray-400">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;