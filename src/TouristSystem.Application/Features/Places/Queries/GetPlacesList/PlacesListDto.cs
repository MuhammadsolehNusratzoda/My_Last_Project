using System;

namespace TouristSystem.Application.Features.Places.Queries.GetPlacesList;

/// <summary>
/// Data Transfer Object representing a summary of a tourist Place for collection listings.
/// </summary>
public record PlacesListDto(
    Guid Id,
    string Name,
    string Slug,
    string City,
    string? ImageUrl,
    decimal EntryFee,
    decimal RatingAverage,
    int ReviewsCount);
