using System.ComponentModel.DataAnnotations.Schema;

namespace FileUpload.Server.Models
{
    public class DataDirectory
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public ICollection<DataFile> Files { get; set; } = new List<DataFile>();
    }
}
