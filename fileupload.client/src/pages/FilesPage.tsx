import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './FilesPage.css';

interface FileMetadata {
  uuid: string;
  name: string;
  extension: string;
  uploadTimestamp: string;
  isComplete: boolean;
  directoryId: number | null;
}

function FilesPage() {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files');
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getFileIcon = (extension: string) => {
    const icons: Record<string, string> = {
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      webp: '🖼️',
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      zip: '📦',
      rar: '📦',
      mp3: '🎵',
      mp4: '🎬',
      txt: '📃',
    };
    return icons[extension.toLowerCase()] || '📁';
  };

  if (loading) {
    return (
      <div className="files-page">
        <div className="loading">Loading files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="files-page">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="files-page">
      <header className="page-header">
        <h1>📂 All Files</h1>
        <Link to="/" className="nav-link">
          ← Back to Upload
        </Link>
      </header>

      {files.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>No files uploaded yet</p>
          <Link to="/" className="upload-link">
            Upload your first file
          </Link>
        </div>
      ) : (
        <div className="files-grid">
          {files.map((file) => (
            <div key={file.uuid} className="file-card">
              <div className="file-icon">{getFileIcon(file.extension)}</div>
              <div className="file-info">
                <h3 className="file-name" title={file.name}>
                  {file.name}
                </h3>
                <div className="file-details">
                  <span className="file-ext">.{file.extension}</span>
                  <span className="file-date">{formatDate(file.uploadTimestamp)}</span>
                </div>
                <div className="file-status">
                  {file.isComplete ? (
                    <span className="status complete">✓ Complete</span>
                  ) : (
                    <span className="status pending">⏳ Pending</span>
                  )}
                </div>
              </div>
              <div className="file-actions">
                <a
                  href={`/api/file/${file.uuid}/download`}
                  className="action-btn download"
                  title="Download"
                >
                  ⬇️
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="files-count">
        Total: {files.length} file{files.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

export default FilesPage;
