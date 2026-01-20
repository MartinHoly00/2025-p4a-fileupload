using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace FileUpload.Server.Models
{
    public class DataFile
    {
        [Key]
        public Guid Uuid { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string Extension { get; set; } = string.Empty;
        public DateTime UploadTimestamp { get; set; }
        public bool IsComplete { get; set; } = false;

        // Foreign key to binary content
        public Guid ContentId { get; set; }
        [JsonIgnore]
        public FileContent Content { get; set; } = null!;

        // Optional directory assignment
        public int? DirectoryId { get; set; }
        [JsonIgnore]
        public DataDirectory? Directory { get; set; }
    }
}
