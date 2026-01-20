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
    }
}
