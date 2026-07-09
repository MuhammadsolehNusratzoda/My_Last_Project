namespace TouristSystem.Domain.Enums;

/// <summary>
/// Dictates the current lifecycle status of a booking.
/// </summary>
public enum BookingStatus
{
    Pending = 1,
    Confirmed = 2,
    Cancelled = 3,
    Expired = 4,
    Completed = 5
}
