import { useState, useCallback } from 'react';
import { ChatMessage } from '../types';

interface UseDocumentChatProps {
  documents?: any[];
}

interface UseDocumentChatReturn {
  messages: ChatMessage[];
  isTyping: boolean;
  error: string | null;
  isInitialized: boolean;
  initializeChat: () => void;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
}

export const useDocumentChat = ({ documents }: UseDocumentChatProps): UseDocumentChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeChat = useCallback(() => {
    if (!isInitialized) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: `📄 **Document Intelligence Ready!**

I can help you analyze and query your uploaded documents. Here are some things you can ask:

• "What are the main topics covered in these documents?"
• "Summarize the key findings"
• "Find information about [specific topic]"
• "Compare different sections or documents"
• "Extract specific data or facts"

What would you like to know about your documents?`,
        timestamp: new Date(),
      };

      setMessages([welcomeMessage]);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) {
      setError('Please enter a valid message.');
      return;
    }

    const userChatMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userChatMessage]);
    setIsTyping(true);
    setError(null);

    try {
      // Generate a consistent session ID for the chat
      const sessionId = `document-session-${Date.now()}`;
      
      // Call the RAG chat API
      const response = await fetch('http://localhost:8000/api/v1/rag-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage,
          session_id: sessionId,
          document_ids: documents?.map(doc => doc.file_id).filter(Boolean) || []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.answer) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: result.answer,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('No answer received from the server');
      }

    } catch (err: any) {
      console.error('Failed to send message:', err);
      
      let errorMessage = 'Failed to process your query';
      
      if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      const errorChatMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `❌ Sorry, I encountered an error: **${errorMessage}**

Please try again with a different question.`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [documents]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsTyping(false);
    setIsInitialized(false);
  }, []);

  return {
    messages,
    isTyping,
    error,
    isInitialized,
    initializeChat,
    sendMessage,
    clearChat,
  };
};
