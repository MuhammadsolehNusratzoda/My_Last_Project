namespace TouristSystem.Application.Features.Map;

/// <summary>
/// Lightweight DTO representing any map-pinnable destination:
/// tourist place, hotel, restaurant, or guide meetup city.
/// </summary>
public record MapDestinationDto(
    Guid Id,
    string Name,
    string Category,      // "place" | "hotel" | "restaurant"
    string City,
    decimal Latitude,
    decimal Longitude,
    string? ImageUrl,
    string? Description);
