using System.Threading;
using System.Threading.Tasks;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Domain.Interfaces;

/// <summary>
/// Defines specific query contracts for Restaurants.
/// </summary>
public interface IRestaurantRepository : IGenericRepository<Restaurant>
{
    Task<Restaurant?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<Restaurant> Items, int TotalCount)> GetPagedAsync(
        string? searchTerm,
        string? city,
        string? cuisineType,
        string? priceRange,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);

    /// <summary>All listings owned by the given user, newest first.</summary>
    Task<IReadOnlyList<Restaurant>> GetByOwnerAsync(Guid ownerId, CancellationToken cancellationToken = default);
}
