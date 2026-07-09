using System;
using MediatR;
using TouristSystem.Application.Common.Models;

namespace TouristSystem.Application.Features.Favorites.Queries.GetFavoritesList;

/// <summary>
/// CQRS request record to fetch a paginated list of favorites for a User.
/// </summary>
public record GetFavoritesListQuery(
    Guid UserId,
    int PageNumber = 1,
    int PageSize = 10) : IRequest<PagedList<FavoritesListDto>>;
