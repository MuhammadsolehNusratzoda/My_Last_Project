using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Interfaces;
using TouristSystem.Infrastructure.Data;

namespace TouristSystem.Infrastructure.Repositories;

/// <summary>
/// Restaurant-specific repository implementation using Entity Framework Core.
/// </summary>
public class RestaurantRepository : GenericRepository<Restaurant>, IRestaurantRepository
{
    public RestaurantRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Restaurant?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .FirstOrDefaultAsync(r => r.Slug.ToLower() == slug.ToLower(), cancellationToken);
    }

    public async Task<(IReadOnlyList<Restaurant> Items, int TotalCount)> GetPagedAsync(
        string? searchTerm,
        string? city,
        string? cuisineType,
        string? priceRange,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var search = searchTerm.Trim().ToLower();
            query = query.Where(r => r.Name.ToLower().Contains(search) || r.Description.ToLower().Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(city))
        {
            var filterCity = city.Trim().ToLower();
            query = query.Where(r => r.City.ToLower() == filterCity);
        }

        if (!string.IsNullOrWhiteSpace(cuisineType))
        {
            var cuisine = cuisineType.Trim().ToLower();
            query = query.Where(r => 
                r.CuisineType.ToLower().Contains(cuisine) ||
                r.Name.ToLower().Contains(cuisine) ||
                r.Description.ToLower().Contains(cuisine));
        }

        if (!string.IsNullOrWhiteSpace(priceRange) && System.Enum.TryParse<TouristSystem.Domain.Enums.PriceRange>(priceRange, true, out var price))
        {
            query = query.Where(r => r.PriceRange == price);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(r => r.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
