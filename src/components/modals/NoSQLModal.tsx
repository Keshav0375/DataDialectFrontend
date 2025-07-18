import React, { useState } from 'react';
import { X, Server, Loader2, Shield, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { NoSQLConnection } from '../../types';
import { apiService } from '../../services/api';

interface NoSQLModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (connection: NoSQLConnection) => void;
}

const NoSQLModal: React.FC<NoSQLModalProps> = ({ isOpen, onClose, onConnect }) => {
  const [formData, setFormData] = useState({
    connectionString: '',
    databaseName: '',
    collectionName: '',
    sampleDocument: '',
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [detailedError, setDetailedError] = useState<string>('');

  const validateConnectionString = (connectionString: string): boolean => {
    // Basic MongoDB connection string validation
    const mongoRegex = /^mongodb(\+srv)?:\/\/.+/;
    return mongoRegex.test(connectionString.trim());
  };

  const validateSampleDocument = (document: string): boolean => {
    if (!document.trim()) return true; // Optional field
    
    try {
      const parsed = JSON.parse(document);
      return typeof parsed === 'object' && parsed !== null;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setAuthStatus('idle');
    setErrorMessage('');
    setDetailedError('');

    // Client-side validation
    if (!validateConnectionString(formData.connectionString)) {
      setIsConnecting(false);
      setAuthStatus('error');
      setErrorMessage('Invalid MongoDB connection string format');
      setDetailedError('Connection string should start with mongodb:// or mongodb+srv://');
      return;
    }

    if (!formData.databaseName.trim()) {
      setIsConnecting(false);
      setAuthStatus('error');
      setErrorMessage('Database name is required');
      return;
    }

    if (!formData.collectionName.trim()) {
      setIsConnecting(false);
      setAuthStatus('error');
      setErrorMessage('Collection name is required');
      return;
    }

    // Validate sample document format
    if (formData.sampleDocument && !validateSampleDocument(formData.sampleDocument)) {
      setIsConnecting(false);
      setAuthStatus('error');
      setErrorMessage('Invalid JSON format in sample document');
      setDetailedError('Please ensure your sample document is valid JSON');
      return;
    }

    try {
      console.log('Starting NoSQL connection process...');

      // Test connection and create schema using the schema-creator endpoint
      const connectionData: NoSQLConnection = {
        connectionString: formData.connectionString.trim(),
        databaseName: formData.databaseName.trim(),
        collectionName: formData.collectionName.trim(),
        sampleDocument: formData.sampleDocument.trim() || undefined,
        isAuthenticated: false,
      };

      console.log('Attempting to create schema for:', {
        databaseName: connectionData.databaseName,
        collectionName: connectionData.collectionName,
        hasSampleDocument: !!connectionData.sampleDocument
      });

      const schemaResult = await apiService.createNoSQLSchema(connectionData);
      
      console.log('Schema creation successful:', {
        success: schemaResult.success,
        hasTableSchema: !!schemaResult.table_schema,
        hasSchemaDescription: !!schemaResult.schema_description,
        examplesCount: schemaResult.few_shot_examples?.length || 0,
        collectionStats: schemaResult.collection_stats
      });

      if (schemaResult && schemaResult.table_schema) {
        setAuthStatus('success');
        
        // Wait a moment to show success message, then proceed
        setTimeout(() => {
          onConnect({
            ...connectionData,
            isAuthenticated: true,
          });
          onClose();
          
          // Reset form and status
          setAuthStatus('idle');
          setFormData({ 
            connectionString: '', 
            databaseName: '', 
            collectionName: '', 
            sampleDocument: '' 
          });
          setErrorMessage('');
          setDetailedError('');
        }, 1500);
      } else {
        throw new Error('Schema creation returned incomplete data');
      }

    } catch (err: any) {
      console.error('Connection failed:', err);
      setAuthStatus('error');
      
      let errorMsg = 'Failed to connect to database';
      let detailedMsg = '';
      
      if (err.detail) {
        errorMsg = err.detail;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      // Provide specific error guidance
      if (errorMsg.includes('connection failed') || errorMsg.includes('timeout')) {
        detailedMsg = 'Check your connection string and ensure MongoDB is accessible';
      } else if (errorMsg.includes('authentication')) {
        detailedMsg = 'Verify your username and password in the connection string';
      } else if (errorMsg.includes('database') || errorMsg.includes('collection')) {
        detailedMsg = 'Ensure the database and collection exist and are accessible';
      } else if (errorMsg.includes('validation')) {
        detailedMsg = 'Check the format of your input data';
      }
      
      setErrorMessage(errorMsg);
      setDetailedError(detailedMsg);
    } finally {
      setIsConnecting(false);
    }
  };

  const maskConnectionString = (value: string) => {
    if (value.length <= 20) return value;
    
    // Find the username:password part
    const match = value.match(/mongodb(\+srv)?:\/\/([^@]+)@/);
    if (match) {
      const protocol = match[1] ? 'mongodb+srv://' : 'mongodb://';
      const credentials = match[2];
      const rest = value.substring(match[0].length);
      
      // Mask the credentials part
      const maskedCredentials = credentials.length > 6 
        ? credentials.substring(0, 2) + '•'.repeat(credentials.length - 4) + credentials.substring(credentials.length - 2)
        : '•'.repeat(credentials.length);
      
      return protocol + maskedCredentials + '@' + rest;
    }
    
    // Fallback masking
    return value.substring(0, 10) + '•'.repeat(Math.max(0, value.length - 20)) + value.substring(Math.max(10, value.length - 10));
  };

  const getSampleDocumentPlaceholder = () => {
    return `{
  "_id": "64a7b8c9e1234567890abcde",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "age": 28,
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "interests": ["technology", "photography", "travel"],
  "isActive": true,
  "createdAt": "2023-07-07T10:30:00Z",
  "lastLogin": "2023-07-15T14:22:33Z"
}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E1E1E] rounded-2xl border border-gray-800 w-full max-w-md animate-modal-in max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800 sticky top-0 bg-[#1E1E1E] z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Server size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">NoSQL Database Connection</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Connection String *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={formData.connectionString}
                onChange={(e) => setFormData({ ...formData, connectionString: e.target.value })}
                className={`w-full px-4 py-3 bg-[#121212] border rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors ${
                  formData.connectionString && !validateConnectionString(formData.connectionString)
                    ? 'border-red-500'
                    : 'border-gray-700'
                }`}
                placeholder="mongodb://username:password@host:port/database"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Shield size={16} className="text-gray-500" />
              </div>
            </div>
            {formData.connectionString && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 font-mono">
                  {maskConnectionString(formData.connectionString)}
                </p>
                {!validateConnectionString(formData.connectionString) && (
                  <p className="text-xs text-red-400 mt-1">
                    Invalid format. Use: mongodb://username:password@host:port/database
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Database Name *
            </label>
            <input
              type="text"
              required
              value={formData.databaseName}
              onChange={(e) => setFormData({ ...formData, databaseName: e.target.value })}
              className="w-full px-4 py-3 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="my_database"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Collection Name *
            </label>
            <input
              type="text"
              required
              value={formData.collectionName}
              onChange={(e) => setFormData({ ...formData, collectionName: e.target.value })}
              className="w-full px-4 py-3 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="users"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample Document
              <span className="text-xs text-gray-500 ml-2">(Optional - helps with schema analysis)</span>
            </label>
            <textarea
              value={formData.sampleDocument}
              onChange={(e) => setFormData({ ...formData, sampleDocument: e.target.value })}
              rows={8}
              className={`w-full px-4 py-3 bg-[#121212] border rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors font-mono text-sm resize-none ${
                formData.sampleDocument && !validateSampleDocument(formData.sampleDocument)
                  ? 'border-red-500'
                  : 'border-gray-700'
              }`}
              placeholder={getSampleDocumentPlaceholder()}
            />
            {formData.sampleDocument && !validateSampleDocument(formData.sampleDocument) && (
              <p className="text-xs text-red-400 mt-1">
                Invalid JSON format. Please check your document structure.
              </p>
            )}
            <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-400 text-xs font-medium">Pro Tip</p>
                  <p className="text-blue-400/80 text-xs mt-1">
                    Providing a sample document helps me understand your data structure better and generate more accurate queries.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {authStatus !== 'idle' && (
            <div className={`flex items-start gap-3 p-4 rounded-lg ${
              authStatus === 'success' 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {authStatus === 'success' ? (
                <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {authStatus === 'success' ? 'Connection successful!' : 'Connection failed'}
                </p>
                {errorMessage && authStatus === 'error' && (
                  <p className="text-xs mt-1 opacity-90">{errorMessage}</p>
                )}
                {detailedError && authStatus === 'error' && (
                  <p className="text-xs mt-1 opacity-75">{detailedError}</p>
                )}
                {authStatus === 'success' && (
                  <p className="text-xs mt-1 opacity-80">
                    Schema analysis complete. Redirecting to chat...
                  </p>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={
              isConnecting || 
              !formData.connectionString.trim() ||
              !formData.databaseName.trim() ||
              !formData.collectionName.trim() ||
              !validateConnectionString(formData.connectionString) ||
              (formData.sampleDocument && !validateSampleDocument(formData.sampleDocument))
            }
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {authStatus === 'idle' ? 'Connecting...' : 'Analyzing Schema...'}
              </>
            ) : (
              'Connect Database'
            )}
          </button>

          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-white text-sm font-medium mb-2">Connection Requirements:</h4>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>• MongoDB instance must be accessible from this application</li>
              <li>• Database and collection must exist</li>
              <li>• User must have read permissions</li>
              <li>• Network connectivity to MongoDB server</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoSQLModal;