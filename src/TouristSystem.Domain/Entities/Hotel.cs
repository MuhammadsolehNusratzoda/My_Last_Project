using System;
using TouristSystem.Domain.Common;
using TouristSystem.Domain.Enums;

namespace TouristSystem.Domain.Entities;

/// <summary>
/// Represents a hotel listing managed by a HotelOwner and moderated by platform administrators.
/// </summary>
public class Hotel : AuditableEntity
{
    public Guid OwnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string? WebsiteUrl { get; set; }
    public string? ImageUrl { get; set; }
    public decimal PricePerNight { get; set; }
    public int Stars { get; set; }
    public decimal RatingAverage { get; set; } = 0.00m;
    public int ReviewsCount { get; set; } = 0;
    public int TotalRooms { get; set; }
    public int AvailableRooms { get; set; }
    public bool HasWifi { get; set; } = false;
    public bool HasParking { get; set; } = false;
    public bool HasPool { get; set; } = false;
    public bool HasGym { get; set; } = false;
    public bool HasRestaurant { get; set; } = false;
    public bool IsFamilyFriendly { get; set; } = false;
    public bool IsLuxury { get; set; } = false;
    public bool IsBudget { get; set; } = false;
    public EntityStatus Status { get; set; } = EntityStatus.Pending;

    // Navigation properties
    public User Owner { get; set; } = null!;
}
