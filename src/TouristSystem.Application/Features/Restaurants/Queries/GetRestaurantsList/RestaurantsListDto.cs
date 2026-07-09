using System;

namespace TouristSystem.Application.Features.Restaurants.Queries.GetRestaurantsList;

/// <summary>
/// Data Transfer Object representing a summary of a Restaurant for listings.
/// </summary>
public record RestaurantsListDto(
    Guid Id,
    string Name,
    string Slug,
    string City,
    string Address,
    string? ImageUrl,
    string CuisineType,
    string PriceRange,
    string OpeningHours,
    decimal RatingAverage,
    int ReviewsCount);
