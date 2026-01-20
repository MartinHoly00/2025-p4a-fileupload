import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import FileCard from '../components/FileCard';
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

  if (loading) {
    return (
      <div className="files-page">
        <Header title="All" highlightedText=" Files" />
        <div className="loading">Loading files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="files-page">
        <Header title="All" highlightedText=" Files" />
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="files-page">
      <Header title="All" highlightedText=" Files" />

      {files.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>No files uploaded yet</p>
          <Link to="/" className="upload-link">
            Upload First File
          </Link>
        </div>
      ) : (
        <div className="files-grid">
          {files.map((file) => (
            <FileCard
              key={file.uuid}
              uuid={file.uuid}
              name={file.name}
              extension={file.extension}
              uploadTimestamp={file.uploadTimestamp}
              isComplete={file.isComplete}
            />
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
