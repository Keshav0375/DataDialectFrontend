import React, { useState } from 'react';
import { Menu, X, Database, FileText, Server } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#121212]/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#00FF9A] to-[#00FFE5] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold cursive-font text-lg">DD</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-300 hover:bg-gradient-to-r hover:from-[#00FF9A] hover:to-[#00FFE5] hover:bg-clip-text hover:text-transparent"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Access Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors" title="SQL Database">
              <Database size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-green-400 transition-colors" title="Documents">
              <FileText size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-purple-400 transition-colors" title="NoSQL Database">
              <Server size={20} />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-white p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-[#1E1E1E] rounded-lg mt-2 border border-gray-800">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="flex items-center justify-center space-x-6 pt-4 border-t border-gray-700">
                <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors" title="SQL Database">
                  <Database size={20} />
                </button>
                <button className="p-2 text-gray-400 hover:text-green-400 transition-colors" title="Documents">
                  <FileText size={20} />
                </button>
                <button className="p-2 text-gray-400 hover:text-purple-400 transition-colors" title="NoSQL Database">
                  <Server size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;