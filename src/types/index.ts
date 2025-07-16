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
  password: string;
  isConnected: boolean;
  upload_id?: string; // Add upload_id to track the connection
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

export interface SQLSetupState {
  step: number;
  uploadId: string | null;
  credentials: {
    db_host: string;
    db_user: string;
    db_password: string;
    db_name: string;
  } | null;
  csvFile: File | null;
  pythonFile: File | null;
  isLoading: boolean;
  error: string | null;
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  uploadId: string | null;
}

export interface APIError {
  detail: string;
  status?: number;
}


export interface DatabaseCredentials {
  db_host: string;
  db_user: string;
  db_password: string;
  db_name: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  upload_id: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SQLQueryRequest {
  upload_id: string;
  question: string;
  messages?: ChatMessage[];
}

export interface SQLQueryResponse {
  success: boolean;
  answer?: string;
  query?: string;
  upload_id: string;
  messages?: Array<{ role: string; content: string }>;
  error?: string;
}

export interface APIError {
  detail: string;
  status?: number;
}
