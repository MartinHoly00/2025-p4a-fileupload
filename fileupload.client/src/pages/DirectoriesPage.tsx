import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './DirectoriesPage.css';

interface Directory {
  id: number;
  name: string;
  files: { uuid: string }[];
}

function DirectoriesPage() {
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDirectories();
  }, []);

  const fetchDirectories = async () => {
    try {
      const response = await fetch('/api/directories');
      if (!response.ok) {
        throw new Error('Failed to fetch directories');
      }
      const data = await response.json();
      setDirectories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="directories-page">
        <div className="loading">Loading directories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="directories-page">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="directories-page">
      <header className="page-header">
        <h1>📁 Directories</h1>
        <nav className="nav-links">
          <Link to="/" className="nav-link">← Home</Link>
          <Link to="/files" className="nav-link">Unassigned Files</Link>
        </nav>
      </header>

      {directories.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📂</span>
          <p>No directories created yet</p>
          <Link to="/" className="create-link">
            Create your first directory
          </Link>
        </div>
      ) : (
        <div className="directories-grid">
          {directories.map((dir) => (
            <Link
              key={dir.id}
              to={`/directory/${dir.id}`}
              className="directory-card"
            >
              <div className="directory-icon">📂</div>
              <div className="directory-info">
                <h3 className="directory-name">{dir.name}</h3>
                <span className="file-count">
                  {dir.files?.length || 0} file{(dir.files?.length || 0) !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="directory-arrow">→</div>
            </Link>
          ))}
        </div>
      )}

      <div className="directories-count">
        Total: {directories.length} director{directories.length !== 1 ? 'ies' : 'y'}
      </div>
    </div>
  );
}

export default DirectoriesPage;
