import './UploadItem.css';

interface UploadItemProps {
  fileName: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  error?: string;
}

function UploadItem({ fileName, progress, status, error }: UploadItemProps) {
  return (
    <div className={`upload-item ${status}`}>
      <div className="upload-info">
        <span className="upload-name">{fileName}</span>
        <span className="upload-status">
          {status === 'uploading' && `${progress}%`}
          {status === 'complete' && '✓ Done'}
          {status === 'error' && `✗ ${error}`}
        </span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export default UploadItem;
