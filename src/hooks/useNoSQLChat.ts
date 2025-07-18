import { useState, useCallback } from 'react';
import { ChatMessage, NoSQLConnection, NoSQLState, NoSQLQueryRequest } from '../types';
import { apiService } from '../services/api';

interface UseNoSQLChatProps {
  connection: NoSQLConnection | null;
}

interface UseNoSQLChatReturn {
  messages: ChatMessage[];
  isTyping: boolean;
  error: string | null;
  isInitialized: boolean;
  noSQLState: NoSQLState | null;
  initializeChat: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
}

export const useNoSQLChat = ({ connection }: UseNoSQLChatProps): UseNoSQLChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [noSQLState, setNoSQLState] = useState<NoSQLState | null>(null);

  const initializeChat = useCallback(async () => {
    if (!connection || isInitialized) return;

    try {
      setError(null);
      setIsTyping(true);

      // Create schema using the schema-creator endpoint
      const schemaResult = await apiService.createNoSQLSchema(connection);
      setNoSQLState(schemaResult);
      setIsInitialized(true);

      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: `Connected to MongoDB database "${connection.databaseName}" collection "${connection.collectionName}".\n\nSchema analysis complete! I can help you query your data using natural language. What would you like to know about your collection?`,
        timestamp: new Date(),
      };

      setMessages([welcomeMessage]);
    } catch (err: any) {
      console.error('Failed to initialize NoSQL chat:', err);
      setError(err.detail || 'Failed to initialize chat session');
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: `Failed to connect to your MongoDB database. Error: ${err.detail || 'Unknown error'}`,
        timestamp: new Date(),
      };
      
      setMessages([errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [connection, isInitialized]);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!noSQLState || !connection) {
      setError('Chat not initialized. Please check your database connection.');
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
      // Prepare query request
      const queryRequest: NoSQLQueryRequest = {
        mongo_uri: noSQLState.mongo_uri,
        db_name: noSQLState.db_name,
        collection_name: noSQLState.collection_name,
        table_schema: noSQLState.table_schema,
        schema_description: noSQLState.schema_description,
        few_shot_examples: noSQLState.few_shot_examples,
        question: userMessage,
        messages: messages.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      };

      // Execute query using the query-execution endpoint
      const queryResult = await apiService.executeNoSQLQuery(queryRequest);

      let assistantContent = queryResult.answer;
      
      // Add query information if available
      if (queryResult.query) {
        assistantContent += `\n\n**MongoDB Query:**\n\`\`\`javascript\n${queryResult.query}\n\`\`\``;
      }
      
      // Add result count information
      if (queryResult.result_count !== undefined) {
        assistantContent += `\n\n*Found ${queryResult.result_count} result(s)*`;
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.detail || 'Failed to process your query');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `Sorry, I encountered an error processing your query: ${err.detail || 'Unknown error'}. Please try rephrasing your question.`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [noSQLState, connection, messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsTyping(false);
    // Keep the initialization state and noSQLState so user doesn't need to reconnect
  }, []);

  return {
    messages,
    isTyping,
    error,
    isInitialized,
    noSQLState,
    initializeChat,
    sendMessage,
    clearChat,
  };
};