using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Enums;

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
        CancellationToken cancellationToken = default,
        IReadOnlyCollection<Guid>? referenceIds = null);

    Task<Booking?> GetWithUserByIdAsync(Guid id, CancellationToken cancellationToken = default);

    // ---------- Partner Portal ----------

    /// <summary>Paged bookings of one partner. All dates are UTC. Search matches traveler name or email.</summary>
    Task<(IReadOnlyList<Booking> Items, int TotalCount)> GetPartnerPagedAsync(
        Guid partnerId,
        BookingStatus? status,
        DateTime? fromUtc,
        DateTime? toUtc,
        string? search,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);

    /// <summary>Loads a booking (with traveler) only if it belongs to the given partner.</summary>
    Task<Booking?> GetForPartnerAsync(Guid bookingId, Guid partnerId, CancellationToken cancellationToken = default);

    Task<int> CountForPartnerAsync(Guid partnerId, BookingStatus status, CancellationToken cancellationToken = default);

    /// <summary>Confirmed bookings of the partner that start inside [fromUtc, toUtc).</summary>
    Task<IReadOnlyList<Booking>> GetPartnerArrivalsAsync(Guid partnerId, DateTime fromUtc, DateTime toUtc, CancellationToken cancellationToken = default);

    Task<int> CountPartnerChangedToAsync(Guid partnerId, BookingStatus status, DateTime sinceUtc, CancellationToken cancellationToken = default);

    // ---------- Lifecycle (background service) ----------

    Task<IReadOnlyList<Booking>> GetPendingCreatedBeforeAsync(DateTime cutoffUtc, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Booking>> GetConfirmedEndedBeforeAsync(DateTime nowUtc, CancellationToken cancellationToken = default);
}
