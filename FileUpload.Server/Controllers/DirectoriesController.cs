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

        /// <summary>
        /// Get all directories
        /// </summary>
        [HttpGet("directories")]
        public async Task<ActionResult<IEnumerable<DataDirectory>>> GetDirectories()
        {
            var directories = await _db.Directories
                .Include(d => d.Files)
                .ToListAsync();
            return Ok(directories);
        }

        /// <summary>
        /// Get a specific directory by ID with its files
        /// </summary>
        [HttpGet("directory/{id:int}")]
        public async Task<ActionResult<DataDirectory>> GetDirectory(int id)
        {
            var directory = await _db.Directories
                .Include(d => d.Files)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (directory == null)
            {
                return NotFound();
            }

            return Ok(directory);
        }

        /// <summary>
        /// Create a new directory
        /// </summary>
        [HttpPost("directories")]
        public async Task<ActionResult<DataDirectory>> CreateDirectory([FromBody] CreateDirectoryRequest request)
        {
            var directory = new DataDirectory
            {
                Name = request.Name
            };

            _db.Directories.Add(directory);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDirectory), new { id = directory.Id }, directory);
        }

        /// <summary>
        /// Get all files in a specific directory
        /// </summary>
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

    public class CreateDirectoryRequest
    {
        public string Name { get; set; } = string.Empty;
    }
}
