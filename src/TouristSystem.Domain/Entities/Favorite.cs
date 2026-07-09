using System;
using TouristSystem.Domain.Common;
using TouristSystem.Domain.Enums;

namespace TouristSystem.Domain.Entities;

/// <summary>
/// Tracks user bookmarks for places, hotels, restaurants, or guides.
/// </summary>
public class Favorite : BaseEntity
{
    public Guid UserId { get; set; }
    public FavoriteType FavoriteType { get; set; } = FavoriteType.Place;
    public Guid ReferenceId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
}
