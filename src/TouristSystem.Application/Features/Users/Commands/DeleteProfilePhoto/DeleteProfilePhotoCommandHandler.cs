using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Users.Commands.DeleteProfilePhoto;

/// <summary>
/// Handles deletion of a user's profile photo from disk and database.
/// </summary>
public class DeleteProfilePhotoCommandHandler : IRequestHandler<DeleteProfilePhotoCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteProfilePhotoCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteProfilePhotoCommand request, CancellationToken cancellationToken)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
            throw new KeyNotFoundException("User not found.");

        // Delete files from disk
        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profiles");
        if (Directory.Exists(uploadsDir))
        {
            foreach (var existing in Directory.GetFiles(uploadsDir, $"{request.UserId}.*"))
            {
                File.Delete(existing);
            }
        }

        user.ProfileImageUrl = null;
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
