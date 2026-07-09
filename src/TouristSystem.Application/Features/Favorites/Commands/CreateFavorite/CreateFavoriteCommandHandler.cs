using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Favorites.Commands.CreateFavorite;

/// <summary>
/// Handles CreateFavoriteCommand requests, preventing duplicates.
/// </summary>
public class CreateFavoriteCommandHandler : IRequestHandler<CreateFavoriteCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateFavoriteCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateFavoriteCommand request, CancellationToken cancellationToken)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID '{request.UserId}' was not found.");
        }

        if (!Enum.TryParse<FavoriteType>(request.FavoriteType, true, out var type))
        {
            throw new ArgumentException("Invalid favorite type.");
        }

        var existing = await _unitOfWork.Favorites.GetAsync(request.UserId, request.FavoriteType, request.ReferenceId, cancellationToken);
        if (existing != null)
        {
            return existing.Id;
        }

        var favorite = new Favorite
        {
            UserId = request.UserId,
            FavoriteType = type,
            ReferenceId = request.ReferenceId,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Favorites.AddAsync(favorite, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return favorite.Id;
    }
}
