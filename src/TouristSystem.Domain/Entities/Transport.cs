using System;
using TouristSystem.Domain.Common;
using TouristSystem.Domain.Enums;

namespace TouristSystem.Domain.Entities;

/// <summary>
/// Represents a transport route/schedule provided by a TransportOwner and bookable by tourists.
/// </summary>
public class Transport : AuditableEntity
{
    public Guid OwnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public TransportType Type { get; set; } = TransportType.Bus;
    public string OriginCity { get; set; } = string.Empty;
    public string DestinationCity { get; set; } = string.Empty;
    public DateTime DepartureTime { get; set; }
    public DateTime ArrivalTime { get; set; }
    public decimal PricePerSeat { get; set; }
    public int TotalSeats { get; set; }
    public int AvailableSeats { get; set; }
    public string VehicleNumber { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public EntityStatus Status { get; set; } = EntityStatus.Pending;

    // Navigation properties
    public User Owner { get; set; } = null!;
}
