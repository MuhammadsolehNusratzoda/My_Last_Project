using System;
using MediatR;

namespace TouristSystem.Application.Features.Hotels.Commands.CreateHotel;

/// <summary>
/// CQRS request record to create a new Hotel.
/// </summary>
public record CreateHotelCommand(
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
    bool HasWifi,
    bool HasParking,
    bool HasPool,
    bool HasGym,
    bool HasRestaurant,
    bool IsFamilyFriendly,
    bool IsLuxury,
    bool IsBudget) : IRequest<Guid>;
