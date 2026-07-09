using System;

namespace TouristSystem.Application.Features.Favorites.Queries.GetFavoritesList;

/// <summary>
/// Data Transfer Object representing a summary of a user bookmark/favorite.
/// </summary>
public record FavoritesListDto(
    Guid Id,
    Guid UserId,
    string FavoriteType,
    Guid ReferenceId,
    string ItemName,
    string? ItemImageUrl,
    DateTime CreatedAt);
