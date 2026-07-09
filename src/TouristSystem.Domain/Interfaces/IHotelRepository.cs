using System.Threading;
using System.Threading.Tasks;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Domain.Interfaces;

/// <summary>
/// Defines specific query contracts for Hotels.
/// </summary>
public interface IHotelRepository : IGenericRepository<Hotel>
{
    Task<Hotel?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<Hotel> Items, int TotalCount)> GetPagedAsync(
        string? searchTerm,
        string? city,
        decimal? minPrice,
        decimal? maxPrice,
        int? stars,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);
}
