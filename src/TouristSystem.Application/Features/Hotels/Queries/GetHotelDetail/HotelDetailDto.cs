using System;

namespace TouristSystem.Application.Features.Hotels.Queries.GetHotelDetail;

/// <summary>
/// Data Transfer Object representing the comprehensive details of a Hotel.
/// </summary>
public record HotelDetailDto(
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
    decimal PricePerNight,
    int Stars,
    decimal RatingAverage,
    int ReviewsCount,
    int TotalRooms,
    int AvailableRooms,
    bool HasWifi,
    bool HasParking,
    bool HasPool,
    bool HasGym,
    bool HasRestaurant,
    bool IsFamilyFriendly,
    bool IsLuxury,
    bool IsBudget,
    string Status,
    DateTime CreatedAt);
