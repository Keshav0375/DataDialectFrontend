import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 70000, // Increased timeout for NoSQL operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Don't log sensitive data
    const logConfig = {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasData: !!config.data,
      dataKeys: config.data ? Object.keys(config.data) : []
    };
    console.log('API Request:', logConfig);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const logResponse = {
      status: response.status,
      url: response.config.url,
      hasData: !!response.data,
      success: response.data?.success
    };
    console.log('API Response:', logResponse);
    return response;
  },
  (error) => {
    const errorInfo = {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    };
    console.error('API Response Error:', errorInfo);
    
    // Handle specific NoSQL errors
    if (error.response?.status === 400 && error.config?.url?.includes('schema-creator')) {
      console.error('Schema creation failed - check MongoDB connection details');
    }
    
    if (error.response?.status === 422) {
      console.error('Validation error - check request payload format');
    }
    
    return Promise.reject(error);
  }
);

export default api;