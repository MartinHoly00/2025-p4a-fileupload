using FileUpload.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace FileUpload.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
        {
        }

        public DbSet<DataFile> Files { get; set; }
        public DbSet<FileContent> FileContents { get; set; }
        public DbSet<DataDirectory> Directories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // One-to-one relationship: DataFile -> FileContent
            modelBuilder.Entity<DataFile>()
                .HasOne(f => f.Content)
                .WithOne(c => c.Metadata)
                .HasForeignKey<DataFile>(f => f.ContentId)
                .OnDelete(DeleteBehavior.Cascade);

            // Optional directory relationship
            modelBuilder.Entity<DataFile>()
                .HasOne(f => f.Directory)
                .WithMany(d => d.Files)
                .HasForeignKey(f => f.DirectoryId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
