import React, { useState } from 'react';
import { X, Database, Loader2, CheckCircle, AlertCircle, Upload, FileText, Code, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { DatabaseConnection, DatabaseCredentials } from '../../types';
import { apiService } from '../../services/api';

interface SQLModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (connection: DatabaseConnection) => void;
}

const SQLModal: React.FC<SQLModalProps> = ({ isOpen, onClose, onConnect }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    db_host: '',
    db_name: '',
    db_user: '',
    db_password: '',
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [pythonFile, setPythonFile] = useState<File | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Video player states
  const [csvVideoPlaying, setCsvVideoPlaying] = useState(false);
  const [pythonVideoPlaying, setPythonVideoPlaying] = useState(false);
  const [csvVideoMuted, setCsvVideoMuted] = useState(true);
  const [pythonVideoMuted, setPythonVideoMuted] = useState(true);

  const handleDatabaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setConnectionStatus('idle');

    try {
      const credentials: DatabaseCredentials = {
        db_host: formData.db_host,
        db_user: formData.db_user,
        db_password: formData.db_password,
        db_name: formData.db_name,
      };

      const response = await apiService.uploadCredentials(credentials);
      
      if (response.success && response.upload_id) {
        setUploadId(response.upload_id);
        setConnectionStatus('success');
        
        setTimeout(() => {
          setCurrentStep(2);
          setConnectionStatus('idle');
        }, 1000);
      } else {
        setError(response.message || 'Failed to connect to database');
        setConnectionStatus('error');
      }
    } catch (err: any) {
      setError(err.detail || 'Failed to connect to database');
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    }
  };

  const handleCsvNext = async () => {
    if (!csvFile || !uploadId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.uploadCsv(uploadId, csvFile);
      
      if (response.success) {
        setCurrentStep(3);
      } else {
        setError(response.message || 'Failed to upload CSV file');
      }
    } catch (err: any) {
      setError(err.detail || 'Failed to upload CSV file');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePythonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.endsWith('.py') || file.type === 'text/x-python')) {
      setPythonFile(file);
    }
  };

  const handleFinalSubmit = async () => {
    if (!pythonFile || !uploadId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.uploadPython(uploadId, pythonFile);
      
      if (response.success) {
        // Create connection object with upload_id
        const connection: DatabaseConnection = {
          hostname: formData.db_host,
          databaseName: formData.db_name,
          password: formData.db_password,
          isConnected: true,
          upload_id: uploadId,
        };

        onConnect(connection);
        handleClose();
      } else {
        setError(response.message || 'Failed to upload Python file');
      }
    } catch (err: any) {
      setError(err.detail || 'Failed to upload Python file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state
    setCurrentStep(1);
    setFormData({ db_host: '', db_name: '', db_user: '', db_password: '' });
    setCsvFile(null);
    setPythonFile(null);
    setUploadId(null);
    setError(null);
    setConnectionStatus('idle');
  };

  const VideoPlayer: React.FC<{
    src: string;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    isMuted: boolean;
    setIsMuted: (muted: boolean) => void;
    title: string;
  }> = ({ src, isPlaying, setIsPlaying, isMuted, setIsMuted, title }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      }
    }, [isPlaying]);

    const togglePlay = () => {
      setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
      setIsMuted(!isMuted);
      if (videoRef.current) {
        videoRef.current.muted = !isMuted;
      }
    };

    const handleVideoClick = () => {
      togglePlay();
    };

    const restartVideo = () => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
        setIsPlaying(true);
      }
    };

    const toggleFullscreen = () => {
      if (videoRef.current) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        }
      }
    };

    return (
      <div className="relative bg-black rounded-lg overflow-hidden group">
        <video
          ref={videoRef}
          src={src}
          className="w-full h-48 object-cover cursor-pointer"
          onClick={handleVideoClick}
          muted={isMuted}
          loop
          preload="metadata"
        />
        
        {/* Video Controls Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              onClick={restartVideo}
              className="p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={toggleMute}
              className="p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>

        {/* Play button overlay when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="p-4 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <Play size={32} />
            </button>
          </div>
        )}

        {/* Video title */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <p className="text-white text-sm font-medium">{title}</p>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E1E1E] rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modal-in">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Database size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">SQL Database Setup</h2>
                <p className="text-sm text-gray-400">Step {currentStep} of 3</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Step Progress Indicator */}
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Database</span>
            <span>CSV Data</span>
            <span>Python Script</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        <div className="p-6">
          {/* Step 1: Database Connection */}
          {currentStep === 1 && (
            <form onSubmit={handleDatabaseSubmit} className="space-y-4">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Database Connection</h3>
                <p className="text-gray-400">Connect to your SQL database to start analyzing your data.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Database Host
                </label>
                <input
                  type="text"
                  required
                  value={formData.db_host}
                  onChange={(e) => setFormData({ ...formData, db_host: e.target.value })}
                  className="w-full px-4 py-3 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors"
                  placeholder="localhost"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Database Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.db_name}
                  onChange={(e) => setFormData({ ...formData, db_name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors"
                  placeholder="my_database"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.db_user}
                  onChange={(e) => setFormData({ ...formData, db_user: e.target.value })}
                  className="w-full px-4 py-3 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors"
                  placeholder="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.db_password}
                  onChange={(e) => setFormData({ ...formData, db_password: e.target.value })}
                  className="w-full px-4 py-3 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>

              {connectionStatus !== 'idle' && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  connectionStatus === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {connectionStatus === 'success' ? (
                    <CheckCircle size={20} />
                  ) : (
                    <AlertCircle size={20} />
                  )}
                  <span className="text-sm">
                    {connectionStatus === 'success' ? 'Connection successful!' : 'Connection failed'}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect Database'
                )}
              </button>
            </form>
          )}

          {/* Step 2: CSV Upload */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Upload CSV Data</h3>
                <p className="text-gray-400">
                  Upload your CSV file to import data into the connected database. This step allows you to seamlessly 
                  integrate external data sources with your existing database structure for comprehensive analysis.
                </p>
              </div>

              {/* Video Tutorial */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-white mb-3">How to Upload CSV Files</h4>
                <VideoPlayer
                  src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
                  isPlaying={csvVideoPlaying}
                  setIsPlaying={setCsvVideoPlaying}
                  isMuted={csvVideoMuted}
                  setIsMuted={setCsvVideoMuted}
                  title="CSV Upload Tutorial"
                />
                <p className="text-gray-400 text-sm mt-3">
                  This tutorial demonstrates the proper format and structure required for CSV uploads. 
                  Learn about data validation, column mapping, and best practices for data import.
                </p>
              </div>

              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
                <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                <h4 className="text-lg font-medium text-white mb-2">Drop your CSV file here</h4>
                <p className="text-gray-400 mb-4">or click to browse files</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Select CSV File
                </label>
              </div>

              {csvFile && (
                <div className="bg-[#121212] rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <FileText size={24} className="text-blue-400" />
                    <div>
                      <p className="text-white font-medium">{csvFile.name}</p>
                      <p className="text-gray-400 text-sm">
                        {(csvFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <CheckCircle size={20} className="text-green-400 ml-auto" />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  onClick={handleCsvNext}
                  disabled={!csvFile || isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Next Step'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Python Script Upload */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Upload Python Script</h3>
                <p className="text-gray-400">
                  Upload your Python script for advanced data processing and analysis. This script will be executed 
                  against your database and CSV data to perform custom analytics, data transformations, and generate 
                  insights tailored to your specific requirements.
                </p>
              </div>

              {/* Video Tutorial */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-white mb-3">Python Script Integration Guide</h4>
                <VideoPlayer
                  src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4"
                  isPlaying={pythonVideoPlaying}
                  setIsPlaying={setPythonVideoPlaying}
                  isMuted={pythonVideoMuted}
                  setIsMuted={setPythonVideoMuted}
                  title="Python Script Tutorial"
                />
                <p className="text-gray-400 text-sm mt-3">
                  Learn how to structure your Python scripts for optimal integration with our platform. 
                  This guide covers API usage, data access patterns, and security best practices for script execution.
                </p>
              </div>

              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
                <Code size={48} className="mx-auto mb-4 text-gray-400" />
                <h4 className="text-lg font-medium text-white mb-2">Drop your Python file here</h4>
                <p className="text-gray-400 mb-4">Supports .py files only</p>
                <input
                  type="file"
                  accept=".py"
                  onChange={handlePythonUpload}
                  className="hidden"
                  id="python-upload"
                />
                <label
                  htmlFor="python-upload"
                  className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Select Python File
                </label>
              </div>

              {pythonFile && (
                <div className="bg-[#121212] rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Code size={24} className="text-blue-400" />
                    <div>
                      <p className="text-white font-medium">{pythonFile.name}</p>
                      <p className="text-gray-400 text-sm">
                        {(pythonFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <CheckCircle size={20} className="text-green-400 ml-auto" />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={!pythonFile || isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SQLModal;