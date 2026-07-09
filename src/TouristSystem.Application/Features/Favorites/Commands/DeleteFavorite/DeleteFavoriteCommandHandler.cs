using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Favorites.Commands.DeleteFavorite;

/// <summary>
/// Handles DeleteFavoriteCommand requests, verifying owner permissions and deleting.
/// </summary>
public class DeleteFavoriteCommandHandler : IRequestHandler<DeleteFavoriteCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public DeleteFavoriteCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task Handle(DeleteFavoriteCommand request, CancellationToken cancellationToken)
    {
        var favorite = await _unitOfWork.Favorites.GetByIdAsync(request.Id, cancellationToken);

        if (favorite == null)
        {
            throw new KeyNotFoundException($"Favorite bookmark with ID '{request.Id}' was not found.");
        }

        var currentUserId = _currentUserService.UserId;
        if (currentUserId == null)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var currentUser = await _unitOfWork.Users.GetByIdAsync(currentUserId.Value, cancellationToken);
        bool isAdmin = currentUser != null && (currentUser.Role == UserRole.Admin || currentUser.Role == UserRole.SuperAdmin);

        if (favorite.UserId != currentUserId.Value && !isAdmin)
        {
            throw new UnauthorizedAccessException("You are not authorized to delete this bookmark.");
        }

        _unitOfWork.Favorites.Delete(favorite);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
