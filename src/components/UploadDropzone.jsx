import React, { useState, useRef } from 'react';
import { UploadCloud, File, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import api from '../services/api';

export const UploadDropzone = ({ onUploadSuccess }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [modelName, setModelName] = useState('');
  
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return false;
    
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'glb') {
      setError('Invalid file format. Only .glb 3D files are supported.');
      setFile(null);
      return false;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError('File size exceeds the 50MB limit.');
      setFile(null);
      return false;
    }

    setError(null);
    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        // Pre-fill model name from file name
        const baseName = droppedFile.name.substring(0, droppedFile.name.lastIndexOf('.')) || droppedFile.name;
        setModelName(baseName);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
        setModelName(baseName);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setUploadProgress(10);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('modelName', modelName.trim());

    try {
      const response = await api.post('/models/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          // Clamp progress so it fills smoothly
          setUploadProgress(Math.min(95, percentCompleted));
        },
      });

      setUploadProgress(100);
      setTimeout(() => {
        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }
        // Reset state
        setFile(null);
        setModelName('');
        setUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (err) {
      console.error('Upload API failure:', err);
      setError(err.response?.data?.message || 'Failed to upload 3D model. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={!uploading ? triggerFileInput : null}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-64 ${
            isDragActive
              ? 'border-emerald-500 bg-emerald-500/5 shadow-emerald-500/10'
              : 'border-neutral-800 bg-neutral-900/30 hover:border-neutral-700 hover:bg-neutral-900/50'
          } ${uploading ? 'pointer-events-none' : ''}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".glb"
            className="hidden"
            disabled={uploading}
          />

          {!file ? (
            <div className="space-y-4 flex flex-col items-center">
              <div className="p-4 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 group-hover:text-emerald-400 transition-colors">
                <UploadCloud className="w-10 h-10 animate-bounce" />
              </div>
              <div>
                <p className="text-base font-semibold text-neutral-200">
                  Drag and drop your <span className="text-emerald-400">.glb</span> model here
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  or click to browse local files (max size 50MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 flex flex-col items-center w-full">
              <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <File className="w-10 h-10" />
              </div>
              <div className="w-full max-w-md">
                <p className="text-sm font-semibold text-neutral-200 truncate">{file.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 space-y-4">
              <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
              <div className="w-full max-w-xs bg-neutral-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm font-medium text-neutral-300">
                Uploading model... {uploadProgress}%
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {file && !uploading && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-4 animate-fade-in">
            <div>
              <label htmlFor="modelName" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Model Title
              </label>
              <input
                id="modelName"
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="Give your 3D model a clean name"
                className="mt-2 w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={!modelName.trim()}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-neutral-950 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/20 active:scale-[0.98]"
            >
              <Check className="w-5 h-5" />
              <span>Import to Workspace</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
