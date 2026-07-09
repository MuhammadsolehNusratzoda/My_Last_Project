using System;
using TouristSystem.Domain.Common;
using TouristSystem.Domain.Enums;

namespace TouristSystem.Domain.Entities;

/// <summary>
/// Represents a restaurant listing managed by a RestaurantOwner and visible to tourists.
/// </summary>
public class Restaurant : AuditableEntity
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
    public string CuisineType { get; set; } = string.Empty;
    public PriceRange PriceRange { get; set; } = PriceRange.Medium;
    public string OpeningHours { get; set; } = string.Empty;
    public decimal RatingAverage { get; set; } = 0.00m;
    public int ReviewsCount { get; set; } = 0;
    public bool HasDelivery { get; set; } = false;
    public bool HasWifi { get; set; } = false;
    public bool HasParking { get; set; } = false;
    public EntityStatus Status { get; set; } = EntityStatus.Pending;

    // Navigation properties
    public User Owner { get; set; } = null!;
}
