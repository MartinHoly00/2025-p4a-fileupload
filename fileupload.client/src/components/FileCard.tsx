import './FileCard.css';

interface FileCardProps {
  uuid: string;
  name: string;
  extension: string;
  uploadTimestamp: string;
  isComplete: boolean;
}

function FileCard({ uuid, name, extension, uploadTimestamp, isComplete }: FileCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getFileIcon = (ext: string) => {
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
    return icons[ext.toLowerCase()] || '📁';
  };

  return (
    <div className="file-card">
      <div className="file-icon">{getFileIcon(extension)}</div>
      <div className="file-info">
        <h3 className="file-name" title={name}>
          {name}
        </h3>
        <div className="file-details">
          <span className="file-ext">.{extension}</span>
          <span className="file-date">{formatDate(uploadTimestamp)}</span>
        </div>
        <div className="file-status">
          {isComplete ? (
            <span className="status complete">✓ Complete</span>
          ) : (
            <span className="status pending">⏳ Pending</span>
          )}
        </div>
      </div>
      <div className="file-actions">
        <a
          href={`/api/file/${uuid}/download`}
          className="action-btn download"
          title="Download"
        >
          ⬇️
        </a>
      </div>
    </div>
  );
}

export default FileCard;
