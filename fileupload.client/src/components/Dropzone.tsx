import { useCallback, useState } from 'react';
import './Dropzone.css';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

function Dropzone({ onFilesSelected }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        onFilesSelected(Array.from(e.dataTransfer.files));
      }
    },
    [onFilesSelected]
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
        onFilesSelected(Array.from(e.target.files));
      }
    },
    [onFilesSelected]
  );

  return (
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
        <span className="dropzone-icon">📦</span>
        <span className="dropzone-text">Drop files here</span>
        <span className="dropzone-hint">All file types supported</span>
      </label>
    </div>
  );
}

export default Dropzone;
