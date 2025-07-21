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
  upload_id?: string;
}

export interface NoSQLConnection {
  connectionString: string;
  databaseName: string;
  collectionName: string;
  sampleDocument?: string;
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

export interface APIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SQLQueryRequest {
  upload_id: string;
  question: string;
  messages?: APIMessage[];
}

export interface SQLQueryResponse {
  success: boolean;
  answer?: string;
  query?: string;
  upload_id: string;
  messages?: APIMessage[];
  error?: string;
}

// Backend schema creation payload
export interface NoSQLSchema {
  MONGO_URI: string;
  DB_NAME: string;
  COLLECTION_NAME: string;
  OBJECT: Record<string, any>;
}

// Backend NoSQLState - ALL fields are required as per TypedDict
export interface NoSQLState {
  success: boolean;
  question: string;
  messages: Array<{ role: string; content: string }>;
  mongo_uri: string;
  db_name: string;
  collection_name: string;
  table_schema: string;
  schema_description: string;
  few_shot_examples: Array<Record<string, any>>;
  collection: any;
  collection_stats: Record<string, any>;
  query_prompt_template: string;
  generated_query: Array<Record<string, any>>;
  raw_query_response: string;
  query_results: Array<Record<string, any>>;
  result_count: number;
  final_answer: string;
  error: string;
  query_context: Record<string, any>;
  execution_stats: Record<string, any>;
  response_type: string;
}

export interface QueryExecutionResult {
  success: boolean;
  question: string;
  answer: string;
  query?: Array<Record<string, any>> | string;
  result_count?: number;
  response_type?: string;
  execution_stats?: Record<string, any>;
  error?: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  collection_id: string;
  total_files: number;
  documents: Array<{
    file_id: number;
    filename: string;
    collection_id: string;
    file_size: number;
    file_type: string;
    status: string;
  }>;
  file_ids: number[];
}

export interface RAGChatRequest {
  question: string;
  session_id?: string;
  document_ids?: number[];
}

export interface RAGChatResponse {
  answer: string;
  session_id: string;
}

// Update UploadedDocument interface
export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadProgress: number;
  url?: string;
  file_id?: number; // Add this for API integration
  error?: string; // Add this for error handling
}