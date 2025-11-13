import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  EnvelopeIcon,
  CodeBracketIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const Team = () => {
  const { isDarkMode } = useTheme();

  const teamMembers = [
    {
      name: 'Zala Kuldip',
      role: 'Founder & Lead Developer',
      image: '/images/team/kuldip.jpg',
      bio: 'Full-stack developer passionate about creating accessible educational platforms. Specialized in React, Node.js, and modern web technologies.',
      email: 'kuldipzala20112005@gmail.com',
      linkedin: 'https://www.linkedin.com/in/kuldip-zala-077bb828a/',
      github: 'https://github.com/zalakuldip2011'
    },
    {
      name: 'Het Soni',
      role: 'UI/UX Designer & Frontend Developer',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      bio: 'Creative designer with a passion for intuitive user experiences. Expert in creating beautiful, accessible interfaces that users love.',
      email: 'sarah@nexed.com',
      linkedin: 'https://linkedin.com/in/sarahmitchell',
      github: 'https://github.com/sarahmitchell'
    },
    {
      name: 'Swayam Shah',
      role: 'Backend Developer & DevOps Engineer',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      bio: 'Infrastructure specialist focused on building scalable, secure systems. Expert in cloud architecture, database optimization, and API design.',
      email: 'david@nexed.com',
      linkedin: 'https://linkedin.com/in/davidchen',
      github: 'https://github.com/davidchen'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Hero Section */}
      <div className={`border-b transition-colors ${
        isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className={`text-5xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Meet Our <span className="text-blue-500">Team</span>
            </h1>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              The passionate individuals behind NexEd, dedicated to transforming education through technology.
            </p>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div 
              key={index}
              className={`rounded-2xl overflow-hidden transition-all hover:scale-105 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg`}
            >
              {/* Member Image */}
              <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <img 
                  src={member.image}
                  alt={member.name}
                  className="w-40 h-40 rounded-full border-4 border-white shadow-xl"
                />
              </div>

              {/* Member Info */}
              <div className="p-8">
                <h3 className={`text-2xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {member.name}
                </h3>
                <p className="text-blue-500 font-semibold mb-4">
                  {member.role}
                </p>
                <p className={`mb-6 leading-relaxed ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {member.bio}
                </p>

                {/* Contact Links */}
                <div className="space-y-3">
                  {/* Email */}
                  <a 
                    href={`mailto:${member.email}`}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <EnvelopeIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">{member.email}</span>
                  </a>

                  {/* LinkedIn */}
                  <a 
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <UserCircleIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">LinkedIn Profile</span>
                  </a>

                  {/* GitHub */}
                  <a 
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <CodeBracketIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">GitHub Profile</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Join Our Team Section */}
        <div className={`mt-20 p-12 rounded-3xl text-center ${
          isDarkMode 
            ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-gray-800' 
            : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200'
        }`}>
          <h2 className={`text-3xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Want to Join Our Team?
          </h2>
          <p className={`text-lg max-w-3xl mx-auto mb-8 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            We're always looking for talented, passionate individuals who share our vision of making education accessible to everyone. 
            If you're excited about the future of online learning, we'd love to hear from you!
          </p>
          <a 
            href="mailto:careers@nexed.com"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <EnvelopeIcon className="h-6 w-6 mr-2" />
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  );
};

export default Team;
