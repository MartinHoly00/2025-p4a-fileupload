using System.Text.Json.Serialization;

namespace FileUpload.Server.Models
{
    public class DataDirectory
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        
        [JsonIgnore]
        public ICollection<DataFile> Files { get; set; } = new List<DataFile>();
    }
}

