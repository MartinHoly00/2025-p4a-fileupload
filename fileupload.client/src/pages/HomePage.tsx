import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as tus from 'tus-js-client';
import './HomePage.css';

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  error?: string;
}

interface Directory {
  id: number;
  name: string;
}

function HomePage() {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [selectedDirectory, setSelectedDirectory] = useState<number | null>(null);
  const [newDirectoryName, setNewDirectoryName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchDirectories();
  }, []);

  const fetchDirectories = async () => {
    try {
      const response = await fetch('/api/directories');
      if (response.ok) {
        const data = await response.json();
        setDirectories(data);
      }
    } catch (err) {
      console.error('Failed to fetch directories:', err);
    }
  };

  const createDirectory = async () => {
    if (!newDirectoryName.trim()) return;
    
    setCreating(true);
    try {
      const response = await fetch('/api/directories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDirectoryName.trim() })
      });
      
      if (response.ok) {
        const newDir = await response.json();
        setDirectories(prev => [...prev, newDir]);
        setNewDirectoryName('');
        setShowCreateForm(false);
        setSelectedDirectory(newDir.id);
      }
    } catch (err) {
      console.error('Failed to create directory:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      setUploads((prev) => [
        ...prev,
        { fileName: file.name, progress: 0, status: 'uploading' },
      ]);

      const metadata: Record<string, string> = {
        filename: file.name,
        filetype: file.type,
      };

      if (selectedDirectory) {
        metadata.directoryId = selectedDirectory.toString();
      }

      const upload = new tus.Upload(file, {
        endpoint: '/upload',
        retryDelays: [0, 3000, 5000, 10000, 20000],
        metadata,
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
  }, [selectedDirectory]);

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
    <div className="home-page">
      <header className="page-header">
        <h1>📁 File Upload</h1>
        <nav className="nav-links">
          <Link to="/files" className="nav-link">Unassigned Files</Link>
          <Link to="/directories" className="nav-link">Directories</Link>
        </nav>
      </header>

      <div className="directory-section">
        <div className="directory-controls">
          <label htmlFor="directorySelect">Upload to:</label>
          <select
            id="directorySelect"
            value={selectedDirectory ?? ''}
            onChange={(e) => setSelectedDirectory(e.target.value ? Number(e.target.value) : null)}
            className="directory-select"
          >
            <option value="">No directory (unassigned)</option>
            {directories.map((dir) => (
              <option key={dir.id} value={dir.id}>
                📂 {dir.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="create-dir-btn"
          >
            {showCreateForm ? '✕ Cancel' : '+ New Directory'}
          </button>
        </div>

        {showCreateForm && (
          <div className="create-form">
            <input
              type="text"
              value={newDirectoryName}
              onChange={(e) => setNewDirectoryName(e.target.value)}
              placeholder="Directory name..."
              className="directory-input"
              onKeyDown={(e) => e.key === 'Enter' && createDirectory()}
            />
            <button
              onClick={createDirectory}
              disabled={creating || !newDirectoryName.trim()}
              className="create-btn"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        )}
      </div>

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
          {selectedDirectory && (
            <span className="dropzone-dir">
              Uploading to: {directories.find(d => d.id === selectedDirectory)?.name}
            </span>
          )}
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

export default HomePage;
