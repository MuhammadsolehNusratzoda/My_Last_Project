using System;
using TouristSystem.Domain.Common;
using TouristSystem.Domain.Enums;

namespace TouristSystem.Domain.Entities;

/// <summary>
/// Represents a reservation transaction in the system (e.g., booking a room in a hotel, booking a seat on a bus, hiring a guide).
/// </summary>
public class Booking : AuditableEntity
{
    public Guid UserId { get; set; }
    public BookingType BookingType { get; set; } = BookingType.Hotel;
    public Guid ReferenceId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int GuestsCount { get; set; }
    public int Quantity { get; set; } = 1;
    public decimal TotalPrice { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public string? Notes { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? CancelledAt { get; set; }

    /// <summary>Owner of the referenced listing (hotel/transport owner, guide user). Set by the server, never by the client.</summary>
    public Guid PartnerId { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime? CompletedAt { get; set; }
    public bool IsNoShow { get; set; } = false;

    // Navigation properties
    public User User { get; set; } = null!;
}
