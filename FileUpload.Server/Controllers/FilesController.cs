using FileUpload.Server.Data;
using FileUpload.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FileUpload.Server.Controllers
{
    [ApiController]
    [Route("api")]
    public class FilesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public FilesController(AppDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Get all files (metadata only, without binary content)
        /// </summary>
        [HttpGet("files")]
        public async Task<ActionResult<IEnumerable<DataFile>>> GetFiles()
        {
            var files = await _db.Files
                .Include(f => f.Directory)
                .ToListAsync();
            return Ok(files);
        }

        /// <summary>
        /// Get a specific file by ID (metadata only)
        /// </summary>
        [HttpGet("file/{id:guid}")]
        public async Task<ActionResult<DataFile>> GetFile(Guid id)
        {
            var file = await _db.Files
                .Include(f => f.Directory)
                .FirstOrDefaultAsync(f => f.Uuid == id);

            if (file == null)
            {
                return NotFound();
            }

            return Ok(file);
        }

        /// <summary>
        /// Get file binary content for download
        /// </summary>
        [HttpGet("file/{id:guid}/download")]
        public async Task<IActionResult> DownloadFile(Guid id)
        {
            var file = await _db.Files
                .Include(f => f.Content)
                .FirstOrDefaultAsync(f => f.Uuid == id);

            if (file == null)
            {
                return NotFound();
            }

            return File(file.Content.FileBytes, "application/octet-stream", $"{file.Name}");
        }

        /// <summary>
        /// Get file thumbnail
        /// </summary>
        [HttpGet("file/{id:guid}/thumbnail")]
        public async Task<IActionResult> GetThumbnail(Guid id)
        {
            var file = await _db.Files
                .Include(f => f.Content)
                .FirstOrDefaultAsync(f => f.Uuid == id);

            if (file == null)
            {
                return NotFound();
            }

            return File(file.Content.ThumbnailBytes, "image/jpeg");
        }

        /// <summary>
        /// Get all files without a directory assigned
        /// </summary>
        [HttpGet("files/unassigned")]
        public async Task<ActionResult<IEnumerable<DataFile>>> GetUnassignedFiles()
        {
            var files = await _db.Files
                .Where(f => f.DirectoryId == null)
                .ToListAsync();
            return Ok(files);
        }
    }
}
