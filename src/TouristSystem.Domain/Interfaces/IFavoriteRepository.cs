using TouristSystem.Domain.Entities;

namespace TouristSystem.Domain.Interfaces;

/// <summary>
/// Defines specific contracts for Favorite persistence operations.
/// </summary>
public interface IFavoriteRepository : IGenericRepository<Favorite>
{
    Task<(IReadOnlyList<Favorite> Items, int TotalCount)> GetPagedAsync(
        Guid userId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<Favorite?> GetAsync(
        Guid userId,
        string favoriteType,
        Guid referenceId,
        CancellationToken cancellationToken = default);
}
