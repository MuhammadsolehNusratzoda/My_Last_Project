using System;
using TouristSystem.Domain.Common;

namespace TouristSystem.Domain.Entities;

/// <summary>
/// Stores active user sessions and refresh tokens to facilitate secure JWT token rotation.
/// </summary>
public class RefreshToken : BaseEntity
{
    public Guid UserId { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RevokedAt { get; set; }
    public Guid? ReplacedByTokenId { get; set; }
    public string? DeviceInfo { get; set; }
    public string? IpAddress { get; set; }
    public bool IsRevoked { get; set; } = false;

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsActive => !IsRevoked && !IsExpired;

    // Navigation properties
    public User User { get; set; } = null!;
}
