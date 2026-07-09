using System;

namespace TouristSystem.Application.Features.Places.Queries.GetPlaceDetail;

/// <summary>
/// Data Transfer Object representing the comprehensive details of a tourist Place.
/// </summary>
public record PlaceDetailDto(
    Guid Id,
    string Name,
    string Slug,
    string Description,
    string City,
    string? Address,
    decimal? Latitude,
    decimal? Longitude,
    string? ImageUrl,
    decimal EntryFee,
    decimal RatingAverage,
    int ReviewsCount,
    string Status,
    DateTime CreatedAt);
