import { useState, useCallback } from 'react';
import { ChatMessage, ChatState, APIError, SQLQueryRequest, APIMessage } from '../types';
import { apiService } from '../services/api';

interface UseSQLChatProps {
  uploadId: string | null;
}

export const useSQLChat = ({ uploadId }: UseSQLChatProps) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    uploadId,
  });

  const [error, setError] = useState<string | null>(null);

  // Add message to chat
  const addMessage = useCallback((content: string, type: 'user' | 'bot', isCode = false) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      content,
      type,
      timestamp: new Date(),
      isCode,
    };
    
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));

    return newMessage;
  }, []);

  // Send message to API and get response
  const sendMessage = useCallback(async (message: string) => {
    if (!uploadId) {
      setError('No upload ID available. Please complete setup first.');
      return;
    }

    setError(null);
    
    // Add user message
    addMessage(message, 'user');
    
    // Start typing indicator
    setChatState(prev => ({ ...prev, isTyping: true }));

    try {
      // Prepare API request - convert chat messages to API format
      const apiMessages: APIMessage[] = chatState.messages.map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content,
      }));

      const request: SQLQueryRequest = {
        upload_id: uploadId,
        question: message,
        messages: apiMessages,
      };

      // Call API
      const response = await apiService.queryDatabase(uploadId, request);

      if (response.success && response.answer) {
        // Add bot response
        const isCodeResponse = response.query && (response.answer.includes('SQL') || response.answer.includes('SELECT'));
        addMessage(response.answer, 'bot', isCodeResponse);

        // Optionally show the SQL query if available and different from answer
        if (response.query && response.query.trim() !== response.answer.trim()) {
          setTimeout(() => {
            addMessage(`Generated SQL Query:\n${response.query}`, 'bot', true);
          }, 500);
        }
      } else {
        // Handle API error
        const errorMessage = response.error || 'Failed to get response from database';
        addMessage(`Error: ${errorMessage}`, 'bot');
        setError(errorMessage);
      }
    } catch (error: any) {
      const apiError = error as APIError;
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (apiError.status === 422) {
        errorMessage = 'Invalid request format. Please check your input and try again.';
      } else if (apiError.detail) {
        errorMessage = apiError.detail;
      }
      
      addMessage(`Error: ${errorMessage}`, 'bot');
      setError(errorMessage);
    } finally {
      // Stop typing indicator
      setChatState(prev => ({ ...prev, isTyping: false }));
    }
  }, [uploadId, chatState.messages, addMessage]);

  // Clear chat history
  const clearChat = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      messages: [],
    }));
    setError(null);
  }, []);

  // Initialize chat with welcome message
  const initializeChat = useCallback(() => {
    if (chatState.messages.length === 0) {
      addMessage(
        "Hello! I'm your SQL Database Assistant. I can help you query and analyze your data using natural language. What would you like to know about your database?",
        'bot'
      );
    }
  }, [chatState.messages.length, addMessage]);

  return {
    messages: chatState.messages,
    isTyping: chatState.isTyping,
    error,
    sendMessage,
    clearChat,
    initializeChat,
  };
};