using TouristSystem.Domain.Entities;

namespace TouristSystem.Domain.Interfaces;

/// <summary>
/// Persistence contract for booking status history rows.
/// </summary>
public interface IBookingStatusHistoryRepository : IGenericRepository<BookingStatusHistory>
{
    Task<IReadOnlyList<BookingStatusHistory>> GetByBookingIdAsync(Guid bookingId, CancellationToken cancellationToken = default);
}
