import React, { useState, useRef } from 'react';
import { AiOutlineClose, AiOutlineUpload, AiOutlineFile } from 'react-icons/ai';

interface UploadModalProps {
  onUpload: (files: FileList) => void;
  onClose: () => void;
  uploadProgress: {[key: string]: number};
}

const UploadModal: React.FC<UploadModalProps> = ({ onUpload, onClose, uploadProgress }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles(files);
    }
  };

  const handleUpload = () => {
    if (selectedFiles) {
      onUpload(selectedFiles);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="modal-overlay">
      <div className="upload-modal">
        <div className="modal-header">
          <h3>Upload Files</h3>
          <button className="close-btn" onClick={onClose}>
            <AiOutlineClose />
          </button>
        </div>

        <div className="modal-body">
          <div 
            className={`dropzone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <AiOutlineUpload className="upload-icon" />
            <p>Drag and drop files here or click to select</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={handleFileSelect}
            />
          </div>

          {selectedFiles && (
            <div className="selected-files">
              <h4>Selected Files ({selectedFiles.length})</h4>
              <div className="file-list">
                {Array.from(selectedFiles).map((file, index) => (
                  <div key={index} className="file-item">
                    <AiOutlineFile className="file-icon" />
                    <div className="file-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                    </div>
                    {uploadProgress[file.name] !== undefined && (
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${uploadProgress[file.name]}%` }}
                        />
                        <span className="progress-text">
                          {Math.round(uploadProgress[file.name])}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="upload-btn" 
            onClick={handleUpload}
            disabled={!selectedFiles || Object.keys(uploadProgress).length > 0}
          >
            Upload Files
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;