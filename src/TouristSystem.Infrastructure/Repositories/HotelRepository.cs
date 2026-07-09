using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Interfaces;
using TouristSystem.Infrastructure.Data;

namespace TouristSystem.Infrastructure.Repositories;

/// <summary>
/// Hotel-specific repository implementation using Entity Framework Core.
/// </summary>
public class HotelRepository : GenericRepository<Hotel>, IHotelRepository
{
    public HotelRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Hotel?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .FirstOrDefaultAsync(h => h.Slug.ToLower() == slug.ToLower(), cancellationToken);
    }

    public async Task<(IReadOnlyList<Hotel> Items, int TotalCount)> GetPagedAsync(
        string? searchTerm,
        string? city,
        decimal? minPrice,
        decimal? maxPrice,
        int? stars,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var search = searchTerm.Trim().ToLower();
            query = query.Where(h => h.Name.ToLower().Contains(search) || h.Description.ToLower().Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(city))
        {
            var filterCity = city.Trim().ToLower();
            query = query.Where(h => h.City.ToLower() == filterCity);
        }

        if (minPrice.HasValue)
        {
            query = query.Where(h => h.PricePerNight >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(h => h.PricePerNight <= maxPrice.Value);
        }

        if (stars.HasValue)
        {
            query = query.Where(h => h.Stars == stars.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(h => h.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
