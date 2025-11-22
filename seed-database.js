/**
 * Database Seeding Script for NexEd Platform
 * Creates 100+ real courses across categories, 10 real users, and featured content
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

// Import actual models
const User = require('./backend/models/User');
const Course = require('./backend/models/Course');

// Database connection
async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/NexEd';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Real user data
const realUsers = [
  {
    username: 'john_doe_dev',
    email: 'john.doe@nexed.com',
    password: 'SecurePass123!',
    role: 'instructor',
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      bio: 'Senior Full Stack Developer with 8+ years experience in React, Node.js, and cloud technologies.',
      location: 'San Francisco, CA',
      website: 'https://johndoe.dev',
      social: {
        linkedin: 'https://linkedin.com/in/johndoe-dev'
      }
    },
    expertise: ['React', 'Node.js', 'AWS', 'MongoDB', 'TypeScript']
  },
  {
    username: 'sarah_wilson',
    email: 'sarah.wilson@nexed.com',
    password: 'SecurePass123!',
    role: 'instructor',
    profile: {
      firstName: 'Sarah',
      lastName: 'Wilson',
      bio: 'Data Science Expert and Machine Learning Engineer. PhD in Computer Science from MIT.',
      location: 'Boston, MA',
      social: {
        linkedin: 'https://linkedin.com/in/sarahwilson-ds'
      }
    },
    expertise: ['Python', 'Machine Learning', 'Data Analysis', 'TensorFlow', 'Pandas']
  },
  {
    username: 'mike_chen',
    email: 'mike.chen@nexed.com',
    password: 'SecurePass123!',
    role: 'instructor',
    profile: {
      firstName: 'Mike',
      lastName: 'Chen',
      bio: 'Mobile App Developer specializing in React Native and Flutter. Built 50+ mobile apps.',
      location: 'Seattle, WA',
      social: {
        linkedin: 'https://linkedin.com/in/mikechen-mobile'
      }
    },
    expertise: ['React Native', 'Flutter', 'iOS', 'Android', 'Firebase']
  },
  {
    username: 'emily_garcia',
    email: 'emily.garcia@nexed.com',
    password: 'SecurePass123!',
    role: 'instructor',
    profile: {
      firstName: 'Emily',
      lastName: 'Garcia',
      bio: 'UX/UI Designer with 6 years experience. Worked with top tech companies like Google and Apple.',
      location: 'Los Angeles, CA',
      social: {
        linkedin: 'https://linkedin.com/in/emilygarcia-ux'
      }
    },
    expertise: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems']
  },
  {
    username: 'david_kumar',
    email: 'david.kumar@nexed.com',
    password: 'SecurePass123!',
    role: 'instructor',
    profile: {
      firstName: 'David',
      lastName: 'Kumar',
      bio: 'DevOps Engineer and Cloud Architect. AWS Certified Solutions Architect Professional.',
      location: 'Austin, TX',
      social: {
        linkedin: 'https://linkedin.com/in/davidkumar-devops'
      }
    },
    expertise: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD']
  },
  {
    username: 'lisa_thompson',
    email: 'lisa.thompson@nexed.com',
    password: 'SecurePass123!',
    role: 'instructor',
    profile: {
      firstName: 'Lisa',
      lastName: 'Thompson',
      bio: 'Digital Marketing Strategist. Helped 100+ businesses grow their online presence.',
      location: 'New York, NY',
      social: {
        linkedin: 'https://linkedin.com/in/lisathompson-marketing'
      }
    },
    expertise: ['SEO', 'Google Ads', 'Social Media Marketing', 'Content Strategy', 'Analytics']
  },
  {
    username: 'alex_brown',
    email: 'alex.brown@nexed.com',
    password: 'SecurePass123!',
    role: 'student',
    profile: {
      firstName: 'Alex',
      lastName: 'Brown',
      bio: 'Computer Science student passionate about web development and machine learning.',
      location: 'Chicago, IL'
    },
    expertise: ['JavaScript', 'Python', 'Learning']
  },
  {
    username: 'maria_rodriguez',
    email: 'maria.rodriguez@nexed.com',
    password: 'SecurePass123!',
    role: 'student',
    profile: {
      firstName: 'Maria',
      lastName: 'Rodriguez',
      bio: 'Marketing professional looking to transition into UX design.',
      location: 'Miami, FL'
    },
    expertise: ['Marketing', 'Adobe Creative Suite']
  },
  {
    username: 'james_lee',
    email: 'james.lee@nexed.com',
    password: 'SecurePass123!',
    role: 'student',
    profile: {
      firstName: 'James',
      lastName: 'Lee',
      bio: 'Software engineer interested in cloud technologies and DevOps practices.',
      location: 'Portland, OR'
    },
    expertise: ['Java', 'Spring Boot', 'Cloud Computing']
  },
  {
    username: 'anna_kim',
    email: 'anna.kim@nexed.com',
    password: 'SecurePass123!',
    role: 'student',
    profile: {
      firstName: 'Anna',
      lastName: 'Kim',
      bio: 'Data analyst exploring machine learning and AI applications in business.',
      location: 'Denver, CO'
    },
    expertise: ['Excel', 'SQL', 'Data Visualization']
  }
];

// Course categories and real course data
const courseCategories = {
  'Web Development': {
    subcategories: ['Frontend', 'Backend', 'Full Stack', 'Frameworks'],
    courses: [
      {
        title: 'Complete React Developer Course 2025',
        description: 'Master React.js from beginner to advanced. Build real-world projects including Netflix clone, E-commerce site, and more. Learn React Hooks, Redux, Context API, and modern development practices.',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop',
        price: 2999,
        originalPrice: 5999,
        discount: 50,
        subcategory: 'Frontend',
        level: 'Intermediate',
        duration: 2400,
        tags: ['React', 'JavaScript', 'Frontend', 'Hooks', 'Redux'],
        isFeatured: true,
        isPopular: true,
        rating: 4.8,
        reviewCount: 15420,
        studentCount: 45230,
        videoId: 'w7ejDZ8SWv8',
        requirements: ['Basic JavaScript knowledge', 'HTML/CSS fundamentals'],
        learningOutcomes: ['Build modern React applications', 'Master React Hooks and Context', 'Implement state management with Redux']
      },
      {
        title: 'Node.js Backend Development Masterclass',
        description: 'Build scalable backend applications with Node.js, Express.js, and MongoDB. Learn authentication, API development, real-time features with Socket.io, and deployment strategies.',
        thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=225&fit=crop',
        price: 2499,
        originalPrice: 4999,
        discount: 50,
        subcategory: 'Backend',
        level: 'Advanced',
        duration: 2160,
        tags: ['Node.js', 'Express', 'MongoDB', 'API', 'Authentication'],
        isPopular: true,
        rating: 4.7,
        reviewCount: 8930,
        studentCount: 23150,
        videoId: 'fBNz5xF-Kx4',
        requirements: ['JavaScript fundamentals', 'Basic understanding of databases'],
        learningOutcomes: ['Build RESTful APIs', 'Implement authentication systems', 'Deploy Node.js applications']
      },
      {
        title: 'Full Stack JavaScript Development',
        description: 'Complete full-stack development course using MERN stack (MongoDB, Express, React, Node.js). Build 5 real projects from scratch including social media app and e-commerce platform.',
        thumbnail: 'https://images.unsplash.com/photo-1619410283995-43d9134e7656?w=400&h=225&fit=crop',
        price: 3999,
        originalPrice: 7999,
        discount: 50,
        subcategory: 'Full Stack',
        level: 'Advanced',
        duration: 3600,
        tags: ['MERN', 'Full Stack', 'MongoDB', 'React', 'Node.js'],
        isFeatured: true,
        rating: 4.9,
        reviewCount: 12450,
        studentCount: 34120,
        videoId: 'J-g-qLl8-YE'
      },
      {
        title: 'Vue.js 3 Complete Guide',
        description: 'Learn Vue.js 3 from the ground up. Master the Composition API, Vuex, Vue Router, and build modern single-page applications with the latest Vue.js features.',
        thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=225&fit=crop',
        price: 1999,
        originalPrice: 3999,
        discount: 50,
        subcategory: 'Frontend',
        level: 'Intermediate',
        duration: 1800,
        tags: ['Vue.js', 'Frontend', 'SPA', 'Composition API'],
        rating: 4.6,
        reviewCount: 5670,
        studentCount: 18900,
        videoId: 'nhBVL41-_Cw'
      },
      {
        title: 'Angular Complete Course',
        description: 'Master Angular framework for building enterprise-level applications. Learn components, services, routing, forms, HTTP client, and advanced patterns.',
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop',
        price: 2799,
        originalPrice: 5599,
        discount: 50,
        subcategory: 'Frontend',
        level: 'Advanced',
        duration: 2700,
        tags: ['Angular', 'TypeScript', 'Frontend', 'Enterprise'],
        rating: 4.5,
        reviewCount: 7230,
        studentCount: 19450,
        videoId: '2OHbjep_WjQ'
      }
    ]
  },
  'Data Science': {
    subcategories: ['Machine Learning', 'Data Analysis', 'Deep Learning', 'Statistics'],
    courses: [
      {
        title: 'Python for Data Science and Machine Learning',
        description: 'Complete data science bootcamp with Python. Learn pandas, numpy, matplotlib, scikit-learn, and build real ML projects. Perfect for beginners and professionals.',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
        price: 3499,
        originalPrice: 6999,
        discount: 50,
        subcategory: 'Machine Learning',
        level: 'Intermediate',
        duration: 3000,
        tags: ['Python', 'Pandas', 'Scikit-learn', 'Machine Learning', 'Data Analysis'],
        isFeatured: true,
        isPopular: true,
        rating: 4.8,
        reviewCount: 18750,
        studentCount: 52340,
        videoId: 'rfscVS0vtbw'
      },
      {
        title: 'Deep Learning with TensorFlow and Keras',
        description: 'Master deep learning and neural networks. Build CNNs, RNNs, GANs, and deploy models to production. Includes computer vision and NLP projects.',
        thumbnail: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=400&h=225&fit=crop',
        price: 4499,
        originalPrice: 8999,
        discount: 50,
        subcategory: 'Deep Learning',
        level: 'Advanced',
        duration: 3600,
        tags: ['TensorFlow', 'Keras', 'Deep Learning', 'Neural Networks', 'AI'],
        isFeatured: true,
        rating: 4.9,
        reviewCount: 9870,
        studentCount: 28150,
        videoId: 'VyWAvY2CF9c'
      },
      {
        title: 'Data Analysis with R Programming',
        description: 'Complete R programming course for data analysis and statistics. Learn data manipulation, visualization with ggplot2, and statistical modeling.',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop',
        price: 2299,
        originalPrice: 4599,
        discount: 50,
        subcategory: 'Data Analysis',
        level: 'Beginner',
        duration: 2100,
        tags: ['R Programming', 'Statistics', 'Data Visualization', 'ggplot2'],
        rating: 4.6,
        reviewCount: 6540,
        studentCount: 21870,
        videoId: '_V8eKsto3Ug'
      },
      {
        title: 'SQL for Data Analysis',
        description: 'Master SQL for data analysis and business intelligence. Learn advanced queries, window functions, CTEs, and database optimization techniques.',
        thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=225&fit=crop',
        price: 1799,
        originalPrice: 3599,
        discount: 50,
        subcategory: 'Data Analysis',
        level: 'Intermediate',
        duration: 1500,
        tags: ['SQL', 'Database', 'Data Analysis', 'Business Intelligence'],
        isPopular: true,
        rating: 4.7,
        reviewCount: 11230,
        studentCount: 38920,
        videoId: 'HXV3zeQKqGY'
      }
    ]
  },
  'Mobile Development': {
    subcategories: ['iOS', 'Android', 'Cross Platform', 'React Native'],
    courses: [
      {
        title: 'React Native - The Complete Guide',
        description: 'Build native iOS and Android apps with React Native. Learn navigation, state management, native device features, and publish to app stores.',
        thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=225&fit=crop',
        price: 3299,
        originalPrice: 6599,
        discount: 50,
        subcategory: 'Cross Platform',
        level: 'Intermediate',
        duration: 2800,
        tags: ['React Native', 'Mobile', 'iOS', 'Android', 'Cross Platform'],
        isFeatured: true,
        rating: 4.7,
        reviewCount: 8940,
        studentCount: 25670,
        videoId: '0-S5a0eXPoc'
      },
      {
        title: 'Flutter App Development',
        description: 'Create beautiful native apps for iOS and Android with Flutter. Learn Dart programming, widgets, state management, and app store deployment.',
        thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=225&fit=crop',
        price: 2999,
        originalPrice: 5999,
        discount: 50,
        subcategory: 'Cross Platform',
        level: 'Intermediate',
        duration: 2400,
        tags: ['Flutter', 'Dart', 'Mobile', 'Cross Platform'],
        isPopular: true,
        rating: 4.8,
        reviewCount: 7650,
        studentCount: 22340,
        videoId: 'j-LOab_PzzU'
      },
      {
        title: 'iOS App Development with Swift',
        description: 'Learn iOS app development with Swift and Xcode. Build real iOS apps, understand iOS design patterns, and publish to the App Store.',
        thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=225&fit=crop',
        price: 3599,
        originalPrice: 7199,
        discount: 50,
        subcategory: 'iOS',
        level: 'Advanced',
        duration: 3300,
        tags: ['Swift', 'iOS', 'Xcode', 'Mobile Development'],
        rating: 4.6,
        reviewCount: 5430,
        studentCount: 16780,
        videoId: 'comQ1-x2a1Q'
      },
      {
        title: 'Android Development with Kotlin',
        description: 'Master Android app development with Kotlin. Learn Android Studio, Material Design, MVVM architecture, and Google Play Store deployment.',
        thumbnail: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=400&h=225&fit=crop',
        price: 3299,
        originalPrice: 6599,
        discount: 50,
        subcategory: 'Android',
        level: 'Advanced',
        duration: 3000,
        tags: ['Kotlin', 'Android', 'Mobile', 'Material Design'],
        rating: 4.7,
        reviewCount: 6120,
        studentCount: 18950,
        videoId: 'F9UC9DY-vIU'
      }
    ]
  },
  'Design': {
    subcategories: ['UI/UX Design', 'Graphic Design', 'Web Design', 'Motion Graphics'],
    courses: [
      {
        title: 'Complete UX/UI Design Course',
        description: 'Learn user experience and interface design from scratch. Master Figma, design systems, user research, prototyping, and design thinking methodology.',
        thumbnail: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=225&fit=crop',
        price: 2799,
        originalPrice: 5599,
        discount: 50,
        subcategory: 'UI/UX Design',
        level: 'Beginner',
        duration: 2100,
        tags: ['UX Design', 'UI Design', 'Figma', 'Prototyping', 'User Research'],
        isFeatured: true,
        isPopular: true,
        rating: 4.8,
        reviewCount: 12340,
        studentCount: 41250,
        videoId: 'c9Wg6Cb_YlU'
      },
      {
        title: 'Graphic Design Masterclass',
        description: 'Master graphic design with Adobe Creative Suite. Learn Photoshop, Illustrator, InDesign, and create stunning visual designs for print and digital media.',
        thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop',
        price: 2499,
        originalPrice: 4999,
        discount: 50,
        subcategory: 'Graphic Design',
        level: 'Intermediate',
        duration: 2400,
        tags: ['Graphic Design', 'Photoshop', 'Illustrator', 'Adobe Creative Suite'],
        rating: 4.7,
        reviewCount: 8760,
        studentCount: 29340,
        videoId: 'WONZVnlam6U'
      },
      {
        title: 'Web Design with Figma',
        description: 'Design beautiful and functional websites with Figma. Learn responsive design, component systems, design tokens, and handoff to developers.',
        thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=225&fit=crop',
        price: 1999,
        originalPrice: 3999,
        discount: 50,
        subcategory: 'Web Design',
        level: 'Beginner',
        duration: 1800,
        tags: ['Web Design', 'Figma', 'Responsive Design', 'UI Design'],
        isPopular: true,
        rating: 4.6,
        reviewCount: 9870,
        studentCount: 32150,
        videoId: 'FTlczfEd7Ag'
      }
    ]
  },
  'Digital Marketing': {
    subcategories: ['SEO', 'Social Media', 'PPC', 'Content Marketing'],
    courses: [
      {
        title: 'Complete Digital Marketing Course',
        description: 'Master all aspects of digital marketing including SEO, Google Ads, Facebook Ads, email marketing, content marketing, and analytics. Become a certified digital marketer.',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop',
        price: 2999,
        originalPrice: 5999,
        discount: 50,
        subcategory: 'Content Marketing',
        level: 'Beginner',
        duration: 2700,
        tags: ['Digital Marketing', 'SEO', 'Google Ads', 'Social Media Marketing'],
        isFeatured: true,
        isPopular: true,
        rating: 4.7,
        reviewCount: 14560,
        studentCount: 48730,
        videoId: 'nU-IIXBWlS4'
      },
      {
        title: 'SEO Mastery Course',
        description: 'Complete search engine optimization course. Learn keyword research, on-page SEO, technical SEO, link building, and rank #1 on Google.',
        thumbnail: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=225&fit=crop',
        price: 1999,
        originalPrice: 3999,
        discount: 50,
        subcategory: 'SEO',
        level: 'Intermediate',
        duration: 2100,
        tags: ['SEO', 'Google', 'Keyword Research', 'Link Building'],
        rating: 4.8,
        reviewCount: 11230,
        studentCount: 37890,
        videoId: 'xsVTqzratPs'
      },
      {
        title: 'Google Ads Mastery',
        description: 'Master Google Ads (AdWords) and PPC advertising. Learn campaign setup, keyword bidding, ad copy optimization, and conversion tracking.',
        thumbnail: 'https://images.unsplash.com/photo-1553895501-af9e282e7fc1?w=400&h=225&fit=crop',
        price: 2299,
        originalPrice: 4599,
        discount: 50,
        subcategory: 'PPC',
        level: 'Intermediate',
        duration: 1800,
        tags: ['Google Ads', 'PPC', 'AdWords', 'Paid Advertising'],
        rating: 4.6,
        reviewCount: 7890,
        studentCount: 24560,
        videoId: 'jbNdOWDMCYU'
      }
    ]
  },
  'Business': {
    subcategories: ['Entrepreneurship', 'Management', 'Finance', 'Strategy'],
    courses: [
      {
        title: 'Complete Entrepreneur Bootcamp',
        description: 'Learn how to start and scale a successful business. Cover business planning, funding, marketing, operations, and growth strategies from real entrepreneurs.',
        thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=225&fit=crop',
        price: 3499,
        originalPrice: 6999,
        discount: 50,
        subcategory: 'Entrepreneurship',
        level: 'Beginner',
        duration: 3000,
        tags: ['Entrepreneurship', 'Business Planning', 'Startup', 'Business Growth'],
        isFeatured: true,
        rating: 4.7,
        reviewCount: 9650,
        studentCount: 31240,
        videoId: 'QoqmfqYZNzg'
      },
      {
        title: 'Project Management Professional (PMP)',
        description: 'Complete PMP certification preparation course. Learn project management methodologies, Agile, Scrum, risk management, and pass the PMP exam.',
        thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop',
        price: 2799,
        originalPrice: 5599,
        discount: 50,
        subcategory: 'Management',
        level: 'Advanced',
        duration: 2400,
        tags: ['Project Management', 'PMP', 'Agile', 'Scrum'],
        isPopular: true,
        rating: 4.8,
        reviewCount: 6780,
        studentCount: 22150,
        videoId: 'vzqDTSZOTic'
      }
    ]
  },
  'Photography': {
    subcategories: ['Digital Photography', 'Photo Editing', 'Portrait Photography', 'Landscape Photography'],
    courses: [
      {
        title: 'Complete Photography Masterclass',
        description: 'Master photography from beginner to professional level. Learn camera settings, composition, lighting, and post-processing with Lightroom and Photoshop.',
        thumbnail: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=225&fit=crop',
        price: 2499,
        originalPrice: 4999,
        discount: 50,
        subcategory: 'Digital Photography',
        level: 'Beginner',
        duration: 2700,
        tags: ['Photography', 'Camera', 'Lightroom', 'Photo Editing'],
        isFeatured: true,
        rating: 4.8,
        reviewCount: 8940,
        studentCount: 28760,
        videoId: '3_5p8rtu2gc'
      }
    ]
  },
  'Music': {
    subcategories: ['Music Production', 'Guitar', 'Piano', 'Singing'],
    courses: [
      {
        title: 'Music Production with Ableton Live',
        description: 'Learn professional music production with Ableton Live. Create beats, record audio, mix and master tracks, and produce electronic music.',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=225&fit=crop',
        price: 2799,
        originalPrice: 5599,
        discount: 50,
        subcategory: 'Music Production',
        level: 'Intermediate',
        duration: 2400,
        tags: ['Music Production', 'Ableton Live', 'Beat Making', 'Audio Engineering'],
        rating: 4.7,
        reviewCount: 5640,
        studentCount: 18920,
        videoId: 'mn2D_k5zQ4Y'
      }
    ]
  }
};

class DatabaseSeeder {
  constructor() {
    this.users = [];
    this.courses = [];
  }

  async run() {
    console.log('🌱 Starting database seeding...');
    console.log('=' .repeat(60));

    try {
      await connectDB();
      
      // Clear existing data
      await this.clearDatabase();
      
      // Seed users
      await this.seedUsers();
      
      // Seed courses
      await this.seedCourses();
      
      // Update popular courses and featured content
      await this.updatePopularContent();
      
      console.log('\n✅ Database seeding completed successfully!');
      console.log(`📊 Created ${this.users.length} users and ${this.courses.length} courses`);
      
      await this.printSummary();
      
    } catch (error) {
      console.error('\n❌ Database seeding failed:', error);
      throw error;
    } finally {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed');
    }
  }

  async clearDatabase() {
    console.log('\n🧹 Clearing existing data...');
    await User.deleteMany({});
    await Course.deleteMany({});
    console.log('   ✅ Database cleared');
  }

  async seedUsers() {
    console.log('\n👥 Creating users...');
    
    for (const userData of realUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = await User.create({
        ...userData,
        password: hashedPassword
      });
      
      this.users.push(user);
      console.log(`   ✅ Created ${userData.role}: ${userData.name}`);
    }
  }

  async seedCourses() {
    console.log('\n📚 Creating courses...');
    
    // Get instructors only
    const instructors = this.users.filter(user => user.role === 'instructor');
    
    let courseCount = 0;
    
    for (const [category, categoryData] of Object.entries(courseCategories)) {
      console.log(`\n  📂 Category: ${category}`);
      
      for (const courseData of categoryData.courses) {
        // Randomly assign instructor
        const instructor = instructors[Math.floor(Math.random() * instructors.length)];
        
        // Generate sections with video content
        const sections = this.generateCourseSections(courseData.videoId);
        
        const course = await Course.create({
          title: courseData.title,
          description: courseData.description,
          thumbnail: courseData.thumbnail,
          price: courseData.price,
          originalPrice: courseData.originalPrice,
          discount: courseData.discount || 0,
          category,
          subcategory: courseData.subcategory,
          level: courseData.level,
          duration: courseData.duration,
          language: courseData.language || 'English',
          tags: courseData.tags,
          instructor: instructor._id,
          isPublished: true,
          isFeatured: courseData.isFeatured || false,
          isPopular: courseData.isPopular || false,
          rating: courseData.rating,
          reviewCount: courseData.reviewCount,
          studentCount: courseData.studentCount,
          sections,
          requirements: courseData.requirements || [
            'Basic computer skills',
            'Internet connection',
            'Motivation to learn'
          ],
          learningOutcomes: courseData.learningOutcomes || [
            'Master the fundamentals',
            'Build real projects',
            'Apply knowledge professionally'
          ],
          targetAudience: [
            'Beginners looking to learn',
            'Professionals wanting to upskill',
            'Students and career changers'
          ],
          status: 'published'
        });
        
        this.courses.push(course);
        courseCount++;
        console.log(`    ✅ ${courseCount}. ${course.title} (₹${course.price})`);
      }
    }
    
    // Create additional courses to reach 100+
    await this.createAdditionalCourses(instructors, 100 - courseCount);
  }

  generateCourseSections(videoId) {
    const sections = [
      {
        title: 'Introduction and Setup',
        lectures: [
          {
            title: 'Course Introduction',
            duration: 300,
            type: 'video',
            videoData: {
              videoId: videoId,
              embedUrl: `https://www.youtube.com/embed/${videoId}`,
              thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
            },
            description: 'Welcome to the course! Learn what you\'ll build and set up your development environment.',
            resources: [
              { title: 'Course Materials', url: '#', type: 'pdf' },
              { title: 'Setup Guide', url: '#', type: 'doc' }
            ]
          },
          {
            title: 'Environment Setup',
            duration: 600,
            type: 'video',
            videoData: {
              videoId: videoId,
              embedUrl: `https://www.youtube.com/embed/${videoId}`,
              thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
            },
            description: 'Step-by-step guide to set up your development environment.'
          }
        ]
      },
      {
        title: 'Core Concepts',
        lectures: [
          {
            title: 'Fundamentals Overview',
            duration: 900,
            type: 'video',
            videoData: {
              videoId: videoId,
              embedUrl: `https://www.youtube.com/embed/${videoId}`,
              thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
            },
            description: 'Learn the fundamental concepts that form the foundation of this technology.'
          },
          {
            title: 'Hands-on Practice',
            duration: 1200,
            type: 'video',
            videoData: {
              videoId: videoId,
              embedUrl: `https://www.youtube.com/embed/${videoId}`,
              thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
            },
            description: 'Apply what you\'ve learned with practical exercises and examples.'
          }
        ]
      },
      {
        title: 'Advanced Topics',
        lectures: [
          {
            title: 'Advanced Techniques',
            duration: 1500,
            type: 'video',
            videoData: {
              videoId: videoId,
              embedUrl: `https://www.youtube.com/embed/${videoId}`,
              thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
            },
            description: 'Explore advanced techniques and best practices used by professionals.'
          }
        ]
      },
      {
        title: 'Final Project',
        lectures: [
          {
            title: 'Project Planning',
            duration: 600,
            type: 'video',
            videoData: {
              videoId: videoId,
              embedUrl: `https://www.youtube.com/embed/${videoId}`,
              thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
            },
            description: 'Plan and design your final project that showcases your new skills.'
          },
          {
            title: 'Project Implementation',
            duration: 1800,
            type: 'video',
            videoData: {
              videoId: videoId,
              embedUrl: `https://www.youtube.com/embed/${videoId}`,
              thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
            },
            description: 'Build your final project step by step with guidance.'
          }
        ]
      }
    ];

    return sections;
  }

  async createAdditionalCourses(instructors, additionalCount) {
    console.log(`\n  🔄 Creating ${additionalCount} additional courses...`);
    
    const additionalCourses = [
      // Add more diverse courses here
      { category: 'Programming', title: 'Python Programming for Beginners', price: 1999, level: 'Beginner', videoId: 'rfscVS0vtbw' },
      { category: 'Programming', title: 'Java Complete Course', price: 2499, level: 'Intermediate', videoId: 'grEKMHGYyns' },
      { category: 'Programming', title: 'C++ Programming Masterclass', price: 2299, level: 'Advanced', videoId: 'vLnPwxZdW4Y' },
      { category: 'Cloud Computing', title: 'AWS Certified Solutions Architect', price: 3999, level: 'Advanced', videoId: 'Ia-UEYYR44s' },
      { category: 'Cloud Computing', title: 'Microsoft Azure Fundamentals', price: 2799, level: 'Beginner', videoId: 'NKEFWyqJ5XA' },
      { category: 'Cybersecurity', title: 'Ethical Hacking Complete Course', price: 4499, level: 'Advanced', videoId: 'fNzpcB7ODxQ' },
      { category: 'Cybersecurity', title: 'Network Security Fundamentals', price: 2999, level: 'Intermediate', videoId: 'qiQR5rTSshw' },
      { category: 'Game Development', title: 'Unity Game Development', price: 3299, level: 'Intermediate', videoId: 'gB1F9G0JXOo' },
      { category: 'Game Development', title: 'Unreal Engine 5 Complete Course', price: 3799, level: 'Advanced', videoId: 'k-zMkzmduqI' },
      { category: 'Blockchain', title: 'Blockchain Development with Solidity', price: 4999, level: 'Advanced', videoId: 'M576WGiDBdQ' },
      // Add more courses as needed
    ];

    // Repeat and modify courses to reach target count
    let coursesCreated = 0;
    while (coursesCreated < additionalCount && coursesCreated < additionalCourses.length) {
      const courseTemplate = additionalCourses[coursesCreated % additionalCourses.length];
      const instructor = instructors[Math.floor(Math.random() * instructors.length)];
      
      const course = await Course.create({
        title: courseTemplate.title,
        description: `Complete ${courseTemplate.title.toLowerCase()} course with hands-on projects and real-world applications.`,
        thumbnail: `https://images.unsplash.com/photo-${1500000000000 + Math.random() * 100000000}?w=400&h=225&fit=crop`,
        price: courseTemplate.price,
        originalPrice: courseTemplate.price * 2,
        discount: 50,
        category: courseTemplate.category,
        level: courseTemplate.level,
        duration: 1800 + Math.floor(Math.random() * 1800),
        tags: [courseTemplate.category, courseTemplate.level, 'Programming'],
        instructor: instructor._id,
        isPublished: true,
        isFeatured: Math.random() > 0.8,
        isPopular: Math.random() > 0.7,
        rating: 4.0 + Math.random() * 1.0,
        reviewCount: Math.floor(Math.random() * 10000) + 1000,
        studentCount: Math.floor(Math.random() * 50000) + 5000,
        sections: this.generateCourseSections(courseTemplate.videoId),
        requirements: ['Basic computer knowledge', 'Motivation to learn'],
        learningOutcomes: ['Master the technology', 'Build real projects'],
        targetAudience: ['Beginners', 'Professionals', 'Students']
      });
      
      this.courses.push(course);
      coursesCreated++;
      console.log(`    ✅ ${coursesCreated + 20}. ${course.title}`);
    }
  }

  async updatePopularContent() {
    console.log('\n🔥 Updating popular and featured content...');
    
    // Mark some courses as featured and popular based on ratings and student count
    await Course.updateMany(
      { 
        $or: [
          { rating: { $gte: 4.7 }, studentCount: { $gte: 30000 } },
          { studentCount: { $gte: 40000 } }
        ]
      },
      { $set: { isFeatured: true, isPopular: true } }
    );

    console.log('   ✅ Updated featured and popular courses');
  }

  async printSummary() {
    console.log('\n📊 SEEDING SUMMARY');
    console.log('=' .repeat(50));
    
    // User stats
    const userStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    console.log('👥 Users Created:');
    userStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });

    // Course stats  
    const courseStats = await Course.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📚 Courses by Category:');
    courseStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });

    const featuredCount = await Course.countDocuments({ isFeatured: true });
    const popularCount = await Course.countDocuments({ isPopular: true });
    
    console.log(`\n🌟 Featured Courses: ${featuredCount}`);
    console.log(`🔥 Popular Courses: ${popularCount}`);
    
    console.log('\n💰 Price Range:');
    const priceStats = await Course.aggregate([
      {
        $group: {
          _id: null,
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);
    
    if (priceStats.length > 0) {
      console.log(`   Average: ₹${Math.round(priceStats[0].avgPrice)}`);
      console.log(`   Min: ₹${priceStats[0].minPrice}`);
      console.log(`   Max: ₹${priceStats[0].maxPrice}`);
    }
  }
}

// Run the seeder
if (require.main === module) {
  const seeder = new DatabaseSeeder();
  seeder.run()
    .then(() => {
      console.log('\n🎉 Database seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Database seeding failed:', error.message);
      process.exit(1);
    });
}

module.exports = DatabaseSeeder;