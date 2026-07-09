using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Restaurants.Queries.GetRestaurantDetail;

/// <summary>
/// Handles GetRestaurantDetailQuery requests, resolving targets by ID or slug and mapping them.
/// </summary>
public class GetRestaurantDetailQueryHandler : IRequestHandler<GetRestaurantDetailQuery, RestaurantDetailDto?>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetRestaurantDetailQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<RestaurantDetailDto?> Handle(GetRestaurantDetailQuery request, CancellationToken cancellationToken)
    {
        Restaurant? restaurant;

        if (Guid.TryParse(request.IdOrSlug, out var id))
        {
            restaurant = await _unitOfWork.Restaurants.GetByIdAsync(id, cancellationToken);
        }
        else
        {
            restaurant = await _unitOfWork.Restaurants.GetBySlugAsync(request.IdOrSlug, cancellationToken);
        }

        if (restaurant == null)
        {
            return null;
        }

        return new RestaurantDetailDto(
            restaurant.Id,
            restaurant.OwnerId,
            restaurant.Name,
            restaurant.Slug,
            restaurant.Description,
            restaurant.City,
            restaurant.Address,
            restaurant.Latitude,
            restaurant.Longitude,
            restaurant.PhoneNumber,
            restaurant.WebsiteUrl,
            restaurant.ImageUrl,
            restaurant.CuisineType,
            restaurant.PriceRange.ToString(),
            restaurant.OpeningHours,
            restaurant.RatingAverage,
            restaurant.ReviewsCount,
            restaurant.HasDelivery,
            restaurant.HasWifi,
            restaurant.HasParking,
            restaurant.Status.ToString(),
            restaurant.CreatedAt);
    }
}
