// Course Categories and Domains
export const COURSE_CATEGORIES = [
  {
    "domain": "Development",
    "subdomains": [
      "Web Development",
      "App Development",
      "Frontend Development",
      "Backend Development",
      "Full Stack Development",
      "Game Development",
      "Software Development",
      "API Development",
      "DevOps Development"
    ]
  },
  {
    "domain": "Web Development",
    "subdomains": [
      "HTML & CSS",
      "JavaScript",
      "React.js",
      "Next.js",
      "Angular",
      "Vue.js",
      "Node.js",
      "Express.js",
      "Django",
      "Flask",
      "Svelte",
      "WordPress Development",
      "Shopify Development"
    ]
  },
  {
    "domain": "App Development",
    "subdomains": [
      "Android Development",
      "iOS Development",
      "Flutter",
      "React Native",
      "Swift Development",
      "Kotlin Development",
      "Cross Platform Apps"
    ]
  },
  {
    "domain": "Artificial Intelligence",
    "subdomains": [
      "Machine Learning",
      "Deep Learning",
      "NLP (Language Models)",
      "Computer Vision",
      "Generative AI",
      "Prompt Engineering",
      "AI Tools (ChatGPT, Gemini, Claude)",
      "AI Model Deployment",
      "Reinforcement Learning"
    ]
  },
  {
    "domain": "Data Science",
    "subdomains": [
      "Data Analysis",
      "Data Visualization",
      "Power BI",
      "Tableau",
      "Excel for Data Science",
      "Statistics",
      "Big Data",
      "Data Mining",
      "ETL Processes"
    ]
  },
  {
    "domain": "Programming",
    "subdomains": [
      "Python",
      "Java",
      "C++",
      "C",
      "JavaScript",
      "TypeScript",
      "Rust",
      "Go",
      "PHP",
      "C#",
      "R Programming",
      "SQL"
    ]
  },
  {
    "domain": "Cloud Computing",
    "subdomains": [
      "AWS",
      "Microsoft Azure",
      "Google Cloud Platform",
      "Cloud Architecture",
      "Serverless",
      "Terraform",
      "Cloud Security"
    ]
  },
  {
    "domain": "DevOps",
    "subdomains": [
      "Docker",
      "Kubernetes",
      "CI/CD Pipelines",
      "Jenkins",
      "Git & GitHub",
      "Prometheus",
      "Grafana",
      "Ansible",
      "Infrastructure as Code"
    ]
  },
  {
    "domain": "Cybersecurity",
    "subdomains": [
      "Ethical Hacking",
      "Penetration Testing",
      "Network Security",
      "Application Security",
      "Cloud Security",
      "Bug Bounty",
      "Digital Forensics",
      "Cryptography"
    ]
  },
  {
    "domain": "Networking",
    "subdomains": [
      "Computer Networks",
      "Routing & Switching",
      "Network Automation",
      "Cisco Networking",
      "Firewall & VPN",
      "Network Troubleshooting"
    ]
  },
  {
    "domain": "Databases",
    "subdomains": [
      "MySQL",
      "PostgreSQL",
      "MongoDB",
      "Firebase",
      "Redis",
      "SQL Server",
      "Elasticsearch",
      "Database Design"
    ]
  },
  {
    "domain": "UI/UX Design",
    "subdomains": [
      "Figma",
      "Adobe XD",
      "Wireframing",
      "Prototyping",
      "User Research",
      "Interaction Design",
      "Usability Testing"
    ]
  },
  {
    "domain": "Graphic Design",
    "subdomains": [
      "Photoshop",
      "Illustrator",
      "Canva",
      "Brand Design",
      "Poster Design",
      "Logo Design",
      "Infographic Design"
    ]
  },
  {
    "domain": "Business & Marketing",
    "subdomains": [
      "Digital Marketing",
      "Social Media Marketing",
      "SEO",
      "Facebook Ads",
      "Google Ads",
      "Content Marketing",
      "Affiliate Marketing",
      "E-Commerce Marketing"
    ]
  },
  {
    "domain": "Finance & Accounting",
    "subdomains": [
      "Stock Market",
      "Cryptocurrency",
      "Financial Analysis",
      "Accounting Basics",
      "Taxation",
      "Banking",
      "Insurance"
    ]
  },
  {
    "domain": "Soft Skills",
    "subdomains": [
      "Communication Skills",
      "Public Speaking",
      "Time Management",
      "Leadership Skills",
      "Team Collaboration",
      "Emotional Intelligence"
    ]
  },
  {
    "domain": "Education & Academics",
    "subdomains": [
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "English",
      "Economics",
      "Geography",
      "History",
      "Computer Science"
    ]
  },
  {
    "domain": "Health & Fitness",
    "subdomains": [
      "Yoga",
      "Nutrition",
      "Bodybuilding",
      "Meditation",
      "Mental Health",
      "Home Workouts"
    ]
  },
  {
    "domain": "Music & Audio",
    "subdomains": [
      "Guitar",
      "Piano",
      "Music Production",
      "Singing",
      "Audio Editing",
      "Podcast Creation"
    ]
  },
  {
    "domain": "Photography & Video",
    "subdomains": [
      "Photography",
      "Video Editing",
      "Filmmaking",
      "Drone Photography",
      "YouTube Video Creation"
    ]
  },
  {
    "domain": "Languages",
    "subdomains": [
      "English",
      "Hindi",
      "Spanish",
      "French",
      "German",
      "Japanese",
      "Korean"
    ]
  },
  {
    "domain": "Cooking",
    "subdomains": [
      "Home Cooking",
      "Baking",
      "Healthy Cooking",
      "Indian Cuisine",
      "International Recipes"
    ]
  },
  {
    "domain": "Fashion & Lifestyle",
    "subdomains": [
      "Fashion Design",
      "Makeup",
      "Skin Care",
      "Hair Styling",
      "Interior Design"
    ]
  }
];

// Helper function to get all categories (domains + subdomains) in a flat array
export const getAllCategories = () => {
  const categories = [];
  
  COURSE_CATEGORIES.forEach(category => {
    categories.push(category.domain);
    categories.push(...category.subdomains);
  });
  
  return [...new Set(categories)]; // Remove duplicates
};

// Helper function to get all domains only
export const getDomains = () => {
  return COURSE_CATEGORIES.map(category => category.domain);
};

// Helper function to get subdomains for a specific domain
export const getSubdomains = (domain) => {
  const category = COURSE_CATEGORIES.find(cat => cat.domain === domain);
  return category ? category.subdomains : [];
};

// Helper function to find domain for a given subdomain
export const findDomain = (subdomain) => {
  for (const category of COURSE_CATEGORIES) {
    if (category.subdomains.includes(subdomain)) {
      return category.domain;
    }
  }
  return null;
};