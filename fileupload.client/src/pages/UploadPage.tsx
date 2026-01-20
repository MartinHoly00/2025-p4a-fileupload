import { useState, useCallback } from 'react';
import * as tus from 'tus-js-client';
import Header from '../components/Header';
import Dropzone from '../components/Dropzone';
import UploadItem from '../components/UploadItem';
import Button from '../components/Button';
import './UploadPage.css';

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  error?: string;
}

function UploadPage() {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const handleFilesSelected = useCallback((files: File[]) => {
    files.forEach((file) => {
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

  const clearCompleted = () => {
    setUploads((prev) => prev.filter((u) => u.status === 'uploading'));
  };

  return (
    <div className="upload-page">
      <Header title="Nalož" highlightedText=".to" />
      <p className="subtitle">Drag & drop files or click to browse</p>

      <Dropzone onFilesSelected={handleFilesSelected} />

      {uploads.length > 0 && (
        <div className="uploads-list">
          <div className="uploads-header">
            <h2>Uploads</h2>
            <Button variant="secondary" onClick={clearCompleted}>
              Clear Done
            </Button>
          </div>
          {uploads.map((upload, index) => (
            <UploadItem
              key={index}
              fileName={upload.fileName}
              progress={upload.progress}
              status={upload.status}
              error={upload.error}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default UploadPage;
