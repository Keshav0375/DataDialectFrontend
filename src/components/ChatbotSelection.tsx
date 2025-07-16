import React from 'react';
import { Database, FileText, Server } from 'lucide-react';
import { ChatbotType } from '../types';

interface ChatbotSelectionProps {
  onSelect: (type: ChatbotType) => void;
}

const ChatbotSelection: React.FC<ChatbotSelectionProps> = ({ onSelect }) => {
  const chatbots = [
    {
      type: 'sql' as ChatbotType,
      title: 'SQL Database Explorer',
      description: 'Connect to relational databases and query with natural language',
      icon: Database,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      type: 'document' as ChatbotType,
      title: 'Document Intelligence',
      description: 'Upload and analyze documents with AI-powered insights',
      icon: FileText,
      color: 'from-green-500 to-emerald-500',
    },
    {
      type: 'nosql' as ChatbotType,
      title: 'NoSQL Database Navigator',
      description: 'Explore MongoDB and other NoSQL databases intuitively',
      icon: Server,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <section id="features" className="py-20 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 cursive-font">
            <span className="bg-gradient-to-r from-[#00FF9A] to-[#00FFE5] bg-clip-text text-transparent">
              Choose Your Data Companion
            </span>
          </h2>
          <p className="text-gray-300 text-xl md:text-2xl max-w-3xl mx-auto cursive-font font-medium">
            Select the perfect AI assistant for your data exploration needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {chatbots.map((chatbot) => {
            const IconComponent = chatbot.icon;
            return (
              <div
                key={chatbot.type}
                onClick={() => onSelect(chatbot.type)}
                className="group bg-[#1E1E1E] rounded-2xl p-8 cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#252525] border border-gray-800 hover:border-gray-600"
              >
                <div className="mb-6">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${chatbot.color} p-0.5 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full bg-[#1E1E1E] rounded-xl flex items-center justify-center">
                      <IconComponent size={32} className="text-white" />
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 group-hover:bg-gradient-to-r group-hover:from-[#00FF9A] group-hover:to-[#00FFE5] group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  {chatbot.title}
                </h3>

                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  {chatbot.description}
                </p>

                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-sm font-medium bg-gradient-to-r from-[#00FF9A] to-[#00FFE5] bg-clip-text text-transparent">
                    Click to connect →
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ChatbotSelection;