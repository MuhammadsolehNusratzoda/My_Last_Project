using System;
using TouristSystem.Domain.Common;
using TouristSystem.Domain.Enums;

namespace TouristSystem.Domain.Entities;

/// <summary>
/// Represents a tourist sight or place of interest in the system, governed by admin moderation.
/// </summary>
public class Place : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? Address { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? ImageUrl { get; set; }
    public decimal EntryFee { get; set; } = 0.00m;
    public decimal RatingAverage { get; set; } = 0.00m;
    public int ReviewsCount { get; set; } = 0;
    public EntityStatus Status { get; set; } = EntityStatus.Pending;
}
