using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Users.Commands.UploadProfilePhoto;

/// <summary>
/// Handles profile photo upload: validates file, saves to disk, updates user record.
/// </summary>
public class UploadProfilePhotoCommandHandler : IRequestHandler<UploadProfilePhotoCommand, string>
{
    private readonly IUnitOfWork _unitOfWork;

    private static readonly HashSet<string> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/gif", "image/webp"
    };

    private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB

    public UploadProfilePhotoCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<string> Handle(UploadProfilePhotoCommand request, CancellationToken cancellationToken)
    {
        var file = request.File;

        if (file == null || file.Length == 0)
            throw new ArgumentException("No file provided.");

        if (file.Length > MaxFileSizeBytes)
            throw new ArgumentException("File size exceeds the 5 MB limit.");

        if (!AllowedMimeTypes.Contains(file.ContentType))
            throw new ArgumentException("Only JPEG, PNG, GIF, and WebP images are allowed.");

        var user = await _unitOfWork.Users.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
            throw new KeyNotFoundException("User not found.");

        // Determine file extension from content type
        var extension = file.ContentType switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/gif" => ".gif",
            "image/webp" => ".webp",
            _ => ".jpg"
        };

        var fileName = $"{request.UserId}{extension}";
        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profiles");
        Directory.CreateDirectory(uploadsDir);

        // Delete old file if it exists with a different extension
        foreach (var existing in Directory.GetFiles(uploadsDir, $"{request.UserId}.*"))
        {
            File.Delete(existing);
        }

        var filePath = Path.Combine(uploadsDir, fileName);
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        var relativeUrl = $"/uploads/profiles/{fileName}";
        user.ProfileImageUrl = relativeUrl;
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return relativeUrl;
    }
}
