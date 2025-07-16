import React, { useState, useCallback } from 'react';
import { X, Upload, File, CheckCircle } from 'lucide-react';
import { UploadedDocument } from '../../types';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (documents: UploadedDocument[]) => void;
}

const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [dragOver, setDragOver] = useState(false);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  }, []);

  const processFiles = (files: File[]) => {
    const newDocuments: UploadedDocument[] = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadProgress: 0,
    }));

    setDocuments(prev => [...prev, ...newDocuments]);

    // Simulate upload progress
    newDocuments.forEach(doc => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        
        setDocuments(prev => 
          prev.map(d => 
            d.id === doc.id ? { ...d, uploadProgress: progress } : d
          )
        );
      }, 300);
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleContinue = () => {
    onUpload(documents);
    onClose();
    setDocuments([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E1E1E] rounded-2xl border border-gray-800 w-full max-w-2xl animate-modal-in">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <File size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Document Upload</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              dragOver
                ? 'border-green-500 bg-green-500/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <Upload size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-white mb-2">
              Drop files here or click to browse
            </h3>
            <p className="text-gray-400 mb-4">
              Supports PDF, DOCX, TXT, and more
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept=".pdf,.docx,.txt,.csv,.json"
            />
            <label
              htmlFor="file-upload"
              className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            >
              Select Files
            </label>
          </div>

          {documents.length > 0 && (
            <div className="mt-6">
              <h4 className="text-white font-medium mb-4">Uploaded Documents</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {documents.map(doc => (
                  <div key={doc.id} className="bg-[#121212] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <File size={20} className="text-green-400" />
                        <div>
                          <p className="text-white font-medium truncate">{doc.name}</p>
                          <p className="text-gray-400 text-sm">{formatFileSize(doc.size)}</p>
                        </div>
                      </div>
                      {doc.uploadProgress === 100 && (
                        <CheckCircle size={20} className="text-green-400" />
                      )}
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${doc.uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {documents.length > 0 && documents.every(doc => doc.uploadProgress === 100) && (
            <button
              onClick={handleContinue}
              className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Continue with {documents.length} document{documents.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;