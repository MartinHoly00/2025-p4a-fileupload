using FileUpload.Server.Data;
using FileUpload.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FileUpload.Server.Controllers
{
    [ApiController]
    [Route("api")]
    public class DirectoriesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public DirectoriesController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("directories")]
        public async Task<ActionResult<IEnumerable<DirectoryDto>>> GetDirectories()
        {
            var directories = await _db.Directories
                .Select(d => new DirectoryDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    FileCount = _db.Files.Count(f => f.DirectoryId == d.Id)
                })
                .ToListAsync();
            return Ok(directories);
        }

        [HttpGet("directory/{id:int}")]
        public async Task<ActionResult<DirectoryDto>> GetDirectory(int id)
        {
            var directory = await _db.Directories
                .Where(d => d.Id == id)
                .Select(d => new DirectoryDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    FileCount = _db.Files.Count(f => f.DirectoryId == d.Id)
                })
                .FirstOrDefaultAsync();

            if (directory == null)
            {
                return NotFound();
            }

            return Ok(directory);
        }

        [HttpPost("directories")]
        public async Task<ActionResult<DirectoryDto>> CreateDirectory([FromBody] CreateDirectoryRequest request)
        {
            var directory = new DataDirectory
            {
                Name = request.Name
            };

            _db.Directories.Add(directory);
            await _db.SaveChangesAsync();

            var result = new DirectoryDto
            {
                Id = directory.Id,
                Name = directory.Name,
                FileCount = 0
            };

            return CreatedAtAction(nameof(GetDirectory), new { id = directory.Id }, result);
        }

        [HttpGet("directory/{id:int}/files")]
        public async Task<ActionResult<IEnumerable<DataFile>>> GetDirectoryFiles(int id)
        {
            var directory = await _db.Directories.FindAsync(id);
            if (directory == null)
            {
                return NotFound();
            }

            var files = await _db.Files
                .Where(f => f.DirectoryId == id)
                .ToListAsync();

            return Ok(files);
        }
    }

    public class DirectoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int FileCount { get; set; }
    }

    public class CreateDirectoryRequest
    {
        public string Name { get; set; } = string.Empty;
    }
}
