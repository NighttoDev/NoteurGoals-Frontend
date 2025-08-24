import React from 'react';
import { getFileUrl, isImageFile, isPdfFile, isTextFile } from '../../services/filesService';

interface FilePreviewModalProps {
  file: {
    file_id: number;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
  };
  onClose: () => void;
  onDownload: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose, onDownload }) => {
  const fileUrl = getFileUrl(file.file_path);

  const renderPreview = () => {
    if (isImageFile(file.file_type)) {
      return (
        <div className="image-preview">
          <img src={fileUrl} alt={file.file_name} style={{ maxWidth: '100%', maxHeight: '70vh' }} />
        </div>
      );
    }

    if (isPdfFile(file.file_type)) {
      return (
        <div className="pdf-preview">
          <iframe 
            src={fileUrl} 
            title={file.file_name}
            style={{ width: '100%', height: '70vh', border: 'none' }}
          />
        </div>
      );
    }

    if (isTextFile(file.file_type)) {
      return (
        <div className="text-preview">
          <iframe 
            src={fileUrl} 
            title={file.file_name}
            style={{ width: '100%', height: '70vh', border: '1px solid #ddd' }}
          />
        </div>
      );
    }

    return (
      <div className="no-preview">
        <div className="no-preview-content">
          <h3>Preview not available</h3>
          <p>This file type cannot be previewed in the browser.</p>
          <button onClick={onDownload} className="download-btn">
            Download to view
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content file-preview-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{file.file_name}</h2>
          <div className="modal-actions">
            <button onClick={onDownload} className="download-btn">
              Download
            </button>
            <button onClick={onClose} className="close-btn">
              ×
            </button>
          </div>
        </div>
        
        <div className="modal-body">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;