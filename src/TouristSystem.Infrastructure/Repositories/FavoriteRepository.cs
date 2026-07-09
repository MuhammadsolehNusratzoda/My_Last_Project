using System;
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
/// Favorite-specific repository implementation using Entity Framework Core.
/// </summary>
public class FavoriteRepository : GenericRepository<Favorite>, IFavoriteRepository
{
    public FavoriteRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<(IReadOnlyList<Favorite> Items, int TotalCount)> GetPagedAsync(
        Guid userId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(f => f.UserId == userId).AsQueryable();

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(f => f.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<Favorite?> GetAsync(
        Guid userId,
        string favoriteType,
        Guid referenceId,
        CancellationToken cancellationToken = default)
    {
        if (!Enum.TryParse<TouristSystem.Domain.Enums.FavoriteType>(favoriteType, true, out var type))
        {
            return null;
        }

        return await DbSet
            .FirstOrDefaultAsync(f => f.UserId == userId && f.FavoriteType == type && f.ReferenceId == referenceId, cancellationToken);
    }
}
