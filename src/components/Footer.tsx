import React from 'react';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  const footerLinks = {
    Product: ['Features', 'Documentation'],
    Company: ['About', 'Contact'],
    Legal: ['Privacy', 'Terms', 'Security', 'Cookies'],
  };

  return (
    <footer className="bg-[#0A0A0A] border-t border-gray-800 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#00FF9A] to-[#00FFE5] rounded-xl flex items-center justify-center">
                <span className="text-black font-bold cursive-font text-xl">DD</span>
              </div>
              <span className="text-2xl font-bold cursive-font bg-gradient-to-r from-[#00FF9A] to-[#00FFE5] bg-clip-text text-transparent">
                Data Dialect
              </span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed cursive-font text-lg">
              Revolutionizing data interaction through intelligent conversational interfaces. 
              Transform complex queries into natural conversations.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 bg-[#1E1E1E] rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-[#00FF9A] hover:to-[#00FFE5] hover:text-black transition-all duration-300"
                    aria-label={social.label}
                  >
                    <IconComponent size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4 cursive-font text-lg">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors duration-300 hover:bg-gradient-to-r hover:from-[#00FF9A] hover:to-[#00FFE5] hover:bg-clip-text hover:text-transparent"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md mx-auto text-center lg:max-w-none lg:text-left lg:flex lg:items-center lg:justify-between">
            <div className="lg:flex-1">
              <h3 className="text-xl font-bold text-white mb-2 cursive-font">
                Stay Updated
              </h3>
              <p className="text-gray-400 cursive-font text-lg">
                Get the latest updates on new features and data insights.
              </p>
            </div>
            <div className="mt-6 lg:mt-0 lg:ml-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-3 bg-[#1E1E1E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors flex-1"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-[#00FF9A] to-[#00FFE5] text-black rounded-lg font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm flex items-center gap-1">
            © {currentYear} Data Dialect. Made with <Heart size={16} className="text-red-500" /> for data enthusiasts.
          </p>
          <div className="mt-4 md:mt-0 flex items-center space-x-6">
            <span className="text-gray-400 text-sm">Powered by AI</span>
            <div className="w-2 h-2 bg-gradient-to-r from-[#00FF9A] to-[#00FFE5] rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;