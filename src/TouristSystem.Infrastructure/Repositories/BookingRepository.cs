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
/// Booking-specific repository implementation using Entity Framework Core.
/// </summary>
public class BookingRepository : GenericRepository<Booking>, IBookingRepository
{
    public BookingRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<(IReadOnlyList<Booking> Items, int TotalCount)> GetPagedAsync(
        Guid? userId,
        string? bookingType,
        string? bookingStatus,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.Include(b => b.User).AsQueryable();

        if (userId.HasValue)
        {
            query = query.Where(b => b.UserId == userId.Value);
        }

        if (!string.IsNullOrWhiteSpace(bookingType) && Enum.TryParse<TouristSystem.Domain.Enums.BookingType>(bookingType, true, out var type))
        {
            query = query.Where(b => b.BookingType == type);
        }

        if (!string.IsNullOrWhiteSpace(bookingStatus) && Enum.TryParse<TouristSystem.Domain.Enums.BookingStatus>(bookingStatus, true, out var status))
        {
            query = query.Where(b => b.Status == status);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<Booking?> GetWithUserByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
    }
}
