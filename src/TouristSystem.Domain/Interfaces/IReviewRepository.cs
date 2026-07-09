using TouristSystem.Domain.Entities;

namespace TouristSystem.Domain.Interfaces;

/// <summary>
/// Defines specific contracts for Review persistence operations.
/// </summary>
public interface IReviewRepository : IGenericRepository<Review>
{
    Task<(IReadOnlyList<Review> Items, int TotalCount)> GetPagedAsync(
        string? reviewType,
        Guid? referenceId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);
}
