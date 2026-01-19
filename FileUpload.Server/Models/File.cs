using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FileUpload.Server.Models
{
    public class DataFile
    {
        [Key]
        public Guid Uuid { get; set; } = Guid.NewGuid();
        public string Name { get; set; }
        public string Extension { get; set; }
        public DateTime UploadTimestamp { get; set; }
        public bool IsComplete { get; set; } = false;
        public byte[] FileBytes { get; set; }
        public byte[] ThumbnailBytes { get; set; }

        public int DirectoryId { get; set; }
        public DataDirectory Directory { get; set; } = new DataDirectory();
    }
}
