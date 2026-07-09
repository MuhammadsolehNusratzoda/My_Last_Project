using System;
using MediatR;

namespace TouristSystem.Application.Features.Hotels.Commands.UpdateHotel;

/// <summary>
/// CQRS request record to update an existing Hotel.
/// </summary>
public record UpdateHotelCommand(
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
    decimal PricePerNight,
    int Stars,
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
    string Status) : IRequest;
