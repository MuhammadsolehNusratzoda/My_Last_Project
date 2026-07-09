using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Interfaces;
using TouristSystem.Infrastructure.Data;

namespace TouristSystem.Infrastructure.Repositories;

/// <summary>
/// Place-specific repository implementation using Entity Framework Core.
/// </summary>
public class PlaceRepository : GenericRepository<Place>, IPlaceRepository
{
    public PlaceRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Place?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .FirstOrDefaultAsync(p => p.Slug.ToLower() == slug.ToLower(), cancellationToken);
    }

    public async Task<(IReadOnlyList<Place> Items, int TotalCount)> GetPagedAsync(
        string? searchTerm,
        string? city,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var search = searchTerm.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(search) || p.Description.ToLower().Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(city))
        {
            var filterCity = city.Trim().ToLower();
            query = query.Where(p => p.City.ToLower() == filterCity);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(p => p.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
