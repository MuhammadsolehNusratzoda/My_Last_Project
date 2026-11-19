using TouristSystem.Domain.Entities;

namespace TouristSystem.Domain.Interfaces;

/// <summary>
/// Defines specific contracts for Transport persistence operations.
/// </summary>
public interface ITransportRepository : IGenericRepository<Transport>
{
    Task<(IReadOnlyList<Transport> Items, int TotalCount)> GetPagedAsync(
        string? searchTerm,
        string? originCity,
        string? destinationCity,
        string? transportType,
        decimal? maxPricePerSeat,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);

    /// <summary>Returns the IDs of all transports owned by the given user (including soft-deleted, for booking history).</summary>
    Task<IReadOnlyList<Guid>> GetIdsByOwnerAsync(Guid ownerId, CancellationToken cancellationToken = default);

    /// <summary>All listings owned by the given user, newest first.</summary>
    Task<IReadOnlyList<Transport>> GetByOwnerAsync(Guid ownerId, CancellationToken cancellationToken = default);
}
