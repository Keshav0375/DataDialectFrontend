import React, { useState } from 'react';
import { X, Server, Loader2, Shield, CheckCircle, AlertCircle } from 'lucide-react';
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

  const validateSampleDocument = (document: string): boolean => {
    if (!document.trim()) return true; // Optional field
    
    try {
      JSON.parse(document);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setAuthStatus('idle');
    setErrorMessage('');

    // Validate sample document format
    if (formData.sampleDocument && !validateSampleDocument(formData.sampleDocument)) {
      setIsConnecting(false);
      setAuthStatus('error');
      setErrorMessage('Invalid JSON format in sample document');
      return;
    }

    try {
      // Test connection and create schema using the schema-creator endpoint
      const connectionData: NoSQLConnection = {
        ...formData,
        isAuthenticated: false,
      };

      const schemaResult = await apiService.createNoSQLSchema(connectionData);
      
      if (schemaResult.success) {
        setAuthStatus('success');
        
        // Wait a moment to show success message, then proceed
        setTimeout(() => {
          onConnect({
            ...formData,
            isAuthenticated: true,
          });
          onClose();
          setAuthStatus('idle');
          setFormData({ 
            connectionString: '', 
            databaseName: '', 
            collectionName: '', 
            sampleDocument: '' 
          });
        }, 1000);
      } else {
        throw new Error(schemaResult.error || 'Failed to create schema');
      }

    } catch (err: any) {
      console.error('Connection failed:', err);
      setAuthStatus('error');
      setErrorMessage(err.detail || err.message || 'Failed to connect to database');
    } finally {
      setIsConnecting(false);
    }
  };

  const maskConnectionString = (value: string) => {
    if (value.length <= 20) return value;
    return value.substring(0, 10) + '•'.repeat(value.length - 20) + value.substring(value.length - 10);
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
                className="w-full px-4 py-3 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="mongodb://username:password@host:port/database"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Shield size={16} className="text-gray-500" />
              </div>
            </div>
            {formData.connectionString && (
              <p className="text-xs text-gray-500 mt-1 font-mono">
                {maskConnectionString(formData.connectionString)}
              </p>
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
              <span className="text-xs text-gray-500 ml-2">(Optional - helps with data structure analysis)</span>
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
            <p className="text-xs text-gray-500 mt-1">
              Paste a representative document from your collection to help understand the data structure
            </p>
          </div>

          {authStatus !== 'idle' && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              authStatus === 'success' 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {authStatus === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <div className="flex-1">
                <span className="text-sm font-medium">
                  {authStatus === 'success' ? 'Connection successful!' : 'Connection failed'}
                </span>
                {errorMessage && authStatus === 'error' && (
                  <p className="text-xs mt-1 opacity-80">{errorMessage}</p>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isConnecting || (formData.sampleDocument && !validateSampleDocument(formData.sampleDocument))}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Connecting & Analyzing Schema...
              </>
            ) : (
              'Connect Database'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NoSQLModal;