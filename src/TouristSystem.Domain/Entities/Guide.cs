using System;
using TouristSystem.Domain.Common;
using TouristSystem.Domain.Enums;

namespace TouristSystem.Domain.Entities;

/// <summary>
/// Represents a local tour guide profile linked to a User account and subject to verification.
/// </summary>
public class Guide : AuditableEntity
{
    public Guid UserId { get; set; }
    public string Bio { get; set; } = string.Empty;
    public string Languages { get; set; } = string.Empty; // e.g., "en,ru,uz"
    public string City { get; set; } = string.Empty;
    public decimal PricePerDay { get; set; }
    public int ExperienceYears { get; set; }
    public decimal RatingAverage { get; set; } = 0.00m;
    public int ReviewsCount { get; set; } = 0;
    public string? ImageUrl { get; set; }
    public bool IsAvailable { get; set; } = true;
    public EntityStatus Status { get; set; } = EntityStatus.Pending;

    // Navigation properties
    public User User { get; set; } = null!;
}
