import { AxiosResponse } from 'axios';
import api from './apiConfig';
import {
  DatabaseCredentials,
  UploadResponse,
  SQLQueryRequest,
  SQLQueryResponse,
  APIError,
} from '../types';

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

  async healthCheck(): Promise<{ status: string; service: string }> {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Health check failed');
    }
  }

  private handleError(error: any, defaultMessage: string): APIError {
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