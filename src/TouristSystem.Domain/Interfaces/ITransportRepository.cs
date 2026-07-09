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
}
