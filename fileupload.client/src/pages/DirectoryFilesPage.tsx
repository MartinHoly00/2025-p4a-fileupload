import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './DirectoryFilesPage.css';

interface FileMetadata {
  uuid: string;
  name: string;
  extension: string;
  uploadTimestamp: string;
  isComplete: boolean;
}

interface Directory {
  id: number;
  name: string;
}

function DirectoryFilesPage() {
  const { id } = useParams<{ id: string }>();
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [directory, setDirectory] = useState<Directory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchDirectoryAndFiles();
    }
  }, [id]);

  const fetchDirectoryAndFiles = async () => {
    try {
      const [dirResponse, filesResponse] = await Promise.all([
        fetch(`/api/directory/${id}`),
        fetch(`/api/directory/${id}/files`)
      ]);
      
      if (!dirResponse.ok || !filesResponse.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const dirData = await dirResponse.json();
      const filesData = await filesResponse.json();
      
      setDirectory(dirData);
      setFiles(filesData);
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
      <div className="directory-files-page">
        <div className="loading">Loading files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="directory-files-page">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="directory-files-page">
      <header className="page-header">
        <div className="header-title">
          <Link to="/directories" className="back-arrow">←</Link>
          <h1>📂 {directory?.name || 'Directory'}</h1>
        </div>
        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/directories" className="nav-link">All Directories</Link>
        </nav>
      </header>

      {files.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>No files in this directory</p>
          <Link to="/" className="upload-link">
            Upload files to this directory
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

export default DirectoryFilesPage;
