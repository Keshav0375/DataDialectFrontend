export interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'bot';
  timestamp: Date;
  isCode?: boolean;
}

export interface DatabaseConnection {
  hostname: string;
  databaseName: string;
  hostUrl: string;
  password: string;
  isConnected: boolean;
}

export interface NoSQLConnection {
  connectionString: string;
  databaseName: string;
  collectionName: string;
  isAuthenticated: boolean;
}

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadProgress: number;
  url?: string;
}

export type ChatbotType = 'sql' | 'document' | 'nosql' | null;