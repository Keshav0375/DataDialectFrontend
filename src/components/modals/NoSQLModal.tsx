import React, { useState } from 'react';
import { X, Server, Loader2, Shield, CheckCircle } from 'lucide-react';
import { NoSQLConnection } from '../../types';

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
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setAuthStatus('idle');

    // Simulate authentication
    setTimeout(() => {
      setIsConnecting(false);
      setAuthStatus('success');
      
      setTimeout(() => {
        onConnect({
          ...formData,
          isAuthenticated: true,
        });
        onClose();
        setAuthStatus('idle');
        setFormData({ connectionString: '', databaseName: '', collectionName: '' });
      }, 1000);
    }, 2000);
  };

  const maskConnectionString = (value: string) => {
    if (value.length <= 20) return value;
    return value.substring(0, 10) + '•'.repeat(value.length - 20) + value.substring(value.length - 10);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E1E1E] rounded-2xl border border-gray-800 w-full max-w-md animate-modal-in">
        <div className="p-6 border-b border-gray-800">
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
              Connection String
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
              Database Name
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
              Collection Name
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

          {authStatus !== 'idle' && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              authStatus === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {authStatus === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <Shield size={20} />
              )}
              <span className="text-sm">
                {authStatus === 'success' ? 'Authentication successful!' : 'Authentication failed'}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Authenticating...
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