import React, { useState, useRef, useEffect } from 'react';
import { Send, Minimize2, Maximize2, X, History, Download, Trash2, Code, AlertCircle } from 'lucide-react';
import { ChatMessage, ChatbotType, NoSQLConnection } from '../types';
import { useSQLChat } from '../hooks/useSQLChat';
import { useNoSQLChat } from '../hooks/useNoSQLChat';
import { useDocumentChat } from '../hooks/useDocumentChat';

interface ChatInterfaceProps {
  isOpen: boolean;
  chatbotType: ChatbotType;
  messages?: ChatMessage[];
  isTyping?: boolean;
  onSendMessage?: (message: string) => void;
  onClose: () => void;
  onClear?: () => void;
  uploadId?: string; // For SQL chatbot
  noSQLConnection?: NoSQLConnection; // For NoSQL chatbot
  uploadedDocuments?: any[];
}


const ChatInterface: React.FC<ChatInterfaceProps> = ({
  isOpen,
  chatbotType,
  messages: externalMessages = [],
  isTyping: externalIsTyping = false,
  onSendMessage: externalOnSendMessage,
  onClose,
  onClear: externalOnClear,
  uploadId,
  noSQLConnection,
  uploadedDocuments,
}) => {
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isUsingSQLChat = chatbotType === 'sql' && uploadId;
  const isUsingNoSQLChat = chatbotType === 'nosql' && noSQLConnection?.isAuthenticated;
  const isUsingDocumentChat = chatbotType === 'document' && uploadedDocuments && uploadedDocuments.length > 0;

  // Use appropriate chat hook based on chatbot type
  const sqlChat = useSQLChat({ 
    uploadId: chatbotType === 'sql' ? uploadId || null : null 
  });

  const noSQLChat = useNoSQLChat({
    connection: chatbotType === 'nosql' ? noSQLConnection || null : null
  });

  const documentChat = useDocumentChat({
    documents: chatbotType === 'document' ? uploadedDocuments : undefined
  });

  // Determine which chat system to use
  const isUsingDocumentChat = chatbotType === 'document' && uploadedDocuments && uploadedDocuments.length > 0;

  const messages = isUsingSQLChat ? sqlChat.messages : 
                  isUsingNoSQLChat ? noSQLChat.messages : 
                  isUsingDocumentChat ? documentChat.messages :
                  externalMessages;

  const isTyping = isUsingSQLChat ? sqlChat.isTyping : 
                  isUsingNoSQLChat ? noSQLChat.isTyping : 
                  isUsingDocumentChat ? documentChat.isTyping :
                  externalIsTyping;

  const error = isUsingSQLChat ? sqlChat.error : 
                isUsingNoSQLChat ? noSQLChat.error : 
                isUsingDocumentChat ? documentChat.error :
                null;

  // Initialize chats when opened
  useEffect(() => {
  if (isOpen) {
    if (isUsingSQLChat) {
      sqlChat.initializeChat();
    } else if (isUsingNoSQLChat) {
      noSQLChat.initializeChat();
    } else if (isUsingDocumentChat) {
      documentChat.initializeChat();
    }
  }
  }, [isUsingSQLChat, isUsingNoSQLChat, isUsingDocumentChat, isOpen]);;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const messageContent = input.trim();
    setInput('');

    if (isUsingSQLChat) {
      await sqlChat.sendMessage(messageContent);
    } else if (isUsingNoSQLChat) {
      await noSQLChat.sendMessage(messageContent);
    } else if (isUsingDocumentChat) {
      await documentChat.sendMessage(messageContent);
    } else if (externalOnSendMessage) {
      externalOnSendMessage(messageContent);
    }
  };

  const handleClear = () => {
    if (isUsingSQLChat) {
      sqlChat.clearChat();
    } else if (isUsingNoSQLChat) {
      noSQLChat.clearChat();
    } else if (isUsingDocumentChat) {
      documentChat.clearChat();
    } else if (externalOnClear) {
      externalOnClear();
    }
  };

  const exportChat = () => {
    const chatData = {
      chatbotType,
      uploadId,
      noSQLConnection: noSQLConnection ? {
        databaseName: noSQLConnection.databaseName,
        collectionName: noSQLConnection.collectionName,
        isAuthenticated: noSQLConnection.isAuthenticated
      } : null,
      messages,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${chatbotType}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getChatbotInfo = () => {
    switch (chatbotType) {
      case 'sql':
        return {
          name: 'SQL Explorer',
          color: 'from-blue-500 to-cyan-500',
          description: uploadId ? 'Connected to SQL Database' : 'SQL Database (Setup Required)',
        };
      case 'document':
        return {
          name: 'Document AI',
          color: 'from-green-500 to-emerald-500',
          description: 'Analyzing uploaded documents',
        };
      case 'nosql':
        return {
          name: 'NoSQL Navigator',
          color: 'from-purple-500 to-pink-500',
          description: noSQLConnection?.isAuthenticated 
            ? `Connected to ${noSQLConnection.databaseName}.${noSQLConnection.collectionName}` 
            : 'NoSQL Database (Setup Required)',
        };
      default:
        return {
          name: 'AI Assistant',
          color: 'from-gray-500 to-gray-600',
          description: 'Ready to help',
        };
    }
  };

  const renderMessage = (message: ChatMessage) => {
    return (
      <div
        key={message.id}
        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-[80%] p-3 rounded-2xl ${
            message.type === 'user'
              ? 'bg-gradient-to-r from-[#00FF9A] to-[#00FFE5] text-black'
              : 'bg-[#252525] text-white'
          }`}
        >
          {message.isCode ? (
            <div className="flex items-start gap-2">
              <Code size={16} className="mt-1 flex-shrink-0" />
              <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                <code>{message.content}</code>
              </pre>
            </div>
          ) : (
            <div className="text-sm whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/```javascript\n([\s\S]*?)\n```/g, '<pre class="bg-gray-800 p-2 rounded mt-2 text-xs overflow-x-auto"><code>$1</code></pre>')
                  .replace(/```json\n([\s\S]*?)\n```/g, '<pre class="bg-gray-800 p-2 rounded mt-2 text-xs overflow-x-auto"><code>$1</code></pre>')
                  .replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-1 rounded text-xs">$1</code>')
              }}
            />
          )}
          <p className={`text-xs mt-1 ${
            message.type === 'user' ? 'text-black/70' : 'text-gray-400'
          }`}>
            {message.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  const chatbotInfo = getChatbotInfo();

  // Show connection warning
  const showConnectionWarning = (chatbotType === 'sql' && !uploadId) || 
                             (chatbotType === 'nosql' && !noSQLConnection?.isAuthenticated) ||
                             (chatbotType === 'document' && (!uploadedDocuments || uploadedDocuments.length === 0));
  // Maximized view (full screen)
  if (isMaximized) {
    return (
      <div className="fixed inset-0 bg-[#121212] z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-[#1E1E1E]">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${chatbotInfo.color}`}></div>
            <div>
              <h3 className="text-xl font-medium text-white">{chatbotInfo.name}</h3>
              <p className="text-sm text-gray-400">{chatbotInfo.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#252525]"
              title="Chat history"
            >
              <History size={20} />
            </button>
            <button
              onClick={exportChat}
              className="p-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#252525]"
              title="Export chat"
            >
              <Download size={20} />
            </button>
            <button
              onClick={handleClear}
              className="p-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#252525]"
              title="Clear chat"
              disabled={showConnectionWarning}
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={() => setIsMaximized(false)}
              className="p-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#252525]"
              title="Restore"
            >
              <Minimize2 size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#252525]"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Connection Warning */}
        {showConnectionWarning && (
          <div className="mx-6 mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} className="text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-yellow-400 text-sm font-medium">Database Setup Required</p>
              <p className="text-yellow-400/80 text-xs">
                {chatbotType === 'sql' ? 'Please complete the SQL database setup process to start chatting.' : 'Please complete the NoSQL database connection process to start chatting.'}
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mx-4 mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <span className="text-red-400 text-xs font-medium">Error</span>
            </div>
            <p className="text-red-400 text-xs">{error}</p>
            {error.includes('422') && (
              <p className="text-red-400/80 text-xs mt-1">
                Please check the server logs for validation details.
              </p>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 && !showConnectionWarning && (
              <div className="text-center text-gray-400 mt-16">
                <p className="text-lg">Start a conversation with your data!</p>
              </div>
            )}
            
            {messages.map(renderMessage)}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#1E1E1E] text-white p-4 rounded-2xl border border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-6 border-t border-gray-800 bg-[#1E1E1E]">
          <div className="max-w-4xl mx-auto flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={showConnectionWarning ? "Complete database setup to start chatting..." : "Ask about your data..."}
              className="flex-1 px-6 py-4 bg-[#121212] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors text-lg"
              disabled={showConnectionWarning}
            />
            <button
              type="submit"
              disabled={!input.trim() || showConnectionWarning}
              className="px-8 py-4 bg-gradient-to-r from-[#00FF9A] to-[#00FFE5] text-black rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Regular floating view
  return (
    <div className={`fixed right-4 bottom-4 w-[40vw] min-w-[400px] max-w-[600px] bg-[#1E1E1E] border border-gray-800 rounded-2xl shadow-2xl z-40 transition-all duration-300 ${
      isMinimized ? 'h-16' : 'h-[70vh]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${chatbotInfo.color}`}></div>
          <div>
            <h3 className="font-medium text-white">{chatbotInfo.name}</h3>
            <p className="text-xs text-gray-400">{chatbotInfo.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Chat history"
          >
            <History size={16} />
          </button>
          <button
            onClick={exportChat}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Export chat"
          >
            <Download size={16} />
          </button>
          <button
            onClick={handleClear}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Clear chat"
            disabled={showConnectionWarning}
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={() => setIsMaximized(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Maximize"
          >
            <Maximize2 size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Connection Warning */}
          {showConnectionWarning && (
            <div className="mx-4 mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-yellow-400 text-xs font-medium">Setup Required</p>
                <p className="text-yellow-400/80 text-xs">Complete database setup first.</p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mx-4 mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <span className="text-red-400 text-xs">{error}</span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100%-120px)]">
            {messages.length === 0 && !showConnectionWarning && (
              <div className="text-center text-gray-400 mt-8">
                <p>Start a conversation with your data!</p>
              </div>
            )}
            
            {messages.map(renderMessage)}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#252525] text-white p-3 rounded-2xl">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={showConnectionWarning ? "Setup required..." : "Ask about your data..."}
                className="flex-1 px-4 py-2 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors"
                disabled={showConnectionWarning}
              />
              <button
                type="submit"
                disabled={!input.trim() || showConnectionWarning}
                className="px-4 py-2 bg-gradient-to-r from-[#00FF9A] to-[#00FFE5] text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatInterface;