require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');

const mockCourses = [
  {
    title: "Complete Web Development Bootcamp 2024",
    subtitle: "From Zero to Full-Stack Developer - HTML, CSS, JavaScript, React, Node.js, MongoDB",
    description: "Master web development from scratch! This comprehensive bootcamp covers everything you need to become a professional full-stack web developer. Learn HTML5, CSS3, JavaScript ES6+, React.js, Node.js, Express, MongoDB, and modern development tools. Build real-world projects including a portfolio website, e-commerce platform, and social media application. Perfect for beginners with no prior coding experience.",
    category: "Web Development",
    subcategory: "Full Stack",
    level: "Beginner",
    language: "English",
    price: 2499,
    originalPrice: 4999,
    discount: 50,
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
    learningOutcomes: [
      "Build responsive websites using HTML5 and CSS3",
      "Master JavaScript ES6+ and modern programming concepts",
      "Create dynamic web applications with React.js",
      "Build RESTful APIs with Node.js and Express",
      "Work with MongoDB and database design",
      "Deploy full-stack applications to production"
    ],
    requirements: [
      "A computer with internet connection",
      "No programming experience required",
      "Passion to learn web development"
    ],
    tags: ["web development", "javascript", "react", "node.js", "full stack", "html", "css"],
    sections: [
      {
        title: "Introduction to Web Development",
        description: "Get started with the fundamentals of web development",
        order: 0,
        lectures: [
          {
            title: "Course Introduction and Roadmap",
            description: "Overview of what you'll learn in this bootcamp",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=Nu3AunKa1A8",
              videoId: "Nu3AunKa1A8",
              embedUrl: "https://www.youtube.com/embed/Nu3AunKa1A8",
              thumbnailUrl: "https://img.youtube.com/vi/Nu3AunKa1A8/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=Nu3AunKa1A8"
            },
            duration: 15,
            isPreview: true,
            order: 0
          },
          {
            title: "Setting Up Your Development Environment",
            description: "Install VS Code, Node.js, and essential tools",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=SWYqp7iY_Tc",
              videoId: "SWYqp7iY_Tc",
              embedUrl: "https://www.youtube.com/embed/SWYqp7iY_Tc",
              thumbnailUrl: "https://img.youtube.com/vi/SWYqp7iY_Tc/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=SWYqp7iY_Tc"
            },
            duration: 20,
            isPreview: true,
            order: 1
          }
        ]
      },
      {
        title: "HTML5 Fundamentals",
        description: "Learn the building blocks of web pages",
        order: 1,
        lectures: [
          {
            title: "HTML5 Complete Tutorial",
            description: "Master HTML5 from basics to advanced",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=pQN-pnXPaVg",
              videoId: "pQN-pnXPaVg",
              embedUrl: "https://www.youtube.com/embed/pQN-pnXPaVg",
              thumbnailUrl: "https://img.youtube.com/vi/pQN-pnXPaVg/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=pQN-pnXPaVg"
            },
            duration: 120,
            order: 0
          }
        ]
      },
      {
        title: "CSS3 & Responsive Design",
        description: "Style your websites and make them responsive",
        order: 2,
        lectures: [
          {
            title: "CSS3 Full Course",
            description: "Complete CSS tutorial for beginners",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
              videoId: "1Rs2ND1ryYc",
              embedUrl: "https://www.youtube.com/embed/1Rs2ND1ryYc",
              thumbnailUrl: "https://img.youtube.com/vi/1Rs2ND1ryYc/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=1Rs2ND1ryYc"
            },
            duration: 180,
            order: 0
          }
        ]
      },
      {
        title: "JavaScript Essentials",
        description: "Learn programming with JavaScript",
        order: 3,
        lectures: [
          {
            title: "JavaScript Full Course",
            description: "Master JavaScript from scratch",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=8dWL3wF_OMw",
              videoId: "8dWL3wF_OMw",
              embedUrl: "https://www.youtube.com/embed/8dWL3wF_OMw",
              thumbnailUrl: "https://img.youtube.com/vi/8dWL3wF_OMw/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=8dWL3wF_OMw"
            },
            duration: 240,
            order: 0
          }
        ]
      }
    ],
    status: "published",
    isPublished: true
  },
  {
    title: "Python for Data Science and Machine Learning",
    subtitle: "Complete Python, NumPy, Pandas, Matplotlib, Scikit-Learn & Machine Learning",
    description: "Become a Data Scientist with Python! Learn Python programming, data analysis, visualization, and machine learning. Master NumPy for numerical computing, Pandas for data manipulation, Matplotlib and Seaborn for visualization, and Scikit-Learn for machine learning. Work on real-world projects including predictive analytics, data visualization dashboards, and ML models. Includes datasets and Jupyter notebooks.",
    category: "Data Science",
    subcategory: "Machine Learning",
    level: "Intermediate",
    language: "English",
    price: 0,
    discount: 0,
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    learningOutcomes: [
      "Master Python programming for data science",
      "Perform data analysis with Pandas and NumPy",
      "Create stunning visualizations with Matplotlib and Seaborn",
      "Build machine learning models with Scikit-Learn",
      "Work with real-world datasets",
      "Deploy ML models in production"
    ],
    requirements: [
      "Basic programming knowledge helpful but not required",
      "Computer with Python 3.x installed",
      "Desire to learn data science"
    ],
    tags: ["python", "data science", "machine learning", "pandas", "numpy", "ai"],
    sections: [
      {
        title: "Python Fundamentals",
        description: "Get started with Python programming",
        order: 0,
        lectures: [
          {
            title: "Python Tutorial for Beginners",
            description: "Complete Python course from basics",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
              videoId: "rfscVS0vtbw",
              embedUrl: "https://www.youtube.com/embed/rfscVS0vtbw",
              thumbnailUrl: "https://img.youtube.com/vi/rfscVS0vtbw/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=rfscVS0vtbw"
            },
            duration: 270,
            isPreview: true,
            order: 0
          }
        ]
      },
      {
        title: "Data Analysis with Pandas",
        description: "Master data manipulation and analysis",
        order: 1,
        lectures: [
          {
            title: "Pandas Complete Tutorial",
            description: "Learn Pandas for data analysis",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=vmEHCJofslg",
              videoId: "vmEHCJofslg",
              embedUrl: "https://www.youtube.com/embed/vmEHCJofslg",
              thumbnailUrl: "https://img.youtube.com/vi/vmEHCJofslg/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=vmEHCJofslg"
            },
            duration: 60,
            order: 0
          }
        ]
      },
      {
        title: "Machine Learning Fundamentals",
        description: "Introduction to machine learning concepts",
        order: 2,
        lectures: [
          {
            title: "Machine Learning Course for Beginners",
            description: "Complete ML tutorial",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=NWONeJKn6kc",
              videoId: "NWONeJKn6kc",
              embedUrl: "https://www.youtube.com/embed/NWONeJKn6kc",
              thumbnailUrl: "https://img.youtube.com/vi/NWONeJKn6kc/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=NWONeJKn6kc"
            },
            duration: 200,
            order: 0
          }
        ]
      }
    ],
    status: "published",
    isPublished: true
  },
  {
    title: "React JS - Complete Guide 2024",
    subtitle: "Master React with Hooks, Context API, Redux, Next.js and TypeScript",
    description: "Become a React expert! This course covers React from basics to advanced concepts including Hooks (useState, useEffect, useContext, useReducer), Context API, Redux for state management, React Router, form handling, API integration, authentication, and Next.js for server-side rendering. Build production-ready applications with modern React practices and TypeScript.",
    category: "Web Development",
    subcategory: "Frontend",
    level: "Intermediate",
    language: "English",
    price: 1999,
    originalPrice: 3999,
    discount: 50,
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
    learningOutcomes: [
      "Master React fundamentals and advanced concepts",
      "Build complex UIs with React Hooks",
      "Manage application state with Redux",
      "Create server-rendered apps with Next.js",
      "Implement authentication and authorization",
      "Deploy React applications"
    ],
    requirements: [
      "HTML, CSS, and JavaScript knowledge",
      "Understanding of ES6+ features",
      "Basic programming concepts"
    ],
    tags: ["react", "javascript", "frontend", "redux", "nextjs", "hooks"],
    sections: [
      {
        title: "React Fundamentals",
        description: "Learn React from scratch",
        order: 0,
        lectures: [
          {
            title: "React JS Full Course",
            description: "Complete React tutorial for beginners",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=bMknfKXIFA8",
              videoId: "bMknfKXIFA8",
              embedUrl: "https://www.youtube.com/embed/bMknfKXIFA8",
              thumbnailUrl: "https://img.youtube.com/vi/bMknfKXIFA8/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8"
            },
            duration: 240,
            isPreview: true,
            order: 0
          }
        ]
      },
      {
        title: "React Hooks Deep Dive",
        description: "Master all React Hooks",
        order: 1,
        lectures: [
          {
            title: "React Hooks Tutorial",
            description: "Complete guide to React Hooks",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=O6P86uwfdR0",
              videoId: "O6P86uwfdR0",
              embedUrl: "https://www.youtube.com/embed/O6P86uwfdR0",
              thumbnailUrl: "https://img.youtube.com/vi/O6P86uwfdR0/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=O6P86uwfdR0"
            },
            duration: 90,
            order: 0
          }
        ]
      }
    ],
    status: "published",
    isPublished: true
  },
  {
    title: "Digital Marketing Masterclass 2024",
    subtitle: "SEO, Social Media Marketing, Email Marketing, Content Marketing & Google Ads",
    description: "Master digital marketing and grow your business online! Learn SEO strategies, social media marketing (Facebook, Instagram, LinkedIn, Twitter), Google Ads, email marketing automation, content marketing, analytics, and conversion optimization. Real case studies and practical projects included. Perfect for entrepreneurs, marketers, and business owners.",
    category: "Marketing",
    subcategory: "Digital Marketing",
    level: "Beginner",
    language: "English",
    price: 1499,
    originalPrice: 2999,
    discount: 50,
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    learningOutcomes: [
      "Master SEO and rank websites on Google",
      "Create effective social media campaigns",
      "Run profitable Google Ads campaigns",
      "Build email marketing funnels",
      "Analyze marketing data and ROI",
      "Create content marketing strategies"
    ],
    requirements: [
      "No prior marketing experience needed",
      "Access to social media platforms",
      "Willingness to learn and practice"
    ],
    tags: ["digital marketing", "seo", "social media", "google ads", "marketing", "business"],
    sections: [
      {
        title: "Digital Marketing Fundamentals",
        description: "Introduction to digital marketing",
        order: 0,
        lectures: [
          {
            title: "Digital Marketing Course for Beginners",
            description: "Complete digital marketing overview",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=nU-IIXBWlS4",
              videoId: "nU-IIXBWlS4",
              embedUrl: "https://www.youtube.com/embed/nU-IIXBWlS4",
              thumbnailUrl: "https://img.youtube.com/vi/nU-IIXBWlS4/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=nU-IIXBWlS4"
            },
            duration: 180,
            isPreview: true,
            order: 0
          }
        ]
      },
      {
        title: "SEO Mastery",
        description: "Search engine optimization strategies",
        order: 1,
        lectures: [
          {
            title: "SEO Tutorial for Beginners",
            description: "Complete SEO course",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=DvwS7cV9GmQ",
              videoId: "DvwS7cV9GmQ",
              embedUrl: "https://www.youtube.com/embed/DvwS7cV9GmQ",
              thumbnailUrl: "https://img.youtube.com/vi/DvwS7cV9GmQ/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=DvwS7cV9GmQ"
            },
            duration: 120,
            order: 0
          }
        ]
      }
    ],
    status: "published",
    isPublished: true
  },
  {
    title: "UI/UX Design Complete Course",
    subtitle: "Figma, Adobe XD, User Research, Wireframing, Prototyping & Design Systems",
    description: "Become a professional UI/UX designer! Learn user research, wireframing, prototyping, visual design, interaction design, and usability testing. Master Figma and Adobe XD. Understand design principles, color theory, typography, and accessibility. Build a professional portfolio with real projects including mobile apps and websites.",
    category: "Design",
    subcategory: "UI/UX",
    level: "Beginner",
    language: "English",
    price: 0,
    discount: 0,
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
    learningOutcomes: [
      "Master UI/UX design principles",
      "Create wireframes and prototypes",
      "Design with Figma and Adobe XD",
      "Conduct user research and testing",
      "Build design systems",
      "Create portfolio-ready projects"
    ],
    requirements: [
      "No design experience needed",
      "Computer with design software",
      "Creative mindset"
    ],
    tags: ["ui design", "ux design", "figma", "design", "user experience", "prototyping"],
    sections: [
      {
        title: "UI/UX Design Fundamentals",
        description: "Introduction to UI/UX design",
        order: 0,
        lectures: [
          {
            title: "UI/UX Design Tutorial",
            description: "Complete guide to UI/UX design",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=c9Wg6Cb_YlU",
              videoId: "c9Wg6Cb_YlU",
              embedUrl: "https://www.youtube.com/embed/c9Wg6Cb_YlU",
              thumbnailUrl: "https://img.youtube.com/vi/c9Wg6Cb_YlU/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=c9Wg6Cb_YlU"
            },
            duration: 150,
            isPreview: true,
            order: 0
          }
        ]
      },
      {
        title: "Figma Mastery",
        description: "Learn professional design with Figma",
        order: 1,
        lectures: [
          {
            title: "Figma Tutorial for Beginners",
            description: "Complete Figma course",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=FTFaQWZBqQ8",
              videoId: "FTFaQWZBqQ8",
              embedUrl: "https://www.youtube.com/embed/FTFaQWZBqQ8",
              thumbnailUrl: "https://img.youtube.com/vi/FTFaQWZBqQ8/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=FTFaQWZBqQ8"
            },
            duration: 90,
            order: 0
          }
        ]
      }
    ],
    status: "published",
    isPublished: true
  },
  {
    title: "AWS Cloud Practitioner Complete Course",
    subtitle: "Amazon Web Services, EC2, S3, Lambda, RDS, CloudFormation & DevOps",
    description: "Master Amazon Web Services from scratch! Learn cloud computing fundamentals, EC2 instances, S3 storage, Lambda serverless functions, RDS databases, VPC networking, IAM security, CloudFormation infrastructure as code, and DevOps practices. Prepare for AWS Certified Cloud Practitioner certification. Includes hands-on labs and real-world projects.",
    category: "Technology",
    subcategory: "Cloud Computing",
    level: "Beginner",
    language: "English",
    price: 2999,
    originalPrice: 5999,
    discount: 50,
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
    learningOutcomes: [
      "Understand AWS cloud computing fundamentals",
      "Deploy and manage EC2 instances",
      "Store and retrieve data with S3",
      "Build serverless applications with Lambda",
      "Secure AWS resources with IAM",
      "Prepare for AWS certification"
    ],
    requirements: [
      "Basic IT knowledge helpful",
      "No AWS experience required",
      "AWS free tier account (free)"
    ],
    tags: ["aws", "cloud computing", "devops", "amazon web services", "cloud", "serverless"],
    sections: [
      {
        title: "AWS Fundamentals",
        description: "Introduction to AWS cloud services",
        order: 0,
        lectures: [
          {
            title: "AWS Tutorial for Beginners",
            description: "Complete AWS cloud practitioner course",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=3hLmDS179YE",
              videoId: "3hLmDS179YE",
              embedUrl: "https://www.youtube.com/embed/3hLmDS179YE",
              thumbnailUrl: "https://img.youtube.com/vi/3hLmDS179YE/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=3hLmDS179YE"
            },
            duration: 240,
            isPreview: true,
            order: 0
          }
        ]
      },
      {
        title: "EC2 and Computing Services",
        description: "Master AWS compute services",
        order: 1,
        lectures: [
          {
            title: "AWS EC2 Complete Guide",
            description: "Learn EC2 instances and computing",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=8TlukLu11Yo",
              videoId: "8TlukLu11Yo",
              embedUrl: "https://www.youtube.com/embed/8TlukLu11Yo",
              thumbnailUrl: "https://img.youtube.com/vi/8TlukLu11Yo/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=8TlukLu11Yo"
            },
            duration: 45,
            order: 0
          }
        ]
      }
    ],
    status: "published",
    isPublished: true
  },
  {
    title: "Photography Masterclass: Complete Guide",
    subtitle: "DSLR, Mirrorless, Composition, Lighting, Editing & Professional Photography",
    description: "Become a professional photographer! Learn camera settings (aperture, shutter speed, ISO), composition techniques, lighting (natural and studio), portrait photography, landscape photography, street photography, and photo editing with Adobe Lightroom and Photoshop. Suitable for all camera types. Build your photography portfolio and start your photography business.",
    category: "Photography",
    subcategory: "General Photography",
    level: "All Levels",
    language: "English",
    price: 1799,
    originalPrice: 3499,
    discount: 48,
    thumbnail: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800",
    learningOutcomes: [
      "Master camera settings and techniques",
      "Understand composition and framing",
      "Work with natural and artificial lighting",
      "Edit photos professionally",
      "Shoot various photography genres",
      "Build a photography portfolio"
    ],
    requirements: [
      "Any camera (DSLR, mirrorless, or smartphone)",
      "No prior photography experience needed",
      "Passion for photography"
    ],
    tags: ["photography", "dslr", "camera", "photo editing", "lightroom", "portraits"],
    sections: [
      {
        title: "Photography Fundamentals",
        description: "Camera basics and settings",
        order: 0,
        lectures: [
          {
            title: "Photography Tutorial for Beginners",
            description: "Complete photography basics course",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=LxO-6rlihSg",
              videoId: "LxO-6rlihSg",
              embedUrl: "https://www.youtube.com/embed/LxO-6rlihSg",
              thumbnailUrl: "https://img.youtube.com/vi/LxO-6rlihSg/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=LxO-6rlihSg"
            },
            duration: 90,
            isPreview: true,
            order: 0
          }
        ]
      },
      {
        title: "Portrait Photography",
        description: "Master portrait photography techniques",
        order: 1,
        lectures: [
          {
            title: "Portrait Photography Guide",
            description: "Professional portrait techniques",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=EygRSpiLEAU",
              videoId: "EygRSpiLEAU",
              embedUrl: "https://www.youtube.com/embed/EygRSpiLEAU",
              thumbnailUrl: "https://img.youtube.com/vi/EygRSpiLEAU/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=EygRSpiLEAU"
            },
            duration: 60,
            order: 0
          }
        ]
      }
    ],
    status: "published",
    isPublished: true
  },
  {
    title: "Node.js & Express.js - Complete Backend Development",
    subtitle: "Build RESTful APIs, Authentication, Databases, Microservices & Deploy to Cloud",
    description: "Master backend development with Node.js and Express! Learn to build scalable RESTful APIs, implement authentication (JWT, OAuth), work with MongoDB and PostgreSQL, handle file uploads, create microservices architecture, write tests, and deploy to AWS/Heroku. Includes real-world projects: e-commerce API, social media backend, and chat application.",
    category: "Programming",
    subcategory: "Backend",
    level: "Intermediate",
    language: "English",
    price: 0,
    discount: 0,
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
    learningOutcomes: [
      "Build RESTful APIs with Express.js",
      "Implement authentication and authorization",
      "Work with databases (MongoDB, PostgreSQL)",
      "Create microservices architecture",
      "Write automated tests",
      "Deploy Node.js applications"
    ],
    requirements: [
      "JavaScript fundamentals",
      "Basic understanding of web development",
      "Node.js installed on computer"
    ],
    tags: ["nodejs", "express", "backend", "api", "javascript", "mongodb"],
    sections: [
      {
        title: "Node.js Fundamentals",
        description: "Learn Node.js from scratch",
        order: 0,
        lectures: [
          {
            title: "Node.js Full Course",
            description: "Complete Node.js tutorial for beginners",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=Oe421EPjeBE",
              videoId: "Oe421EPjeBE",
              embedUrl: "https://www.youtube.com/embed/Oe421EPjeBE",
              thumbnailUrl: "https://img.youtube.com/vi/Oe421EPjeBE/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=Oe421EPjeBE"
            },
            duration: 210,
            isPreview: true,
            order: 0
          }
        ]
      },
      {
        title: "Express.js & REST APIs",
        description: "Build RESTful APIs with Express",
        order: 1,
        lectures: [
          {
            title: "Express.js Tutorial",
            description: "Complete Express.js course",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=SccSCuHhOw0",
              videoId: "SccSCuHhOw0",
              embedUrl: "https://www.youtube.com/embed/SccSCuHhOw0",
              thumbnailUrl: "https://img.youtube.com/vi/SccSCuHhOw0/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=SccSCuHhOw0"
            },
            duration: 120,
            order: 0
          }
        ]
      }
    ],
    status: "published",
    isPublished: true
  },
  {
    title: "English Grammar & Communication Skills",
    subtitle: "Master English: Grammar, Vocabulary, Speaking, Writing & Business English",
    description: "Improve your English language skills! This comprehensive course covers English grammar rules, vocabulary building, pronunciation, speaking fluency, writing skills, and business English communication. Perfect for beginners to advanced learners. Includes practice exercises, conversations, and real-life scenarios. Prepare for IELTS, TOEFL, or professional communication.",
    category: "Language",
    subcategory: "English",
    level: "All Levels",
    language: "English",
    price: 999,
    originalPrice: 1999,
    discount: 50,
    thumbnail: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800",
    learningOutcomes: [
      "Master English grammar rules",
      "Build strong vocabulary",
      "Improve speaking fluency",
      "Write professional emails and documents",
      "Understand business English",
      "Prepare for English proficiency tests"
    ],
    requirements: [
      "Basic English knowledge helpful",
      "Willingness to practice regularly",
      "No specific prerequisites"
    ],
    tags: ["english", "language", "grammar", "communication", "speaking", "ielts"],
    sections: [
      {
        title: "English Grammar Fundamentals",
        description: "Master essential grammar rules",
        order: 0,
        lectures: [
          {
            title: "English Grammar Course",
            description: "Complete grammar tutorial",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=HkwBFdPcBjQ",
              videoId: "HkwBFdPcBjQ",
              embedUrl: "https://www.youtube.com/embed/HkwBFdPcBjQ",
              thumbnailUrl: "https://img.youtube.com/vi/HkwBFdPcBjQ/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=HkwBFdPcBjQ"
            },
            duration: 120,
            isPreview: true,
            order: 0
          }
        ]
      },
      {
        title: "Speaking & Conversation",
        description: "Improve your speaking skills",
        order: 1,
        lectures: [
          {
            title: "English Speaking Practice",
            description: "Conversation practice for fluency",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=QD6RKM9FvF4",
              videoId: "QD6RKM9FvF4",
              embedUrl: "https://www.youtube.com/embed/QD6RKM9FvF4",
              thumbnailUrl: "https://img.youtube.com/vi/QD6RKM9FvF4/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=QD6RKM9FvF4"
            },
            duration: 90,
            order: 0
          }
        ]
      }
    ],
    status: "published",
    isPublished: true
  },
  {
    title: "Personal Development & Productivity Mastery",
    subtitle: "Goal Setting, Time Management, Habits, Mindfulness & Success Strategies",
    description: "Transform your life with personal development! Learn goal setting frameworks (SMART, OKR), time management techniques (Pomodoro, Time Blocking), habit formation science, productivity systems (GTD, Eisenhower Matrix), mindfulness practices, emotional intelligence, and success principles. Includes worksheets, templates, and action plans. Build the life you want!",
    category: "Personal Development",
    subcategory: "Productivity",
    level: "All Levels",
    language: "English",
    price: 1299,
    originalPrice: 2599,
    discount: 50,
    thumbnail: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
    learningOutcomes: [
      "Set and achieve meaningful goals",
      "Master time management techniques",
      "Build positive habits and break bad ones",
      "Increase productivity and focus",
      "Develop emotional intelligence",
      "Create a personalized success system"
    ],
    requirements: [
      "Open mind and willingness to change",
      "Commitment to personal growth",
      "No specific prerequisites"
    ],
    tags: ["productivity", "personal development", "time management", "goals", "habits", "success"],
    sections: [
      {
        title: "Goal Setting & Achievement",
        description: "Learn to set and achieve goals",
        order: 0,
        lectures: [
          {
            title: "How to Set and Achieve Goals",
            description: "Complete goal setting framework",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=1-SvuFIQjK8",
              videoId: "1-SvuFIQjK8",
              embedUrl: "https://www.youtube.com/embed/1-SvuFIQjK8",
              thumbnailUrl: "https://img.youtube.com/vi/1-SvuFIQjK8/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=1-SvuFIQjK8"
            },
            duration: 15,
            isPreview: true,
            order: 0
          }
        ]
      },
      {
        title: "Productivity Systems",
        description: "Master productivity techniques",
        order: 1,
        lectures: [
          {
            title: "Productivity Masterclass",
            description: "Time management and productivity",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=8N0vGmOZMko",
              videoId: "8N0vGmOZMko",
              embedUrl: "https://www.youtube.com/embed/8N0vGmOZMko",
              thumbnailUrl: "https://img.youtube.com/vi/8N0vGmOZMko/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=8N0vGmOZMko"
            },
            duration: 45,
            order: 0
          }
        ]
      },
      {
        title: "Habit Formation",
        description: "Build lasting positive habits",
        order: 2,
        lectures: [
          {
            title: "The Science of Habit Formation",
            description: "How to build and break habits",
            type: "video",
            videoData: {
              url: "https://www.youtube.com/watch?v=W1eYrhGeffc",
              videoId: "W1eYrhGeffc",
              embedUrl: "https://www.youtube.com/embed/W1eYrhGeffc",
              thumbnailUrl: "https://img.youtube.com/vi/W1eYrhGeffc/maxresdefault.jpg",
              watchUrl: "https://www.youtube.com/watch?v=W1eYrhGeffc"
            },
            duration: 30,
            order: 0
          }
        ]
      }
    ],
    status: "published",
    isPublished: true
  }
];

async function seedCourses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexed', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // Find an instructor user (or create one if needed)
    let instructor = await User.findOne({ role: 'instructor' });
    
    if (!instructor) {
      console.log('⚠️  No instructor found. Looking for any user...');
      instructor = await User.findOne();
      
      if (!instructor) {
        console.log('❌ No users found in database. Please create a user first.');
        console.log('💡 You can run: node backend/scripts/makeInstructor.js <email>');
        process.exit(1);
      }
      
      // Make the user an instructor
      instructor.role = 'instructor';
      instructor.isInstructor = true;
      instructor.instructorProfile = {
        bio: 'Experienced educator and course creator',
        expertise: ['Web Development', 'Programming', 'Technology'],
        experience: 'Over 10 years of teaching experience',
        education: 'Master\'s in Computer Science',
        socialLinks: {
          website: 'https://example.com',
          linkedin: 'https://linkedin.com/in/example'
        }
      };
      await instructor.save();
      console.log(`✅ Made ${instructor.email} an instructor`);
    }

    console.log(`📚 Using instructor: ${instructor.email}`);

    // Delete existing courses (optional - comment out if you want to keep existing courses)
    const existingCount = await Course.countDocuments();
    if (existingCount > 0) {
      console.log(`🗑️  Found ${existingCount} existing courses. Deleting...`);
      await Course.deleteMany({});
      console.log('✅ Deleted existing courses');
    }

    // Add instructor ID to all courses and calculate totals
    const coursesWithInstructor = mockCourses.map(course => {
      const courseData = {
        ...course,
        instructor: instructor._id
      };
      
      // Calculate totals
      let totalDuration = 0;
      let totalLectures = 0;
      
      courseData.sections.forEach(section => {
        section.lectures.forEach(lecture => {
          totalDuration += lecture.duration || 0;
          totalLectures += 1;
        });
      });
      
      courseData.totalDuration = totalDuration * 60; // Convert to seconds
      courseData.totalLectures = totalLectures;
      courseData.publishedAt = new Date();
      
      return courseData;
    });

    // Insert courses
    const insertedCourses = await Course.insertMany(coursesWithInstructor);
    
    console.log(`\n✅ Successfully seeded ${insertedCourses.length} courses!`);
    console.log('\n📊 Course Summary:');
    insertedCourses.forEach((course, index) => {
      const priceDisplay = course.price === 0 ? 'FREE' : `₹${course.price}`;
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   Category: ${course.category} | Level: ${course.level}`);
      console.log(`   Price: ${priceDisplay} | Lectures: ${course.totalLectures} | Duration: ${Math.floor(course.totalDuration / 60)} min`);
      console.log(`   ID: ${course._id}\n`);
    });

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    process.exit(1);
  }
}

// Run the seed function
seedCourses();
