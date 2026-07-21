using System;
using TouristSystem.Domain.Common;

namespace TouristSystem.Domain.Entities;

/// <summary>
/// Daily working schedule definition for a passenger provider.
/// </summary>
public class ProviderWorkingHour : AuditableEntity
{
    public Guid ProviderProfileId { get; set; }
    public string DayOfWeek { get; set; } = "Monday"; // Monday, Tuesday, etc.
    public TimeSpan StartTime { get; set; } = new TimeSpan(8, 0, 0);
    public TimeSpan EndTime { get; set; } = new TimeSpan(20, 0, 0);
    public bool Is24Hours { get; set; } = false;

    // Navigation property
    public TransportProviderProfile ProviderProfile { get; set; } = null!;
}
