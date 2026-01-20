import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as tus from 'tus-js-client';
import './UploadPage.css';

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  error?: string;
}

function UploadPage() {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      setUploads((prev) => [
        ...prev,
        { fileName: file.name, progress: 0, status: 'uploading' },
      ]);

      const upload = new tus.Upload(file, {
        endpoint: '/upload',
        retryDelays: [0, 3000, 5000, 10000, 20000],
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
        onError: (error) => {
          console.error('Upload error:', error);
          setUploads((prev) =>
            prev.map((u) =>
              u.fileName === file.name
                ? { ...u, status: 'error', error: error.message }
                : u
            )
          );
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
          setUploads((prev) =>
            prev.map((u) =>
              u.fileName === file.name ? { ...u, progress: percentage } : u
            )
          );
        },
        onSuccess: () => {
          setUploads((prev) =>
            prev.map((u) =>
              u.fileName === file.name
                ? { ...u, progress: 100, status: 'complete' }
                : u
            )
          );
        },
      });

      upload.start();
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const clearCompleted = () => {
    setUploads((prev) => prev.filter((u) => u.status === 'uploading'));
  };

  return (
    <div className="upload-page">
      <header className="page-header">
        <h1>📁 File Upload</h1>
        <Link to="/files" className="nav-link">
          View All Files →
        </Link>
      </header>
      <p className="subtitle">Drag & drop files or click to browse</p>

      <div
        className={`dropzone ${isDragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          id="fileInput"
          multiple
          onChange={handleFileInput}
          hidden
        />
        <label htmlFor="fileInput" className="dropzone-label">
          <span className="dropzone-icon">📤</span>
          <span>Drop files here or click to upload</span>
          <span className="dropzone-hint">All file types supported</span>
        </label>
      </div>

      {uploads.length > 0 && (
        <div className="uploads-list">
          <div className="uploads-header">
            <h2>Uploads</h2>
            <button onClick={clearCompleted} className="clear-btn">
              Clear Completed
            </button>
          </div>
          {uploads.map((upload, index) => (
            <div key={index} className={`upload-item ${upload.status}`}>
              <div className="upload-info">
                <span className="upload-name">{upload.fileName}</span>
                <span className="upload-status">
                  {upload.status === 'uploading' && `${upload.progress}%`}
                  {upload.status === 'complete' && '✓ Complete'}
                  {upload.status === 'error' && `✗ ${upload.error}`}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UploadPage;
