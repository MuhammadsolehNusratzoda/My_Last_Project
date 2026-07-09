using System;

namespace TouristSystem.Application.Features.Restaurants.Queries.GetRestaurantDetail;

/// <summary>
/// Data Transfer Object representing the comprehensive details of a Restaurant.
/// </summary>
public record RestaurantDetailDto(
    Guid Id,
    Guid OwnerId,
    string Name,
    string Slug,
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
    decimal RatingAverage,
    int ReviewsCount,
    bool HasDelivery,
    bool HasWifi,
    bool HasParking,
    string Status,
    DateTime CreatedAt);
