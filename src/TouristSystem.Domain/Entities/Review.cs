using System;
using TouristSystem.Domain.Common;
using TouristSystem.Domain.Enums;

namespace TouristSystem.Domain.Entities;

/// <summary>
/// Represents a tourist review and rating for places, hotels, restaurants, or guides.
/// </summary>
public class Review : AuditableEntity
{
    public Guid UserId { get; set; }
    public ReviewType ReviewType { get; set; } = ReviewType.Place;
    public Guid ReferenceId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public EntityStatus Status { get; set; } = EntityStatus.Pending;

    // Navigation properties
    public User User { get; set; } = null!;
}
