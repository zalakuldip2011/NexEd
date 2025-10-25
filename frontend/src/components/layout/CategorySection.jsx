import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

const CategorySection = () => {
  const categories = [
    {
      name: "Web Development",
      courses: [
        {
          id: 1,
          title: "Complete React Developer Course",
          instructor: "John Smith",
          price: "$89.99",
          originalPrice: "$129.99",
          rating: 4.8,
          students: "12,456",
          image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
          badge: "Bestseller"
        },
        {
          id: 2,
          title: "Modern JavaScript Masterclass",
          instructor: "Sarah Johnson",
          price: "$79.99",
          originalPrice: "$119.99",
          rating: 4.9,
          students: "8,923",
          image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
          badge: "New"
        },
        {
          id: 3,
          title: "Full Stack MERN Development",
          instructor: "Mike Chen",
          price: "$99.99",
          originalPrice: "$149.99",
          rating: 4.7,
          students: "15,678",
          image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
          badge: "Hot"
        },
        {
          id: 4,
          title: "Node.js API Development",
          instructor: "Emily Davis",
          price: "$69.99",
          originalPrice: "$99.99",
          rating: 4.6,
          students: "6,234",
          image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
        }
      ]
    },
    {
      name: "Data Science",
      courses: [
        {
          id: 5,
          title: "Python for Data Science",
          instructor: "Dr. Lisa Wang",
          price: "$94.99",
          originalPrice: "$134.99",
          rating: 4.8,
          students: "18,456",
          image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
          badge: "Bestseller"
        },
        {
          id: 6,
          title: "Machine Learning A-Z",
          instructor: "Prof. Robert Kumar",
          price: "$109.99",
          originalPrice: "$159.99",
          rating: 4.9,
          students: "22,891",
          image: "https://images.unsplash.com/photo-1555949963-f7fe82fcdc14?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
          badge: "Bestseller"
        },
        {
          id: 7,
          title: "Deep Learning with TensorFlow",
          instructor: "Anna Rodriguez",
          price: "$119.99",
          originalPrice: "$179.99",
          rating: 4.7,
          students: "9,567",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
          badge: "New"
        },
        {
          id: 8,
          title: "Data Visualization with Python",
          instructor: "James Wilson",
          price: "$74.99",
          originalPrice: "$104.99",
          rating: 4.5,
          students: "7,123",
          image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
        }
      ]
    },
    {
      name: "Design",
      courses: [
        {
          id: 9,
          title: "UI/UX Design Fundamentals",
          instructor: "Sophie Turner",
          price: "$79.99",
          originalPrice: "$109.99",
          rating: 4.8,
          students: "11,234",
          image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
          badge: "Hot"
        },
        {
          id: 10,
          title: "Adobe Creative Suite Mastery",
          instructor: "David Kim",
          price: "$129.99",
          originalPrice: "$179.99",
          rating: 4.9,
          students: "16,789",
          image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
          badge: "Bestseller"
        },
        {
          id: 11,
          title: "Figma for Beginners",
          instructor: "Maria Garcia",
          price: "$59.99",
          originalPrice: "$89.99",
          rating: 4.7,
          students: "8,456",
          image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
          badge: "New"
        },
        {
          id: 12,
          title: "Brand Identity Design",
          instructor: "Alex Thompson",
          price: "$89.99",
          originalPrice: "$129.99",
          rating: 4.6,
          students: "5,678",
          image: "https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
        }
      ]
    }
  ];

  const CourseCard = ({ course }) => (
    <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
      <div className="relative">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {course.badge && (
          <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded-full ${
            course.badge === 'Bestseller' ? 'bg-yellow-500 text-black' :
            course.badge === 'New' ? 'bg-green-500 text-white' :
            course.badge === 'Hot' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
          }`}>
            {course.badge}
          </span>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
          {course.title}
        </h3>
        <p className="text-gray-400 text-sm mb-3">{course.instructor}</p>
        
        <div className="flex items-center mb-3">
          <span className="text-yellow-400 font-semibold mr-1">{course.rating}</span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(course.rating) ? 'text-yellow-400' : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-gray-500 text-sm ml-2">({course.students})</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">{course.price}</span>
            {course.originalPrice && (
              <span className="text-sm text-gray-500 line-through">{course.originalPrice}</span>
            )}
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {categories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">{category.name}</h2>
              <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                View All →
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        ))}
        
        {/* Explore All Categories Button */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Explore All Categories
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;