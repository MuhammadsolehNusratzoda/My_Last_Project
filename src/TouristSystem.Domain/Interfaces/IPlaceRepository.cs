using System.Threading;
using System.Threading.Tasks;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Domain.Interfaces;

/// <summary>
/// Defines specific query contracts for tourist Places.
/// </summary>
public interface IPlaceRepository : IGenericRepository<Place>
{
    Task<Place?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    
    Task<(IReadOnlyList<Place> Items, int TotalCount)> GetPagedAsync(
        string? searchTerm,
        string? city,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);
}
