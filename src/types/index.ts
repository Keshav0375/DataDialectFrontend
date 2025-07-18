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

// New NoSQL Types
export interface NoSQLState {
  success: boolean;
  mongo_uri: string;
  db_name: string;
  collection_name: string;
  table_schema: any;
  schema_description: string;
  few_shot_examples: any[];
  collection_stats: any;
  question: string;
  messages: any[];
  result_count: number;
  collection?: any;
  error?: string;
  execution_stats?: any;
  final_answer?: string;
  generated_query?: string;
  query_context?: string;
  query_prompt_template?: string;
  query_results?: any;
  raw_query_response?: any;
  response_type?: string;
}

export interface QueryExecutionResult {
  success: boolean;
  question: string;
  answer: string;
  query?: string;
  result_count: number;
  response_type: string;
  execution_stats?: any;
  error?: string;
}

export interface NoSQLQueryRequest {
  mongo_uri: string;
  db_name: string;
  collection_name: string;
  table_schema: any;
  schema_description: string;
  few_shot_examples: any[];
  question: string;
  messages: any[];
}