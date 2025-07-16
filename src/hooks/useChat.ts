import { useState, useCallback } from 'react';
import { ChatMessage, ChatbotType } from '../types';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeChatbot, setActiveChatbot] = useState<ChatbotType>(null);

  const addMessage = useCallback((content: string, type: 'user' | 'bot', isCode = false) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      type,
      timestamp: new Date(),
      isCode,
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const simulateTyping = useCallback(() => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage("I'm ready to help you explore your data! Ask me anything.", 'bot');
    }, 1500);
  }, [addMessage]);

  const sendMessage = useCallback((message: string) => {
    addMessage(message, 'user');
    simulateTyping();
  }, [addMessage, simulateTyping]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isTyping,
    activeChatbot,
    setActiveChatbot,
    sendMessage,
    clearChat,
  };
};