using System;
using MediatR;

namespace TouristSystem.Application.Features.Restaurants.Commands.UpdateRestaurant;

/// <summary>
/// CQRS request record to update an existing Restaurant.
/// </summary>
public record UpdateRestaurantCommand(
    Guid Id,
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
    bool HasParking,
    string Status) : IRequest;
