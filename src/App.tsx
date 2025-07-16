import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ChatbotSelection from './components/ChatbotSelection';
import Footer from './components/Footer';
import SQLModal from './components/modals/SQLModal';
import DocumentModal from './components/modals/DocumentModal';
import NoSQLModal from './components/modals/NoSQLModal';
import ChatInterface from './components/ChatInterface';
import ThreeBackground from './components/ThreeBackground';
import { useChat } from './hooks/useChat';
import { ChatbotType, DatabaseConnection, NoSQLConnection, UploadedDocument } from './types';

function App() {
  const [selectedChatbot, setSelectedChatbot] = useState<ChatbotType>(null);
  const [showSQLModal, setShowSQLModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showNoSQLModal, setShowNoSQLModal] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const {
    messages,
    isTyping,
    activeChatbot,
    setActiveChatbot,
    sendMessage,
    clearChat,
  } = useChat();

  const handleChatbotSelect = (type: ChatbotType) => {
    setSelectedChatbot(type);
    
    switch (type) {
      case 'sql':
        setShowSQLModal(true);
        break;
      case 'document':
        setShowDocumentModal(true);
        break;
      case 'nosql':
        setShowNoSQLModal(true);
        break;
    }
  };

  const handleSQLConnect = (connection: DatabaseConnection) => {
    setActiveChatbot('sql');
    setShowChat(true);
    setShowSQLModal(false);
    sendMessage(`Connected to ${connection.databaseName} database successfully!`);
  };

  const handleDocumentUpload = (documents: UploadedDocument[]) => {
    setActiveChatbot('document');
    setShowChat(true);
    setShowDocumentModal(false);
    sendMessage(`Successfully uploaded ${documents.length} document${documents.length > 1 ? 's' : ''}. Ready to analyze!`);
  };

  const handleNoSQLConnect = (connection: NoSQLConnection) => {
    setActiveChatbot('nosql');
    setShowChat(true);
    setShowNoSQLModal(false);
    sendMessage(`Connected to ${connection.databaseName}.${connection.collectionName} successfully!`);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setActiveChatbot(null);
    clearChat();
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white relative">
      <ThreeBackground />
      <Navbar />
      <Hero />
      <ChatbotSelection onSelect={handleChatbotSelect} />
      <Footer />

      <SQLModal
        isOpen={showSQLModal}
        onClose={() => setShowSQLModal(false)}
        onConnect={handleSQLConnect}
      />

      <DocumentModal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        onUpload={handleDocumentUpload}
      />

      <NoSQLModal
        isOpen={showNoSQLModal}
        onClose={() => setShowNoSQLModal(false)}
        onConnect={handleNoSQLConnect}
      />

      <ChatInterface
        isOpen={showChat}
        chatbotType={activeChatbot}
        messages={messages}
        isTyping={isTyping}
        onSendMessage={sendMessage}
        onClose={handleCloseChat}
        onClear={clearChat}
      />
    </div>
  );
}

export default App;