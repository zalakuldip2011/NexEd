import React from 'react';

/**
 * Beautiful Material UI-inspired Card Component
 * Supports multiple variants, hover effects, and custom styles
 */
const Card = ({
  children,
  variant = 'elevated',
  hover = true,
  padding = 'md',
  className = '',
  onClick,
  ...props
}) => {
  // Base card classes
  const baseClasses = 'rounded-xl overflow-hidden transition-all duration-300 ease-out';

  // Variant classes
  const variantClasses = {
    elevated: 'bg-white dark:bg-gray-800 shadow-md hover:shadow-xl',
    outlined: 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500',
    filled: 'bg-gray-50 dark:bg-gray-900 shadow-sm',
    gradient: 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-2xl'
  };

  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  // Hover effect
  const hoverClasses = hover ? 'hover:-translate-y-1 cursor-pointer' : '';

  // Clickable
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  // Combine all classes
  const cardClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${hoverClasses}
    ${clickableClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={cardClasses} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

// Card Header Component
export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

// Card Title Component
export const CardTitle = ({ children, className = '' }) => {
  return (
    <h3 className={`text-2xl font-bold text-gray-900 dark:text-white ${className}`}>
      {children}
    </h3>
  );
};

// Card Description Component
export const CardDescription = ({ children, className = '' }) => {
  return (
    <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${className}`}>
      {children}
    </p>
  );
};

// Card Content Component
export const CardContent = ({ children, className = '' }) => {
  return (
    <div className={`text-gray-700 dark:text-gray-300 ${className}`}>
      {children}
    </div>
  );
};

// Card Footer Component
export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
};

// Glass Card Component - with backdrop blur effect
export const GlassCard = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`
        rounded-xl overflow-hidden backdrop-blur-lg bg-white/10 dark:bg-gray-900/10
        border border-white/20 dark:border-gray-700/20
        shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </div>
  );
};

// Stats Card Component - perfect for dashboards
export const StatsCard = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  variant = 'default',
  className = ''
}) => {
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800',
    primary: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
    success: 'bg-gradient-to-br from-green-500 to-green-600 text-white',
    warning: 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white',
    danger: 'bg-gradient-to-br from-red-500 to-red-600 text-white'
  };

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500'
  };

  return (
    <Card
      variant="elevated"
      padding="md"
      className={`${variantClasses[variant]} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${variant === 'default' ? 'text-gray-600 dark:text-gray-400' : 'text-white/80'}`}>
            {title}
          </p>
          <p className={`text-3xl font-bold mt-2 ${variant === 'default' ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
            {value}
          </p>
          {trend && trendValue && (
            <div className={`flex items-center mt-2 text-sm ${variant === 'default' ? trendColors[trend] : 'text-white/90'}`}>
              {trend === 'up' && (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {trend === 'down' && (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${variant === 'default' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-white/20'}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

// Course Card Component - specialized for course display
export const CourseCard = ({
  image,
  title,
  instructor,
  rating,
  students,
  price,
  originalPrice,
  badge,
  onClick,
  className = ''
}) => {
  return (
    <Card
      variant="elevated"
      padding="none"
      hover={true}
      onClick={onClick}
      className={className}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-video">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        {badge && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            {badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{instructor}</p>

        {/* Rating and Students */}
        <div className="flex items-center gap-4 mb-3 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="font-semibold text-gray-900 dark:text-white">{rating}</span>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            {students.toLocaleString()} students
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{price}
          </span>
          {originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{originalPrice}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Card;
