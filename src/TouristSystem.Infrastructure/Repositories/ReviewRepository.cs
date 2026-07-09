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
/// Review-specific repository implementation using Entity Framework Core.
/// </summary>
public class ReviewRepository : GenericRepository<Review>, IReviewRepository
{
    public ReviewRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<(IReadOnlyList<Review> Items, int TotalCount)> GetPagedAsync(
        string? reviewType,
        Guid? referenceId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.Include(r => r.User).AsQueryable();

        if (!string.IsNullOrWhiteSpace(reviewType) && Enum.TryParse<TouristSystem.Domain.Enums.ReviewType>(reviewType, true, out var type))
        {
            query = query.Where(r => r.ReviewType == type);
        }

        if (referenceId.HasValue)
        {
            query = query.Where(r => r.ReferenceId == referenceId.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
