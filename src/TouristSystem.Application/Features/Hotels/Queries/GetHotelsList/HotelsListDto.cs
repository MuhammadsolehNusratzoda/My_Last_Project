using System;

namespace TouristSystem.Application.Features.Hotels.Queries.GetHotelsList;

/// <summary>
/// Data Transfer Object representing a summary of a Hotel for collection listings.
/// </summary>
public record HotelsListDto(
    Guid Id,
    string Name,
    string Slug,
    string City,
    string Address,
    string? ImageUrl,
    decimal PricePerNight,
    int Stars,
    decimal RatingAverage,
    int ReviewsCount,
    int AvailableRooms);
