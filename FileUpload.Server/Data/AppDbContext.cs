using FileUpload.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace FileUpload.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
        {
        }

        public DbSet<DataFile> Files { get; set; }

        public DbSet<DataDirectory> Directories { get; set; }
    }
}
