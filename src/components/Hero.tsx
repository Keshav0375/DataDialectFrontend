import React from 'react';
import { ChevronDown } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section id="home" className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden pt-16">
      {/* Main content */}
      <div className="text-center z-10 px-4">
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-bold mb-6 animate-float cursive-font leading-none">
            <span className="bg-gradient-to-r from-[#00FF9A] to-[#00FFE5] bg-clip-text text-transparent">
              Data Dialect
            </span>
          </h1>
          <p className="text-2xl md:text-3xl lg:text-4xl text-gray-300 max-w-4xl mx-auto leading-relaxed cursive-font font-medium">
            Converse with your data through intelligent chatbot interfaces
          </p>
        </div>

        {/* Floating logo animation */}
        <div className="mb-16">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00FF9A] to-[#00FFE5] rounded-xl animate-spin-slow opacity-20"></div>
            <div className="absolute inset-1 bg-[#1E1E1E] rounded-lg flex items-center justify-center">
              <span className="text-3xl font-bold bg-gradient-to-r from-[#00FF9A] to-[#00FFE5] bg-clip-text text-transparent cursive-font">
                DD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 animate-bounce">
        <div className="flex flex-col items-center text-gray-400">
          <span className="text-sm mb-2 cursive-font">Explore</span>
          <ChevronDown size={24} />
        </div>
      </div>
    </section>
  );
};

export default Hero;