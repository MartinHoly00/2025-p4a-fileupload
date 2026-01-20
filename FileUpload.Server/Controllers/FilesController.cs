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

        [HttpGet("files")]
        public async Task<ActionResult<IEnumerable<DataFile>>> GetFiles()
        {
            var files = await _db.Files
                .Include(f => f.Directory)
                .ToListAsync();
            return Ok(files);
        }

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

        [HttpGet("files/unassigned")]
        public async Task<ActionResult<IEnumerable<DataFile>>> GetUnassignedFiles()
        {
            var files = await _db.Files
                .Where(f => f.DirectoryId == null)
                .ToListAsync();
            return Ok(files);
        }

        [HttpPut("file/{id:guid}/directory")]
        public async Task<IActionResult> AssignFileToDirectory(Guid id, [FromBody] AssignDirectoryRequest request)
        {
            var file = await _db.Files.FindAsync(id);
            if (file == null)
            {
                return NotFound();
            }

            if (request.DirectoryId.HasValue)
            {
                var directory = await _db.Directories.FindAsync(request.DirectoryId.Value);
                if (directory == null)
                {
                    return BadRequest("Directory not found");
                }
            }

            file.DirectoryId = request.DirectoryId;
            await _db.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("file/{id:guid}")]
        public async Task<IActionResult> DeleteFile(Guid id)
        {
            var file = await _db.Files
                .Include(f => f.Content)
                .FirstOrDefaultAsync(f => f.Uuid == id);

            if (file == null)
            {
                return NotFound();
            }

            if (file.Content != null)
            {
                _db.FileContents.Remove(file.Content);
            }
            _db.Files.Remove(file);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }

    public class AssignDirectoryRequest
    {
        public int? DirectoryId { get; set; }
    }
}
