using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Interfaces;
using TouristSystem.Infrastructure.Data;

using System.Collections.Generic;
using System.Linq;

namespace TouristSystem.Infrastructure.Repositories;

/// <summary>
/// Guide-specific repository implementation using Entity Framework Core.
/// </summary>
public class GuideRepository : GenericRepository<Guide>, IGuideRepository
{
    public GuideRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Guide?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .FirstOrDefaultAsync(g => g.UserId == userId, cancellationToken);
    }

    public async Task<(IReadOnlyList<Guide> Items, int TotalCount)> GetPagedAsync(
        string? searchTerm,
        string? city,
        string? language,
        decimal? maxPricePerDay,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.Include(g => g.User).AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var search = searchTerm.Trim().ToLower();
            query = query.Where(g => g.User.FullName.ToLower().Contains(search) || g.Bio.ToLower().Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(city))
        {
            var filterCity = city.Trim().ToLower();
            query = query.Where(g => g.City.ToLower() == filterCity);
        }

        if (!string.IsNullOrWhiteSpace(language))
        {
            var lang = language.Trim().ToLower();
            query = query.Where(g => g.Languages.ToLower().Contains(lang));
        }

        if (maxPricePerDay.HasValue)
        {
            query = query.Where(g => g.PricePerDay <= maxPricePerDay.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(g => g.ExperienceYears)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<Guide?> GetWithUserByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(g => g.User)
            .FirstOrDefaultAsync(g => g.Id == id, cancellationToken);
    }
}
