using System;
using System.Threading;
using System.Threading.Tasks;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Domain.Interfaces;

/// <summary>
/// Defines specific query contracts for tour Guides.
/// </summary>
public interface IGuideRepository : IGenericRepository<Guide>
{
    Task<Guide?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<Guide> Items, int TotalCount)> GetPagedAsync(
        string? searchTerm,
        string? city,
        string? language,
        decimal? maxPricePerDay,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<Guide?> GetWithUserByIdAsync(Guid id, CancellationToken cancellationToken = default);
}
