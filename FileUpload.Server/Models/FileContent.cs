using System.ComponentModel.DataAnnotations;

namespace FileUpload.Server.Models
{
    public class FileContent
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public byte[] FileBytes { get; set; } = Array.Empty<byte>();
        public byte[] ThumbnailBytes { get; set; } = Array.Empty<byte>();

        public DataFile Metadata { get; set; } = null!;
    }
}
