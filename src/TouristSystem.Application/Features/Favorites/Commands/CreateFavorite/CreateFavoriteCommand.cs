using System;
using MediatR;

namespace TouristSystem.Application.Features.Favorites.Commands.CreateFavorite;

/// <summary>
/// CQRS request record to bookmark/favorite an entity.
/// </summary>
public record CreateFavoriteCommand(
    Guid UserId,
    string FavoriteType,
    Guid ReferenceId) : IRequest<Guid>;
