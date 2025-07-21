import { AxiosResponse } from 'axios';
import api from './apiConfig';
import {
  DatabaseCredentials,
  UploadResponse,
  SQLQueryRequest,
  SQLQueryResponse,
  NoSQLConnection,
  NoSQLState,
  QueryExecutionResult,
  NoSQLSchema,
  APIError,
} from '../types';

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

class APIService {
  async uploadCredentials(credentials: DatabaseCredentials): Promise<UploadResponse> {
    try {
      const response: AxiosResponse<UploadResponse> = await api.post('/upload-credentials', credentials);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to upload credentials');
    }
  }

  async uploadCsv(uploadId: string, file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response: AxiosResponse<UploadResponse> = await api.post(
        `/upload-csv/${uploadId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to upload CSV file');
    }
  }

  async uploadPython(uploadId: string, file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response: AxiosResponse<UploadResponse> = await api.post(
        `/upload-python/${uploadId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to upload Python file');
    }
  }

  async queryDatabase(uploadId: string, request: SQLQueryRequest): Promise<SQLQueryResponse> {
    try {
      const response: AxiosResponse<SQLQueryResponse> = await api.post(
        `/query-database/${uploadId}`,
        request
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to query database');
    }
  }

  // Fixed NoSQL methods to match backend exactly
  async createNoSQLSchema(connection: NoSQLConnection): Promise<NoSQLState> {
    try {
      // Parse sample document if provided, otherwise use empty object
      let sampleObject: Record<string, any> = {};
      
      if (connection.sampleDocument && connection.sampleDocument.trim()) {
        try {
          sampleObject = JSON.parse(connection.sampleDocument);
        } catch (parseError) {
          console.warn('Failed to parse sample document, using empty object:', parseError);
          // Don't throw error here, just use empty object
        }
      }

      // Match backend NoSQLSchema exactly
      const payload: NoSQLSchema = {
        MONGO_URI: connection.connectionString,
        DB_NAME: connection.databaseName,
        COLLECTION_NAME: connection.collectionName,
        OBJECT: sampleObject
      };

      console.log('Creating NoSQL schema with payload:', {
        DB_NAME: payload.DB_NAME,
        COLLECTION_NAME: payload.COLLECTION_NAME,
        hasObject: Object.keys(payload.OBJECT).length > 0,
        hasConnectionString: !!payload.MONGO_URI
      });

      const response: AxiosResponse<NoSQLState> = await api.post('/schema-creator', payload);
      
      if (!response.data) {
        throw new Error('No data received from schema creation endpoint');
      }

      // Validate that all required fields are present
      const requiredFields: (keyof NoSQLState)[] = [
        'success', 'question', 'messages', 'mongo_uri', 'db_name', 'collection_name',
        'table_schema', 'schema_description', 'few_shot_examples', 'collection',
        'collection_stats', 'query_prompt_template', 'generated_query', 'raw_query_response',
        'query_results', 'result_count', 'final_answer', 'error', 'query_context',
        'execution_stats', 'response_type'
      ];

      const missingFields = requiredFields.filter(field => 
        response.data[field] === undefined || response.data[field] === null
      );

      if (missingFields.length > 0) {
        console.warn('Response missing fields:', missingFields);
        // Don't throw error, let the backend handle field defaults
      }

      return response.data;
    } catch (error: any) {
      console.error('Schema creation error:', error);
      throw this.handleError(error, 'Failed to create NoSQL schema');
    }
  }

  async executeNoSQLQuery(state: NoSQLState): Promise<QueryExecutionResult> {
    try {
      console.log('Executing NoSQL query with state question:', state.question);

      // Send the complete NoSQLState to the query-execution endpoint
      const response: AxiosResponse<QueryExecutionResult> = await api.post('/query-execution', state);
      
      if (!response.data) {
        throw new Error('No data received from query execution endpoint');
      }

      return response.data;
    } catch (error: any) {
      console.error('Query execution error:', error);
      throw this.handleError(error, 'Failed to execute NoSQL query');
    }
  }

  async healthCheck(): Promise<{ status: string; service: string }> {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Health check failed');
    }
  }

  async uploadDocuments(files: File[]): Promise<DocumentUploadResponse> {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response: AxiosResponse<DocumentUploadResponse> = await api.post(
      '/upload-doc',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for file uploads
      }
    );
    return response.data;
  } catch (error: any) {
      throw this.handleError(error, 'Failed to upload documents');
    }
  }

  async chatWithDocuments(request: RAGChatRequest): Promise<RAGChatResponse> {
    try {
      const response: AxiosResponse<RAGChatResponse> = await api.post('/rag-chat', request);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to chat with documents');
    }
  }

  async listDocuments(): Promise<any[]> {
    try {
      const response: AxiosResponse<any[]> = await api.get('/list-docs');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to list documents');
    }
  }

  async deleteDocuments(fileIds: number[]): Promise<any> {
    try {
      const response: AxiosResponse<any> = await api.post('/delete-docs', fileIds);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to delete documents');
    }
  }

  private handleError(error: any, defaultMessage: string): APIError {
    console.error('API Error Details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Handle 422 validation errors specifically
    if (error.response?.status === 422) {
      const validationErrors = error.response?.data?.detail;
      if (Array.isArray(validationErrors)) {
        const errorMessages = validationErrors.map((err: any) => 
          `${err.loc?.join('.')}: ${err.msg}`
        ).join(', ');
        return {
          detail: `Validation Error: ${errorMessages}`,
          status: 422,
        };
      }
      // Single validation error
      if (typeof validationErrors === 'string') {
        return {
          detail: `Validation Error: ${validationErrors}`,
          status: 422,
        };
      }
    }
    
    // Handle 400 bad request errors
    if (error.response?.status === 400) {
      return {
        detail: error.response?.data?.detail || error.response?.data?.message || 'Bad request',
        status: 400,
      };
    }

    // Handle 500 internal server errors
    if (error.response?.status === 500) {
      return {
        detail: error.response?.data?.detail || error.response?.data?.message || 'Internal server error',
        status: 500,
      };
    }
    
    if (error.response?.data?.detail) {
      return {
        detail: error.response.data.detail,
        status: error.response.status,
      };
    }
    
    if (error.response?.data?.message) {
      return {
        detail: error.response.data.message,
        status: error.response.status,
      };
    }

    if (error.message) {
      return {
        detail: error.message,
        status: error.response?.status,
      };
    }

    return {
      detail: defaultMessage,
      status: error.response?.status || 500,
    };
  }
}

export const apiService = new APIService();
export default apiService;