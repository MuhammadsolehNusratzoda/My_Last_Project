using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using MediatR;

namespace TouristSystem.Application.Features.ProviderRegistration.Commands.UploadProviderDocument;

public class UploadProviderDocumentCommandHandler : IRequestHandler<UploadProviderDocumentCommand, string>
{
    private static readonly HashSet<string> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp"
    };

    private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB

    public async Task<string> Handle(UploadProviderDocumentCommand request, CancellationToken cancellationToken)
    {
        var file = request.File;
        if (file == null || file.Length == 0)
            throw new ArgumentException("No file uploaded.");

        if (file.Length > MaxFileSizeBytes)
            throw new ArgumentException("File size exceeds maximum allowed limit of 5 MB.");

        if (!AllowedMimeTypes.Contains(file.ContentType))
            throw new ArgumentException("Invalid file format. Only JPG, PNG, and WEBP image formats are supported.");

        var ext = file.ContentType switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            _ => Path.GetExtension(file.FileName)
        };

        var category = string.IsNullOrWhiteSpace(request.Category) ? "general" : request.Category.ToLower();
        var fileName = $"{Guid.NewGuid()}{ext}";

        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "providers", category);
        Directory.CreateDirectory(uploadsDir);

        var filePath = Path.Combine(uploadsDir, fileName);
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        return $"/uploads/providers/{category}/{fileName}";
    }
}
