using System;
using TouristSystem.Domain.Common;

namespace TouristSystem.Domain.Entities;

/// <summary>
/// Vehicle gallery photo attached to a ProviderVehicle (3 to 10 photos required).
/// </summary>
public class VehiclePhoto : AuditableEntity
{
    public Guid VehicleId { get; set; }
    public string PhotoUrl { get; set; } = string.Empty;
    public bool IsPrimary { get; set; } = false;
    public int DisplayOrder { get; set; } = 0;

    // Navigation property
    public ProviderVehicle Vehicle { get; set; } = null!;
}
