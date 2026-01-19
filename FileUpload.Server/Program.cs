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

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapTus("/uploads", async httpContext =>
{
    var tusStore = httpContext.RequestServices.GetRequiredService<ITusStore>();

    return new DefaultTusConfiguration
    {
        Store = tusStore,
        UrlPath = "/uploads",
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

                var fileExt = Path.GetExtension(fileName)?.TrimStart('.').ToLower() ?? "unknown";

                var allowedTypes = new[] { "jpg", "jpeg", "png" };
                if (!allowedTypes.Contains(fileExt))
                {
                    File.Delete(filePath);
                    throw new InvalidOperationException("File type not allowed");
                }

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
                var thumbnailBytes = ms.ToArray();

                var fileBytes = await File.ReadAllBytesAsync(filePath);

                var fileEntity = new DataFile
                {
                    Uuid = Guid.Parse(uploadId),
                    Name = fileName,
                    Extension = fileExt,
                    UploadTimestamp = DateTime.UtcNow,
                    FileBytes = fileBytes,
                    ThumbnailBytes = thumbnailBytes
                };

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
