using System;
using MediatR;

namespace TouristSystem.Application.Features.Restaurants.Commands.CreateRestaurant;

/// <summary>
/// CQRS request record to create a new Restaurant.
/// </summary>
public record CreateRestaurantCommand(
    Guid OwnerId,
    string Name,
    string Description,
    string City,
    string Address,
    decimal? Latitude,
    decimal? Longitude,
    string PhoneNumber,
    string? WebsiteUrl,
    string? ImageUrl,
    string CuisineType,
    string PriceRange,
    string OpeningHours,
    bool HasDelivery,
    bool HasWifi,
    bool HasParking) : IRequest<Guid>;
