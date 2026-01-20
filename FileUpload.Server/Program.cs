using tusdotnet;
using tusdotnet.Interfaces;
using tusdotnet.Stores;
using tusdotnet.Models;
using tusdotnet.Models.Configuration;
using FileUpload.Server.Data;
using FileUpload.Server.Models;
using SixLabors.ImageSharp.Metadata;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using System.Text;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DatabaseConnectionString"))
);

builder.Services.AddSingleton<ITusStore>(sp =>
{
    var env = sp.GetRequiredService<IWebHostEnvironment>();
    var path = Path.Combine(env.ContentRootPath, "tus-state");
    Directory.CreateDirectory(path);

    return new TusDiskStore(path);
});

var app = builder.Build();

// Configure CORS for development
app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader()
    .WithExposedHeaders("Upload-Offset", "Location", "Upload-Length", "Tus-Resumable", "Tus-Version", "Tus-Extension", "Tus-Max-Size"));

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapTus("/upload", async httpContext =>
{
    var tusStore = httpContext.RequestServices.GetRequiredService<ITusStore>();

    return new DefaultTusConfiguration
    {
        Store = tusStore,
        MaxAllowedUploadSizeInBytesLong = 8 * 1024 * 1024 * 1024L,

        Events = new Events
            {
                // Called once upload is complete
                OnFileCompleteAsync = async ctx =>
                {
                    var db = ctx.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
                    var uploadId = ctx.FileId;

                    var filePath = Path.Combine("tus-state", uploadId);

                    var metadataString = await ((ITusCreationStore)ctx.Store).GetUploadMetadataAsync(ctx.FileId, ctx.CancellationToken);
                    var metadata = Metadata.Parse(metadataString);

                    var fileName = metadata.ContainsKey("filename")
                        ? metadata["filename"].GetString(Encoding.UTF8)
                        : "untitled";

                    var fileType = metadata.ContainsKey("filetype")
                        ? metadata["filetype"].GetString(Encoding.UTF8)
                        : "application/octet-stream";

                    var fileExt = Path.GetExtension(fileName)?.TrimStart('.').ToLower() ?? "unknown";

                    var fileBytes = await File.ReadAllBytesAsync(filePath);
                    
                    // Generate thumbnail only for image files
                    byte[] thumbnailBytes = Array.Empty<byte>();
                    var imageExtensions = new[] { "jpg", "jpeg", "png", "gif", "bmp", "webp" };
                    
                    if (imageExtensions.Contains(fileExt))
                    {
                        try
                        {
                            using Image image = await Image.LoadAsync(filePath);
                            var resizeOptions = new ResizeOptions
                            {
                                Mode = ResizeMode.Crop,
                                Size = new Size(64, 64),
                                Position = AnchorPositionMode.Center
                            };
                            image.Mutate(x => x.Resize(resizeOptions));

                            using var ms = new MemoryStream();
                            image.SaveAsJpeg(ms);
                            thumbnailBytes = ms.ToArray();
                        }
                        catch
                        {
                            // If thumbnail generation fails, continue without thumbnail
                        }
                    }

                    // Create FileContent entity for binary data
                    var fileContent = new FileContent
                    {
                        Id = Guid.Parse(uploadId),
                        FileBytes = fileBytes,
                        ThumbnailBytes = thumbnailBytes
                    };

                    // Create DataFile entity for metadata
                    var fileEntity = new DataFile
                    {
                        Uuid = Guid.Parse(uploadId),
                        Name = fileName,
                        Extension = fileExt,
                        UploadTimestamp = DateTime.UtcNow,
                        IsComplete = true,
                        ContentId = fileContent.Id,
                        Content = fileContent
                    };

                    db.FileContents.Add(fileContent);
                    db.Files.Add(fileEntity);
                    await db.SaveChangesAsync();

                    File.Delete(filePath);
                }
            }
    };
});

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
