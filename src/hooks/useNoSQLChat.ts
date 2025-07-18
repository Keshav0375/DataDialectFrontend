import { useState, useCallback } from 'react';
import { ChatMessage, NoSQLConnection, NoSQLState } from '../types';
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

      console.log('Initializing NoSQL chat with connection:', {
        databaseName: connection.databaseName,
        collectionName: connection.collectionName,
        hasConnectionString: !!connection.connectionString,
        hasSampleDocument: !!connection.sampleDocument
      });

      // Create schema using the schema-creator endpoint
      const schemaResult = await apiService.createNoSQLSchema(connection);
      
      console.log('Schema creation result:', schemaResult);

      // Validate the schema result
      if (!schemaResult || typeof schemaResult !== 'object') {
        throw new Error('Invalid schema result received from server');
      }

      if (!schemaResult.table_schema || !schemaResult.schema_description) {
        throw new Error('Incomplete schema data received from server');
      }

      setNoSQLState(schemaResult);
      setIsInitialized(true);

      // Add welcome message with more details
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: `🎉 Successfully connected to MongoDB!

**Database:** ${connection.databaseName}
**Collection:** ${connection.collectionName}
**Documents Found:** ${schemaResult.collection_stats?.document_count || 'Unknown'}

Schema analysis complete! I can help you query your data using natural language. Here are some examples of what you can ask:

• "Show me all documents"
• "Count the total number of records"
• "Find documents where [field] equals [value]"
• "Group by [field] and count"
• "Show me the latest documents"

What would you like to know about your collection?`,
        timestamp: new Date(),
      };

      setMessages([welcomeMessage]);
      
    } catch (err: any) {
      console.error('Failed to initialize NoSQL chat:', err);
      
      let errorMessage = 'Failed to initialize chat session';
      
      if (err.detail) {
        errorMessage = err.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      const errorChatMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: `❌ Failed to connect to your MongoDB database.

**Error:** ${errorMessage}

**Troubleshooting tips:**
• Check your connection string format
• Verify database and collection names
• Ensure your MongoDB instance is accessible
• Validate network connectivity

Please check your connection details and try again.`,
        timestamp: new Date(),
      };
      
      setMessages([errorChatMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [connection, isInitialized]);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!noSQLState || !connection) {
      setError('Chat not initialized. Please check your database connection.');
      return;
    }

    // Validate user message
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
      console.log('Sending message to NoSQL chat:', userMessage);

      // Create updated state with new question and messages
      const updatedState: NoSQLState = {
        ...noSQLState,
        question: userMessage,
        messages: [
          ...messages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          { role: 'user', content: userMessage }
        ]
      };

      console.log('Updated state prepared for query execution');

      // Execute query using the updated complete state
      const queryResult = await apiService.executeNoSQLQuery(updatedState);

      console.log('Query execution result:', {
        success: queryResult.success,
        resultCount: queryResult.result_count,
        hasAnswer: !!queryResult.answer,
        hasQuery: !!queryResult.query,
        responseType: queryResult.response_type
      });

      if (!queryResult.success) {
        throw new Error(queryResult.error || 'Query execution failed');
      }

      let assistantContent = queryResult.answer || 'No response generated';
      
      // Add query information if available and it's an array (MongoDB aggregation pipeline)
      if (queryResult.query && Array.isArray(queryResult.query)) {
        const queryString = JSON.stringify(queryResult.query, null, 2);
        assistantContent += `\n\n**MongoDB Aggregation Pipeline:**\n\`\`\`json\n${queryString}\n\`\`\``;
      }
      
      // Add result count information
      if (typeof queryResult.result_count === 'number') {
        const countText = queryResult.result_count === 1 ? 'result' : 'results';
        assistantContent += `\n\n📊 *Found ${queryResult.result_count} ${countText}*`;
      }

      // Add execution stats if available
      if (queryResult.execution_stats) {
        const stats = queryResult.execution_stats;
        if (stats.pipeline_stages) {
          assistantContent += `\n⚡ *Pipeline stages: ${stats.pipeline_stages}*`;
        }
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
      
      let errorMessage = 'Failed to process your query';
      
      if (err.detail) {
        errorMessage = err.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      const errorMessage2: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `❌ Sorry, I encountered an error processing your query: **${errorMessage}**

💡 **Suggestions:**
• Try rephrasing your question
• Use simpler language
• Check if the field names exist in your collection
• Try a basic query like "show me all documents"

Please try again with a different question.`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage2]);
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