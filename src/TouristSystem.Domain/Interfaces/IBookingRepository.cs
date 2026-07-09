using TouristSystem.Domain.Entities;

namespace TouristSystem.Domain.Interfaces;

/// <summary>
/// Defines specific contracts for Booking persistence operations.
/// </summary>
public interface IBookingRepository : IGenericRepository<Booking>
{
    Task<(IReadOnlyList<Booking> Items, int TotalCount)> GetPagedAsync(
        Guid? userId,
        string? bookingType,
        string? bookingStatus,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<Booking?> GetWithUserByIdAsync(Guid id, CancellationToken cancellationToken = default);
}
