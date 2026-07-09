using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Common.Models;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Favorites.Queries.GetFavoritesList;

/// <summary>
/// Handles GetFavoritesListQuery requests, resolving items details and mapping them.
/// </summary>
public class GetFavoritesListQueryHandler : IRequestHandler<GetFavoritesListQuery, PagedList<FavoritesListDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetFavoritesListQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedList<FavoritesListDto>> Handle(GetFavoritesListQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _unitOfWork.Favorites.GetPagedAsync(
            request.UserId,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var dtos = new List<FavoritesListDto>();

        foreach (var fav in items)
        {
            string itemName = "Unknown";
            string? imageUrl = null;

            if (fav.FavoriteType == FavoriteType.Place)
            {
                var place = await _unitOfWork.Places.GetByIdAsync(fav.ReferenceId, cancellationToken);
                if (place != null)
                {
                    itemName = place.Name;
                    imageUrl = place.ImageUrl;
                }
            }
            else if (fav.FavoriteType == FavoriteType.Hotel)
            {
                var hotel = await _unitOfWork.Hotels.GetByIdAsync(fav.ReferenceId, cancellationToken);
                if (hotel != null)
                {
                    itemName = hotel.Name;
                    imageUrl = hotel.ImageUrl;
                }
            }
            else if (fav.FavoriteType == FavoriteType.Restaurant)
            {
                var restaurant = await _unitOfWork.Restaurants.GetByIdAsync(fav.ReferenceId, cancellationToken);
                if (restaurant != null)
                {
                    itemName = restaurant.Name;
                    imageUrl = restaurant.ImageUrl;
                }
            }
            else if (fav.FavoriteType == FavoriteType.Guide)
            {
                var guide = await _unitOfWork.Guides.GetWithUserByIdAsync(fav.ReferenceId, cancellationToken);
                if (guide != null)
                {
                    itemName = guide.User.FullName;
                    imageUrl = guide.ImageUrl;
                }
            }

            dtos.Add(new FavoritesListDto(
                fav.Id,
                fav.UserId,
                fav.FavoriteType.ToString(),
                fav.ReferenceId,
                itemName,
                imageUrl,
                fav.CreatedAt));
        }

        return new PagedList<FavoritesListDto>(dtos, totalCount, request.PageNumber, request.PageSize);
    }
}
